'use client'

import { useState } from 'react'
import { Form, Input, Button, App, Checkbox, Divider } from 'antd'
import { UserOutlined, LockOutlined, GoogleOutlined, AppleFilled, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { AuthLoginService, AuthHelper } from '@afx/services/auth.service'
import { ILoginRequest, getRoleName } from '@afx/interfaces/auth.iface'
import Link from 'next/link'

export default function Login(): React.JSX.Element {
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const handleLogin = async (values: ILoginRequest) => {
    setLoading(true)
    
    try {
      const res = await AuthLoginService(values)
      
      if (res.success) {
        const roleValue = res.data.user.role
        const role = getRoleName(roleValue).toLowerCase()
        
        if (['owner', 'admin'].includes(role)) {
          AuthHelper.saveAuth(res.data)
          message.success(`Selamat datang, ${res.data.user.username}!`)
          setTimeout(() => { window.location.href = '/dashboard' }, 100)
        } else if (role === 'cashier') {
          AuthHelper.saveAuth(res.data)
          message.success(`Selamat datang, ${res.data.user.username}!`)
          // Biarkan diarahkan ke POS. Komponen POS yang akan menahan aksesnya dengan Modal.
          setTimeout(() => { window.location.href = '/pos' }, 500) 
        } else if (role === 'therapist') {
          message.warning('Terapis silakan login melalui halaman khusus Terapis.')
          setLoading(false)
        } else if (role === 'member') {
          message.info('Silakan gunakan aplikasi mobile untuk Member.')
          setLoading(false)
        } else {
          message.error('Maaf, Anda tidak memiliki akses ke Dashboard. Hubungi Administrator.')
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
    } ``
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side: Login Form */}
        <div className="login-left">
          <div className="form-wrapper">
         
            
            <div className="header-section">
              <h1 className="welcome-title">Welcome Back to The Green SPA</h1>
              <p className="welcome-subtitle">Enter your username and password to continue.</p>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
              requiredMark={false}
              className="login-form"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username!' }]}
              >
                <Input 
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="custom-input"
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="custom-input"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <div className="form-options">
                <Checkbox>Remember me</Checkbox>
                <a href="#" className="forgot-link">Forgot password</a>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="sign-in-button"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </Form.Item>

              <div className="register-footer">
                <span>Don't have an account? </span>
                <Link href="/auth/register" className="register-link">Register</Link>
              </div>
            </Form>

            <div className="page-footer">
              <p className="copyright">© 2024 The Green Spa. All rights reserved.</p>
              <div className="footer-links">
                <a href="#">Privacy Policy</a>
                <span className="dot">•</span>
                <a href="#">Term & Condition</a>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Promotional Image/Spa Hero */}
        <div className="login-right">
          <div className="promo-content">
            <div className="spa-hero-container">
              <img src="/images/spa_hero.png" alt="Relaxing Spa Environment" className="spa-hero-img" />
            </div>
            
            <div className="promo-text">
              <h2 className="promo-title">Experience Pure Relaxation</h2>
              <p className="promo-description">
                Discover the ultimate sanctuary at The Green SPA. 
                From rejuvenating massages to calming therapies, 
                we bring balance and tranquility to your busy life.
              </p>
              <div className="promo-pagination">
                <span className="page-dot active"></span>
                <span className="page-dot"></span>
                <span className="page-dot"></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .login-page {
          min-height: 100vh;
          background-color: #fff;
          font-family: 'Inter', sans-serif;
          overflow: hidden;
        }

        .login-container {
          display: flex;
          min-height: 100vh;
          width: 100%;
        }

        /* Left Side Styles */
        .login-left {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #fff;
        }

        .form-wrapper {
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }

        .header-section {
          text-align: center;
          margin-bottom: 32px;
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin: 0;
        }

        .login-form .ant-form-item-label label {
          font-weight: 500;
          color: #374151;
        }

        .custom-input {
          border-radius: 8px !important;
          border: 1px solid #D1D5DB !important;
          padding: 10px 14px !important;
        }

        .custom-input:hover, .custom-input:focus {
          border-color: #3d6b5f !important;
          box-shadow: 0 0 0 2px rgba(61, 107, 95, 0.1) !important;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .forgot-link {
          color: #111827;
          font-weight: 600;
          font-size: 14px;
        }

        .sign-in-button {
          height: 48px !important;
          background: #111827 !important;
          border: none !important;
          border-radius: 8px !important;
          font-weight: 600 !important;
          font-size: 16px !important;
        }

        .sign-in-button:hover {
          background: #1F2937 !important;
        }

        .register-footer {
          text-align: center;
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 48px;
        }

        .register-link {
          color: #111827;
          font-weight: 700;
          text-decoration: none;
        }

        .page-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .copyright {
          font-size: 12px;
          color: #9CA3AF;
          margin: 0;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #6B7280;
        }

        .footer-links a {
          color: inherit;
          text-decoration: none;
        }

        .dot {
          color: #D1D5DB;
        }

        /* Right Side Styles */
        .login-right {
          flex: 1;
          background: #0D1117;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          position: relative;
          overflow: hidden;
        }

        .login-right::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at 50% 50%, rgba(61, 107, 95, 0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .promo-content {
          width: 100%;
          max-width: 600px;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
        }

        .spa-hero-container {
          width: 100%;
          margin-bottom: 60px;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          aspect-ratio: 16 / 9;
        }

        .spa-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .promo-text {
          text-align: center;
          color: #fff;
        }

        .promo-title {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
        }

        .promo-description {
          font-size: 16px;
          color: #9CA3AF;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 480px;
          margin-left: auto;
          margin-right: auto;
        }

        .promo-pagination {
          display: flex;
          gap: 8px;
          justify-content: center;
        }

        .page-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #374151;
        }

        .page-dot.active {
          width: 24px;
          border-radius: 4px;
          background: #3d6b5f;
        }

        /* Responsive Styles */
        @media (max-width: 1024px) {
          .login-right {
            display: none;
          }
          
          .login-left {
            flex: 1;
          }
        }

        @media (max-width: 480px) {
          .login-left {
            padding: 24px;
          }
          
          .welcome-title {
            font-size: 20px;
          }
        }
      `}</style>
    </div>
  )
}
