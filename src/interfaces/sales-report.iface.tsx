import { IResPagination } from "./common.iface";

export interface ISalesPaidRequest {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ISalePaidItem {
  id: number;
  saleCode: string;
  saleType: string;
  saleTypeName: string;
  cashierSessionId: number;
  sessionCode: string;
  memberId: number;
  memberName: string;
  memberPhone: string;
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
  notes: string | null;
  createdAt: string;
}

export interface ISalesPaidResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: IResPagination;
    pageData: ISalePaidItem[];
  };
}
