// Package (Voucher Package)
export interface IPackage {
    id: number;
    name: string;
    description?: string;
    totalSessions: number;
    price: number;
    validityDays: number;
    serviceVariantId?: number;
    serviceVariantName?: string;
    serviceName?: string;
    categoryName?: string;
    variantDuration?: number;
    variantPrice?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    pricePerSession: number;
    savings?: number;
}

export interface ICreatePackageRequest {
    name: string;
    description?: string;
    totalSessions: number;
    price: number;
    validityDays: number;
    serviceVariantId?: number;
}

export interface IUpdatePackageRequest {
    name?: string;
    description?: string;
    totalSessions?: number;
    price?: number;
    validityDays?: number;
    serviceVariantId?: number;
    clearServiceVariant?: boolean;
    isActive?: boolean;
}
