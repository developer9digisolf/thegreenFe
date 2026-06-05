import { IResPagination } from "./common.iface";

export interface ICashierSessionSalesRequest {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortColumn?: string;
  SortDirection?: string;
  SessionCode: string;
}

export interface ICashierSessionSalesItem {
  id: number;
  saleCode: string;
  saleType: string;
  saleTypeName: string;
  cashierSessionId: number;
  sessionCode: string;
  memberId: number | null;
  memberName: string | null;
  memberPhone: string | null;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  changeAmount: number;
  paymentStatus: string;
  paymentStatusName: string;
  saleDate: string;
  itemCount: number;
  paymentMethods: string[];
  notes: string;
  createdAt: string;
}

export interface ICashierSessionSalesResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    pageInfo: IResPagination;
    pageData: ICashierSessionSalesItem[];
  };
}
