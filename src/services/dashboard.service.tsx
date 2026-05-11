import { 
    ISummaryRevenue, 
    ISalesPerformance, 
    ITopTherapist, 
    ITopMember,
    IPaymentMethodTotal, 
    IRecentSale, 
    IRecentSession,
    IPeakHour,
    ICustomerSegmentation,
    ITopService,
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

export function GetTopMembersService(params: IDashboardParams) {
    return request<ITopMember[]>({
        url: rest.dashboardTopMembers,
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

export function GetPeakHoursService(params: IDashboardParams) {
    return request<IPeakHour>({
        url: rest.dashboardPeakHours,
        method: 'GET',
        data: params
    })
}

export function GetCustomerSegmentationService(params: IDashboardParams) {
    return request<ICustomerSegmentation>({
        url: rest.dashboardCustomerSegmentation,
        method: 'GET',
        data: params
    })
}

export function GetTopServicesService(params: IDashboardParams) {
    return request<ITopService[]>({
        url: rest.dashboardTopServices,
        method: 'GET',
        data: params
    })
}
