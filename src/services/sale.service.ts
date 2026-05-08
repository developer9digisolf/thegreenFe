import request from '@afx/utils/request.utils';
import { SalesResponse } from "@afx/interfaces/sale.iface";

// ============================================
// Interfaces
// ============================================
export interface GetSalesParams {
    page?: number;
    pageSize?: number;
    branchId?: number | null;
    startDate?: string;
    endDate?: string;
    search?: string;
    SaleType?: number;
}

export interface GetSalesResult {
    success: boolean;
    data?: any;
    message?: string;
}

// ============================================
// Service
// ============================================
export const GetSalesService = async (
    params: GetSalesParams
): Promise<GetSalesResult> => {
    try {
        const query = new URLSearchParams();

        // Pagination defaults
        query.append("page",     String(params.page     ?? 1));
        query.append("pageSize", String(params.pageSize ?? 10));

        // Optional filters — gunakan != null agar angka 0 tetap terkirim
        if (params.branchId  != null) query.append("branchId",  String(params.branchId));
        if (params.SaleType  != null) query.append("SaleType",  String(params.SaleType));
        if (params.startDate)         query.append("startDate",  params.startDate);
        if (params.endDate)           query.append("endDate",    params.endDate);
        if (params.search)            query.append("search",     params.search);

        const response = await request<any>({
            url: `pos/sales?${query.toString()}`,
            method: "GET",
        });

        return {
            success: true,
            data: (response as any).data ?? response,
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error?.response?.data?.meta?.message ??
                error?.message ??
                "Gagal mengambil data riwayat penjualan",
        };
    }
};

