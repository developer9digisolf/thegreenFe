export interface IService {
    id: number;
    categoryId: number;
    categoryName: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    icon?: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ICreateServiceRequest {
    categoryId: number;
    name: string;
    duration: number;
    price: number;
    description?: string;
    icon?: string;
}

export interface IUpdateServiceRequest {
    categoryId?: number;
    name?: string;
    duration?: number;
    price?: number;
    description?: string;
    icon?: string;
    isActive?: boolean;
}
