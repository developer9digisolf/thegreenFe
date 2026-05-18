"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@afx/utils/useApi";
import { formatCurrency } from "@afx/utils/format";
import type { Toast } from "@afx/interfaces/pos.iface";

import { usePosSession } from "@afx/hooks/pos/usePosSession";
import { usePosData, CartItem } from "@afx/hooks/pos/usePosData";
import { usePayment } from "@afx/hooks/pos/usePayment";
import GatekeeperScreen from "@afx/components/pos/GatekeeperScreen";
import SaleHistoryTab from "@afx/components/pos/SaleHistoryTab";
import BookingTab from "@afx/components/pos/BookingTab";
import ModalPayment from "@afx/components/pos/ModalPayment";
import ModalMemberAdd from "@afx/components/pos/ModalMemberAdd";
import { CloseCashierSessionService } from "@afx/services/pos.service";


export default function POSPage() {
    const { get, post } = useApi();

    // ── Toast ──────────────────────────────────────────────────────────────
    const [toast, setToast] = useState<Toast | null>(null);
    const showToast = useCallback(
        (message: string, type: "success" | "error" | "info" = "success") => {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        },
        []
    );

    // ── Core hooks ─────────────────────────────────────────────────────────
    const session = usePosSession(showToast);
    const pos     = usePosData(showToast);
    const payment = usePayment(showToast);

    // ── Local UI state ─────────────────────────────────────────────────────
    const [mode, setMode] = useState<"session" | "voucher" | "credit" | "redeem" | "sale" | "booking">("session");
    const [selectedCategory, setSelectedCategory]   = useState<number | null>(null);
    const [serviceSearch, setServiceSearch]         = useState("");
    const [selectedPackage, setSelectedPackage]     = useState<number | null>(null);
    const [showMobileCart, setShowMobileCart]       = useState(false);
    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountType, setDiscountType]           = useState<"fixed" | "percent">("fixed");
    const [discountValue, setDiscountValue]         = useState("");

    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [actualClosingCash, setActualClosingCash]         = useState("");
    const [isClosingSession, setIsClosingSession]           = useState(false);
    const [isCheckoutProcessing, setIsCheckoutProcessing]   = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [saleRefreshKey, setSaleRefreshKey] = useState(0);
    // ── Computed Variables ─────────────────────────────────────────────────
    const activeBranchId = useMemo<number | null>(
        () => session.activeSession?.branchId ?? session.selectedBranch?.branchId ?? (session.selectedBranch as any)?.id ?? pos.initData?.currentSession?.branchId ?? null,
        [session.activeSession, session.selectedBranch, pos.initData]
    );

    const currentActiveSession =
        pos.initData?.currentSession ||
        session.activeSession ||
        (session.selectedBranch
            ? session.activeSessionsMap[session.selectedBranch.branchId] ||
              session.activeSessionsMap[(session.selectedBranch as any).id]
            : null) ||
        Object.values(session.activeSessionsMap).find((s) => s != null) ||
        null;

    const hasOpenSession = !!currentActiveSession;
    const filteredServices = pos.getFilteredServices(null, serviceSearch);
    const hasCartItems = pos.cartItems && pos.cartItems.length > 0;

    const [bookingCount, setBookingCount] = useState<number>(0);

    const fetchBookingCount = useCallback(async () => {
        const bId = activeBranchId ?? currentActiveSession?.branchId ?? null;
        if (!bId) {
            setBookingCount(0);
            return;
        }
        try {
            const now = new Date();
            const year = now.getFullYear();
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            const res = await get(`pos/bookings?StartDate=${startDate}&EndDate=${endDate}&BranchId=${bId}&Statuses=Confirmed`);
            if (res?.success || res?.meta?.success) {
                const list = res.data?.pageData ?? res.data ?? [];
                const pendingCount = list.filter((bk: any) => bk.status === "Confirmed").length;
                setBookingCount(pendingCount);
            }
        } catch (err) {
            console.error("fetchBookingCount error:", err);
        }
    }, [activeBranchId, currentActiveSession, get]);

    useEffect(() => {
        if (activeBranchId) {
            fetchBookingCount();
        }
    }, [activeBranchId, fetchBookingCount]);

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleContinueSession = useCallback(() => {
        const entry = Object.entries(session.activeSessionsMap).find(([, s]) => s != null);
        if (entry) {
            const bId = parseInt(entry[0]);
            const targetBranch = session.branches.find(b => (b as any).branchId === bId || (b as any).id === bId);
            if (targetBranch) session.setSelectedBranch(targetBranch);
            session.setGateState("READY");
            pos.loadInitData(bId);
        } else {
            const branchId = session.selectedBranch?.branchId ?? null;
            if (!branchId) { showToast("Branch tidak ditemukan, hubungi admin", "error"); return; }
            session.setGateState("READY");
            pos.loadInitData(branchId);
        }
    }, [session, pos, showToast]);

    const handleBack = useCallback(() => {
        if (session.branches.length > 1) session.setGateState("SELECT_BRANCH");
        else window.location.href = "/dashboard";
    }, [session]);

    const handleApplyDiscount = useCallback(() => {
        const val = parseFloat(discountValue);
        if (!val || val <= 0) return;
        if (discountType === "fixed") pos.setCartDiscount(val);
        else pos.setCartDiscount(Math.round((pos.cartSubtotal * val) / 100));
        setShowDiscountModal(false);
        setDiscountValue("");
        showToast("Diskon diterapkan");
    }, [discountType, discountValue, pos, showToast]);

    const handleCloseSession = async () => {
        // --- Log untuk debugging ---
        console.log("currentActiveSession:", currentActiveSession);
        console.log("Session ID yang akan ditutup:", currentActiveSession?.id);
        console.log("Source:", {
            fromInitData: pos.initData?.currentSession?.id,
            fromActiveSession: session.activeSession?.id,
            fromMap: session.activeSessionsMap,
        });
        // ---------------------------

        if (!actualClosingCash || parseFloat(actualClosingCash) < 0) {
            showToast("Masukkan kas yang valid", "error");
            return;
        }
        if (!currentActiveSession) {
            showToast("Data sesi tidak ditemukan", "error");
            return;
        }

        setIsClosingSession(true);
        try {
            const response = await CloseCashierSessionService(
                currentActiveSession.id,
                parseFloat(actualClosingCash)
            );
            if (response.success) {
                setShowCloseSessionModal(false);
                setActualClosingCash("");
                pos.clearCart();
                showToast("Sesi ditutup, memuat ulang sistem...", "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(response.message ?? "Gagal menutup sesi", "error");
            }
        } catch {
            showToast("Gagal menutup sesi", "error");
        } finally {
            setIsClosingSession(false);
        }
    };

    const handleProcessPayment = async () => {
        console.log("handleProcessPayment TRIGGERED");
        console.log("Check activeBranchId:", activeBranchId);
        console.log("Check session.selectedBranch:", session.selectedBranch);
        console.log("Check pos.initData:", pos.initData);

        if (!hasCartItems) return;
        setIsCheckoutProcessing(true);

        if (!activeBranchId && !session.selectedBranch?.branchId && !(session.selectedBranch as any)?.id && !pos.initData?.currentSession?.branchId) {
            showToast("Branch ID tidak ditemukan. Mohon pilih cabang kembali.", "error");
            setIsCheckoutProcessing(false);
            return;
        }

        if ((mode === "voucher" || mode === "credit") && !pos.selectedMember) {
            showToast("Pilih Member terlebih dahulu untuk pembelian Paket/Kredit", "error");
            setIsCheckoutProcessing(false);
            return;
        }

        const payload = {
            SaleType: mode === "voucher" ? 1 : mode === "credit" ? 2 : 0,
            BranchId: activeBranchId || session.selectedBranch?.branchId || (session.selectedBranch as any)?.id || pos.initData?.currentSession?.branchId,
            MemberId: pos.selectedMember?.id ?? null,
            PaymentMethodId: payment.payments[0]?.paymentMethodId ?? null,
            notes: payment.paymentReference ?? "",
            amountPaid: pos.cartGrandTotal,
            Items: pos.cartItems.map((item: any) => ({
                ItemType: item.itemType,
                BranchServiceVariantId: item.branchServiceVariantId ?? item.serviceVariantId ?? null,
                ServicePackageId: item.packageId ?? item.servicePackageId ?? null,
                CreditPackageId: item.creditPackageId ?? null,
                Notes: item.notes ?? null,
                AppointmentDate: item.appointmentDate ?? null,
                StartTime: item.startTime ?? null,
                AppointmentNotes: item.appointmentNotes ?? null,
            })),
        };

        console.log("DEBUG: activeBranchId", activeBranchId);
        console.log("DEBUG: session.selectedBranch", session.selectedBranch);
        console.log("[POS Sale Payload]", payload);

        try {
            const response = await post("pos/sales", payload);
            if (response.success) {
                showToast("Pembayaran Berhasil Disimpan!", "success");
                pos.clearCart();
                payment.closePaymentModal();
                setSaleRefreshKey(prev => prev + 1); // Trigger refresh tab sale
            } else {
                showToast(response.message ?? "Gagal menyimpan transaksi", "error");
            }
        } catch {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsCheckoutProcessing(false);
        }
    };

    // ── Gatekeeper guard ───────────────────────────────────────────────────
    if (session.gateState !== "READY") {
        return (
            <GatekeeperScreen
                gateState={session.gateState}
                branches={session.branches}
                selectedBranch={session.selectedBranch}
                activeSession={session.activeSession}
                activeSessionsMap={session.activeSessionsMap}
                activeBranchId={activeBranchId}
                openingCash={session.openingCash}
                setOpeningCash={session.setOpeningCash}
                closingCash={session.closingCash}
                setClosingCash={session.setClosingCash}
                cashMovementReason={session.cashMovementReason}
                setCashMovementReason={session.setCashMovementReason}
                isProcessing={session.isProcessing}
                onSelectBranch={session.handleSelectBranch}
                onForceClose={async () => {
                    // [FIX] Cek return value — handleForceCloseSession sekarang
                    // mengembalikan boolean: true = berhasil, false = gagal.
                    const success = await session.handleForceCloseSession();
                
                    if (success) {
                        // Hanya tampilkan toast dan reload JIKA API benar-benar berhasil
                        showToast("Sesi berhasil ditutup. Memuat ulang sistem...", "success");
                        setTimeout(() => window.location.reload(), 1200);
                    }
                    // Jika gagal: hook sudah tampilkan error toast → tidak perlu reload
                }}
                onOpenSession={async () => {
                    const alreadyHasSession = Object.values(session.activeSessionsMap).some(
                        (s) => s != null
                    );
                    await session.handleOpenSession((branchId: number) =>
                        pos.loadInitData(branchId)
                    );
                    showToast(
                        alreadyHasSession
                            ? "Masih ada Sesi aktif ditemukan. Silahkan lanjutkan atau Tutup Sesi terlebih dahulu."
                            : "Sesi baru berhasil dibuka. Menyiapkan kasir...",
                        alreadyHasSession ? "error" : "success"
                    );
                    setTimeout(() => window.location.reload(), 1000);
                }}
                onContinueSession={async (branch: any) => {
                    const bId = branch.branchId ?? branch.id;
                    session.setSelectedBranch(branch);
                    session.setGateState("READY");
                    await pos.loadInitData(bId);
                    showToast("Sesi aktif ditemukan. Mengembalikan data kasir...", "info");
                }}
                toast={toast}
                onBack={handleBack}
            />
        );
    }

    // ── Render: main POS ───────────────────────────────────────────────────
    return (
        <div className="pos-container">

            {/* Toast */}
            {toast && (
                <div className={`pos-toast pos-toast-${toast.type}`}>
                    <i
                        className={`fa-solid ${
                            toast.type === "success"
                                ? "fa-check-circle"
                                : toast.type === "error"
                                ? "fa-exclamation-circle"
                                : "fa-info-circle"
                        }`}
                    />
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="pos-main">

                {/* ── HEADER ────────────────────────────────────────────────── */}
                <header className="pos-header">
                    <Link href="/dashboard" className="pos-logo">
                        <div className="pos-logo-icon1">
                            <img src="/logo.png" alt="Logo" style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                        </div>
                        <div className="pos-logo-text">The <span>Green</span> Spa</div>
                    </Link>

                    <div className="pos-header-center">
                        {hasOpenSession && currentActiveSession && (
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px" }}>
                                <div
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        background: "rgba(16,185,129,0.1)", padding: "6px 14px",
                                        borderRadius: "20px", color: "var(--spa-green)", fontWeight: 600,
                                    }}
                                >
                                    <i className="fa-solid fa-store" />
                                    <span>
                                        {session.selectedBranch?.branchName ||
                                            (session.selectedBranch as any)?.name ||
                                            currentActiveSession.branchName ||
                                            "Cabang Aktif"}
                                    </span>
                                    <span style={{ opacity: 0.4 }}>|</span>
                                    <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                                        {currentActiveSession.sessionCode}
                                    </span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                                    <i className="fa-solid fa-user-circle" style={{ color: "var(--text-muted)", fontSize: "16px" }} />
                                    <span>{currentActiveSession.userName ?? "Kasir"}</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                                    <i className="fa-solid fa-wallet" style={{ color: "var(--text-muted)" }} />
                                    <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "12px" }}>Kas:</span>
                                    <span>
                                        {formatCurrency(
                                            currentActiveSession.expectedClosingCash ??
                                            currentActiveSession.openingCash ??
                                            0
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pos-header-actions">
                        {/* <Link href="/dashboard/sales" className="header-btn">
                            <i className="fa-solid fa-clock-rotate-left" />
                        </Link> */}
                        {hasOpenSession && (
                            <button
                                className="header-btn"
                                title="Tutup Sesi"
                                onClick={() => setShowCloseSessionModal(true)}
                                style={{ color: "var(--accent-red)" }}
                            >
                                <i className="fa-solid fa-power-off" />
                            </button>
                        )}
                        <button className="header-btn scan">
                            <i className="fa-solid fa-qrcode" /> Scan
                        </button>
                    </div>
                </header>

                {/* ── CONTENT ───────────────────────────────────────────────── */}
                <div className="pos-content">

                    {/* LEFT: Member panel */}
                    <aside className="member-panel">
                        <div className="member-search" style={{ position: "relative" }}>
                            <div className="member-search-row">
                                <div className="search-input-wrapper" style={{ position: 'relative', width: '100%' }}>
                                    <i className="fa-solid fa-magnifying-glass" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Cari member..."
                                        value={pos.memberSearch}
                                        onChange={(e) => pos.setMemberSearch(e.target.value)}
                                        onFocus={() => pos.setShowMemberDropdown(true)}
                                        style={{ width: "100%", paddingLeft: "40px" }}
                                    />
                                    {/* Dropdown Hasil Pencarian dihapus karena sudah menyatu dengan list di bawah */}
                                </div>
                                <button
                                    className="btn-add-member"
                                    onClick={() => setShowMemberModal(true)}
                                    title="Tambah Member Baru"
                                >
                                    <i className="fa-solid fa-plus" />
                                </button>
                            </div>
                        </div>

                        <div className="member-info" style={{ padding: "0 16px", flex: 1, overflowY: "auto" }}>
                            <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", marginTop: "10px" }}>
                                {pos.memberSearch ? "Hasil Pencarian" : "Member Terdaftar"}
                            </div>
                            
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {pos.memberResults.length > 0 ? (
                                    pos.memberResults.map((member) => {
                                        const isActive = pos.selectedMember?.id === member.id;
                                        return (
                                            <div
                                                key={member.id}
                                                onClick={() => pos.setSelectedMember(isActive ? null : member)}
                                                className={`member-mini-card ${isActive ? 'active' : ''}`}
                                                style={{
                                                    padding: "12px",
                                                    borderRadius: "16px",
                                                    background: isActive ? "var(--gradient-spa)" : "var(--bg-card)",
                                                    border: isActive ? "none" : "1px solid var(--border-color)",
                                                    color: isActive ? "white" : "var(--text-primary)",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "12px",
                                                    boxShadow: isActive ? "0 8px 16px rgba(61, 107, 95, 0.25)" : "none"
                                                }}
                                            >
                                                <div style={{ 
                                                    width: "40px", height: "40px", borderRadius: "12px", 
                                                    background: isActive ? "rgba(255,255,255,0.2)" : "var(--spa-green-bg)",
                                                    color: isActive ? "white" : "var(--spa-green)",
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontWeight: 800, fontSize: "16px"
                                                }}>
                                                    {(member.name || member.fullName || "M").charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {member.name || member.fullName || "No Name"}
                                                    </div>
                                                    <div style={{ fontSize: "12px", opacity: isActive ? 0.8 : 1, color: isActive ? "white" : "var(--text-muted)" }}>
                                                        {member.phone || "No phone"}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px" }}>
                                                        <i className="fa-solid fa-check"></i>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                        <i className="fa-solid fa-user-slash" style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }}></i>
                                        <p style={{ fontSize: "12px" }}>Tidak ada member ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: Service / Voucher / Credit / Redeem / Sale */}
                    <div className="service-area">
                        <div className="service-categories" style={{ gap: "8px" }}>
                            {(["session", "voucher", "credit", "redeem", "sale", "booking"] as const).map((m) => {
                                const labels: Record<string, { icon: string; label: string }> = {
                                    session: { icon: "fa-spa",              label: "Layanan"       },
                                    voucher: { icon: "fa-ticket",           label: "Paket Voucher" },
                                    credit:  { icon: "fa-wallet",           label: "Top Up Kredit" },
                                    redeem:  { icon: "fa-qrcode",           label: "Redeem"        },
                                    sale:    { icon: "fa-tag",              label: "Penjualan"     },
                                    booking: { icon: "fa-calendar-days",    label: "Booking"       },
                                };
                                const { icon, label } = labels[m];
                                return (
                                    <button
                                        key={m}
                                        className={`pos-tab ${mode === m ? "active" : ""}`}
                                        onClick={() => setMode(m)}
                                        style={{ padding: "10px 20px", position: "relative", display: "flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <i className={`fa-solid ${icon}`} /> 
                                        <span>{label}</span>
                                        {m === "booking" && bookingCount > 0 && (
                                            <span style={{
                                                background: "var(--accent-red)",
                                                color: "white",
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                borderRadius: "10px",
                                                padding: "2px 6px",
                                                minWidth: "18px",
                                                height: "18px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                lineHeight: 1,
                                                boxShadow: "0 2px 5px rgba(239,68,68,0.3)",
                                            }}>
                                                {bookingCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Layanan */}
                        {mode === "session" && (
                            <>
                                <div className="service-categories">
                                    {/* Chip Semua */}
                                    <button
                                        className={`category-chip ${selectedCategory === null ? "active" : ""}`}
                                        onClick={() => {
                                            const bId = activeBranchId ?? currentActiveSession?.branchId ?? null;
                                            if (!bId) return;
                                            setSelectedCategory(null);
                                            pos.loadServicesByCategory(bId, null);
                                        }}
                                    >
                                        Semua
                                    </button>

                                    {pos.categoriesLoading ? (
                                        <span style={{ fontSize: "12px", color: "var(--text-muted)", padding: "6px 10px" }}>
                                            <i className="fa-solid fa-spinner fa-spin" /> Memuat...
                                        </span>
                                    ) : (
                                        pos.categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
                                                onClick={() => {
                                                    const bId = activeBranchId ?? currentActiveSession?.branchId ?? null;
                                                    if (!bId) return;
                                                    setSelectedCategory(cat.id);
                                                    pos.loadServicesByCategory(bId, cat.id);
                                                }}
                                            >
                                                {cat.icon && (
                                                    <i className={`fa-solid ${cat.icon}`} style={{ marginRight: "6px" }} />
                                                )}
                                                {cat.name}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="service-grid-wrapper">
                                    {pos.loading ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }} />
                                        </div>
                                    ) : filteredServices.length === 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "var(--text-muted)", gap: "12px" }}>
                                            <i className="fa-solid fa-spa" style={{ fontSize: "48px", opacity: 0.3 }} />
                                            <p style={{ fontSize: "14px" }}>Tidak ada layanan tersedia</p>
                                        </div>
                                    ) : (
                                        <div className="service-grid">
                                            {filteredServices.map((variant) => {
                                                const cartItem = pos.cartItems.find(
                                                    (i: CartItem) => i.cartKey === `service-${variant.id}`
                                                );
                                                return (
                                                    <div
                                                        key={variant.id}
                                                        className={`service-item ${cartItem ? "selected" : ""}`}
                                                        style={{ "--accent-color": variant.categoryColor ?? "var(--spa-green)" } as React.CSSProperties}
                                                    >
                                                        <div
                                                            className="service-icon"
                                                            style={{
                                                                background: `${variant.categoryColor ?? "var(--spa-green)"}20`,
                                                                color: variant.categoryColor ?? "var(--spa-green)",
                                                            }}
                                                        >
                                                            <i className={`fa-solid ${variant.icon ?? "fa-spa"}`} />
                                                        </div>
                                                        <div className="service-name">{variant.displayName}</div>
                                                        <div className="service-meta">
                                                            <span><i className="fa-regular fa-clock" /> {variant.duration} min</span>
                                                        </div>
                                                        <div className="service-price">{formatCurrency(variant.price)}</div>
                                                        {cartItem ? (
                                                            <div
                                                                className="service-qty-control"
                                                                style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(`service-${variant.id}`, -1)}>
                                                                    <i className="fa-solid fa-minus" />
                                                                </button>
                                                                <span className="qty-value">{cartItem.quantity}</span>
                                                                <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(`service-${variant.id}`, 1)}>
                                                                    <i className="fa-solid fa-plus" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="service-add-btn"
                                                                onClick={(e) => { e.stopPropagation(); pos.addServiceToCart(variant); }}
                                                            >
                                                                <i className="fa-solid fa-plus" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Paket Voucher */}
                        {mode === "voucher" && (
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {pos.initData?.packages.map((pkg, idx) => (
                                        <div
                                            key={pkg.id}
                                            className={`package-card ${idx === 0 ? "hemat" : "premium"} ${selectedPackage === pkg.id ? "selected" : ""}`}
                                            onClick={() => { setSelectedPackage(pkg.id); pos.addPackageToCart(pkg); }}
                                        >
                                            {(pkg.savings ?? 0) > 0 && (
                                                <div className="package-badge">Hemat {formatCurrency(pkg.savings)}</div>
                                            )}
                                            <div className="package-name">{pkg.name}</div>
                                            <div className="package-desc">{pkg.serviceVariantName ?? pkg.description}</div>
                                            <div className="package-price">{formatCurrency(pkg.price)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Top Up Kredit */}
                        {mode === "credit" && (
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {pos.initData?.creditPackages.map((cp) => (
                                        <div key={cp.id} className="package-card premium" onClick={() => pos.addCreditPackageToCart(cp)}>
                                            <div className="package-badge">Bonus {cp.bonusPercentage?.toFixed(0) ?? 0}%</div>
                                            <div className="package-name">{cp.name}</div>
                                            <div className="package-desc">{cp.description}</div>
                                            <div className="package-price">{formatCurrency(cp.payAmount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Redeem */}
                        {mode === "redeem" && (
                            <div
                                className="service-grid-wrapper"
                                style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "600px", margin: "0 auto", paddingTop: "40px", textAlign: "center" }}
                            >
                                <h2>Redeem Voucher</h2>
                                <p style={{ color: "var(--text-muted)" }}>Scan atau masukkan kode voucher member</p>
                                <div style={{ width: "220px", height: "220px", margin: "0 auto", background: "var(--bg-main)", borderRadius: "24px", border: "3px dashed var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <i className="fa-solid fa-qrcode" style={{ fontSize: "70px", color: "var(--text-muted)" }} />
                                </div>
                            </div>
                        )}

                        {mode === "sale" && (
                            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                                <SaleHistoryTab 
                                    key={saleRefreshKey}
                                    branchId={
                                        activeBranchId ??
                                        session.selectedBranch?.branchId ??
                                        currentActiveSession?.branchId ??
                                        null
                                    } 
                                    onToast={showToast} 
                                    onBookingCountChange={fetchBookingCount}
                                />
                            </div>
                        )}

                        {mode === "booking" && (
                            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                                <BookingTab 
                                    branchId={
                                        activeBranchId ??
                                        session.selectedBranch?.branchId ??
                                        currentActiveSession?.branchId ??
                                        null
                                    } 
                                    onToast={showToast} 
                                    onBookingCountChange={fetchBookingCount}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* ── RIGHT: Cart sidebar ────────────────────────────────────────── */}
            <aside
                className={`pos-sidebar ${showMobileCart ? "open" : ""}`}
                style={{ display: "flex", flexDirection: "column", height: "100vh" }}
            >
                <div className="cart-header" style={{ flexShrink: 0 }}>
                    <div className="cart-title">Keranjang</div>
                    <div className="cart-subtitle">
                        {pos.cartItems?.length ?? 0} item • {pos.cartTotalDuration ?? 0} menit
                    </div>
                </div>

                <div className="cart-items" style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingRight: "8px" }}>
                    {!hasCartItems ? (
                        <div className="cart-empty">
                            <i className="fa-solid fa-cart-shopping" />
                            <h4>Keranjang Kosong</h4>
                            <p>Pilih layanan untuk memulai</p>
                        </div>
                    ) : (
                        pos.cartItems.map((item: CartItem) => (
                            <div key={item.cartKey} className="cart-item">
                                <div className="cart-item-header">
                                    <span className="cart-item-name">{item.displayName}</span>
                                    <button className="cart-item-remove" onClick={() => pos.removeCartItem(item.cartKey)}>
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                </div>
                                <div className="cart-item-details">
                                    <span className="cart-item-meta">{item.duration > 0 ? `${item.duration} menit` : ""}</span>
                                    <div className="cart-item-qty">
                                        <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(item.cartKey, -1)}>
                                            <i className="fa-solid fa-minus" />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(item.cartKey, 1)}>
                                            <i className="fa-solid fa-plus" />
                                        </button>
                                    </div>
                                    <span className="cart-item-price">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-summary" style={{ flexShrink: 0 }}>
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatCurrency(pos.cartSubtotal ?? 0)}</span>
                    </div>
                    {hasCartItems && (
                        <div className="summary-row" style={{ cursor: "pointer" }} onClick={() => setShowDiscountModal(true)}>
                            <span className="summary-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                Diskon <i className="fa-solid fa-pen-to-square" style={{ fontSize: "10px", color: "var(--text-muted)" }} />
                            </span>
                            <span className="summary-value" style={{ color: pos.cartDiscount > 0 ? "var(--accent-red)" : "var(--text-muted)" }}>
                                {pos.cartDiscount > 0 ? `- ${formatCurrency(pos.cartDiscount)}` : "Tambah"}
                            </span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">{formatCurrency(pos.cartGrandTotal ?? 0)}</span>
                    </div>
                </div>

                <div className="cart-actions" style={{ flexShrink: 0 }}>
                    {hasCartItems && (
                        <button className="action-btn secondary" onClick={pos.clearCart}>
                            <i className="fa-solid fa-trash" /> Bersihkan
                        </button>
                    )}
                    <button
                        className="action-btn primary"
                        onClick={() => {
                            payment.setPaymentAmount(pos.cartGrandTotal.toString());
                            payment.openPaymentModal();
                        }}
                        disabled={!hasCartItems}
                        style={{ opacity: !hasCartItems ? 0.5 : 1 }}
                    >
                        <i className="fa-solid fa-credit-card" /> Bayar
                    </button>
                </div>
            </aside>

            {/* ── MODAL: Tutup Sesi ──────────────────────────────────────────── */}
            {showCloseSessionModal && currentActiveSession && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowCloseSessionModal(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "400px", width: "90%", background: "var(--bg-card)", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "16px" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Tutup Sesi Kasir</h3>
                            <button onClick={() => setShowCloseSessionModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
                            Hitung dan masukkan jumlah kas aktual fisik di laci saat ini.
                        </p>

                        <div style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span>Kas Awal</span>
                                <span>{formatCurrency(currentActiveSession.openingCash ?? 0)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "15px" }}>
                                <span>Kas Sistem</span>
                                <span style={{ color: "var(--spa-green)" }}>
                                    {formatCurrency(currentActiveSession.expectedClosingCash ?? currentActiveSession.openingCash ?? 0)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                Kas Aktual Fisik (Rp)
                            </label>
                            <input
                                type="number"
                                className="search-input"
                                placeholder="Total uang di laci"
                                value={actualClosingCash}
                                onChange={(e) => setActualClosingCash(e.target.value)}
                                style={{ width: "100%", padding: "14px", fontSize: "18px", textAlign: "right", fontWeight: 700 }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="action-btn secondary" onClick={() => setShowCloseSessionModal(false)} style={{ flex: 1 }}>
                                Batal
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={handleCloseSession}
                                disabled={isClosingSession || !actualClosingCash}
                                style={{ flex: 1, background: "var(--accent-red)", borderColor: "var(--accent-red)", opacity: (isClosingSession || !actualClosingCash) ? 0.6 : 1 }}
                            >
                                {isClosingSession ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-power-off" />}{" "}
                                Tutup Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: Diskon ─────────────────────────────────────────────── */}
            {showDiscountModal && (
                <div
                    className="modal-overlay"
                    onClick={() => setShowDiscountModal(false)}
                    style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999 }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "380px", width: "90%", background: "var(--bg-card)", borderRadius: "16px", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "16px" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Tambah Diskon</h3>
                            <button onClick={() => setShowDiscountModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {(["fixed", "percent"] as const).map((t) => (
                                <button key={t} className={`category-chip ${discountType === t ? "active" : ""}`} onClick={() => setDiscountType(t)}>
                                    {t === "fixed" ? "Nominal (Rp)" : "Persen (%)"}
                                </button>
                            ))}
                        </div>

                        <input
                            type="number"
                            className="search-input"
                            placeholder={discountType === "fixed" ? "Nominal diskon" : "Persen diskon (0–100)"}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            autoFocus
                        />

                        <button className="action-btn primary" onClick={handleApplyDiscount}>
                            Terapkan Diskon
                        </button>

                        {pos.cartDiscount > 0 && (
                            <button className="action-btn secondary" onClick={() => { pos.setCartDiscount(0); setShowDiscountModal(false); }}>
                                Hapus Diskon
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── MODAL: Payment ─────────────────────────────────────────────── */}
            {payment.showPaymentModal && pos.initData && (
                <ModalPayment
                    order={{
                        id: 0, saleCode: "-", saleType: 0, saleTypeName: "",
                        cashierSessionId: currentActiveSession?.id ?? 0,
                        memberId: pos.selectedMember?.id,
                        memberName: pos.selectedMember?.name,
                        memberPhone: pos.selectedMember?.phone,
                        memberCreditBalance: pos.selectedMember?.creditBalance?.totalBalance,
                        subtotal: pos.cartSubtotal, discountAmount: pos.cartDiscount,
                        taxAmount: 0, grandTotal: pos.cartGrandTotal,
                        amountPaid: 0, changeAmount: 0,
                        paymentStatus: 0, paymentStatusName: "",
                        items: pos.cartItems.map((ci: CartItem, idx: number) => ({
                            id: idx, itemType: ci.itemType, itemTypeName: "",
                            itemName: ci.displayName, duration: ci.duration,
                            quantity: ci.quantity, unitPrice: ci.unitPrice,
                            discountAmount: 0, subtotal: ci.unitPrice * ci.quantity,
                        })),
                        totalItems: pos.cartItems.reduce((s: number, i: CartItem) => s + i.quantity, 0),
                        totalDuration: pos.cartTotalDuration,
                    }}
                    paymentMethods={pos.initData.paymentMethods}
                    payments={payment.payments}
                    selectedPaymentMethod={payment.selectedPaymentMethod}
                    setSelectedPaymentMethod={payment.setSelectedPaymentMethod}
                    paymentAmount={payment.paymentAmount}
                    setPaymentAmount={payment.setPaymentAmount}
                    paymentReference={payment.paymentReference}
                    setPaymentReference={payment.setPaymentReference}
                    onAddEntry={payment.addPaymentEntry}
                    onRemoveEntry={payment.removePaymentEntry}
                    onProcess={handleProcessPayment}
                    onClose={payment.closePaymentModal}
                    isProcessing={isCheckoutProcessing}
                />
            )}
            {showMemberModal && (
                <ModalMemberAdd
                    onClose={() => setShowMemberModal(false)}
                    onSave={async (data) => {
                        const res = await pos.createMember(data);
                        if (res) {
                            showToast("Member berhasil ditambahkan!", "success");
                            return true;
                        }
                        // Gagal ditangani di dalam pos.createMember (toast pesan backend)
                        return false;
                    }}
                />
            )}
        </div>
    );
}