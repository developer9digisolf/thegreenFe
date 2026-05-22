import { 
    ICreateServiceRequest, 
    ICreateServiceVariantRequest,
    IService, 
    IServiceDetail, 
    IServiceVariant,
    IServiceVariantList,
    IUpdateServiceRequest,
    IUpdateServiceVariantRequest 
} from '@afx/interfaces/service.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

// ============================================
// SERVICE CRUD
// ============================================

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

export function ServiceGetDetailService(id: number) {
    return request<IServiceDetail>({
        url: rest.serviceDetailFull.replace(':id', id.toString()),
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
    return request<IServiceDetail>({
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

// ============================================
// VARIANT CRUD
// ============================================

export function VariantGetAllActiveService() {
    return request<IServiceVariantList[]>({
        url: rest.serviceVariants,
        method: 'GET'
    })
}

export function VariantGetByServiceIdService(serviceId: number) {
    return request<IServiceVariant[]>({
        url: rest.serviceVariantsByService.replace(':serviceId', serviceId.toString()),
        method: 'GET'
    })
}

export function VariantGetByIdService(variantId: number) {
    return request<IServiceVariant>({
        url: rest.serviceVariantDetail.replace(':variantId', variantId.toString()),
        method: 'GET'
    })
}

export function VariantAddService(serviceId: number, data: ICreateServiceVariantRequest) {
    return request<IServiceVariant>({
        url: rest.serviceVariantsByService.replace(':serviceId', serviceId.toString()),
        method: 'POST',
        data: data
    })
}

export function VariantUpdateService(variantId: number, data: IUpdateServiceVariantRequest) {
    return request<IServiceVariant>({
        url: rest.serviceVariantDetail.replace(':variantId', variantId.toString()),
        method: 'PUT',
        data: data
    })
}

export function VariantDeleteService(variantId: number) {
    return request<any>({
        url: rest.serviceVariantDetail.replace(':variantId', variantId.toString()),
        method: 'DELETE'
    })
}

export function ServiceGetUnregistered(params?: any) {
    return request<any>({
        url: rest.servicesUnregistered,
        method: 'GET',
        data: params
    })
}

export function VariantGetUnregistered(serviceId: number, params?: any) {
    return request<any>({
        url: rest.serviceVariantsUnregistered.replace(':serviceId', serviceId.toString()),
        method: 'GET',
        data: params
    })
}
