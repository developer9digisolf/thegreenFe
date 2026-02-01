'use client'

import { useState } from 'react'
import { Form, Input, Button, message, Card } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { AuthLoginService, AuthHelper } from '@afx/services/auth.service'
import { ILoginRequest, RoleMap, getRoleName } from '@afx/interfaces/auth.iface'

export default function Login(): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleLogin = async (values: ILoginRequest) => {
    setLoading(true)
    
    try {
      const res = await AuthLoginService(values)
      
      if (res.success) {
        // Get role
        const roleValue = res.data.user.role
        const role = getRoleName(roleValue).toLowerCase()
        
        console.log('Login success - Role:', role, 'Has Therapist:', !!res.data.therapist)
        
        // Check role and redirect accordingly
        if (role === 'therapist') {
          // Therapist - must have therapist profile
          if (!res.data.therapist) {
            message.error('Profil terapis tidak ditemukan. Hubungi admin.')
            setLoading(false)
            return
          }
          
          // Save auth
          AuthHelper.saveAuth(res.data)
          message.success(`Selamat datang, ${res.data.therapist.name}!`)
          
          setTimeout(() => {
            window.location.href = '/therapist/dashboard'
          }, 100)
          
        } else if (role === 'member') {
          // Member - redirect to mobile app or show message
          message.info('Silakan gunakan aplikasi mobile untuk Member')
          setLoading(false)
          
        } else if (['owner', 'admin', 'office'].includes(role)) {
          // Admin roles - redirect to dashboard
          AuthHelper.saveAuth(res.data)
          message.success(`Selamat datang, ${res.data.user.username}!`)
          
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 100)
          
        } else {
          message.error('Role tidak dikenali')
          setLoading(false)
        }
      } else {
        message.error(res.message || 'Login gagal')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Login error:', err)
      message.error(err.message || 'Login gagal. Periksa username dan password.')
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-overlay"></div>
      </div>
      
      <div className="login-content">
        <Card className="login-card" bordered={false}>
          <div className="login-header">
            <div className="login-logo">
              <i className="fa-solid fa-spa"></i>
            </div>
            <h1 className="login-title">The Green Spa</h1>
            <p className="login-subtitle">Masuk ke akun Anda</p>
          </div>

          <Form
            form={form}
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
            requiredMark={false}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Masukkan username!' }]}
            >
              <Input 
                prefix={<UserOutlined className="input-icon" />} 
                placeholder="Username"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Masukkan password!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="login-button"
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer">
            <p>© 2024 The Green Spa. All rights reserved.</p>
          </div>
        </Card>
      </div>

      <style jsx global>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: linear-gradient(135deg, #059669 0%, #0d9488 50%, #14b8a6 100%);
        }

        .login-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/><circle cx="20" cy="80" r="15" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/><circle cx="80" cy="20" r="20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></svg>');
          background-size: 200px 200px;
          opacity: 0.5;
        }

        .login-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 70%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }

        .login-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          padding: 20px;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          padding: 40px;
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #059669, #14b8a6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(5, 150, 105, 0.3);
        }

        .login-logo i {
          font-size: 36px;
          color: white;
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 8px;
        }

        .login-subtitle {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        .login-card .ant-input-affix-wrapper {
          border-radius: 10px;
          border: 1.5px solid #e5e7eb;
          padding: 12px 16px;
          transition: all 0.3s;
        }

        .login-card .ant-input-affix-wrapper:hover,
        .login-card .ant-input-affix-wrapper:focus,
        .login-card .ant-input-affix-wrapper-focused {
          border-color: #059669;
          box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
        }

        .login-card .ant-input {
          font-size: 15px;
        }

        .input-icon {
          color: #9ca3af;
          font-size: 16px;
          margin-right: 8px;
        }

        .login-button {
          height: 50px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          background: linear-gradient(135deg, #059669, #0d9488);
          border: none;
          margin-top: 8px;
        }

        .login-button:hover {
          background: linear-gradient(135deg, #047857, #0f766e);
        }

        .login-footer {
          text-align: center;
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
        }

        .login-footer p {
          font-size: 12px;
          color: #9ca3af;
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }
          
          .login-title {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  )
}
