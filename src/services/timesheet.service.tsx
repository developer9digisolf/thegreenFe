import {
  ITimesheetRequest,
  ITimesheetResponse,
} from "@afx/interfaces/timesheet.iface";
import request from "@afx/utils/request.utils";

export function GetTimesheetService(data: ITimesheetRequest) {
  // Build query parameters
  const params: Record<string, string> = {};

  if (data.monthYear) {
    params.MonthYear = data.monthYear;
  }
  if (data.page !== undefined) {
    params.Page = data.page.toString();
  }
  if (data.pageSize !== undefined) {
    params.PageSize = data.pageSize.toString();
  }
  if (data.search !== undefined) {
    params.Search = data.search;
  }

  return request<ITimesheetResponse>({
    url: "/attendance/timesheets",
    method: "GET",
    data: params,
  });
}
