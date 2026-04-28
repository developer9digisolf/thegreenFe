import {
  IReqCompany,
  IReqFormCompany,
} from "@afx/interfaces/master/company.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetCompaniesService(data: IReqCompany) {
  return request<any>({
    url: rest.master.companies.index,
    data,
    method: "GET",
  });
}
export function GetCompanyService(id: number) {
  return request<any>({
    url: rest.master.companies.show.replace(":ID", id.toString()),
    method: "GET",
  });
}
export function CreateCompanyService(data: IReqFormCompany) {
  return request<any>({
    url: rest.master.companies.create,
    data,
    method: "POST",
  });
}
export function UpdateCompanyService(id: number, data: IReqFormCompany) {
  return request<any>({
    url: rest.master.companies.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}
export function DeleteCompanyService(id: number) {
  return request<any>({
    url: rest.master.companies.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
