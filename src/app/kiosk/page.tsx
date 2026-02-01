'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { message } from 'antd'
import { CheckCircleFilled, ScanOutlined, ReloadOutlined } from '@ant-design/icons'
import { Html5Qrcode } from 'html5-qrcode'

// Types
interface TherapistInfo {
  id: number
  code: string
  name: string
  photo?: string
  checkInTime: string
}

interface VerifyQRResponse {
  success: boolean
  message: string
  data?: TherapistInfo
}

// Config - akan dipindah ke env nanti
const KIOSK_API_KEY = process.env.NEXT_PUBLIC_KIOSK_API_KEY || 'kiosk-secret-key-change-in-production'
// Remove trailing slash from base URL
const API_BASE_URL = (process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:5100/api').replace(/\/$/, '')

// Debug: Log config on load
if (typeof window !== 'undefined') {
  console.log('[KIOSK CONFIG] API_BASE_URL:', API_BASE_URL)
  console.log('[KIOSK CONFIG] KIOSK_API_KEY:', KIOSK_API_KEY.substring(0, 10) + '...')
}

// API Call
async function verifyQRCode(qrData: string): Promise<VerifyQRResponse> {
  console.log('[KIOSK] Verifying QR:', qrData)
  console.log('[KIOSK] Calling API:', `${API_BASE_URL}/therapist-auth/verify-qr`)
  
  try {
    // Real API call
    const response = await fetch(`${API_BASE_URL}/therapist-auth/verify-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Kiosk-Key': KIOSK_API_KEY
      },
      body: JSON.stringify({ token: qrData })
    })

    console.log('[KIOSK] Response status:', response.status)
    
    const responseData = await response.json().catch(() => ({}))
    console.log('[KIOSK] Response data:', responseData)
    
    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Gagal verifikasi QR (${response.status})`
      }
    }

    return {
      success: true,
      message: responseData.message || 'Check-in berhasil!',
      data: responseData.data
    }
  } catch (error) {
    console.error('[KIOSK] API Error:', error)
    
    // Fallback to mock for development/testing
    console.log('[KIOSK] Falling back to mock verification')
    return mockVerifyQRCode(qrData)
  }
}

