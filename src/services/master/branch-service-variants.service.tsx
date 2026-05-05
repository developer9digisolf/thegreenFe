import { 
    IBranchServiceVariant, 
    ICreateBranchServiceVariantRequest, 
    IUpdateBranchServiceVariantRequest 
} from "@afx/interfaces/service.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function BranchServiceVariantGetAllService(params?: any) {
    return request<IBranchServiceVariant[]>({
        url: rest.master.branchServiceVariants.index,
        method: "GET",
        data: params
    });
}

export function BranchServiceVariantGetByIdService(id: number) {
    return request<IBranchServiceVariant[]>({
        url: rest.master.branchServiceVariants.show.replace(":ID", id.toString()),
        method: "GET"
    });
}

export function BranchServiceVariantCreateService(data: ICreateBranchServiceVariantRequest) {
    return request<IBranchServiceVariant>({
        url: rest.master.branchServiceVariants.create,
        method: "POST",
        data: data
    });
}

export function BranchServiceVariantUpdateService(id: number, data: IUpdateBranchServiceVariantRequest) {
    return request<IBranchServiceVariant>({
        url: rest.master.branchServiceVariants.update.replace(":ID", id.toString()),
        method: "PUT",
        data: data
    });
}

export function BranchServiceVariantDeleteService(id: number) {
    return request<any>({
        url: rest.master.branchServiceVariants.delete.replace(":ID", id.toString()),
        method: "DELETE"
    });
}
