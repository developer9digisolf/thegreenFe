import { rest } from '@afx/utils/config.rest';
import request from '@afx/utils/request.utils';
import type {
    PosInitData, Order, PendingOrder, Member, Category,
    PaymentMethod, Therapist, TherapistData, RoomData, CashierSession,ServiceCategory
} from "@afx/interfaces/pos.iface";

// ============================================
// Helper — ekstrak pesan error dari AxiosError
// Backend menyimpan pesan di: error.response.data.meta.message
// ============================================
function extractErrorMessage(error: any, fallback = "Terjadi kesalahan"): string {
    return (
        error?.response?.data?.meta?.message ||   // ← struktur backend TheGreenSpa
        error?.response?.data?.message        ||
        error?.message                         ||
        fallback
    );
}

// ============================================
// Init & Data Master Khusus POS
// ============================================
export function GetPosInitService(branchId?: number) {
    const url = branchId ? `${rest.posInit}?branchId=${branchId}` : rest.posInit;
    return request<PosInitData>({ url, method: 'GET' });
}

export function GetBranchServicesService(branchId: number, categoryId?: number) {
    const url = categoryId
        ? `pos/service/branch/${branchId}/category?categoryId=${categoryId}`
        : `pos/service/branch/${branchId}/category`;

    return request<any[]>({ url, method: 'GET' });
}

export function GetActivePaymentMethodsService(branchId?: number) {
    const url = (branchId !== undefined && branchId !== null) 
        ? `${rest.posPaymentMethods}?branchId=${branchId}` 
        : rest.posPaymentMethods;
    return request<PaymentMethod[]>({ url, method: 'GET' });
}

export function GetAvailableTherapistsService() {
    return request<Therapist[]>({ url: rest.therapistAvailable, method: 'GET' });
}

export function GetPosServicePackagesService(branchId?: number) {
    const url = branchId ? `${rest.posServicePackages}?branchId=${branchId}` : rest.posServicePackages;
    return request<any>({ url, method: 'GET' });
}

// ============================================
// Order & Cart
// ============================================
export function GetPendingOrdersService() {
    return request<PendingOrder[]>({ url: rest.posOrdersPending, method: 'GET' });
}

export function CreateOrderService(data: { saleType: number; memberId: number | null }) {
    return request<Order>({ url: rest.posOrders, method: 'POST', data });
}

export function GetOrderDetailService(orderId: number) {
    return request<Order>({
        url: rest.posOrderDetail.replace(':id', String(orderId)),
        method: 'GET'
    });
}

export function AddOrderItemService(orderId: number, data: Record<string, unknown>) {
    return request<Order>({
        url: rest.posOrderItems.replace(':id', String(orderId)),
        method: 'POST',
        data
    });
}

export function UpdateOrderItemService(orderId: number, itemId: number, quantity: number) {
    return request<Order>({
        url: rest.posOrderItem.replace(':id', String(orderId)).replace(':itemId', String(itemId)),
        method: 'PUT',
        data: { quantity }
    });
}

export function DeleteOrderItemService(orderId: number, itemId: number) {
    return request<Order>({
        url: rest.posOrderItem.replace(':id', String(orderId)).replace(':itemId', String(itemId)),
        method: 'DELETE'
    });
}

export function SetOrderMemberService(orderId: number, memberId: number | null) {
    return request<Order>({
        url: rest.posOrderMember.replace(':id', String(orderId)),
        method: 'PUT',
        data: { memberId }
    });
}

export function HoldOrderService(orderId: number) {
    return request<any>({
        url: rest.posOrderHold.replace(':id', String(orderId)),
        method: 'POST',
        data: {}
    });
}

export function ApplyOrderDiscountService(orderId: number, data: Record<string, unknown>) {
    return request<Order>({
        url: rest.posOrderDiscount.replace(':id', String(orderId)),
        method: 'PUT',
        data
    });
}

