// Credit Package
export interface ICreditPackage {
    id: number;
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
    name: string;
    description?: string;
    payAmount: number;
    creditAmount: number;
    validityDays: number;
    sortOrder?: number;
}

export interface IUpdateCreditPackageRequest {
    name?: string;
    description?: string;
    payAmount?: number;
    creditAmount?: number;
    validityDays?: number;
    sortOrder?: number;
    isActive?: boolean;
}
