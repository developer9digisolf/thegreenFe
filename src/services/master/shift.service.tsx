import { 
    IReqShift, 
    IResShift, 
    IReqFormShift 
} from "@afx/interfaces/master/shift.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetShiftsService(data: IReqShift) {
    return request<IResShift[]>({
        url: rest.master.shifts.index,
        data,
        method: "GET",
    });
}

export function GetShiftService(id: number) {
    return request<IResShift>({
        url: rest.master.shifts.show.replace(":ID", id.toString()),
        method: "GET",
    });
}

export function CreateShiftService(data: IReqFormShift) {
    return request<IResShift>({
        url: rest.master.shifts.create,
        data,
        method: "POST",
    });
}

export function UpdateShiftService(id: number, data: IReqFormShift) {
    return request<IResShift>({
        url: rest.master.shifts.update.replace(":ID", id.toString()),
        data,
        method: "PUT",
    });
}

export function DeleteShiftService(id: number) {
    return request<any>({
        url: rest.master.shifts.delete.replace(":ID", id.toString()),
        method: "DELETE",
    });
}
