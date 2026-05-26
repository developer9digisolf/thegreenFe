"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useApi } from "@afx/utils/useApi";
import { formatCurrency } from "@afx/utils/format";
import type { Toast } from "@afx/interfaces/pos.iface";
import { usePosSession } from "@afx/hooks/pos/usePosSession";
import { usePosData, CartItem } from "@afx/hooks/pos/usePosData";
import { usePayment } from "@afx/hooks/pos/usePayment";
import GatekeeperScreen from "@afx/components/pos/GatekeeperScreen";
import SaleHistoryTab from "@afx/components/pos/SaleHistoryTab";
import BookingTab from "@afx/components/pos/BookingTab";
import ModalPayment from "@afx/components/pos/ModalPayment";
import ModalMemberAdd from "@afx/components/pos/ModalMemberAdd";
import ModalMemberDetail from "@afx/components/pos/ModalMemberDetail";
import SessionTab from "@afx/components/pos/SessionTab";    
import {
    CloseCashierSessionService,
    GetRoomsService,
    GetTherapistsTodayService,
    ValidateVoucherService,
    RedeemVoucherPosService,
} from "@afx/services/pos.service";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type PosMode = "session" | "voucher" | "credit" | "redeem" | "sale" | "booking" | "session_list";
type DiscountType = "fixed" | "percent";

interface ValidatedVoucher {
    voucherCode: string;
    memberName?: string;
    serviceName?: string;
    expiredAt?: string;
    usageLeft?: number;
    [key: string]: any;
}

