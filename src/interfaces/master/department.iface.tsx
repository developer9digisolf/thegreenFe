export interface IReqDepartment {
  Page: number;
  PageSize: number;
  Search?: string;
  SortColumn: string;
  SortDirection: "desc" | "asc";
}

export interface IResDepartment {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReqFormDepartment {
  code: string;
  name: string;
  description: string;
}

export interface IPropsDepartment {
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

export interface IPropsFormDepartment {
  formType: string;
  forms: any;
  open: boolean;
  onCancel: () => void;
  setFormType: (type: string) => void;
  handleSubmit: (values: IReqFormDepartment) => void;
}
