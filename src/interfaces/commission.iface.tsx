import { IResPagination } from "./common.iface";

export type DateFilterType = "Day" | "Week" | "Month" | "Custom";

export interface ICommissionFilterRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  dateFilterType?: DateFilterType;
  date?: string;
  year?: number;
  month?: number;
  week?: number;
  startDate?: string;
  endDate?: string;
  employeeId?: number | string;
  positionId?: number | string;
  departmentId?: number | string;
  isPaid?: boolean;
}

export interface ICommissionByEmployee {
  id: number;
  name: string;
  positionName: string;
  commissionAmount: number;
  bonusAmount: number;
  totalAmount: number;
  sessionCount: number;
}

export interface ICommissionSession {
  id: number;
  sessionCode: string;
  sessionDate: string;
  scheduledTime: string;
  memberName: string;
  serviceName: string;
  serviceVariantName: string;
  price: number;
  commissionAmount: number;
  commissionBonus: number;
  totalCommission: number;
  commissionIsPaid: boolean;
  status: string;
}

export interface ICommissionByEmployeeResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: IResPagination;
    pageData: ICommissionByEmployee[];
  };
}

export interface ICommissionSessionResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: IResPagination;
    pageData: ICommissionSession[];
  };
}
