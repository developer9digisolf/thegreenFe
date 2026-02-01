'use client'

import { useEffect, useState, useCallback } from 'react'
import { AuthHelper } from '@afx/services/auth.service'
import { ITherapistProfile } from '@afx/interfaces/auth.iface'
import { 
  TherapistGetAttendanceService, 
  IAttendanceSummary,
  ITherapistAttendance 
} from '@afx/services/therapist-auth.service'

export default function TherapistAttendancePage() {
  const [therapist, setTherapist] = useState<ITherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [attendanceData, setAttendanceData] = useState<IAttendanceSummary | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    const therapistData = AuthHelper.getTherapist()
    setTherapist(therapistData)
  }, [])

  // Fetch attendance when month changes
  const fetchAttendance = useCallback(async () => {
    setLoading(true)
    try {
      const [year, month] = selectedMonth.split('-').map(Number)
      const result = await TherapistGetAttendanceService(year, month)
      
      if (result.success && result.data) {
        setAttendanceData(result.data)
      } else {
        setAttendanceData(null)
      }
    } catch (err) {
      console.error('Error fetching attendance:', err)
      setAttendanceData(null)
    } finally {
      setLoading(false)
    }
  }, [selectedMonth])

  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  if (!therapist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-lg font-bold text-slate-800 text-center">Riwayat Kehadiran</h1>
      </div>

      <div className="px-4 py-6">
        {/* Month Selector */}
        <div className="mb-4">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-emerald-500 border-t-transparent" />
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p className="text-2xl font-bold text-emerald-600">{attendanceData?.totalDays ?? 0}</p>
                <p className="text-xs text-slate-500">Hari Kerja</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p className="text-2xl font-bold text-blue-600">{attendanceData?.totalSessions ?? 0}</p>
                <p className="text-xs text-slate-500">Total Sesi</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
                <p className="text-2xl font-bold text-purple-600">{attendanceData?.averageClockIn ?? '-'}</p>
                <p className="text-xs text-slate-500">Rata-rata Masuk</p>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700">Detail Kehadiran</h3>
              
              {!attendanceData?.attendances?.length ? (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
                  <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-500">Belum ada data kehadiran bulan ini</p>
                  <p className="text-slate-400 text-sm mt-1">Check-in melalui QR code untuk mencatat kehadiran</p>
                </div>
              ) : (
                attendanceData.attendances.map((record) => (
                  <AttendanceCard key={record.id} record={record} />
                ))
              )}
            </div>
          </>
        )}

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-blue-800">Catatan</p>
              <p className="text-xs text-blue-600 mt-1">
                Data kehadiran direkam otomatis saat Anda melakukan check-in dan check-out melalui QR code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Attendance Card Component
function AttendanceCard({ record }: { record: ITherapistAttendance }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            record.clockOut ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {record.clockOut ? (
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div>
            <p className="font-semibold text-slate-800">{record.dateDisplay}</p>
            <p className="text-xs text-slate-500">
              Durasi: {record.duration || (record.clockOut ? '-' : 'Masih bekerja')}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            record.sessionCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          }`}>
            {record.sessionCount} sesi
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600">Masuk: <span className="font-medium">{record.clockIn}</span></span>
        </div>
        {record.clockOut && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-600">Keluar: <span className="font-medium">{record.clockOut}</span></span>
          </div>
        )}
        {!record.clockOut && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-amber-600 font-medium">Masih bekerja</span>
          </div>
        )}
      </div>
    </div>
  )
}
