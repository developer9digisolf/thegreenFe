    "use client";

    import { useState, useCallback, useEffect } from "react";
    import { useApi } from "@afx/utils/useApi";
    import { formatCurrency } from "@afx/utils/format";
    import { GetSalesService } from "@afx/services/sale.service";
    import { GetRoomsService, GetTherapistsTodayService } from "@afx/services/pos.service";


    // ============================================
    // 1. TYPES & INTERFACES
    // ============================================
    export interface SaleRow {
        id: number; saleCode: string; saleType: number; saleTypeName?: string;
        memberName?: string; memberPhone?: string; grandTotal: number;
        discountAmount?: number; paymentStatus?: number; paymentStatusName?: string;
        createdAt?: string; items?: SaleItem[]; bookings?: SaleBooking[];
    }
    export interface SaleItem {
        id: number; itemName: string; itemType: number; duration: number;
        quantity: number; unitPrice: number; subtotal: number;
        hasSession?: boolean; sessionStatus?: string;
    }
    export interface SaleBooking {
        id: number; bookingCode: string; serviceName: string;
        scheduledDate?: string; scheduledTime?: string;
        hasSession?: boolean; sessionStatus?: string;
    }

    interface AssignTarget { type: "item" | "booking"; saleItemId?: number; bookingCode?: string; label: string; }
    interface Props {
        branchId?: number | null;
        onToast: (msg: string, type?: "success" | "error" | "info") => void;
    }

    // ============================================
    // 2. CONSTANTS & STYLE HELPERS
    // ============================================
    const SALE_TYPE_STYLE: Record<string | number, { bg: string; color: string; label: string }> = {
        0: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Walk-in" },
        "walkIn": { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Walk-in" },
        1: { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Paket" },
        "package": { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Paket" },
        2: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Top-up Kredit" },
        "creditPurchase": { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Top-up Kredit" },
        "credit": { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Top-up Kredit" },
        3: { bg: "rgba(59,130,246,0.1)", color: "#2563eb", label: "Booking" },
        "booking": { bg: "rgba(59,130,246,0.1)", color: "#2563eb", label: "Booking" },
    };
    const PAYMENT_STATUS_STYLE: Record<string | number, { bg: string; color: string; label: string }> = {
        0: { bg: "rgba(239,68,68,0.1)", color: "#dc2626", label: "Belum Lunas" },
        "Pending": { bg: "rgba(239,68,68,0.1)", color: "#dc2626", label: "Belum Lunas" },
        1: { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Partial" },
        "Partial": { bg: "rgba(245,158,11,0.1)", color: "#d97706", label: "Partial" },
        2: { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Lunas" },
        "Paid": { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Lunas" },
        "Lunas": { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Lunas" },
        3: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Refunded" },
        "Refunded": { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6", label: "Refunded" },
        4: { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Dibatalkan" },
        "Cancelled": { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Dibatalkan" },
        5: { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Expired" },
        "Expired": { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Expired" },
    };

    function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
        return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>{label}</span>;
    }

    function SessionStatus({ hasSession, sessionStatus }: { hasSession?: boolean; sessionStatus?: string }) {
        if (!hasSession) return <span style={{ fontSize: "11px", color: "var(--text-muted)", fontStyle: "italic" }}>Belum ada sesi</span>;
        
        const status = sessionStatus?.toLowerCase() || "";
        let label = "Selesai";
        let color = "#64748b";
        let bg = "rgba(100,116,139,0.1)";
        let dot = "#94a3b8";

        if (status === "claimed") {
            label = "Diklaim"; color = "#3b82f6"; bg = "rgba(59,130,246,0.1)"; dot = "#3b82f6";
        } else if (status === "inprogress" || status === "insession") {
            label = "Sesi Berjalan"; color = "#059669"; bg = "rgba(16,185,129,0.1)"; dot = "#22c55e";
        } else if (status === "paused") {
            label = "Tertunda"; color = "#d97706"; bg = "rgba(245,158,11,0.1)"; dot = "#f59e0b";
        } else if (status === "pending") {
            label = "Menunggu"; color = "#64748b"; bg = "rgba(100,116,139,0.1)"; dot = "#94a3b8";
        } else if (status === "completed" || status === "finished") {
            label = "Selesai"; color = "#64748b"; bg = "rgba(100,116,139,0.1)"; dot = "#94a3b8";
        }

        return (
            <span style={{
                display: "inline-flex", alignItems: "center", gap: "5px",
                background: bg,
                color: color,
                padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
            }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: dot }} />
                {label}
            </span>
        );
    }

    // ============================================
    // 3. SUB-COMPONENTS
    // ============================================

    function SaleFilterBar({ filter, setFilter, onSearch, onReset, loading }: any) {
        return (
            <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h2 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <i className="fa-solid fa-receipt" style={{ color: "var(--spa-green)" }} />Transaksi
                    </h2>
                    <button onClick={onSearch} disabled={loading} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, borderRadius: "8px", border: "1px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-muted)", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}>
                        <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`} /> Segarkan
                    </button>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div style={{ flex: "1 1 180px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Cari Member / Kode</label>
                        <div className="search-input-wrapper">
                            <i className="fa-solid fa-magnifying-glass" />
                            <input 
                                type="text" 
                                className="search-input" 
                                placeholder="Nama atau kode..." 
                                value={filter.search} 
                                onChange={(e) => setFilter((f: any) => ({ ...f, search: e.target.value }))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") onSearch();
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: "0 1 155px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Tipe</label>
                        <select value={filter.SaleType} onChange={(e) => setFilter((f: any) => ({ ...f, SaleType: parseInt(e.target.value) }))} className="search-input" style={{ width: "100%", padding: "9px 12px", cursor: "pointer" }}>
                            <option value={-1}>Semua Tipe</option>
                            <option value={0}>Service</option>
                            <option value={1}>Voucher</option>
                            <option value={2}>Kredit</option>
                            <option value={3}>Booking</option>
                        </select>
                    </div>
                    <div style={{ flex: "0 1 145px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Dari</label>
                        <input type="date" className="search-input" value={filter.startDate} onChange={(e) => setFilter((f: any) => ({ ...f, startDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px" }} />
                    </div>
                    <div style={{ flex: "0 1 145px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Sampai</label>
                        <input type="date" className="search-input" value={filter.endDate} onChange={(e) => setFilter((f: any) => ({ ...f, endDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px" }} />
                    </div>
                    <div style={{ flex: 0, minWidth: "120px" }}>
                        <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Status</label>
                        <select value={filter.statuses} onChange={(e) => setFilter((f: any) => ({ ...f, statuses: e.target.value }))} className="search-input" style={{ width: "100%", padding: "9px 12px", cursor: "pointer" }}>
                            <option value="">Semua Status</option>
                            <option value="2">Lunas</option>
                            <option value="0">Belum Lunas</option>
                            <option value="1">Partial / Cicil</option>
                            <option value="4">Dibatalkan</option>
                        </select>
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
                        <button className="action-btn primary" onClick={onSearch} disabled={loading} style={{ padding: "9px 20px", fontSize: "13px", height: "38px" }}>
                            <i className="fa-solid fa-magnifying-glass" /> Cari
                        </button>
                        <button className="action-btn secondary" onClick={onReset} title="Reset Filter" style={{ padding: "9px 14px", fontSize: "13px", height: "38px" }}>
                            <i className="fa-solid fa-filter-circle-xmark" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    function SaleTable({ sales, loading, onRowClick, selectedSaleId, isPanelOpen }: any) {
        if (loading) return (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }} />
            </div>
        );
        if (sales.length === 0) return (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
                <i className="fa-solid fa-receipt" style={{ fontSize: "40px", opacity: 0.3, display: "block", marginBottom: "12px" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada transaksi ditemukan</p>
            </div>
        );

        const grandTotalAll = sales.reduce((s: number, d: any) => s + (d.grandTotal ?? 0), 0);

        return (
            <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
                <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color)", fontSize: "12px", color: "var(--text-muted)", display: "flex", gap: "20px" }}>
                    <span><b style={{ color: "var(--text-primary)" }}>{sales.length}</b> transaksi</span>
                    <span>Total: <b style={{ color: "var(--spa-green)" }}>{formatCurrency(grandTotalAll)}</b></span>
                    <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                        <i className="fa-solid fa-hand-pointer" style={{ opacity: 0.5 }} /> Klik baris untuk detail
                    </span>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-main)" }}>
                                {["Kode / Waktu", "Pelanggan", "Total", "Tipe", "Status"].map((h) => (
                                    <th key={h} style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sales.map((sale: any) => {
                                const tStyle = SALE_TYPE_STYLE[sale.saleType as any] || { bg: "#f1f5f9", color: "#64748b", label: sale.saleTypeDisplay || sale.saleType || "Lainnya" };
                                const pStyle = PAYMENT_STATUS_STYLE[sale.paymentStatus as any] || { bg: "#f1f5f9", color: "#64748b" };
                                const isSelected = selectedSaleId === sale.id && isPanelOpen;
                                return (
                                    <tr
                                        key={sale.id}
                                        onClick={() => onRowClick(sale)}
                                        style={{ borderBottom: "1px solid var(--border-color)", cursor: "pointer", background: isSelected ? "var(--spa-green-bg)" : "transparent" }}
                                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-main)"; }}
                                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                    >
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ fontWeight: 700, fontSize: "13px", fontFamily: "monospace", color: isSelected ? "var(--spa-green)" : "var(--text-primary)" }}>{sale.saleCode}</div>
                                            <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>{sale.createdAt ? new Date(sale.createdAt).toLocaleString("id-ID") : "—"}</div>
                                        </td>
                                        <td style={{ padding: "14px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--spa-green-bg)", color: "var(--spa-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                                                    {(sale.memberName ?? "G").charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: "13px" }}>{sale.memberName ?? "Guest"}</div>
                                                    {sale.memberPhone && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sale.memberPhone}</div>}
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--spa-green)" }}>{formatCurrency(sale.grandTotal)}</td>
                                        <td style={{ padding: "14px 16px" }}><Pill label={sale.saleTypeDisplay ?? sale.saleTypeName ?? tStyle.label} bg={tStyle.bg} color={tStyle.color} /></td>
                                        <td style={{ padding: "14px 16px" }}><Pill label={sale.paymentStatusDisplay ?? sale.paymentStatusName ?? String(sale.paymentStatus ?? "Unknown")} bg={pStyle.bg} color={pStyle.color} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    function SaleDetailDrawer({ isOpen, onClose, sale, loading, onOpenAssign }: any) {
        if (!isOpen) return null;
        return (
            <>
                <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 1100, backdropFilter: "blur(2px)" }} />
                <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 95vw)", background: "var(--bg-card)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 1200, display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                        <button onClick={onClose} style={{ background: "var(--bg-main)", border: "none", borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <i className="fa-solid fa-xmark" />
                        </button>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: "16px", fontFamily: "monospace", color: "var(--spa-green)" }}>{sale?.saleCode ?? "—"}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{sale?.memberName ?? "Guest"}</div>
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                        {/* FIX: Tampilkan loading spinner jika sedang fetch detail */}
                        {loading ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "var(--spa-green)" }} />
                                <span style={{ fontSize: "13px" }}>Memuat detail transaksi...</span>
                            </div>
                        ) : !sale ? null : (
                            <>
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL</div>
                                        <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--spa-green)" }}>{formatCurrency(sale.grandTotal)}</div>
                                        {sale.discountAmount > 0 && (
                                            <div style={{ marginTop: "4px" }}>
                                                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>DISKON</div>
                                                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--accent-red)" }}>- {formatCurrency(sale.discountAmount)}</div>
                                            </div>
                                        )}
                                    </div>
                                    {sale.sessionCode && (
                                        <div style={{ textAlign: "center", background: "#fff", padding: "8px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                            <img 
                                                src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(sale.sessionCode)}&scale=2&backgroundcolor=ffffff`}
                                                alt="Session QR"
                                                style={{ width: "80px", height: "80px" }}
                                            />
                                            <div style={{ fontSize: "10px", fontWeight: 700, marginTop: "4px", color: "var(--text-muted)", fontFamily: "monospace" }}>{sale.sessionCode}</div>
                                        </div>
                                    )}
                                </div>

                                {/* FIX: Tampilkan pesan jika items kosong setelah loading selesai */}
                                {(!sale.items || sale.items.length === 0) && (!sale.bookings || sale.bookings.length === 0) && (
                                    <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                                        <i className="fa-solid fa-box-open" style={{ fontSize: "32px", opacity: 0.3, display: "block", marginBottom: "8px" }} />
                                        <p style={{ margin: 0, fontSize: "13px" }}>Tidak ada item ditemukan</p>
                                    </div>
                                )}

                                {sale.items && sale.items.length > 0 && (
                                    <section style={{ marginBottom: "24px" }}>
                                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                                            <i className="fa-solid fa-spa" style={{ color: "var(--spa-green)" }} /> Item Layanan
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {sale.items.map((item: any) => (
                                                <div key={item.id} style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{item.itemName}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
                                                            {item.duration > 0 && <span>{item.duration} mnt • </span>}
                                                            ×{item.quantity} • <span style={{ color: "var(--spa-green)", fontWeight: 600 }}>{formatCurrency(item.subtotal)}</span>
                                                        </div>
                                                        <div style={{ marginTop: "6px" }}>
                                                            <SessionStatus hasSession={item.hasSession} sessionStatus={item.session?.status ?? item.sessionStatus} />
                                                        </div>
                                                    </div>
                                                    {!item.hasSession ? (
                                                        <button
                                                            onClick={() => onOpenAssign({ type: "item", saleItemId: item.id, label: item.itemName })}
                                                            style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 700, background: "var(--spa-green-bg)", color: "var(--spa-green)", border: "1px solid var(--spa-green-border)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
                                                        >
                                                            <i className="fa-solid fa-play" /> Buat Sesi
                                                        </button>
                                                    ) : (
                                                        item.session?.sessionCode && (
                                                            <div style={{ textAlign: "center", background: "#fff", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                                                                <img 
                                                                    src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(item.session.sessionCode)}&scale=1&backgroundcolor=ffffff`}
                                                                    alt="Item Session QR"
                                                                    style={{ width: "48px", height: "48px" }}
                                                                />
                                                                <div style={{ fontSize: "8px", fontWeight: 700, marginTop: "2px", color: "var(--text-muted)", fontFamily: "monospace" }}>{item.session.sessionCode}</div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {sale.bookings && sale.bookings.length > 0 && (
                                    <section>
                                        <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "10px" }}>
                                            <i className="fa-solid fa-calendar-check" style={{ color: "var(--spa-green)" }} /> Booking
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                            {sale.bookings.map((bk: any) => (
                                                <div key={bk.id} style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{bk.serviceName}</div>
                                                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{bk.bookingCode}</div>
                                                        <div style={{ marginTop: "6px" }}>
                                                            <SessionStatus hasSession={bk.hasSession} sessionStatus={bk.session?.status ?? bk.sessionStatus} />
                                                        </div>
                                                    </div>
                                                    {!bk.hasSession ? (
                                                        <button
                                                            onClick={() => onOpenAssign({ type: "booking", bookingCode: bk.code, label: bk.serviceName || `Booking ${bk.code}` })}
                                                            style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 700, background: "rgba(59,130,246,0.08)", color: "#2563eb", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
                                                        >
                                                            <i className="fa-solid fa-user-plus" /> Assign
                                                        </button>
                                                    ) : (
                                                        bk.session?.sessionCode && (
                                                            <div style={{ textAlign: "center", background: "#fff", padding: "4px", borderRadius: "8px", border: "1px solid var(--border-color)", flexShrink: 0 }}>
                                                                <img 
                                                                    src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(bk.session.sessionCode)}&scale=1&backgroundcolor=ffffff`}
                                                                    alt="Booking Session QR"
                                                                    style={{ width: "48px", height: "48px" }}
                                                                />
                                                                <div style={{ fontSize: "8px", fontWeight: 700, marginTop: "2px", color: "var(--text-muted)", fontFamily: "monospace" }}>{bk.session.sessionCode}</div>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </>
        );
    }

    function SaleAssignModal({ target, therapists, rooms, masterLoading, onClose, onSubmit }: any) {
        const [form, setForm] = useState({ therapistId: "", roomId: "", notes: "" });
        const [loading, setLoading] = useState(false);

        useEffect(() => {
            if (target) {
                // Pre-select index 0 for therapist and room if they are available
                setForm({ 
                    therapistId: therapists?.[0]?.id?.toString() || "", 
                    roomId: rooms?.[0]?.id?.toString() || "", 
                    notes: "" 
                });
            }
        }, [target, therapists, rooms]);

        const handleSubmit = async () => {
            if (!form.therapistId || !form.roomId) return;
            setLoading(true);
            await onSubmit(form);
            setLoading(false);
        };

        if (!target) return null;

        return (
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1300 }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: "20px", padding: "28px", width: "min(400px, 92vw)", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Penugasan Sesi</h3>
                            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>{target.label}</p>
                        </div>
                        <button onClick={onClose} style={{ background: "var(--bg-main)", border: "none", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", color: "var(--text-muted)" }}>
                            <i className="fa-solid fa-xmark" />
                        </button>
                    </div>

                    {masterLoading ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "32px", gap: "10px", color: "var(--text-muted)" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--spa-green)" }} />
                            <span style={{ fontSize: "13px" }}>Memuat data terapis & ruangan...</span>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Therapist * {therapists.length === 0 && <span style={{ color: "var(--accent-red)", fontWeight: 400 }}>(tidak ada data)</span>}
                                </label>
                                <select
                                    value={form.therapistId}
                                    onChange={(e) => setForm({ ...form, therapistId: e.target.value })}
                                    className="search-input"
                                    style={{ width: "100%", padding: "11px 14px" }}
                                    disabled={therapists.length === 0}
                                >
                                    <option value="">— Pilih Therapist —</option>
                                    {therapists.map((t: any) => (
                                        <option key={t.id} value={t.id}>
                                            {t.employeeName ?? t.name ?? t.therapistName ?? `Therapist #${t.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "14px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>
                                    Ruangan * {rooms.length === 0 && <span style={{ color: "var(--accent-red)", fontWeight: 400 }}>(tidak ada data)</span>}
                                </label>
                                <select
                                    value={form.roomId}
                                    onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                                    className="search-input"
                                    style={{ width: "100%", padding: "11px 14px" }}
                                    disabled={rooms.length === 0}
                                >
                                    <option value="">— Pilih Ruangan —</option>
                                    {rooms.map((r: any) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name ?? r.roomName ?? `Ruangan #${r.id}`}
                                            {r.statusDisplay ? ` (${r.statusDisplay})` : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: "20px" }}>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>Catatan</label>
                                <textarea
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    rows={2}
                                    className="search-input"
                                    style={{ width: "100%", padding: "11px 14px", resize: "none" }}
                                    placeholder="Contoh: Member ingin pijatan lembut di bahu"
                                />
                            </div>

                            <div style={{ display: "flex", gap: "10px" }}>
                                <button className="action-btn secondary" onClick={onClose} style={{ flex: 1 }} disabled={loading}>Batal</button>
                                <button
                                    className="action-btn primary"
                                    onClick={handleSubmit}
                                    disabled={loading || !form.therapistId || !form.roomId}
                                    style={{ flex: 2 }}
                                >
                                    {loading ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-play" />}
                                    {" "}{loading ? "Memproses..." : "Mulai Sesi"}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    function SessionSuccessModal({ session, onClose }: { session: any; onClose: () => void }) {
        if (!session) return null;
        
        const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(session.sessionCode)}&scale=3&rotate=N&includetext&backgroundcolor=ffffff`;

        return (
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400, backdropFilter: "blur(10px)" }}>
                <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: "32px", padding: "40px", width: "min(420px, 92vw)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", textAlign: "center", animation: "modalScale 0.3s ease-out" }}>
                    <div style={{ width: "72px", height: "72px", background: "var(--spa-green-bg)", color: "var(--spa-green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 24px" }}>
                        <i className="fa-solid fa-circle-check" />
                    </div>
                    
                    <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>Sesi Berhasil Dibuat!</h2>
                    <p style={{ margin: "8px 0 28px", color: "var(--text-muted)", fontSize: "14px" }}>Gunakan barcode di bawah untuk memulai sesi</p>
                    
                    <div style={{ background: "#fff", padding: "24px", borderRadius: "20px", border: "1px solid var(--border-color)", marginBottom: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                        <img 
                            src={barcodeUrl} 
                            alt={session.sessionCode} 
                            style={{ maxWidth: "100%", height: "auto" }} 
                            onError={(e) => {
                                (e.target as any).src = "https://via.placeholder.com/300x100?text=Barcode+Error";
                            }}
                        />
                        <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 700, color: "var(--spa-green)", letterSpacing: "1px" }}>
                            {session.sessionCode}
                        </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px", textAlign: "left" }}>
                        <div style={{ background: "var(--bg-main)", padding: "12px 16px", borderRadius: "14px" }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Terapis</div>
                            <div style={{ fontSize: "13px", fontWeight: 700 }}>{session.therapistName}</div>
                        </div>
                        <div style={{ background: "var(--bg-main)", padding: "12px 16px", borderRadius: "14px" }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Ruangan</div>
                            <div style={{ fontSize: "13px", fontWeight: 700 }}>{session.roomName}</div>
                        </div>
                    </div>

                    <button 
                        className="action-btn primary" 
                        onClick={onClose}
                        style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: 700, borderRadius: "16px" }}
                    >
                        Tutup & Selesai
                    </button>
                </div>
            </div>
        );
    }

    // ============================================
    // 4. MAIN ORCHESTRATOR COMPONENT
    // ============================================
    export default function SaleHistoryTab({ branchId, onToast }: Props) {
        const { post } = useApi();

        const getDefaultDates = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(now.getDate() + 1); // Tambah 1 hari agar inclusive hari ini
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            
            const formatDate = (date: Date) => date.toISOString().split("T")[0];
            return { start: formatDate(lastMonth), end: formatDate(tomorrow) };
        };

        const { start, end } = getDefaultDates();
        const [filter, setFilter] = useState({ search: "", SaleType: -1, startDate: start, endDate: end, statuses: "" });
        const [sales, setSales] = useState<SaleRow[]>([]);
        const [loading, setLoading] = useState(false);

        const [panelOpen, setPanelOpen] = useState(false);
        const [selectedSale, setSelectedSale] = useState<SaleRow | null>(null);

        const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
        const [masterLoading, setMasterLoading] = useState(false);

        const [therapists, setTherapists] = useState<any[]>([]);
        const [rooms, setRooms] = useState<any[]>([]);
        const [createdSession, setCreatedSession] = useState<any | null>(null);

        // ── Fetch list transaksi ───────────────────────────────────────────────────
        const fetchSales = useCallback(async (overrideFilter?: any) => {
            const f = (overrideFilter && !overrideFilter.nativeEvent) ? overrideFilter : filter;
            setLoading(true);
            
            console.log("SaleHistoryTab: fetching with branchId:", branchId, "and filter:", f);

            try {
                // Jika sedang melakukan pencarian (search), abaikan filter lain agar lebih global
                const isSearching = !!f.search?.trim();

                const res = await GetSalesService({
                    branchId: branchId || undefined,
                    page: 1,
                    pageSize: 100, // perbesar limit agar lebih banyak data muncul
                    search: f.search || undefined,
                    SaleType: isSearching ? undefined : (f.SaleType >= 0 ? f.SaleType : undefined),
                    startDate: isSearching ? undefined : (f.startDate || undefined),
                    endDate: isSearching ? undefined : (f.endDate || undefined),
                    statuses: isSearching ? undefined : (f.statuses || undefined),
                });
                
                if (res.success) {
                    setSales(res.data?.items ?? res.data ?? []);
                } else {
                    onToast(res.message ?? "Gagal memuat data", "error");
                }
            } catch (err) {
                console.error("SaleHistoryTab Error:", err);
                onToast("Gagal memuat riwayat", "error");
            } finally {
                setLoading(false);
            }
        }, [branchId, filter, onToast]);

        // ── FIX: Fetch detail saat row diklik ─────────────────────────────────────
        const openDetail = useCallback((sale: SaleRow) => {
            setSelectedSale(sale);
            setPanelOpen(true);
        }, []);

        // ── Fetch master data therapist & room ────────────────────────────────────
        const fetchMasterData = useCallback(async () => {
            if (!branchId) return;
            setMasterLoading(true);
            try {
                const [roomRes, therapistRes] = await Promise.all([
                    GetRoomsService(branchId),
                    GetTherapistsTodayService(branchId),
                ]);

                // Debug: lihat struktur data yang dikembalikan
                console.log("roomRes.data sample:", roomRes.data?.[0]);
                console.log("therapistRes.data sample:", therapistRes.data?.[0]);

                if (roomRes.success) setRooms(roomRes.data ?? []);
                if (therapistRes.success) setTherapists(therapistRes.data ?? []);
            } catch (error) {
                console.error("Gagal menarik data master", error);
            } finally {
                setMasterLoading(false);
            }
        }, [branchId]);

        // ── FIX: Fetch master data saat tombol "Buat Sesi" diklik ─────────────────
        // Bukan hanya saat mount — data bisa berubah (terapis jadi sibuk, dll)
        const handleOpenAssign = useCallback(async (target: AssignTarget) => {
            setAssignTarget(target);
            await fetchMasterData(); // refresh setiap kali modal assign dibuka
        }, [fetchMasterData]);

        // ── Submit assign ─────────────────────────────────────────────────────────
        const handleAssignSubmit = async (form: any) => {
            if (!assignTarget) return;
            try {
                const payload = {
                    TherapistId: parseInt(form.therapistId),
                    RoomId: parseInt(form.roomId),
                    Notes: form.notes || null,
                };
                const res = assignTarget.type === "item"
                        ? await post("pos/sessions/create-from-sale-item", { ...payload, SaleItemId: assignTarget.saleItemId })
                        : await post("pos/bookings/create-session", { ...payload, BookingCode: assignTarget.bookingCode });

                if (res?.success || res?.meta?.success) {
                    onToast("Sesi berhasil dibuat!", "success");
                    setAssignTarget(null);
                    fetchMasterData();
                    
                    // Ambil data sesi dari response untuk ditampilkan di modal barcode
                    if (res.data) setCreatedSession(res.data);

                    // Update status item/booking di drawer tanpa fetch ulang
                    setSelectedSale((prev) => {
                        if (!prev) return prev;
                        return assignTarget.type === "item"
                            ? { ...prev, items: prev.items?.map((it) => it.id === assignTarget.saleItemId ? { ...it, hasSession: true, sessionStatus: "InProgress" } : it) }
                            : { ...prev, bookings: prev.bookings?.map((bk) => bk.bookingCode === assignTarget.bookingCode ? { ...bk, hasSession: true, sessionStatus: "InProgress" } : bk) };
                    });
                } else {
                    onToast("Gagal membuat sesi", "error");
                }
            } catch {
                onToast("Kesalahan jaringan", "error");
            }
        };

        useEffect(() => {
            if (branchId) fetchSales();
        }, [branchId]); 

        return (
            <div className="service-grid-wrapper" style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <SaleFilterBar
                    filter={filter}
                    setFilter={setFilter}
                    onSearch={fetchSales}
                    onReset={() => {
                        const { start, end } = getDefaultDates();
                        const newFilter = { search: "", SaleType: -1, startDate: start, endDate: end, statuses: "" };
                        setFilter(newFilter);
                        fetchSales(newFilter);
                    }}
                    loading={loading}
                />
                <SaleTable
                    sales={sales}
                    loading={loading}
                    onRowClick={openDetail}
                    selectedSaleId={selectedSale?.id}
                    isPanelOpen={panelOpen}
                />
                <SaleDetailDrawer
                    isOpen={panelOpen}
                    onClose={() => { setPanelOpen(false); setSelectedSale(null); }}
                    sale={selectedSale}
                    loading={false}   // ← ubah dari {detailLoading}
                    onOpenAssign={handleOpenAssign}
                />
                <SaleAssignModal
                    target={assignTarget}
                    therapists={therapists}
                    rooms={rooms}
                    masterLoading={masterLoading}
                    onClose={() => setAssignTarget(null)}
                    onSubmit={handleAssignSubmit}
                />
                <SessionSuccessModal
                    session={createdSession}
                    onClose={() => setCreatedSession(null)}
                />
            </div>
        );
    }