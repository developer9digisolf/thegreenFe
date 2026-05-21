"use client";

import { useState, useEffect, useCallback } from "react";
import { formatCurrency } from "@afx/utils/format";
import { GetMemberDetailService, GetMemberVouchersService } from "@afx/services/pos.service";

interface Props {
    memberId: number;
    // [TAMBAHAN] Masukkan nama cabang aktif sebagai default filter pencarian voucher
    defaultBranchSearch?: string; 
    onClose: () => void;
    onToast: (msg: string, type?: "success" | "error") => void;
}

export default function ModalMemberDetail({ memberId, defaultBranchSearch = "", onClose, onToast }: Props) {
    const [profileLoading, setProfileLoading] = useState(true);
    const [vouchersLoading, setVouchersLoading] = useState(false);
    const [member, setMember] = useState<any>(null);
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"profile" | "vouchers">("profile");
    
    // [STATE BARU] Untuk mengelola query parameter search secara dinamis
    const [voucherSearch, setVoucherSearch] = useState(defaultBranchSearch);

    // ── 1. Fetch Profil Member (Hanya sekali di awal) ───────────────────────
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const memRes = await GetMemberDetailService(memberId);
                if (memRes.success) setMember(memRes.data);
                else onToast(memRes.message || "Gagal memuat profil", "error");
            } catch {
                onToast("Terjadi kesalahan jaringan", "error");
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [memberId, onToast]);

    // ── 2. Fetch Voucher  ──────
    const fetchVouchers = useCallback(async () => {
        setVouchersLoading(true);
        try {
            // Langsung memanggil service dengan defaultBranchSearch
            const vouchRes = await GetMemberVouchersService(memberId, defaultBranchSearch || undefined, 1, 20);
            if (vouchRes.success) setVouchers(vouchRes.data || []);
        } catch {
            onToast("Gagal memuat data voucher", "error");
        } finally {
            setVouchersLoading(false);
        }
    }, [memberId, defaultBranchSearch, onToast]);

    // Panggil fetch voucher setiap kali tab berpindah ke "vouchers"
    useEffect(() => {
        if (activeTab === "vouchers") {
            fetchVouchers();
        }
    }, [activeTab, fetchVouchers]);

    if (profileLoading) {
        return (
            <div className="modal-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ background: "var(--bg-card)", padding: "40px", borderRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "32px", color: "var(--spa-green)" }} />
                    <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>Memuat data member...</span>
                </div>
            </div>
        );
    }

    if (!member) return null;

    return (
        <div className="modal-overlay" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", width: "100%", maxWidth: "800px", borderRadius: "24px", overflow: "hidden", display: "flex", flexDirection: "column", maxHeight: "90vh", boxShadow: "0 25px 50px rgba(0,0,0,0.25)" }}>
                
                {/* Header */}
                <div style={{ padding: "24px 32px", background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "48px", height: "48px", borderRadius: "16px", background: "var(--spa-green)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", fontWeight: 800 }}>
                            {(member.fullName || member.name || "M").charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800 }}>{member.fullName || member.name}</h2>
                            <div style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", fontFamily: "monospace" }}>{member.code}</div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "12px", width: "40px", height: "40px", cursor: "pointer", color: "var(--text-muted)", fontSize: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", padding: "0 32px", borderBottom: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                    <button onClick={() => setActiveTab("profile")} style={{ padding: "16px 24px", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", borderBottom: activeTab === "profile" ? "3px solid var(--spa-green)" : "3px solid transparent", color: activeTab === "profile" ? "var(--spa-green)" : "var(--text-muted)" }}>
                        <i className="fa-regular fa-id-badge" style={{ marginRight: "8px" }} /> Profil
                    </button>
                    <button onClick={() => setActiveTab("vouchers")} style={{ padding: "16px 24px", border: "none", background: "none", cursor: "pointer", fontWeight: 700, fontSize: "14px", borderBottom: activeTab === "vouchers" ? "3px solid var(--spa-green)" : "3px solid transparent", color: activeTab === "vouchers" ? "var(--spa-green)" : "var(--text-muted)" }}>
                        <i className="fa-solid fa-ticket" style={{ marginRight: "8px" }} /> Paket Voucher
                    </button>
                </div>

                {/* Content Area */}
                <div style={{ padding: "32px", overflowY: "auto", flex: 1, background: "var(--bg-card)" }}>
                    
                    {/* --- TAB: PROFIL --- */}
                    {activeTab === "profile" && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                            <div style={{ border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px" }}>
                                <h4 style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase" }}>Informasi Kontak</h4>
                                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <div><small style={{ color: "var(--text-muted)" }}>Telepon</small><div style={{ fontWeight: 600 }}>+{member.countryCode} {member.phone}</div></div>
                                    <div><small style={{ color: "var(--text-muted)" }}>Email</small><div style={{ fontWeight: 600 }}>{member.email || "-"}</div></div>
                                    <div><small style={{ color: "var(--text-muted)" }}>Alamat</small><div style={{ fontWeight: 600 }}>{member.address || "-"}</div></div>
                                </div>
                            </div>
                            <div style={{ border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", background: "var(--bg-main)" }}>
                                <h4 style={{ margin: "0 0 16px 0", fontSize: "13px", color: "var(--text-muted)", textTransform: "uppercase" }}>Status Finansial</h4>
                                <div style={{ background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Saldo Kredit</div>
                                    <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--spa-green)" }}>{formatCurrency(member.creditBalance || 0)}</div>
                                </div>
                                <div style={{ fontSize: "12px" }}>Total Belanja: <b>{formatCurrency(member.totalSpent || 0)}</b></div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB: VOUCHERS --- */}
                    {activeTab === "vouchers" && (
                        <div>
                            {/* [UI BARU] Indikator Filter Cabang (Read-only) */}
                            <div style={{ 
                                marginBottom: "20px", 
                                background: "rgba(16,185,129,0.08)", 
                                border: "1px solid rgba(16,185,129,0.2)",
                                padding: "12px 16px",
                                borderRadius: "12px",
                                display: "flex", 
                                alignItems: "center", 
                                gap: "10px",
                                color: "var(--spa-green)"
                            }}>
                                <i className="fa-solid fa-location-dot" />
                                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                                    Paket voucher ini berlaku untuk cabang: <span style={{ fontWeight: 800 }}>{defaultBranchSearch || "Semua Cabang"}</span>
                                </span>
                            </div>

                            {vouchersLoading ? (
                                <div style={{ textAlign: "center", padding: "40px" }}>
                                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: "24px", color: "var(--spa-green)" }} />
                                    <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "8px" }}>Memuat voucher cabang...</p>
                                </div>
                            ) : vouchers.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0" }}>
                                    <i className="fa-solid fa-ticket-simple" style={{ fontSize: "36px", color: "var(--text-muted)", opacity: 0.4, marginBottom: "10px" }} />
                                    <h4>Tidak Ada Voucher</h4>
                                    <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                                        Member ini tidak memiliki paket voucher yang valid untuk digunakan di cabang {defaultBranchSearch}.
                                    </p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                                    {vouchers.map((v) => {
                                        const sisa = v.totalSession - v.usedSession;
                                        return (
                                            <div key={v.id} style={{ border: "1px solid var(--border-color)", borderRadius: "16px", overflow: "hidden" }}>
                                                <div style={{ padding: "20px", background: "var(--bg-main)", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between" }}>
                                                    <div>
                                                        <h3 style={{ margin: "0 0 4px 0", fontSize: "16px", color: "var(--spa-green)" }}>{v.name}</h3>
                                                        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "4px" }}>{v.serviceName}</div>
                                                        <small style={{ color: "var(--text-muted)" }}>Masa Berlaku s/d {new Date(v.validTo).toLocaleDateString("id-ID")}</small>
                                                    </div>
                                                    <div style={{ textAlign: "right" }}>
                                                        <small style={{ color: "var(--text-muted)" }}>Sisa Sesi</small>
                                                        <div style={{ fontSize: "24px", fontWeight: 800 }}>{sisa} / <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>{v.totalSession}</span></div>
                                                    </div>
                                                </div>
                                                <div style={{ padding: "16px 20px" }}>
                                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" }}>
                                                        {v.packageVouchers?.map((codeObj: any) => (
                                                            <div key={codeObj.guid} style={{ padding: "8px 12px", borderRadius: "8px", background: codeObj.status === "Active" ? "rgba(16,185,129,0.05)" : "var(--bg-main)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between" }}>
                                                                <span style={{ fontFamily: "monospace", fontWeight: 700, textDecoration: codeObj.status === "Active" ? "none" : "line-through" }}>{codeObj.voucherCode}</span>
                                                                <span style={{ fontSize: "11px", color: codeObj.status === "Active" ? "#10b981" : "#94a3b8" }}>{codeObj.status}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}