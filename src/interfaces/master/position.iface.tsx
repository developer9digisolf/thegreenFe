import { IReqPagination } from "../common.iface";

export interface IReqPosition {
  Page: number;
  PageSize: number;
  Search?: string;
  SortColumn: string;
  SortDirection: "desc" | "asc";
}

export interface IResPosition {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description: string;
  baseSalary: number;
  employeeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormPosition {
  code: string;
  name: string;
  description: string;
  baseSalary: number;
}

export interface IPropsPosition {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOpenFormCreate: () => void;
  handleToDetail: (id: number) => void;
  handleDelete: (id: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  onSearch: (text: string) => void;
}

export interface IPropsFormPosition {
  formType: string;
  forms: any;
  open: boolean;
  onCancel: () => void;
  setFormType: (type: string) => void;
  handleSubmit: (values: IReqFormPosition) => void;
}
