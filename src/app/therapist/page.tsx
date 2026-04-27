'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Auto redirect to dashboard - auth check is in layout
export default function TherapistIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/therapist/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-emerald-600">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mx-auto mb-3" />
        <p className="font-medium">Loading...</p>
      </div>
    </div>
  )
}