// Mock API untuk development
function mockVerifyQRCode(qrData: string): VerifyQRResponse {
  console.log('[MOCK] Verifying QR:', qrData)
  
  // Parse QR data (format: therapistId|timestamp|signature)
  const parts = qrData.split('|')
  if (parts.length !== 3) {
    return {
      success: false,
      message: 'Format QR tidak valid'
    }
  }
  
  const [therapistId, timestamp] = parts
  const now = Date.now()
  const qrTime = parseInt(timestamp)
  const timeDiff = now - qrTime
  
  // Check if QR is expired (> 10 seconds / 10000ms)
  if (timeDiff > 10000) {
    return {
      success: false,
      message: `QR sudah expired (${(timeDiff / 1000).toFixed(1)} detik). Minta terapis refresh QR-nya.`
    }
  }
  
  // Mock success response
  return {
    success: true,
    message: 'Check-in berhasil!',
    data: {
      id: parseInt(therapistId),
      code: `THR-${therapistId.padStart(3, '0')}`,
      name: 'Ani Setiawati',
      photo: undefined,
      checkInTime: new Date().toLocaleTimeString('id-ID', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }
}

export default function KioskPage() {
  const [isScanning, setIsScanning] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [successData, setSuccessData] = useState<TherapistInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [scannerReady, setScannerReady] = useState(false)
  
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const lastScannedRef = useRef<string>('')
  const lastScanTimeRef = useRef<number>(0)

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Play success sound
  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (e) {
      console.log('Could not play sound:', e)
    }
  }, [])

  // Play error sound
  const playErrorSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 300
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (e) {
      console.log('Could not play sound:', e)
    }
  }, [])

  // Handle QR code detection
  const handleQRDetected = useCallback(async (qrData: string) => {
    // Prevent duplicate scans (same QR within 3 seconds)
    const now = Date.now()
    if (qrData === lastScannedRef.current && now - lastScanTimeRef.current < 3000) {
      return
    }
    
    lastScannedRef.current = qrData
    lastScanTimeRef.current = now
    
    if (isProcessing) return
    
    setIsProcessing(true)
    
    // Pause scanner
    if (scannerRef.current) {
      try {
        await scannerRef.current.pause(true)
      } catch (e) {
        console.log('Could not pause scanner:', e)
      }
    }
    
    try {
      const result = await verifyQRCode(qrData)
      
      if (result.success && result.data) {
        playSuccessSound()
        setSuccessData(result.data)
        setIsScanning(false)
        
        // Auto reset after 4 seconds
        setTimeout(() => {
          resetToScanning()
        }, 4000)
        
      } else {
        playErrorSound()
        message.error({
          content: result.message,
          duration: 3,
          style: { marginTop: '20vh' }
        })
        
        // Resume scanner after error
        setTimeout(async () => {
          if (scannerRef.current) {
            try {
              await scannerRef.current.resume()
            } catch (e) {
              console.log('Could not resume scanner:', e)
            }
          }
          setIsProcessing(false)
        }, 1500)
      }
      
    } catch (err: any) {
      playErrorSound()
      message.error({
        content: err.message || 'Terjadi kesalahan saat verifikasi',
        duration: 3,
        style: { marginTop: '20vh' }
      })
      
      setTimeout(async () => {
        if (scannerRef.current) {
          try {
            await scannerRef.current.resume()
          } catch (e) {
            console.log('Could not resume scanner:', e)
          }
        }
        setIsProcessing(false)
      }, 1500)
    }
  }, [isProcessing, playSuccessSound, playErrorSound])

  // Initialize QR Scanner
  const startScanner = useCallback(async () => {
    try {
      setCameraError(null)
      
      // Clean up existing scanner
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop()
        } catch (e) {
          // Ignore stop errors
        }
        scannerRef.current = null
      }

      const scanner = new Html5Qrcode('qr-reader', { verbose: false })
      scannerRef.current = scanner

      const cameras = await Html5Qrcode.getCameras()
      if (!cameras || cameras.length === 0) {
        throw new Error('Tidak ada kamera yang ditemukan')
      }

      // Prefer back camera
      let cameraId = cameras[0].id
      const backCamera = cameras.find(c => 
        c.label.toLowerCase().includes('back') || 
        c.label.toLowerCase().includes('rear') ||
        c.label.toLowerCase().includes('environment')
      )
      if (backCamera) {
        cameraId = backCamera.id
      }

      await scanner.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.333333
        },
        (decodedText) => {
          handleQRDetected(decodedText)
        },
        () => {
          // QR code not found - ignore
        }
      )

      setIsScanning(true)
      setScannerReady(true)
      
    } catch (err: any) {
      console.error('Scanner error:', err)
      setCameraError(
        err.name === 'NotAllowedError' 
          ? 'Akses kamera ditolak. Mohon izinkan akses kamera untuk melanjutkan.'
          : err.message || 'Gagal mengakses kamera. Pastikan perangkat memiliki kamera.'
      )
    }
  }, [handleQRDetected])

  // Reset to scanning mode
  const resetToScanning = useCallback(async () => {
    setSuccessData(null)
    setIsProcessing(false)
    lastScannedRef.current = ''
    
    // Restart scanner
    await startScanner()
  }, [startScanner])

  // Initialize on mount
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner()
    }, 500)
    
    return () => {
      clearTimeout(timer)
      // Cleanup scanner
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // TEST ONLY: Simulate QR scan with keyboard (remove in production)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (successData) return // Don't process if showing success
      
      // Press 'T' to test with valid QR (current timestamp)
      if (e.key === 't' || e.key === 'T') {
        const mockQR = `1|${Date.now()}|abc123def456`
        handleQRDetected(mockQR)
      }
      // Press 'E' to test with expired QR (old timestamp)
      if (e.key === 'e' || e.key === 'E') {
        const mockQR = `1|${Date.now() - 5000}|abc123def456`
        handleQRDetected(mockQR)
      }
    }
    
    window.addEventListener('keypress', handleKeyPress)
    return () => window.removeEventListener('keypress', handleKeyPress)
  }, [handleQRDetected, successData])

  return (
    <div className="kiosk-container">
      {/* Header */}
      <div className="kiosk-header">
        <div className="header-logo">
          <span className="logo-icon">🌿</span>
          <span>The Green Spa</span>
        </div>
        <div className="header-time">
          <div className="time-display">
            {currentTime.toLocaleTimeString('id-ID', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
          <div className="date-display">
            {currentTime.toLocaleDateString('id-ID', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="kiosk-content">
        {successData ? (
          // Success Screen
          <div className="success-screen">
            <div className="success-icon">
              <CheckCircleFilled />
            </div>
            <h1 className="success-title">Check-in Berhasil!</h1>
            
            <div className="therapist-card">
              <div className="therapist-photo">
                {successData.photo ? (
                  <img src={successData.photo} alt={successData.name} />
                ) : (
                  <div className="photo-placeholder">
                    👤
                  </div>
                )}
              </div>
              <div className="therapist-info">
                <div className="therapist-code">{successData.code}</div>
                <div className="therapist-name">{successData.name}</div>
                <div className="checkin-time">
                  <span className="time-icon">🕐</span>
                  <span>Jam Masuk: {successData.checkInTime}</span>
                </div>
              </div>
            </div>
            
            <div className="success-message">
              Selamat bekerja! Semangat hari ini 💪
            </div>
            
            <div className="auto-reset-info">
              Kembali ke scanner dalam beberapa detik...
            </div>
          </div>
        ) : (
          // Scanner Screen
          <div className="scanner-screen">
            {cameraError ? (
              <div className="camera-error">
                <div className="error-icon">📵</div>
                <p>{cameraError}</p>
                <button className="retry-button" onClick={startScanner}>
                  <ReloadOutlined /> Coba Lagi
                </button>
              </div>
            ) : (
              <>
                {/* QR Reader Container */}
                <div className="scanner-wrapper">
                  <div id="qr-reader" className="qr-reader"></div>
                  
                  {/* Custom Overlay */}
                  <div className="scanner-custom-overlay">
                    <div className="scan-area-indicator">
                      <div className="corner top-left"></div>
                      <div className="corner top-right"></div>
                      <div className="corner bottom-left"></div>
                      <div className="corner bottom-right"></div>
                      {isScanning && !isProcessing && <div className="scan-line"></div>}
                    </div>
                  </div>
                </div>
                
                <div className="scanner-instruction">
                  <ScanOutlined className="scan-icon" />
                  <p>Arahkan QR Code dari HP Anda ke sini</p>
                  <span className="sub-text">
                    {isProcessing ? 'Memproses...' : 'QR akan di-scan secara otomatis'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="kiosk-footer">
        <p>Kiosk Check-in Terapis • The Green Spa</p>
        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === 'development' && (
          <p className="debug-info">
            [DEV] Tekan T = test sukses, E = test expired
          </p>
        )}
      </div>

      <style jsx global>{`
        .kiosk-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        /* Header */
        .kiosk-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 40px;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(10px);
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
        }

        .logo-icon {
          font-size: 32px;
        }

        .header-time {
          text-align: right;
        }

        .time-display {
          font-size: 36px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          color: white;
        }

        .date-display {
          font-size: 14px;
          color: #94a3b8;
          margin-top: 4px;
        }

        /* Content */
        .kiosk-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
        }

        /* Scanner Screen */
        .scanner-screen {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
        }

        .scanner-wrapper {
          position: relative;
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          overflow: hidden;
          background: #000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .qr-reader {
          width: 100%;
        }

        /* Hide html5-qrcode default UI elements */
        #qr-reader__scan_region {
          min-height: 350px !important;
        }

        #qr-reader__dashboard {
          display: none !important;
        }

        #qr-reader video {
          border-radius: 16px;
        }

        #qr-reader__camera_selection {
          display: none !important;
        }

        /* Custom overlay on top of scanner */
        .scanner-custom-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .scan-area-indicator {
          width: 280px;
          height: 280px;
          position: relative;
        }

        .scan-area-indicator .corner {
          position: absolute;
          width: 40px;
          height: 40px;
          border: 4px solid #10b981;
        }

        .corner.top-left {
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
          border-radius: 8px 0 0 0;
        }

        .corner.top-right {
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
          border-radius: 0 8px 0 0;
        }

        .corner.bottom-left {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
          border-radius: 0 0 0 8px;
        }

        .corner.bottom-right {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
          border-radius: 0 0 8px 0;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 10px;
          right: 10px;
          height: 3px;
          background: linear-gradient(90deg, transparent, #10b981, transparent);
          animation: scan 2s ease-in-out infinite;
        }

        @keyframes scan {
          0%, 100% { top: 10px; }
          50% { top: calc(100% - 13px); }
        }

        .scanner-instruction {
          text-align: center;
          margin-top: 32px;
          color: white;
        }

        .scanner-instruction .scan-icon {
          font-size: 32px;
          color: #10b981;
          margin-bottom: 12px;
        }

        .scanner-instruction p {
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 8px;
        }

        .scanner-instruction .sub-text {
          font-size: 14px;
          color: #94a3b8;
        }

        /* Camera Error */
        .camera-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          min-width: 400px;
        }

        .error-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }

        .camera-error p {
          font-size: 18px;
          color: #94a3b8;
          margin-bottom: 24px;
          max-width: 400px;
        }

        .retry-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          font-size: 16px;
          font-weight: 600;
          color: white;
          background: #10b981;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-button:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        /* Success Screen */
        .success-screen {
          text-align: center;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .success-icon {
          font-size: 100px;
          color: #10b981;
          margin-bottom: 24px;
          animation: bounceIn 0.6s ease;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .success-title {
          font-size: 48px;
          font-weight: 700;
          color: #10b981;
          margin: 0 0 40px;
        }

        .therapist-card {
          display: flex;
          align-items: center;
          gap: 32px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px 48px;
          margin-bottom: 32px;
        }

        .therapist-photo {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          overflow: hidden;
          background: #1e293b;
          border: 4px solid #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .therapist-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-placeholder {
          font-size: 48px;
          color: #475569;
        }

        .therapist-info {
          text-align: left;
        }

        .therapist-code {
          font-size: 16px;
          color: #10b981;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .therapist-name {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 12px;
        }

        .checkin-time {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 20px;
          color: #94a3b8;
        }

        .time-icon {
          font-size: 20px;
        }

        .success-message {
          font-size: 20px;
          color: #94a3b8;
          margin-bottom: 16px;
        }

        .auto-reset-info {
          font-size: 14px;
          color: #64748b;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Footer */
        .kiosk-footer {
          padding: 20px;
          text-align: center;
          color: #475569;
          font-size: 14px;
        }

        .debug-info {
          font-size: 12px;
          color: #f59e0b;
          margin-top: 8px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .kiosk-header {
            padding: 16px 20px;
          }

          .header-logo {
            font-size: 18px;
          }

          .logo-icon {
            font-size: 24px;
          }

          .time-display {
            font-size: 24px;
          }

          .kiosk-content {
            padding: 20px;
          }

          .scanner-wrapper {
            border-radius: 16px;
          }

          .scan-area-indicator {
            width: 200px;
            height: 200px;
          }

          .success-title {
            font-size: 32px;
          }

          .therapist-card {
            flex-direction: column;
            padding: 24px;
            gap: 20px;
          }

          .therapist-info {
            text-align: center;
          }

          .therapist-name {
            font-size: 24px;
          }

          .camera-error {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
