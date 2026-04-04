"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import "./pos.css";
import { useApi } from "@afx/utils/useApi";
import { rest } from "@afx/utils/config.rest";

// ============================================
// TYPES
// ============================================
interface ServiceVariant {
    id: number;
    serviceId: number;
    serviceName: string;
    variantName: string;
    displayName: string;
    duration: number;
    price: number;
    icon?: string;
    categoryColor?: string;
}

interface Category {
    id: number;
    name: string;
    icon?: string;
    color?: string;
    sortOrder: number;
    services: ServiceVariant[];
}

interface Package {
    id: number;
    name: string;
    description?: string;
    totalSessions: number;
    price: number;
    validityDays: number;
    pricePerSession: number;
    savings?: number;
    serviceVariantName?: string;
}

interface CreditPackage {
    id: number;
    name: string;
    description?: string;
    payAmount: number;
    creditAmount: number;
    bonusAmount: number;
    bonusPercentage: number;
    validityDays: number;
}

interface PaymentMethod {
    id: number;
    code: string;
    name: string;
    type: number;
    typeName: string;
    icon?: string;
    requiresReference: boolean;
    isCash: boolean;
    sortOrder: number;
}

interface Therapist {
    id: number;
    code: string;
    name: string;
    photo?: string;
    status: string;
    queueNumber?: number;
    currentService?: string;
    timeLeftMinutes?: number;
}

interface CashierSession {
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

interface OrderItem {
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

interface Order {
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

interface PendingOrder {
    id: number;
    saleCode: string;
    memberName?: string;
    grandTotal: number;
    totalItems: number;
    createdAt: string;
    notes?: string;
}

interface Member {
    id: number;
    code: string;
    name: string;
    phone: string;
    email?: string;
    creditBalance?: { totalBalance: number };
    totalVisits?: number;
    status: string;
    avoidAreas?: string[];
    vouchers?: { name: string; remaining: number; expiryDate: string }[];
    favoriteTherapistName?: string;
}

interface PosInitData {
    currentSession?: CashierSession;
    hasOpenSession: boolean;
    categories: Category[];
    packages: Package[];
    creditPackages: CreditPackage[];
    paymentMethods: PaymentMethod[];
    pendingOrders: PendingOrder[];
    therapists: Therapist[];
}

interface PaymentEntry {
    paymentMethodId: number;
    amount: number;
    referenceNumber?: string;
}

// ============================================
// COMPONENT
// ============================================
export default function POSPage() {
    const { get, post, put, del } = useApi();

    // State
    const [mode, setMode] = useState<"session" | "voucher" | "redeem">("session");
    const [loading, setLoading] = useState(true);
    const [initData, setInitData] = useState<PosInitData | null>(null);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberResults, setMemberResults] = useState<Member[]>([]);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

    // Modal states
    const [showOpenSessionModal, setShowOpenSessionModal] = useState(false);
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [sessionDetail, setSessionDetail] = useState<any>(null);
    const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [openingCash, setOpeningCash] = useState("");
    const [closingCash, setClosingCash] = useState("");
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentReference, setPaymentReference] = useState("");
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
    const [discountValue, setDiscountValue] = useState("");
    const [showCashMovementModal, setShowCashMovementModal] = useState(false);
    const [cashMovementType, setCashMovementType] = useState<"in" | "out">("in");
    const [cashMovementAmount, setCashMovementAmount] = useState("");
    const [cashMovementReason, setCashMovementReason] = useState("");
    const [showMobileCart, setShowMobileCart] = useState(false);
    const [serviceSearch, setServiceSearch] = useState("");
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

