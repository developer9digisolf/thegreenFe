'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthHelper } from '@afx/services/auth.service'
import { getRoleName } from '@afx/interfaces/auth.iface'

// Redirect to main login or dashboard based on auth status
export default function TherapistLoginRedirect() {
  const router = useRouter()

  useEffect(() => {
    const user = AuthHelper.getUser()
    const therapist = AuthHelper.getTherapist()
    
    if (user && therapist) {
      const role = getRoleName(user.role).toLowerCase()
      if (role === 'therapist') {
        router.replace('/therapist/dashboard')
        return
      }
    }
    
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-emerald-600">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mx-auto mb-3" />
        <p className="font-medium">Redirecting...</p>
      </div>
    </div>
  )
}
