// ============================================
// THERAPIST AUTH INTERFACES
// For QR-based check-in system
// ============================================

// QR Token response
export interface IQRTokenResponse {
    token: string
    expiresAt: number // Unix timestamp in ms
    refreshIn: number // ms until next refresh
}

// Check-in status
export interface ICheckInStatus {
    isCheckedIn: boolean
    checkInTime?: string
    queuePosition?: number
    sessionCount: number
}

// Verify QR request (from kiosk)
export interface IVerifyQRRequest {
    token: string
}

// Verify check-in response (returned to kiosk)
export interface IVerifyCheckInResponse {
    therapistId: number
    code: string
    name: string
    photo?: string
    checkInTime: string
}
