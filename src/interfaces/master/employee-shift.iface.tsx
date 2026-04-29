import { IResPagination } from "../common.iface";
import { IResShift } from "./shift.iface";

// --- One-Time Shifts ---

export interface IReqEmployeeOneTimeShift {
  employeeId?: number;
  page?: number;
  pageSize?: number;
  search?: string;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
}

export interface IReqFormEmployeeOneTimeShift {
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
}

export interface IResEmployeeOneTimeShift {
  id: number;
  employeeId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  createdAt: string;
  updatedAt: string;
}

// --- Recurring Shifts ---

export interface IResEmployeeRecurringShift {
  id: number;
  employeeId: number;
  dayOfWeek: number;
  shiftId: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  shift: IResShift | null;
}

export interface IReqFormEmployeeRecurringShift {
  employeeId: number;
  dayOfWeek: number;
  shiftId: number | null;
  notes?: string | null;
}
