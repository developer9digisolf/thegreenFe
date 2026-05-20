import {
  IPayrollPeriod,
  IPayrollPeriodPaginationRequest,
  ICreatePayrollPeriodRequest,
  IPayrollCalculation,
  IPayrollCalculationPaginationRequest,
  IPayrollCalculationResponse,
  IPayrollEmployeeCalculation,
  IUpdatePayrollCalculationRequest,
  IUpdatePayrollStatusRequest,
} from "@afx/interfaces/payroll.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetPayrollPeriodsService(
  params: IPayrollPeriodPaginationRequest,
) {
  return request<IPayrollPeriod[]>({
    url: "/payroll-periods",
    method: "GET",
    data: params,
  });
}

export function CreatePayrollPeriodService(data: ICreatePayrollPeriodRequest) {
  return request<IPayrollPeriod>({
    url: "/payroll-periods",
    method: "POST",
    data: data,
  });
}

export function GetPayrollPeriodByCodeService(code: string) {
  return request<IPayrollPeriod>({
    url: `/payroll-periods/code/${code}`,
    method: "GET",
  });
}

export function UpdatePayrollPeriodService(
  id: number,
  data: ICreatePayrollPeriodRequest,
) {
  return request<IPayrollPeriod>({
    url: `/payroll-periods/${id}`,
    method: "PUT",
    data: data,
  });
}

export function DeletePayrollPeriodService(id: number) {
  return request<IPayrollPeriod>({
    url: `/payroll-periods/${id}`,
    method: "DELETE",
  });
}

export function GetPayrollCalculationsService(
  code: string,
  params: IPayrollCalculationPaginationRequest,
) {
  return request<IPayrollCalculationResponse>({
    url: `/payroll-periods/${code}/calculations`,
    method: "GET",
    data: params,
  });
}

export function UpdatePayrollCalculationService(
  id: number,
  data: IUpdatePayrollCalculationRequest,
) {
  return request<IPayrollCalculation>({
    url: `/payroll-calculations/${id}`,
    method: "PUT",
    data: data,
  });
}

export function UpdatePayrollPeriodStatusService(
  id: number,
  data: IUpdatePayrollStatusRequest,
) {
  return request<IPayrollPeriod>({
    url: `/payroll-periods/${id}/status`,
    method: "PATCH",
    data: data,
  });
}
