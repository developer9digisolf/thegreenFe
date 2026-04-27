import { IReqPagination } from "../common.iface";

export interface IReqCompany extends IReqPagination {}

export interface IResCompany {
  id: number;
  code: string;
  name: string;
  parentId: null;
  description: string;
  address: string;
  phone: string;
  email: string;
  branchCount: number;
  departmentCount: number;
  positionCount: number;
  shiftCount: number;
  employeeCount: number;
  childCompanies: any[];
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormCompany {
  code: string;
  name: string;
  parentId?: number | null;
  description: string;
  address: string;
  phone: string;
  email: string;
}

export interface IPropsCompany {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setOpenFormCreate: () => void;
  handleToDetail: (id: number) => void;
  handleDelete: (id: number) => void;
}

export interface IPropsFormCompany {
  formType: string;
  forms: any;
  open: boolean;
  onCancle: () => void;
  setFormType: (type: string) => void;
  handleSubmit: () => void;
}
