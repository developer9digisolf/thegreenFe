import {
  IReqEmployee,
  IReqFormEmployee,
} from "@afx/interfaces/master/employee.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetEmployeesService(data: IReqEmployee) {
  return request<any>({
    url: rest.master.employees.index,
    data,
    method: "GET",
  });
}

export function GetEmployeeService(id: number) {
  return request<any>({
    url: rest.master.employees.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateEmployeeService(data: IReqFormEmployee) {
  return request<any>({
    url: rest.master.employees.create,
    data,
    method: "POST",
  });
}

export function UpdateEmployeeService(id: number, data: IReqFormEmployee) {
  return request<any>({
    url: rest.master.employees.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteEmployeeService(id: number) {
  return request<any>({
    url: rest.master.employees.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
