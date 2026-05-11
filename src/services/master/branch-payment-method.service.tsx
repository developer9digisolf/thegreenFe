import { 
  IBranchPaymentMethodResponse, 
  IBranchPaymentMethodDetailResponse, 
  IReqBranchPaymentMethod 
} from "@afx/interfaces/master/branch-payment-method.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetBranchPaymentMethodsService(branchId: number) {
  return request<IBranchPaymentMethodResponse>({
    url: rest.master.branchPaymentMethods.index,
    data: { branchId },
    method: "GET",
  });
}

export function GetBranchPaymentMethodService(id: number) {
  return request<IBranchPaymentMethodDetailResponse>({
    url: rest.master.branchPaymentMethods.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateBranchPaymentMethodService(data: IReqBranchPaymentMethod) {
  return request<any>({
    url: rest.master.branchPaymentMethods.create,
    data,
    method: "POST",
  });
}

export function UpdateBranchPaymentMethodService(id: number, data: Partial<IReqBranchPaymentMethod>) {
  return request<any>({
    url: rest.master.branchPaymentMethods.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteBranchPaymentMethodService(id: number) {
  return request<any>({
    url: rest.master.branchPaymentMethods.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}

export function ToggleBranchPaymentMethodStatusService(id: number) {
  return request<any>({
    url: rest.master.branchPaymentMethods.toggleStatus.replace(":ID", id.toString()),
    method: "PATCH",
  });
}
