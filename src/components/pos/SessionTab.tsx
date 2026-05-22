"use client";

import { useState, useCallback, useEffect } from "react";
import { GetSessionsService, GetTherapistsService, UpdateSessionTherapistService } from "@afx/services/pos.service";

// ============================================
// 1. TYPES & INTERFACES
// ============================================

export interface SessionRow {
    id: number;
    sessionCode: string;
    saleCode: string;
    memberId: number;
    memberName: string;
    therapistId: number;
    therapistName: string;
    serviceName: string;
    roomId: number;
    roomName: string;
    sessionDate: string;
    scheduledTime: string;
    startTime: string | null;
    endTime: string | null;
    durationActual: number;
    status: string;
    statusName: string;
    createdAt: string;
}

interface TherapistOption {
    id: number;
    name: string;
}

interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

interface FilterState {
    search: string;
}

interface Props {
    branchId?: number | null;
    onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

// ============================================
// 2. CONSTANTS & HELPERS
// ============================================

const PAGE_SIZE = 10;

const getTodayDate = (): string => {
    const now = new Date();
    const year  = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day   = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const formatTime = (dateString: string | null): string => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const isPendingStatus = (status: string): boolean =>
    status?.toLowerCase() === "pending";

const DEFAULT_PAGINATION: PaginationMeta = {
    currentPage: 1,
    totalPages:  1,
    totalItems:  0,
    pageSize:    PAGE_SIZE,
};

// ============================================
// 3. SUB-COMPONENTS
// ============================================

// --- StatusBadge ---

function StatusBadge({ statusName }: { statusName: string }) {
    const s = statusName?.toLowerCase() ?? "";

    const styleMap: Record<string, { bg: string; color: string }> = {
        pending:  { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
        menunggu: { bg: "rgba(245,158,11,0.1)", color: "#d97706" },
        progress: { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
        jalan:    { bg: "rgba(59,130,246,0.1)", color: "#2563eb" },
        complete: { bg: "rgba(16,185,129,0.1)", color: "#059669" },
        selesai:  { bg: "rgba(16,185,129,0.1)", color: "#059669" },
        cancel:   { bg: "rgba(239,68,68,0.1)",  color: "#dc2626" },
        batal:    { bg: "rgba(239,68,68,0.1)",  color: "#dc2626" },
    };

    const matched = Object.entries(styleMap).find(([key]) => s.includes(key));
    const { bg, color } = matched?.[1] ?? { bg: "#f1f5f9", color: "#64748b" };

    return (
        <span style={{
            background: bg, color,
            padding: "3px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 700,
        }}>
            {statusName}
        </span>
    );
}

// --- SessionFilterBar ---

interface SessionFilterBarProps {
    filter: FilterState;
    setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
    onSearch: () => void;
    onReset: () => void;
    loading: boolean;
}

function SessionFilterBar({ filter, setFilter, onSearch, onReset, loading }: SessionFilterBarProps) {
    return (
        <div style={{
            background: "var(--bg-card)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-solid fa-bed-pulse" style={{ color: "var(--spa-green)" }} />
                    Daftar Sesi Terapi (Hari Ini)
                </h2>
                <button
                    onClick={onSearch}
                    disabled={loading}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 12px", fontSize: "12px", fontWeight: 600,
                        borderRadius: "8px", border: "1px solid var(--border-color)",
                        background: "var(--bg-main)", color: "var(--text-muted)",
                        cursor: loading ? "not-allowed" : "pointer",
                        opacity: loading ? 0.6 : 1,
                    }}
                >
                    <i className={`fa-solid fa-rotate-right ${loading ? "fa-spin" : ""}`} /> Segarkan
                </button>
            </div>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
                <div style={{ flex: 1, minWidth: "250px" }}>
                    <label style={{
                        display: "block", fontSize: "11px",
                        fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px",
                    }}>
                        Cari Kode / Member
                    </label>
                    <div className="search-input-wrapper" style={{ position: "relative" }}>
                        <i className="fa-solid fa-magnifying-glass" style={{
                            position: "absolute", left: "12px",
                            top: "50%", transform: "translateY(-50%)",
                            color: "var(--text-muted)",
                        }} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Ketik untuk mencari..."
                            value={filter.search}
                            onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
                            onKeyDown={(e) => e.key === "Enter" && onSearch()}
                            style={{ width: "100%", paddingLeft: "36px" }}
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        className="action-btn primary"
                        onClick={onSearch}
                        disabled={loading}
                        style={{ padding: "0 20px", height: "38px" }}
                    >
                        <i className="fa-solid fa-magnifying-glass" style={{ marginRight: "6px" }} /> Cari
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={onReset}
                        title="Reset Pencarian"
                        style={{ padding: "0 16px", height: "38px" }}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- SessionTable ---

interface SessionTableProps {
    sessions: SessionRow[];
    loading: boolean;
    onRowClick: (session: SessionRow) => void;
    onOpenSessionQR: (session: SessionRow) => void;
    onChangeTherapist: (session: SessionRow) => void;
    selectedSessionId?: number | null;
}

function SessionTable({
    sessions,
    loading,
    onRowClick,
    onOpenSessionQR,
    onChangeTherapist,
    selectedSessionId,
}: SessionTableProps) {
    if (loading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }} />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div style={{
                textAlign: "center", padding: "60px 20px",
                color: "var(--text-muted)", background: "var(--bg-card)",
                borderRadius: "12px", border: "1px dashed var(--border-color)",
            }}>
                <i className="fa-solid fa-bed-pulse" style={{ fontSize: "40px", opacity: 0.3, marginBottom: "12px" }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Tidak ada sesi terapi hari ini</p>
            </div>
        );
    }

    const COL_HEADERS = [
        "Kode Sesi", "Pelanggan", "Terapis & Ruangan",
        "Layanan", "Waktu Terapi", "Status", "Aksi",
    ];

    return (
        <div style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            overflow: "hidden",
        }}>
            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                    <thead>
                        <tr style={{
                            borderBottom: "1px solid var(--border-color)",
                            background: "var(--bg-main)",
                            color: "var(--text-muted)",
                            textTransform: "uppercase",
                            fontSize: "11px",
                        }}>
                            {COL_HEADERS.map((col) => (
                                <th key={col} style={{ padding: "12px 16px" }}>{col}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {sessions.map((ses) => {
                            const isSelected = selectedSessionId === ses.id;
                            const isPending  = isPendingStatus(ses.status);

                            return (
                                <tr
                                    key={ses.id}
                                    onClick={() => onRowClick(ses)}
                                    style={{
                                        borderBottom: "1px solid var(--border-color)",
                                        cursor: "pointer",
                                        background: isSelected ? "var(--spa-green-bg)" : "transparent",
                                        transition: "background 0.15s",
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = "var(--bg-main)";
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isSelected) e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    {/* Kode Sesi */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ fontWeight: 700, fontFamily: "monospace", color: "var(--spa-green)" }}>
                                            {ses.sessionCode}
                                        </div>
                                        <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                                            {ses.sessionDate}
                                        </div>
                                    </td>

                                    {/* Pelanggan */}
                                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{ses.memberName}</td>

                                    {/* Terapis & Ruangan */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <div>
                                            <i className="fa-solid fa-user-md" style={{ color: "var(--spa-green)", marginRight: "5px" }} />
                                            {ses.therapistName || "—"}
                                        </div>
                                        <div style={{ marginTop: "4px" }}>
                                            <i className="fa-solid fa-door-open" style={{ color: "#d97706", marginRight: "5px" }} />
                                            {ses.roomName || "—"}
                                        </div>
                                    </td>

                                    {/* Layanan */}
                                    <td style={{ padding: "14px 16px", fontWeight: 600 }}>{ses.serviceName}</td>

                                    {/* Waktu Terapi */}
                                    <td style={{ padding: "14px 16px", fontFamily: "monospace", fontSize: "12px" }}>
                                        {formatTime(ses.startTime)} - {formatTime(ses.endTime)}
                                    </td>

                                    {/* Status */}
                                    <td style={{ padding: "14px 16px" }}>
                                        <StatusBadge statusName={ses.statusName} />
                                    </td>

                                    {/* Aksi — hanya tampil jika pending */}
                                    <td style={{ padding: "14px 16px" }}>
                                        {isPending && (
                                            <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
                                                {/* Tombol QR */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onOpenSessionQR(ses); }}
                                                    title="Tampilkan QR Code"
                                                    style={{
                                                        padding: "7px 12px", fontSize: "12px", fontWeight: 700,
                                                        background: "var(--spa-green-bg)", color: "var(--spa-green)",
                                                        border: "1px solid var(--spa-green-border)", borderRadius: "8px",
                                                        cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    <i className="fa-solid fa-qrcode" /> QR
                                                </button>

                                                {/* Tombol Ganti Terapis */}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onChangeTherapist(ses); }}
                                                    title="Ganti Terapis"
                                                    style={{
                                                        padding: "7px 12px", fontSize: "12px", fontWeight: 700,
                                                        background: "rgba(99,102,241,0.1)", color: "#4f46e5",
                                                        border: "1px solid rgba(99,102,241,0.3)", borderRadius: "8px",
                                                        cursor: "pointer", display: "flex", alignItems: "center", gap: "5px",
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    <i className="fa-solid fa-user-pen" /> Terapis
                                                </button>
                                            </div>
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

// --- SessionPagination ---

interface SessionPaginationProps {
    meta: PaginationMeta;
    onPageChange: (page: number) => void;
}

function SessionPagination({ meta, onPageChange }: SessionPaginationProps) {
    if (meta.totalPages <= 1) return null;

    const { currentPage, totalPages, totalItems } = meta;

    const getPageNumbers = (): (number | "...")[] => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

        const pages: (number | "...")[] = [1];
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    const btnBase: React.CSSProperties = {
        padding: "6px 12px",
        borderRadius: "8px",
        border: "1px solid var(--border-color)",
        background: "var(--bg-main)",
        color: "var(--text-muted)",
        cursor: "pointer",
        fontSize: "13px",
        fontWeight: 500,
        minWidth: "36px",
        textAlign: "center",
    };

    return (
        <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            background: "var(--bg-card)",
            borderRadius: "12px",
            border: "1px solid var(--border-color)",
            flexWrap: "wrap",
            gap: "10px",
        }}>
            <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                Halaman <b>{currentPage}</b> dari <b>{totalPages}</b> &nbsp;·&nbsp; Total <b>{totalItems}</b> sesi
            </span>

            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    style={{ ...btnBase, opacity: currentPage <= 1 ? 0.4 : 1, cursor: currentPage <= 1 ? "not-allowed" : "pointer" }}
                >
                    <i className="fa-solid fa-chevron-left" />
                </button>

                {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                        <span key={`ellipsis-${idx}`} style={{ padding: "0 4px", color: "var(--text-muted)", fontSize: "13px" }}>…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p as number)}
                            style={{
                                ...btnBase,
                                fontWeight:   currentPage === p ? 700 : 500,
                                background:   currentPage === p ? "var(--spa-green)" : "var(--bg-main)",
                                color:        currentPage === p ? "#fff" : "var(--text-muted)",
                                borderColor:  currentPage === p ? "var(--spa-green)" : "var(--border-color)",
                            }}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    style={{ ...btnBase, opacity: currentPage >= totalPages ? 0.4 : 1, cursor: currentPage >= totalPages ? "not-allowed" : "pointer" }}
                >
                    <i className="fa-solid fa-chevron-right" />
                </button>
            </div>
        </div>
    );
}

// --- UpdateTherapistModal ---

interface UpdateTherapistModalProps {
    session: SessionRow | null;
    branchId: number;
    onClose: () => void;
    onSuccess: () => void;
    onToast: (msg: string, type?: "success" | "error" | "info") => void;
}

function UpdateTherapistModal({ session, branchId, onClose, onSuccess, onToast }: UpdateTherapistModalProps) {
    const [therapists, setTherapists]         = useState<TherapistOption[]>([]);
    const [selectedId, setSelectedId]         = useState<number | "">("");
    const [loadingList, setLoadingList]       = useState(false);
    const [loadingSubmit, setLoadingSubmit]   = useState(false);

    // Fetch daftar terapis saat modal dibuka
    useEffect(() => {
        if (!session) return;

        const fetchTherapists = async () => {
            setLoadingList(true);
            try {
                const res = await GetTherapistsService({ branchId });
                if (res.success) {
                    const list: TherapistOption[] = res.data?.pageData ?? res.data ?? [];
                    setTherapists(list);
                } else {
                    onToast(res.message ?? "Gagal memuat daftar terapis", "error");
                }
            } catch {
                onToast("Gagal memuat daftar terapis", "error");
            } finally {
                setLoadingList(false);
            }
        };

        fetchTherapists();
    }, [session, branchId, onToast]);

    const handleSubmit = async () => {
        if (!session) return;

        if (!selectedId) {
            onToast("Pilih terapis terlebih dahulu", "error");
            return;
        }

        if (selectedId === session.therapistId) {
            onToast("Terapis yang dipilih sama dengan sebelumnya", "info");
            return;
        }

        setLoadingSubmit(true);
        try {
            const res = await UpdateSessionTherapistService({
                SessionCode:  session.sessionCode,
                TherapistId:  selectedId as number,
            });

            if (res.success) {
                onToast("Terapis berhasil diperbarui", "success");
                onSuccess();
                onClose();
            } else {
                onToast(res.message ?? "Gagal memperbarui terapis", "error");
            }
        } catch {
            onToast("Gagal memperbarui terapis", "error");
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!session) return null;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(15, 23, 42, 0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1400, backdropFilter: "blur(4px)",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-card)",
                    borderRadius: "20px",
                    padding: "32px",
                    width: "min(440px, 94vw)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
                    animation: "modalScale 0.25s ease-out",
                }}
            >
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "44px", height: "44px",
                            background: "rgba(99,102,241,0.1)", color: "#4f46e5",
                            borderRadius: "12px", display: "flex",
                            alignItems: "center", justifyContent: "center", fontSize: "20px",
                        }}>
                            <i className="fa-solid fa-user-pen" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "var(--text-primary)" }}>
                                Ganti Terapis
                            </h3>
                            <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
                                Sesi <span style={{ fontFamily: "monospace", fontWeight: 700, color: "#4f46e5" }}>{session.sessionCode}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            width: "32px", height: "32px", borderRadius: "8px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-main)", color: "var(--text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        }}
                    >
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Info sesi saat ini */}
                <div style={{
                    background: "var(--bg-main)",
                    borderRadius: "12px",
                    padding: "14px 16px",
                    marginBottom: "20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                }}>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", marginBottom: "4px" }}>
                        Info Sesi Saat Ini
                    </div>
                    {[
                        { icon: "fa-user",       label: "Pelanggan",       value: session.memberName    },
                        { icon: "fa-spa",        label: "Layanan",         value: session.serviceName   },
                        { icon: "fa-user-md",    label: "Terapis Aktif",   value: session.therapistName || "—" },
                        { icon: "fa-door-open",  label: "Ruangan",         value: session.roomName      || "—" },
                    ].map(({ icon, label, value }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
                                <i className={`fa-solid ${icon}`} style={{ width: "14px", opacity: 0.6 }} /> {label}
                            </span>
                            <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{value}</span>
                        </div>
                    ))}
                </div>

                {/* Divider dengan label */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                    <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                        Pilih Terapis Baru
                    </span>
                    <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }} />
                </div>

                {/* Dropdown terapis */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{
                        display: "block", fontSize: "11px",
                        fontWeight: 600, color: "var(--text-muted)", marginBottom: "6px",
                    }}>
                        Terapis <span style={{ color: "#dc2626" }}>*</span>
                    </label>

                    {loadingList ? (
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            padding: "10px 14px", borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-main)",
                            color: "var(--text-muted)", fontSize: "13px",
                        }}>
                            <i className="fa-solid fa-spinner fa-spin" /> Memuat daftar terapis...
                        </div>
                    ) : (
                        <select
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value ? Number(e.target.value) : "")}
                            style={{
                                width: "100%",
                                padding: "10px 14px",
                                borderRadius: "10px",
                                border: `1px solid ${selectedId ? "#4f46e5" : "var(--border-color)"}`,
                                background: "var(--bg-main)",
                                color: selectedId ? "var(--text-primary)" : "var(--text-muted)",
                                fontSize: "13px",
                                fontWeight: selectedId ? 600 : 400,
                                cursor: "pointer",
                                outline: "none",
                                appearance: "auto",
                            }}
                        >
                            <option value="">-- Pilih terapis --</option>
                            {therapists.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}{t.id === session.therapistId ? " (Saat ini)" : ""}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "10px" }}>
                    <button
                        onClick={onClose}
                        disabled={loadingSubmit}
                        style={{
                            flex: 1, padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid var(--border-color)",
                            background: "var(--bg-main)",
                            color: "var(--text-muted)",
                            fontSize: "13px", fontWeight: 600,
                            cursor: loadingSubmit ? "not-allowed" : "pointer",
                            opacity: loadingSubmit ? 0.6 : 1,
                        }}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loadingSubmit || loadingList || !selectedId}
                        style={{
                            flex: 2, padding: "12px",
                            borderRadius: "10px",
                            border: "none",
                            background: (!selectedId || loadingSubmit || loadingList)
                                ? "var(--border-color)"
                                : "#4f46e5",
                            color: (!selectedId || loadingSubmit || loadingList) ? "var(--text-muted)" : "#fff",
                            fontSize: "13px", fontWeight: 700,
                            cursor: (!selectedId || loadingSubmit || loadingList) ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                            transition: "background 0.2s",
                        }}
                    >
                        {loadingSubmit
                            ? <><i className="fa-solid fa-spinner fa-spin" /> Menyimpan...</>
                            : <><i className="fa-solid fa-floppy-disk" /> Simpan Perubahan</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- SessionSuccessModal ---

function SessionSuccessModal({ session, onClose }: { session: SessionRow | null; onClose: () => void }) {
    if (!session) return null;

    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(session.sessionCode)}&scale=3&rotate=N&includetext&backgroundcolor=ffffff`;

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0,
                background: "rgba(15, 23, 42, 0.7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 1400, backdropFilter: "blur(4px)",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "var(--bg-card)", borderRadius: "24px", padding: "40px",
                    width: "min(400px, 92vw)",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)",
                    textAlign: "center",
                    animation: "modalScale 0.3s ease-out",
                }}
            >
                <div style={{
                    width: "70px", height: "70px",
                    background: "var(--spa-green-bg)", color: "var(--spa-green)",
                    borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "32px", margin: "0 auto 20px",
                }}>
                    <i className="fa-solid fa-circle-check" />
                </div>

                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
                    Sesi Booking Berhasil Dibuat!
                </h2>
                <p style={{ margin: "8px 0 24px", color: "var(--text-muted)", fontSize: "13px" }}>
                    Arahkan pelanggan ke terapis dengan menggunakan kode QR berikut.
                </p>

                <div style={{
                    background: "#fff", padding: "20px", borderRadius: "16px",
                    border: "1px solid var(--border-color)", marginBottom: "24px",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: "10px",
                }}>
                    <img
                        src={barcodeUrl}
                        alt={session.sessionCode}
                        style={{ width: "160px", height: "160px", objectFit: "contain" }}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/160x160?text=QR+Error"; }}
                    />
                    <div style={{
                        fontFamily: "monospace", fontSize: "16px",
                        fontWeight: 800, color: "var(--spa-green)", letterSpacing: "1px",
                    }}>
                        {session.sessionCode}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px", textAlign: "left" }}>
                    {[
                        { label: "Terapis", value: session.therapistName || "—" },
                        { label: "Ruangan", value: session.roomName      || "—" },
                    ].map(({ label, value }) => (
                        <div key={label} style={{ background: "var(--bg-main)", padding: "12px 14px", borderRadius: "12px" }}>
                            <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
                            <div style={{ fontSize: "13px", fontWeight: 700 }}>{value}</div>
                        </div>
                    ))}
                </div>

                <button
                    className="action-btn primary"
                    onClick={onClose}
                    style={{ width: "100%", padding: "14px", fontSize: "14px", fontWeight: 700, borderRadius: "12px" }}
                >
                    Tutup & Selesai
                </button>
            </div>
        </div>
    );
}

// ============================================
// 4. MAIN COMPONENT
// ============================================

export default function SessionTab({ branchId, onToast }: Props) {
    const [filter, setFilter]               = useState<FilterState>({ search: "" });
    const [sessions, setSessions]           = useState<SessionRow[]>([]);
    const [loading, setLoading]             = useState(false);
    const [currentPage, setCurrentPage]     = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>(DEFAULT_PAGINATION);

    // Modal states
    const [qrSession, setQrSession]                         = useState<SessionRow | null>(null);
    const [changeTherapistSession, setChangeTherapistSession] = useState<SessionRow | null>(null);

    const fetchSessions = useCallback(async (
        overrideFilter?: FilterState,
        overridePage?: number,
    ) => {
        if (!branchId) return;

        const activeFilter = overrideFilter ?? filter;
        const activePage   = overridePage   ?? currentPage;

        setLoading(true);
        try {
            const res = await GetSessionsService({
                branchId,
                startDate: getTodayDate(),
                endDate:   getTodayDate(),
                search:    activeFilter.search,
                page:      activePage,
                pageSize:  PAGE_SIZE,
            });

            if (res.success) {
                const list = res.data?.pageData ?? res.data ?? [];
                setSessions(list);
                setPaginationMeta({
                    currentPage: res.data?.currentPage ?? activePage,
                    totalPages:  res.data?.totalPages  ?? 1,
                    totalItems:  res.data?.totalItems  ?? list.length,
                    pageSize:    PAGE_SIZE,
                });
            } else {
                onToast(res.message ?? "Gagal memuat data sesi", "error");
            }
        } catch {
            onToast("Gagal memuat data sesi", "error");
        } finally {
            setLoading(false);
        }
    }, [branchId, filter, currentPage, onToast]);

    // Initial load & saat branchId berubah
    useEffect(() => {
        if (branchId) fetchSessions(filter, 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [branchId]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchSessions(filter, 1);
    };

    const handleReset = () => {
        const cleared: FilterState = { search: "" };
        setFilter(cleared);
        setCurrentPage(1);
        fetchSessions(cleared, 1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchSessions(undefined, page);
    };

    // Refresh list setelah update terapis berhasil
    const handleTherapistUpdated = () => {
        fetchSessions(filter, currentPage);
    };

    return (
        <div className="service-grid-wrapper" style={{ padding: "0 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <SessionFilterBar
                filter={filter}
                setFilter={setFilter}
                onSearch={handleSearch}
                onReset={handleReset}
                loading={loading}
            />

            <SessionTable
                sessions={sessions}
                loading={loading}
                onRowClick={(ses) => console.log("Sesi diklik:", ses)}
                onOpenSessionQR={(ses) => setQrSession(ses)}
                onChangeTherapist={(ses) => setChangeTherapistSession(ses)}
            />

            {!loading && sessions.length > 0 && (
                <SessionPagination
                    meta={paginationMeta}
                    onPageChange={handlePageChange}
                />
            )}

            {/* Modal QR Code */}
            {qrSession && (
                <SessionSuccessModal
                    session={qrSession}
                    onClose={() => setQrSession(null)}
                />
            )}

            {/* Modal Ganti Terapis — hanya bisa muncul jika status sesi pending */}
            {changeTherapistSession && isPendingStatus(changeTherapistSession.status) && (
                <UpdateTherapistModal
                    session={changeTherapistSession}
                    branchId={branchId!}
                    onClose={() => setChangeTherapistSession(null)}
                    onSuccess={handleTherapistUpdated}
                    onToast={onToast}
                />
            )}
        </div>
    );
}