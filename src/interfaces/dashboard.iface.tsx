import { IPaginationResponse } from "./global.iface";

export interface ISummaryRevenue {
    todayRevenue: number;
    todayGrowth: number;
    monthRevenue: number;
    monthGrowth: number;
    avgTransaction: number;
    avgGrowth: number;
    totalTransactions: number;
    transactionGrowth: number;
}

export interface ISalesPerformance {
    labels: string[];
    sales: number[];
    quantities: number[];
}

export interface ITopTherapist {
    employeeCode: string;
    name: string;
    averageRate: number;
    totalSession: number;
}

export interface IPaymentMethodTotal {
    labels: string[];
    values: number[];
}

export interface IRecentSale {
    id: number;
    saleCode: string;
    saleType: string;
    saleTypeName: string;
    grandTotal: number;
    paymentStatus: string;
    paymentStatusName: string;
    saleDate: string;
    memberName: string;
    memberPhone: string;
    itemCount: number;
    paymentMethods: string;
}

export interface IRecentSession {
    id: number;
    sessionCode: string;
    sessionDate: string;
    scheduledTime: string;
    status: string;
    statusName: string;
    serviceName: string;
    memberName: string;
    memberPhone: string;
    therapistName: string;
    roomName: string;
    price: number;
    rating: number;
}

export interface IDashboardParams {
    startDate?: string;
    endDate?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}
