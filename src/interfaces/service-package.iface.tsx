import { IServiceCategory } from "./service-category.iface";
import { IService } from "./service.iface";

export interface IServicePackageRule {
    id?: number;
    entityType: "Branch" | string;
    entityId: number;
    name?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IServicePackage {
    id: number;
    code: string;
    codePrefix: string;
    companyId: number;
    categoryId: number;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    basicPrice: number;
    price: number;
    durationExpired: number;
    duration: "day" | "week" | "month" | "year" | string;
    validFrom?: string | null;
    validUntil?: string | null;
    maxUsage?: number | null;
    maxUsagePerUser?: number | null;
    usedCount: number;
    serviceId: number;
    serviceVariantId?: number;
    branchServiceVariantId?: number;
    quantity: number;
    servicePackageRules: IServicePackageRule[];
    category?: IServiceCategory;
    service?: IService;
    createdAt: string;
    updatedAt: string;
}

export interface ICreateServicePackageRequest {
    code: string;
    codePrefix: string;
    categoryId: number;
    name: string;
    description: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    basicPrice: number;
    price: number;
    durationExpired: number;
    duration: string;
    validFrom?: string | null;
    validUntil?: string | null;
    maxUsage?: number | null;
    maxUsagePerUser?: number | null;
    serviceId: number;
    serviceVariantId?: number;
    branchServiceVariantId?: number;
    quantity: number;
    servicePackageRules: IServicePackageRule[];
}

export interface IUpdateServicePackageRequest extends ICreateServicePackageRequest {}

export interface IReqServicePackage {
    Page?: number;
    PageSize?: number;
    SortColumn?: string;
    SortDirection?: string;
    Search?: string;
}

export interface IPropsServicePackage {
    searchText: string;
    setSearchText: (text: string) => void;
    onSearch: () => void;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    setOpenFormCreate: () => void;
    handleEdit: (id: number) => void;
    handleDelete: (id: number) => void;
    handleToDetail: (id: number) => void;
}
