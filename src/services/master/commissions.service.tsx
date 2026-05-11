import { 
  ICommissionByEmployeeResponse, 
  ICommissionFilterRequest, 
  ICommissionSessionResponse 
} from "@afx/interfaces/commission.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function getCommissionsByEmployee(params: ICommissionFilterRequest) {
  return request<ICommissionByEmployeeResponse>({
    url: rest.master.commissions.byEmployee,
    data: params,
    method: "GET",
  });
}

export function getCommissionSessions(params: ICommissionFilterRequest) {
  return request<ICommissionSessionResponse>({
    url: rest.master.commissions.sessions,
    data: params,
    method: "GET",
  });
}

export function exportCommissionsExcel(params: ICommissionFilterRequest) {
  return request<Blob>({
    url: rest.master.commissions.export,
    data: params,
    method: "GET",
    responseType: "blob",
  });
}
