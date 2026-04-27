import {
  IReqCompany,
  IReqFormCompany,
} from "@afx/interfaces/master/company.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetCompaniesServie(data: IReqCompany) {
  return request<any>({
    url: rest.master.companies.index,
    data,
    method: "GET",
  });
}
export function GetCompanyServie(id: number) {
  return request<any>({
    url: rest.master.companies.show.replace(":ID", id.toString()),
    method: "GET",
  });
}
export function CreateCompanyServie(data: IReqFormCompany) {
  return request<any>({
    url: rest.master.companies.create,
    data,
    method: "POST",
  });
}
export function UpdateCompanyServie(id: number, data: IReqFormCompany) {
  return request<any>({
    url: rest.master.companies.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}
export function DeleteCompanyServie(id: number) {
  return request<any>({
    url: rest.master.companies.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