    // ============================================
    // HELPERS
    // ============================================
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount).replace("IDR", "Rp");
    };

    const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    // ============================================
    // API CALLS
    // ============================================
    const loadInitData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await get(rest.posInit);
            if (response.success && response.data) {
                setInitData(response.data);
                setPendingOrders(response.data.pendingOrders || []);
                setSelectedCategory(null);

                if (!response.data.hasOpenSession) {
                    setShowOpenSessionModal(true);
                }
            }
        } catch (error) {
            console.error("Failed to load POS data:", error);
        } finally {
            setLoading(false);
        }
    }, [get]);

    useEffect(() => {
        loadInitData();
    }, [loadInitData]);

    const searchMembers = async (query: string) => {
        if (query.length < 2) {
            setMemberResults([]);
            return;
        }
        try {
            const response = await get(`${rest.member}?search=${encodeURIComponent(query)}&pageSize=5`);
            if (response.success && response.data?.items) {
                setMemberResults(response.data.items);
            }
        } catch (error) {
            console.error("Failed to search members:", error);
        }
    };

    const handleOpenSession = async () => {
        if (!openingCash || parseFloat(openingCash) < 0) {
            showToast("Masukkan jumlah kas awal yang valid", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const response = await post(rest.cashierSessionOpen, {
                openingCash: parseFloat(openingCash)
            });
            if (response.success) {
                setShowOpenSessionModal(false);
                setOpeningCash("");
                await loadInitData();
            } else {
                showToast(response.message || "Gagal membuka sesi", "error");
            }
        } catch (error) {
            console.error("Failed to open session:", error);
            showToast("Gagal membuka sesi", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const openCloseSessionModal = async () => {
        if (!initData?.currentSession) return;
        setLoadingSessionDetail(true);
        setShowCloseSessionModal(true);
        try {
            const response = await get(
                rest.cashierSessionDetailFull.replace(":id", initData.currentSession.id.toString())
            );
            if (response.success && response.data) {
                setSessionDetail(response.data);
                // Pre-fill expected closing cash
                setClosingCash(response.data.expectedClosingCash?.toString() || "0");
            }
        } catch (error) {
            console.error("Failed to load session detail:", error);
        } finally {
            setLoadingSessionDetail(false);
        }
    };

    const handleCloseSession = async () => {
        if (!closingCash || parseFloat(closingCash) < 0) {
            showToast("Masukkan jumlah kas akhir yang valid", "error");
            return;
        }
        if (!initData?.currentSession) return;

        setIsProcessing(true);
        try {
            const response = await post(rest.cashierSessionClose.replace(":id", initData.currentSession.id.toString()), {
                actualClosingCash: parseFloat(closingCash)
            });
            if (response.success) {
                setShowCloseSessionModal(false);
                setClosingCash("");
                setSessionDetail(null);
                await loadInitData();
            } else {
                showToast(response.message || "Gagal menutup sesi", "error");
            }
        } catch (error) {
            console.error("Failed to close session:", error);
            showToast("Gagal menutup sesi", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const createNewOrder = async (saleType: number = 0): Promise<Order | null> => {
        if (!initData?.hasOpenSession) {
            showToast("Sesi kasir belum dibuka. Silakan buka sesi terlebih dahulu.", "error");
            return null;
        }
        try {
            const response = await post(rest.posOrders, {
                saleType,
                memberId: selectedMember?.id
            });
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                return response.data;
            } else {
                showToast(response.message || "Gagal membuat order", "error");
                return null;
            }
        } catch (error) {
            console.error("Failed to create order:", error);
            showToast("Gagal membuat order", "error");
            return null;
        }
    };

    const loadPendingOrders = async () => {
        try {
            const response = await get(rest.posOrdersPending);
            if (response.success && response.data) {
                setPendingOrders(response.data);
            }
        } catch (error) {
            console.error("Failed to load pending orders:", error);
        }
    };

    const selectOrder = async (orderId: number) => {
        try {
            const response = await get(rest.posOrderDetail.replace(":id", orderId.toString()));
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                if (response.data.saleType === 0) setMode("session");
                else if (response.data.saleType === 1) setMode("voucher");
                else setMode("redeem");
            }
        } catch (error) {
            console.error("Failed to load order:", error);
        }
    };

    const addItemToOrder = async (itemType: number, itemId: number, order?: Order | null) => {
        const targetOrder = order || currentOrder;
        if (!targetOrder) return;

        const payload: Record<string, unknown> = { itemType, quantity: 1 };
        if (itemType === 0) payload.serviceVariantId = itemId;
        else if (itemType === 1) payload.packageId = itemId;
        else payload.creditPackageId = itemId;

        try {
            const response = await post(rest.posOrderItems.replace(":id", targetOrder.id.toString()), payload);
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                showToast("Item ditambahkan ke keranjang");
            } else {
                showToast(response.message || "Gagal menambahkan item", "error");
            }
        } catch (error) {
            console.error("Failed to add item:", error);
            showToast("Gagal menambahkan item", "error");
        }
    };

    const addServiceToCart = async (variant: ServiceVariant) => {
        if (!currentOrder) {
            const newOrder = await createNewOrder(0);
            if (newOrder) {
                await addItemToOrder(0, variant.id, newOrder);
            }
            return;
        }
        await addItemToOrder(0, variant.id);
    };

    const addPackageToCart = async (pkg: Package) => {
        setSelectedPackage(pkg.id);
        if (!currentOrder) {
            const newOrder = await createNewOrder(1);
            if (newOrder) {
                await addItemToOrder(1, pkg.id, newOrder);
            }
            return;
        }
        await addItemToOrder(1, pkg.id);
    };

    const updateItemQuantity = async (itemId: number, delta: number) => {
        if (!currentOrder) return;

        const item = currentOrder.items.find(i => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) {
            await removeItem(itemId);
            return;
        }

        try {
            const response = await put(rest.posOrderItem.replace(":id", currentOrder.id.toString()).replace(":itemId", itemId.toString()), {
                quantity: newQty
            });
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
            }
        } catch (error) {
            console.error("Failed to update item:", error);
        }
    };

    const removeItem = async (itemId: number) => {
        if (!currentOrder) return;

        try {
            const response = await del(rest.posOrderItem.replace(":id", currentOrder.id.toString()).replace(":itemId", itemId.toString()));
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                showToast("Item dihapus dari keranjang", "info");
            }
        } catch (error) {
            console.error("Failed to remove item:", error);
            showToast("Gagal menghapus item", "error");
        }
    };

    const setOrderMember = async (member: Member | null) => {
        setSelectedMember(member);
        setShowMemberDropdown(false);
        setMemberSearch("");
        setMemberResults([]);

        if (!currentOrder) return;

        try {
            const response = await put(rest.posOrderMember.replace(":id", currentOrder.id.toString()), {
                memberId: member?.id || null
            });
            if (response.success && response.data) {
                setCurrentOrder(response.data);
            }
        } catch (error) {
            console.error("Failed to set member:", error);
        }
    };

    const holdOrder = async () => {
        if (!currentOrder) return;

        setIsProcessing(true);
        try {
            const response = await post(rest.posOrderHold.replace(":id", currentOrder.id.toString()), {});
            if (response.success) {
                setCurrentOrder(null);
                setSelectedMember(null);
                await loadPendingOrders();
                showToast("Order ditahan");
            }
        } catch (error) {
            console.error("Failed to hold order:", error);
            showToast("Gagal menahan order", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const openPaymentModal = () => {
        console.log("[POS] openPaymentModal called", { currentOrder, itemsCount: currentOrder?.items?.length });
        if (!currentOrder || currentOrder.items.length === 0) {
            showToast("Tidak ada item dalam order", "error");
            return;
        }
        console.log("[POS] Opening payment modal for order", currentOrder.saleCode, "total:", currentOrder.grandTotal);
        setPayments([]);
        setSelectedPaymentMethod(null);
        setPaymentAmount(currentOrder.grandTotal.toString());
        setPaymentReference("");
        setShowPaymentModal(true);
    };

    const addPaymentEntry = () => {
        if (!selectedPaymentMethod || !paymentAmount) return;
        
        const amount = parseFloat(paymentAmount);
        if (amount <= 0) return;

        if (selectedPaymentMethod.requiresReference && !paymentReference) {
            showToast(`Nomor referensi diperlukan untuk pembayaran ${selectedPaymentMethod.name}`, "error");
            return;
        }

        setPayments([...payments, {
            paymentMethodId: selectedPaymentMethod.id,
            amount,
            referenceNumber: paymentReference || undefined
        }]);

        setSelectedPaymentMethod(null);
        const remaining = (currentOrder?.grandTotal || 0) - payments.reduce((sum, p) => sum + p.amount, 0) - amount;
        setPaymentAmount(remaining > 0 ? remaining.toString() : "");
        setPaymentReference("");
    };

    const removePaymentEntry = (index: number) => {
        setPayments(payments.filter((_, i) => i !== index));
    };

    const processPayment = async () => {
        if (!currentOrder || payments.length === 0) return;

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid < currentOrder.grandTotal) {
            showToast(`Total pembayaran kurang dari tagihan`, "error");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await post(rest.posOrderPay.replace(":id", currentOrder.id.toString()), {
                payments: payments.map(p => ({
                    paymentMethodId: p.paymentMethodId,
                    amount: p.amount,
                    referenceNumber: p.referenceNumber
                })),
                amountReceived: totalPaid,
                therapistId: selectedTherapist || undefined
            });

            if (response.success) {
                setShowPaymentModal(false);
                setCurrentOrder(null);
                setSelectedMember(null);
                setSelectedTherapist(null);
                setPayments([]);
                await loadPendingOrders();
                showToast("Pembayaran berhasil!");
            } else {
                showToast(response.message || "Gagal memproses pembayaran", "error");
            }
        } catch (error) {
            console.error("Failed to process payment:", error);
            showToast("Gagal memproses pembayaran", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const applyDiscount = async () => {
        if (!currentOrder || !discountValue) return;
        const value = parseFloat(discountValue);
        if (value <= 0) return;

        try {
            const payload: Record<string, unknown> = {};
            if (discountType === "fixed") {
                payload.discountAmount = value;
            } else {
                payload.discountPercent = value;
            }

            const response = await put(rest.posOrderDiscount.replace(":id", currentOrder.id.toString()), payload);
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                setShowDiscountModal(false);
                setDiscountValue("");
                showToast("Diskon berhasil diterapkan");
            } else {
                showToast(response.message || "Gagal menerapkan diskon", "error");
            }
        } catch (error) {
            console.error("Failed to apply discount:", error);
            showToast("Gagal menerapkan diskon", "error");
        }
    };

    const removeDiscount = async () => {
        if (!currentOrder) return;
        try {
            const response = await put(rest.posOrderDiscount.replace(":id", currentOrder.id.toString()), {
                discountAmount: 0
            });
            if (response.success && response.data) {
                setCurrentOrder(response.data);
            }
        } catch (error) {
            console.error("Failed to remove discount:", error);
        }
    };

    const submitCashMovement = async () => {
        if (!initData?.currentSession || !cashMovementAmount || !cashMovementReason) return;
        const amount = parseFloat(cashMovementAmount);
        if (amount <= 0) return;

        try {
            const response = await post(
                rest.cashierSessionMovement.replace(":id", initData.currentSession.id.toString()),
                {
                    movementType: cashMovementType === "in" ? 3 : 4, // CashIn=3, CashOut=4
                    amount,
                    reason: cashMovementReason
                }
            );
            if (response.success) {
                setShowCashMovementModal(false);
                setCashMovementAmount("");
                setCashMovementReason("");
                await loadInitData();
                showToast(`Kas ${cashMovementType === "in" ? "masuk" : "keluar"} berhasil dicatat`);
            } else {
                showToast(response.message || "Gagal mencatat pergerakan kas", "error");
            }
        } catch (error) {
            console.error("Failed to submit cash movement:", error);
            showToast("Gagal mencatat pergerakan kas", "error");
        }
    };

    // ============================================
    // COMPUTED VALUES
    // ============================================
    const getFilteredServices = (): ServiceVariant[] => {
        if (!initData) return [];
        let services: ServiceVariant[];
        if (selectedCategory === null) {
            services = initData.categories.flatMap(c => c.services);
        } else {
            const cat = initData.categories.find(c => c.id === selectedCategory);
            services = cat?.services || [];
        }
        if (serviceSearch.trim()) {
            const q = serviceSearch.toLowerCase();
            services = services.filter(s => s.displayName.toLowerCase().includes(q) || s.serviceName.toLowerCase().includes(q));
        }
        return services;
    };

    const calculateTotalDuration = () => currentOrder?.items.reduce((sum, item) => sum + item.duration * item.quantity, 0) || 0;

    const getPaymentMethod = (id: number) => initData?.paymentMethods.find(pm => pm.id === id);

    // ============================================
    // LOADING STATE
    // ============================================
    if (loading) {
        return (
            <div className="pos-container">
                <div className="pos-main">
                    <div className="pos-skeleton-header" />
                    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
                        <div className="pos-skeleton-sidebar" />
                        <div style={{ flex: 1, padding: "24px" }}>
                            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="pos-skeleton-chip" />)}
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" }}>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="pos-skeleton-card" />)}
                            </div>
                        </div>
                    </div>
                </div>
                <aside className="pos-sidebar">
                    <div style={{ padding: "24px" }}>
                        <div className="pos-skeleton-chip" style={{ width: "60%", height: "20px", marginBottom: "8px" }} />
                        <div className="pos-skeleton-chip" style={{ width: "40%", height: "14px" }} />
                    </div>
                </aside>
            </div>
        );
    }

    // ============================================
    // RENDER - NO SESSION GATE
    // ============================================
    if (!initData?.hasOpenSession) {
        return (
            <div className="pos-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}>
                <div className="modal-content" style={{
                    background: "var(--bg-card)",
                    borderRadius: "24px",
                    padding: "40px",
                    width: "100%",
                    maxWidth: "440px",
                    boxShadow: "var(--shadow-lg)"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "28px" }}>
                        <div style={{
                            width: "90px",
                            height: "90px",
                            background: "var(--spa-green-bg)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px"
                        }}>
                            <i className="fa-solid fa-cash-register" style={{ fontSize: "40px", color: "var(--spa-green)" }}></i>
                        </div>
                        <h2 style={{ marginBottom: "10px", fontSize: "24px" }}>Buka Sesi Kasir</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>
                            Belum ada sesi kasir yang terbuka. Untuk memulai transaksi POS, silakan buka sesi kasir terlebih dahulu.
                        </p>
                    </div>
                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                            Kas Awal (Rp)
                        </label>
                        <input
                            type="number"
                            value={openingCash}
                            onChange={(e) => setOpeningCash(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleOpenSession()}
                            placeholder="500000"
                            className="search-input"
                            autoFocus
                            style={{ width: "100%", padding: "16px", fontSize: "22px", textAlign: "right", fontWeight: 700 }}
                        />
                        <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                            {[200000, 500000, 1000000].map(amount => (
                                <button
                                    key={amount}
                                    onClick={() => setOpeningCash(amount.toString())}
                                    style={{
                                        padding: "6px 14px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        background: openingCash === amount.toString() ? "var(--spa-green-bg)" : "var(--bg-main)",
                                        color: openingCash === amount.toString() ? "var(--spa-green)" : "var(--text-muted)",
                                        border: openingCash === amount.toString() ? "1.5px solid var(--spa-green)" : "1.5px solid var(--border-color)",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                    }}
                                >
                                    {formatCurrency(amount)}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                        <Link
                            href="/dashboard"
                            className="action-btn secondary"
                            style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            Kembali
                        </Link>
                        <button
                            className="action-btn primary"
                            onClick={handleOpenSession}
                            style={{ flex: 1 }}
                            disabled={isProcessing}
                            aria-busy={isProcessing}
                        >
                            <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-play'}`}></i>
                            {isProcessing ? 'Memproses...' : 'Mulai Sesi'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ============================================
    // RENDER - MAIN POS (session is open)
    // ============================================
    return (
        <div className="pos-container">
            {/* Toast Notification */}
            {toast && (
                <div className={`pos-toast pos-toast-${toast.type}`}>
                    <i className={`fa-solid ${toast.type === "success" ? "fa-check-circle" : toast.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}`}></i>
                    <span>{toast.message}</span>
                </div>
            )}

            {/* Main Area */}
            <div className="pos-main">
                {/* Header */}
                <header className="pos-header">
                    <Link href="/dashboard" className="pos-logo">
                        <div className="pos-logo-icon">
                            <i className="fa-solid fa-spa"></i>
                        </div>
                        <div className="pos-logo-text">The <span>Green</span> Spa</div>
                    </Link>

                    <div className="pos-header-center">
                        <div className="pos-tabs">
                            <button
                                className={`pos-tab ${mode === "session" ? "active" : ""}`}
                                onClick={() => setMode("session")}
                            >
                                <i className="fa-solid fa-spa"></i>
                                Sesi Baru
                            </button>
                            <button
                                className={`pos-tab ${mode === "voucher" ? "active" : ""}`}
                                onClick={() => setMode("voucher")}
                            >
                                <i className="fa-solid fa-ticket"></i>
                                Jual Voucher
                            </button>
                            <button
                                className={`pos-tab ${mode === "redeem" ? "active" : ""}`}
                                onClick={() => setMode("redeem")}
                            >
                                <i className="fa-solid fa-gift"></i>
                                Redeem
                            </button>
                        </div>
                    </div>

                    <div className="pos-header-actions">
                        {/* Session Info */}
                        {initData?.hasOpenSession && initData.currentSession && (
                            <div className="session-info-badge">
                                <span style={{ color: "var(--spa-green)", fontWeight: 600 }}>
                                    <i className="fa-solid fa-circle" style={{ fontSize: "6px", marginRight: "4px" }}></i>
                                    {initData.currentSession.sessionCode}
                                </span>
                                <span style={{ color: "var(--text-muted)" }}>
                                    {initData.currentSession.userName}
                                </span>
                            </div>
                        )}
                        <Link href="/dashboard" className="header-btn back" title="Kembali ke Backend">
                            <i className="fa-solid fa-arrow-left"></i>
                            Backend
                        </Link>
                        <Link href="/dashboard/sales" className="header-btn" title="Riwayat Penjualan">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </Link>
                        {initData?.hasOpenSession && (
                            <>
                                <button
                                    className="header-btn"
                                    title="Kas Masuk"
                                    onClick={() => { setCashMovementType("in"); setShowCashMovementModal(true); }}
                                    style={{ color: "#059669", gap: "4px" }}
                                >
                                    <i className="fa-solid fa-arrow-down"></i>
                                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Kas+</span>
                                </button>
                                <button
                                    className="header-btn"
                                    title="Kas Keluar"
                                    onClick={() => { setCashMovementType("out"); setShowCashMovementModal(true); }}
                                    style={{ color: "#ef4444", gap: "4px" }}
                                >
                                    <i className="fa-solid fa-arrow-up"></i>
                                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Kas-</span>
                                </button>
                            </>
                        )}
                        {initData?.hasOpenSession && (
                            <button 
                                className="header-btn" 
                                title="Tutup Sesi Kasir"
                                onClick={openCloseSessionModal}
                                style={{ color: "#ef4444", gap: "6px" }}
                            >
                                <i className="fa-solid fa-power-off"></i>
                                <span style={{ fontSize: "12px", fontWeight: 600 }}>Tutup Sesi</span>
                            </button>
                        )}
                        <button className="header-btn scan">
                            <i className="fa-solid fa-qrcode"></i>
                            Scan
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="pos-content">
                    {/* Member Panel */}
                    <aside className="member-panel">
                        <div className="member-search" style={{ position: "relative" }}>
                            <div className="member-search-row">
                                <div className="search-input-wrapper">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input 
                                        type="text" 
                                        className="search-input" 
                                        placeholder="Cari member..." 
                                        value={memberSearch}
                                        onChange={(e) => {
                                            setMemberSearch(e.target.value);
                                            searchMembers(e.target.value);
                                            setShowMemberDropdown(true);
                                        }}
                                        onFocus={() => setShowMemberDropdown(true)}
                                    />
                                </div>
                                <button className="btn-add-member" title="Tambah Member Baru">
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>

                            {/* Member Search Dropdown */}
                            {showMemberDropdown && memberResults.length > 0 && (
                                <div style={{ 
                                    position: "absolute", 
                                    top: "100%", 
                                    left: 16, 
                                    right: 16, 
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border-color)",
                                    borderRadius: "12px",
                                    boxShadow: "var(--shadow-lg)",
                                    zIndex: 100,
                                    maxHeight: "250px",
                                    overflowY: "auto"
                                }}>
                                    {memberResults.map(member => (
                                        <div 
                                            key={member.id}
                                            onClick={() => setOrderMember(member)}
                                            style={{
                                                padding: "12px 16px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid var(--border-color)",
                                                transition: "background 0.2s"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-main)"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                                        >
                                            <div style={{ fontWeight: 600 }}>{member.name}</div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                                {member.phone}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="member-info">
                            {(selectedMember || currentOrder?.memberId) ? (
                                <>
                                    {/* Member Card */}
                                    <div className="member-card">
                                        <div className="member-header">
                                            <div className="member-avatar">
                                                {(selectedMember?.name || currentOrder?.memberName || "G").charAt(0)}
                                            </div>
                                            <div className="member-details">
                                                <h4>{selectedMember?.name || currentOrder?.memberName}</h4>
                                                <p><i className="fa-solid fa-phone"></i> {selectedMember?.phone || currentOrder?.memberPhone}</p>
                                            </div>
                                        </div>
                                        <div className="member-stats">
                                            <div className="member-stat">
                                                <div className="member-stat-value">
                                                    {selectedMember?.creditBalance?.totalBalance || currentOrder?.memberCreditBalance || 0}
                                                </div>
                                                <div className="member-stat-label">Saldo</div>
                                            </div>
                                            <div className="member-stat">
                                                <div className="member-stat-value">{selectedMember?.totalVisits || 0}</div>
                                                <div className="member-stat-label">Kunjungan</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove Member Button */}
                                    <button 
                                        onClick={() => setOrderMember(null)}
                                        style={{
                                            width: "100%",
                                            padding: "10px",
                                            background: "var(--accent-red-light)",
                                            border: "none",
                                            borderRadius: "10px",
                                            color: "var(--accent-red)",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            marginBottom: "16px",
                                            fontSize: "13px"
                                        }}
                                    >
                                        <i className="fa-solid fa-xmark" style={{ marginRight: "6px" }}></i>
                                        Hapus Member
                                    </button>

                                    {/* Body Preferences */}
                                    {selectedMember?.avoidAreas && selectedMember.avoidAreas.length > 0 && (
                                        <div className="info-section">
                                            <div className="info-section-title">
                                                <i className="fa-solid fa-circle-exclamation"></i>
                                                Area Hindari Pijat
                                            </div>
                                            <div className="body-tags">
                                                {selectedMember.avoidAreas.map((area) => (
                                                    <span key={area} className="body-tag avoid">✕ {area}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Active Vouchers */}
                                    {selectedMember?.vouchers && selectedMember.vouchers.length > 0 && (
                                        <div className="info-section">
                                            <div className="info-section-title">
                                                <i className="fa-solid fa-ticket"></i>
                                                Voucher Aktif
                                            </div>
                                            {selectedMember.vouchers.map((voucher, idx) => (
                                                <div key={idx} className="voucher-mini">
                                                    <div className="voucher-mini-header">
                                                        <span className="voucher-mini-name">{voucher.name}</span>
                                                        <span className="voucher-mini-count">{voucher.remaining} sesi</span>
                                                    </div>
                                                    <div className="voucher-mini-exp">Exp: {voucher.expiryDate}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Favorite Therapist */}
                                    {selectedMember?.favoriteTherapistName && (
                                        <div className="info-section">
                                            <div className="info-section-title">
                                                <i className="fa-solid fa-heart"></i>
                                                Favorit
                                            </div>
                                            <div className="fav-therapist">
                                                <i className="fa-solid fa-star"></i>
                                                <span>{selectedMember.favoriteTherapistName}</span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    padding: "32px 20px",
                                    textAlign: "center",
                                    color: "var(--text-muted)"
                                }}>
                                    <div style={{
                                        width: "72px", height: "72px",
                                        background: "var(--spa-green-bg)",
                                        borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        margin: "0 auto 16px",
                                        border: "2px dashed var(--spa-green-border)"
                                    }}>
                                        <i className="fa-solid fa-user-plus" style={{ fontSize: "24px", color: "var(--spa-green)" }}></i>
                                    </div>
                                    <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                        Belum ada member
                                    </p>
                                    <p style={{ fontSize: "12px", lineHeight: 1.5 }}>
                                        Cari nama atau nomor HP di kotak pencarian, atau lanjutkan sebagai guest
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Service Area - Session Mode */}
                    {mode === "session" && (
                        <div className="service-area">
                            <div className="service-toolbar">
                                <div className="service-search-wrapper">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        className="service-search-input"
                                        placeholder="Cari layanan..."
                                        value={serviceSearch}
                                        onChange={(e) => setServiceSearch(e.target.value)}
                                        aria-label="Cari layanan"
                                    />
                                    {serviceSearch && (
                                        <button className="service-search-clear" onClick={() => setServiceSearch("")}>
                                            <i className="fa-solid fa-xmark"></i>
                                        </button>
                                    )}
                                </div>
                                <div className="service-categories">
                                    <button
                                        className={`category-chip ${selectedCategory === null ? "active" : ""}`}
                                        onClick={() => setSelectedCategory(null)}
                                    >
                                        Semua
                                    </button>
                                    {initData?.categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="service-grid-wrapper">
                                {getFilteredServices().length === 0 && (
                                    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                                        <i className="fa-solid fa-search" style={{ fontSize: "36px", marginBottom: "16px", opacity: 0.3 }}></i>
                                        <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                                            Layanan tidak ditemukan
                                        </p>
                                        <p style={{ fontSize: "13px" }}>
                                            Coba kata kunci lain atau pilih kategori berbeda
                                        </p>
                                    </div>
                                )}
                                <div className="service-grid">
                                    {getFilteredServices().map((variant) => {
                                        const isInCart = currentOrder?.items.some(i => i.serviceVariantId === variant.id);
                                        const serviceType = variant.serviceName.toLowerCase().includes("massage") ? "massage" :
                                            variant.serviceName.toLowerCase().includes("aroma") ? "aroma" :
                                            variant.serviceName.toLowerCase().includes("stone") ? "stone" :
                                            variant.serviceName.toLowerCase().includes("reflex") ? "reflex" :
                                            variant.serviceName.toLowerCase().includes("scrub") ? "scrub" :
                                            variant.serviceName.toLowerCase().includes("facial") ? "facial" :
                                            variant.serviceName.toLowerCase().includes("signature") ? "signature" : "tissue";
                                        
                                        return (
                                            <div
                                                key={variant.id}
                                                className={`service-item ${serviceType} ${isInCart ? "selected" : ""}`}
                                                onClick={() => addServiceToCart(variant)}
                                            >
                                                <div className="service-icon">
                                                    <i className={`fa-solid ${variant.icon || "fa-spa"}`}></i>
                                                </div>
                                                <div className="service-name">{variant.displayName}</div>
                                                <div className="service-meta">
                                                    <span><i className="fa-regular fa-clock"></i> {variant.duration} min</span>
                                                </div>
                                                <div className="service-price">{formatCurrency(variant.price)}</div>
                                                <button className="service-add-btn" onClick={(e) => { e.stopPropagation(); addServiceToCart(variant); }}>
                                                    <i className="fa-solid fa-plus"></i>
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voucher Packages */}
                    {mode === "voucher" && (
                        <div className="service-area">
                            <div className="service-grid-wrapper">
                                {(!initData?.packages || initData.packages.length === 0) && (
                                    <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
                                        <div style={{
                                            width: "80px", height: "80px",
                                            background: "var(--accent-purple-light)",
                                            borderRadius: "50%",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            margin: "0 auto 20px"
                                        }}>
                                            <i className="fa-solid fa-ticket" style={{ fontSize: "32px", color: "var(--accent-purple)" }}></i>
                                        </div>
                                        <p style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                                            Belum Ada Paket Voucher
                                        </p>
                                        <p style={{ fontSize: "13px", maxWidth: "320px", margin: "0 auto" }}>
                                            Paket voucher belum dikonfigurasi. Buat paket voucher di menu pengaturan backend.
                                        </p>
                                    </div>
                                )}
                                <div className="package-grid">
                                    {initData?.packages.map((pkg, idx) => {
                                        const pkgType = idx === 0 ? "hemat" : idx === 1 ? "premium" : idx === 2 ? "vip" : "signature";
                                        return (
                                            <div
                                                key={pkg.id}
                                                className={`package-card ${pkgType} ${selectedPackage === pkg.id ? "selected" : ""}`}
                                                onClick={() => addPackageToCart(pkg)}
                                            >
                                                {pkg.savings && pkg.savings > 0 && (
                                                    <div className="package-badge">
                                                        Hemat {Math.round((pkg.savings / (pkg.price + pkg.savings)) * 100)}%
                                                    </div>
                                                )}
                                                <div className="package-name">{pkg.name}</div>
                                                <div className="package-desc">
                                                    {pkg.serviceVariantName || pkg.description || "Paket hemat untuk pelanggan setia"}
                                                </div>
                                                <div className="package-price">{formatCurrency(pkg.price)}</div>
                                                <div className="package-details">
                                                    <div className="package-detail">
                                                        <div className="package-detail-value">{pkg.totalSessions}</div>
                                                        <div className="package-detail-label">Sesi</div>
                                                    </div>
                                                    <div className="package-detail">
                                                        <div className="package-detail-value">{pkg.validityDays}</div>
                                                        <div className="package-detail-label">Hari</div>
                                                    </div>
                                                    <div className="package-detail">
                                                        <div className="package-detail-value">{formatCurrency(pkg.pricePerSession).replace("Rp ", "")}</div>
                                                        <div className="package-detail-label">/Sesi</div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Redeem Content */}
                    {mode === "redeem" && (
                        <div className="service-area">
                            <div className="service-grid-wrapper" style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px", margin: "0 auto", paddingTop: "40px" }}>
                                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                                    <h2 style={{ fontSize: "28px", marginBottom: "10px", color: "var(--text-primary)" }}>Redeem Voucher</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "15px" }}>Scan atau masukkan kode voucher member</p>
                                </div>

                                <div style={{
                                    width: "220px",
                                    height: "220px",
                                    margin: "0 auto 28px",
                                    background: "var(--bg-main)",
                                    borderRadius: "24px",
                                    border: "3px dashed var(--border-color)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer"
                                }}>
                                    <i className="fa-solid fa-qrcode" style={{ fontSize: "70px", color: "var(--text-muted)" }}></i>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "18px", margin: "24px 0" }}>
                                    <div style={{ flex: 1, height: "2px", background: "var(--border-color)" }}></div>
                                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>atau masukkan kode manual</span>
                                    <div style={{ flex: 1, height: "2px", background: "var(--border-color)" }}></div>
                                </div>

                                <div style={{ display: "flex", gap: "12px" }}>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Masukkan kode voucher..."
                                        style={{ flex: 1, padding: "18px", fontSize: "16px", textAlign: "center" }}
                                    />
                                    <button className="action-btn primary" style={{ width: "auto", padding: "18px 28px" }}>
                                        Validasi
                                    </button>
                                </div>

                                {selectedMember?.vouchers && selectedMember.vouchers.length > 0 && (
                                    <div style={{ marginTop: "36px" }}>
                                        <h4 style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Voucher Member Ini:</h4>

                                        {selectedMember.vouchers.map((voucher, idx) => (
                                            <div key={idx} className={`package-card ${idx === 0 ? "hemat" : "signature"}`} style={{ cursor: "pointer", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <div className="package-name" style={{ fontSize: "18px" }}>{voucher.name}</div>
                                                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                                                            <i className="fa-regular fa-calendar"></i> Exp: {voucher.expiryDate}
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontSize: "40px", fontWeight: 800, color: idx === 0 ? "var(--accent-cyan)" : "var(--accent-pink)" }}>{voucher.remaining}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>sesi tersisa</div>
                                                    </div>
                                                </div>
                                                <button
                                                    className="action-btn primary"
                                                    style={{ width: "100%", marginTop: "18px" }}
                                                    onClick={() => setMode("session")}
                                                >
                                                    <i className="fa-solid fa-play"></i>
                                                    Gunakan Sekarang
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pending Orders Bar */}
                {pendingOrders.length > 0 && (
                    <div style={{ 
                        padding: "12px 24px", 
                        background: "var(--bg-card)",
                        borderTop: "1px solid var(--border-color)",
                        display: "flex",
                        gap: "12px",
                        alignItems: "center",
                        overflowX: "auto"
                    }}>
                        <span style={{ fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap", fontWeight: 600 }}>
                            <i className="fa-solid fa-clock" style={{ marginRight: "6px" }}></i>
                            Pending:
                        </span>
                        {pendingOrders.map(order => (
                            <div
                                key={order.id}
                                onClick={() => selectOrder(order.id)}
                                style={{
                                    padding: "10px 16px",
                                    background: currentOrder?.id === order.id ? "var(--spa-green-bg)" : "var(--bg-main)",
                                    border: currentOrder?.id === order.id ? "2px solid var(--spa-green)" : "1px solid var(--border-color)",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    minWidth: "130px",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: "13px" }}>#{order.saleCode.split("-").pop()}</div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {order.memberName || "Guest"} • {order.totalItems} item
                                </div>
                                <div style={{ fontWeight: 700, color: "var(--spa-green)", marginTop: "4px", fontSize: "13px" }}>
                                    {formatCurrency(order.grandTotal)}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => { setCurrentOrder(null); setSelectedMember(null); }}
                            style={{
                                padding: "10px 20px",
                                background: "var(--spa-green-bg)",
                                border: "2px dashed var(--spa-green)",
                                borderRadius: "12px",
                                cursor: "pointer",
                                color: "var(--spa-green)",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                minWidth: "110px",
                                justifyContent: "center",
                                fontSize: "13px"
                            }}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Baru
                        </button>
                    </div>
                )}
            </div>

            {/* Mobile Cart Overlay */}
            {showMobileCart && (
                <div className="mobile-cart-overlay" onClick={() => setShowMobileCart(false)} />
            )}

            {/* Floating Cart Button (Mobile) */}
            <button
                className="mobile-cart-fab"
                onClick={() => setShowMobileCart(!showMobileCart)}
            >
                <i className="fa-solid fa-cart-shopping"></i>
                {currentOrder && currentOrder.items.length > 0 && (
                    <span className="mobile-cart-badge">{currentOrder.items.length}</span>
                )}
            </button>

            {/* Cart Sidebar */}
            <aside className={`pos-sidebar ${showMobileCart ? "open" : ""}`}>
                <div className="cart-header">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <div className="cart-title">
                                {currentOrder ? `Order #${currentOrder.saleCode.split("-").pop()}` : "Keranjang"}
                            </div>
                            <div className="cart-subtitle">
                                {currentOrder?.items.length || 0} item • {calculateTotalDuration()} menit
                            </div>
                        </div>
                        <button
                            className="mobile-cart-close"
                            onClick={() => setShowMobileCart(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>

                <div className="cart-items">
                    {!currentOrder || currentOrder.items.length === 0 ? (
                        <div className="cart-empty">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <h4>Keranjang Kosong</h4>
                            <p>Pilih layanan untuk memulai</p>
                        </div>
                    ) : (
                        currentOrder.items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-header">
                                    <span className="cart-item-name">{item.itemName}</span>
                                    <button className="cart-item-remove" onClick={() => removeItem(item.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                                <div className="cart-item-details">
                                    <span className="cart-item-meta">
                                        {item.duration > 0 ? `${item.duration} menit` : item.itemDescription}
                                    </span>
                                    <div className="cart-item-qty">
                                        <button className="qty-btn" onClick={() => updateItemQuantity(item.id, -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => updateItemQuantity(item.id, 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                    <span className="cart-item-price">{formatCurrency(item.subtotal)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Therapist Selection */}
                {mode === "session" && currentOrder && currentOrder.items.length > 0 && initData?.therapists && initData.therapists.length > 0 && (
                    <div className="therapist-section">
                        <div className="therapist-section-title">Pilih Therapist</div>
                        <div className="therapist-carousel">
                            {initData.therapists.map((therapist) => {
                                const isBusy = therapist.status === "Busy" || therapist.status === "InSession";
                                return (
                                    <div
                                        key={therapist.id}
                                        className={`therapist-chip ${isBusy ? "busy" : ""} ${selectedTherapist === therapist.id ? "selected" : ""}`}
                                        onClick={() => !isBusy && setSelectedTherapist(therapist.id)}
                                    >
                                        <div className="therapist-chip-avatar">{therapist.name.charAt(0)}</div>
                                        <div className="therapist-chip-info">
                                            <div className="therapist-chip-name">
                                                {therapist.name}
                                                {therapist.queueNumber && <span className="queue-badge">#{therapist.queueNumber}</span>}
                                            </div>
                                            <div className={`therapist-chip-status ${isBusy ? "busy" : "available"}`}>
                                                <span className={`status-dot ${isBusy ? "busy" : "available"}`}></span>
                                                {isBusy ? (therapist.currentService || "Sibuk") : "Tersedia"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="cart-summary">
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatCurrency(currentOrder?.subtotal || 0)}</span>
                    </div>
                    {((currentOrder?.discountAmount || 0) > 0 || (currentOrder && currentOrder.items.length > 0)) && (
                        <div className="summary-row" style={{ cursor: currentOrder ? "pointer" : "default" }} onClick={() => currentOrder && currentOrder.items.length > 0 && setShowDiscountModal(true)}>
                            <span className="summary-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                Diskon
                                {currentOrder && currentOrder.items.length > 0 && (
                                    <i className="fa-solid fa-pen-to-square" style={{ fontSize: "10px", color: "var(--text-muted)" }}></i>
                                )}
                            </span>
                            <span className="summary-value" style={{ color: (currentOrder?.discountAmount || 0) > 0 ? "var(--accent-red)" : "var(--text-muted)" }}>
                                {(currentOrder?.discountAmount || 0) > 0 ? `- ${formatCurrency(currentOrder!.discountAmount)}` : "Tambah"}
                            </span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">{formatCurrency(currentOrder?.grandTotal || 0)}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="cart-actions">
                    {currentOrder && currentOrder.items.length > 0 && (
                        <button
                            className="action-btn secondary"
                            onClick={holdOrder}
                            disabled={isProcessing}
                            aria-busy={isProcessing}
                        >
                            <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-pause'}`}></i>
                            {isProcessing ? 'Memproses...' : 'Hold'}
                        </button>
                    )}
                    <button 
                        className="action-btn primary" 
                        onClick={openPaymentModal}
                        disabled={!currentOrder || currentOrder.items.length === 0}
                        style={{ opacity: (!currentOrder || currentOrder.items.length === 0) ? 0.5 : 1 }}
                    >
                        <i className="fa-solid fa-credit-card"></i>
                        Bayar
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Tabs */}
            <nav className="mobile-bottom-tabs">
                <button
                    className={`mobile-tab ${mode === "session" ? "active" : ""}`}
                    onClick={() => setMode("session")}
                >
                    <i className="fa-solid fa-spa"></i>
                    <span>Sesi Baru</span>
                </button>
                <button
                    className={`mobile-tab ${mode === "voucher" ? "active" : ""}`}
                    onClick={() => setMode("voucher")}
                >
                    <i className="fa-solid fa-ticket"></i>
                    <span>Voucher</span>
                </button>
                <button
                    className={`mobile-tab ${mode === "redeem" ? "active" : ""}`}
                    onClick={() => setMode("redeem")}
                >
                    <i className="fa-solid fa-gift"></i>
                    <span>Redeem</span>
                </button>
            </nav>

            {/* ============================================ */}
            {/* MODALS */}
            {/* ============================================ */}

            {/* Close Session Modal */}
            {showCloseSessionModal && (
                <div className="modal-overlay" style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="modal-content" style={{
                        background: "var(--bg-card)",
                        borderRadius: "24px",
                        padding: "32px",
                        width: "100%",
                        maxWidth: "480px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "var(--shadow-lg)"
                    }}>
                        {/* Header */}
                        <div style={{ textAlign: "center", marginBottom: "24px" }}>
                            <div style={{
                                width: "64px", height: "64px",
                                background: "var(--accent-red-light)",
                                borderRadius: "50%",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px"
                            }}>
                                <i className="fa-solid fa-power-off" style={{ fontSize: "28px", color: "var(--accent-red)" }}></i>
                            </div>
                            <h2 style={{ marginBottom: "6px" }}>Tutup Sesi Kasir</h2>
                            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                {initData?.currentSession?.sessionCode} • {initData?.currentSession?.userName}
                            </p>
                        </div>

                        {loadingSessionDetail ? (
                            <div style={{ textAlign: "center", padding: "30px 0" }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }}></i>
                                <div style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 13 }}>Memuat ringkasan sesi...</div>
                            </div>
                        ) : (
                            <>
                                {/* Sales Summary */}
                                <div style={{
                                    background: "linear-gradient(135deg, #059669, #14b8a6)",
                                    borderRadius: "16px", padding: "20px", marginBottom: "20px", color: "white"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                        <span style={{ opacity: 0.85, fontSize: 13 }}>Total Transaksi</span>
                                        <span style={{ fontWeight: 700 }}>{sessionDetail?.totalSales || 0} transaksi</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ opacity: 0.85, fontSize: 13 }}>Total Penjualan</span>
                                        <span style={{ fontWeight: 800, fontSize: 20 }}>
                                            {formatCurrency(sessionDetail?.totalSalesAmount || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Payment Breakdown */}
                                {sessionDetail?.paymentBreakdown && sessionDetail.paymentBreakdown.length > 0 && (
                                    <div style={{
                                        background: "var(--bg-main)", borderRadius: "14px",
                                        padding: "16px", marginBottom: "20px"
                                    }}>
                                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--text-secondary)" }}>
                                            <i className="fa-solid fa-chart-pie" style={{ marginRight: 6 }}></i>
                                            Rincian per Metode Pembayaran
                                        </div>
                                        {sessionDetail.paymentBreakdown.map((pm: any, idx: number) => (
                                            <div key={idx} style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                padding: "10px 0",
                                                borderBottom: idx < sessionDetail.paymentBreakdown.length - 1 ? "1px solid var(--border-color)" : "none"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                    <div style={{
                                                        width: 32, height: 32, borderRadius: 8,
                                                        background: pm.isCash ? "#ecfdf5" : "#eff6ff",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: 14, color: pm.isCash ? "#059669" : "#3b82f6"
                                                    }}>
                                                        <i className={`fa-solid ${pm.isCash ? "fa-money-bill-wave" : pm.paymentMethodCode === "QRIS" ? "fa-qrcode" : "fa-credit-card"}`}></i>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 13 }}>{pm.paymentMethodName}</div>
                                                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{pm.transactionCount} transaksi</div>
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 14, color: pm.isCash ? "#059669" : "#3b82f6" }}>
                                                    {formatCurrency(pm.totalAmount)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Cash Summary */}
                                <div style={{
                                    background: "var(--bg-main)", borderRadius: "14px",
                                    padding: "16px", marginBottom: "24px"
                                }}>
                                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12, color: "var(--text-secondary)" }}>
                                        <i className="fa-solid fa-coins" style={{ marginRight: 6 }}></i>
                                        Perhitungan Kas
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border-color)" }}>
                                        <span style={{ color: "var(--text-muted)" }}>Kas Awal</span>
                                        <span style={{ fontWeight: 600 }}>{formatCurrency(initData?.currentSession?.openingCash || 0)}</span>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border-color)" }}>
                                        <span style={{ color: "var(--text-muted)" }}>+ Penjualan Tunai</span>
                                        <span style={{ fontWeight: 600, color: "#059669" }}>+ {formatCurrency(sessionDetail?.totalCashReceived || 0)}</span>
                                    </div>
                                    {(sessionDetail?.totalNonCashReceived || 0) > 0 && (
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 13, borderBottom: "1px solid var(--border-color)" }}>
                                            <span style={{ color: "var(--text-muted)" }}>Non-Tunai (tidak di kas)</span>
                                            <span style={{ color: "var(--text-muted)" }}>{formatCurrency(sessionDetail?.totalNonCashReceived || 0)}</span>
                                        </div>
                                    )}
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 4px", fontWeight: 800, fontSize: 17 }}>
                                        <span>Kas Diharapkan</span>
                                        <span style={{ color: "var(--spa-green)" }}>
                                            {formatCurrency(
                                                (initData?.currentSession?.openingCash || 0) + (sessionDetail?.totalCashReceived || 0)
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Kas Aktual Input */}
                                <div style={{ marginBottom: "16px" }}>
                                    <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                        Kas Aktual (Rp) — Hitung uang tunai di laci
                                    </label>
                                    <input
                                        type="number"
                                        value={closingCash}
                                        onChange={(e) => setClosingCash(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleCloseSession()}
                                        placeholder="0"
                                        className="search-input"
                                        style={{ width: "100%", padding: "16px", fontSize: "22px", textAlign: "right", fontWeight: 700 }}
                                    />
                                </div>

                                {/* Difference indicator */}
                                {closingCash && (() => {
                                    const expected = (initData?.currentSession?.openingCash || 0) + (sessionDetail?.totalCashReceived || 0);
                                    const actual = parseFloat(closingCash) || 0;
                                    const diff = actual - expected;
                                    if (diff === 0) return (
                                        <div style={{ padding: "10px 16px", borderRadius: 10, background: "#ecfdf5", color: "#059669", fontWeight: 600, fontSize: 13, marginBottom: 20, textAlign: "center" }}>
                                            <i className="fa-solid fa-check-circle" style={{ marginRight: 6 }}></i>
                                            Kas seimbang
                                        </div>
                                    );
                                    return (
                                        <div style={{
                                            padding: "10px 16px", borderRadius: 10,
                                            background: diff > 0 ? "#eff6ff" : "#fef2f2",
                                            color: diff > 0 ? "#3b82f6" : "#ef4444",
                                            fontWeight: 600, fontSize: 13, marginBottom: 20,
                                            display: "flex", justifyContent: "space-between"
                                        }}>
                                            <span>
                                                <i className={`fa-solid ${diff > 0 ? "fa-arrow-up" : "fa-arrow-down"}`} style={{ marginRight: 6 }}></i>
                                                {diff > 0 ? "Kas lebih" : "Kas kurang"}
                                            </span>
                                            <span>{formatCurrency(Math.abs(diff))}</span>
                                        </div>
                                    );
                                })()}

                                {/* Action Buttons */}
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <button
                                        className="action-btn secondary"
                                        onClick={() => { setShowCloseSessionModal(false); setSessionDetail(null); }}
                                        style={{ flex: 1 }}
                                    >
                                        Batal
                                    </button>
                                    <button
                                        className="action-btn primary"
                                        onClick={handleCloseSession}
                                        style={{ flex: 1, background: "var(--accent-red)" }}
                                        disabled={isProcessing}
                                        aria-busy={isProcessing}
                                    >
                                        <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-power-off'}`}></i>
                                        {isProcessing ? 'Memproses...' : 'Tutup Sesi'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && currentOrder && (
                <div className="modal-overlay" style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: "var(--bg-card)",
                        borderRadius: "24px",
                        padding: "32px",
                        width: "100%",
                        maxWidth: "500px",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        boxShadow: "var(--shadow-lg)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0 }}>Pembayaran</h2>
                            <button 
                                onClick={() => setShowPaymentModal(false)}
                                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-muted)" }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div style={{ 
                            background: "var(--spa-green-bg)", 
                            padding: "20px", 
                            borderRadius: "16px", 
                            marginBottom: "24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>Total Tagihan</div>
                            <div style={{ fontSize: "36px", fontWeight: 800, color: "var(--spa-green)" }}>
                                {formatCurrency(currentOrder.grandTotal)}
                            </div>
                        </div>

                        {/* Payment Methods */}
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "12px", fontWeight: 600 }}>Pilih Metode Pembayaran</label>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                                {initData?.paymentMethods.map(pm => (
                                    <button
                                        key={pm.id}
                                        onClick={() => setSelectedPaymentMethod(pm)}
                                        style={{
                                            padding: "14px 8px",
                                            background: selectedPaymentMethod?.id === pm.id ? "var(--spa-green-bg)" : "var(--bg-main)",
                                            border: selectedPaymentMethod?.id === pm.id ? "2px solid var(--spa-green)" : "2px solid var(--border-color)",
                                            borderRadius: "12px",
                                            cursor: "pointer",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            gap: "8px",
                                            transition: "all 0.2s"
                                        }}
                                    >
                                        <i className={`fa-solid ${pm.isCash ? "fa-money-bill-wave" : pm.code === "QRIS" ? "fa-qrcode" : pm.code.includes("DEBIT") ? "fa-credit-card" : "fa-wallet"}`} 
                                           style={{ fontSize: "22px", color: selectedPaymentMethod?.id === pm.id ? "var(--spa-green)" : "var(--text-secondary)" }}></i>
                                        <span style={{ fontSize: "11px", fontWeight: 600, color: selectedPaymentMethod?.id === pm.id ? "var(--spa-green)" : "var(--text-secondary)" }}>{pm.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Amount Input */}
                        {selectedPaymentMethod && (
                            <div style={{ marginBottom: "24px", background: "var(--bg-main)", padding: "16px", borderRadius: "12px" }}>
                                <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "12px", color: "var(--text-muted)" }}>
                                            Jumlah ({selectedPaymentMethod.name})
                                        </label>
                                        <input
                                            type="number"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            className="search-input"
                                            style={{ width: "100%", padding: "12px", textAlign: "right", fontWeight: 700 }}
                                        />
                                    </div>
                                    {selectedPaymentMethod.requiresReference && (
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "12px", color: "var(--text-muted)" }}>
                                                No. Referensi
                                            </label>
                                            <input
                                                type="text"
                                                value={paymentReference}
                                                onChange={(e) => setPaymentReference(e.target.value)}
                                                placeholder="Masukkan ref"
                                                className="search-input"
                                                style={{ width: "100%", padding: "12px" }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={addPaymentEntry}
                                    className="action-btn secondary"
                                    style={{ width: "100%" }}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Tambah Pembayaran
                                </button>
                            </div>
                        )}

                        {/* Payment List */}
                        {payments.length > 0 && (
                            <div style={{ marginBottom: "24px" }}>
                                <label style={{ display: "block", marginBottom: "12px", fontWeight: 600, fontSize: "13px" }}>Rincian Pembayaran</label>
                                {payments.map((payment, idx) => {
                                    const pm = getPaymentMethod(payment.paymentMethodId);
                                    return (
                                        <div key={idx} style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "12px 16px",
                                            background: "var(--bg-main)",
                                            borderRadius: "12px",
                                            marginBottom: "8px"
                                        }}>
                                            <div>
                                                <span style={{ fontWeight: 600 }}>{pm?.name}</span>
                                                {payment.referenceNumber && (
                                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "8px" }}>
                                                        ({payment.referenceNumber})
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <span style={{ fontWeight: 700, color: "var(--spa-green)" }}>{formatCurrency(payment.amount)}</span>
                                                <button 
                                                    onClick={() => removePaymentEntry(idx)}
                                                    style={{ background: "var(--accent-red-light)", border: "none", borderRadius: "8px", padding: "6px 10px", cursor: "pointer", color: "var(--accent-red)" }}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Summary */}
                        <div style={{ 
                            background: "var(--bg-main)", 
                            padding: "16px", 
                            borderRadius: "12px", 
                            marginBottom: "24px" 
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Total Tagihan</span>
                                <span>{formatCurrency(currentOrder.grandTotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Total Dibayar</span>
                                <span style={{ color: "var(--spa-green)", fontWeight: 700 }}>
                                    {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                                </span>
                            </div>
                            {payments.reduce((sum, p) => sum + p.amount, 0) > currentOrder.grandTotal && (
                                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, borderTop: "2px dashed var(--border-color)", paddingTop: "12px", marginTop: "12px", fontSize: "16px" }}>
                                    <span>Kembalian</span>
                                    <span style={{ color: "var(--accent-orange)" }}>
                                        {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0) - currentOrder.grandTotal)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Process Button */}
                        <button 
                            className="action-btn primary" 
                            onClick={processPayment}
                            disabled={isProcessing || payments.length === 0 || payments.reduce((sum, p) => sum + p.amount, 0) < currentOrder.grandTotal}
                            aria-busy={isProcessing}
                            style={{ 
                                width: "100%", 
                                padding: "18px",
                                fontSize: "16px",
                                opacity: (isProcessing || payments.length === 0 || payments.reduce((sum, p) => sum + p.amount, 0) < currentOrder.grandTotal) ? 0.5 : 1
                            }}
                        >
                            <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i>
                            {isProcessing ? 'Memproses...' : 'Proses Pembayaran'}
                        </button>
                    </div>
                </div>
            )}

            {/* Discount Modal */}
            {showDiscountModal && currentOrder && (
                <div className="modal-overlay" style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: "var(--bg-card)", borderRadius: "24px", padding: "32px",
                        width: "100%", maxWidth: "400px", boxShadow: "var(--shadow-lg)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0, fontSize: "20px" }}>Diskon Order</h2>
                            <button onClick={() => setShowDiscountModal(false)}
                                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Tipe Diskon</label>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => setDiscountType("fixed")}
                                    style={{
                                        flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                                        background: discountType === "fixed" ? "var(--spa-green-bg)" : "var(--bg-main)",
                                        border: discountType === "fixed" ? "2px solid var(--spa-green)" : "2px solid var(--border-color)",
                                        color: discountType === "fixed" ? "var(--spa-green)" : "var(--text-secondary)"
                                    }}>
                                    <i className="fa-solid fa-money-bill" style={{ marginRight: "6px" }}></i>Nominal (Rp)
                                </button>
                                <button onClick={() => setDiscountType("percent")}
                                    style={{
                                        flex: 1, padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: 600, fontSize: "13px",
                                        background: discountType === "percent" ? "var(--spa-green-bg)" : "var(--bg-main)",
                                        border: discountType === "percent" ? "2px solid var(--spa-green)" : "2px solid var(--border-color)",
                                        color: discountType === "percent" ? "var(--spa-green)" : "var(--text-secondary)"
                                    }}>
                                    <i className="fa-solid fa-percent" style={{ marginRight: "6px" }}></i>Persen (%)
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: "20px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                {discountType === "fixed" ? "Jumlah Diskon (Rp)" : "Persentase Diskon (%)"}
                            </label>
                            <input
                                type="number" value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
                                placeholder={discountType === "fixed" ? "10000" : "10"}
                                className="search-input" autoFocus
                                style={{ width: "100%", padding: "16px", fontSize: "22px", textAlign: "right", fontWeight: 700 }}
                            />
                            {discountType === "percent" && discountValue && (
                                <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--text-muted)", textAlign: "right" }}>
                                    = {formatCurrency(currentOrder.subtotal * (parseFloat(discountValue) || 0) / 100)}
                                </div>
                            )}
                        </div>

                        <div style={{ background: "var(--bg-main)", padding: "14px", borderRadius: "12px", marginBottom: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "6px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                                <span>{formatCurrency(currentOrder.subtotal)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                                <span style={{ color: "var(--text-muted)" }}>Diskon saat ini</span>
                                <span style={{ color: "var(--spa-green)" }}>- {formatCurrency(currentOrder.discountAmount)}</span>
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            {currentOrder.discountAmount > 0 && (
                                <button className="action-btn secondary" onClick={() => { removeDiscount(); setShowDiscountModal(false); }} style={{ flex: 1 }}>
                                    <i className="fa-solid fa-trash"></i>Hapus Diskon
                                </button>
                            )}
                            <button className="action-btn primary" onClick={applyDiscount}
                                disabled={!discountValue || parseFloat(discountValue) <= 0}
                                style={{ flex: 1, opacity: (!discountValue || parseFloat(discountValue) <= 0) ? 0.5 : 1 }}>
                                <i className="fa-solid fa-check"></i>Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cash Movement Modal */}
            {showCashMovementModal && (
                <div className="modal-overlay" style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: "var(--bg-card)", borderRadius: "24px", padding: "32px",
                        width: "100%", maxWidth: "400px", boxShadow: "var(--shadow-lg)"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ margin: 0, fontSize: "20px" }}>
                                {cashMovementType === "in" ? "Kas Masuk" : "Kas Keluar"}
                            </h2>
                            <button onClick={() => setShowCashMovementModal(false)}
                                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        <div style={{
                            padding: "16px", borderRadius: "14px", marginBottom: "20px", textAlign: "center",
                            background: cashMovementType === "in" ? "#ecfdf5" : "#fef2f2"
                        }}>
                            <i className={`fa-solid ${cashMovementType === "in" ? "fa-arrow-down" : "fa-arrow-up"}`}
                                style={{ fontSize: "32px", color: cashMovementType === "in" ? "#059669" : "#ef4444", marginBottom: "8px" }}></i>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                                {cashMovementType === "in"
                                    ? "Tambah uang tunai ke laci kas"
                                    : "Ambil uang tunai dari laci kas"}
                            </div>
                        </div>

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Jumlah (Rp)</label>
                            <input
                                type="number" value={cashMovementAmount}
                                onChange={(e) => setCashMovementAmount(e.target.value)}
                                placeholder="100000" className="search-input" autoFocus
                                style={{ width: "100%", padding: "16px", fontSize: "22px", textAlign: "right", fontWeight: 700 }}
                            />
                        </div>

                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>Alasan *</label>
                            <input
                                type="text" value={cashMovementReason}
                                onChange={(e) => setCashMovementReason(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && submitCashMovement()}
                                placeholder={cashMovementType === "in" ? "Contoh: Tambahan modal" : "Contoh: Setor ke bank"}
                                className="search-input"
                                style={{ width: "100%", padding: "14px" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="action-btn secondary" onClick={() => setShowCashMovementModal(false)} style={{ flex: 1 }}>
                                Batal
                            </button>
                            <button className="action-btn primary" onClick={submitCashMovement}
                                disabled={!cashMovementAmount || parseFloat(cashMovementAmount) <= 0 || !cashMovementReason}
                                style={{
                                    flex: 1,
                                    background: cashMovementType === "in" ? "var(--spa-green)" : "#ef4444",
                                    opacity: (!cashMovementAmount || parseFloat(cashMovementAmount) <= 0 || !cashMovementReason) ? 0.5 : 1
                                }}>
                                <i className={`fa-solid ${cashMovementType === "in" ? "fa-arrow-down" : "fa-arrow-up"}`}></i>
                                {cashMovementType === "in" ? "Kas Masuk" : "Kas Keluar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
