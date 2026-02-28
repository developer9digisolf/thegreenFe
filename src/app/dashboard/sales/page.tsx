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

function fmtDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

const saleTypeLabel: Record<string, string> = {
    WalkIn: "Walk-In",
    Package: "Paket Voucher",
    CreditPurchase: "Beli Kredit",
    Redeem: "Redeem",
};

const saleTypeColor: Record<string, string> = {
    WalkIn: "#059669",
    Package: "#7c3aed",
    CreditPurchase: "#0891b2",
    Redeem: "#d97706",
};

const payStatusLabel: Record<string, string> = {
    Paid: "Lunas",
    Pending: "Pending",
    Partial: "Sebagian",
    Cancelled: "Batal",
    Refunded: "Refund",
    Draft: "Draft",
};

const payStatusColor: Record<string, { bg: string; fg: string }> = {
    Paid: { bg: "#ecfdf5", fg: "#059669" },
    Pending: { bg: "#fffbeb", fg: "#d97706" },
    Partial: { bg: "#eff6ff", fg: "#3b82f6" },
    Cancelled: { bg: "#fef2f2", fg: "#ef4444" },
    Refunded: { bg: "#fef2f2", fg: "#ef4444" },
    Draft: { bg: "#f3f4f6", fg: "#6b7280" },
};

