import { IPackage, ICreatePackageRequest, IUpdatePackageRequest } from '@afx/interfaces/package.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function PackageGetAllService(params?: any) {
    return request<IPackage[]>({
        url: rest.package,
        method: 'GET',
        data: params
    })
}

export function PackageGetActiveService() {
    return request<IPackage[]>({
        url: rest.packageActive,
        method: 'GET'
    })
}

export function PackageGetByIdService(id: number) {
    return request<IPackage>({
        url: rest.packageDetail.replace(':id', id.toString()),
        method: 'GET'
    })
}

export function PackageCheckNameService(name: string, excludeId?: number) {
    const params: any = { name }
    if (excludeId) params.excludeId = excludeId
    return request<{ exists: boolean }>({
        url: rest.packageCheckName,
        method: 'GET',
        data: params
    })
}

export function PackageCreateService(data: ICreatePackageRequest) {
    return request<IPackage>({
        url: rest.package,
        method: 'POST',
        data: data
    })
}

export function PackageUpdateService(id: number, data: IUpdatePackageRequest) {
    return request<IPackage>({
        url: rest.packageDetail.replace(':id', id.toString()),
        method: 'PUT',
        data: data
    })
}

export function PackageDeleteService(id: number) {
    return request<any>({
        url: rest.packageDetail.replace(':id', id.toString()),
        method: 'DELETE'
    })
}
