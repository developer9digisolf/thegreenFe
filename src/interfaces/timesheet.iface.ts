// Timesheet Types
export enum TimesheetType {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  DateRange = 4,
}

// Timesheet Request
export interface ITimesheetRequest {
  type: TimesheetType;
  date?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  month?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

// Timesheet Record
export interface ITimesheetRecord {
  id: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  clockInTime: string | null;
  clockOutTime: string | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  totalWorkMinutes: number | null;
  totalBreakMinutes: number | null;
  overtimeMinutes: number | null;
  lateMinutes: number | null;
  earlyDepartureMinutes: number | null;
  status:
    | "present"
    | "absent"
    | "late"
    | "early"
    | "on_leave"
    | "holiday"
    | "pending";
  notes: string | null;
  remarks: string | null;
  isManuallyEdited: boolean;
}

// Daily Summary
export interface IDailySummary {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalOnLeave: number;
  totalHoliday: number;
  totalPending: number;
  totalWorkHours: number;
}

// Daily Record
export interface IDailyRecord {
  date: string;
  records: ITimesheetRecord[];
  dailySummary: IDailySummary;
}

// Summary
export interface ITimesheetSummary {
  totalEmployees: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalOnLeave: number;
  totalHoliday: number;
  totalPending: number;
  totalWorkHours: number;
  totalBreakHours: number;
  totalOvertimeHours: number;
  totalLateHours: number;
}

// Pagination
export interface ITimesheetPagination {
  currentPage: number;
  pageSize: number;
  totalDays: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Timesheet Data
export interface ITimesheetData {
  type: string;
  startDate: string;
  endDate: string;
  year: number | null;
  month: number | null;
  monthName: string | null;
  dailyRecords: IDailyRecord[];
  summary: ITimesheetSummary;
  pagination?: ITimesheetPagination;
}

// API Response
export interface ITimesheetResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: ITimesheetData;
}
