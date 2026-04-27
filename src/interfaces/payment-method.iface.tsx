export interface IPaymentInformation {
    id: number;
    type: string;
    content: string;
    isActive: boolean;
}

export interface IPaymentMethod {
    id: number;
    code: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    requiresReference: boolean;
    isCash: boolean;
    sortOrder: number;
    isActive: boolean;
    isVisibleInPOS?: boolean;
    paymentInformations: IPaymentInformation[];
}

export interface IPaymentMethodGroup {
    id: number;
    code: string;
    name: string;
    description: string | null;
    sortOrder: number;
    paymentMethods: IPaymentMethod[];
}

export interface IGroupedPaymentMethodsResponse {
    meta: {
        success: boolean;
        code: number;
        message: string;
    };
    data: {
        groups: IPaymentMethodGroup[];
    };
}

export interface IUpdatePaymentMethodRequest {
    isActive?: boolean;
    isVisibleInPOS?: boolean;
}
