'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { IUser, IAuthState, getRoleName } from '@afx/interfaces/auth.iface'
import { AuthHelper } from '@afx/services/auth.service'

interface AuthContextType extends IAuthState {
    logout: () => void
    refreshUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/register', '/auth/forgot-password', '/privacy-policy', '/terms-of-service']

// Kiosk routes (no auth required)
const kioskRoutes = ['/kiosk']

// Therapist routes (requires therapist role)
const therapistRoutes = ['/therapist']

const initialAuthState: IAuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [authState, setAuthState] = useState<IAuthState>(initialAuthState)
    const [mounted, setMounted] = useState(false)

    const checkAuth = useCallback(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            return
        }

        const token = AuthHelper.getToken()
        const user = AuthHelper.getUser()

        if (process.env.NODE_ENV === 'development') {
            console.log('CheckAuth - Token:', !!token, 'User:', !!user)
        }

        setAuthState({
            isAuthenticated: !!(token && user),
            user: user || null,
            token: token || null,
            loading: false
        })
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

    // Memoize context value to prevent unnecessary re-renders
    const contextValue = useMemo<AuthContextType>(
        () => ({
            isAuthenticated: authState.isAuthenticated,
            user: authState.user,
            token: authState.token,
            loading: authState.loading,
            logout,
            refreshUser
        }),
        [authState.isAuthenticated, authState.user, authState.token, authState.loading, logout, refreshUser]
    )

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
        const isTherapistRoute = therapistRoutes.some(route => pathname.startsWith(route))
        const isKioskRoute = kioskRoutes.some(route => pathname.startsWith(route))
        const isRootRoute = pathname === '/'
        const isAdminRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/pos')

        // Kiosk routes don't need auth
        if (isKioskRoute) return

        // Not authenticated
        if (!authState.isAuthenticated) {
            // Check if auth is disabled via env
            if (process.env.NEXT_PUBLIC_DISABLE_AUTH === 'true') {
                console.warn('Auth is disabled via NEXT_PUBLIC_DISABLE_AUTH');
                return;
            }

            // Allow public routes
            if (isPublicRoute || isRootRoute) return;

            // Redirect to login for protected routes
            if (process.env.NODE_ENV === 'development') {
                console.log('Not authenticated, redirecting to login...');
            }
            router.push('/auth/login');
            return;
        }

        // Authenticated - check role-based access
        if (authState.user) {
            const role = getRoleName(authState.user.role).toLowerCase()

            // Therapist accessing admin routes
            if (role === 'therapist' && isAdminRoute) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Therapist accessing admin route, redirecting to therapist dashboard...')
                }
                router.push('/therapist/dashboard')
                return
            }

            // Non-therapist accessing therapist routes
            if (role !== 'therapist' && isTherapistRoute) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Non-therapist accessing therapist route, redirecting to dashboard...')
                }
                router.push('/dashboard')
                return
            }

            // Member should not access admin or therapist routes
            if (role === 'member' && (isAdminRoute || isTherapistRoute)) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Member accessing protected route, redirecting to login...')
                }
                AuthHelper.clearAuth()
                router.push('/auth/login')
                return
            }
        }
    }, [authState.isAuthenticated, authState.loading, authState.user, mounted, pathname, router])

    // Determine if current route requires auth
    const isProtectedRoute = useMemo(
        () => !publicRoutes.some(route => pathname.startsWith(route))
            && !kioskRoutes.some(route => pathname.startsWith(route))
            && pathname !== '/',
        [pathname]
    )

    // Show loading spinner while checking auth OR when not authenticated on protected route (prevents flash)
    const shouldShowLoading = !mounted || authState.loading || (isProtectedRoute && !authState.isAuthenticated)

    if (shouldShowLoading) {
        return (
            <AuthContext.Provider value={contextValue}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: '#ffffff'
                }}>
                    <div style={{ textAlign: 'center', color: '#059669' }}>
                        <div style={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            border: '3px solid rgba(5, 150, 105, 0.1)',
                            borderTopColor: '#059669',
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
            </AuthContext.Provider>
        )
    }

    return (
        <AuthContext.Provider value={contextValue}>
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

/**
 * Hook to get user data without causing re-renders on auth state changes
 * Use this when you only need user information, not authentication status
 */
export function useUser() {
    const { user, refreshUser } = useAuth()
    return { user, refreshUser }
}

/**
 * Hook to check if user is authenticated
 * Use this for simple auth checks
 */
export function useIsAuthenticated() {
    const { isAuthenticated, loading } = useAuth()
    return { isAuthenticated, loading }
}
