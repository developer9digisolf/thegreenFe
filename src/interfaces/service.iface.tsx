// Service (without variants - for listing)
export interface IService {
    id: number;
    categoryId: number;
    categoryName: string;
    name: string;
    description?: string;
    icon?: string;
    sortOrder: number;
    isActive: boolean;
    variantCount: number;
    minPrice?: number;
    maxPrice?: number;
    minDuration?: number;
    maxDuration?: number;
    createdAt?: string;
    updatedAt?: string;
}

// Service with variants (for detail/editing)
export interface IServiceDetail extends IService {
    variants: IServiceVariant[];
}

// Service Variant (duration/price option)
export interface IServiceVariant {
    id: number;
    serviceId: number;
    serviceName?: string;
    categoryName?: string;
    label?: string;
    duration: number;
    price: number;
    sortOrder: number;
    isActive: boolean;
    displayName?: string;
}

// Flat list of variants with service info (for dropdowns)
export interface IServiceVariantList {
    id: number;
    serviceId: number;
    categoryId: number;
    categoryName: string;
    serviceName: string;
    label?: string;
    duration: number;
    price: number;
    fullDisplayName?: string;
}

// Create Service Request (with variants)
export interface ICreateServiceRequest {
    categoryId: number;
    name: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    variants: ICreateServiceVariantRequest[];
}

// Update Service Request (without variants)
export interface IUpdateServiceRequest {
    categoryId?: number;
    name?: string;
    description?: string;
    icon?: string;
    sortOrder?: number;
    isActive?: boolean;
}

// Create Variant Request
export interface ICreateServiceVariantRequest {
    label?: string;
    duration: number;
    price: number;
    sortOrder?: number;
}

// Update Variant Request
export interface IUpdateServiceVariantRequest {
    label?: string;
    duration?: number;
    price?: number;
    sortOrder?: number;
    isActive?: boolean;
}
