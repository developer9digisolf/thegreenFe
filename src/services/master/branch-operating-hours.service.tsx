import {
  IReqFormBranchOperatingHour,
} from "@afx/interfaces/master/branch-operating-hours.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetBranchOperatingHoursService(branchId: number) {
  return request<any>({
    url: rest.master.branchOperatingHours.byBranch.replace(":ID", branchId.toString()),
    method: "GET",
  });
}

export function CreateBranchOperatingHourService(data: IReqFormBranchOperatingHour) {
  return request<any>({
    url: rest.master.branchOperatingHours.create,
    data,
    method: "POST",
  });
}

export function UpdateBranchOperatingHourService(id: number, data: IReqFormBranchOperatingHour) {
  return request<any>({
    url: rest.master.branchOperatingHours.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}
