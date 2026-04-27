'use client'

import './globals.css'
import './font.css'
import './styles.scss'
import { ConfigProvider, App } from 'antd'
import { AuthProvider } from '@afx/contexts/AuthContext'
import { AntdGlobalConfig } from '@afx/utils/antd-global'


export default function MainLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>The Green Spa | Management System</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#059669'
            }
          }}
        >
          <App>
            <AntdGlobalConfig />
            <AuthProvider>
              {children}
            </AuthProvider>
          </App>
        </ConfigProvider>
      </body>
    </html>
  )
}
