// ============================================
// POS — Interfaces & Types
// ============================================

export interface Branch {
    branchId: number;
    branchCode: string;
    branchName: string;
    isActive: boolean;
}

export interface ServiceVariant {
    id: number;              // branchServiceVariantId (dipakai saat POST /pos/sales)
    serviceId: number;
    serviceName: string;
    variantName: string;
    displayName: string;
    duration: number;
    price: number;
    icon?: string;
    categoryColor?: string;
    categoryId?: number | null;
}

export interface Category {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    services: ServiceVariant[];
}

export interface Package {
    id: number;
    code?: string;
    name: string;
    description?: string;
    totalSessions: number; // mapped to quantity
    price: number;
    validityDays: number; // mapped to durationExpired
    duration?: string;
    pricePerSession: number;
    savings?: number;
    serviceVariantName?: string;
    quantity?: number;
    durationExpired?: number;
}

export interface CreditPackage {
    id: number;
    code: string;
    name: string;
    description?: string;
    payAmount: number;
    creditAmount: number;
    bonusAmount: number;
    bonusPercentage: number;
    validityDays: number;
}

export interface PaymentMethod {
    id: number;
    code: string;
    name: string;
    description?: string | null;
    imageUrl?: string;
    requiresReference: boolean;
    isCash: boolean;
    sortOrder: number;
    isActive?: boolean;
    type?: number;
    typeName?: string;
    icon?: string;
}

export interface Therapist {
    id: number;
    code: string;
    name: string;
    photo?: string;
    status: string;
    queueNumber?: number;
    currentService?: string;
    timeLeftMinutes?: number;
}

export interface CashierSession {
    id: number;
    sessionCode: string;
    userId: number;
    userName: string;
    openedAt: string;
    closedAt?: string;
    openingCash: number;
    expectedClosingCash: number;
    actualClosingCash?: number;
    cashDifference?: number;
    status: number;
    statusName: string;
}

// ── Cart (client-side only, tidak dikirim ke BE sampai tombol Bayar) ──────────
export interface CartItem {
    /** key unik untuk React list rendering */
    cartKey: string;

    /** 0 = service, 1 = package/voucher, 2 = credit package */
    itemType: 0 | 1 | 2;

    // Referensi ID sesuai itemType
    branchServiceVariantId: number | null;   // itemType 0
    servicePackageId: number | null;         // itemType 1
    creditPackageId: number | null;          // itemType 2

    // Display info
    displayName: string;
    duration: number;
    unitPrice: number;
    quantity: number;

    notes?: string | null;
    appointmentDate?: string | null;
    startTime?: string | null;
    appointmentNotes?: string | null;
}

// ── Payload POST /pos/sales ────────────────────────────────────────────────────
export interface SaleItemPayload {
    ItemType: number;
    BranchServiceVariantId: number | null;
    ServicePackageId: number | null;
    CreditPackageId: number | null;
    Notes: string | null;
    AppointmentDate: string | null;
    StartTime: string | null;
    AppointmentNotes: string | null;
}

export interface SalePayload {
    SaleType: number;
    BranchId: number;
    MemberId?: number | null;
    TherapistId?: number | null;
    PaymentMethodId: number;
    notes: string | null;
    amountPaid: number;
    Items: SaleItemPayload[];
}

// ── Legacy Order types (dipertahankan untuk kompatibilitas ModalPayment) ───────
export interface OrderItem {
    id: number;
    itemType: number;
    itemTypeName: string;
    serviceVariantId?: number;
    packageId?: number;
    creditPackageId?: number;
    itemName: string;
    itemDescription?: string;
    categoryName?: string;
    duration: number;
    icon?: string;
    quantity: number;
    unitPrice: number;
    discountAmount: number;
    subtotal: number;
    notes?: string;
}

export interface Order {
    id: number;
    saleCode: string;
    saleType: number;
    saleTypeName: string;
    cashierSessionId: number;
    memberId?: number;
    memberCode?: string;
    memberName?: string;
    memberPhone?: string;
    memberCreditBalance?: number;
    subtotal: number;
    discountAmount: number;
    discountPercent?: number;
    taxAmount: number;
    grandTotal: number;
    amountPaid: number;
    changeAmount: number;
    paymentStatus: number;
    paymentStatusName: string;
    notes?: string;
    items: OrderItem[];
    totalItems: number;
    totalDuration: number;
}

export interface PendingOrder {
    id: number;
    saleCode: string;
    memberName?: string;
    grandTotal: number;
    totalItems: number;
    createdAt: string;
    notes?: string;
}

export interface Member {
    id: number;
    code: string;
    name: string;
    phone: string;
    email?: string;
    creditBalance?: { totalBalance: number } | number;
    totalVisits?: number;
    status: string;
    avoidAreas?: string[];
    vouchers?: { name: string; remaining: number; expiryDate: string }[];
    favoriteTherapistName?: string;
}

export interface PosInitData {
    currentSession?: CashierSession;
    hasOpenSession: boolean;
    categories: Category[];
    packages: Package[];
    creditPackages: CreditPackage[];
    paymentMethods: PaymentMethod[];
    pendingOrders: PendingOrder[];
    therapists: Therapist[];
}

export interface PaymentEntry {
    paymentMethodId: number;
    amount: number;
    referenceNumber?: string;
}

export type GateState = "INITIALIZING" | "SELECT_BRANCH" | "FORCE_CLOSE" | "OPEN_SESSION" | "READY";
export type PosMode = "session" | "voucher" | "redeem";
export type ToastType = "success" | "error" | "info";

export interface Toast {
    message: string;
    type: ToastType;
}

export interface RoomData {
    id: number;
    name: string;
    capacity: number;
    description: string;
    status: string;
    statusDisplay: string;
    isActive: boolean;
}

export interface TherapistData {
    id: number;
    branchId: number;
    branchName: string;
    employeeName: string;
    position: string;
    dateTime: string;
    status?: string; 
}

export interface ServiceCategory {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
    sortOrder?: number;
    isActive?: boolean;
    serviceCount?: number;
}