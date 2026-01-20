"use client";

import { useState } from "react";
import Link from "next/link";
import "./pos.css";

// Types
interface Service {
    id: string;
    name: string;
    duration: number;
    price: number;
    type: string;
    icon: string;
}

interface CartItem extends Service {
    qty: number;
}

interface Therapist {
    id: string;
    name: string;
    status: "available" | "busy";
    queueNo?: number;
    timeLeft?: string;
    isFavorite?: boolean;
}

interface Member {
    id: string;
    name: string;
    phone: string;
    voucherBalance: number;
    totalVisits: number;
    avoidAreas: string[];
    vouchers: { name: string; remaining: number; expiry: string }[];
    favoriteTherapist: string;
}

// Dummy Data
const services: Service[] = [
    { id: "S001", name: "Traditional Massage", duration: 60, price: 150000, type: "massage", icon: "fa-hand-holding-heart" },
    { id: "S002", name: "Aromatherapy Massage", duration: 90, price: 220000, type: "aroma", icon: "fa-spa" },
    { id: "S003", name: "Hot Stone Therapy", duration: 90, price: 280000, type: "stone", icon: "fa-gem" },
    { id: "S004", name: "Deep Tissue Massage", duration: 60, price: 180000, type: "tissue", icon: "fa-hands" },
    { id: "S005", name: "Reflexology", duration: 45, price: 120000, type: "reflex", icon: "fa-shoe-prints" },
    { id: "S006", name: "Full Body Scrub", duration: 60, price: 200000, type: "scrub", icon: "fa-droplet" },
    { id: "S007", name: "Facial Treatment", duration: 60, price: 175000, type: "facial", icon: "fa-face-smile" },
    { id: "S008", name: "Signature Green Spa", duration: 120, price: 350000, type: "signature", icon: "fa-crown" },
];

const therapists: Therapist[] = [
    { id: "T001", name: "Maya", status: "available", queueNo: 1, isFavorite: true },
    { id: "T002", name: "Dewi", status: "available", queueNo: 2 },
    { id: "T003", name: "Rina", status: "busy", timeLeft: "25 min lagi" },
    { id: "T004", name: "Siti", status: "available", queueNo: 3 },
];

const voucherPackages = [
    { id: "V001", name: "Paket Hemat", sessions: 5, price: 650000, validity: 90, discount: "13%", type: "hemat", pricePerSession: "130K" },
    { id: "V002", name: "Paket Premium", sessions: 10, price: 1200000, validity: 180, discount: "20%", type: "premium", pricePerSession: "120K" },
    { id: "V003", name: "Paket VIP", sessions: 20, price: 2200000, validity: 365, discount: "27%", type: "vip", pricePerSession: "110K" },
    { id: "V004", name: "Paket Signature", sessions: 5, price: 1500000, validity: 90, discount: "15%", type: "signature", pricePerSession: "300K" },
];

const dummyMember: Member = {
    id: "M001",
    name: "Sarah Wijaya",
    phone: "0812-3456-7890",
    voucherBalance: 8,
    totalVisits: 24,
    avoidAreas: ["Leher", "Pinggang Bawah", "Lutut Kiri"],
    vouchers: [
        { name: "Paket Hemat", remaining: 5, expiry: "15 Jun 2025" },
        { name: "Paket Signature", remaining: 3, expiry: "20 Mar 2025" },
    ],
    favoriteTherapist: "Maya Putri",
};

