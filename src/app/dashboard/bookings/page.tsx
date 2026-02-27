"use client";

import { useState, useEffect } from "react";
import { DatePicker, message, Tooltip } from "antd";
import dayjs from "dayjs";
import {
    GetBookingsService,
    GetBookingSummaryService,
} from "@afx/services/booking.service";
import {
    IBooking,
    IBookingSummary,
    getStatusColor,
    getPaymentStatusColor,
    getPaymentStatusLabel,
} from "@afx/interfaces/booking.iface";

const { RangePicker } = DatePicker;

function formatCurrency(amount: number): string {
    if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
    if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatCurrencyFull(amount: number): string {
    return `Rp ${amount.toLocaleString("id-ID")}`;
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(dateStr: string | null): string {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

export default function BookingsPage() {
    const [loading, setLoading] = useState(false);
    const [bookings, setBookings] = useState<IBooking[]>([]);
    const [summary, setSummary] = useState<IBookingSummary | null>(null);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [paymentFilter, setPaymentFilter] = useState("");
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

    const fetchBookings = async (page = 1) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: pagination.pageSize };
            if (searchText) params.search = searchText;
            if (statusFilter) params.status = statusFilter;
            if (paymentFilter) params.paymentStatus = paymentFilter;
            if (dateRange) {
                params.dateFrom = dateRange[0];
                params.dateTo = dateRange[1];
            }

            const res = await GetBookingsService(params);
            if (res.success) {
                setBookings(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0,
                });
            }
        } catch (err: any) {
            message.error(err?.message || "Gagal memuat data booking");
        } finally {
            setLoading(false);
        }
    };

    const fetchSummary = async () => {
        try {
            const params: any = {};
            if (dateRange) {
                params.dateFrom = dateRange[0];
                params.dateTo = dateRange[1];
            }
            const res = await GetBookingSummaryService(params);
            if (res.success) {
                setSummary(res.data);
            }
        } catch (err) {
            console.error("Failed to fetch summary", err);
        }
    };

    useEffect(() => {
        fetchBookings(1);
        fetchSummary();
    }, [statusFilter, paymentFilter, dateRange]);

    const handleSearch = () => {
        fetchBookings(1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSearch();
    };

    const handlePageChange = (page: number) => {
        fetchBookings(page);
    };

    const handleDateRangeChange = (dates: any) => {
        if (dates && dates[0] && dates[1]) {
            setDateRange([
                dates[0].format("YYYY-MM-DD"),
                dates[1].format("YYYY-MM-DD"),
            ]);
        } else {
            setDateRange(null);
        }
    };

    const getStatusBadgeClass = (status: string): string => {
        const color = getStatusColor(status);
        switch (color) {
            case "green": return "badge-green";
            case "orange": return "badge-yellow";
            case "red": return "badge-red";
            case "blue": return "badge-blue";
            case "purple": return "badge-purple";
            case "cyan": return "badge-blue";
            default: return "badge-gray";
        }
    };

    const getStatusIcon = (status: string): string => {
        switch (status?.toLowerCase()) {
            case "scheduled": return "fa-calendar-check";
            case "pending": return "fa-clock";
            case "claimed": return "fa-hand";
            case "inprogress": return "fa-play";
            case "paused": return "fa-pause";
            case "completed": return "fa-check";
            case "cancelled": return "fa-times";
            case "noshow": return "fa-user-slash";
            default: return "fa-circle";
        }
    };

    const totalPages = Math.ceil(pagination.total / pagination.pageSize);

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Booking & Sesi</h1>
                    <p className="page-subtitle">
                        Kelola semua booking dari Mobile App dan sesi walk-in
                    </p>
                </div>
                <div className="header-actions">
                    <RangePicker
                        onChange={handleDateRangeChange}
                        format="DD/MM/YYYY"
                        placeholder={["Dari Tanggal", "Sampai Tanggal"]}
                        style={{ borderRadius: 8 }}
                    />
                    <button className="btn btn-secondary" onClick={() => { fetchBookings(1); fetchSummary(); }}>
                        <i className="fa-solid fa-arrows-rotate"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div className="stat-value">{summary?.totalBookings ?? 0}</div>
                    <div className="stat-label">Total Booking</div>
                    {summary && (
                        <div className="stat-change">
                            <span style={{ color: "#059669" }}>{summary.completed} selesai</span>
                            {summary.cancelled > 0 && (
                                <span style={{ color: "#ef4444", marginLeft: 8 }}>{summary.cancelled} batal</span>
                            )}
                        </div>
                    )}
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                    <div className="stat-value">
                        {formatCurrency(summary?.totalSalesAmount ?? 0)}
                    </div>
                    <div className="stat-label">Total Penjualan (Selesai)</div>
                    <Tooltip title={formatCurrencyFull(summary?.totalSalesAmount ?? 0)}>
                        <div className="stat-change" style={{ cursor: "help" }}>
                            Terbayar: {formatCurrency(summary?.totalPaidAmount ?? 0)}
                        </div>
                    </Tooltip>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fa-solid fa-chart-pie"></i>
                    </div>
                    <div className="stat-value">
                        {formatCurrency(summary?.allSalesAmount ?? 0)}
                    </div>
                    <div className="stat-label">Potensi Pendapatan</div>
                    <div className="stat-change">
                        Termasuk belum selesai
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="stat-value">
                        {summary?.averageRating ? `${summary.averageRating}★` : "-"}
                    </div>
                    <div className="stat-label">Rating Rata-rata</div>
                    <div className="stat-change">
                        {summary?.ratedCount ?? 0} ulasan
                    </div>
                </div>
            </div>

            {/* Status Quick Filters */}
            {summary && (summary.scheduled > 0 || summary.inProgress > 0 || summary.pending > 0) && (
                <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
                    {summary.scheduled > 0 && (
                        <div
                            onClick={() => setStatusFilter(statusFilter === "Scheduled" ? "" : "Scheduled")}
                            style={{
                                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                                background: statusFilter === "Scheduled" ? "#7c3aed" : "#f3f0ff",
                                color: statusFilter === "Scheduled" ? "white" : "#7c3aed",
                                fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                            }}
                        >
                            <i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }}></i>
                            {summary.scheduled} Dijadwalkan
                        </div>
                    )}
                    {summary.pending > 0 && (
                        <div
                            onClick={() => setStatusFilter(statusFilter === "Pending" ? "" : "Pending")}
                            style={{
                                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                                background: statusFilter === "Pending" ? "#f59e0b" : "#fef3c7",
                                color: statusFilter === "Pending" ? "white" : "#d97706",
                                fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                            }}
                        >
                            <i className="fa-solid fa-clock" style={{ marginRight: 6 }}></i>
                            {summary.pending} Menunggu
                        </div>
                    )}
                    {summary.inProgress > 0 && (
                        <div
                            onClick={() => setStatusFilter(statusFilter === "InProgress" ? "" : "InProgress")}
                            style={{
                                padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                                background: statusFilter === "InProgress" ? "#0891b2" : "#ecfeff",
                                color: statusFilter === "InProgress" ? "white" : "#0891b2",
                                fontSize: 13, fontWeight: 600, transition: "all 0.2s"
                            }}
                        >
                            <i className="fa-solid fa-play" style={{ marginRight: 6 }}></i>
                            {summary.inProgress} Berlangsung
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Booking</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input
                                type="text"
                                placeholder="Cari kode / nama member..."
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                        <select
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">Semua Status</option>
                            <option value="Scheduled">Dijadwalkan</option>
                            <option value="Pending">Menunggu</option>
                            <option value="upcoming">Upcoming (semua)</option>
                            <option value="active">Berlangsung</option>
                            <option value="Completed">Selesai</option>
                            <option value="Cancelled">Dibatalkan</option>
                            <option value="NoShow">Tidak Hadir</option>
                        </select>
                        <select
                            className="filter-select"
                            value={paymentFilter}
                            onChange={(e) => setPaymentFilter(e.target.value)}
                        >
                            <option value="">Semua Pembayaran</option>
                            <option value="Paid">Lunas</option>
                            <option value="Pending">Belum Bayar</option>
                            <option value="Refunded">Refund</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, marginBottom: 8 }}></i>
                            <div>Memuat data...</div>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
                            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}></i>
                            <div style={{ fontSize: 14 }}>Tidak ada booking ditemukan</div>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Kode Sesi</th>
                                    <th>Tanggal / Jam</th>
                                    <th>Member</th>
                                    <th>Layanan</th>
                                    <th>Terapis</th>
                                    <th>Harga</th>
                                    <th>Status</th>
                                    <th>Pembayaran</th>
                                    <th>Rating</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => (
                                    <tr key={b.id} style={{
                                        opacity: b.status?.toLowerCase() === "cancelled" || b.status?.toLowerCase() === "noshow" ? 0.6 : 1
                                    }}>
                                        <td>
                                            <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#374151" }}>
                                                {b.sessionCode}
                                            </div>
                                            <div style={{ fontSize: 11, color: "#9ca3af" }}>
                                                {formatDateTime(b.createdAt)}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 13 }}>
                                                {formatDate(b.sessionDate)}
                                            </div>
                                            <div style={{ fontSize: 12, color: "#6b7280" }}>
                                                {b.scheduledTime ? `⏰ ${b.scheduledTime}` : "-"}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="buyer-info">
                                                <div
                                                    className="buyer-avatar"
                                                    style={{
                                                        background: b.memberId ? "var(--spa-green-bg)" : "#f3f4f6",
                                                        color: b.memberId ? "var(--spa-green)" : "#9ca3af",
                                                        width: 32, height: 32, fontSize: 11,
                                                    }}
                                                >
                                                    {b.memberName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="buyer-name" style={{ fontSize: 13 }}>{b.memberName}</div>
                                                    {b.memberPhone && (
                                                        <div className="buyer-phone" style={{ fontSize: 11 }}>{b.memberPhone}</div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 500, fontSize: 13 }}>{b.serviceName}</div>
                                            <div style={{ fontSize: 11, color: "#9ca3af" }}>{b.variantLabel}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: 13, color: b.therapistName ? "#374151" : "#d1d5db" }}>
                                                {b.therapistName || "Belum assign"}
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600, fontSize: 13, color: "#059669" }}>
                                                {formatCurrencyFull(b.price)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                                                <i className={`fa-solid ${getStatusIcon(b.status)}`} style={{ fontSize: 9, marginRight: 4 }}></i>
                                                {b.statusDisplay}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <span className={`badge badge-${getPaymentStatusColor(b.paymentStatus) === "green" ? "green" : getPaymentStatusColor(b.paymentStatus) === "orange" ? "yellow" : "gray"}`}>
                                                    {getPaymentStatusLabel(b.paymentStatus)}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                                                {b.paymentMethod}
                                            </div>
                                        </td>
                                        <td>
                                            {b.rating ? (
                                                <Tooltip title={b.ratingComment || "Tanpa komentar"}>
                                                    <div style={{ color: "#f59e0b", fontWeight: 600, cursor: "help" }}>
                                                        {"★".repeat(b.rating)}{"☆".repeat(5 - b.rating)}
                                                    </div>
                                                </Tooltip>
                                            ) : (
                                                <span style={{ color: "#d1d5db", fontSize: 12 }}>-</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action"
                                                    title="Detail"
                                                    onClick={() => {
                                                        setSelectedBooking(b);
                                                        setShowDetailModal(true);
                                                    }}
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                {pagination.total > 0 && (
                    <div className="table-footer">
                        <div className="table-info">
                            Menampilkan {((pagination.current - 1) * pagination.pageSize) + 1}-
                            {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} booking
                        </div>
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={pagination.current <= 1}
                                onClick={() => handlePageChange(pagination.current - 1)}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                let page: number;
                                if (totalPages <= 5) {
                                    page = i + 1;
                                } else if (pagination.current <= 3) {
                                    page = i + 1;
                                } else if (pagination.current >= totalPages - 2) {
                                    page = totalPages - 4 + i;
                                } else {
                                    page = pagination.current - 2 + i;
                                }
                                return (
                                    <button
                                        key={page}
                                        className={`page-btn ${pagination.current === page ? "active" : ""}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                            <button
                                className="page-btn"
                                disabled={pagination.current >= totalPages}
                                onClick={() => handlePageChange(pagination.current + 1)}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedBooking && (
                <div className={`modal-overlay ${showDetailModal ? "show" : ""}`}>
                    <div className="modal" style={{ maxWidth: 540 }}>
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Booking</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{
                                background: "linear-gradient(135deg, #059669, #14b8a6)",
                                borderRadius: 12, padding: "16px 20px", color: "white", marginBottom: 20,
                            }}>
                                <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700 }}>
                                    {selectedBooking.sessionCode}
                                </div>
                                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
                                    {formatDate(selectedBooking.sessionDate)}
                                    {selectedBooking.scheduledTime && ` • ${selectedBooking.scheduledTime}`}
                                </div>
                                <div style={{ marginTop: 8 }}>
                                    <span className={`badge ${getStatusBadgeClass(selectedBooking.status)}`} style={{ color: "white", background: "rgba(255,255,255,0.25)" }}>
                                        {selectedBooking.statusDisplay}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Informasi Layanan</div>
                                <div className="detail-row">
                                    <span className="detail-label">Layanan</span>
                                    <span className="detail-value">{selectedBooking.serviceName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Durasi</span>
                                    <span className="detail-value">{selectedBooking.variantLabel}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Harga</span>
                                    <span className="detail-value" style={{ fontWeight: 600, color: "#059669" }}>
                                        {formatCurrencyFull(selectedBooking.price)}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Member & Terapis</div>
                                <div className="detail-row">
                                    <span className="detail-label">Member</span>
                                    <span className="detail-value">{selectedBooking.memberName}</span>
                                </div>
                                {selectedBooking.memberPhone && (
                                    <div className="detail-row">
                                        <span className="detail-label">Telepon</span>
                                        <span className="detail-value">{selectedBooking.memberPhone}</span>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <span className="detail-label">Terapis</span>
                                    <span className="detail-value">
                                        {selectedBooking.therapistName || <span style={{ color: "#d1d5db" }}>Belum assign</span>}
                                    </span>
                                </div>
                                {selectedBooking.roomName && (
                                    <div className="detail-row">
                                        <span className="detail-label">Ruangan</span>
                                        <span className="detail-value">{selectedBooking.roomName}</span>
                                    </div>
                                )}
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Pembayaran</div>
                                <div className="detail-row">
                                    <span className="detail-label">Metode</span>
                                    <span className="detail-value">{selectedBooking.paymentMethod}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">
                                        <span className={`badge badge-${getPaymentStatusColor(selectedBooking.paymentStatus) === "green" ? "green" : "yellow"}`}>
                                            {getPaymentStatusLabel(selectedBooking.paymentStatus)}
                                        </span>
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Jumlah</span>
                                    <span className="detail-value" style={{ fontWeight: 600 }}>
                                        {formatCurrencyFull(selectedBooking.amountPaid)}
                                    </span>
                                </div>
                            </div>

                            {selectedBooking.rating && (
                                <div className="detail-section">
                                    <div className="detail-section-title">Rating</div>
                                    <div className="detail-row">
                                        <span className="detail-label">Rating</span>
                                        <span className="detail-value" style={{ color: "#f59e0b" }}>
                                            {"★".repeat(selectedBooking.rating)}{"☆".repeat(5 - selectedBooking.rating)}
                                        </span>
                                    </div>
                                    {selectedBooking.ratingComment && (
                                        <div className="detail-row">
                                            <span className="detail-label">Komentar</span>
                                            <span className="detail-value">{selectedBooking.ratingComment}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(selectedBooking.startTime || selectedBooking.endTime) && (
                                <div className="detail-section">
                                    <div className="detail-section-title">Waktu Eksekusi</div>
                                    {selectedBooking.startTime && (
                                        <div className="detail-row">
                                            <span className="detail-label">Mulai</span>
                                            <span className="detail-value">{formatDateTime(selectedBooking.startTime)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.endTime && (
                                        <div className="detail-row">
                                            <span className="detail-label">Selesai</span>
                                            <span className="detail-value">{formatDateTime(selectedBooking.endTime)}</span>
                                        </div>
                                    )}
                                    {selectedBooking.durationActual && (
                                        <div className="detail-row">
                                            <span className="detail-label">Durasi Aktual</span>
                                            <span className="detail-value">{selectedBooking.durationActual} menit</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .stats-row {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                @media (max-width: 768px) {
                    .stats-row {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                .badge-purple {
                    background: #f3e8ff;
                    color: #7c3aed;
                }
                .badge-gray {
                    background: #f3f4f6;
                    color: #6b7280;
                }
            `}</style>
        </>
    );
}
