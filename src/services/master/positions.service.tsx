import {
  IReqPosition,
  IReqFormPosition,
} from "@afx/interfaces/master/position.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetPositionsService(data: IReqPosition) {
  return request<any>({
    url: rest.master.positions.index,
    data,
    method: "GET",
  });
}

export function GetPositionService(id: number) {
  return request<any>({
    url: rest.master.positions.show.replace(":ID", id.toString()),
    method: "GET",
  });
}

export function CreatePositionService(data: IReqFormPosition) {
  return request<any>({
    url: rest.master.positions.create,
    data,
    method: "POST",
  });
}

export function UpdatePositionService(id: number, data: IReqFormPosition) {
  return request<any>({
    url: rest.master.positions.update.replace(":ID", id.toString()),
    data,
    method: "PUT",
  });
}

export function DeletePositionService(id: number) {
  return request<any>({
    url: rest.master.positions.delete.replace(":ID", id.toString()),
    method: "DELETE",
  });
}