export default function POSPage() {
    const [mode, setMode] = useState<"session" | "voucher" | "redeem">("session");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedTherapist, setSelectedTherapist] = useState<string>("T001");
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [member] = useState<Member | null>(dummyMember);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount).replace("IDR", "Rp");
    };

    const addToCart = (service: Service) => {
        const existingItem = cart.find((item) => item.id === service.id);
        if (existingItem) {
            setCart(cart.map((item) =>
                item.id === service.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...service, qty: 1 }]);
        }
    };

    const removeFromCart = (serviceId: string) => {
        setCart(cart.filter((item) => item.id !== serviceId));
    };

    const updateQty = (serviceId: string, delta: number) => {
        setCart(cart.map((item) =>
            item.id === serviceId ? { ...item, qty: Math.max(1, item.qty + delta) } : item
        ).filter((item) => item.qty > 0));
    };

    const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const calculateTotalDuration = () => cart.reduce((sum, item) => sum + item.duration * item.qty, 0);

    return (
        <div className="pos-container">
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
                        <Link href="/dashboard" className="header-btn back" title="Kembali ke Backend">
                            <i className="fa-solid fa-arrow-left"></i>
                            Backend
                        </Link>
                        <button className="header-btn" title="Riwayat">
                            <i className="fa-solid fa-clock-rotate-left"></i>
                        </button>
                        <button className="header-btn" title="Pengaturan">
                            <i className="fa-solid fa-gear"></i>
                        </button>
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
                        <div className="member-search">
                            <div className="member-search-row">
                                <div className="search-input-wrapper">
                                    <i className="fa-solid fa-magnifying-glass"></i>
                                    <input type="text" className="search-input" placeholder="Cari member..." />
                                </div>
                                <button className="btn-add-member" title="Tambah Member Baru">
                                    <i className="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div className="member-info">
                            {member && (
                                <>
                                    {/* Member Card */}
                                    <div className="member-card">
                                        <div className="member-header">
                                            <div className="member-avatar">{member.name.charAt(0)}</div>
                                            <div className="member-details">
                                                <h4>{member.name}</h4>
                                                <p><i className="fa-solid fa-phone"></i> {member.phone}</p>
                                            </div>
                                        </div>
                                        <div className="member-stats">
                                            <div className="member-stat">
                                                <div className="member-stat-value">{member.voucherBalance}</div>
                                                <div className="member-stat-label">Voucher</div>
                                            </div>
                                            <div className="member-stat">
                                                <div className="member-stat-value">{member.totalVisits}</div>
                                                <div className="member-stat-label">Kunjungan</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body Preferences */}
                                    <div className="info-section">
                                        <div className="info-section-title">
                                            <i className="fa-solid fa-circle-exclamation"></i>
                                            Area Hindari Pijat
                                        </div>
                                        <div className="body-tags">
                                            {member.avoidAreas.map((area) => (
                                                <span key={area} className="body-tag avoid">✕ {area}</span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Active Vouchers */}
                                    <div className="info-section">
                                        <div className="info-section-title">
                                            <i className="fa-solid fa-ticket"></i>
                                            Voucher Aktif
                                        </div>
                                        {member.vouchers.map((voucher, idx) => (
                                            <div key={idx} className="voucher-mini">
                                                <div className="voucher-mini-header">
                                                    <span className="voucher-mini-name">{voucher.name}</span>
                                                    <span className="voucher-mini-count">{voucher.remaining} sesi</span>
                                                </div>
                                                <div className="voucher-mini-exp">Exp: {voucher.expiry}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Favorite Therapist */}
                                    <div className="info-section">
                                        <div className="info-section-title">
                                            <i className="fa-solid fa-heart"></i>
                                            Favorit
                                        </div>
                                        <div className="fav-therapist">
                                            <i className="fa-solid fa-star"></i>
                                            <span>{member.favoriteTherapist}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>

                    {/* Service Area */}
                    {mode === "session" && (
                        <div className="service-area">
                            <div className="service-categories">
                                <button className="category-chip active">Semua</button>
                                <button className="category-chip">Massage</button>
                                <button className="category-chip">Therapy</button>
                                <button className="category-chip">Body Care</button>
                                <button className="category-chip">Facial</button>
                                <button className="category-chip">Paket</button>
                            </div>

                            <div className="service-grid-wrapper">
                                <div className="service-grid">
                                    {services.map((service) => (
                                        <div
                                            key={service.id}
                                            className={`service-item ${service.type} ${cart.find(i => i.id === service.id) ? "selected" : ""}`}
                                            onClick={() => addToCart(service)}
                                        >
                                            <div className="service-icon">
                                                <i className={`fa-solid ${service.icon}`}></i>
                                            </div>
                                            <div className="service-name">{service.name}</div>
                                            <div className="service-meta">
                                                <span><i className="fa-regular fa-clock"></i> {service.duration} min</span>
                                            </div>
                                            <div className="service-price">{formatCurrency(service.price)}</div>
                                            <button className="service-add-btn" onClick={(e) => { e.stopPropagation(); addToCart(service); }}>
                                                <i className="fa-solid fa-plus"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Voucher Packages */}
                    {mode === "voucher" && (
                        <div className="service-area">
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {voucherPackages.map((pkg) => (
                                        <div
                                            key={pkg.id}
                                            className={`package-card ${pkg.type} ${selectedPackage === pkg.id ? "selected" : ""}`}
                                            onClick={() => setSelectedPackage(pkg.id)}
                                        >
                                            <div className="package-badge">Hemat {pkg.discount}</div>
                                            <div className="package-name">{pkg.name}</div>
                                            <div className="package-desc">
                                                {pkg.type === "premium" ? "Paling populer! Best value" :
                                                    pkg.type === "vip" ? "Untuk pelanggan setia" :
                                                        pkg.type === "signature" ? "Khusus Signature Green Spa" :
                                                            "Untuk pelanggan yang ingin mencoba"}
                                            </div>
                                            <div className="package-price">{formatCurrency(pkg.price)}</div>
                                            <div className="package-details">
                                                <div className="package-detail">
                                                    <div className="package-detail-value">{pkg.sessions}</div>
                                                    <div className="package-detail-label">Sesi</div>
                                                </div>
                                                <div className="package-detail">
                                                    <div className="package-detail-value">{pkg.validity}</div>
                                                    <div className="package-detail-label">Hari</div>
                                                </div>
                                                <div className="package-detail">
                                                    <div className="package-detail-value">{pkg.pricePerSession}</div>
                                                    <div className="package-detail-label">/Sesi</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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

                                {member && (
                                    <div style={{ marginTop: "36px" }}>
                                        <h4 style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Voucher Member Ini:</h4>

                                        {member.vouchers.map((voucher, idx) => (
                                            <div key={idx} className={`package-card ${idx === 0 ? "hemat" : "signature"}`} style={{ cursor: "pointer", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div>
                                                        <div className="package-name" style={{ fontSize: "18px" }}>{voucher.name}</div>
                                                        <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "6px" }}>
                                                            <i className="fa-regular fa-calendar"></i> Exp: {voucher.expiry}
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
            </div>

            {/* Cart Sidebar */}
            <aside className="pos-sidebar">
                <div className="cart-header">
                    <div className="cart-title">Keranjang</div>
                    <div className="cart-subtitle">
                        {cart.length} item • {calculateTotalDuration()} menit
                    </div>
                </div>

                <div className="cart-items">
                    {cart.length === 0 ? (
                        <div className="cart-empty">
                            <i className="fa-solid fa-cart-shopping"></i>
                            <h4>Keranjang Kosong</h4>
                            <p>Pilih layanan untuk memulai</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.id} className="cart-item">
                                <div className="cart-item-header">
                                    <span className="cart-item-name">{item.name}</span>
                                    <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                                <div className="cart-item-details">
                                    <span className="cart-item-meta">{item.duration} menit</span>
                                    <div className="cart-item-qty">
                                        <button className="qty-btn" onClick={() => updateQty(item.id, -1)}>
                                            <i className="fa-solid fa-minus"></i>
                                        </button>
                                        <span className="qty-value">{item.qty}</span>
                                        <button className="qty-btn" onClick={() => updateQty(item.id, 1)}>
                                            <i className="fa-solid fa-plus"></i>
                                        </button>
                                    </div>
                                    <span className="cart-item-price">{formatCurrency(item.price * item.qty)}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Therapist Selection */}
                {mode === "session" && cart.length > 0 && (
                    <div className="therapist-section">
                        <div className="therapist-section-title">Pilih Therapist</div>
                        <div className="therapist-carousel">
                            {therapists.map((therapist) => (
                                <div
                                    key={therapist.id}
                                    className={`therapist-chip ${therapist.status === "busy" ? "busy" : ""} ${selectedTherapist === therapist.id ? "selected" : ""}`}
                                    onClick={() => therapist.status === "available" && setSelectedTherapist(therapist.id)}
                                >
                                    <div className="therapist-chip-avatar">{therapist.name.charAt(0)}</div>
                                    <div className="therapist-chip-info">
                                        <div className="therapist-chip-name">
                                            {therapist.name}
                                            {therapist.isFavorite && <i className="fa-solid fa-star"></i>}
                                            {therapist.queueNo && <span className="queue-badge">#{therapist.queueNo}</span>}
                                        </div>
                                        <div className={`therapist-chip-status ${therapist.status}`}>
                                            <span className={`status-dot ${therapist.status}`}></span>
                                            {therapist.status === "available" ? "Tersedia" : therapist.timeLeft}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="cart-summary">
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="summary-row">
                        <span className="summary-label">Diskon</span>
                        <span className="summary-value" style={{ color: "var(--spa-green)" }}>- Rp 0</span>
                    </div>
                    <div className="summary-row total">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="cart-actions">
                    <button className="action-btn secondary">
                        <i className="fa-solid fa-ticket"></i>
                        Voucher
                    </button>
                    <button className="action-btn primary">
                        <i className="fa-solid fa-credit-card"></i>
                        Bayar
                    </button>
                </div>
            </aside>
        </div>
    );
}