// ─────────────────────────────────────────────
// Sub-component: Session Success Modal (QR CODE)
// ─────────────────────────────────────────────
function SessionSuccessModal({ session, onClose }: { session: any; onClose: () => void }) {
    if (!session || !session.sessionCode) return null;

    // Generate QR Code menggunakan bwipjs-api berdasarkan sessionCode
    const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=qrcode&text=${encodeURIComponent(session.sessionCode)}&scale=3&rotate=N&backgroundcolor=ffffff`;

    return (
        <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1400, backdropFilter: "blur(4px)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--bg-card)", borderRadius: "24px", padding: "40px", width: "min(400px, 92vw)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", textAlign: "center" }}>
                <div style={{ width: "70px", height: "70px", background: "var(--spa-green-bg)", color: "var(--spa-green)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 20px" }}>
                    <i className="fa-solid fa-circle-check" />
                </div>
                
                <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Sesi Berhasil Dibuat!</h2>
                <p style={{ margin: "8px 0 24px", color: "var(--text-muted)", fontSize: "13px" }}>Arahkan pelanggan ke terapis dengan menggunakan kode QR berikut.</p>
                
                <div style={{ background: "#fff", padding: "20px", borderRadius: "16px", border: "1px solid var(--border-color)", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                    <img 
                        src={barcodeUrl} 
                        alt={`QR ${session.sessionCode}`} 
                        style={{ width: "160px", height: "160px", objectFit: "contain" }} 
                    />
                    <div style={{ fontFamily: "monospace", fontSize: "16px", fontWeight: 800, color: "var(--spa-green)", letterSpacing: "1px" }}>
                        {session.sessionCode}
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px", textAlign: "left" }}>
                    <div style={{ background: "var(--bg-main)", padding: "12px 14px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Terapis</div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>{session.therapistName || "—"}</div>
                    </div>
                    <div style={{ background: "var(--bg-main)", padding: "12px 14px", borderRadius: "12px" }}>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>Ruangan</div>
                        <div style={{ fontSize: "13px", fontWeight: 700 }}>{session.roomName || "—"}</div>
                    </div>
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

// ─────────────────────────────────────────────
// Sub-component: Redeem Scan Screen
// ─────────────────────────────────────────────
interface RedeemScanScreenProps {
    isValidating: boolean;
    onScan: (code: string) => void;
}

function RedeemScanScreen({ isValidating, onScan }: RedeemScanScreenProps) {
    const [code, setCode] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && code.trim()) {
            e.preventDefault();
            onScan(code.trim().toUpperCase());
        }
    };

    const handleSubmit = () => {
        if (code.trim()) onScan(code.trim().toUpperCase());
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "28px", padding: "40px 24px", maxWidth: "460px", margin: "0 auto" }}>
            <div style={{ width: "100px", height: "100px", background: "var(--spa-green-bg)", borderRadius: "28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fa-solid fa-qrcode" style={{ fontSize: "48px", color: "var(--spa-green)" }} />
            </div>

            <div style={{ textAlign: "center" }}>
                <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: 800 }}>Redeem Voucher</h2>
                <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "14px", lineHeight: 1.6 }}>
                    Arahkan scanner ke QR Code pelanggan,
                    <br />
                    atau ketik kode secara manual lalu tekan Enter.
                </p>
            </div>

            <div style={{ width: "100%", background: "var(--bg-card)", border: "2px dashed var(--spa-green)", borderRadius: "18px", padding: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "10px" }}>Kode Voucher</label>
                <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ position: "relative", flex: 1 }}>
                        <i className="fa-solid fa-ticket" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "14px" }} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            onKeyDown={handleKeyDown}
                            disabled={isValidating}
                            placeholder="Contoh: PKGDKPDE"
                            style={{ width: "100%", padding: "13px 14px 13px 40px", fontSize: "16px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "2px", borderRadius: "12px", border: "1.5px solid var(--border-color)", background: "var(--bg-main)", color: "var(--text-primary)", outline: "none", textTransform: "uppercase", transition: "border-color 0.2s" }}
                        />
                    </div>
                    <button
                        className="action-btn primary"
                        onClick={handleSubmit}
                        disabled={isValidating || !code.trim()}
                        style={{ padding: "0 20px", borderRadius: "12px", fontSize: "14px", flexShrink: 0, opacity: isValidating || !code.trim() ? 0.5 : 1 }}
                    >
                        {isValidating ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-arrow-right" />}
                    </button>
                </div>
            </div>

            {isValidating && (
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: "8px", color: "var(--spa-green)" }} />
                    Mengecek status voucher...
                </p>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// Sub-component: Redeem Confirmation Modal
// ─────────────────────────────────────────────
interface RedeemConfirmModalProps {
    voucher: ValidatedVoucher;
    therapists: any[];
    rooms: any[];
    masterLoading: boolean;
    isProcessing: boolean;
    onConfirm: (therapistId: string, roomId: string, notes: string) => void;
    onCancel: () => void;
}

function RedeemConfirmModal({ voucher, therapists, rooms, masterLoading, isProcessing, onConfirm, onCancel }: RedeemConfirmModalProps) {
    const [therapistId, setTherapistId] = useState("");
    const [roomId, setRoomId] = useState("");
    const [notes, setNotes] = useState("");

    const canSubmit = therapistId && roomId && !isProcessing && !masterLoading;

    return (
        <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, backdropFilter: "blur(4px)" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: "min(520px, 95vw)", background: "var(--bg-card)", borderRadius: "24px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                
                <div style={{ background: "var(--gradient-spa)", padding: "20px 24px", display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "48px", height: "48px", background: "rgba(255,255,255,0.2)", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <i className="fa-solid fa-check-circle" style={{ fontSize: "24px", color: "white" }} />
                    </div>
                    <div>
                        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "11px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>Voucher Valid</div>
                        <div style={{ color: "white", fontSize: "18px", fontWeight: 800, fontFamily: "monospace", letterSpacing: "1px" }}>{voucher.voucherCode}</div>
                    </div>
                    <button onClick={onCancel} style={{ marginLeft: "auto", background: "rgba(255,255,255,0.15)", border: "none", borderRadius: "10px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", fontSize: "16px" }}>
                        <i className="fa-solid fa-xmark" />
                    </button>
                </div>

                <div style={{ margin: "16px 24px 0", padding: "16px", background: "var(--bg-main)", borderRadius: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {[
                        { label: "Pemilik", value: voucher.memberName ?? "—", icon: "fa-user" },
                        { label: "Layanan", value: voucher.serviceName ?? "—", icon: "fa-spa" },
                        { label: "Status", value: voucher.isUsed ? "Sudah Dipakai" : "Belum Dipakai", icon: voucher.isUsed ? "fa-circle-xmark" : "fa-circle-check" },
                        { label: "Berlaku Hingga", value: voucher.expiredAt ? new Date(voucher.expiredAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—", icon: "fa-calendar" },
                    ].map(({ label, value, icon }) => (
                        <div key={label}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                                <i className={`fa-solid ${icon}`} style={{ fontSize: "11px", color: "var(--spa-green)" }} />
                                <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</span>
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
                        </div>
                    ))}
                </div>

                <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    {masterLoading ? (
                        <div style={{ display: "flex", justifyContent: "center", padding: "16px", color: "var(--text-muted)", fontSize: "13px", gap: "10px" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ color: "var(--spa-green)" }} /> Memuat data cabang...
                        </div>
                    ) : (
                        <>
                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>Therapist * {therapists.length === 0 && <span style={{ color: "var(--accent-red)", fontWeight: 400 }}>(tidak ada data)</span>}</label>
                                <select value={therapistId} onChange={(e) => setTherapistId(e.target.value)} disabled={therapists.length === 0} className="search-input" style={{ width: "100%", padding: "11px 14px", cursor: "pointer" }}>
                                    <option value="">— Pilih Therapist —</option>
                                    {therapists.map((t: any) => <option key={t.id} value={t.id}>{t.employeeName ?? t.name ?? `Therapist #${t.id}`}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>Ruangan * {rooms.length === 0 && <span style={{ color: "var(--accent-red)", fontWeight: 400 }}>(tidak ada data)</span>}</label>
                                <select value={roomId} onChange={(e) => setRoomId(e.target.value)} disabled={rooms.length === 0} className="search-input" style={{ width: "100%", padding: "11px 14px", cursor: "pointer" }}>
                                    <option value="">— Pilih Ruangan —</option>
                                    {rooms.map((r: any) => <option key={r.id} value={r.id}>{r.name ?? r.roomName ?? `Ruangan #${r.id}`} {r.statusDisplay ? ` (${r.statusDisplay})` : ""}</option>)}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", marginBottom: "6px" }}>Catatan <span style={{ fontWeight: 400 }}>(opsional)</span></label>
                                <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Preferensi pelanggan, dll." className="search-input" style={{ width: "100%", padding: "11px 14px" }} />
                            </div>
                        </>
                    )}

                    <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                        <button className="action-btn secondary" onClick={onCancel} style={{ flex: 1 }}>Batal</button>
                        <button 
                            className="action-btn primary" 
                            onClick={() => onConfirm(therapistId, roomId, notes)} 
                            disabled={!canSubmit} 
                            style={{ flex: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", opacity: !canSubmit ? 0.5 : 1 }}
                        >
                            {isProcessing ? <><i className="fa-solid fa-spinner fa-spin" /> Memproses...</> : <><i className="fa-solid fa-play" /> Buat Sesi</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Component: POSPage
// ─────────────────────────────────────────────

export default function POSPage() {
    const { get, post } = useApi();

    // ── Core hooks ─────────────────────────────────────────────────────────
    const session = usePosSession(showToastCb);
    const pos     = usePosData(showToastCb);
    const payment = usePayment(showToastCb);

    // ── Toast ──────────────────────────────────────────────────────────────
    const [toast, setToast] = useState<Toast | null>(null);

    function showToastCb(message: string, type: "success" | "error" | "info" = "success") {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }
    const showToast = useCallback(showToastCb, []);

    // ── UI State ────────────────────────────────────────────────────────────
    const [mode, setMode]                                   = useState<PosMode>("session");
    const [selectedCategory, setSelectedCategory]           = useState<number | null>(null);
    const [serviceSearch, setServiceSearch]                 = useState("");
    const [selectedPackage, setSelectedPackage]             = useState<number | null>(null);
    const [showDiscountModal, setShowDiscountModal]         = useState(false);
    const [discountType, setDiscountType]                   = useState<DiscountType>("fixed");
    const [discountValue, setDiscountValue]                 = useState("");
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [actualClosingCash, setActualClosingCash]         = useState("");
    const [isClosingSession, setIsClosingSession]           = useState(false);
    const [isCheckoutProcessing, setIsCheckoutProcessing]   = useState(false);
    const [showMemberModal, setShowMemberModal]             = useState(false);
    const [detailMemberId, setDetailMemberId]               = useState<number | null>(null);
    const [saleRefreshKey, setSaleRefreshKey]               = useState(0);
    const [bookingCount, setBookingCount]                   = useState(0);

    // ── Redeem State ───────────────────────────────────────────────────────
    const [isValidatingVoucher, setIsValidatingVoucher]   = useState(false);
    const [validatedVoucher, setValidatedVoucher]         = useState<ValidatedVoucher | null>(null);
    const [isRedeemProcessing, setIsRedeemProcessing]     = useState(false);
    const [redeemTherapists, setRedeemTherapists]         = useState<any[]>([]);
    const [redeemRooms, setRedeemRooms]                   = useState<any[]>([]);
    const [redeemMasterLoading, setRedeemMasterLoading]   = useState(false);
    const [redeemCreatedSession, setRedeemCreatedSession] = useState<any | null>(null);

    // ── Computed ───────────────────────────────────────────────────────────
    const activeBranchId = useMemo<number | null>(
        () =>
            (session.activeSession as any)?.branchId ??
            (session.selectedBranch as any)?.branchId ??
            (session.selectedBranch as any)?.id ??
            (pos.initData?.currentSession as any)?.branchId ??
            null,
        [session.activeSession, session.selectedBranch, pos.initData]
    );

    const currentActiveSession =
        pos.initData?.currentSession ||
        session.activeSession ||
        (session.selectedBranch
            ? session.activeSessionsMap[(session.selectedBranch as any).branchId] ||
              session.activeSessionsMap[(session.selectedBranch as any).id]
            : null) ||
        Object.values(session.activeSessionsMap).find((s) => s != null) ||
        null;

    const hasOpenSession  = !!currentActiveSession;
    const filteredServices = pos.getFilteredServices(null, serviceSearch);
    const hasCartItems    = pos.cartItems?.length > 0;

    // ── Preload Therapists & Rooms when Redeem tab opens ──────────────────
    useEffect(() => {
        if (mode !== "redeem" || !activeBranchId) return;

        setValidatedVoucher(null);
        setRedeemMasterLoading(true);

        Promise.all([
            GetRoomsService(activeBranchId as number),
            GetTherapistsTodayService(activeBranchId as number),
        ])
            .then(([roomRes, therRes]) => {
                if (roomRes.success) setRedeemRooms(roomRes.data ?? []);
                if (therRes.success) setRedeemTherapists(therRes.data ?? []);
            })
            .finally(() => setRedeemMasterLoading(false));
    }, [mode, activeBranchId]);

    // ── Redeem Handlers ────────────────────────────────────────────────────

    // 1. Validasi Kode Voucher
    const handleValidateVoucher = useCallback(
        async (code: string) => {
            setIsValidatingVoucher(true);
            try {
                const res = await ValidateVoucherService(code);

                if (!res.success || !res.data) {
                    showToast(res.message ?? "Voucher tidak valid atau sudah kadaluarsa", "error");
                    return;
                }

                const d = res.data;
                const memberFromPanel =
                    pos.selectedMember?.id === d.memberId
                        ? pos.selectedMember
                        : pos.memberResults.find((m) => m.id === d.memberId);

                const memberName =
                    memberFromPanel?.name ??
                    (memberFromPanel as any)?.fullName ??
                    (d.memberId ? `Member #${d.memberId}` : "—");

                setValidatedVoucher({
                    voucherCode: code,
                    ...d,
                    memberName,
                    serviceName: d.serviceVariant?.service?.name
                        ? `${d.serviceVariant.service.name} – ${d.serviceVariant.name}`
                        : d.servicePackage?.name ?? "—",
                    usageLeft: d.isUsed ? 0 : 1,
                    expiredAt: d.expiredAt ?? null,
                });
            } finally {
                setIsValidatingVoucher(false);
            }
        },
        [showToast, pos.selectedMember, pos.memberResults]
    );

    // 2. Submit Pembuatan Sesi (Redeem)
    const handleConfirmRedeem = useCallback(
        async (therapistId: string, roomId: string, notes: string) => {
            if (!validatedVoucher || !activeBranchId) return;

            setIsRedeemProcessing(true);
            try {
                const payload = {
                    VoucherCode: validatedVoucher.voucherCode,
                    BranchId: activeBranchId,
                    TherapistId: parseInt(therapistId),
                    RoomId: parseInt(roomId),
                    Notes: notes || null,
                };
                
                const res = await RedeemVoucherPosService(payload);

                if (res.success) {
                    // Berdasarkan JSON yang diberikan: res.data.session terdapat sessionCode nya
                    const sessionData = res.data?.session || res.data;

                    const therapistName =
                        redeemTherapists.find((t) => t.id === parseInt(therapistId))?.employeeName ??
                        `Therapist #${therapistId}`;

                    const roomName =
                        redeemRooms.find((r) => r.id === parseInt(roomId))?.name ??
                        `Ruangan #${roomId}`;

                    setValidatedVoucher(null); // Tutup Modal Konfirmasi
                    
                    // Set State untuk membuka Modal QR Code
                    setRedeemCreatedSession({
                        ...sessionData,
                        therapistName,
                        roomName,
                    });
                    
                    setSaleRefreshKey((k) => k + 1); // Refresh History Table
                } else {
                    showToast(res.message ?? "Gagal memproses redeem", "error");
                }
            } finally {
                setIsRedeemProcessing(false);
            }
        },
        [validatedVoucher, activeBranchId, redeemTherapists, redeemRooms, showToast]
    );

    const handleCancelRedeem = useCallback(() => {
        setValidatedVoucher(null);
    }, []);

    // ── Booking Count ──────────────────────────────────────────────────────
    const fetchBookingCount = useCallback(async (startDate?: string, endDate?: string) => {
        const bId = activeBranchId ?? (currentActiveSession as any)?.branchId ?? null;
        if (!bId) { 
            setBookingCount(0); 
            return; 
        }

        try {
            // Jika tidak ada parameter tanggal, gunakan hari ini sebagai default
            const now = new Date();
            const today = now.toISOString().split("T")[0];
            
            const start = startDate ?? today;
            const end = endDate ?? today;

            const res = await get(
                `pos/bookings/floating-numbers?StartDate=${start}&EndDate=${end}&BranchId=${bId}`
            );

            if (res?.success || res?.meta?.success) {
                setBookingCount(res.data?.bookingCount ?? 0);
            }
        } catch (err) {
            console.error("fetchBookingCount error:", err);
            setBookingCount(0);
        }
    }, [activeBranchId, currentActiveSession, get]);

    useEffect(() => {
        if (activeBranchId) fetchBookingCount();
    }, [activeBranchId, fetchBookingCount]);

    // ── Cart / Discount Handlers ───────────────────────────────────────────
    const handleApplyDiscount = useCallback(() => {
        const val = parseFloat(discountValue);
        if (!val || val <= 0) return;
        pos.setCartDiscount(
            discountType === "fixed" ? val : Math.round((pos.cartSubtotal * val) / 100)
        );
        setShowDiscountModal(false);
        setDiscountValue("");
        showToast("Diskon diterapkan");
    }, [discountType, discountValue, pos, showToast]);

    // ── Session Handlers ───────────────────────────────────────────────────
    const handleCloseSession = async () => {
        if (!actualClosingCash || parseFloat(actualClosingCash) < 0) {
            showToast("Masukkan kas yang valid", "error");
            return;
        }
        if (!currentActiveSession) {
            showToast("Data sesi tidak ditemukan", "error");
            return;
        }
        setIsClosingSession(true);
        try {
            const response = await CloseCashierSessionService(
                currentActiveSession.id,
                parseFloat(actualClosingCash)
            );
            if (response.success) {
                setShowCloseSessionModal(false);
                setActualClosingCash("");
                pos.clearCart();
                showToast("Sesi ditutup, memuat ulang sistem...", "success");
                setTimeout(() => window.location.reload(), 1000);
            } else {
                showToast(response.message ?? "Gagal menutup sesi", "error");
            }
        } catch {
            showToast("Gagal menutup sesi", "error");
        } finally {
            setIsClosingSession(false);
        }
    };

    const handleProcessPayment = async () => {
        if (!hasCartItems) return;
        setIsCheckoutProcessing(true);

        if (!activeBranchId) {
            showToast("Branch ID tidak ditemukan. Mohon pilih cabang kembali.", "error");
            setIsCheckoutProcessing(false);
            return;
        }

        if ((mode === "voucher" || mode === "credit") && !pos.selectedMember) {
            showToast("Pilih Member terlebih dahulu", "error");
            setIsCheckoutProcessing(false);
            return;
        }

        const payload = {
            SaleType: mode === "voucher" ? 1 : mode === "credit" ? 2 : 0,
            BranchId: activeBranchId,
            MemberId: pos.selectedMember?.id ?? null,
            PaymentMethodId: payment.payments[0]?.paymentMethodId ?? null,
            notes: payment.paymentReference ?? "",
            amountPaid: pos.cartGrandTotal,
            Items: pos.cartItems.map((item: any) => ({
                ItemType: item.itemType,
                BranchServiceVariantId: item.branchServiceVariantId ?? item.serviceVariantId ?? null,
                ServicePackageId: item.packageId ?? item.servicePackageId ?? null,
                CreditPackageId: item.creditPackageId ?? null,
                Notes: item.notes ?? null,
                AppointmentDate: item.appointmentDate ?? null,
                StartTime: item.startTime ?? null,
                AppointmentNotes: item.appointmentNotes ?? null,
            })),
        };

        try {
            const response = await post("pos/sales", payload);
            if (response.success) {
                showToast("Pembayaran Berhasil Disimpan!", "success");
                pos.clearCart();
                payment.closePaymentModal();
                setSaleRefreshKey((k) => k + 1);
            } else {
                showToast(response.message ?? "Gagal menyimpan transaksi", "error");
            }
        } catch {
            showToast("Terjadi kesalahan jaringan", "error");
        } finally {
            setIsCheckoutProcessing(false);
        }
    };

    const handleBack = useCallback(() => {
        if (session.branches.length > 1) session.setGateState("SELECT_BRANCH");
        else window.location.href = "/dashboard";
    }, [session]);

    // ── Gatekeeper Guard ───────────────────────────────────────────────────
    if (session.gateState !== "READY") {
        return (
            <GatekeeperScreen
                gateState={session.gateState}
                branches={session.branches}
                selectedBranch={session.selectedBranch}
                activeSession={session.activeSession}
                activeSessionsMap={session.activeSessionsMap}
                activeBranchId={activeBranchId}
                openingCash={session.openingCash}
                setOpeningCash={session.setOpeningCash}
                closingCash={session.closingCash}
                setClosingCash={session.setClosingCash}
                cashMovementReason={session.cashMovementReason}
                setCashMovementReason={session.setCashMovementReason}
                isProcessing={session.isProcessing}
                onSelectBranch={session.handleSelectBranch}
                onForceClose={async () => {
                    const success = await session.handleForceCloseSession();
                    if (success) {
                        showToast("Sesi berhasil ditutup. Memuat ulang sistem...", "success");
                        setTimeout(() => window.location.reload(), 1200);
                    }
                }}
                onOpenSession={async () => {
                    const alreadyHasSession = Object.values(session.activeSessionsMap).some(
                        (s) => s != null
                    );
                    if (alreadyHasSession) {
                        showToast("Masih ada sesi aktif.", "error");
                        return;
                    }

                    await session.handleOpenSession(async (branchId: number) => {
                        session.setGateState("READY"); // ← pindah ke sini, sebelum loadInitData
                        await pos.loadInitData(branchId);
                    });

                    showToast("Sesi baru berhasil dibuka.", "success");
                }}
                onContinueSession={async (branch: any) => {
                    const bId = branch.branchId ?? branch.id;
                    session.setSelectedBranch(branch);
                    session.setGateState("READY");
                    await pos.loadInitData(bId);
                    showToast("Sesi aktif ditemukan. Mengembalikan data kasir...", "info");
                }}
                toast={toast}
                onBack={handleBack}
            />
        );
    }

    // ── Tab config ─────────────────────────────────────────────────────────
    const TABS: { id: PosMode; icon: string; label: string }[] = [
        { id: "session", icon: "fa-spa",           label: "Layanan"       },
        { id: "voucher", icon: "fa-ticket",        label: "Paket Voucher" },
        { id: "credit",  icon: "fa-wallet",        label: "Top Up Kredit" },
        { id: "redeem",  icon: "fa-qrcode",        label: "Redeem"        },
        { id: "sale",    icon: "fa-tag",           label: "Penjualan"     },
        { id: "booking", icon: "fa-calendar-days", label: "Booking"       },
        { id: "session_list", icon: "fa-bed-pulse",     label: "Daftar Sesi"   },
    ];

    // ── Render ─────────────────────────────────────────────────────────────
    return (
        <div className="pos-container">

            {/* Toast */}
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
                    />
                    <span>{toast.message}</span>
                </div>
            )}

            <div className="pos-main">
                {/* ── HEADER ──────────────────────────────────────────────── */}
                <header className="pos-header">
                    <Link href="/dashboard" className="pos-logo">
                        <div className="pos-logo-icon1">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                style={{ width: "40px", height: "40px", objectFit: "contain" }}
                            />
                        </div>
                        <div className="pos-logo-text">The <span>Green</span> Spa</div>
                    </Link>

                    {hasOpenSession && currentActiveSession && (
                        <div className="pos-header-center">
                            <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "13px" }}>
                                <div
                                    style={{
                                        display: "flex", alignItems: "center", gap: "8px",
                                        background: "rgba(16,185,129,0.1)", padding: "6px 14px",
                                        borderRadius: "20px", color: "var(--spa-green)", fontWeight: 600,
                                    }}
                                >
                                    <i className="fa-solid fa-store" />
                                    <span>
                                        {session.selectedBranch?.branchName ||
                                            (session.selectedBranch as any)?.name ||
                                            currentActiveSession.branchName ||
                                            "Cabang Aktif"}
                                    </span>
                                    <span style={{ opacity: 0.4 }}>|</span>
                                    <span style={{ fontSize: "12px", fontFamily: "monospace" }}>
                                        {currentActiveSession.sessionCode}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
                                    <i className="fa-solid fa-user-circle" style={{ color: "var(--text-muted)", fontSize: "16px" }} />
                                    <span>{currentActiveSession.userName ?? "Kasir"}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700 }}>
                                    <i className="fa-solid fa-wallet" style={{ color: "var(--text-muted)" }} />
                                    <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "12px" }}>Kas:</span>
                                    <span>
                                        {formatCurrency(
                                            currentActiveSession.expectedClosingCash ??
                                            currentActiveSession.openingCash ??
                                            0
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pos-header-actions">
                        {hasOpenSession && (
                            <button
                                className="header-btn"
                                title="Tutup Sesi"
                                onClick={() => setShowCloseSessionModal(true)}
                                style={{ color: "var(--accent-red)" }}
                            >
                                <i className="fa-solid fa-power-off" />
                            </button>
                        )}
                        <button className="header-btn scan" onClick={() => setMode("redeem")}>
                            <i className="fa-solid fa-qrcode" /> Scan
                        </button>
                    </div>
                </header>

                {/* ── CONTENT ─────────────────────────────────────────────── */}
                <div className="pos-content">

                    {/* LEFT: Member Panel */}
                    <aside className="member-panel">
                        <div className="member-search" style={{ position: "relative" }}>
                            <div className="member-search-row">
                                <div className="search-input-wrapper" style={{ position: "relative", width: "100%" }}>
                                    <i className="fa-solid fa-magnifying-glass" />
                                    <input
                                        type="text"
                                        className="search-input"
                                        placeholder="Cari member..."
                                        value={pos.memberSearch}
                                        onChange={(e) => pos.setMemberSearch(e.target.value)}
                                        onFocus={() => pos.setShowMemberDropdown(true)}
                                        style={{ width: "100%", paddingLeft: "40px" }}
                                    />
                                </div>
                                <button
                                    className="btn-add-member"
                                    onClick={() => setShowMemberModal(true)}
                                    title="Tambah Member Baru"
                                >
                                    <i className="fa-solid fa-plus" />
                                </button>
                            </div>
                        </div>

                        <div className="member-info" style={{ padding: "0 16px", flex: 1, overflowY: "auto" }}>
                            <div
                                style={{
                                    fontSize: "11px", fontWeight: 700, color: "var(--text-muted)",
                                    textTransform: "uppercase", letterSpacing: "0.5px",
                                    marginBottom: "12px", marginTop: "10px",
                                }}
                            >
                                {pos.memberSearch ? "Hasil Pencarian" : "Member Terdaftar"}
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {pos.memberResults.length > 0 ? (
                                    pos.memberResults.map((member) => {
                                        const isActive = pos.selectedMember?.id === member.id;
                                        const displayName = member.name || (member as any).fullName || "M";
                                        return (
                                            <div
                                                key={member.id}
                                                onClick={() => pos.setSelectedMember(isActive ? null : member)}
                                                className={`member-mini-card ${isActive ? "active" : ""}`}
                                                style={{
                                                    padding: "12px", borderRadius: "16px",
                                                    background: isActive ? "var(--gradient-spa)" : "var(--bg-card)",
                                                    border: isActive ? "none" : "1px solid var(--border-color)",
                                                    color: isActive ? "white" : "var(--text-primary)",
                                                    cursor: "pointer", transition: "all 0.2s ease",
                                                    display: "flex", alignItems: "center", gap: "12px",
                                                    boxShadow: isActive ? "0 8px 16px rgba(61,107,95,0.25)" : "none",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "40px", height: "40px", borderRadius: "12px",
                                                        background: isActive ? "rgba(255,255,255,0.2)" : "var(--spa-green-bg)",
                                                        color: isActive ? "white" : "var(--spa-green)",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontWeight: 800, fontSize: "16px",
                                                    }}
                                                >
                                                    {displayName.charAt(0).toUpperCase()}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                        {displayName === "M" ? "No Name" : displayName}
                                                    </div>
                                                    <div style={{ fontSize: "12px", opacity: isActive ? 0.8 : 1, color: isActive ? "white" : "var(--text-muted)" }}>
                                                        {member.phone || "No phone"}
                                                    </div>
                                                </div>
                                                {isActive && (
                                                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setDetailMemberId(member.id as number); }}
                                                            title="Lihat Detail & Voucher"
                                                            style={{
                                                                width: "28px", height: "28px", borderRadius: "8px",
                                                                background: "white", color: "var(--spa-green)",
                                                                border: "none", display: "flex", alignItems: "center",
                                                                justifyContent: "center", fontSize: "12px",
                                                                cursor: "pointer", boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                                            }}
                                                        >
                                                            <i className="fa-regular fa-eye" />
                                                        </button>
                                                        <div
                                                            style={{
                                                                width: "24px", height: "24px", borderRadius: "50%",
                                                                background: "rgba(255,255,255,0.2)",
                                                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px",
                                                            }}
                                                        >
                                                            <i className="fa-solid fa-check" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                                        <i className="fa-solid fa-user-slash" style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.3 }} />
                                        <p style={{ fontSize: "12px" }}>Tidak ada member ditemukan</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* CENTER: Main Area */}
                    <div className="service-area">

                        {/* Tab Navigation */}
                        <div className="service-categories" style={{ gap: "8px" }}>
                            {TABS.map(({ id, icon, label }) => (
                                <button
                                    key={id}
                                    className={`pos-tab ${mode === id ? "active" : ""}`}
                                    onClick={() => setMode(id)}
                                    style={{
                                        padding: "10px 20px",
                                        position: "relative",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <i className={`fa-solid ${icon}`} />
                                    <span>{label}</span>
                                    {id === "booking" && bookingCount > 0 && (
                                        <span
                                            style={{
                                                background: "var(--accent-red)", color: "white",
                                                fontSize: "10px", fontWeight: 700,
                                                borderRadius: "10px", padding: "2px 6px",
                                                minWidth: "18px", height: "18px",
                                                display: "flex", alignItems: "center", justifyContent: "center",
                                                lineHeight: 1, boxShadow: "0 2px 5px rgba(239,68,68,0.3)",
                                            }}
                                        >
                                            {bookingCount}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* ── Tab: Layanan ──────────────────────────────────── */}
                        {mode === "session" && (
                            <>
                                <div className="service-categories">
                                    <button
                                        className={`category-chip ${selectedCategory === null ? "active" : ""}`}
                                        onClick={() => {
                                            const bId = activeBranchId ?? (currentActiveSession as any)?.branchId ?? null;
                                            if (!bId) return;
                                            setSelectedCategory(null);
                                            pos.loadServicesByCategory(bId, null);
                                        }}
                                    >
                                        Semua
                                    </button>
                                    {pos.categoriesLoading ? (
                                        <span style={{ fontSize: "12px", color: "var(--text-muted)", padding: "6px 10px" }}>
                                            <i className="fa-solid fa-spinner fa-spin" /> Memuat...
                                        </span>
                                    ) : (
                                        pos.categories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                className={`category-chip ${selectedCategory === cat.id ? "active" : ""}`}
                                                onClick={() => {
                                                    const bId = activeBranchId ?? (currentActiveSession as any)?.branchId ?? null;
                                                    if (!bId) return;
                                                    setSelectedCategory(cat.id);
                                                    pos.loadServicesByCategory(bId, cat.id);
                                                }}
                                            >
                                                {cat.icon && <i className={`fa-solid ${cat.icon}`} style={{ marginRight: "6px" }} />}
                                                {cat.name}
                                            </button>
                                        ))
                                    )}
                                </div>

                                <div className="service-grid-wrapper">
                                    {pos.loading ? (
                                        <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
                                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24, color: "var(--spa-green)" }} />
                                        </div>
                                    ) : filteredServices.length === 0 ? (
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "var(--text-muted)", gap: "12px" }}>
                                            <i className="fa-solid fa-spa" style={{ fontSize: "48px", opacity: 0.3 }} />
                                            <p style={{ fontSize: "14px" }}>Tidak ada layanan tersedia</p>
                                        </div>
                                    ) : (
                                        <div className="service-grid">
                                            {filteredServices.map((variant) => {
                                                const cartItem = pos.cartItems.find(
                                                    (i: CartItem) => i.cartKey === `service-${variant.id}`
                                                );
                                                return (
                                                    <div
                                                        key={variant.id}
                                                        className={`service-item ${cartItem ? "selected" : ""}`}
                                                        style={{ "--accent-color": variant.categoryColor ?? "var(--spa-green)" } as React.CSSProperties}
                                                    >
                                                        <div
                                                            className="service-icon"
                                                            style={{
                                                                background: `${variant.categoryColor ?? "var(--spa-green)"}20`,
                                                                color: variant.categoryColor ?? "var(--spa-green)",
                                                            }}
                                                        >
                                                            <i className={`fa-solid ${variant.icon ?? "fa-spa"}`} />
                                                        </div>
                                                        <div className="service-name">{variant.displayName}</div>
                                                        <div className="service-meta">
                                                            <span><i className="fa-regular fa-clock" /> {variant.duration} min</span>
                                                        </div>
                                                        <div className="service-price">{formatCurrency(variant.price)}</div>
                                                        {cartItem ? (
                                                            <div
                                                                className="service-qty-control"
                                                                style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(`service-${variant.id}`, -1)}>
                                                                    <i className="fa-solid fa-minus" />
                                                                </button>
                                                                <span className="qty-value">{cartItem.quantity}</span>
                                                                <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(`service-${variant.id}`, 1)}>
                                                                    <i className="fa-solid fa-plus" />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                className="service-add-btn"
                                                                onClick={(e) => { e.stopPropagation(); pos.addServiceToCart(variant); }}
                                                            >
                                                                <i className="fa-solid fa-plus" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* ── Tab: Paket Voucher ────────────────────────────── */}
                        {mode === "voucher" && (
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {pos.initData?.packages.map((pkg, idx) => (
                                        <div
                                            key={pkg.id}
                                            className={`package-card ${idx === 0 ? "hemat" : "premium"} ${selectedPackage === pkg.id ? "selected" : ""}`}
                                            onClick={() => { setSelectedPackage(pkg.id); pos.addPackageToCart(pkg); }}
                                        >
                                            {(pkg.savings ?? 0) > 0 && (
                                                <div className="package-badge">Hemat {formatCurrency(pkg.savings ?? 0)}</div>
                                            )}
                                            <div className="package-name">{pkg.name}</div>
                                            <div className="package-desc">{pkg.serviceVariantName ?? pkg.description}</div>
                                            <div className="package-price">{formatCurrency(pkg.price)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Top Up Kredit ────────────────────────────── */}
                        {mode === "credit" && (
                            <div className="service-grid-wrapper">
                                <div className="package-grid">
                                    {pos.initData?.creditPackages.map((cp) => (
                                        <div key={cp.id} className="package-card premium" onClick={() => pos.addCreditPackageToCart(cp)}>
                                            <div className="package-badge">Bonus {cp.bonusPercentage?.toFixed(0) ?? 0}%</div>
                                            <div className="package-name">{cp.name}</div>
                                            <div className="package-desc">{cp.description}</div>
                                            <div className="package-price">{formatCurrency(cp.payAmount)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* ── Tab: Redeem ───────────────────────────────────── */}
                        {mode === "redeem" && (
                            <div className="service-grid-wrapper" style={{ display: "flex", alignItems: "center" }}>
                                <RedeemScanScreen
                                    isValidating={isValidatingVoucher}
                                    onScan={handleValidateVoucher}
                                />
                            </div>
                        )}

                        {/* ── Tab: Penjualan ───────────────────────────────── */}
                        {mode === "sale" && (
                            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                                <SaleHistoryTab
                                    key={saleRefreshKey}
                                    branchId={
                                        (activeBranchId ??
                                        (session.selectedBranch as any)?.branchId ??
                                        (currentActiveSession as any)?.branchId) || 0
                                    }
                                    onToast={showToast}
                                    onBookingCountChange={fetchBookingCount}
                                />
                            </div>
                        )}

                        {/* ── Tab: Booking ─────────────────────────────────── */}
                        {mode === "booking" && (
                            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                                <BookingTab
                                    branchId={
                                        (activeBranchId ??
                                        (session.selectedBranch as any)?.branchId ??
                                        (currentActiveSession as any)?.branchId) || 0
                                    }
                                    onToast={showToast}
                                    onBookingCountChange={fetchBookingCount}
                                />
                            </div>
                        )}

                        {/* ── Tab: Daftar Sesi ─────────────────────────────── */}
                        {mode === "session_list" && (
                            <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                                <SessionTab
                                    branchId={
                                        (activeBranchId ??
                                        (session.selectedBranch as any)?.branchId ??
                                        (currentActiveSession as any)?.branchId) || 0
                                    }
                                    onToast={showToast}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Cart Sidebar ────────────────────────────────────── */}
            <aside
                className="pos-sidebar"
                style={{ display: "flex", flexDirection: "column", height: "100vh" }}
            >
                <div className="cart-header" style={{ flexShrink: 0 }}>
                    <div className="cart-title">Keranjang</div>
                    <div className="cart-subtitle">
                        {pos.cartItems?.length ?? 0} item • {pos.cartTotalDuration ?? 0} menit
                    </div>
                </div>

                <div className="cart-items" style={{ flex: 1, overflowY: "auto", minHeight: 0, paddingRight: "8px" }}>
                    {!hasCartItems ? (
                        <div className="cart-empty">
                            <i className="fa-solid fa-cart-shopping" />
                            <h4>Keranjang Kosong</h4>
                            <p>Pilih layanan untuk memulai</p>
                        </div>
                    ) : (
                        pos.cartItems.map((item: CartItem) => (
                            <div key={item.cartKey} className="cart-item">
                                <div className="cart-item-header">
                                    <span className="cart-item-name">{item.displayName}</span>
                                    <button className="cart-item-remove" onClick={() => pos.removeCartItem(item.cartKey)}>
                                        <i className="fa-solid fa-xmark" />
                                    </button>
                                </div>
                                <div className="cart-item-details">
                                    <span className="cart-item-meta">{item.duration > 0 ? `${item.duration} menit` : ""}</span>
                                    <div className="cart-item-qty">
                                        <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(item.cartKey, -1)}>
                                            <i className="fa-solid fa-minus" />
                                        </button>
                                        <span className="qty-value">{item.quantity}</span>
                                        <button className="qty-btn" onClick={() => pos.updateCartItemQuantity(item.cartKey, 1)}>
                                            <i className="fa-solid fa-plus" />
                                        </button>
                                    </div>
                                    <span className="cart-item-price">
                                        {formatCurrency(item.unitPrice * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-summary" style={{ flexShrink: 0 }}>
                    <div className="summary-row">
                        <span className="summary-label">Subtotal</span>
                        <span className="summary-value">{formatCurrency(pos.cartSubtotal ?? 0)}</span>
                    </div>
                    {hasCartItems && (
                        <div className="summary-row" style={{ cursor: "pointer" }} onClick={() => setShowDiscountModal(true)}>
                            <span className="summary-label" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                Diskon <i className="fa-solid fa-pen-to-square" style={{ fontSize: "10px", color: "var(--text-muted)" }} />
                            </span>
                            <span className="summary-value" style={{ color: pos.cartDiscount > 0 ? "var(--accent-red)" : "var(--text-muted)" }}>
                                {pos.cartDiscount > 0 ? `- ${formatCurrency(pos.cartDiscount)}` : "Tambah"}
                            </span>
                        </div>
                    )}
                    <div className="summary-row total">
                        <span className="summary-label">Total</span>
                        <span className="summary-value">{formatCurrency(pos.cartGrandTotal ?? 0)}</span>
                    </div>
                </div>

                <div className="cart-actions" style={{ flexShrink: 0 }}>
                    {hasCartItems && (
                        <button className="action-btn secondary" onClick={pos.clearCart}>
                            <i className="fa-solid fa-trash" /> Bersihkan
                        </button>
                    )}
                    <button
                        className="action-btn primary"
                        onClick={() => {
                            payment.setPaymentAmount(pos.cartGrandTotal.toString());
                            payment.openPaymentModal();
                        }}
                        disabled={!hasCartItems}
                        style={{ opacity: !hasCartItems ? 0.5 : 1 }}
                    >
                        <i className="fa-solid fa-credit-card" /> Bayar
                    </button>
                </div>
            </aside>

            {/* ══════════════════════════════════════════════════════════════
                MODALS
            ══════════════════════════════════════════════════════════════ */}

            {/* Redeem Confirmation Modal — muncul setelah voucher tervalidasi */}
            {validatedVoucher && (
                <RedeemConfirmModal
                    voucher={validatedVoucher}
                    therapists={redeemTherapists}
                    rooms={redeemRooms}
                    masterLoading={redeemMasterLoading}
                    isProcessing={isRedeemProcessing}
                    onConfirm={handleConfirmRedeem}
                    onCancel={handleCancelRedeem}
                />
            )}

            {/* Close Session Modal */}
            {showCloseSessionModal && currentActiveSession && (
                <div
                    onClick={() => setShowCloseSessionModal(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "400px", width: "90%", background: "var(--bg-card)",
                            borderRadius: "16px", padding: "24px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Tutup Sesi Kasir</h3>
                            <button onClick={() => setShowCloseSessionModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
                            Hitung dan masukkan jumlah kas aktual fisik di laci saat ini.
                        </p>

                        <div style={{ background: "var(--bg-main)", padding: "16px", borderRadius: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
                                <span>Kas Awal</span>
                                <span>{formatCurrency(currentActiveSession.openingCash ?? 0)}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "15px" }}>
                                <span>Kas Sistem</span>
                                <span style={{ color: "var(--spa-green)" }}>
                                    {formatCurrency(
                                        currentActiveSession.expectedClosingCash ??
                                        currentActiveSession.openingCash ??
                                        0
                                    )}
                                </span>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600, fontSize: "13px" }}>
                                Kas Aktual Fisik (Rp)
                            </label>
                            <input
                                type="number"
                                className="search-input"
                                placeholder="Total uang di laci"
                                value={actualClosingCash}
                                onChange={(e) => setActualClosingCash(e.target.value)}
                                style={{ width: "100%", padding: "14px", fontSize: "18px", textAlign: "right", fontWeight: 700 }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: "flex", gap: "12px" }}>
                            <button className="action-btn secondary" onClick={() => setShowCloseSessionModal(false)} style={{ flex: 1 }}>
                                Batal
                            </button>
                            <button
                                className="action-btn primary"
                                onClick={handleCloseSession}
                                disabled={isClosingSession || !actualClosingCash}
                                style={{
                                    flex: 1,
                                    background: "var(--accent-red)", borderColor: "var(--accent-red)",
                                    opacity: isClosingSession || !actualClosingCash ? 0.6 : 1,
                                }}
                            >
                                {isClosingSession
                                    ? <i className="fa-solid fa-spinner fa-spin" />
                                    : <i className="fa-solid fa-power-off" />
                                }{" "}
                                Tutup Sesi
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Discount Modal */}
            {showDiscountModal && (
                <div
                    onClick={() => setShowDiscountModal(false)}
                    style={{
                        position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
                        display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999,
                    }}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            maxWidth: "380px", width: "90%", background: "var(--bg-card)",
                            borderRadius: "16px", padding: "24px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                            display: "flex", flexDirection: "column", gap: "16px",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                            <h3 style={{ margin: 0, fontSize: "18px" }}>Tambah Diskon</h3>
                            <button onClick={() => setShowDiscountModal(false)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "var(--text-muted)" }}>
                                <i className="fa-solid fa-xmark" />
                            </button>
                        </div>

                        <div style={{ display: "flex", gap: "8px" }}>
                            {(["fixed", "percent"] as DiscountType[]).map((t) => (
                                <button
                                    key={t}
                                    className={`category-chip ${discountType === t ? "active" : ""}`}
                                    onClick={() => setDiscountType(t)}
                                >
                                    {t === "fixed" ? "Nominal (Rp)" : "Persen (%)"}
                                </button>
                            ))}
                        </div>

                        <input
                            type="number"
                            className="search-input"
                            placeholder={discountType === "fixed" ? "Nominal diskon" : "Persen diskon (0–100)"}
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            autoFocus
                        />

                        <button className="action-btn primary" onClick={handleApplyDiscount}>
                            Terapkan Diskon
                        </button>

                        {pos.cartDiscount > 0 && (
                            <button
                                className="action-btn secondary"
                                onClick={() => { pos.setCartDiscount(0); setShowDiscountModal(false); }}
                            >
                                Hapus Diskon
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {payment.showPaymentModal && pos.initData && (
                <ModalPayment
                    order={{
                        id: 0, saleCode: "-", saleType: 0, saleTypeName: "",
                        cashierSessionId: currentActiveSession?.id ?? 0,
                        memberId: pos.selectedMember?.id,
                        memberName: pos.selectedMember?.name,
                        memberPhone: pos.selectedMember?.phone,
                        memberCreditBalance:
                            (pos.selectedMember as any)?.creditBalance?.totalBalance ??
                            (pos.selectedMember as any)?.creditBalance ?? 0,
                        subtotal: pos.cartSubtotal,
                        discountAmount: pos.cartDiscount,
                        taxAmount: 0,
                        grandTotal: pos.cartGrandTotal,
                        amountPaid: 0, changeAmount: 0,
                        paymentStatus: 0, paymentStatusName: "",
                        items: pos.cartItems.map((ci: CartItem, idx: number) => ({
                            id: idx, itemType: ci.itemType, itemTypeName: "",
                            itemName: ci.displayName, duration: ci.duration,
                            quantity: ci.quantity, unitPrice: ci.unitPrice,
                            discountAmount: 0, subtotal: ci.unitPrice * ci.quantity,
                        })),
                        totalItems: pos.cartItems.reduce((s: number, i: CartItem) => s + i.quantity, 0),
                        totalDuration: pos.cartTotalDuration,
                    }}
                    paymentMethods={pos.initData.paymentMethods}
                    payments={payment.payments}
                    selectedPaymentMethod={payment.selectedPaymentMethod}
                    setSelectedPaymentMethod={payment.setSelectedPaymentMethod}
                    paymentAmount={payment.paymentAmount}
                    setPaymentAmount={payment.setPaymentAmount}
                    paymentReference={payment.paymentReference}
                    setPaymentReference={payment.setPaymentReference}
                    onAddEntry={payment.addPaymentEntry}
                    onRemoveEntry={payment.removePaymentEntry}
                    onProcess={handleProcessPayment}
                    onClose={payment.closePaymentModal}
                    isProcessing={isCheckoutProcessing}
                />
            )}

            {/* Member Detail Modal */}
            {detailMemberId !== null && (
                <ModalMemberDetail
                    memberId={detailMemberId}
                    defaultBranchSearch={
                        session.selectedBranch?.branchName ||
                        (session.selectedBranch as any)?.name ||
                        ""
                    }
                    onClose={() => setDetailMemberId(null)}
                    onToast={showToast}
                />
            )}

            {/* Session Success Modal — Muncul setelah redeem POST berhasil */}
            {redeemCreatedSession && (
                <SessionSuccessModal
                    session={redeemCreatedSession}
                    onClose={() => {
                        setRedeemCreatedSession(null);
                        setMode("sale"); 
                    }}
                />
            )}

            {/* Add Member Modal */}
            {showMemberModal && (
                <ModalMemberAdd
                    onClose={() => setShowMemberModal(false)}
                    onSave={async (data) => {
                        const res = await pos.createMember(data);
                        if (res) {
                            showToast("Member berhasil ditambahkan!", "success");
                            return true;
                        }
                        return false;
                    }}
                />
            )}
        </div>
    );
}