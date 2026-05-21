export type MemberStatus =
  | "Pending"
  | "Active"
  | "Inactive"
  | "Blocked"
  | number;
export type GenderType = "Male" | "Female" | number;

export const MemberStatusMap: Record<number, string> = {
  0: "Pending",
  1: "Active",
  2: "Inactive",
  3: "Blocked",
};

export const GenderMap: Record<number, string> = {
  0: "Male",
  1: "Female",
};

export function getMemberStatusName(status: MemberStatus): string {
  if (typeof status === "number") {
    return MemberStatusMap[status] || "Unknown";
  }
  return status;
}

export function getGenderName(gender: GenderType | null | undefined): string {
  if (gender === null || gender === undefined) return "-";
  if (typeof gender === "number") {
    return GenderMap[gender] || "-";
  }
  return gender;
}

export interface IMember {
  id: number;
  code: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gender?: GenderType;
  genderDisplay?: string;
  birthDate?: string;
  joinDate: string;
  status: MemberStatus;
  statusDisplay?: string;
  notes?: string;
  creditBalance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface IMemberDetail extends IMember {
  bodyPreferences: string[];
  totalSessions: number;
  totalVouchers: number;
  totalSpent: number;
}

export interface ICreateMemberRequest {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  gender?: number;
  birthDate?: string;
  notes?: string;
}

export interface IUpdateMemberRequest {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  gender?: number;
  birthDate?: string;
  status?: number;
  notes?: string;
}

export interface IMemberPaginationRequest {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  sortColumn?: string;
  sortDirection?: string;
}

// Service Package Voucher interfaces
export interface IPackageRule {
  id: number;
  entityId: number;
  entityType: string;
  name: string;
}

export interface IPackageVoucher {
  guid: string;
  voucherCode: string;
  status: string;
  usedAt: string | null;
}

export interface IServicePackage {
  id: number;
  name: string;
  description: string;
  serviceName: string;
  validFrom: string;
  validTo: string;
  totalSession: number;
  usedSession: number;
  packageRules: IPackageRule[];
  packageVouchers: IPackageVoucher[];
}

export interface IServicePackagePageInfo {
  lastPage: number;
  currentPage: number;
  path: string;
  total: number;
  pageSize: number;
}

export interface IServicePackageResponse {
  pageInfo: IServicePackagePageInfo;
  pageData: IServicePackage[];
}

export interface IServicePackagesMeta {
  success: boolean;
  code: number;
  message: string;
}

export interface IServicePackagesApiResponse {
  meta: IServicePackagesMeta;
  data: IServicePackageResponse;
}
