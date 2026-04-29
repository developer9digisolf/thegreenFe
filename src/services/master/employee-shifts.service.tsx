import {
  IReqEmployeeOneTimeShift,
  IReqFormEmployeeOneTimeShift,
  IReqFormEmployeeRecurringShift,
} from "@afx/interfaces/master/employee-shift.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

// --- One-Time Shifts ---

export function GetEmployeeOneTimeShiftsService(data: IReqEmployeeOneTimeShift) {
  return request<any>({
    url: rest.master.employeeOneTimeShifts.index,
    data,
    method: "GET",
  });
}

export function CreateEmployeeOneTimeShiftService(data: IReqFormEmployeeOneTimeShift) {
  return request<any>({
    url: rest.master.employeeOneTimeShifts.create,
    data,
    method: "POST",
  });
}

export function UpdateEmployeeOneTimeShiftService(id: number, data: IReqFormEmployeeOneTimeShift) {
  return request<any>({
    url: rest.master.employeeOneTimeShifts.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteEmployeeOneTimeShiftService(id: number) {
  return request<any>({
    url: rest.master.employeeOneTimeShifts.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}

export function ImportEmployeeOneTimeShiftsService(data: FormData) {
  return request<any>({
    url: rest.master.employeeOneTimeShifts.import,
    data,
    method: "POST",
    bodyType: "formData",
  });
}

// --- Recurring Shifts ---

export function GetEmployeeRecurringShiftsService(employeeId: number) {
  return request<any>({
    url: rest.master.employeeRecurringShifts.byEmployee.replace(":ID", employeeId.toString()),
    method: "GET",
  });
}

export function CreateEmployeeRecurringShiftService(data: IReqFormEmployeeRecurringShift) {
  return request<any>({
    url: rest.master.employeeRecurringShifts.create,
    data,
    method: "POST",
  });
}
