import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetSalesService, GetSalesParams } from './sale.service'

vi.mock('@afx/utils/request.utils', () => ({
  default: vi.fn(),
}))

import request from '@afx/utils/request.utils'

describe('GetSalesService', () => {
  beforeEach(() => {
    vi.mocked(request).mockReset()
  })

  it('should call GET pos/sales with default pagination', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({})

    expect(request).toHaveBeenCalledOnce()
    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.method).toBe('GET')
    expect(callArg.url).toContain('pos/sales?')
    expect(callArg.url).toContain('page=1')
    expect(callArg.url).toContain('pageSize=10')
    expect(callArg.url).toContain('SortColumn=createdat')
    expect(callArg.url).toContain('SortDirection=desc')
  })

  it('should use provided pagination values', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ page: 3, pageSize: 25 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('page=3')
    expect(callArg.url).toContain('pageSize=25')
  })

  it('should include branchId filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ branchId: 5 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('branchId=5')
  })

  it('should include branchId=0 filter (falsy but not null)', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ branchId: 0 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('branchId=0')
  })

  it('should not include null branchId', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ branchId: null })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).not.toContain('branchId')
  })

  it('should include SaleType filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ SaleType: 2 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('SaleType=2')
  })

  it('should include SaleType=0 filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ SaleType: 0 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('SaleType=0')
  })

  it('should include date range filters', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ startDate: '2024-01-01', endDate: '2024-01-31' })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('startDate=2024-01-01')
    expect(callArg.url).toContain('endDate=2024-01-31')
  })

  it('should include search filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ search: 'john' })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('search=john')
  })

  it('should include statuses filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ statuses: 1 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('statuses=1')
  })

  it('should include statuses=0 filter', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: [] },
    })

    await GetSalesService({ statuses: 0 })

    const callArg = vi.mocked(request).mock.calls[0][0]
    expect(callArg.url).toContain('statuses=0')
  })

  it('should return items from pageData', async () => {
    const mockItems = [{ id: 1, total: 100 }]
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { pageData: mockItems },
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(true)
    expect(result.data.items).toEqual(mockItems)
  })

  it('should fallback to data.items when pageData is absent', async () => {
    const mockItems = [{ id: 2, total: 200 }]
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: { items: mockItems },
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(true)
    expect(result.data.items).toEqual(mockItems)
  })

  it('should fallback to data array when pageData and items are absent', async () => {
    const mockItems = [{ id: 3, total: 300 }]
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: mockItems,
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(true)
    expect(result.data.items).toEqual(mockItems)
  })

  it('should return empty array when data is missing', async () => {
    vi.mocked(request).mockResolvedValueOnce({
      success: true,
      data: null,
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(true)
    expect(result.data.items).toEqual([])
  })

  it('should handle API error with meta message', async () => {
    vi.mocked(request).mockRejectedValueOnce({
      response: { data: { meta: { message: 'Unauthorized' } } },
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(false)
    expect(result.message).toBe('Unauthorized')
  })

  it('should handle API error with plain message', async () => {
    vi.mocked(request).mockRejectedValueOnce({
      response: { data: { message: 'Server error' } },
    })

    const result = await GetSalesService({})

    expect(result.success).toBe(false)
    expect(result.message).toBe('Server error')
  })

  it('should handle generic error with message property', async () => {
    vi.mocked(request).mockRejectedValueOnce(new Error('Network failure'))

    const result = await GetSalesService({})

    expect(result.success).toBe(false)
    expect(result.message).toBe('Network failure')
  })

  it('should use default error message for unknown errors', async () => {
    vi.mocked(request).mockRejectedValueOnce({})

    const result = await GetSalesService({})

    expect(result.success).toBe(false)
    expect(result.message).toBe('Gagal mengambil data riwayat penjualan')
  })
})
