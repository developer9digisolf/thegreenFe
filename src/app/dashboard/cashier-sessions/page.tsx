"use client";

import { useState, useEffect, useCallback } from "react";
import { DatePicker, message } from "antd";
import dayjs from "dayjs";
import { useApi } from "@afx/utils/useApi";
import { rest } from "@afx/utils/config.rest";

const { RangePicker } = DatePicker;

// ============================================
// HELPERS
// ============================================
function fmtCurrency(amount: number): string {
    return `Rp${amount.toLocaleString("id-ID")}`;
}

function fmtCurrencyShort(amount: number): string {
    if (amount >= 1_000_000) return `Rp${(amount / 1_000_000).toFixed(1)}jt`;
    if (amount >= 1_000) return `Rp${(amount / 1_000).toFixed(0)}rb`;
    return `Rp${amount.toLocaleString("id-ID")}`;
}

function fmtDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

function fmtTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("id-ID", {
        hour: "2-digit", minute: "2-digit"
    });
}

function fmtDuration(openedAt: string, closedAt?: string): string {
    if (!closedAt) return "—";
    const diff = new Date(closedAt).getTime() - new Date(openedAt).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}j ${minutes}m`;
    return `${minutes}m`;
}

const payStatusLabel: Record<string, string> = {
    Paid: "Lunas", Pending: "Pending", Partial: "Sebagian",
    Cancelled: "Batal", Refunded: "Refund", Draft: "Draft",
};

const payStatusColor: Record<string, { bg: string; fg: string }> = {
    Paid: { bg: "#ecfdf5", fg: "#059669" },
    Pending: { bg: "#fffbeb", fg: "#d97706" },
    Partial: { bg: "#eff6ff", fg: "#3b82f6" },
    Cancelled: { bg: "#fef2f2", fg: "#ef4444" },
    Refunded: { bg: "#fef2f2", fg: "#ef4444" },
    Draft: { bg: "#f3f4f6", fg: "#6b7280" },
};

const movementTypeLabel: Record<string, string> = {
    Opening: "Kas Awal",
    SaleReceived: "Penjualan",
    CashIn: "Kas Masuk",
    CashOut: "Kas Keluar",
    Adjustment: "Penyesuaian",
    Closing: "Penutupan",
};

const movementTypeIcon: Record<string, { icon: string; color: string; bg: string }> = {
    Opening: { icon: "fa-door-open", color: "#059669", bg: "#ecfdf5" },
    SaleReceived: { icon: "fa-cart-shopping", color: "#059669", bg: "#ecfdf5" },
    CashIn: { icon: "fa-arrow-down", color: "#3b82f6", bg: "#eff6ff" },
    CashOut: { icon: "fa-arrow-up", color: "#ef4444", bg: "#fef2f2" },
    Adjustment: { icon: "fa-sliders", color: "#d97706", bg: "#fffbeb" },
    Closing: { icon: "fa-door-closed", color: "#6b7280", bg: "#f3f4f6" },
};

const saleTypeLabel: Record<string, string> = {
    WalkIn: "Walk-In", Package: "Paket", CreditPurchase: "Kredit", Redeem: "Redeem",
};

const saleTypeColor: Record<string, string> = {
    WalkIn: "#059669", Package: "#7c3aed", CreditPurchase: "#0891b2", Redeem: "#d97706",
};

// ============================================
// PAGE
// ============================================
export default function CashierSessionsPage() {
    const { get } = useApi();

    // Data
    const [sessions, setSessions] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);

    // Detail modal
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // Sale detail sub-modal
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [showSaleDetail, setShowSaleDetail] = useState(false);
    const [loadingSaleDetail, setLoadingSaleDetail] = useState(false);

    // ============================================
    // FETCH
    // ============================================
    const fetchSessions = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, any> = {
                page,
                pageSize: pagination.pageSize,
                sortColumn: "openedat",
                sortDirection: "desc"
            };
            if (search) params.search = search;
            if (statusFilter !== "") params.status = statusFilter;
            if (dateRange) {
                params.dateFrom = dateRange[0];
                params.dateTo = dateRange[1];
            }

            const res = await get(rest.cashierSession, params);
            if (res.success) {
                setSessions(res.data || []);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 15,
                    total: res.pagination?.total || 0,
                });
            }
        } catch (err: any) {
            message.error(err?.message || "Gagal memuat data sesi kasir");
        } finally {
            setLoading(false);
        }
    }, [get, search, statusFilter, dateRange, pagination.pageSize]);

    const fetchDetail = async (id: number) => {
        setLoadingDetail(true);
        setShowDetail(true);
        try {
            const res = await get(rest.cashierSessionDetailFull.replace(":id", id.toString()));
            if (res.success) {
                setSelectedSession(res.data);
            }
        } catch (err) {
            message.error("Gagal memuat detail sesi");
        } finally {
            setLoadingDetail(false);
        }
    };

    const fetchSaleDetail = async (id: number) => {
        setLoadingSaleDetail(true);
        setShowSaleDetail(true);
        try {
            const res = await get(rest.salesDetail.replace(":id", id.toString()));
            if (res.success) {
                setSelectedSale(res.data);
            }
        } catch (err) {
            message.error("Gagal memuat detail penjualan");
        } finally {
            setLoadingSaleDetail(false);
        }
    };

    useEffect(() => { fetchSessions(); }, [fetchSessions]);

    // ============================================
    // COMPUTED SUMMARY
    // ============================================
    const summaryFromList = {
        totalSessions: pagination.total,
        activeSessions: sessions.filter(s => s.statusName === "Open").length,
        totalRevenue: sessions.reduce((sum, s) => sum + (s.totalSalesAmount || 0), 0),
        totalTransactions: sessions.reduce((sum, s) => sum + (s.totalSales || 0), 0),
    };

    // ============================================
    // QUICK FILTERS
    // ============================================
    const statusFilters = [
        { label: "Semua", value: "" },
        { label: "Aktif", value: "0" },
        { label: "Ditutup", value: "1" },
    ];

    // ============================================
    // RENDER
    // ============================================
    return (
        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>Sesi Kasir</h1>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                        Riwayat semua sesi kasir POS dan laporan penjualan per sesi
                    </p>
                </div>
                <RangePicker
                    onChange={(dates) => {
                        if (dates && dates[0] && dates[1]) {
                            setDateRange([dates[0].format("YYYY-MM-DD"), dates[1].format("YYYY-MM-DD")]);
                        } else {
                            setDateRange(null);
                        }
                    }}
                    format="DD/MM/YYYY"
                    placeholder={["Dari Tanggal", "Sampai Tanggal"]}
                    style={{ borderRadius: 10 }}
                />
            </div>

            {/* Summary Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                <SummaryCard
                    icon="fa-clock-rotate-left" color="#059669" bg="#ecfdf5"
                    label="Total Sesi" value={`${summaryFromList.totalSessions}`}
                />
                <SummaryCard
                    icon="fa-signal" color="#3b82f6" bg="#eff6ff"
                    label="Sesi Aktif" value={`${summaryFromList.activeSessions}`}
                />
                <SummaryCard
                    icon="fa-receipt" color="#7c3aed" bg="#f5f3ff"
                    label="Total Transaksi" value={`${summaryFromList.totalTransactions}`}
                />
                <SummaryCard
                    icon="fa-money-bill-wave" color="#059669" bg="#ecfdf5"
                    label="Pendapatan (halaman ini)" value={fmtCurrencyShort(summaryFromList.totalRevenue)}
                />
            </div>

            {/* Filters Row */}
            <div style={{
                display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap"
            }}>
                <div style={{ position: "relative", flex: "0 0 280px" }}>
                    <i className="fa-solid fa-search" style={{
                        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
                        color: "#9ca3af", fontSize: 13
                    }}></i>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchSessions(1)}
                        placeholder="Cari kode sesi, kasir..."
                        style={{
                            width: "100%", padding: "10px 14px 10px 38px",
                            border: "1px solid #e5e7eb", borderRadius: 10,
                            fontSize: 13, outline: "none"
                        }}
                    />
                </div>

                <div style={{ display: "flex", gap: 6 }}>
                    {statusFilters.map((f) => (
                        <button key={f.value} onClick={() => setStatusFilter(f.value)}
                            style={{
                                padding: "8px 16px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                border: "none", cursor: "pointer",
                                background: statusFilter === f.value ? "#059669" : "#f3f4f6",
                                color: statusFilter === f.value ? "white" : "#4b5563",
                            }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
                    {pagination.total} sesi
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: "white", borderRadius: 16, overflow: "hidden",
                border: "1px solid #e5e7eb",
            }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                        <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={thStyle}>Kode Sesi</th>
                            <th style={thStyle}>Kasir</th>
                            <th style={thStyle}>Dibuka</th>
                            <th style={thStyle}>Ditutup</th>
                            <th style={thStyle}>Durasi</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Kas Awal</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Transaksi</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Penjualan</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Tunai</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Non-Tunai</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Selisih</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={12} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                                Memuat data...
                            </td></tr>
                        ) : sessions.length === 0 ? (
                            <tr><td colSpan={12} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                                <i className="fa-solid fa-inbox" style={{ fontSize: 24, display: "block", marginBottom: 8 }}></i>
                                Belum ada sesi kasir
                            </td></tr>
                        ) : (
                            sessions.map((session) => {
                                const isOpen = session.statusName === "Open";
                                const diff = session.cashDifference;
                                const diffColor = diff === null || diff === undefined ? "#9ca3af"
                                    : diff === 0 ? "#059669"
                                    : diff > 0 ? "#3b82f6" : "#ef4444";

                                return (
                                    <tr key={session.id}
                                        onClick={() => fetchDetail(session.id)}
                                        style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 700, color: "#111827", fontFamily: "monospace", fontSize: 12 }}>
                                                {session.sessionCode}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 600 }}>{session.userName}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 12 }}>{fmtDateTime(session.openedAt)}</span>
                                        </td>
                                        <td style={tdStyle}>
                                            {isOpen ? (
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                                                    background: "#ecfdf5", color: "#059669",
                                                    display: "inline-flex", alignItems: "center", gap: 4
                                                }}>
                                                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#059669", animation: "pulse 2s infinite" }}></span>
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span style={{ fontSize: 12 }}>{fmtDateTime(session.closedAt)}</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 12, color: "#6b7280" }}>
                                                {isOpen ? "—" : fmtDuration(session.openedAt, session.closedAt)}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontFamily: "monospace", fontSize: 12 }}>
                                            {fmtCurrency(session.openingCash)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <span style={{
                                                background: session.totalSales > 0 ? "#f0fdf4" : "#f3f4f6",
                                                color: session.totalSales > 0 ? "#059669" : "#9ca3af",
                                                padding: "2px 10px", borderRadius: 6,
                                                fontSize: 12, fontWeight: 700
                                            }}>
                                                {session.totalSales}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#111827" }}>
                                            {fmtCurrency(session.totalSalesAmount)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontSize: 12, color: "#059669" }}>
                                            {fmtCurrency(session.totalCashReceived)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontSize: 12, color: "#3b82f6" }}>
                                            {fmtCurrency(session.totalNonCashReceived)}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>
                                            {isOpen ? (
                                                <span style={{ fontSize: 12, color: "#9ca3af" }}>—</span>
                                            ) : (
                                                <span style={{
                                                    padding: "3px 10px", borderRadius: 6,
                                                    fontSize: 11, fontWeight: 700,
                                                    background: `${diffColor}10`, color: diffColor,
                                                }}>
                                                    {diff === 0 ? "Seimbang" : diff > 0 ? `+${fmtCurrency(diff)}` : fmtCurrency(diff)}
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fetchDetail(session.id); }}
                                                style={{
                                                    background: "#f3f4f6", border: "none", borderRadius: 8,
                                                    padding: "6px 12px", cursor: "pointer", fontSize: 12,
                                                    color: "#374151"
                                                }}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.total > pagination.pageSize && (
                <div style={{
                    display: "flex", justifyContent: "center", alignItems: "center",
                    gap: 8, marginTop: 20
                }}>
                    <button
                        onClick={() => fetchSessions(pagination.current - 1)}
                        disabled={pagination.current <= 1}
                        style={paginBtn(pagination.current <= 1)}
                    >
                        <i className="fa-solid fa-chevron-left"></i>
                    </button>
                    {Array.from({ length: Math.min(Math.ceil(pagination.total / pagination.pageSize), 7) }, (_, i) => {
                        const totalPages = Math.ceil(pagination.total / pagination.pageSize);
                        let page: number;
                        if (totalPages <= 7) {
                            page = i + 1;
                        } else if (pagination.current <= 4) {
                            page = i + 1;
                        } else if (pagination.current >= totalPages - 3) {
                            page = totalPages - 6 + i;
                        } else {
                            page = pagination.current - 3 + i;
                        }
                        return (
                            <button key={page} onClick={() => fetchSessions(page)}
                                style={{
                                    ...paginBtn(false),
                                    background: page === pagination.current ? "#059669" : "#f3f4f6",
                                    color: page === pagination.current ? "white" : "#374151",
                                    fontWeight: page === pagination.current ? 700 : 500,
                                }}>
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => fetchSessions(pagination.current + 1)}
                        disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                        style={paginBtn(pagination.current >= Math.ceil(pagination.total / pagination.pageSize))}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* ============================================ */}
            {/* SESSION DETAIL MODAL (Step 3) */}
            {/* ============================================ */}
            {showDetail && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, backdropFilter: "blur(4px)"
                }} onClick={() => setShowDetail(false)}>
                    <div style={{
                        background: "white", borderRadius: 20, padding: 0,
                        width: "100%", maxWidth: 680, maxHeight: "92vh", overflowY: "auto",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                    }} onClick={(e) => e.stopPropagation()}>

                        {loadingDetail ? (
                            <div style={{ textAlign: "center", padding: 60 }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#059669" }}></i>
                                <div style={{ marginTop: 12, color: "#6b7280" }}>Memuat detail sesi...</div>
                            </div>
                        ) : selectedSession ? (
                            <>
                                {/* Header */}
                                <div style={{
                                    padding: "24px 28px", borderBottom: "1px solid #f3f4f6",
                                    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                    background: selectedSession.statusName === "Open" ? "#f0fdf4" : "transparent"
                                }}>
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                                            <div style={{ fontSize: 11, color: "#6b7280" }}>DETAIL SESI KASIR</div>
                                            <span style={{
                                                padding: "2px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                                                background: selectedSession.statusName === "Open" ? "#ecfdf5" : "#f3f4f6",
                                                color: selectedSession.statusName === "Open" ? "#059669" : "#6b7280",
                                            }}>
                                                {selectedSession.statusName === "Open" ? "● Aktif" : "Ditutup"}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", fontFamily: "monospace" }}>
                                            {selectedSession.sessionCode}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, display: "flex", gap: 16 }}>
                                            <span><i className="fa-solid fa-user" style={{ marginRight: 4 }}></i>{selectedSession.userName}</span>
                                            <span><i className="fa-solid fa-clock" style={{ marginRight: 4 }}></i>{fmtDateTime(selectedSession.openedAt)}</span>
                                            {selectedSession.closedAt && (
                                                <span><i className="fa-solid fa-door-closed" style={{ marginRight: 4 }}></i>{fmtDateTime(selectedSession.closedAt)}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setShowDetail(false)} style={{
                                        background: "#f3f4f6", border: "none", borderRadius: 10,
                                        width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#6b7280"
                                    }}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                <div style={{ padding: "20px 28px" }}>

                                    {/* Section 1: Cash Summary Cards */}
                                    <div style={{
                                        display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24
                                    }}>
                                        <CashCard
                                            icon="fa-door-open" label="Kas Awal"
                                            value={fmtCurrency(selectedSession.openingCash)}
                                            color="#059669" bg="#ecfdf5"
                                        />
                                        <CashCard
                                            icon="fa-bullseye" label="Kas Diharapkan"
                                            value={fmtCurrency(selectedSession.expectedClosingCash)}
                                            color="#3b82f6" bg="#eff6ff"
                                        />
                                        {selectedSession.closedAt && (
                                            <>
                                                <CashCard
                                                    icon="fa-calculator" label="Kas Aktual"
                                                    value={fmtCurrency(selectedSession.actualClosingCash || 0)}
                                                    color="#7c3aed" bg="#f5f3ff"
                                                />
                                                <CashCard
                                                    icon={selectedSession.cashDifference === 0 ? "fa-check-circle" : "fa-exclamation-triangle"}
                                                    label="Selisih Kas"
                                                    value={selectedSession.cashDifference === 0 ? "Seimbang"
                                                        : selectedSession.cashDifference > 0 ? `+${fmtCurrency(selectedSession.cashDifference)}`
                                                        : fmtCurrency(selectedSession.cashDifference)}
                                                    color={selectedSession.cashDifference === 0 ? "#059669"
                                                        : selectedSession.cashDifference > 0 ? "#3b82f6" : "#ef4444"}
                                                    bg={selectedSession.cashDifference === 0 ? "#ecfdf5"
                                                        : selectedSession.cashDifference > 0 ? "#eff6ff" : "#fef2f2"}
                                                />
                                            </>
                                        )}
                                    </div>

                                    {/* Revenue Summary */}
                                    <div style={{
                                        background: "linear-gradient(135deg, #059669, #14b8a6)",
                                        borderRadius: 16, padding: "20px 24px", marginBottom: 24, color: "white",
                                        display: "flex", justifyContent: "space-between", alignItems: "center"
                                    }}>
                                        <div>
                                            <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 4 }}>Total Penjualan</div>
                                            <div style={{ fontWeight: 800, fontSize: 26 }}>{fmtCurrency(selectedSession.totalSalesAmount)}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ opacity: 0.85, fontSize: 12, marginBottom: 4 }}>Transaksi</div>
                                            <div style={{ fontWeight: 800, fontSize: 26 }}>{selectedSession.totalSales}</div>
                                        </div>
                                    </div>

                                    {/* Section 2: Payment Breakdown */}
                                    {selectedSession.paymentBreakdown && selectedSession.paymentBreakdown.length > 0 && (
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                <i className="fa-solid fa-chart-pie" style={{ marginRight: 6 }}></i>
                                                Rincian Metode Pembayaran
                                            </div>
                                            <div style={{
                                                background: "#f9fafb", borderRadius: 14, overflow: "hidden",
                                                border: "1px solid #e5e7eb"
                                            }}>
                                                {selectedSession.paymentBreakdown.map((pm: any, idx: number) => (
                                                    <div key={idx} style={{
                                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                                        padding: "14px 18px",
                                                        borderBottom: idx < selectedSession.paymentBreakdown.length - 1 ? "1px solid #e5e7eb" : "none",
                                                        background: "white"
                                                    }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                            <div style={{
                                                                width: 36, height: 36, borderRadius: 10,
                                                                background: pm.isCash ? "#ecfdf5" : "#eff6ff",
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 14, color: pm.isCash ? "#059669" : "#3b82f6"
                                                            }}>
                                                                <i className={`fa-solid ${pm.isCash ? "fa-money-bill-wave" : pm.paymentMethodCode === "QRIS" ? "fa-qrcode" : "fa-credit-card"}`}></i>
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: 600, fontSize: 13 }}>{pm.paymentMethodName}</div>
                                                                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                                    {pm.transactionCount} transaksi • {pm.isCash ? "Tunai" : "Non-Tunai"}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div style={{ fontWeight: 700, fontSize: 15, color: pm.isCash ? "#059669" : "#3b82f6" }}>
                                                            {fmtCurrency(pm.totalAmount)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Total row */}
                                                <div style={{
                                                    display: "flex", justifyContent: "space-between",
                                                    padding: "14px 18px", background: "#f9fafb",
                                                    fontWeight: 700, fontSize: 14, borderTop: "2px solid #e5e7eb"
                                                }}>
                                                    <span style={{ color: "#374151" }}>Total</span>
                                                    <span style={{ color: "#111827" }}>
                                                        {fmtCurrency(selectedSession.paymentBreakdown.reduce((s: number, p: any) => s + p.totalAmount, 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 3: Cash Movements */}
                                    {selectedSession.cashMovements && selectedSession.cashMovements.length > 0 && (
                                        <div style={{ marginBottom: 24 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                <i className="fa-solid fa-arrows-rotate" style={{ marginRight: 6 }}></i>
                                                Riwayat Pergerakan Kas ({selectedSession.cashMovements.length})
                                            </div>
                                            <div style={{
                                                background: "white", borderRadius: 14, overflow: "hidden",
                                                border: "1px solid #e5e7eb"
                                            }}>
                                                {selectedSession.cashMovements.map((mv: any, idx: number) => {
                                                    const mType = movementTypeIcon[mv.movementTypeName] || movementTypeIcon.Adjustment;
                                                    return (
                                                        <div key={mv.id} style={{
                                                            display: "flex", alignItems: "center", gap: 14,
                                                            padding: "12px 18px",
                                                            borderBottom: idx < selectedSession.cashMovements.length - 1 ? "1px solid #f3f4f6" : "none",
                                                        }}>
                                                            {/* Icon */}
                                                            <div style={{
                                                                width: 32, height: 32, borderRadius: 8,
                                                                background: mType.bg,
                                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                                fontSize: 13, color: mType.color, flexShrink: 0
                                                            }}>
                                                                <i className={`fa-solid ${mType.icon}`}></i>
                                                            </div>
                                                            {/* Info */}
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ fontWeight: 600, fontSize: 13 }}>
                                                                    {movementTypeLabel[mv.movementTypeName] || mv.movementTypeName}
                                                                    {mv.referenceSaleCode && (
                                                                        <span style={{ color: "#9ca3af", fontWeight: 400, fontSize: 11, marginLeft: 6 }}>
                                                                            #{mv.referenceSaleCode}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                                    {fmtTime(mv.createdAt)}
                                                                    {mv.reason && ` • ${mv.reason}`}
                                                                    {mv.approvedByUserName && ` • oleh ${mv.approvedByUserName}`}
                                                                </div>
                                                            </div>
                                                            {/* Amount & Balance */}
                                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                                <div style={{
                                                                    fontWeight: 700, fontSize: 13,
                                                                    color: mv.amount >= 0 ? "#059669" : "#ef4444"
                                                                }}>
                                                                    {mv.amount >= 0 ? "+" : ""}{fmtCurrency(mv.amount)}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                                    Saldo: {fmtCurrency(mv.balanceAfter)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 4: Sales List */}
                                    {selectedSession.sales && selectedSession.sales.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                                                <i className="fa-solid fa-receipt" style={{ marginRight: 6 }}></i>
                                                Daftar Penjualan ({selectedSession.sales.length})
                                            </div>
                                            <div style={{
                                                background: "white", borderRadius: 14, overflow: "hidden",
                                                border: "1px solid #e5e7eb"
                                            }}>
                                                {selectedSession.sales.map((sale: any, idx: number) => {
                                                    const psColor = payStatusColor[sale.paymentStatusName] || payStatusColor.Draft;
                                                    return (
                                                        <div key={sale.id}
                                                            onClick={() => fetchSaleDetail(sale.id)}
                                                            style={{
                                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                                padding: "14px 18px", cursor: "pointer",
                                                                borderBottom: idx < selectedSession.sales.length - 1 ? "1px solid #f3f4f6" : "none",
                                                                transition: "background 0.15s"
                                                            }}
                                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                                                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                                        >
                                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                                <div style={{
                                                                    width: 36, height: 36, borderRadius: 10,
                                                                    background: "#f0fdf4",
                                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                                    fontSize: 13, color: "#059669"
                                                                }}>
                                                                    <i className="fa-solid fa-receipt"></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontWeight: 700, fontSize: 13, fontFamily: "monospace" }}>
                                                                        {sale.saleCode}
                                                                    </div>
                                                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                                        {fmtDateTime(sale.saleDate)}
                                                                        {sale.memberName && ` • ${sale.memberName}`}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                                <span style={{
                                                                    padding: "3px 10px", borderRadius: 20,
                                                                    fontSize: 10, fontWeight: 700,
                                                                    background: psColor.bg, color: psColor.fg,
                                                                }}>
                                                                    {payStatusLabel[sale.paymentStatusName] || sale.paymentStatusName}
                                                                </span>
                                                                <span style={{ fontWeight: 700, fontSize: 14, color: "#111827", minWidth: 100, textAlign: "right" }}>
                                                                    {fmtCurrency(sale.grandTotal)}
                                                                </span>
                                                                <i className="fa-solid fa-chevron-right" style={{ fontSize: 10, color: "#d1d5db" }}></i>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty sales */}
                                    {(!selectedSession.sales || selectedSession.sales.length === 0) && (
                                        <div style={{
                                            textAlign: "center", padding: "30px 20px",
                                            color: "#9ca3af", fontSize: 13
                                        }}>
                                            <i className="fa-solid fa-inbox" style={{ fontSize: 28, display: "block", marginBottom: 8 }}></i>
                                            Belum ada transaksi di sesi ini
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}

            {/* ============================================ */}
            {/* SALE DETAIL SUB-MODAL (Step 4) */}
            {/* ============================================ */}
            {showSaleDetail && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1100, backdropFilter: "blur(4px)"
                }} onClick={() => setShowSaleDetail(false)}>
                    <div style={{
                        background: "white", borderRadius: 20, padding: 0,
                        width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.2)"
                    }} onClick={(e) => e.stopPropagation()}>

                        {loadingSaleDetail ? (
                            <div style={{ textAlign: "center", padding: 60 }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#059669" }}></i>
                                <div style={{ marginTop: 12, color: "#6b7280" }}>Memuat detail penjualan...</div>
                            </div>
                        ) : selectedSale ? (
                            <>
                                {/* Header */}
                                <div style={{
                                    padding: "24px 28px", borderBottom: "1px solid #f3f4f6",
                                    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                                }}>
                                    <div>
                                        <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4 }}>DETAIL PENJUALAN</div>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: "#111827", fontFamily: "monospace" }}>
                                            {selectedSale.saleCode}
                                        </div>
                                        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                                            {fmtDateTime(selectedSale.saleDate)}
                                        </div>
                                    </div>
                                    <button onClick={() => setShowSaleDetail(false)} style={{
                                        background: "#f3f4f6", border: "none", borderRadius: 10,
                                        width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#6b7280"
                                    }}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                <div style={{ padding: "20px 28px" }}>
                                    {/* Status Badges */}
                                    <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                                        {selectedSale.saleTypeName && (
                                            <span style={{
                                                padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                                background: `${saleTypeColor[selectedSale.saleTypeName] || "#6b7280"}15`,
                                                color: saleTypeColor[selectedSale.saleTypeName] || "#6b7280"
                                            }}>
                                                {saleTypeLabel[selectedSale.saleTypeName] || selectedSale.saleTypeName}
                                            </span>
                                        )}
                                        {(() => {
                                            const ps = payStatusColor[selectedSale.paymentStatusName] || payStatusColor.Draft;
                                            return (
                                                <span style={{
                                                    padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                                                    background: ps.bg, color: ps.fg
                                                }}>
                                                    {payStatusLabel[selectedSale.paymentStatusName] || selectedSale.paymentStatusName}
                                                </span>
                                            );
                                        })()}
                                        {selectedSale.memberName && (
                                            <span style={{
                                                padding: "4px 12px", borderRadius: 8, fontSize: 12,
                                                background: "#f0fdf4", color: "#059669", fontWeight: 600
                                            }}>
                                                <i className="fa-solid fa-user" style={{ marginRight: 4 }}></i>
                                                {selectedSale.memberName}
                                            </span>
                                        )}
                                    </div>

                                    {/* Items */}
                                    <div style={{ marginBottom: 20 }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>
                                            ITEM ({selectedSale.items?.length || 0})
                                        </div>
                                        {(selectedSale.items || []).map((item: any) => (
                                            <div key={item.id} style={{
                                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                                padding: "12px 0", borderBottom: "1px solid #f3f4f6"
                                            }}>
                                                <div>
                                                    <div style={{ fontWeight: 600, fontSize: 13 }}>
                                                        {item.serviceName || item.creditPackageName || item.packageName || item.itemName || "Item"}
                                                        {item.serviceVariantName && (
                                                            <span style={{ color: "#6b7280", fontWeight: 400 }}> - {item.serviceVariantName}</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                        {item.quantity}x @ {fmtCurrency(item.unitPrice)}
                                                        {item.discountAmount > 0 && (
                                                            <span style={{ color: "#ef4444" }}> (diskon {fmtCurrency(item.discountAmount)})</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{fmtCurrency(item.subtotal)}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Totals */}
                                    <div style={{
                                        background: "#f9fafb", borderRadius: 14, padding: 16, marginBottom: 20
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                                            <span style={{ color: "#6b7280" }}>Subtotal</span>
                                            <span>{fmtCurrency(selectedSale.subtotal)}</span>
                                        </div>
                                        {selectedSale.discountAmount > 0 && (
                                            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                                                <span style={{ color: "#6b7280" }}>Diskon</span>
                                                <span style={{ color: "#ef4444" }}>- {fmtCurrency(selectedSale.discountAmount)}</span>
                                            </div>
                                        )}
                                        {selectedSale.taxAmount > 0 && (
                                            <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13 }}>
                                                <span style={{ color: "#6b7280" }}>Pajak</span>
                                                <span>{fmtCurrency(selectedSale.taxAmount)}</span>
                                            </div>
                                        )}
                                        <div style={{
                                            display: "flex", justifyContent: "space-between", padding: "10px 0 4px",
                                            borderTop: "2px dashed #e5e7eb", marginTop: 6,
                                            fontWeight: 800, fontSize: 18
                                        }}>
                                            <span>Grand Total</span>
                                            <span style={{ color: "#059669" }}>{fmtCurrency(selectedSale.grandTotal)}</span>
                                        </div>
                                    </div>

                                    {/* Payments */}
                                    {selectedSale.payments && selectedSale.payments.length > 0 && (
                                        <div style={{ marginBottom: 20 }}>
                                            <div style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", marginBottom: 10 }}>
                                                PEMBAYARAN
                                            </div>
                                            {selectedSale.payments.map((p: any) => (
                                                <div key={p.id} style={{
                                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                                    padding: "10px 14px", borderRadius: 10,
                                                    background: p.isCash ? "#ecfdf5" : "#eff6ff",
                                                    marginBottom: 6
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                                        <i className={`fa-solid ${p.isCash ? "fa-money-bill-wave" : "fa-credit-card"}`}
                                                           style={{ color: p.isCash ? "#059669" : "#3b82f6" }}></i>
                                                        <div>
                                                            <div style={{ fontWeight: 600, fontSize: 13 }}>{p.paymentMethodName}</div>
                                                            {p.referenceNumber && (
                                                                <div style={{ fontSize: 11, color: "#6b7280" }}>Ref: {p.referenceNumber}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div style={{ fontWeight: 700, fontSize: 14, color: p.isCash ? "#059669" : "#3b82f6" }}>
                                                        {fmtCurrency(p.amount)}
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedSale.changeAmount > 0 && (
                                                <div style={{
                                                    display: "flex", justifyContent: "space-between",
                                                    padding: "8px 14px", fontSize: 13, color: "#d97706", fontWeight: 600
                                                }}>
                                                    <span>Kembalian</span>
                                                    <span>{fmtCurrency(selectedSale.changeAmount)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Notes */}
                                    {selectedSale.notes && (
                                        <div style={{
                                            background: "#fffbeb", padding: "12px 16px", borderRadius: 10,
                                            fontSize: 13, color: "#92400e"
                                        }}>
                                            <i className="fa-solid fa-sticky-note" style={{ marginRight: 8 }}></i>
                                            {selectedSale.notes}
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>
            )}
        </div>
    );
}

// ============================================
// STYLES
// ============================================
const thStyle: React.CSSProperties = {
    padding: "12px 14px", textAlign: "left", fontSize: 11,
    fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px",
    whiteSpace: "nowrap"
};

const tdStyle: React.CSSProperties = {
    padding: "12px 14px", verticalAlign: "middle",
};

function paginBtn(disabled: boolean): React.CSSProperties {
    return {
        padding: "8px 14px", borderRadius: 8, border: "none",
        background: "#f3f4f6", cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1, fontSize: 13, fontWeight: 500, color: "#374151",
        minWidth: 38, textAlign: "center"
    };
}

// ============================================
// SUB COMPONENTS
// ============================================
function SummaryCard({ icon, color, bg, label, value }: {
    icon: string; color: string; bg: string; label: string; value: string;
}) {
    return (
        <div style={{
            background: "white", borderRadius: 16, padding: "20px 22px",
            border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16
        }}>
            <div style={{
                width: 48, height: 48, borderRadius: 14, background: bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                color, fontSize: 20, flexShrink: 0
            }}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{value}</div>
            </div>
        </div>
    );
}

function CashCard({ icon, label, value, color, bg }: {
    icon: string; label: string; value: string; color: string; bg: string;
}) {
    return (
        <div style={{
            background: bg, borderRadius: 14, padding: "16px 18px",
            display: "flex", alignItems: "center", gap: 14,
            border: `1px solid ${color}20`
        }}>
            <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, color, flexShrink: 0,
                boxShadow: "0 2px 4px rgba(0,0,0,0.06)"
            }}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
            </div>
        </div>
    );
}
