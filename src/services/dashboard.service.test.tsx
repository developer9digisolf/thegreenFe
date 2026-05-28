import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  GetSummaryRevenueService,
  GetSalesPerformanceService,
  GetTopTherapistsService,
  GetTopMembersService,
  GetPaymentMethodTotalsService,
  GetRecentSalesService,
  GetRecentSessionsService,
  GetPeakHoursService,
  GetCustomerSegmentationService,
  GetTopServicesService,
} from './dashboard.service'

vi.mock('@afx/utils/request.utils', () => ({
  default: vi.fn(),
}))

vi.mock('@afx/utils/config.rest', () => ({
  rest: {
    dashboardSummaryRevenue: 'dashboard/summary-revenue',
    dashboardSalesPerformance: 'dashboard/sales-performance',
    dashboardTopTherapists: 'dashboard/top-therapists',
    dashboardTopMembers: 'dashboard/top-members',
    dashboardPaymentMethodTotals: 'dashboard/payment-method-totals',
    dashboardRecentSales: 'dashboard/recent-sales',
    dashboardRecentSessions: 'dashboard/recent-sessions',
    dashboardPeakHours: 'dashboard/peak-hours',
    dashboardCustomerSegmentation: 'dashboard/customer-segmentation',
    dashboardTopServices: 'dashboard/top-services',
  },
}))

import request from '@afx/utils/request.utils'

describe('Dashboard Services', () => {
  beforeEach(() => {
    vi.mocked(request).mockReset()
  })

  const mockParams = { branchId: 1, startDate: '2024-01-01', endDate: '2024-01-31' }

  describe('GetSummaryRevenueService', () => {
    it('should call GET dashboard/summary-revenue', () => {
      GetSummaryRevenueService()
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/summary-revenue',
        method: 'GET',
      })
    })
  })

  describe('GetSalesPerformanceService', () => {
    it('should call GET dashboard/sales-performance with params', () => {
      GetSalesPerformanceService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/sales-performance',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetTopTherapistsService', () => {
    it('should call GET dashboard/top-therapists with params', () => {
      GetTopTherapistsService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/top-therapists',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetTopMembersService', () => {
    it('should call GET dashboard/top-members with params', () => {
      GetTopMembersService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/top-members',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetPaymentMethodTotalsService', () => {
    it('should call GET dashboard/payment-method-totals with params', () => {
      GetPaymentMethodTotalsService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/payment-method-totals',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetRecentSalesService', () => {
    it('should call GET dashboard/recent-sales with params', () => {
      GetRecentSalesService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/recent-sales',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetRecentSessionsService', () => {
    it('should call GET dashboard/recent-sessions with params', () => {
      GetRecentSessionsService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/recent-sessions',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetPeakHoursService', () => {
    it('should call GET dashboard/peak-hours with params', () => {
      GetPeakHoursService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/peak-hours',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetCustomerSegmentationService', () => {
    it('should call GET dashboard/customer-segmentation with params', () => {
      GetCustomerSegmentationService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/customer-segmentation',
        method: 'GET',
        data: mockParams,
      })
    })
  })

  describe('GetTopServicesService', () => {
    it('should call GET dashboard/top-services with params', () => {
      GetTopServicesService(mockParams as any)
      expect(request).toHaveBeenCalledWith({
        url: 'dashboard/top-services',
        method: 'GET',
        data: mockParams,
      })
    })
  })
})
