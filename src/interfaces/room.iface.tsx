export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | number;

export const RoomStatusMap: Record<number, string> = {
    0: 'Available',
    1: 'Occupied',
    2: 'Maintenance'
};

export function getRoomStatusName(status: RoomStatus | null | undefined): string {
    if (status === null || status === undefined) return 'Unknown';
    if (typeof status === 'number') {
        return RoomStatusMap[status] || 'Unknown';
    }
    return status;
}

export interface IRoom {
    id: number;
    name: string;
    capacity: number;
    description?: string;
    status: RoomStatus;
    statusDisplay?: string;
    isActive: boolean;
    branchId?: number;
    BranchId?: number;
    branchName?: string;
    BranchName?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface IRoomDetail extends IRoom {
    totalSessions: number;
    sessionsToday: number;
    currentSessionId?: number;
}

export interface ICreateRoomRequest {
    name: string;
    capacity?: number;
    description?: string;
    branchId?: number;
    BranchId?: number;
}

export interface IUpdateRoomRequest {
    name?: string;
    capacity?: number;
    description?: string;
    status?: number;
    isActive?: boolean;
    branchId?: number;
    BranchId?: number;
}

export interface IRoomPaginationRequest {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    branchId?: number;
    BranchId?: number;
    sortColumn?: string;
    sortDirection?: string;
}
