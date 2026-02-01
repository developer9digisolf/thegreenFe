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
    <div className="min-h-screen flex items-center justify-center bg-emerald-500">
      <div className="text-center text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto mb-3" />
        <p>Loading...</p>
      </div>
    </div>
  )
}
