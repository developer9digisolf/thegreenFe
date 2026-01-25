'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { IUser, IAuthState } from '@afx/interfaces/auth.iface'
import { AuthHelper } from '@afx/services/auth.service'

interface AuthContextType extends IAuthState {
    logout: () => void
    refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password']

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authState, setAuthState] = useState<IAuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
        loading: true
    })
    const [mounted, setMounted] = useState(false)

    const checkAuth = useCallback(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return
        }

        const token = AuthHelper.getToken()
        const user = AuthHelper.getUser()

        console.log('CheckAuth - Token:', !!token, 'User:', !!user) // Debug

        if (token && user) {
            setAuthState({
                isAuthenticated: true,
                user: user,
                token: token,
                loading: false
            })
        } else {
            setAuthState({
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false
            })
        }
    }, [])

    const logout = useCallback(() => {
        AuthHelper.clearAuth()
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false
        })
        router.push('/auth/login')
    }, [router])

    const refreshUser = useCallback(() => {
        checkAuth()
    }, [checkAuth])

    // Mark as mounted (client-side only)
    useEffect(() => {
        setMounted(true)
    }, [])

    // Initial auth check - only after mounted
    useEffect(() => {
        if (mounted) {
            checkAuth()
        }
    }, [mounted, checkAuth])

    // Redirect logic - only after auth check is complete
    useEffect(() => {
        if (!mounted || authState.loading) return

        const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
        const isRootRoute = pathname === '/'

        console.log('Redirect check - isAuthenticated:', authState.isAuthenticated, 'pathname:', pathname, 'isPublicRoute:', isPublicRoute) // Debug

        if (!authState.isAuthenticated && !isPublicRoute && !isRootRoute) {
            // Not authenticated and trying to access protected route
            console.log('Redirecting to login...')
            router.push('/auth/login')
        }
        // Don't auto-redirect from login to dashboard here - let login page handle it
    }, [authState.isAuthenticated, authState.loading, mounted, pathname, router])

    // Show loading state only on initial load
    if (!mounted || authState.loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%)'
            }}>
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }} />
                    <div style={{ fontSize: 16 }}>Loading...</div>
                </div>
                <style jsx global>{`
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ ...authState, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
