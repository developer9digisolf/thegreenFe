export interface IService {
    id: string;
    categoryId: string;
    categoryName: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    icon?: string;
    isActive: boolean;
}

export interface ICreateServiceRequest {
    categoryId: string;
    name: string;
    duration: number;
    price: number;
    description?: string;
    icon?: string;
}

export interface IUpdateServiceRequest {
    categoryId?: string;
    name?: string;
    duration?: number;
    price?: number;
    description?: string;
    icon?: string;
    isActive?: boolean;
}
