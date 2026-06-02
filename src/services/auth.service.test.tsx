import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock must be before any imports from the mocked module
vi.mock('@afx/utils/request.utils', () => ({
  default: vi.fn(),
}))

import request from '@afx/utils/request.utils'
import {
  AuthHelper,
  AuthLoginService,
  AuthLogoutService,
  AuthMeService,
  AuthRegisterService,
  AuthSwitchCompanyService,
  AuthValidateService,
} from './auth.service'

describe('Auth Service', () => {
  describe('API Service Functions', () => {
    it('AuthLoginService should call request with POST /auth/login', () => {
      const mockData = { username: 'test', password: 'pass' }
      AuthLoginService(mockData as any)
      expect(request).toHaveBeenCalledWith({
        url: 'auth/login',
        method: 'POST',
        data: mockData,
      })
    })

    it('AuthRegisterService should call request with POST /auth/register', () => {
      const mockData = { username: 'test', password: 'pass', email: 'test@test.com' }
      AuthRegisterService(mockData as any)
      expect(request).toHaveBeenCalledWith({
        url: 'auth/register',
        method: 'POST',
        data: mockData,
      })
    })

    it('AuthMeService should call request with GET /auth/me', () => {
      AuthMeService()
      expect(request).toHaveBeenCalledWith({
        url: 'auth/me',
        method: 'GET',
      })
    })

    it('AuthValidateService should call request with GET /auth/validate', () => {
      AuthValidateService()
      expect(request).toHaveBeenCalledWith({
        url: 'auth/validate',
        method: 'GET',
      })
    })

    it('AuthLogoutService should call request with POST /auth/logout', () => {
      AuthLogoutService()
      expect(request).toHaveBeenCalledWith({
        url: 'auth/logout',
        method: 'POST',
      })
    })

    it('AuthSwitchCompanyService should call request with POST /auth/switch-company', () => {
      AuthSwitchCompanyService(123)
      expect(request).toHaveBeenCalledWith({
        url: 'auth/switch-company',
        method: 'POST',
        data: { companyId: 123 },
      })
    })
  })

  describe('AuthHelper', () => {
    let storage: Record<string, string> = {}
    const mockToken = 'mock-access-token-xyz'
    const mockUser = { id: 1, username: 'testuser', name: 'Test User' }
    const mockTherapist = { id: 10, name: 'Therapist Name', specialization: 'Massage' }

    beforeEach(() => {
      storage = {}
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn((key: string) => storage[key] || null),
          setItem: vi.fn((key: string, value: string) => { storage[key] = value }),
          removeItem: vi.fn((key: string) => { delete storage[key] }),
        },
        writable: true,
      })
    })

    afterEach(() => {
      vi.clearAllMocks()
    })

    describe('saveAuth', () => {
      it('should save token and user to localStorage', () => {
        AuthHelper.saveAuth({ accessToken: mockToken, user: mockUser } as any)
        expect(window.localStorage.setItem).toHaveBeenCalledWith('THEGREEN@TOKEN', mockToken)
        expect(window.localStorage.setItem).toHaveBeenCalledWith('THEGREEN@USER', JSON.stringify(mockUser))
      })

      it('should save therapist data when present', () => {
        AuthHelper.saveAuth({
          accessToken: mockToken,
          user: mockUser,
          therapist: mockTherapist,
        } as any)
        expect(window.localStorage.setItem).toHaveBeenCalledWith(
          'THEGREEN@THERAPIST',
          JSON.stringify(mockTherapist)
        )
      })

      it('should not save therapist when absent', () => {
        AuthHelper.saveAuth({ accessToken: mockToken, user: mockUser } as any)
        const calls = (window.localStorage.setItem as any).mock.calls
        const therapistCall = calls.find((call: any[]) => call[0] === 'THEGREEN@THERAPIST')
        expect(therapistCall).toBeUndefined()
      })
    })

    describe('getToken', () => {
      it('should return token from localStorage', () => {
        storage['THEGREEN@TOKEN'] = mockToken
        const result = AuthHelper.getToken()
        expect(result).toBe(mockToken)
      })

      it('should return null when no token exists', () => {
        const result = AuthHelper.getToken()
        expect(result).toBeNull()
      })
    })

    describe('getUser', () => {
      it('should parse and return user from localStorage', () => {
        storage['THEGREEN@USER'] = JSON.stringify(mockUser)
        const result = AuthHelper.getUser()
        expect(result).toEqual(mockUser)
      })

      it('should return null when no user exists', () => {
        const result = AuthHelper.getUser()
        expect(result).toBeNull()
      })

      it('should return null for invalid JSON', () => {
        storage['THEGREEN@USER'] = 'not-valid-json'
        const result = AuthHelper.getUser()
        expect(result).toBeNull()
      })
    })

    describe('getTherapist', () => {
      it('should parse and return therapist from localStorage', () => {
        storage['THEGREEN@THERAPIST'] = JSON.stringify(mockTherapist)
        const result = AuthHelper.getTherapist()
        expect(result).toEqual(mockTherapist)
      })

      it('should return null when no therapist exists', () => {
        const result = AuthHelper.getTherapist()
        expect(result).toBeNull()
      })
    })

    describe('isAuthenticated', () => {
      it('should return true when token exists', () => {
        storage['THEGREEN@TOKEN'] = mockToken
        expect(AuthHelper.isAuthenticated()).toBe(true)
      })

      it('should return false when token is missing', () => {
        expect(AuthHelper.isAuthenticated()).toBe(false)
      })

      it('should return false when token is empty string', () => {
        storage['THEGREEN@TOKEN'] = ''
        expect(AuthHelper.isAuthenticated()).toBe(false)
      })
    })

    describe('clearAuth', () => {
      it('should remove all auth keys from localStorage', () => {
        storage['THEGREEN@TOKEN'] = mockToken
        storage['THEGREEN@USER'] = JSON.stringify(mockUser)
        storage['THEGREEN@THERAPIST'] = JSON.stringify(mockTherapist)

        AuthHelper.clearAuth()

        expect(window.localStorage.removeItem).toHaveBeenCalledWith('THEGREEN@TOKEN')
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('THEGREEN@USER')
        expect(window.localStorage.removeItem).toHaveBeenCalledWith('THEGREEN@THERAPIST')
      })
    })

    describe('logout', () => {
      const originalLocation = window.location

      beforeEach(() => {
        // @ts-ignore
        delete window.location
        window.location = { href: '' } as any
        vi.mocked(request).mockReset()
      })

      afterEach(() => {
        window.location = originalLocation
      })

      it('should call AuthLogoutService and clear auth on success', async () => {
        vi.mocked(request).mockResolvedValueOnce({ success: true } as any)

        await AuthHelper.logout()

        expect(request).toHaveBeenCalledWith({ url: 'auth/logout', method: 'POST' })
        expect(window.location.href).toBe('/auth/login')
      })

      it('should clear auth even when API call fails', async () => {
        vi.mocked(request).mockRejectedValueOnce(new Error('Network error'))
        storage['THEGREEN@TOKEN'] = mockToken

        await AuthHelper.logout()

        expect(window.location.href).toBe('/auth/login')
      })
    })
  })
})
