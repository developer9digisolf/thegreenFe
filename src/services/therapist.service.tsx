import { 
    ITherapist, 
    ITherapistDetail, 
    ICreateTherapistRequest, 
    IUpdateTherapistRequest, 
    ITherapistPaginationRequest 
} from '@afx/interfaces/therapist.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function GetTherapistsService(params: ITherapistPaginationRequest) {
    return request<ITherapist[]>({
        url: rest.therapist,
        method: 'GET',
        data: params
    })
}

export function GetActiveTherapistsService() {
    return request<ITherapist[]>({
        url: rest.therapistActive,
        method: 'GET'
    })
}

export function GetAvailableTherapistsService() {
    return request<ITherapist[]>({
        url: rest.therapistAvailable,
        method: 'GET'
    })
}

export function GetTherapistByIdService(id: number) {
    return request<ITherapist>({
        url: rest.therapistDetail.replace(':id', String(id)),
        method: 'GET'
    })
}

export function GetTherapistDetailService(id: number) {
    return request<ITherapistDetail>({
        url: rest.therapistDetailFull.replace(':id', String(id)),
        method: 'GET'
    })
}

export function CreateTherapistService(data: ICreateTherapistRequest) {
    return request<ITherapist>({
        url: rest.therapist,
        method: 'POST',
        data: data
    })
}

export function UpdateTherapistService(id: number, data: IUpdateTherapistRequest) {
    return request<ITherapist>({
        url: rest.therapistDetail.replace(':id', String(id)),
        method: 'PUT',
        data: data
    })
}

export function DeleteTherapistService(id: number) {
    return request<any>({
        url: rest.therapistDetail.replace(':id', String(id)),
        method: 'DELETE'
    })
}

export function CheckTherapistPhoneService(phone: string, excludeId?: number) {
    return request<{ exists: boolean }>({
        url: rest.therapistCheckPhone,
        method: 'GET',
        data: { phone, excludeId }
    })
}
