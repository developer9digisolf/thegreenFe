import { ICreditPackage, ICreateCreditPackageRequest, IUpdateCreditPackageRequest } from '@afx/interfaces/credit-package.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function CreditPackageGetAllService(params?: any) {
    return request<ICreditPackage[]>({
        url: rest.creditPackage,
        method: 'GET',
        data: params
    })
}

export function CreditPackageGetActiveService() {
    return request<ICreditPackage[]>({
        url: rest.creditPackageActive,
        method: 'GET'
    })
}

export function CreditPackageGetByIdService(id: number) {
    return request<ICreditPackage>({
        url: rest.creditPackageDetail.replace(':id', id.toString()),
        method: 'GET'
    })
}

export function CreditPackageCheckNameService(name: string, excludeId?: number) {
    const params: any = { name }
    if (excludeId) params.excludeId = excludeId
    return request<{ exists: boolean }>({
        url: rest.creditPackageCheckName,
        method: 'GET',
        data: params
    })
}

export function CreditPackageCreateService(data: ICreateCreditPackageRequest) {
    return request<ICreditPackage>({
        url: rest.creditPackage,
        method: 'POST',
        data: data
    })
}

export function CreditPackageUpdateService(id: number, data: IUpdateCreditPackageRequest) {
    return request<ICreditPackage>({
        url: rest.creditPackageDetail.replace(':id', id.toString()),
        method: 'PUT',
        data: data
    })
}

export function CreditPackageDeleteService(id: number) {
    return request<any>({
        url: rest.creditPackageDetail.replace(':id', id.toString()),
        method: 'DELETE'
    })
}
