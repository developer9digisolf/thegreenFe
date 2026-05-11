import { IResPagination } from "../common.iface";

export interface IBranchPaymentMethod {
  id: number;
  branchId: number;
  paymentMethodId: number;
  sortOrder: number;
  name: string;
  imageUrl: string | null;
  notes: string | null;
  isActive: boolean;
}

export interface IReqBranchPaymentMethod {
  branchId: number;
  paymentMethodId: number;
  sortOrder: number;
  notes: string | null;
}

export interface IBranchPaymentMethodResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: IBranchPaymentMethod[];
}

export interface IBranchPaymentMethodDetailResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: IBranchPaymentMethod;
}
