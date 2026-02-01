// Role can be either string or number (enum from API)
export type UserRole = 'Owner' | 'Admin' | 'Therapist' | 'Member' | 'Office' | number;

// Role enum mapping (matches backend UserRole enum)
export const RoleMap: Record<number, string> = {
    0: 'Owner',
    1: 'Admin',
    2: 'Therapist',
    3: 'Member',
    4: 'Office'
}

// Helper to get role name
export function getRoleName(role: UserRole): string {
    if (typeof role === 'number') {
        return RoleMap[role] || 'Unknown'
    }
    return role
}

export interface IUser {
    id: number;
    username: string;
    email?: string;
    role: UserRole;
    isActive: boolean;
    lastLoginAt?: string;
    createdAt: string;
}

// Therapist profile (included when role = Therapist)
export interface ITherapistProfile {
    id: number;
    code: string;
    name: string;
    phone?: string;
    photo?: string;
    rating: number;
    reviewCount: number;
    totalSessions: number;
}

export interface ILoginRequest {
    username: string;
    password: string;
}

export interface IRegisterRequest {
    username: string;
    password: string;
    email?: string;
    role: UserRole;
}

export interface IAuthResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: IUser;
    therapist?: ITherapistProfile; // Only present when role = Therapist
}

export interface IAuthState {
    isAuthenticated: boolean;
    user: IUser | null;
    token: string | null;
    loading: boolean;
}
