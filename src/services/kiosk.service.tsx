import { rest } from '@afx/utils/config.rest'
import axios from 'axios'

// Kiosk API uses a special API key instead of JWT token
const KIOSK_API_KEY = process.env.NEXT_PUBLIC_KIOSK_API_KEY || 'kiosk-dev-key'

export interface ITherapistCheckInInfo {
  id: number
  code: string
  name: string
  photo?: string
  checkInTime: string
}

export interface IVerifyQRResponse {
  success: boolean
  message: string
  data?: ITherapistCheckInInfo
}

export async function KioskVerifyQRService(qrToken: string): Promise<IVerifyQRResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5100/api/"
  
  try {
    const response = await axios.post(
      `${baseUrl}${rest.therapistAuthVerifyQR}`,
      { token: qrToken },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Kiosk-Key': KIOSK_API_KEY
        }
      }
    )
    
    const payload = response.data
    
    if (payload && payload.meta) {
      return {
        success: payload.meta.success,
        message: payload.meta.message,
        data: payload.data
      }
    }
    
    return payload
    
  } catch (error: any) {
    const errPayload = error?.response?.data
    
    if (errPayload && errPayload.meta) {
      return {
        success: false,
        message: errPayload.meta.message || 'Verifikasi QR gagal'
      }
    }
    
    return {
      success: false,
      message: error.message || 'Terjadi kesalahan saat verifikasi'
    }
  }
}
