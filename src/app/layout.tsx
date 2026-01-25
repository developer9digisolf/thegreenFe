'use client'

import './globals.css'
import './font.css'
import './styles.scss'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@afx/contexts/AuthContext'


export default function MainLayout({
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
      <html lang="en">
        <title>The Green Spa</title>
        <body>
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    </ConfigProvider>
  )
}
