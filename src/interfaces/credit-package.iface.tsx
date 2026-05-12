// Credit Package
export interface ICreditPackage {
    id: number;
    code?: string;
    name: string;
    description?: string;
    payAmount: number;
    creditAmount: number;
    bonusAmount: number;
    validityDays: number;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    bonusPercentage: number;
}

export interface ICreateCreditPackageRequest {
    code?: string;
    name: string;
    description?: string;
    payAmount: number;
    creditAmount: number;
    validityDays: number;
    sortOrder?: number;
}

export interface IUpdateCreditPackageRequest {
    code?: string;
    name?: string;
    description?: string;
    payAmount?: number;
    creditAmount?: number;
    validityDays?: number;
    sortOrder?: number;
    isActive?: boolean;
}
