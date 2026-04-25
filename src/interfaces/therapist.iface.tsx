import { type GenderType, GenderMap } from './member.iface';

export type QueueStatus = 'Offline' | 'Available' | 'Busy' | 'Break' | number;

export const QueueStatusMap: Record<number, string> = {
    0: 'Offline',
    1: 'Available',
    2: 'Busy',
    3: 'Break'
};

export function getQueueStatusName(status: QueueStatus | null | undefined): string {
    if (status === null || status === undefined) return 'Offline';
    if (typeof status === 'number') {
        return QueueStatusMap[status] || 'Unknown';
    }
    return status;
}

export type { GenderType };
export { GenderMap };

export interface ITherapist {
    id: number;
    code: string;
    name: string;
    phone?: string;
    gender?: GenderType;
    genderDisplay?: string;
    address?: string;
    joinDate: string;
    skills: string[];
    rating: number;
    reviewCount: number;
    totalSessions: number;
    queueStatus?: QueueStatus;
    queueStatusDisplay?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface ITherapistDetail extends ITherapist {
    totalCommission: number;
    sessionsThisMonth: number;
    commissionThisMonth: number;
}

export interface ICreateTherapistRequest {
    name: string;
    phone?: string;
    gender?: number;
    address?: string;
    skills?: string[];
}

export interface IUpdateTherapistRequest {
    name?: string;
    phone?: string;
    gender?: number;
    address?: string;
    skills?: string[];
    isActive?: boolean;
}

export interface ITherapistPaginationRequest {
    page?: number;
    pageSize?: number;
    search?: string;
    gender?: string;
    skill?: string;
    sortColumn?: string;
    sortDirection?: string;
}
