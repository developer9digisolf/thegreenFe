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
  IPayslip,
  IPayslipPaginationRequest,
  IPayslipResponse,
  IUpdatePayslipStatusRequest,
  IUpdatePayslipRequest,
} from "@afx/interfaces/payroll.iface";
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

export function GetPayslipsService(params: IPayslipPaginationRequest) {
  return request<IPayslip[]>({
    url: "/payslips",
    method: "GET",
    data: params,
  });
}

export function GetPayslipByIdService(id: number) {
  return request<IPayslip>({
    url: `/payslips/${id}`,
    method: "GET",
  });
}

export function UpdatePayslipStatusService(
  id: number,
  data: IUpdatePayslipStatusRequest,
) {
  return request<IPayslip>({
    url: `/payslips/${id}/status`,
    method: "PATCH",
    data: data,
  });
}

export function UpdatePayslipService(id: number, data: IUpdatePayslipRequest) {
  return request<IPayslip>({
    url: `/payslips/${id}`,
    method: "PUT",
    data: data,
  });
}
