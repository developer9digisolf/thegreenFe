export interface IBooking {
    id: number
    sessionCode: string
    sessionDate: string
    scheduledTime: string | null
    status: string
    statusDisplay: string

    memberId: number | null
    memberName: string
    memberPhone: string | null

    serviceName: string
    variantLabel: string
    price: number

    therapistId: number | null
    therapistName: string | null

    roomName: string | null

    paymentMethod: string
    paymentStatus: string
    amountPaid: number

    rating: number | null
    ratingComment: string | null

    startTime: string | null
    endTime: string | null
    durationActual: number | null
    createdAt: string
}

export interface IBookingSummary {
    period: { from: string; to: string }
    totalBookings: number
    scheduled: number
    pending: number
    inProgress: number
    completed: number
    cancelled: number
    totalSalesAmount: number
    totalPaidAmount: number
    allSalesAmount: number
    averageRating: number
    ratedCount: number
    paymentBreakdown: {
        method: string
        count: number
        total: number
    }[]
}

export interface IBookingPaginationRequest {
    page: number
    pageSize: number
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    paymentStatus?: string
}

export function getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'scheduled': return 'purple'
        case 'pending': return 'orange'
        case 'claimed': return 'blue'
        case 'inprogress': return 'cyan'
        case 'paused': return 'yellow'
        case 'completed': return 'green'
        case 'cancelled': return 'red'
        case 'noshow': return 'red'
        case 'released': return 'gray'
        default: return 'gray'
    }
}

export function getPaymentStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'paid': return 'green'
        case 'pending': return 'orange'
        case 'partial': return 'blue'
        case 'refunded': return 'purple'
        case 'cancelled': return 'red'
        default: return 'gray'
    }
}

export function getPaymentStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
        case 'paid': return 'Lunas'
        case 'pending': return 'Belum Bayar'
        case 'partial': return 'Sebagian'
        case 'refunded': return 'Refund'
        case 'cancelled': return 'Batal'
        default: return status
    }
}
