'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AuthHelper } from '@afx/services/auth.service'
import { TherapistGetStatusService, TherapistGetProfileService, ITherapistProfileResponse } from '@afx/services/therapist-auth.service'
import { ICheckInStatus } from '@afx/interfaces/therapist-auth.iface'

export default function TherapistDashboardPage() {
  const [therapist, setTherapist] = useState<ITherapistProfileResponse | null>(null)
  const [status, setStatus] = useState<ICheckInStatus | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  
  const statusRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch profile from API
  const fetchProfile = useCallback(async () => {
    try {
      const result = await TherapistGetProfileService()
      if (result.success && result.data) {
        setTherapist(result.data)
      } else {
        // Fallback to localStorage if API fails
        const stored = AuthHelper.getTherapist()
        if (stored) {
          setTherapist({
            id: stored.id,
            code: stored.code,
            name: stored.name,
            phone: stored.phone,
            rating: stored.rating,
            reviewCount: stored.reviewCount,
            totalSessions: stored.totalSessions
          })
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      // Fallback to localStorage
      const stored = AuthHelper.getTherapist()
      if (stored) {
        setTherapist({
          id: stored.id,
          code: stored.code,
          name: stored.name,
          phone: stored.phone,
          rating: stored.rating,
          reviewCount: stored.reviewCount,
          totalSessions: stored.totalSessions
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch check-in status
  const fetchStatus = useCallback(async () => {
    try {
      const result = await TherapistGetStatusService()
      if (result.success && result.data) {
        setStatus(result.data)
      }
    } catch (err) {
      console.error('Error fetching status:', err)
    }
  }, [])

  // Fetch status on mount and periodically
  useEffect(() => {
    fetchStatus()
    statusRef.current = setInterval(fetchStatus, 10000)
    return () => {
      if (statusRef.current) clearInterval(statusRef.current)
    }
  }, [fetchStatus])

  if (loading || !therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  const isCheckedIn = status?.isCheckedIn ?? false

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-4 pt-6 pb-8 safe-area-top">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            🌿
          </div>
          <div className="text-white">
            <p className="text-sm opacity-80">Selamat datang,</p>
            <h1 className="text-xl font-bold">{therapist.name}</h1>
            <p className="text-xs opacity-70">{therapist.code}</p>
          </div>
        </div>

        {/* Time Display */}
        <div className="text-center text-white mt-4">
          <p className="text-4xl font-bold tabular-nums">
            {currentTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {currentTime.toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-4">
        {/* Status Card */}
        <div className={`rounded-2xl p-4 shadow-sm ${
          isCheckedIn 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-white border border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isCheckedIn ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              {isCheckedIn ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${isCheckedIn ? 'text-emerald-700' : 'text-slate-700'}`}>
                {isCheckedIn ? 'Anda Sudah Check-in' : 'Belum Check-in'}
              </p>
              {isCheckedIn && status?.checkInTime ? (
                <p className="text-sm text-emerald-600">
                  Masuk: {status.checkInTime}
                  {status.queuePosition && ` • Antrian #${status.queuePosition}`}
                </p>
              ) : (
                <p className="text-sm text-slate-500">
                  Silakan scan QR di menu Check-in
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <span className="text-xs text-slate-500">Rating</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {therapist.rating > 0 ? therapist.rating.toFixed(1) : '-'}
            </p>
            <p className="text-xs text-slate-400">
              {therapist.reviewCount > 0 ? `${therapist.reviewCount} review` : 'belum ada review'}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-xs text-slate-500">Total Sesi</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{therapist.totalSessions}</p>
            <p className="text-xs text-slate-400">sepanjang waktu</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <span className="text-xs text-slate-500">Sesi Hari Ini</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{status?.sessionCount ?? 0}</p>
            <p className="text-xs text-slate-400">sesi selesai</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs text-slate-500">Antrian</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">
              {isCheckedIn && status?.queuePosition ? `#${status.queuePosition}` : '-'}
            </p>
            <p className="text-xs text-slate-400">{isCheckedIn ? 'posisi saat ini' : 'belum check-in'}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 mb-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Menu Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="/therapist/checkin"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Check-in</p>
                <p className="text-xs text-slate-500">Scan QR Code</p>
              </div>
            </a>

            <a 
              href="/therapist/attendance"
              className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-slate-800">Kehadiran</p>
                <p className="text-xs text-slate-500">Riwayat absensi</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
