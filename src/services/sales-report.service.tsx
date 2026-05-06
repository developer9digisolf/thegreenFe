import { 
  ISalesPaidRequest, 
  ISalesPaidResponse 
} from "@afx/interfaces/sales-report.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function getSalesPaid(params: ISalesPaidRequest) {
  return request<ISalesPaidResponse>({
    url: rest.salesPaid,
    params,
    method: "GET",
  });
}

export function exportSalesExcel(params: ISalesPaidRequest) {
  return request<Blob>({
    url: rest.salesExport,
    params,
    method: "GET",
    responseType: "blob",
  });
}
