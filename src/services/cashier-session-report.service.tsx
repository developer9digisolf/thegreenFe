import {
  ICashierSessionReportRequest,
  ICashierSessionReportItem,
} from "@afx/interfaces/cashier-session-report.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function getCashierSessionReports(params: ICashierSessionReportRequest) {
  return request<ICashierSessionReportItem[]>({
    url: rest.cashierSessionReport,
    data: params,
    method: "GET",
  });
}

export function exportCashierSessionReports(
  params: ICashierSessionReportRequest,
) {
  return request<Blob>({
    url: rest.cashierSessionReport + "/export",
    data: params,
    method: "GET",
    responseType: "blob",
  });
}
