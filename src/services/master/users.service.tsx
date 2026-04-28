import {
  IReqUser,
  IReqFormUser,
} from "@afx/interfaces/master/user.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetUsersService(data: IReqUser) {
  return request<any>({
    url: rest.master.users.index,
    data,
    method: "GET",
  });
}

export function GetUserService(id: number) {
  return request<any>({
    url: rest.master.users.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateUserService(data: IReqFormUser) {
  return request<any>({
    url: rest.master.users.create,
    data,
    method: "POST",
  });
}

export function UpdateUserService(id: number, data: IReqFormUser) {
  return request<any>({
    url: rest.master.users.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteUserService(id: number) {
  return request<any>({
    url: rest.master.users.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}

export function GetEmployeesService(params: any) {
  return request<any>({
    url: rest.master.employees.index,
    data: params,
    method: "GET",
  });
}

export function GetUserCompaniesService(userId: number) {
  return request<any>({
    url: rest.master.userHasCompanies.index,
    data: { userId },
    method: "GET",
  });
}

export function CreateUserCompanyService(data: { userId: number, companyId: number, isActive: boolean }) {
  return request<any>({
    url: rest.master.userHasCompanies.index,
    data,
    method: "POST",
  });
}

export function DeleteUserCompanyService(id: number) {
  return request<any>({
    url: rest.master.userHasCompanies.detail.replace(":ID", id.toString()),
    method: "DELETE",
  });
}

export function GetUserBranchesService(userId: number) {
  return request<any>({
    url: rest.master.userHasBranches.index,
    data: { userId },
    method: "GET",
  });
}

export function CreateUserBranchService(data: { userId: number, branchId: number, isActive: boolean }) {
  return request<any>({
    url: rest.master.userHasBranches.index,
    data,
    method: "POST",
  });
}

export function UpdateUserBranchService(id: number, data: { isActive: boolean }) {
  return request<any>({
    url: rest.master.userHasBranches.detail.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteUserBranchService(id: number) {
  return request<any>({
    url: rest.master.userHasBranches.detail.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
