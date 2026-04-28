import { IReqPagination } from "../common.iface";

export interface IReqUser {
  Page: number;
  PageSize: number;
  Search?: string;
  SortColumn: string;
  SortDirection: "desc" | "asc";
  Role?: string;
}

export interface IResUser {
  id: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  employeeName?: string;
  employeeId?: number;
}

export interface IReqFormUser {
  username: string;
  password?: string;
  email: string;
  role: number;
  employeeId: number;
}

export interface IPropsUser {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOpenFormCreate: () => void;
  handleToDetail: (id: number) => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  onSearch: (text: string) => void;
}

export interface IPropsFormUser {
  formType: string;
  forms: any;
  open: boolean;
  onCancel: () => void;
  setFormType: (type: string) => void;
  handleSubmit: (values: IReqFormUser) => void;
}

export interface IResEmployee {
  id: number;
  fullName: string;
  nickname: string;
}
