import axios from 'axios'
import { AuthHelper } from '@afx/services/auth.service'
import { rest } from '@afx/utils/config.rest'

// ============================================
// THERAPIST AUTH SERVICE
// Uses main auth token (from AuthHelper)
// ============================================

// Base URL
const getBaseUrl = () => process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5100/api/"

// Generic request function for therapist portal
async function therapistRequest<T = any>(
    url: string,
    method: 'GET' | 'POST' = 'GET',
    data?: any
): Promise<{ success: boolean; message: string; data?: T }> {
    const token = AuthHelper.getToken() // Use main auth token
    const baseUrl = getBaseUrl()

    try {
        const response = await axios.request({
            url: `${baseUrl}${url}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            ...(method === 'GET' ? { params: data } : { data })
        })

        const payload = response.data
        
        if (payload && payload.meta) {
            return {
                success: payload.meta.success,
                message: payload.meta.message,
                data: payload.data
            }
        }
        
        return {
            success: true,
            message: 'Success',
            data: payload
        }
    } catch (error: any) {
        const errPayload = error?.response?.data
        
        return {
            success: false,
            message: errPayload?.meta?.message || error.message || 'Terjadi kesalahan'
        }
    }
}

// ============================================
// THERAPIST API SERVICES
// ============================================

export interface IQRTokenResponse {
    token: string
    expiresAt: number
    refreshIn: number
}

export interface ICheckInStatus {
    isCheckedIn: boolean
    checkInTime?: string
    queuePosition?: number
    sessionCount: number
}

export interface IVerifyCheckInResponse {
    therapistId: number
    code: string
    name: string
    photo?: string
    checkInTime: string
}

export async function TherapistGetQRTokenService() {
    return therapistRequest<IQRTokenResponse>(rest.therapistAuthQRToken, 'GET')
}

export async function TherapistGetStatusService() {
    return therapistRequest<ICheckInStatus>(rest.therapistAuthStatus, 'GET')
}

export interface ITherapistProfileResponse {
    id: number
    code: string
    name: string
    phone?: string
    photo?: string
    rating: number
    reviewCount: number
    totalSessions: number
}

export async function TherapistGetProfileService() {
    return therapistRequest<ITherapistProfileResponse>(rest.therapistAuthProfile, 'GET')
}

export async function TherapistCheckOutService() {
    return therapistRequest(rest.therapistAuthCheckOut, 'POST')
}

// ============================================
// ATTENDANCE SERVICE
// ============================================

export interface ITherapistAttendance {
    id: number
    date: string
    dateDisplay: string
    clockIn: string
    clockOut?: string
    sessionCount: number
    duration?: string
    notes?: string
}

export interface IAttendanceSummary {
    totalDays: number
    totalSessions: number
    averageClockIn: string
    attendances: ITherapistAttendance[]
}

export async function TherapistGetAttendanceService(year?: number, month?: number) {
    const now = new Date()
    const params = {
        year: year || now.getFullYear(),
        month: month || now.getMonth() + 1
    }
    return therapistRequest<IAttendanceSummary>(rest.therapistAuthAttendance, 'GET', params)
}

// ============================================
// KIOSK SERVICE (Verify QR)
// Uses API Key instead of JWT
// ============================================

export async function KioskVerifyQRService(token: string) {
    const baseUrl = getBaseUrl()
    const kioskApiKey = process.env.NEXT_PUBLIC_KIOSK_API_KEY || 'kiosk-secret-key-change-in-production'

    try {
        const response = await axios.post(`${baseUrl}${rest.therapistAuthVerifyQR}`, 
            { token },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Kiosk-Key': kioskApiKey
                }
            }
        )

        const payload = response.data
        
        if (payload && payload.meta) {
            return {
                success: payload.meta.success,
                message: payload.meta.message,
                data: payload.data as IVerifyCheckInResponse
            }
        }
        
        return {
            success: true,
            message: 'Success',
            data: payload as IVerifyCheckInResponse
        }
    } catch (error: any) {
        const errPayload = error?.response?.data
        
        return {
            success: false,
            message: errPayload?.meta?.message || error.message || 'Gagal verifikasi QR'
        }
    }
}

// Legacy exports for backward compatibility
export const TherapistAuthHelper = {
    isAuthenticated: () => {
        const user = AuthHelper.getUser()
        const therapist = AuthHelper.getTherapist()
        return !!user && !!therapist
    },
    getTherapist: () => AuthHelper.getTherapist(),
    clearAuth: () => AuthHelper.clearAuth()
}
