import { IReqPagination } from "../common.iface";

export interface IReqEmployee extends IReqPagination {}

export interface IResEmployee {
  id: number;
  companyId: number;
  departmentId: number;
  positionId: number;
  employeeCode: string;
  fullName: string;
  nickname: string;
  gender: number;
  dateOfBirth: string | null;
  phone: string;
  email: string;
  address: string;
  hireDate: string;
  employmentStatus: number;
  bankAccountNumber: string | null;
  bankName: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormEmployee {
  departmentId: number;
  positionId: number;
  employeeCode: string;
  fullName: string;
  nickname: string;
  gender: number;
  dateOfBirth?: string;
  phone: string;
  email: string;
  address: string;
  hireDate: string;
  employmentStatus: number;
  bankAccountNumber?: string;
  bankName?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  photoUrl?: string;
  notes?: string;
}

export interface IPropsEmployee {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOpenFormCreate: () => void;
  handleToDetail: (id: number) => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number, name: string) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  onSearch: (text: string) => void;
}

export interface IPropsFormEmployee {
  formType: string;
  forms: any;
  open: boolean;
  onCancel: () => void;
  setFormType: (type: string) => void;
  handleSubmit: (values: IReqFormEmployee) => void;
}
