import { IBooking, IBookingSummary, IBookingPaginationRequest } from '@afx/interfaces/booking.iface'
import { rest } from '@afx/utils/config.rest'
import request from '@afx/utils/request.utils'

export function GetBookingsService(params: IBookingPaginationRequest) {
    return request<IBooking[]>({
        url: rest.booking,
        method: 'GET',
        data: params
    })
}

export function GetBookingSummaryService(params?: { dateFrom?: string; dateTo?: string }) {
    return request<IBookingSummary>({
        url: rest.bookingSummary,
        method: 'GET',
        data: params
    })
}

export function GetBookingDetailService(id: number) {
    return request<any>({
        url: rest.bookingDetail.replace(':id', String(id)),
        method: 'GET'
    })
}
