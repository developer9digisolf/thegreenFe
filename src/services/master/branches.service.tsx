import {
  IReqBranch,
  IReqFormBranch,
} from "@afx/interfaces/master/branch.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetBranchesService(data: IReqBranch) {
  return request<any>({
    url: rest.master.branches.index,
    data,
    method: "GET",
  });
}

export function GetBranchService(id: number) {
  return request<any>({
    url: rest.master.branches.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreateBranchService(data: IReqFormBranch) {
  return request<any>({
    url: rest.master.branches.create,
    data,
    method: "POST",
  });
}

export function UpdateBranchService(id: number, data: IReqFormBranch) {
  return request<any>({
    url: rest.master.branches.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeleteBranchService(id: number) {
  return request<any>({
    url: rest.master.branches.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
