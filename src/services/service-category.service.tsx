import { ICreateServiceCategoryRequest, IUpdateServiceCategoryRequest, IServiceCategory } from '@afx/interfaces/service-category.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function ServiceCategoryGetAllService(params?: any) {
    return request<IServiceCategory[]>({
        url: rest.serviceCategory,
        method: 'GET',
        data: params
    })
}

export function ServiceCategoryGetActiveService() {
    return request<IServiceCategory[]>({
        url: rest.serviceCategoryActive,
        method: 'GET'
    })
}

export function ServiceCategoryGetService(id: number) {
    return request<IServiceCategory>({
        url: rest.serviceCategoryDetail.replace(":id", id.toString()),
        method: 'GET'
    })
}

export function ServiceCategoryGetWithServicesService(id: number) {
    return request<IServiceCategory>({
        url: rest.serviceCategoryWithServices.replace(":id", id.toString()),
        method: 'GET'
    })
}

export function ServiceCategoryCreateService(data: ICreateServiceCategoryRequest) {
    return request<IServiceCategory>({
        url: rest.serviceCategory,
        data,
        method: 'POST'
    })
}

export function ServiceCategoryUpdateService(id: number, data: IUpdateServiceCategoryRequest) {
    return request<IServiceCategory>({
        url: rest.serviceCategoryDetail.replace(":id", id.toString()),
        data,
        method: 'PUT'
    })
}

export function ServiceCategoryDeleteService(id: number) {
    return request<any>({
        url: rest.serviceCategoryDetail.replace(":id", id.toString()),
        method: 'DELETE'
    })
}

export function ServiceCategoryCheckNameService(name: string, excludeId?: number) {
    return request<{ exists: boolean }>({
        url: rest.serviceCategoryCheckName,
        method: 'GET',
        data: { name, excludeId }
    })
}
