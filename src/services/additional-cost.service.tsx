import {
  IAdditionalCost,
  IAdditionalCostDetail,
  ICreateAdditionalCostRequest,
  IUpdateAdditionalCostRequest,
} from "@afx/interfaces/additional-cost.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

// ============================================
// ADDITIONAL COST CRUD
// ============================================

export function AdditionalCostGetAllService(params?: any) {
  return request<IAdditionalCost[]>({
    url: rest.master.additionalCosts.index,
    method: "GET",
    data: params,
  });
}

export function AdditionalCostGetByIdService(id: number) {
  return request<IAdditionalCost>({
    url: rest.master.additionalCosts.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function AdditionalCostGetDetailService(id: number) {
  return request<IAdditionalCostDetail>({
    url: rest.master.additionalCosts.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function AdditionalCostCreateService(
  data: ICreateAdditionalCostRequest,
) {
  return request<IAdditionalCostDetail>({
    url: rest.master.additionalCosts.create,
    method: "POST",
    data: data,
  });
}

export function AdditionalCostUpdateService(
  id: number,
  data: IUpdateAdditionalCostRequest,
) {
  return request<IAdditionalCost>({
    url: rest.master.additionalCosts.update.replace(":ID", id.toString()),
    method: "PUT",
    data: data,
  });
}

export function AdditionalCostDeleteService(id: number) {
  return request<any>({
    url: rest.master.additionalCosts.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
