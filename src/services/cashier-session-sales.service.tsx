import {
  ICashierSessionSalesRequest,
  ICashierSessionSalesItem,
} from "@afx/interfaces/cashier-session-sales.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function getCashierSessionSales(params: ICashierSessionSalesRequest) {
  return request<ICashierSessionSalesItem[]>({
    url: rest.cashierSessionReportSales,
    data: params,
    method: "GET",
  });
}

export function exportCashierSessionSales(params: ICashierSessionSalesRequest) {
  return request<Blob>({
    url: rest.cashierSessionReportSalesExport,
    data: params,
    method: "GET",
    responseType: "blob",
  });
}