export const GetServiceCategoriesService = async (
    branchId: number
): Promise<{ success: boolean; data?: ServiceCategory[]; message?: string }> => {
    try {
        const response = await request<any>({
            url: `pos/service-categories?branchId=${branchId}`,
            method: 'GET'
        });
        return { success: true, data: response.data ?? response };
    } catch (error: any) {
        return { success: false, message: extractErrorMessage(error, "Gagal memuat kategori layanan") };
    }
};

// ============================================
// Member Search
// ============================================
export function SearchMembersPosService(query: string) {
    console.log("SearchMembersPosService CALLED with query:", query);
    return request<{ items: Member[] }>({
        url: `${rest.member}?search=${encodeURIComponent(query)}&pageSize=10`,
        method: 'GET'
    });
}

export function CreateMemberPosService(data: any) {
    console.log("CreateMemberPosService CALLED with data:", data);
    return request<Member>({
        url: rest.member,
        method: 'POST',
        data
    });
}

export function UpdateMemberPosService(id: number, data: any) {
    return request<Member>({
        url: rest.memberDetail.replace(':id', String(id)),
        method: 'PUT',
        data
    });
}

export function CheckMemberPhonePosService(phone: string, excludeId?: number) {
    return request<{ exists: boolean }>({
        url: rest.memberCheckPhone,
        method: 'GET',
        data: { phone, excludeId }
    });
}

export function CheckMemberEmailPosService(email: string, excludeId?: number) {
    return request<{ exists: boolean }>({
        url: rest.memberCheckEmail,
        method: 'GET',
        data: { email, excludeId }
    });
}

// ============================================
// Cash Movement & Session
// ============================================
export function SubmitCashMovementService(
    sessionId: number,
    type: 3 | 4,
    amount: number,
    reason: string
) {
    return request<any>({
        url: rest.cashierSessionMovement.replace(':id', String(sessionId)),
        method: 'POST',
        data: { movementType: type, amount, reason }
    });
}

/**
 * [FIX] CloseCashierSessionService sekarang mengembalikan object terstruktur
 * alih-alih melempar exception mentah.
 *
 * Sebelumnya: `return request<any>(...)` → melempar AxiosError saat 400
 * → POSPage masuk ke catch → pesan backend hilang → hanya tampil "Gagal menutup sesi"
 *
 * Sekarang: selalu return { success, message, data }
 * → POSPage bisa baca pesan backend yang spesifik (misal: "Masih ada 2 order pending...")
 */
export async function CloseCashierSessionService(
    sessionId: number,
    actualClosingCash: number
): Promise<{ success: boolean; message?: string; data?: any }> {
    try {
        const response = await request<any>({
            url: rest.cashierSessionClose.replace(':id', String(sessionId)),
            method: 'POST',
            data: { actualClosingCash },
        });

        // request() sukses (2xx) — cek apakah backend juga menandai success
        const isSuccess =
            response?.meta?.success !== false &&  // jika ada field meta.success
            response?.success !== false;           // atau field success langsung

        return {
            success: isSuccess,
            message: response?.meta?.message || response?.message,
            data: response?.data ?? response,
        };
    } catch (error: any) {
        // [FIX] Ekstrak pesan dari struktur backend: error.response.data.meta.message
        const message = extractErrorMessage(error, "Gagal menutup sesi");
        return { success: false, message };
    }
}

// ============================================
// Rooms & Therapists
// ============================================
export const GetRoomsService = async (
    branchId: number
): Promise<{ success: boolean; data?: RoomData[]; message?: string }> => {
    try {
        const response = await request<any>({
            url: `pos/rooms?branchId=${branchId}`,
            method: 'GET'
        });
        return { success: true, data: response.data || response };
    } catch (error: any) {
        return { success: false, message: extractErrorMessage(error, "Gagal memuat ruangan") };
    }
};

export const GetTherapistsTodayService = async (
    branchId: number
): Promise<{ success: boolean; data?: TherapistData[]; message?: string }> => {
    try {
        const response = await request<any>({
            url: `pos/therapists/today?branchId=${branchId}`,
            method: 'GET'
        });
        return { success: true, data: response.data || response };
    } catch (error: any) {
        return { success: false, message: extractErrorMessage(error, "Gagal memuat therapist") };
    }
};