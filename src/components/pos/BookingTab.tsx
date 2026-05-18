"use client";

import { useState, useCallback, useEffect } from "react";
import { useApi } from "@afx/utils/useApi";
import { formatCurrency } from "@afx/utils/format";
import { GetRoomsService, GetTherapistsTodayService } from "@afx/services/pos.service";

// ============================================
// 1. TYPES & INTERFACES
// ============================================
export interface BookingRow {
    id: number;
    code: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    statusDisplay: string;
    branchId: number;
    branchName: string;
    memberId: number;
    memberName: string;
    memberPhone: string;
    therapistId: number | null;
    therapistName: string | null;
    roomId: number | null;
    roomName: string | null;
    saleId: number;
    totalAmount: number;
    isPaid: boolean;
    notes: string | null;
    createdAt?: string;
    // Fields for session tracking
    sessionCode?: string | null;
    sessionStatus?: string | null;
    session?: {
        id: number;
        sessionCode: string;
        status: string;
        statusName: string;
        therapistName?: string | null;
        roomName?: string | null;
    } | null;
}

interface Props {
    branchId?: number | null;
    onToast: (msg: string, type?: "success" | "error" | "info") => void;
    onBookingCountChange?: () => void;
}

// ============================================
// 2. CONSTANTS & STYLE HELPERS
// ============================================
const BOOKING_STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    "Confirmed": { bg: "rgba(59,130,246,0.1)", color: "#2563eb", label: "Dikonfirmasi" },
    "InProgress": { bg: "rgba(16,185,129,0.1)", color: "#059669", label: "Berlangsung" },
    "Completed": { bg: "rgba(100,116,139,0.1)", color: "#64748b", label: "Selesai" },
    "Cancelled": { bg: "rgba(239,68,68,0.1)", color: "#dc2626", label: "Dibatalkan" },
};

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
    return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>{label}</span>;
}

