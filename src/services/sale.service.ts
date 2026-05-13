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
    statuses?: string | number;
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
        if (params.statuses != null)  query.append("statuses",   String(params.statuses));

        // Default Sorting: Selalu paling baru di atas
        query.append("SortColumn", "createdat");
        query.append("SortDirection", "desc");

        const response = await request<any>({
            url: `pos/sales?${query.toString()}`,
            method: "GET",
        });

        // Mapping response data — Backend TheGreenSpa biasanya membungkus di data.pageData
        const items = response?.data?.pageData ?? response?.data?.items ?? response?.data ?? [];

        return {
            success: true,
            data: { items },
        };
    } catch (error: any) {
        return {
            success: false,
            message:
                error?.response?.data?.meta?.message ??
                error?.response?.data?.message ??
                error?.message ??
                "Gagal mengambil data riwayat penjualan",
        };
    }
};

