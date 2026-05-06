"use client";

import Link from "next/link";
import { formatCurrency } from "@afx/utils/format";
import type { Branch, GateState, Toast } from "@afx/interfaces/pos.iface";
import "@afx/styles/pos.css";

interface Props {
    gateState: GateState;
    branches: Branch[];
    selectedBranch: Branch | null;
    activeSession: any;
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
    toast: Toast | null;
        onBack: () => void;
}

export default function GatekeeperScreen({
    gateState,
    branches,
    selectedBranch,
    activeSession,
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
    toast,
    onBack
}: Props) {
    return (
        <div
            className="pos-container"
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--bg-main)",
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: "var(--bg-card)",
                    borderRadius: "24px",
                    padding: "40px",
                    width: "100%",
                    maxWidth: "460px",
                    boxShadow: "var(--shadow-lg)",
                    textAlign: "center",
                }}
            >
                {gateState === "INITIALIZING" && (
                    <div style={{ padding: "40px 0" }}>
                        <i
                            className="fa-solid fa-spinner fa-spin"
                            style={{
                                fontSize: "48px",
                                color: "var(--spa-green)",
                                marginBottom: "20px",
                            }}
                        ></i>
                        <h2>Memuat Sistem...</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                            Memeriksa ketersediaan cabang dan sesi laci kasir.
                        </p>
                    </div>
                )}

                {gateState === "SELECT_BRANCH" && (
                    <div>
                        <div
                            style={{
                                width: "80px",
                                height: "80px",
                                background: "var(--spa-green-bg)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <i
                                className="fa-solid fa-store"
                                style={{ fontSize: "36px", color: "var(--spa-green)" }}
                            ></i>
                        </div>
                        <h2 style={{ marginBottom: "10px", fontSize: "24px" }}>Pilih Cabang</h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                marginBottom: "24px",
                            }}
                        >
                            Anda terdaftar di beberapa cabang. Pilih lokasi Anda bertugas saat ini.
                        </p>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px",
                                maxHeight: "300px",
                                overflowY: "auto",
                                paddingRight: "4px",
                            }}
                        >
                            {branches.map((b) => (
                                <button
                                    key={b.branchId}
                                    className="action-btn secondary"
                                    onClick={() => onSelectBranch(b)}
                                    style={{
                                        padding: "16px",
                                        fontSize: "15px",
                                        border: "2px solid var(--border-color)",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        fontWeight: 600,
                                    }}
                                >
                                    <i
                                        className="fa-solid fa-location-dot"
                                        style={{ color: "var(--spa-green)", marginRight: "10px" }}
                                    ></i>
                                    {b.branchName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {gateState === "FORCE_CLOSE" && activeSession && (
                    <div>
                        <div
                            style={{
                                width: "80px",
                                height: "80px",
                                background: "var(--accent-red-light)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <i
                                className="fa-solid fa-lock"
                                style={{ fontSize: "36px", color: "var(--accent-red)" }}
                            ></i>
                        </div>
                        <h2
                            style={{
                                marginBottom: "10px",
                                fontSize: "22px",
                                color: "var(--accent-red)",
                            }}
                        >
                            Sesi Laci Terkunci
                        </h2>
                        <div
                            style={{
                                background: "var(--bg-main)",
                                padding: "16px",
                                borderRadius: "12px",
                                marginBottom: "20px",
                                textAlign: "left",
                            }}
                        >
                            <p
                                style={{
                                    fontSize: "13px",
                                    color: "var(--text-muted)",
                                    marginBottom: "4px",
                                }}
                            >
                                Sesi aktif saat ini:
                            </p>
                            <div style={{ fontWeight: 700 }}>{activeSession.userName}</div>
                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                ID: {activeSession.sessionCode}
                            </div>
                        </div>
                        <p
                            style={{
                                color: "var(--text-primary)",
                                fontSize: "14px",
                                marginBottom: "24px",
                                lineHeight: 1.5,
                            }}
                        >
                            Laci masih digunakan oleh kasir sebelumnya. Anda wajib menghitung
                            dan menutup laci tersebut sebelum memulai shift baru.
                        </p>
                        <div style={{ textAlign: "left", marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                }}
                            >
                                Kas Aktual Fisik (Rp)
                            </label>
                            <input
                                type="number"
                                value={closingCash}
                                onChange={(e) => setClosingCash(e.target.value)}
                                placeholder="Total uang di laci"
                                className="search-input"
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    fontSize: "20px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                    marginBottom: "16px",
                                }}
                            />
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                }}
                            >
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
                            disabled={isProcessing}
                            style={{ width: "100%", background: "var(--accent-red)" }}
                        >
                            {isProcessing ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa-solid fa-power-off"></i> Tutup Sesi Lama
                                </>
                            )}
                        </button>
                    </div>
                )}

                {gateState === "OPEN_SESSION" && (
                    <div>
                        <div
                            style={{
                                width: "80px",
                                height: "80px",
                                background: "var(--spa-green-bg)",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 20px",
                            }}
                        >
                            <i
                                className="fa-solid fa-cash-register"
                                style={{ fontSize: "36px", color: "var(--spa-green)" }}
                            ></i>
                        </div>
                        <h2 style={{ marginBottom: "6px", fontSize: "24px" }}>
                            Buka Sesi Kasir
                        </h2>
                        <p
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "14px",
                                lineHeight: 1.6,
                                marginBottom: "24px",
                            }}
                        >
                            Cabang <b>{selectedBranch?.branchName}</b>. Masukkan modal uang
                            kembalian Anda.
                        </p>
                        <div style={{ textAlign: "left", marginBottom: "24px" }}>
                            <label
                                style={{
                                    display: "block",
                                    marginBottom: "8px",
                                    fontWeight: 600,
                                    fontSize: "13px",
                                }}
                            >
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
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    fontSize: "22px",
                                    textAlign: "right",
                                    fontWeight: 700,
                                }}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    gap: "8px",
                                    marginTop: "12px",
                                    flexWrap: "wrap",
                                    justifyContent: "center",
                                }}
                            >
                                {[200000, 500000, 1000000].map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setOpeningCash(amount.toString())}
                                        style={{
                                            padding: "8px 16px",
                                            fontSize: "13px",
                                            fontWeight: 600,
                                            borderRadius: "8px",
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            background:
                                                openingCash === amount.toString()
                                                    ? "var(--spa-green-bg)"
                                                    : "var(--bg-main)",
                                            color:
                                                openingCash === amount.toString()
                                                    ? "var(--spa-green)"
                                                    : "var(--text-secondary)",
                                            border:
                                                openingCash === amount.toString()
                                                    ? "2px solid var(--spa-green)"
                                                    : "2px solid var(--border-color)",
                                        }}
                                    >
                                        {formatCurrency(amount)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: "12px" }}>
                            <button
                                type="button"
                                className="action-btn secondary"
                                style={{ flex: 1, textAlign: "center" }}
                                onClick={onBack} // Panggil fungsi onBack
                            >
                                <i className="fa-solid fa-arrow-left"></i> Kembali
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={onOpenSession}
                                disabled={isProcessing}
                                style={{ flex: 1 }}
                            >
                                {isProcessing ? (
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-play"></i> Mulai Sesi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
        </div>
    );
}