function SessionStatus({ hasSession, sessionStatus }: { hasSession: boolean; sessionStatus?: string }) {
    if (!hasSession) return <span style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 600 }}>BELUM DIMULAI</span>;
    if (sessionStatus === "pending" || sessionStatus === "Pending") {
        return <span style={{ color: "var(--accent-red)", background: "rgba(239,68,68,0.1)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>PENDING</span>;
    }
    return <span style={{ color: "var(--spa-green)", background: "var(--spa-green-bg)", padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: 700 }}>BERLANGSUNG</span>;
}

// ============================================
// 3. SUB-COMPONENTS
// ============================================

function BookingFilterBar({ filter, setFilter, onSearch, onReset, loading }: any) {
    return (
        <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-solid fa-calendar-days" style={{ color: "var(--spa-green)" }} />Daftar Booking
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
                            placeholder="Nama atau kode booking..." 
                            value={filter.search} 
                            onChange={(e) => setFilter((f: any) => ({ ...f, search: e.target.value }))}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") onSearch();
                            }}
                        />
                    </div>
                </div>
                <div style={{ flex: "0 1 145px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Dari</label>
                    <input type="date" className="search-input" value={filter.startDate} onChange={(e) => setFilter((f: any) => ({ ...f, startDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px" }} />
                </div>
                <div style={{ flex: "0 1 145px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Sampai</label>
                    <input type="date" className="search-input" value={filter.endDate} onChange={(e) => setFilter((f: any) => ({ ...f, endDate: e.target.value }))} style={{ width: "100%", padding: "9px 12px" }} />
                </div>
                <div style={{ flex: "0 1 155px" }}>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>Status</label>
                    <select value={filter.statuses} onChange={(e) => setFilter((f: any) => ({ ...f, statuses: e.target.value }))} className="search-input" style={{ width: "100%", padding: "9px 12px", cursor: "pointer" }}>
                        <option value="">Semua Status</option>
                        <option value="Confirmed">Dikonfirmasi (Confirmed)</option>
                        <option value="InProgress">Berlangsung (InProgress)</option>
                        <option value="Completed">Selesai (Completed)</option>
                        <option value="Cancelled">Dibatalkan (Cancelled)</option>
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

function BookingTable({ bookings, loading, onOpenAssign, onRowClick, selectedBookingId }: any) {
    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }} />
        </div>
    );
    if (bookings.length === 0) return (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
            <i className="fa-solid fa-calendar-xmark" style={{ fontSize: "40px", opacity: 0.3, display: "block", marginBottom: "12px" }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada data booking ditemukan</p>
        </div>
    );

    return (
        <div style={{ background: "var(--bg-card)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border-color)", fontSize: "12px", color: "var(--text-muted)" }}>
                <span>Menampilkan <b style={{ color: "var(--text-primary)" }}>{bookings.length}</b> booking</span>
            </div>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", textAlign: "left" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-main)" }}>
                            {["Kode / Waktu", "Pelanggan", "Terapis & Ruangan", "Total", "Pembayaran", "Status", "Aksi"].map((h) => (
                                <th key={h} style={{ padding: "12px 16px", color: "var(--text-muted)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((bk: BookingRow) => {
                            const pStyle = BOOKING_STATUS_STYLE[bk.status] || { bg: "#f1f5f9", color: "#64748b", label: bk.statusDisplay || bk.status };
                            const isSelected = selectedBookingId === bk.id;
                            return (
                                <tr 
                                    key={bk.id} 
                                    onClick={() => onRowClick(bk)}
                                    style={{ borderBottom: "1px solid var(--border-color)", cursor: "pointer", background: isSelected ? "var(--spa-green-bg)" : "transparent" }}
                                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "var(--bg-main)"; }}
                                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                                >
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, fontSize: "13px", fontFamily: "monospace", color: isSelected ? "var(--spa-green)" : "var(--text-primary)" }}>{bk.code}</div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "3px" }}>
                                            {bk.date ? new Date(bk.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "—"} • <b>{bk.startTime} - {bk.endTime}</b>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--spa-green-bg)", color: "var(--spa-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                                                {(bk.memberName ?? "G").charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: "13px" }}>{bk.memberName ?? "Guest"}</div>
                                                {bk.memberPhone && <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{bk.memberPhone}</div>}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "14px 16px", fontSize: "12px" }}>
                                        {bk.therapistName || bk.roomName ? (
                                            <div>
                                                {bk.therapistName && <div><i className="fa-solid fa-user-md" style={{ color: "var(--spa-green)", marginRight: "5px" }} />{bk.therapistName}</div>}
                                                {bk.roomName && <div style={{ marginTop: "2px" }}><i className="fa-solid fa-door-open" style={{ color: "#d97706", marginRight: "5px" }} />{bk.roomName}</div>}
                                            </div>
                                        ) : (
                                            <span style={{ fontStyle: "italic", color: "var(--text-muted)" }}>Belum ditugaskan</span>
                                        )}
                                    </td>
                                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--spa-green)" }}>{formatCurrency(bk.totalAmount)}</td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{ 
                                            background: bk.isPaid ? "var(--spa-green-bg)" : "rgba(239,68,68,0.1)", 
                                            color: bk.isPaid ? "var(--spa-green)" : "#dc2626", 
                                            padding: "3px 10px", 
                                            borderRadius: "6px", 
                                            fontSize: "11px", 
                                            fontWeight: 700 
                                        }}>
                                            {bk.isPaid ? "Lunas" : "Belum Lunas"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}><Pill label={pStyle.label} bg={pStyle.bg} color={pStyle.color} /></td>
                                    <td style={{ padding: "14px 16px" }}>
                                        {bk.status === "Confirmed" && bk.isPaid && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenAssign(bk);
                                                }}
                                                style={{ padding: "7px 14px", fontSize: "12px", fontWeight: 700, background: "var(--spa-green-bg)", color: "var(--spa-green)", border: "1px solid var(--spa-green-border)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "6px" }}
                                            >
                                                <i className="fa-solid fa-play" /> Buat Sesi
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function BookingDetailDrawer({ isOpen, onClose, booking, loading, onOpenAssign }: any) {
    if (!isOpen) return null;
    
    // Check if session already exists
    const hasSession = !!(booking.sessionCode || booking.session?.sessionCode || booking.status === "InProgress" || booking.status === "Completed");
    const sessionCode = booking.sessionCode || booking.session?.sessionCode || "";
    
    // Check if booking is paid
    const isPaid = !!booking.isPaid;
    const canCreateSession = isPaid && !hasSession && (booking.status === "Confirmed" || booking.status === "Pending");

    return (
        <>
            <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", zIndex: 1100, backdropFilter: "blur(2px)" }} />
            <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 95vw)", background: "var(--bg-card)", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)", zIndex: 1200, display: "flex", flexDirection: "column" }}>
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                    <button onClick={onClose} style={{ background: "var(--bg-main)", border: "none", borderRadius: "10px", width: "36px", height: "36px", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: "16px", fontFamily: "monospace", color: "var(--spa-green)" }}>{booking?.code ?? "—"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{booking?.memberName ?? "Guest"}</div>
                    </div>
                </div>
                
                <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
                    {loading ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px", color: "var(--text-muted)" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 28, color: "var(--spa-green)" }} />
                            <span style={{ fontSize: "13px" }}>Memuat detail booking...</span>
                        </div>
                    ) : !booking ? null : (
                        <>
                            <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>TOTAL BAYAR</div>
                                    <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--spa-green)" }}>{formatCurrency(booking.totalAmount)}</div>
                                    <div style={{ marginTop: "4px", display: "flex", gap: "6px" }}>
                                        <span style={{ background: isPaid ? "var(--spa-green-bg)" : "rgba(239,68,68,0.1)", color: isPaid ? "var(--spa-green)" : "#dc2626", padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                                            {isPaid ? "Lunas" : "Belum Lunas"}
                                        </span>
                                        <span style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600 }}>
                                            {booking.statusDisplay ?? booking.status}
                                        </span>
                                    </div>
                                </div>
                                {sessionCode && (
                                    <div style={{ textAlign: "center", background: "#fff", padding: "8px", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                        <img 
                                            src={`https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(sessionCode)}&scale=2&backgroundcolor=ffffff`}
                                            alt="Session QR"
                                            style={{ width: "80px", height: "80px" }}
                                        />
                                        <div style={{ fontSize: "10px", fontWeight: 700, marginTop: "4px", color: "var(--text-muted)", fontFamily: "monospace" }}>{sessionCode}</div>
                                    </div>
                                )}
                            </div>

                            {/* Info Detail Booking */}
                            <section style={{ marginBottom: "24px" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                                    <i className="fa-solid fa-circle-info" style={{ color: "var(--spa-green)", marginRight: "6px" }} /> Detail Booking
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border-color)" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Tanggal & Waktu</span>
                                            <span style={{ fontWeight: 700, fontSize: "13px", textAlign: "right" }}>
                                                {booking.date ? new Date(booking.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "—"}
                                                <br />
                                                <span style={{ color: "var(--spa-green)" }}>{booking.startTime} - {booking.endTime}</span>
                                            </span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                            <span style={{ color: "var(--text-muted)", fontSize: "13px" }}>Layanan</span>
                                            <span style={{ fontWeight: 700, fontSize: "13px" }}>{booking.serviceName ?? "Standard Layanan"}</span>
                                        </div>
                                        {booking.notes && (
                                            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px", marginTop: "8px" }}>
                                                <span style={{ color: "var(--text-muted)", fontSize: "12px", display: "block", marginBottom: "3px" }}>Catatan Klien:</span>
                                                <span style={{ fontSize: "12px", fontStyle: "italic" }}>"{booking.notes}"</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* Info Pelanggan */}
                            <section style={{ marginBottom: "24px" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                                    <i className="fa-solid fa-user" style={{ color: "var(--spa-green)", marginRight: "6px" }} /> Pelanggan
                                </div>
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "12px" }}>
                                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--spa-green-bg)", color: "var(--spa-green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: 700 }}>
                                        {(booking.memberName ?? "G").charAt(0).toUpperCase()}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 700, fontSize: "14px" }}>{booking.memberName ?? "Guest"}</div>
                                        {booking.memberPhone && <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}><i className="fa-solid fa-phone" style={{ marginRight: "5px", fontSize: "11px" }} />{booking.memberPhone}</div>}
                                    </div>
                                </div>
                            </section>

                            {/* Status Sesi & Penugasan */}
                            <section style={{ marginBottom: "24px" }}>
                                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>
                                    <i className="fa-solid fa-spa" style={{ color: "var(--spa-green)", marginRight: "6px" }} /> Sesi Terapi
                                </div>
                                
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "14px 16px", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                                    <div style={{ flex: 1 }}>
                                        {hasSession ? (
                                            <div>
                                                {booking.therapistName && <div style={{ fontSize: "13px", fontWeight: 600 }}><i className="fa-solid fa-user-md" style={{ color: "var(--spa-green)", marginRight: "6px" }} />Terapis: {booking.therapistName}</div>}
                                                {booking.roomName && <div style={{ fontSize: "13px", fontWeight: 600, marginTop: "4px" }}><i className="fa-solid fa-door-open" style={{ color: "#d97706", marginRight: "6px" }} />Ruangan: {booking.roomName}</div>}
                                                <div style={{ marginTop: "8px" }}>
                                                    <SessionStatus hasSession={true} sessionStatus={booking.sessionStatus ?? booking.session?.status} />
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <span style={{ fontSize: "13px", fontStyle: "italic", color: "var(--text-muted)" }}>Sesi belum dibuat</span>
                                                {!isPaid && (
                                                    <div style={{ color: "#dc2626", fontSize: "11px", fontWeight: 600, marginTop: "4px" }}>
                                                        <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: "4px" }} /> Booking harus dilunasi untuk membuat sesi.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {canCreateSession && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onOpenAssign(booking);
                                            }}
                                            style={{ padding: "8px 16px", fontSize: "12px", fontWeight: 700, background: "var(--spa-green-bg)", color: "var(--spa-green)", border: "1px solid var(--spa-green-border)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
                                        >
                                            <i className="fa-solid fa-play" style={{ marginRight: "4px" }} /> Buat Sesi
                                        </button>
                                    )}
                                </div>
                            </section>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

function BookingAssignModal({ target, therapists, rooms, masterLoading, onClose, onSubmit }: any) {
    const [form, setForm] = useState({ therapistId: "", roomId: "", notes: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (target) {
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
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>Penugasan Sesi Booking</h3>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>{target.code} - {target.memberName}</p>
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
                                placeholder="Masukkan catatan tambahan jika ada..."
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
                
                <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "var(--text-primary)" }}>Sesi Booking Berhasil Dibuat!</h2>
                <p style={{ margin: "8px 0 28px", color: "var(--text-muted)", fontSize: "14px" }}>Gunakan QR code di bawah untuk memulai sesi booking</p>
                
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
export default function BookingTab({ branchId, onToast, onBookingCountChange }: Props) {
    const { get, post } = useApi();

    const getDefaultDates = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 7); // Default load 1 week ahead
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        
        const formatDate = (date: Date) => date.toISOString().split("T")[0];
        return { start: formatDate(lastMonth), end: formatDate(tomorrow) };
    };

    const { start, end } = getDefaultDates();
    const [filter, setFilter] = useState({ search: "", startDate: start, endDate: end, statuses: "" });
    const [bookings, setBookings] = useState<BookingRow[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedBooking, setSelectedBooking] = useState<BookingRow | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);

    const [assignTarget, setAssignTarget] = useState<BookingRow | null>(null);
    const [masterLoading, setMasterLoading] = useState(false);

    const [therapists, setTherapists] = useState<any[]>([]);
    const [rooms, setRooms] = useState<any[]>([]);
    const [createdSession, setCreatedSession] = useState<any | null>(null);

    // ── Fetch list booking ───────────────────────────────────────────────────────
    const fetchBookings = useCallback(async (overrideFilter?: any) => {
        if (!branchId) return;
        const f = overrideFilter || filter;
        setLoading(true);
        
        try {
            const url = `pos/bookings?StartDate=${f.startDate}&EndDate=${f.endDate}&BranchId=${branchId}&Statuses=${f.statuses}`;
            const res = await get(url);
            
            if (res.success || res.meta?.success) {
                const list = res.data?.pageData ?? res.data ?? [];
                
                // If searching locally by search input
                if (f.search?.trim()) {
                    const term = f.search.toLowerCase().trim();
                    const filtered = list.filter((bk: BookingRow) => 
                        bk.code?.toLowerCase().includes(term) || 
                        bk.memberName?.toLowerCase().includes(term)
                    );
                    setBookings(filtered);
                } else {
                    setBookings(list);
                }
            } else {
                onToast(res.message ?? "Gagal memuat data booking", "error");
            }
        } catch (err) {
            console.error("BookingTab Fetch Error:", err);
            onToast("Gagal memuat data booking", "error");
        } finally {
            setLoading(false);
        }
    }, [branchId, filter, onToast, get]);

    // ── Fetch master data therapist & room ────────────────────────────────────
    const fetchMasterData = useCallback(async () => {
        if (!branchId) return;
        setMasterLoading(true);
        try {
            const [roomRes, therapistRes] = await Promise.all([
                GetRoomsService(branchId),
                GetTherapistsTodayService(branchId),
            ]);

            if (roomRes.success) setRooms(roomRes.data ?? []);
            if (therapistRes.success) setTherapists(therapistRes.data ?? []);
        } catch (error) {
            console.error("Gagal menarik data master", error);
        } finally {
            setMasterLoading(false);
        }
    }, [branchId]);

    const handleOpenAssign = useCallback(async (target: BookingRow) => {
        setAssignTarget(target);
        await fetchMasterData();
    }, [fetchMasterData]);

    const handleRowClick = (bk: BookingRow) => {
        setSelectedBooking(bk);
        setIsDrawerOpen(true);
    };

    // ── Submit assign ─────────────────────────────────────────────────────────
    const handleAssignSubmit = async (form: any) => {
        if (!assignTarget) return;
        try {
            const payload = {
                TherapistId: parseInt(form.therapistId),
                RoomId: parseInt(form.roomId),
                Notes: form.notes || null,
                BookingCode: assignTarget.code,
            };
            const res = await post("pos/bookings/create-session", payload);

            if (res?.success || res?.meta?.success) {
                onToast("Sesi berhasil dibuat!", "success");
                setAssignTarget(null);
                fetchMasterData();
                
                if (res.data) {
                    setCreatedSession(res.data);
                    
                    // Update active selected booking so barcode is shown instantly in the open drawer
                    if (selectedBooking && selectedBooking.code === assignTarget.code) {
                        setSelectedBooking({
                            ...selectedBooking,
                            sessionCode: res.data.sessionCode,
                            sessionStatus: "pending",
                            therapistName: res.data.therapistName,
                            roomName: res.data.roomName,
                            status: "InProgress",
                            statusDisplay: "Berlangsung"
                        });
                    }
                }

                // Refresh bookings list
                fetchBookings();
                // Notify parent count change
                if (onBookingCountChange) onBookingCountChange();
            } else {
                const backendMsg = res?.message || res?.meta?.message;
                const errorMsg = backendMsg && backendMsg !== "Request failed"
                    ? backendMsg 
                    : "Therapist yang dipilih sedang melayani treatment lain atau tidak tersedia. Silakan pilih therapist lainnya.";
                onToast(errorMsg, "error");
            }
        } catch {
            onToast("Kesalahan jaringan", "error");
        }
    };

    useEffect(() => {
        if (branchId) {
            fetchBookings();
        }
    }, [branchId]);

    return (
        <div className="service-grid-wrapper" style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <BookingFilterBar
                filter={filter}
                setFilter={setFilter}
                onSearch={() => fetchBookings()}
                onReset={() => {
                    const { start, end } = getDefaultDates();
                    const newFilter = { search: "", startDate: start, endDate: end, statuses: "" };
                    setFilter(newFilter);
                    fetchBookings(newFilter);
                }}
                loading={loading}
            />
            <BookingTable
                bookings={bookings}
                loading={loading}
                onOpenAssign={handleOpenAssign}
                onRowClick={handleRowClick}
                selectedBookingId={selectedBooking?.id}
            />
            <BookingAssignModal
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
            <BookingDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedBooking(null);
                }}
                booking={selectedBooking}
                loading={drawerLoading}
                onOpenAssign={handleOpenAssign}
            />
        </div>
    );
}
