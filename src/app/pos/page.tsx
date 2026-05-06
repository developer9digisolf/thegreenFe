"use client";

import { usePosSession } from "@afx/hooks/pos/usePosSession";
import { usePosData } from "@afx/hooks/pos/usePosData";
import { usePayment } from "@afx/hooks/pos/usePayment";
import GatekeeperScreen from "@afx/components/pos/GatekeeperScreen";
import ModalPayment from "@afx/components/pos/ModalPayment";
import { formatCurrency } from "@afx/utils/format";  
import type { Toast } from "@afx/interfaces/pos.iface";      
import Link from "next/link";
import { useState, useCallback } from "react";


// ============================================
// POS Page — Orchestrator
// ============================================
export default function POSPage() {
    // ── Toast ──────────────────────────────────
    const [toast, setToast] = useState<Toast | null>(null);
    const showToast = useCallback(
        (message: string, type: "success" | "error" | "info" = "success") => {
            setToast({ message, type });
            setTimeout(() => setToast(null), 3000);
        },
        []
    );

    const handleBack = () => {
        // Jika user punya lebih dari 1 cabang, balikkan ke menu pilih cabang
        if (session.branches.length > 1) {
            session.setGateState("SELECT_BRANCH");
        } else {
            // Jika hanya 1 cabang, arahkan keluar ke dashboard
            window.location.href = "/dashboard";
        }
    };
    // ── Hooks ──────────────────────────────────
    const session = usePosSession(showToast);
    const pos = usePosData(showToast);
    const payment = usePayment(showToast);

    // ── Local UI state ─────────────────────────
    const [mode, setMode] = useState<"session" | "voucher" | "redeem">("session");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [serviceSearch, setServiceSearch] = useState("");
    const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
    const [showMobileCart, setShowMobileCart] = useState(false);

    const [showDiscountModal, setShowDiscountModal] = useState(false);
    const [discountType, setDiscountType] = useState<"fixed" | "percent">("fixed");
    const [discountValue, setDiscountValue] = useState("");

    const [showCashMovementModal, setShowCashMovementModal] = useState(false);
    const [cashMovementType, setCashMovementType] = useState<"in" | "out">("in");
    const [cashMovementAmount, setCashMovementAmount] = useState("");
    const [cashMovementReason, setCashMovementReason] = useState("");

    // ── Gatekeeper guard ───────────────────────
    if (session.gateState !== "READY") {
        return (
            <GatekeeperScreen
                gateState={session.gateState}
                branches={session.branches}
                selectedBranch={session.selectedBranch}
                activeSession={session.activeSession}
                openingCash={session.openingCash}
                setOpeningCash={session.setOpeningCash}
                closingCash={session.closingCash}
                setClosingCash={session.setClosingCash}
                cashMovementReason={session.cashMovementReason}
                setCashMovementReason={session.setCashMovementReason}
                isProcessing={session.isProcessing}
                onSelectBranch={session.handleSelectBranch}
                onForceClose={session.handleForceCloseSession}
                onOpenSession={() => session.handleOpenSession(pos.loadInitData)}
                toast={toast}
                onBack={handleBack}
            />
        );
    }

    

    // ── Computed ───────────────────────────────
    const filteredServices = pos.getFilteredServices(selectedCategory, serviceSearch);
    const totalDuration = pos.currentOrder?.items.reduce(
        (sum, item) => sum + item.duration * item.quantity,
        0
    ) ?? 0;

    // ── Render: main POS ───────────────────────
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
                    ></i>
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="pos-main">
                {/* ── HEADER ── */}
                <header className="pos-header">
                    <Link href="/dashboard" className="pos-logo">
                        <div className="pos-logo-icon">
                            <i className="fa-solid fa-spa"></i>
                        </div>
                        <div className="pos-logo-text">
                            The <span>Green</span> Spa
                        </div>
                    </Link>

                    <div
                        className="pos-header-center"
                        style={{ display: "flex", alignItems: "center", gap: "16px" }}
                    >
                        {session.selectedBranch && (
                            <div
                                style={{
                                    background: "var(--bg-main)",
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    fontSize: "13px",
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                    color: "var(--text-primary)",
                                    border: "1px solid var(--border-color)",
                                }}
                            >
                                <i
                                    className="fa-solid fa-location-dot"
                                    style={{ color: "var(--spa-green)" }}
                                ></i>
                                {session.selectedBranch.branchName}
                            </div>
                        )}
                        <div className="pos-tabs">
                            <button
                                className={`pos-tab ${mode === "session" ? "active" : ""}`}
                                onClick={() => setMode("session")}
                            >
                                <i className="fa-solid fa-spa"></i> Sesi Baru
                            </button>
                            <button
                                className={`pos-tab ${mode === "voucher" ? "active" : ""}`}
                                onClick={() => setMode("voucher")}
                            >
                                <i className="fa-solid fa-ticket"></i> Jual Voucher
                            </button>
                            <button
                                className={`pos-tab ${mode === "redeem" ? "active" : ""}`}
                                onClick={() => setMode("redeem")}
                            >
                                <i className="fa-solid fa-gift"></i> Redeem
                            </button>
                        </div>
                    </div>

                    <div className="pos-header-actions">
                        {pos.initData?.hasOpenSession && pos.initData.currentSession && (
                            <div className="session-info-badge">
                                <span style={{ color: "var(--spa-green)", fontWeight: 600 }}>
                                    <i
                                        className="fa-solid fa-circle"
                                        style={{ fontSize: "6px", marginRight: "4px" }}
                                    ></i>
                                    {pos.initData.currentSession.sessionCode}
                                </span>
                                <span style={{ color: "var(--text-muted)" }}>
                                    {pos.initData.currentSession.userName}
                                </span>
                            </div>
                        )}
                        <Link href="/dashboard" className="header-btn back" title="Kembali ke Backend">
                            <i className="fa-solid fa-arrow-left"></i> Backend
                        </Link>
                        <Link
                            href="/dashboard/sales"
                            className="header-btn"
                            title="Riwayat Penjualan"
                        >
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </Link>

                        {pos.initData?.hasOpenSession && (
                            <>
                                <button
                                    className="header-btn"
                                    title="Kas Masuk"
                                    onClick={() => {
                                        setCashMovementType("in");
                                        setShowCashMovementModal(true);
                                    }}
                                    style={{ color: "#059669", gap: "4px" }}
                                >
                                    <i className="fa-solid fa-arrow-down"></i>
                                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Kas+</span>
                                </button>
                                <button
                                    className="header-btn"
                                    title="Kas Keluar"
                                    onClick={() => {
                                        setCashMovementType("out");
                                        setShowCashMovementModal(true);
                                    }}
                                    style={{ color: "#ef4444", gap: "4px" }}
                                >
                                    <i className="fa-solid fa-arrow-up"></i>
                                    <span style={{ fontSize: "11px", fontWeight: 600 }}>Kas-</span>
                                </button>
                                <button
                                    className="header-btn"
                                    title="Tutup Sesi Kasir"
                                    onClick={() =>
                                        payment.openCloseSessionModal(
                                            pos.initData!.currentSession!.id
                                        )
                                    }
                                    style={{ color: "#ef4444", gap: "6px" }}
                                >
                                    <i className="fa-solid fa-power-off"></i>
                                    <span style={{ fontSize: "12px", fontWeight: 600 }}>
                                        Tutup Sesi
                                    </span>
                                </button>
                            </>
                        )}
                        <button className="header-btn scan">
                            <i className="fa-solid fa-qrcode"></i> Scan
                        </button>
                    </div>
                </header>

                {/* ── CONTENT ── */}
                <div className="pos-content">
                    {/* LEFT: Member panel */}
                    <aside className="member-panel">
                        <div className="member-search" style={{ position: "relative" }}>
                            <div className="member-search-row">
                                <div className="search-input-wrapper">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Cari member..."
                                        value={pos.memberSearch}
                                        onChange={(e) => pos.setMemberSearch(e.target.value)}
                                        onFocus={() => pos.setShowMemberDropdown(true)}
                                    />
                                </div>
                                <button className="btn-add-member" title="Tambah Member Baru">
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                            {pos.showMemberDropdown && pos.memberResults.length > 0 && (
                                <div
                                    style={{
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
                                        overflowY: "auto",
                                    }}
                                >
                                    {pos.memberResults.map((member) => (
                                        <div
                                            key={member.id}
                                            onClick={() => pos.setOrderMember(member)}
                                            style={{
                                                padding: "12px 16px",
                                                cursor: "pointer",
                                                borderBottom: "1px solid var(--border-color)",
                                            }}
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
                            {pos.selectedMember || pos.currentOrder?.memberId ? (
                                <>
                                    <div className="member-card">
                                        <div className="member-header">
                                            <div className="member-avatar">
                                                {(
                                                    pos.selectedMember?.name ||
                                                    pos.currentOrder?.memberName ||
                                                    "G"
                                                ).charAt(0)}
                                            </div>
                                            <div className="member-details">
                                                <h4>
                                                    {pos.selectedMember?.name ||
                                                        pos.currentOrder?.memberName}
                                                </h4>
                                                <p>
                                                    <i className="fa-solid fa-phone"></i>{" "}
                                                    {pos.selectedMember?.phone ||
                                                        pos.currentOrder?.memberPhone}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="member-stats">
                                            <div className="member-stat">
                                                <div className="member-stat-value">
                                                    {pos.selectedMember?.creditBalance?.totalBalance ||
                                                        pos.currentOrder?.memberCreditBalance ||
                                                        0}
                                                </div>
                                                <div className="member-stat-label">Saldo</div>
                                            </div>
                                            <div className="member-stat">
                                                <div className="member-stat-value">
                                                    {pos.selectedMember?.totalVisits || 0}
                                                </div>
                                                <div className="member-stat-label">Kunjungan</div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => pos.setOrderMember(null)}
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
                                            fontSize: "13px",
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-xmark"
                                            style={{ marginRight: "6px" }}
                                        ></i>
                                        Hapus Member
                                    </button>
                                </>
                            ) : (
                                <div
                                    style={{
                                        padding: "32px 20px",
                                        textAlign: "center",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "72px",
                                            height: "72px",
                                            background: "var(--spa-green-bg)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            margin: "0 auto 16px",
                                            border: "2px dashed var(--spa-green-border)",
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-user-plus"
                                            style={{ fontSize: "24px", color: "var(--spa-green)" }}
                                        ></i>
                                    </div>
                                    <p
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                            color: "var(--text-secondary)",
                                            marginBottom: "6px",
                                        }}
                                    >
                                        Belum ada member
                                    </p>
                                    <p style={{ fontSize: "12px", lineHeight: 1.5 }}>
                                        Cari nama atau nomor HP, atau lanjutkan sebagai guest
                                    </p>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* CENTER: Service / Package area */}
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
                                    />
                                    {serviceSearch && (
                                        <button
                                            className="service-search-clear"
                                            onClick={() => setServiceSearch("")}
                                        >
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
                                    {pos.initData?.categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            className={`category-chip ${
                                                selectedCategory === cat.id ? "active" : ""
                                            }`}
                                            onClick={() => setSelectedCategory(cat.id)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="service-grid-wrapper">
                                {pos.loading && filteredServices.length === 0 ? (
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "center",
                                            padding: "40px",
                                        }}
                                    >
                                        <i
                                            className="fa-solid fa-spinner fa-spin"
                                            style={{ fontSize: 24, color: "var(--spa-green)" }}
                                        ></i>
                                    </div>
                                ) : (
                                    <div className="service-grid">
                                        {filteredServices.map((variant) => {
                                            const isInCart = pos.currentOrder?.items.some(
                                                (i) => i.serviceVariantId === variant.id
                                            );
                                            return (
                                                <div
                                                    key={variant.id}
                                                    className={`service-item ${isInCart ? "selected" : ""}`}
                                                    onClick={() => pos.addServiceToCart(variant)}
                                                >
                                                    <div className="service-icon">
                                                        <i
                                                            className={`fa-solid ${
                                                                variant.icon || "fa-spa"
                                                            }`}
                                                        ></i>
                                                    </div>
                                                    <div className="service-name">
                                                        {variant.displayName}
                                                    </div>
                                                    <div className="service-meta">
                                                        <span>
                                                            <i className="fa-regular fa-clock"></i>{" "}
                                                            {variant.duration} min
                                                        </span>
                                                    </div>
                                                    <div className="service-price">
                                                        {formatCurrency(variant.price)}
                                                    </div>
                                                    <button
                                                        className="service-add-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            pos.addServiceToCart(variant);
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-plus"></i>
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {mode === "voucher" && (
                        <div className="service-area">
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {pos.initData?.packages.map((pkg, idx) => (
                                        <div
                                            key={pkg.id}
                                            className={`package-card ${idx === 0 ? "hemat" : "premium"} ${
                                                selectedPackage === pkg.id ? "selected" : ""
                                            }`}
                                            onClick={() => {
                                                setSelectedPackage(pkg.id);
                                                pos.addPackageToCart(pkg);
                                            }}
                                        >
                                            {pkg.savings && pkg.savings > 0 && (
                                                <div className="package-badge">
                                                    Hemat{" "}
                                                    {Math.round(
                                                        (pkg.savings / (pkg.price + pkg.savings)) * 100
                                                    )}
                                                    %
                                                </div>
                                            )}
                                            <div className="package-name">{pkg.name}</div>
                                            <div className="package-desc">
                                                {pkg.serviceVariantName || pkg.description}
                                            </div>
                                            <div className="package-price">
                                                {formatCurrency(pkg.price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {mode === "redeem" && (
                        <div className="service-area">
                            <div
                                className="service-grid-wrapper"
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "24px",
                                    maxWidth: "600px",
                                    margin: "0 auto",
                                    paddingTop: "40px",
                                    textAlign: "center",
                                }}
                            >
                                <h2>Redeem Voucher</h2>
                                <p style={{ color: "var(--text-muted)" }}>
                                    Scan atau masukkan kode voucher member
                                </p>
                                <div
                                    style={{
                                        width: "220px",
                                        height: "220px",
                                        margin: "0 auto",
                                        background: "var(--bg-main)",
                                        borderRadius: "24px",
                                        border: "3px dashed var(--border-color)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <i
                                        className="fa-solid fa-qrcode"
                                        style={{ fontSize: "70px", color: "var(--text-muted)" }}
                                    ></i>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM BAR: Pending orders */}
                {pos.pendingOrders.length > 0 && (
                    <div
                        style={{
                            padding: "12px 24px",
                            background: "var(--bg-card)",
                            borderTop: "1px solid var(--border-color)",
                            display: "flex",
                            gap: "12px",
                            alignItems: "center",
                            overflowX: "auto",
                        }}
                    >
                        <span
                            style={{
                                fontSize: "12px",
                                color: "var(--text-muted)",
                                fontWeight: 600,
                            }}
                        >
                            <i className="fa-solid fa-clock" style={{ marginRight: "6px" }}></i>
                            Pending:
                        </span>
                        {pos.pendingOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => pos.selectOrder(order.id)}
                                style={{
                                    padding: "10px 16px",
                                    background:
                                        pos.currentOrder?.id === order.id
                                            ? "var(--spa-green-bg)"
                                            : "var(--bg-main)",
                                    border:
                                        pos.currentOrder?.id === order.id
                                            ? "2px solid var(--spa-green)"
                                            : "1px solid var(--border-color)",
                                    borderRadius: "12px",
                                    cursor: "pointer",
                                    minWidth: "130px",
                                }}
                            >
                                <div style={{ fontWeight: 700, fontSize: "13px" }}>
                                    #{order.saleCode.split("-").pop()}
                                </div>
                                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                                    {order.memberName || "Guest"} • {order.totalItems} item
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => {
                                pos.setCurrentOrder(null);
                                pos.setOrderMember(null);
                            }}
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
                            }}
                        >
                            <i className="fa-solid fa-plus"></i> Baru
                        </button>
                    </div>
                )}
            </div>

            {/* RIGHT: Cart sidebar */}
            <aside className={`pos-sidebar ${showMobileCart ? "open" : ""}`}>
                <div className="cart-header">
                    <div className="cart-title">
                        {pos.currentOrder
                            ? `Order #${pos.currentOrder.saleCode.split("-").pop()}`
                            : "Keranjang"}
                    </div>
                    <div className="cart-subtitle">
                        {pos.currentOrder?.items.length || 0} item • {totalDuration} menit
                    </div>
                </div>

                <div className="cart-items">
                    {!pos.currentOrder || pos.currentOrder.items.length === 0 ? (
                        <div className="cart-empty">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <h4>Keranjang Kosong</h4>
                            <p>Pilih layanan untuk memulai</p>
                        </div>
                    ) : (
                        pos.currentOrder.items.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-header">
                                    <span className="cart-item-name">{item.itemName}</span>
                                    <button
                                        className="cart-item-remove"
                                        onClick={() => pos.removeItem(item.id)}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                                <div className="cart-item-details">
                                    <span className="cart-item-meta">
                                        {item.duration > 0
                                            ? `${item.duration} menit`
                                            : item.itemDescription}
                                    </span>
                                    <div className="cart-item-qty">
                                        <button
                                            className="qty-btn"
                                            onClick={() => pos.updateItemQuantity(item.id, -1)}
                                        >
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button
                                            className="qty-btn"
                                            onClick={() => pos.updateItemQuantity(item.id, 1)}
                                        >
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                    <span className="cart-item-price">
                                        {formatCurrency(item.subtotal)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Therapist selector */}
                {mode === "session" &&
                    pos.currentOrder &&
                    pos.currentOrder.items.length > 0 &&
                    pos.initData?.therapists &&
                    pos.initData.therapists.length > 0 && (
                        <div className="therapist-section">
                            <div className="therapist-section-title">Pilih Therapist</div>
                            <div className="therapist-carousel">
                                {pos.initData.therapists.map((th) => {
                                    const isBusy =
                                        th.status === "Busy" || th.status === "InSession";
                                    return (
                                        <div
                                            key={th.id}
                                            className={`therapist-chip ${isBusy ? "busy" : ""} ${
                                                pos.selectedTherapist === th.id ? "selected" : ""
                                            }`}
                                            onClick={() =>
                                                !isBusy && pos.setSelectedTherapist(th.id)
                                            }
                                        >
                                            <div className="therapist-chip-avatar">
                                                {th.name.charAt(0)}
                                            </div>
                                            <div className="therapist-chip-info">
                                                <div className="therapist-chip-name">{th.name}</div>
                                                <div
                                                    className={`therapist-chip-status ${
                                                        isBusy ? "busy" : "available"
                                                    }`}
                                                >
                                                    <span
                                                        className={`status-dot ${
                                                            isBusy ? "busy" : "available"
                                                        }`}
                                                    ></span>
                                                    {isBusy ? "Sibuk" : "Tersedia"}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                {/* Cart summary */}
                <div className="cart-summary">
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">
                            {formatCurrency(pos.currentOrder?.subtotal || 0)}
                        </span>
                    </div>
                    {((pos.currentOrder?.discountAmount || 0) > 0 ||
                        (pos.currentOrder && pos.currentOrder.items.length > 0)) && (
                        <div
                            className="summary-row"
                            style={{ cursor: pos.currentOrder ? "pointer" : "default" }}
                            onClick={() =>
                                pos.currentOrder &&
                                pos.currentOrder.items.length > 0 &&
                                setShowDiscountModal(true)
                            }
                        >
                            <span
                                className="summary-label"
                                style={{ display: "flex", alignItems: "center", gap: "6px" }}
                            >
                                Diskon{" "}
                                {pos.currentOrder && pos.currentOrder.items.length > 0 && (
                                    <i
                                        className="fa-solid fa-pen-to-square"
                                        style={{ fontSize: "10px", color: "var(--text-muted)" }}
                                    ></i>
                                )}
                            </span>
                            <span
                                className="summary-value"
                                style={{
                                    color:
                                        (pos.currentOrder?.discountAmount || 0) > 0
                                            ? "var(--accent-red)"
                                            : "var(--text-muted)",
                                }}
                            >
                                {(pos.currentOrder?.discountAmount || 0) > 0
                                    ? `- ${formatCurrency(pos.currentOrder!.discountAmount)}`
                                    : "Tambah"}
                            </span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">
                            {formatCurrency(pos.currentOrder?.grandTotal || 0)}
                        </span>
                    </div>
                </div>

                <div className="cart-actions">
                    {pos.currentOrder && pos.currentOrder.items.length > 0 && (
                        <button
                            className="action-btn secondary"
                            onClick={pos.holdOrder}
                            disabled={pos.isProcessing}
                        >
                            {pos.isProcessing ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa-solid fa-pause"></i> Hold
                                </>
                            )}
                        </button>
                    )}
                    <button
                        className="action-btn primary"
                        onClick={() => {
                            if (!pos.currentOrder || pos.currentOrder.items.length === 0) return;
                            payment.setPaymentAmount(pos.currentOrder.grandTotal.toString());
                            payment.openPaymentModal();
                        }}
                        disabled={!pos.currentOrder || pos.currentOrder.items.length === 0}
                        style={{
                            opacity:
                                !pos.currentOrder || pos.currentOrder.items.length === 0
                                    ? 0.5
                                    : 1,
                        }}
                    >
                        <i className="fa-solid fa-credit-card"></i> Bayar
                    </button>
                </div>
            </aside>

            {/* ── MODAL: Payment ── */}
            {payment.showPaymentModal && pos.currentOrder && pos.initData && (
                <ModalPayment
                    order={pos.currentOrder}
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
                    onProcess={() =>
                        payment.processPayment(
                            pos.currentOrder!,
                            pos.selectedTherapist,
                            async () => {
                                pos.setCurrentOrder(null);
                                pos.setSelectedTherapist(null);
                                await pos.loadPendingOrders();
                            }
                        )
                    }
                    onClose={payment.closePaymentModal}
                    isProcessing={payment.isProcessing}
                />
            )}

            {/* ── MODAL: Discount ── */}
            {showDiscountModal && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "var(--bg-card)",
                            borderRadius: "24px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "400px",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "24px",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>Tambah Diskon</h2>
                            <button
                                onClick={() => {
                                    setShowDiscountModal(false);
                                    setDiscountValue("");
                                }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                            {(["fixed", "percent"] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setDiscountType(t)}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "8px",
                                        border:
                                            discountType === t
                                                ? "2px solid var(--spa-green)"
                                                : "2px solid var(--border-color)",
                                        background:
                                            discountType === t
                                                ? "var(--spa-green-bg)"
                                                : "var(--bg-main)",
                                        color:
                                            discountType === t
                                                ? "var(--spa-green)"
                                                : "var(--text-secondary)",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                    }}
                                >
                                    {t === "fixed" ? "Nominal (Rp)" : "Persen (%)"}
                                </button>
                            ))}
                        </div>
                        <input
                            type="number"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            placeholder={discountType === "fixed" ? "50000" : "10"}
                            className="search-input"
                            style={{
                                width: "100%",
                                padding: "14px",
                                fontSize: "20px",
                                textAlign: "right",
                                fontWeight: 700,
                                marginBottom: "16px",
                            }}
                        />
                        <div style={{ display: "flex", gap: "12px" }}>
                            {(pos.currentOrder?.discountAmount || 0) > 0 && (
                                <button
                                    className="action-btn secondary"
                                    onClick={() => {
                                        pos.removeDiscount();
                                        setShowDiscountModal(false);
                                        setDiscountValue("");
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Hapus Diskon
                                </button>
                            )}
                            <button
                                className="action-btn primary"
                                onClick={() => {
                                    pos.applyDiscount(discountType, parseFloat(discountValue));
                                    setShowDiscountModal(false);
                                    setDiscountValue("");
                                }}
                                disabled={!discountValue || parseFloat(discountValue) <= 0}
                                style={{ flex: 1 }}
                            >
                                Terapkan
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL: Cash Movement ── */}
            {showCashMovementModal && pos.initData?.currentSession && (
                <div
                    className="modal-overlay"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "var(--bg-card)",
                            borderRadius: "24px",
                            padding: "32px",
                            width: "100%",
                            maxWidth: "400px",
                            boxShadow: "var(--shadow-lg)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: "24px",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>
                                Kas {cashMovementType === "in" ? "Masuk" : "Keluar"}
                            </h2>
                            <button
                                onClick={() => setShowCashMovementModal(false)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    color: "var(--text-muted)",
                                }}
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <input
                            type="number"
                            value={cashMovementAmount}
                            onChange={(e) => setCashMovementAmount(e.target.value)}
                            placeholder="Jumlah (Rp)"
                            className="search-input"
                            style={{
                                width: "100%",
                                padding: "14px",
                                fontSize: "20px",
                                textAlign: "right",
                                fontWeight: 700,
                                marginBottom: "12px",
                            }}
                        />
                        <input
                            type="text"
                            value={cashMovementReason}
                            onChange={(e) => setCashMovementReason(e.target.value)}
                            placeholder="Keterangan..."
                            className="search-input"
                            style={{
                                width: "100%",
                                padding: "12px",
                                fontSize: "14px",
                                marginBottom: "16px",
                            }}
                        />
                        <button
                            className="action-btn primary"
                            onClick={async () => {
                                if (!cashMovementAmount || !cashMovementReason) return;
                                await pos.submitCashMovement(
                                    pos.initData!.currentSession!.id,
                                    cashMovementType,
                                    parseFloat(cashMovementAmount),
                                    cashMovementReason
                                );
                                setShowCashMovementModal(false);
                                setCashMovementAmount("");
                                setCashMovementReason("");
                            }}
                            style={{ width: "100%" }}
                        >
                            Simpan
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
