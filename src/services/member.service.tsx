import {
  IMember,
  IMemberDetail,
  ICreateMemberRequest,
  IUpdateMemberRequest,
  IMemberPaginationRequest,
  IServicePackagesApiResponse,
  IServicePackage,
} from "@afx/interfaces/member.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetMembersService(params: IMemberPaginationRequest) {
  return request<IMember[]>({
    url: rest.member,
    method: "GET",
    data: params,
  });
}

export function GetActiveMembersService() {
  return request<IMember[]>({
    url: rest.memberActive,
    method: "GET",
  });
}

export function GetMemberByIdService(id: number) {
  return request<IMember>({
    url: rest.memberDetail.replace(":id", String(id)),
    method: "GET",
  });
}

export function GetMemberDetailService(id: number) {
  return request<IMemberDetail>({
    url: rest.memberDetailFull.replace(":id", String(id)),
    method: "GET",
  });
}

export function CreateMemberService(data: ICreateMemberRequest) {
  return request<IMember>({
    url: rest.member,
    method: "POST",
    data: data,
  });
}

export function UpdateMemberService(id: number, data: IUpdateMemberRequest) {
  return request<IMember>({
    url: rest.memberDetail.replace(":id", String(id)),
    method: "PUT",
    data: data,
  });
}

export function DeleteMemberService(id: number) {
  return request<any>({
    url: rest.memberDetail.replace(":id", String(id)),
    method: "DELETE",
  });
}

export function CheckMemberPhoneService(phone: string, excludeId?: number) {
  return request<{ exists: boolean }>({
    url: rest.memberCheckPhone,
    method: "GET",
    data: { phone, excludeId },
  });
}

export function CheckMemberEmailService(email: string, excludeId?: number) {
  return request<{ exists: boolean }>({
    url: rest.memberCheckEmail,
    method: "GET",
    data: { email, excludeId },
  });
}

export function GetMemberServicePackagesService(
  memberId: number,
  params: { page?: number; pageSize?: number; search?: string },
) {
  return request<IServicePackagesApiResponse>({
    url: rest.memberServicePackages.replace(":id", String(memberId)),
    method: "GET",
    data: params,
  });
}
