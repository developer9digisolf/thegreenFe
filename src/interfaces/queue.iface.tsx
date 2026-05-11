export type QueueStatus = "waiting" | "do treatment";

export interface TherapistQueue {
  id: number;
  employeeName: string;
  position: string;
  dateTime: string;
  status: QueueStatus;
}

export interface Branch {
  id: number;
  name: string;
  code: string;
  city: string;
  province?: string;
  isMainBranch?: boolean;
}

export interface TherapistAPIResponse {
  id: number;
  branchId: number;
  branchName: string;
  employeeName: string;
  position: string;
  attendanceDate: string;
  clockInTime: string;
  profilePhotoUrl: string;
  status: string;
}

export interface GetBranchesParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortColumn?: string;
  SortDirection?: string;
}

export interface TherapistsResponse {
  success: boolean;
  message: string;
  data: TherapistAPIResponse[];
  meta?: any;
}
