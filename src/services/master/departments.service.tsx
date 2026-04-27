import {
  IReqDepartment,
  IReqFormDepartment,
} from "@afx/interfaces/master/department.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetDepartmentsService(data: IReqDepartment) {
  return request<any>({
    url: rest.master.departments.index,
    data,
    method: "GET",
  });
}

export function GetDepartmentService(id: number) {
  return request<any>({
    url: rest.master.departments.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateDepartmentService(data: IReqFormDepartment) {
  return request<any>({
    url: rest.master.departments.create,
    data,
    method: "POST",
  });
}

export function UpdateDepartmentService(id: number, data: IReqFormDepartment) {
  return request<any>({
    url: rest.master.departments.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteDepartmentService(id: number) {
  return request<any>({
    url: rest.master.departments.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
