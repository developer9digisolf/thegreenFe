import {
  IReqPromoBanner,
  CreatePromoBannerRequest,
  UpdatePromoBannerRequest,
} from "@afx/interfaces/promo-banner.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";
import { GetServicePackagesService } from "@afx/services/master/service-packages.service";
import { CreditPackageGetAllService } from "@afx/services/credit-package.service";
import { IReqServicePackage } from "@afx/interfaces/service-package.iface";

export function GetPromoBannersService(data: IReqPromoBanner) {
  return request<any>({
    url: rest.master.promoBanners.index,
    data,
    method: "GET",
  });
}

export function GetPromoBannerService(id: number) {
  return request<any>({
    url: rest.master.promoBanners.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreatePromoBannerService(data: CreatePromoBannerRequest) {
  return request<any>({
    url: rest.master.promoBanners.create,
    data,
    method: "POST",
  });
}

export function UpdatePromoBannerService(
  id: number,
  data: UpdatePromoBannerRequest,
) {
  return request<any>({
    url: rest.master.promoBanners.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeletePromoBannerService(id: number) {
  return request<any>({
    url: rest.master.promoBanners.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}

export function UploadPromoBannerImageService(file: File) {
  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("FolderPath", "promo-banners");

  return request<any>({
    url: rest.imageUpload,
    data: formData,
    method: "POST",
    bodyType: "formData",
  });
}

// Services for fetching master data for dropdowns
export function GetActivePackagesService(params?: IReqServicePackage) {
  const defaultParams: IReqServicePackage = {
    Page: 1,
    PageSize: 100,
  };
  return GetServicePackagesService(params || defaultParams);
}

export function GetActiveCreditPackagesService() {
  return CreditPackageGetAllService();
}
