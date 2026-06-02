import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  GetBookingsService,
  GetBookingSummaryService,
  GetBookingDetailService,
} from './booking.service'

vi.mock('@afx/utils/request.utils', () => ({
  default: vi.fn(),
}))

vi.mock('@afx/utils/config.rest', () => ({
  rest: {
    booking: 'bookings',
    bookingSummary: 'bookings/summary',
    bookingDetail: 'bookings/:id',
  },
}))

import request from '@afx/utils/request.utils'

describe('Booking Services', () => {
  beforeEach(() => {
    vi.mocked(request).mockReset()
  })

  describe('GetBookingsService', () => {
    it('should call GET bookings with params', () => {
      const params = { page: 1, pageSize: 10, status: 'pending' }
      GetBookingsService(params as any)

      expect(request).toHaveBeenCalledWith({
        url: 'bookings',
        method: 'GET',
        data: params,
      })
    })

    it('should call GET bookings without params', () => {
      GetBookingsService({} as any)

      expect(request).toHaveBeenCalledWith({
        url: 'bookings',
        method: 'GET',
        data: {},
      })
    })
  })

  describe('GetBookingSummaryService', () => {
    it('should call GET bookings/summary with date range', () => {
      const params = { dateFrom: '2024-01-01', dateTo: '2024-01-31' }
      GetBookingSummaryService(params)

      expect(request).toHaveBeenCalledWith({
        url: 'bookings/summary',
        method: 'GET',
        data: params,
      })
    })

    it('should call GET bookings/summary without params', () => {
      GetBookingSummaryService()

      expect(request).toHaveBeenCalledWith({
        url: 'bookings/summary',
        method: 'GET',
        data: undefined,
      })
    })
  })

  describe('GetBookingDetailService', () => {
    it('should call GET bookings/:id with replaced id', () => {
      GetBookingDetailService(123)

      expect(request).toHaveBeenCalledWith({
        url: 'bookings/123',
        method: 'GET',
      })
    })

    it('should convert string id to number', () => {
      GetBookingDetailService(456)

      expect(request).toHaveBeenCalledWith({
        url: 'bookings/456',
        method: 'GET',
      })
    })
  })
})
