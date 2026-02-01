'use client'

import '../globals.css'
import '../font.css'
import { ConfigProvider } from 'antd'

export default function KioskLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#059669'
        }
      }}
    >
      <div className="kiosk-root">
        {children}
      </div>
      <style jsx global>{`
        .kiosk-root {
          min-height: 100vh;
          background: #000;
          overflow: hidden;
        }
      `}</style>
    </ConfigProvider>
  )
}
