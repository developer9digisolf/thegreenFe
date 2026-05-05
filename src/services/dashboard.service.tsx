import { 
    ISummaryRevenue, 
    ISalesPerformance, 
    ITopTherapist, 
    IPaymentMethodTotal, 
    IRecentSale, 
    IRecentSession,
    IDashboardParams
} from '@afx/interfaces/dashboard.iface'
import { IPaginationResponse } from '@afx/interfaces/global.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function GetSummaryRevenueService() {
    return request<ISummaryRevenue>({
        url: rest.dashboardSummaryRevenue,
        method: 'GET'
    })
}

export function GetSalesPerformanceService(params: IDashboardParams) {
    return request<ISalesPerformance>({
        url: rest.dashboardSalesPerformance,
        method: 'GET',
        data: params
    })
}

export function GetTopTherapistsService(params: IDashboardParams) {
    return request<ITopTherapist[]>({
        url: rest.dashboardTopTherapists,
        method: 'GET',
        data: params
    })
}

export function GetPaymentMethodTotalsService(params: IDashboardParams) {
    return request<IPaymentMethodTotal>({
        url: rest.dashboardPaymentMethodTotals,
        method: 'GET',
        data: params
    })
}

export function GetRecentSalesService(params: IDashboardParams) {
    return request<IRecentSale[]>({
        url: rest.dashboardRecentSales,
        method: 'GET',
        data: params
    })
}

export function GetRecentSessionsService(params: IDashboardParams) {
    return request<IRecentSession[]>({
        url: rest.dashboardRecentSessions,
        method: 'GET',
        data: params
    })
}
