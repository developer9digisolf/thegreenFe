"use client";

import { useState } from "react";
import { formatCurrency } from "@afx/utils/format";
import type { Branch, GateState, Toast } from "@afx/interfaces/pos.iface";
import "@afx/styles/pos.css";

// ============================================
// Types
// ============================================
interface Props {
    gateState: GateState;
    branches: Branch[];
    selectedBranch: Branch | null;
    activeSession: any;
    activeBranchId: number | null;
    activeSessionsMap: Record<number, any>;
    openingCash: string;
    setOpeningCash: (v: string) => void;
    closingCash: string;
    setClosingCash: (v: string) => void;
    cashMovementReason: string;
    setCashMovementReason: (v: string) => void;
    isProcessing: boolean;
    onSelectBranch: (branch: Branch) => void;
    onForceClose: () => void;
    onOpenSession: () => void;
    onContinueSession: (branch: Branch) => void;
    toast: Toast | null;
    onBack: () => void;
}

// ============================================
// Helpers
// ============================================

function branchHasActiveSession(branch: Branch): boolean {
    const b = branch as any;
    return !!(
        b.hasActiveSession   ||
        b.has_active_session ||
        b.activeSession      ||
        b.active_session     ||
        b.activeSessionId    ||
        b.active_session_id  ||
        b.sessionId          ||
        b.session_id
    );
}

function getSessionInfoFromBranch(
    branch: Branch
): { userName?: string; sessionCode?: string } | null {
    const b = branch as any;
    const s = b.activeSession || b.active_session || null;
    if (!s) return null;
    return {
        userName:    s.userName    || s.user_name || s.name,
        sessionCode: s.sessionCode || s.session_code || s.code,
    };
}

// ============================================
// Sub-components
// ============================================

function GatekeeperIcon({
    icon,
    variant = "green",
}: {
    icon: string;
    variant?: "green" | "red" | "yellow";
}) {
    const styles = {
        green:  { bg: "var(--spa-green-bg)",    color: "var(--spa-green)"  },
        red:    { bg: "var(--accent-red-light)", color: "var(--accent-red)" },
        yellow: { bg: "rgba(234,179,8,0.1)",     color: "#ca8a04"           },
    };
    const { bg, color } = styles[variant];
    return (
        <div style={{ width: "80px", height: "80px", background: bg, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <i className={icon} style={{ fontSize: "36px", color }} />
        </div>
    );
}

function ActiveSessionBadge() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.4)", borderRadius: "20px", fontSize: "11px", fontWeight: 700, color: "#16a34a", flexShrink: 0, whiteSpace: "nowrap" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 2px rgba(34,197,94,0.3)", flexShrink: 0 }} />
            Sesi Aktif
        </span>
    );
}

