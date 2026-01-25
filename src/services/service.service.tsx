import { ICreateServiceRequest, IService, IUpdateServiceRequest } from '@afx/interfaces/service.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function ServiceGetAllService(params?: any) {
    return request<IService[]>({
        url: rest.service,
        method: 'GET',
        data: params
    })
}

export function ServiceGetActiveService() {
    return request<IService[]>({
        url: rest.serviceActive,
        method: 'GET'
    })
}

export function ServiceGetByIdService(id: number) {
    return request<IService>({
        url: rest.serviceDetail.replace(':id', id.toString()),
        method: 'GET'
    })
}

export function ServiceGetByCategoryService(categoryId: number) {
    return request<IService[]>({
        url: rest.serviceByCategory.replace(':categoryId', categoryId.toString()),
        method: 'GET'
    })
}

export function ServiceCreateService(data: ICreateServiceRequest) {
    return request<IService>({
        url: rest.service,
        method: 'POST',
        data: data
    })
}

export function ServiceUpdateService(id: number, data: IUpdateServiceRequest) {
    return request<IService>({
        url: rest.serviceDetail.replace(':id', id.toString()),
        method: 'PUT',
        data: data
    })
}

export function ServiceDeleteService(id: number) {
    return request<any>({
        url: rest.serviceDetail.replace(':id', id.toString()),
        method: 'DELETE'
    })
}
