import { 
    IRoom, 
    IRoomDetail, 
    ICreateRoomRequest, 
    IUpdateRoomRequest, 
    IRoomPaginationRequest 
} from '@afx/interfaces/room.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function GetRoomsService(params: IRoomPaginationRequest) {
    return request<IRoom[]>({
        url: rest.room,
        method: 'GET',
        data: params
    })
}

export function GetActiveRoomsService() {
    return request<IRoom[]>({
        url: rest.roomActive,
        method: 'GET'
    })
}

export function GetAvailableRoomsService() {
    return request<IRoom[]>({
        url: rest.roomAvailable,
        method: 'GET'
    })
}

export function GetRoomByIdService(id: number) {
    return request<IRoom>({
        url: rest.roomDetail.replace(':id', String(id)),
        method: 'GET'
    })
}

export function GetRoomDetailService(id: number) {
    return request<IRoomDetail>({
        url: rest.roomDetailFull.replace(':id', String(id)),
        method: 'GET'
    })
}

export function CreateRoomService(data: ICreateRoomRequest) {
    return request<IRoom>({
        url: rest.room,
        method: 'POST',
        data: data
    })
}

export function UpdateRoomService(id: number, data: IUpdateRoomRequest) {
    return request<IRoom>({
        url: rest.roomDetail.replace(':id', String(id)),
        method: 'PUT',
        data: data
    })
}

export function DeleteRoomService(id: number) {
    return request<any>({
        url: rest.roomDetail.replace(':id', String(id)),
        method: 'DELETE'
    })
}

export function CheckRoomNameService(name: string, excludeId?: number) {
    return request<{ exists: boolean }>({
        url: rest.roomCheckName,
        method: 'GET',
        data: { name, excludeId }
    })
}
