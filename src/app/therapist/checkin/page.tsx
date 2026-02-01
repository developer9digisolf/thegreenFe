'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import QRCode from 'qrcode'
import { AuthHelper } from '@afx/services/auth.service'
import { ITherapistProfile } from '@afx/interfaces/auth.iface'
import { 
  TherapistGetQRTokenService, 
  TherapistGetStatusService,
  TherapistCheckOutService 
} from '@afx/services/therapist-auth.service'
import { ICheckInStatus } from '@afx/interfaces/therapist-auth.iface'

export default function TherapistCheckinPage() {
  const [therapist, setTherapist] = useState<ITherapistProfile | null>(null)
  const [status, setStatus] = useState<ICheckInStatus | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(8)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false)
  
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  const refreshRef = useRef<NodeJS.Timeout | null>(null)
  const statusRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const therapistData = AuthHelper.getTherapist()
    setTherapist(therapistData)
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

  // Generate QR code
  const generateQR = useCallback(async () => {
    if (status?.isCheckedIn) return
    
    setIsRefreshing(true)
    
    try {
      const result = await TherapistGetQRTokenService()
      
      if (!result.success || !result.data) {
        console.error('QR Error:', result.message)
        setIsRefreshing(false)
        return
      }

      const qrUrl = await QRCode.toDataURL(result.data.token, {
        width: 280,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
      
      setQrDataUrl(qrUrl)
      setCountdown(8)
      
    } catch (error) {
      console.error('QR Generation error:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [status?.isCheckedIn])

  // QR refresh every 5 seconds (only if not checked in)
  useEffect(() => {
    if (status?.isCheckedIn) {
      if (refreshRef.current) clearInterval(refreshRef.current)
      return
    }
    
    generateQR()
    refreshRef.current = setInterval(generateQR, 8000)
    
    return () => {
      if (refreshRef.current) clearInterval(refreshRef.current)
    }
  }, [generateQR, status?.isCheckedIn])

  // Countdown timer
  useEffect(() => {
    if (status?.isCheckedIn) {
      if (countdownRef.current) clearInterval(countdownRef.current)
      return
    }
    
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 8 : prev - 1))
    }, 1000)

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [status?.isCheckedIn])

  // Handle check-out
  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      const result = await TherapistCheckOutService()
      if (result.success) {
        setStatus(prev => prev ? { ...prev, isCheckedIn: false, checkInTime: undefined, queuePosition: undefined } : null)
        setShowCheckoutConfirm(false)
        await fetchStatus()
      }
    } catch (err) {
      console.error('Check-out error:', err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!therapist) {
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
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 text-center">Check-in / Check-out</h1>
      </div>

      <div className="px-4 py-6">
        {/* Status Card */}
        <div className={`rounded-2xl p-4 mb-6 ${
          isCheckedIn 
            ? 'bg-emerald-50 border border-emerald-200' 
            : 'bg-amber-50 border border-amber-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <div className="flex-1">
              <p className={`font-semibold ${isCheckedIn ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isCheckedIn ? 'Status: Sudah Check-in' : 'Status: Belum Check-in'}
              </p>
              {isCheckedIn && status?.checkInTime && (
                <p className="text-sm text-emerald-600">
                  Masuk: {status.checkInTime} • Antrian #{status.queuePosition || '-'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* QR Section - Only show if not checked in */}
        {!isCheckedIn && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="text-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">QR Code Check-in</h2>
              <p className="text-sm text-slate-500 mt-1">
                Scan QR ini di kiosk untuk check-in
              </p>
            </div>
            
            {/* QR Display */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-pulse" />
                
                <div className="relative bg-white rounded-3xl p-4 shadow-xl border-2 border-emerald-100">
                  {qrDataUrl ? (
                    <div className={`transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code untuk check-in" 
                        className="w-[260px] h-[260px] rounded-2xl"
                      />
                    </div>
                  ) : (
                    <div className="w-[260px] h-[260px] flex items-center justify-center bg-slate-100 rounded-2xl">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
                    </div>
                  )}
                  
                  {/* Corner decorations */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-emerald-500 rounded-tl-xl" />
                  <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-emerald-500 rounded-tr-xl" />
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-emerald-500 rounded-bl-xl" />
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-emerald-500 rounded-br-xl" />
                </div>
              </div>

              {/* Countdown */}
              <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full">
                <svg className="w-4 h-4 text-emerald-500 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="40" strokeDashoffset="10" />
                </svg>
                <span className="text-sm text-slate-600">
                  Refresh dalam <span className="font-bold text-emerald-600 tabular-nums">{countdown}</span> detik
                </span>
              </div>

              {/* Instructions */}
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  Arahkan QR ini ke kamera kiosk di lobby
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  QR valid 10 detik untuk keamanan
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checked-in View */}
        {isCheckedIn && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Anda Sudah Check-in!</h3>
              <p className="text-slate-500">
                Waktu masuk: <span className="font-semibold text-slate-700">{status?.checkInTime}</span>
              </p>
              <p className="text-slate-500 mt-1">
                Posisi antrian: <span className="font-semibold text-emerald-600">#{status?.queuePosition || '-'}</span>
              </p>
            </div>

            {/* Today Stats */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-3">Statistik Hari Ini</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-emerald-600">{status?.sessionCount || 0}</p>
                  <p className="text-xs text-slate-500">Sesi Selesai</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-slate-700">-</p>
                  <p className="text-xs text-slate-500">Durasi Kerja</p>
                </div>
                <div className="text-center p-3 bg-slate-50 rounded-xl">
                  <p className="text-2xl font-bold text-amber-500">#{status?.queuePosition || '-'}</p>
                  <p className="text-xs text-slate-500">Antrian</p>
                </div>
              </div>
            </div>

            {/* Check-out Button */}
            <button
              onClick={() => setShowCheckoutConfirm(true)}
              className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Check-out
            </button>
          </div>
        )}
      </div>

      {/* Check-out Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Konfirmasi Check-out</h3>
              <p className="text-sm text-slate-500 mb-6">
                Apakah Anda yakin ingin check-out sekarang? Anda perlu scan QR lagi untuk check-in kembali.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckoutConfirm(false)}
                  className="flex-1 py-3 px-4 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  className="flex-1 py-3 px-4 font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCheckingOut && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                  Ya, Check-out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
