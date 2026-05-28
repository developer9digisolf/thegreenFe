import { 
  IBranchAdditionalCostPayload 
} from "@afx/interfaces/master/branch-additional-cost.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetBranchAdditionalCostsService(branchId: number, page: number = 1, pageSize: number = 100) {
  return request<any>({
    url: rest.master.branchAdditionalCosts.index.replace(":branchId", branchId.toString()),
    data: { 
      Page: page, 
      PageSize: pageSize, 
      SortColumn: "createdat", 
      SortDirection: "desc" 
    },
    method: "GET",
  });
}

export function GetBranchAdditionalCostDetailService(id: number, branchId: number) {
  return request<any>({
    url: rest.master.branchAdditionalCosts.show.replace(":ID", id.toString()),
    data: { branchId },
    method: "GET",
  });
}

export function CreateBranchAdditionalCostService(branchId: number, data: IBranchAdditionalCostPayload) {
  return request<any>({
    url: rest.master.branchAdditionalCosts.create.replace(":branchId", branchId.toString()),
    data,
    method: "POST",
  });
}

export function UpdateBranchAdditionalCostService(id: number, branchId: number, data: Partial<IBranchAdditionalCostPayload>) {
  let url = rest.master.branchAdditionalCosts.update
    .replace(":ID", id.toString())
    .replace(":branchId", branchId.toString());

  return request<any>({
    url,
    data,
    method: "PUT",
  });
}

export function DeleteBranchAdditionalCostService(id: number, branchId: number) {
  let url = rest.master.branchAdditionalCosts.delete
    .replace(":ID", id.toString())
    .replace(":branchId", branchId.toString());

  return request<any>({
    url,
    method: "DELETE",
  });
}

export function GetMasterAdditionalCostsService() {
  return request<any>({
    url: rest.master.additionalCosts.active,
    method: "GET",
  });
}