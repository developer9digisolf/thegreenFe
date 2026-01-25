'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthHelper } from '@afx/services/auth.service'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if authenticated and redirect accordingly
    const isAuthenticated = AuthHelper.isAuthenticated()
    
    if (isAuthenticated) {
      router.replace('/dashboard')
    } else {
      router.replace('/auth/login')
    }
  }, [router])

  // Show loading while redirecting
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
        <div style={{ fontSize: 16 }}>Redirecting...</div>
      </div>
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
