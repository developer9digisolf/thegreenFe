import { ICreateServiceCategoryRequest, IUpdateServiceCategoryRequest } from '@afx/interfaces/service-category.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function ServiceCategoryGetAllService(params?: any) {
    return request<any>({
        url: rest.serviceCategory,
        method: 'GET',
        data: params
    })
}

export function ServiceCategoryGetActiveService() {
    return request<any>({
        url: rest.serviceCategoryActive,
        method: 'GET'
    })
}

export function ServiceCategoryGetService(id: string) {
    return request<any>({
        url: rest.serviceCategoryDetail.replace(":id", id),
        method: 'GET'
    })
}

export function ServiceCategoryCreateService(data: ICreateServiceCategoryRequest) {
    return request<any>({
        url: rest.serviceCategory,
        data,
        method: 'POST'
    })
}

export function ServiceCategoryUpdateService(id: string, data: IUpdateServiceCategoryRequest) {
    return request<any>({
        url: rest.serviceCategoryDetail.replace(":id", id),
        data,
        method: 'PUT'
    })
}

export function ServiceCategoryDeleteService(id: string) {
    return request<any>({
        url: rest.serviceCategoryDetail.replace(":id", id),
        method: 'DELETE'
    })
}
