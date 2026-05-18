import {
  ITimesheetRequest,
  ITimesheetResponse,
} from "@afx/interfaces/timesheet.iface";
import { rest } from "@afx/utils/config.rest";
import request from "@afx/utils/request.utils";

export function GetTimesheetService(data: ITimesheetRequest) {
  return request<ITimesheetResponse>({
    url: rest.master.attendance.timesheets,
    data,
    method: "GET",
  });
}
