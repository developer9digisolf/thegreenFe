import { IServicePackage } from "./service-package.iface";
import { ICreditPackage } from "./credit-package.iface";

export interface PromoBanner {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  actionType: "voucher_pack" | "amount_credit" | "external_url";
  actionValue: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoBannerForm {
  title: string;
  description: string;
  imageUrl: string;
  actionType: "voucher_pack" | "amount_credit" | "external_url";
  actionValue: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface CreatePromoBannerRequest {
  title: string;
  description: string;
  imageUrl: string;
  actionType: "voucher_pack" | "amount_credit" | "external_url";
  actionValue: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface UpdatePromoBannerRequest {
  title: string;
  description: string;
  imageUrl: string;
  actionType: "voucher_pack" | "amount_credit" | "external_url";
  actionValue: string;
  startDate: string;
  endDate: string;
  sortOrder: number;
}

export interface PromoBannerListResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: {
    pageInfo: {
      lastPage: number;
      currentPage: number;
      total: number;
      pageSize: number;
    };
    pageData: PromoBanner[];
  };
}

export interface PromoBannerDetailResponse {
  meta: {
    success: boolean;
    code: number;
    message: string;
  };
  data: PromoBanner;
}

export interface IReqPromoBanner {
  Page: number;
  PageSize: number;
  Search?: string;
  SortColumn?: string;
  SortDirection?: string;
}

export interface IPropsPromoBanner {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  onSearch: () => void;
  searchText: string;
  setSearchText: (text: string) => void;
  setOpenFormCreate: () => void;
  handleEdit: (id: number) => void;
  handleDelete: (id: number, name: string) => void;
  packages?: IServicePackage[];
  creditPackages?: ICreditPackage[];
}