function SessionInfoCard({ session }: { session: any }) {
    if (!session) return null;
    return (
        <div style={{ background: "var(--bg-main)", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "14px 16px", marginBottom: "24px", textAlign: "left", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--spa-green-bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "16px", fontWeight: 700, color: "var(--spa-green)" }}>
                {(session.userName ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{session.userName ?? "Kasir"}</div>
                {session.sessionCode && (
                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        Kode Sesi: {session.sessionCode}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// GatekeeperScreen
// ============================================
export default function GatekeeperScreen({
    gateState,
    branches,
    selectedBranch,
    activeSession,
    activeBranchId,
    activeSessionsMap,
    openingCash,
    setOpeningCash,
    closingCash,
    setClosingCash,
    cashMovementReason,
    setCashMovementReason,
    isProcessing,
    onSelectBranch,
    onForceClose,
    onOpenSession,
    onContinueSession,
    toast,
    onBack,
}: Props) {
    const [conflictBranch, setConflictBranch] = useState<Branch | null>(null);

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * [FIX] Deteksi sesi aktif dengan 3 strategi berurutan:
     *   1. activeSessionsMap (paling andal — di-fetch saat init)
     *   2. activeBranchId dari prop
     *   3. Field di dalam object Branch
     */
    const checkBranchActive = (branch: Branch): boolean => {
        const b    = branch as any;
        const bId  = Number(b.branchId ?? b.id);

        // Strategi 1: dari map yang di-fetch saat init
        if (activeSessionsMap && activeSessionsMap[bId]) return true;

        // Strategi 2: dari prop activeBranchId
        if (activeBranchId !== null) return Number(activeBranchId) === bId;

        // Strategi 3: field langsung di branch object
        return branchHasActiveSession(branch);
    };

    /**
     * [FIX] Ambil data sesi aktif untuk panel konflik & FORCE_CLOSE.
     * Prioritas: activeSessionsMap → activeSession prop → field di branch object
     */
    const getActiveSessionForBranch = (branch: Branch | null): any => {
        if (!branch) return activeSession;
        const bId = Number((branch as any).branchId ?? (branch as any).id);
        return activeSessionsMap?.[bId] ?? activeSession ?? getSessionInfoFromBranch(branch);
    };

    /**
     * [FIX] Data sesi untuk panel FORCE_CLOSE.
     * Sebelumnya: hanya pakai `activeSession` prop → bisa null → panel blank.
     * Sekarang: pakai fallback chain agar selalu ada data.
     */
    const forceCloseSession = getActiveSessionForBranch(selectedBranch);

    // ── Handlers ─────────────────────────────────────────────────────────────

    const handleBranchClick = (branch: Branch) => {
        if (checkBranchActive(branch)) {
            setConflictBranch(branch);  // → tampilkan panel konflik
        } else {
            onSelectBranch(branch);     // → flow normal (OPEN_SESSION)
        }
    };

    const handleContinue = () => {
        if (!conflictBranch) return;
        const branchToUse = conflictBranch;
        setConflictBranch(null);
        onContinueSession(branchToUse);
    };

    /**
     * [FIX] handleCloseThenOpen sekarang memanggil onSelectBranch
     * yang akan trigger handleSelectBranch di hook → fetch ulang sesi →
     * set activeSession → set gateState = FORCE_CLOSE dengan data lengkap.
     * Urutan: hapus conflict state DULU, baru panggil onSelectBranch
     * agar tidak ada state yang bertabrakan.
     */
    const handleCloseThenOpen = () => {
        if (!conflictBranch) return;
        const branch = conflictBranch;
        setConflictBranch(null);        // ← tutup conflict panel dulu
        onSelectBranch(branch);         // ← hook: fetch → set activeSession → FORCE_CLOSE
    };

    // Data sesi untuk conflict panel
    const conflictSessionInfo = conflictBranch
        ? getActiveSessionForBranch(conflictBranch)
        : null;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div
            className="pos-container"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-main)" }}
        >
            <div
                style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "460px", boxShadow: "var(--shadow-lg)", textAlign: "center" }}
            >

                {/* ── INITIALIZING ──────────────────────────────────────────── */}
                {gateState === "INITIALIZING" && (
                    <div style={{ padding: "40px 0" }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "48px", color: "var(--spa-green)", marginBottom: "20px", display: "block" }} />
                        <h2>Memuat Sistem...</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                            Memeriksa ketersediaan cabang dan sesi laci kasir.
                        </p>
                    </div>
                )}

                {/* ── SELECT_BRANCH: daftar cabang ──────────────────────────── */}
                {gateState === "SELECT_BRANCH" && !conflictBranch && (
                    <div>
                        <GatekeeperIcon icon="fa-solid fa-store" />
                        <h2 style={{ marginBottom: "10px", fontSize: "24px" }}>Pilih Cabang</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                            Anda terdaftar di beberapa cabang. Pilih lokasi Anda bertugas saat ini.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "320px", overflowY: "auto", paddingRight: "4px" }}>
                            {branches.map((b) => {
                                const isActive = checkBranchActive(b);
                                const bAny = b as any;
                                return (
                                    <button
                                        key={bAny.branchId ?? bAny.id}
                                        onClick={() => handleBranchClick(b)}
                                        style={{
                                            padding: "14px 18px", fontSize: "15px", fontWeight: 600,
                                            borderRadius: "14px", cursor: "pointer", width: "100%",
                                            display: "flex", alignItems: "center", justifyContent: "space-between",
                                            gap: "12px", textAlign: "left", transition: "all 0.18s",
                                            border: isActive ? "2px solid rgba(34,197,94,0.5)" : "2px solid var(--border-color)",
                                            background: isActive ? "rgba(34,197,94,0.06)" : "var(--bg-main)",
                                            color: "var(--text-primary)",
                                        }}
                                    >
                                        <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <i className="fa-solid fa-location-dot" style={{ color: "var(--spa-green)", fontSize: "16px" }} />
                                            {bAny.branchName ?? bAny.name}
                                        </span>
                                        {isActive && <ActiveSessionBadge />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── SELECT_BRANCH: panel konflik ──────────────────────────── */}
                {gateState === "SELECT_BRANCH" && conflictBranch && (
                    <div>
                        <GatekeeperIcon icon="fa-solid fa-circle-exclamation" variant="yellow" />
                        <h2 style={{ marginBottom: "8px", fontSize: "22px" }}>Sesi Sedang Berjalan</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6 }}>
                            Cabang{" "}
                            <b style={{ color: "var(--text-primary)" }}>
                                {(conflictBranch as any).branchName ?? (conflictBranch as any).name}
                            </b>{" "}
                            masih memiliki sesi kasir yang aktif. Apa yang ingin Anda lakukan?
                        </p>

                        <SessionInfoCard session={conflictSessionInfo} />

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <button className="action-btn primary" onClick={handleContinue} disabled={isProcessing}>
                                <i className="fa-solid fa-play" /> Lanjutkan Sesi
                            </button>
                            <button
                                className="action-btn secondary"
                                onClick={handleCloseThenOpen}
                                disabled={isProcessing}
                                style={{ borderColor: "var(--accent-red)", color: "var(--accent-red)" }}
                            >
                                <i className="fa-solid fa-power-off" /> Tutup Sesi Dulu
                            </button>
                            <button
                                onClick={() => setConflictBranch(null)}
                                disabled={isProcessing}
                                style={{ background: "none", border: "none", fontSize: "13px", color: "var(--text-muted)", cursor: "pointer", marginTop: "4px", padding: "4px" }}
                            >
                                ← Pilih cabang lain
                            </button>
                        </div>
                    </div>
                )}

                {/* ── FORCE_CLOSE ───────────────────────────────────────────── */}
                {/*
                  * [FIX] Kondisi render sebelumnya: gateState === "FORCE_CLOSE" && activeSession
                  * Masalah: activeSession bisa null → panel blank tanpa error apapun.
                  *
                  * Sekarang: pakai `forceCloseSession` yang sudah punya fallback chain
                  * (activeSessionsMap → activeSession → branch field).
                  * Panel selalu bisa render selama gateState = FORCE_CLOSE.
                  */}
                {gateState === "FORCE_CLOSE" && (
                    <div>
                        <GatekeeperIcon icon="fa-solid fa-lock" variant="red" />
                        <h2 style={{ marginBottom: "10px", fontSize: "22px", color: "var(--accent-red)" }}>
                            Tutup Sesi Lama
                        </h2>

                        {/* Info sesi — tampil jika ada data, tidak crash jika tidak ada */}
                        {forceCloseSession ? (
                            <div style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px", marginBottom: "20px", textAlign: "left" }}>
                                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                    Sesi aktif saat ini:
                                </p>
                                <div style={{ fontWeight: 700 }}>{forceCloseSession.userName ?? "Kasir"}</div>
                                <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                    ID: {forceCloseSession.sessionCode ?? forceCloseSession.id ?? "—"}
                                </div>
                            </div>
                        ) : (
                            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginBottom: "20px" }}>
                                Tutup sesi yang sedang berjalan sebelum melanjutkan.
                            </p>
                        )}

                        <p style={{ color: "var(--text-primary)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.5 }}>
                            Hitung jumlah uang fisik di laci, lalu tutup sesi sebelum memulai shift baru.
                        </p>

                        <div style={{ textAlign: "left", marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                Kas Aktual Fisik (Rp)
                            </label>
                            <input
                                type="number"
                                value={closingCash}
                                onChange={(e) => setClosingCash(e.target.value)}
                                placeholder="Total uang di laci"
                                className="search-input"
                                autoFocus
                                style={{ width: "100%", padding: "16px", fontSize: "20px", textAlign: "right", fontWeight: 700, marginBottom: "16px" }}
                            />
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                Catatan (Opsional)
                            </label>
                            <input
                                type="text"
                                value={cashMovementReason}
                                onChange={(e) => setCashMovementReason(e.target.value)}
                                placeholder="Contoh: Menutup paksa sesi pagi"
                                className="search-input"
                                style={{ width: "100%", padding: "14px", fontSize: "14px" }}
                            />
                        </div>

                        <button
                            className="action-btn primary"
                            onClick={onForceClose}
                            disabled={isProcessing || !closingCash}
                            style={{
                                width: "100%",
                                background: "var(--accent-red)",
                                opacity: (isProcessing || !closingCash) ? 0.6 : 1,
                            }}
                        >
                            {isProcessing ? (
                                <i className="fa-solid fa-spinner fa-spin" />
                            ) : (
                                <><i className="fa-solid fa-power-off" /> Tutup Sesi Lama</>
                            )}
                        </button>
                    </div>
                )}

                {/* ── OPEN_SESSION ──────────────────────────────────────────── */}
                {gateState === "OPEN_SESSION" && (
                    <div>
                        <GatekeeperIcon icon="fa-solid fa-cash-register" />
                        <h2 style={{ marginBottom: "6px", fontSize: "24px" }}>Buka Sesi Kasir</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6, marginBottom: "24px" }}>
                            Cabang <b>{selectedBranch?.branchName}</b>. Masukkan modal uang kembalian Anda.
                        </p>

                        <div style={{ textAlign: "left", marginBottom: "24px" }}>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                Kas Awal (Rp)
                            </label>
                            <input
                                type="number"
                                value={openingCash}
                                onChange={(e) => setOpeningCash(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && onOpenSession()}
                                placeholder="500000"
                                className="search-input"
                                autoFocus
                                style={{ width: "100%", padding: "16px", fontSize: "22px", textAlign: "right", fontWeight: 700 }}
                            />
                            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                                {[200_000, 500_000, 1_000_000].map((amount) => {
                                    const isSelected = openingCash === amount.toString();
                                    return (
                                        <button
                                            key={amount}
                                            onClick={() => setOpeningCash(amount.toString())}
                                            style={{
                                                padding: "8px 16px", fontSize: "13px", fontWeight: 600,
                                                borderRadius: "8px", cursor: "pointer", transition: "all 0.2s",
                                                background: isSelected ? "var(--spa-green-bg)" : "var(--bg-main)",
                                                color: isSelected ? "var(--spa-green)" : "var(--text-secondary)",
                                                border: isSelected ? "2px solid var(--spa-green)" : "2px solid var(--border-color)",
                                            }}
                                        >
                                            {formatCurrency(amount)}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button type="button" className="action-btn secondary" style={{ flex: 1 }} onClick={onBack}>
                                <i className="fa-solid fa-arrow-left" /> Kembali
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={onOpenSession}
                                disabled={isProcessing}
                                style={{ flex: 1 }}
                            >
                                {isProcessing ? (
                                    <i className="fa-solid fa-spinner fa-spin" />
                                ) : (
                                    <><i className="fa-solid fa-play" /> Mulai Sesi</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className={`pos-toast pos-toast-${toast.type}`}>
                    <i className={`fa-solid ${toast.type === "success" ? "fa-check-circle" : toast.type === "error" ? "fa-exclamation-circle" : "fa-info-circle"}`} />
                    <span>{toast.message}</span>
                </div>
            )}
        </div>
    );
}