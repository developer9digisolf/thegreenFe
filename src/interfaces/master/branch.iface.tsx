import { IReqPagination } from "../common.iface";

export interface IReqBranch extends IReqPagination {}

export interface IResBranch {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  isMainBranch: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormBranch {
  code: string;
  name: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  isMainBranch: boolean;
}

export interface IPropsBranch {
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
  handleOperatingHours: (record: any) => void;
}

export interface IPropsFormBranch {
  formType: string;
  forms: any;
  open: boolean;
  onCancel: () => void;
  setFormType: (type: string) => void;
  handleSubmit: (values: IReqFormBranch) => void;
}