// ============================================
// PAGE
// ============================================
export default function SalesPage() {
    const { get } = useApi();

    // Data
    const [sales, setSales] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 15, total: 0 });
    const [loading, setLoading] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);

    // Detail modal
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [showDetail, setShowDetail] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // ============================================
    // FETCH
    // ============================================
    const fetchSales = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params: Record<string, any> = { page, pageSize: pagination.pageSize, sortColumn: "saledate", sortDirection: "desc" };
            if (search) params.search = search;
            if (statusFilter) params.paymentStatus = statusFilter;
            if (typeFilter) params.saleType = typeFilter;
            if (dateRange) {
                params.dateFrom = dateRange[0];
                params.dateTo = dateRange[1];
            }

            const res = await get(rest.sales, params);
            if (res.success) {
                setSales(res.data || []);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 15,
                    total: res.pagination?.total || 0,
                });
            }
        } catch (err: any) {
            message.error(err?.message || "Gagal memuat data penjualan");
        } finally {
            setLoading(false);
        }
    }, [get, search, statusFilter, typeFilter, dateRange, pagination.pageSize]);

    const fetchSummary = useCallback(async () => {
        try {
            const params: Record<string, any> = {};
            if (dateRange) {
                params.dateFrom = dateRange[0];
                params.dateTo = dateRange[1];
            }
            const res = await get(rest.salesSummary, params);
            if (res.success) {
                setSummary(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch summary", err);
        }
    }, [get, dateRange]);

    const fetchDetail = async (id: number) => {
        setLoadingDetail(true);
        setShowDetail(true);
        try {
            const res = await get(rest.salesDetail.replace(":id", id.toString()));
            if (res.success) {
                setSelectedSale(res.data);
            }
        } catch (err) {
            message.error("Gagal memuat detail penjualan");
        } finally {
            setLoadingDetail(false);
        }
    };

    useEffect(() => { fetchSales(); fetchSummary(); }, [fetchSales, fetchSummary]);

    // ============================================
    // QUICK FILTERS
    // ============================================
    const quickFilters = [
        { label: "Semua", value: "" },
        { label: "Lunas", value: "2" },
        { label: "Pending", value: "0" },
        { label: "Batal", value: "4" },
    ];

    const typeFilters = [
        { label: "Semua Tipe", value: "" },
        { label: "Walk-In", value: "0" },
        { label: "Paket", value: "1" },
        { label: "Kredit", value: "2" },
    ];

    // ============================================
    // RENDER
    // ============================================
    return (
        <div style={{ padding: "28px 32px", maxWidth: 1400, margin: "0 auto" }}>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: 0 }}>Penjualan</h1>
                    <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
                        Riwayat semua transaksi POS
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
            {summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
                    <SummaryCard
                        icon="fa-receipt" color="#059669" bg="#ecfdf5"
                        label="Total Transaksi" value={`${summary.totalPaidTransactions} transaksi`}
                    />
                    <SummaryCard
                        icon="fa-money-bill-wave" color="#059669" bg="#ecfdf5"
                        label="Total Pendapatan" value={fmtCurrencyShort(summary.totalRevenue || 0)}
                    />
                    <SummaryCard
                        icon="fa-coins" color="#0891b2" bg="#ecfeff"
                        label="Tunai" value={fmtCurrencyShort(summary.totalCash || 0)}
                    />
                    <SummaryCard
                        icon="fa-credit-card" color="#7c3aed" bg="#f5f3ff"
                        label="Non-Tunai" value={fmtCurrencyShort(summary.totalNonCash || 0)}
                    />
                </div>
            )}

            {/* Payment Method Breakdown */}
            {summary?.byPaymentMethod && summary.byPaymentMethod.length > 0 && (
                <div style={{
                    display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap"
                }}>
                    {summary.byPaymentMethod.map((pm: any, i: number) => (
                        <div key={i} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "10px 16px", borderRadius: 12,
                            background: "white", border: "1px solid #e5e7eb",
                            fontSize: 13
                        }}>
                            <i className={`fa-solid ${pm.isCash ? "fa-money-bill-wave" : "fa-credit-card"}`}
                               style={{ color: pm.isCash ? "#059669" : "#3b82f6" }}></i>
                            <span style={{ fontWeight: 600 }}>{pm.paymentMethodName}</span>
                            <span style={{ color: "#6b7280" }}>({pm.count}x)</span>
                            <span style={{ fontWeight: 700, color: "#111827" }}>{fmtCurrency(pm.total)}</span>
                        </div>
                    ))}
                </div>
            )}

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
                        onKeyDown={(e) => e.key === "Enter" && fetchSales(1)}
                        placeholder="Cari kode, nama member..."
                        style={{
                            width: "100%", padding: "10px 14px 10px 38px",
                            border: "1px solid #e5e7eb", borderRadius: 10,
                            fontSize: 13, outline: "none"
                        }}
                    />
                </div>

                {/* Status Quick Filter */}
                <div style={{ display: "flex", gap: 6 }}>
                    {quickFilters.map((f) => (
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

                <div style={{ width: 1, height: 24, background: "#e5e7eb" }} />

                {/* Type Filter */}
                <div style={{ display: "flex", gap: 6 }}>
                    {typeFilters.map((f) => (
                        <button key={f.value} onClick={() => setTypeFilter(f.value)}
                            style={{
                                padding: "8px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                                border: "none", cursor: "pointer",
                                background: typeFilter === f.value ? "#7c3aed" : "#f3f4f6",
                                color: typeFilter === f.value ? "white" : "#4b5563",
                            }}>
                            {f.label}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: "auto", fontSize: 13, color: "#6b7280" }}>
                    {pagination.total} transaksi
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
                            <th style={thStyle}>Kode</th>
                            <th style={thStyle}>Tanggal</th>
                            <th style={thStyle}>Tipe</th>
                            <th style={thStyle}>Member</th>
                            <th style={thStyle}>Item</th>
                            <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
                            <th style={thStyle}>Pembayaran</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Sesi</th>
                            <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }}></i>
                                Memuat data...
                            </td></tr>
                        ) : sales.length === 0 ? (
                            <tr><td colSpan={10} style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
                                <i className="fa-solid fa-inbox" style={{ fontSize: 24, display: "block", marginBottom: 8 }}></i>
                                Belum ada data penjualan
                            </td></tr>
                        ) : (
                            sales.map((sale) => {
                                const psColor = payStatusColor[sale.paymentStatusName] || payStatusColor.Draft;
                                const stColor = saleTypeColor[sale.saleTypeName] || "#6b7280";
                                return (
                                    <tr key={sale.id}
                                        onClick={() => fetchDetail(sale.id)}
                                        style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer", transition: "background 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                                    >
                                        <td style={tdStyle}>
                                            <span style={{ fontWeight: 700, color: "#111827", fontFamily: "monospace" }}>
                                                {sale.saleCode}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>{fmtDateTime(sale.saleDate)}</td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: "3px 10px", borderRadius: 6,
                                                fontSize: 11, fontWeight: 600,
                                                background: `${stColor}15`, color: stColor,
                                            }}>
                                                {saleTypeLabel[sale.saleTypeName] || sale.saleTypeName}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            {sale.memberName ? (
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{sale.memberName}</div>
                                                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{sale.memberPhone}</div>
                                                </div>
                                            ) : (
                                                <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Guest</span>
                                            )}
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                background: "#f3f4f6", padding: "2px 8px", borderRadius: 6,
                                                fontSize: 12, fontWeight: 600
                                            }}>
                                                {sale.itemCount} item
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, color: "#111827" }}>
                                            {fmtCurrency(sale.grandTotal)}
                                        </td>
                                        <td style={tdStyle}>
                                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                                {(sale.paymentMethods || []).map((pm: string, i: number) => (
                                                    <span key={i} style={{
                                                        padding: "2px 8px", borderRadius: 6, fontSize: 10,
                                                        background: "#eff6ff", color: "#3b82f6", fontWeight: 600
                                                    }}>
                                                        {pm}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{
                                                padding: "4px 12px", borderRadius: 20,
                                                fontSize: 11, fontWeight: 700,
                                                background: psColor.bg, color: psColor.fg,
                                            }}>
                                                {payStatusLabel[sale.paymentStatusName] || sale.paymentStatusName}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span style={{ fontSize: 11, color: "#6b7280", fontFamily: "monospace" }}>
                                                {sale.sessionCode}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "center" }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fetchDetail(sale.id); }}
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
                        onClick={() => fetchSales(pagination.current - 1)}
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
                            <button key={page} onClick={() => fetchSales(page)}
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
                        onClick={() => fetchSales(pagination.current + 1)}
                        disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                        style={paginBtn(pagination.current >= Math.ceil(pagination.total / pagination.pageSize))}
                    >
                        <i className="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            )}

            {/* Detail Modal */}
            {showDetail && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    zIndex: 1000, backdropFilter: "blur(4px)"
                }} onClick={() => setShowDetail(false)}>
                    <div style={{
                        background: "white", borderRadius: 20, padding: 0,
                        width: "100%", maxWidth: 600, maxHeight: "90vh", overflowY: "auto",
                        boxShadow: "0 25px 50px rgba(0,0,0,0.15)"
                    }} onClick={(e) => e.stopPropagation()}>

                        {loadingDetail ? (
                            <div style={{ textAlign: "center", padding: 60 }}>
                                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "#059669" }}></i>
                                <div style={{ marginTop: 12, color: "#6b7280" }}>Memuat detail...</div>
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
                                    <button onClick={() => setShowDetail(false)} style={{
                                        background: "#f3f4f6", border: "none", borderRadius: 10,
                                        width: 36, height: 36, cursor: "pointer", fontSize: 16, color: "#6b7280"
                                    }}>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>

                                <div style={{ padding: "20px 28px" }}>
                                    {/* Status & Member Row */}
                                    <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                                        <span style={{
                                            padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                            background: `${saleTypeColor[selectedSale.saleTypeName] || "#6b7280"}15`,
                                            color: saleTypeColor[selectedSale.saleTypeName] || "#6b7280"
                                        }}>
                                            {saleTypeLabel[selectedSale.saleTypeName] || selectedSale.saleTypeName}
                                        </span>
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
                                                        {item.serviceName || item.creditPackageName || item.packageName || "Item"}
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
    padding: "12px 16px", textAlign: "left", fontSize: 11,
    fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px"
};

const tdStyle: React.CSSProperties = {
    padding: "14px 16px", verticalAlign: "middle",
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
