import { IAuthResponse, ILoginRequest, IRegisterRequest, IUser, ITherapistProfile } from '@afx/interfaces/auth.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function AuthLoginService(data: ILoginRequest) {
    return request<IAuthResponse>({
        url: rest.authLogin,
        method: 'POST',
        data: data
    })
}

export function AuthRegisterService(data: IRegisterRequest) {
    return request<IAuthResponse>({
        url: rest.authRegister,
        method: 'POST',
        data: data
    })
}

export function AuthMeService() {
    return request<IUser>({
        url: rest.authMe,
        method: 'GET'
    })
}

export function AuthValidateService() {
    return request<{ valid: boolean }>({
        url: rest.authValidate,
        method: 'GET'
    })
}

export function AuthLogoutService() {
    return request<any>({
        url: rest.authLogout,
        method: 'POST'
    })
}

export function AuthSwitchCompanyService(companyId: number) {
    return request<IAuthResponse>({
        url: rest.authSwitchCompany,
        method: 'POST',
        data: { companyId }
    })
}

// Helper functions for token management
export const AuthHelper = {
    // Save auth data to storage
    saveAuth: (authResponse: IAuthResponse) => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.setItem('THEGREEN@TOKEN', authResponse.accessToken)
                localStorage.setItem('THEGREEN@USER', JSON.stringify(authResponse.user))
                
                // Save therapist data if present
                if (authResponse.therapist) {
                    localStorage.setItem('THEGREEN@THERAPIST', JSON.stringify(authResponse.therapist))
                }
                
                console.log('Auth saved successfully:', { 
                    token: authResponse.accessToken?.substring(0, 20) + '...', 
                    user: authResponse.user?.username,
                    hasTherapist: !!authResponse.therapist
                })
            }
        } catch (error) {
            console.error('Error saving auth:', error)
        }
    },

    // Get current token
    getToken: (): string | null => {
        try {
            if (typeof window !== 'undefined') {
                const token = localStorage.getItem('THEGREEN@TOKEN')
                return token
            }
            return null
        } catch (error) {
            console.error('Error getting token:', error)
            return null
        }
    },

    // Get current user
    getUser: (): IUser | null => {
        try {
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('THEGREEN@USER')
                if (userStr) {
                    return JSON.parse(userStr)
                }
            }
            return null
        } catch (error) {
            console.error('Error getting user:', error)
            return null
        }
    },

    // Get therapist profile (if user is a therapist)
    getTherapist: (): ITherapistProfile | null => {
        try {
            if (typeof window !== 'undefined') {
                const therapistStr = localStorage.getItem('THEGREEN@THERAPIST')
                if (therapistStr) {
                    return JSON.parse(therapistStr)
                }
            }
            return null
        } catch (error) {
            console.error('Error getting therapist:', error)
            return null
        }
    },

    // Check if authenticated
    isAuthenticated: (): boolean => {
        const token = AuthHelper.getToken()
        return !!token
    },

    // Clear auth data
    clearAuth: () => {
        try {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('THEGREEN@TOKEN')
                localStorage.removeItem('THEGREEN@USER')
                localStorage.removeItem('THEGREEN@THERAPIST')
                console.log('Auth cleared')
            }
        } catch (error) {
            console.error('Error clearing auth:', error)
        }
    },

    // Logout
    logout: async () => {
        try {
            await AuthLogoutService()
        } catch (e) {
            // Ignore error on logout
        }
        AuthHelper.clearAuth()
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
        }
    }
}
