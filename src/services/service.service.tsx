import { ICreateServiceRequest, IService, IUpdateServiceRequest } from '../interfaces/service.iface'
import { rest } from '../utilities/config.rest'
import request from '../utilities/request.utils'

export const ServiceGetAllService = async (data?: any) => {
    return await request<IService[]>({
        url: rest.service,
        method: 'GET',
        data: data
    })
}

export const ServiceGetActiveService = async () => {
    return await request<IService[]>({
        url: rest.serviceActive,
        method: 'GET'
    })
}

export const ServiceCreateService = async (data: ICreateServiceRequest) => {
    return await request<IService>({
        url: rest.service,
        method: 'POST',
        data: data
    })
}

export const ServiceUpdateService = async (
    id: string,
    data: IUpdateServiceRequest
) => {
    return await request<IService>({
        url: rest.serviceDetail.replace(':id', id),
        method: 'PUT',
        data: data
    })
}

export const ServiceDeleteService = async (id: string) => {
    return await request<any>({
        url: rest.serviceDetail.replace(':id', id),
        method: 'DELETE'
    })
}
