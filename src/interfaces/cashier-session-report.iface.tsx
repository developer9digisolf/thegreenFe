import { IResPagination } from "./common.iface";

export interface ICashierSessionReportRequest {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortColumn?: string;
  SortDirection?: string;
  StartDate?: string;
  EndDate?: string;
  BranchId?: number;
}

export interface ICashierSessionReportItem {
  id: number;
  sessionCode: string;
  employeeName: string;
  branchName: string;
  openedAt: string;
  closedAt: string | null;
  openingCash: number;
  expectedClosingCash: number;
  actualClosingCash: number | null;
  cashDifference: number;
  totalSales: number;
  totalSalesAmount: number;
  totalCashReceived: number;
  totalNonCashReceived: number;
  status: string;
}

export interface ICashierSessionReportResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    pageInfo: IResPagination;
    pageData: ICashierSessionReportItem[];
  };
}
