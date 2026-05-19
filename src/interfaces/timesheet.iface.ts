// Timesheet Types
export enum TimesheetType {
  Daily = 1,
  Weekly = 2,
  Monthly = 3,
  DateRange = 4,
}

// Timesheet Request
export interface ITimesheetRequest {
  monthYear?: string; // Format: MM-YYYY (e.g., "05-2026")
  page?: number;
  pageSize?: number;
  search?: string;
}

// Daily Attendance Record
export interface IDailyAttendance {
  date: string;
  attendanceId: number;
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

// Monthly Summary
export interface IMonthlySummary {
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
  totalEarlyDepartureHours: number;
}

// Page Info
export interface IPageInfo {
  lastPage: number;
  currentPage: number;
  path: string;
  total: number;
  pageSize: number;
}

// Employee Timesheet
export interface IEmployeeTimesheet {
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  department: string;
  position: string;
  dailyAttendances: IDailyAttendance[];
  monthlySummary: IMonthlySummary;
}

// Timesheet Data
export interface ITimesheetData {
  pageInfo: IPageInfo;
  pageData: IEmployeeTimesheet[];
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
