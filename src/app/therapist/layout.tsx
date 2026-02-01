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
      <div className="min-h-screen min-h-dvh flex items-center justify-center bg-emerald-500">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mx-auto mb-3" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    {
      key: 'home',
      path: '/therapist/dashboard',
      label: 'Beranda',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      key: 'checkin',
      path: '/therapist/checkin',
      label: 'Check-in',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      )
    },
    {
      key: 'attendance',
      path: '/therapist/attendance',
      label: 'Kehadiran',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      key: 'profile',
      path: '/therapist/profile',
      label: 'Profil',
      icon: (active: boolean) => (
        <svg className={`w-6 h-6 ${active ? 'text-emerald-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ]

  const isActive = (path: string) => pathname === path

  return (
    <div className="min-h-screen min-h-dvh bg-slate-50 flex flex-col">
      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-area-bottom z-50">
        <div className="flex items-center justify-around h-16">
          {menuItems.map((item) => (
            <button
              key={item.key}
              onClick={() => router.push(item.path)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive(item.path) ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              {item.icon(isActive(item.path))}
              <span className={`text-xs mt-1 ${isActive(item.path) ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      <style jsx global>{`
        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        
        .safe-area-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
      `}</style>
    </div>
  )
}
