import {
  IReqServicePackage,
  ICreateServicePackageRequest,
  IUpdateServicePackageRequest,
} from "@afx/interfaces/service-package.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetServicePackagesService(data: IReqServicePackage) {
  return request<any>({
    url: rest.master.servicePackages.index,
    data,
    method: "GET",
  });
}

export function GetServicePackageService(id: number) {
  return request<any>({
    url: rest.master.servicePackages.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateServicePackageService(data: ICreateServicePackageRequest) {
  return request<any>({
    url: rest.master.servicePackages.create,
    data,
    method: "POST",
  });
}

export function UpdateServicePackageService(id: number, data: IUpdateServicePackageRequest) {
  return request<any>({
    url: rest.master.servicePackages.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteServicePackageService(id: number) {
  return request<any>({
    url: rest.master.servicePackages.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
