'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AuthHelper } from '@afx/services/auth.service'
import { ITherapistProfile, IUser, getRoleName } from '@afx/interfaces/auth.iface'

interface TherapistLayoutProps {
  children: React.ReactNode
}

export default function TherapistLayout({ children }: TherapistLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [therapist, setTherapist] = useState<ITherapistProfile | null>(null)
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = AuthHelper.getUser()
    const therapistData = AuthHelper.getTherapist()
    
    if (!userData || !therapistData) {
      router.replace('/auth/login')
      return
    }
    
    const role = getRoleName(userData.role).toLowerCase()
    if (role !== 'therapist') {
      router.replace('/auth/login')
      return
    }
    
    setUser(userData)
    setTherapist(therapistData)
    setLoading(false)
  }, [router])

  if (loading || !therapist) {
    return (
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-white">
        <div className="text-center text-emerald-600">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent mx-auto mb-3" />
          <p className="font-medium">Loading...</p>
        </div>
      </div>
    )
  }

}
