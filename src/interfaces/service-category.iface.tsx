export interface IServiceCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    isActive: boolean;
    serviceCount?: number;
    services?: any[];
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateServiceCategoryRequest {
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
}

export interface IUpdateServiceCategoryRequest {
    name?: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
}
