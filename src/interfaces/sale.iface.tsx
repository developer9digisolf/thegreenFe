export interface SaleItem {
    id: number;
    itemType: string;
    itemTypeName: string;

    serviceVariantId?: number;
    serviceVariantName?: string;

    serviceName?: string;

    packageId?: number;
    packageName?: string;

    creditPackageId?: number;
    creditPackageName?: string;

    quantity: number;
    unitPrice: number;
    discountAmount: number;
    subtotal: number;
    notes?: string | null;
}

export interface SaleData {
    id: number;
    saleCode: string;

    saleType: string;
    saleTypeDisplay: string;

    saleDate: string;

    branchId: number;
    branchName: string;

    memberId?: number | null;
    memberName?: string | null;
    memberPhone?: string | null;

    subtotal: number;
    discountAmount: number;
    taxAmount: number;

    grandTotal: number;
    amountPaid: number;
    changeAmount: number;

    paymentStatus: string;
    paymentStatusDisplay: string;

    paymentMethods: string;

    cashierSessionId: number;
    sessionCode: string;

    notes?: string | null;

    items: SaleItem[];

    createdAt: string;
    updatedAt: string;
}

export interface SalesResponse {
    pageInfo: {
        lastPage: number;
        currentPage: number;
        path: string;
        total: number;
        pageSize: number;
    };

    pageData: SaleData[];
}