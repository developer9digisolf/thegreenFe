'use client'

import './globals.css'
import './font.css'
import './styles.scss'
import { ConfigProvider } from 'antd'


export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#E7216E'
        }
      }}
    >
      <html lang="en">
        <title>Example</title>
        <body>{children}</body>
      </html>
    </ConfigProvider>
  )
}