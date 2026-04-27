export interface IResBranchOperatingHour {
  id: number;
  branchId: number;
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormBranchOperatingHour {
  branchId: number;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
  breakStartTime: string | null;
  breakEndTime: string | null;
}

export interface IPropsBranchOperatingHours {
  branchId: number;
  onClose: () => void;
}
