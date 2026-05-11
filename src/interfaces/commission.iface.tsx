import { IResPagination } from "./common.iface";

export type DateFilterType = "Day" | "Week" | "Month" | "Custom";

export interface ICommissionFilterRequest {
  Page?: number;
  PageSize?: number;
  Search?: string;
  DateFilterType?: DateFilterType;
  Date?: string;
  Year?: number;
  Month?: number;
  Week?: number;
  StartDate?: string;
  EndDate?: string;
  EmployeeId?: number | string;
  PositionId?: number | string;
  DepartmentId?: number | string;
  IsPaid?: boolean;
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
