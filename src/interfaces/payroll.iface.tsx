export interface IPayrollPeriod {
  id: number;
  periodCode: string;
  companyId: number;
  periodName: string;
  startDate: string;
  endDate: string;
  frequency: string;
  status: string;
  description: string;
  totalEmployees: number;
  totalSessions: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  calculatedAt: string | null;
  calculatedBy: number | null;
  calculatedByName: string | null;
  approvedAt: string | null;
  approvedBy: number | null;
  approvedByName: string | null;
  paidAt: string | null;
  paidBy: number | null;
  paidByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPayrollPeriodPaginationRequest {
  page: number;
  pageSize: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: string;
}

export interface IPayrollPeriodResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: {
      lastPage: number;
      currentPage: number;
      path: string;
      total: number;
      pageSize: number;
    };
    pageData: IPayrollPeriod[];
  };
}

export interface ICreatePayrollPeriodRequest {
  PeriodCode: string;
  periodName: string;
  startDate: string;
  endDate: string;
  frequency: number;
  description: string;
}

export interface IPayrollCalculation {
  id: number;
  payrollPeriodId: number;
  payrollPeriodCode: string;
  employeeId: number;
  employeeName: string;
  sessionId: number;
  sessionCode: string;
  baseCommission: number;
  bonusAmount: number;
  penaltyAmount: number;
  overtimeAmount: number;
  otherAdjustments: number;
  totalAmount: number;
  commissionRate: number;
  servicePrice: number;
  amountReceived: number;
  sessionDate: string;
  sessionStatus: string;
  customerRating: number | null;
  sessionDuration: number;
  status: string;
  isPaid: boolean;
  paidAt: string | null;
  payslipId: number | null;
  payslipCode: string | null;
  notes: string;
  adjustmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPayrollCalculationPaginationRequest {
  page: number;
  pageSize: number;
  sortColumn?: string;
  sortDirection?: string;
  search?: string;
}

export interface IUpdatePayrollCalculationRequest {
  baseCommission: number;
  bonusAmount: number;
  penaltyAmount: number;
  overtimeAmount: number;
  otherAdjustments: number;
  notes: string;
  adjustmentNotes: string;
}

export interface IPayrollCalculationResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: {
      lastPage: number;
      currentPage: number;
      path: string;
      total: number;
      pageSize: number;
    };
    pageData: IPayrollEmployeeCalculation[];
  };
}

export interface IPayrollEmployeeCalculation {
  employeeId: number;
  employeeName: string;
  totalSessions: number;
  totalAmount: number;
  totalBaseCommission: number;
  totalBonusAmount: number;
  totalPenaltyAmount: number;
  totalOvertimeAmount: number;
  totalOtherAdjustments: number;
  approvedCount: number;
  pendingCount: number;
  paidCount: number;
  isAllPaid: boolean;
  earliestSessionDate: string;
  latestSessionDate: string;
  calculations: IPayrollCalculation[];
}
