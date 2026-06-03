"use client";

import { formatCurrency } from "@afx/utils/format";
import type { Order, PaymentMethod, PaymentEntry } from "@afx/interfaces/pos.iface";

interface Props {
    order: Order;
    paymentMethods: PaymentMethod[];
    payments: PaymentEntry[];
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: (pm: PaymentMethod | null) => void;
    paymentAmount: string;
    setPaymentAmount: (v: string) => void;
    paymentReference: string;
    setPaymentReference: (v: string) => void;
    onAddEntry: () => void;
    onRemoveEntry: (index: number) => void;
    onProcess: () => void;
    onClose: () => void;
    isProcessing: boolean;
    originalSaleId?: number | null;
    alreadyPaid?: number;
    referenceSaleCode?: string | null;
    adjustmentReason?: string;
    setAdjustmentReason?: (v: string) => void;
}

export default function ModalPayment({
    order,
    paymentMethods,
    payments,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    paymentAmount,
    setPaymentAmount,
    paymentReference,
    setPaymentReference,
    onAddEntry,
    onRemoveEntry,
    onProcess,
    onClose,
    isProcessing,
    originalSaleId = null,
    alreadyPaid = 0,
    referenceSaleCode = null,
    adjustmentReason = "",
    setAdjustmentReason,
}: Props) {
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

    // Saat mode adjustment, target pembayaran adalah tagihan tambahan (selisih)
    const targetTotal = originalSaleId
        ? Math.max(0, order.grandTotal - alreadyPaid)
        : order.grandTotal;

    const isAdjustmentReasonValid = !originalSaleId || (adjustmentReason && adjustmentReason.trim().length > 0);
    // Jika ini mode adjustment dengan tagihan tambahan 0 (tidak ada selisih), payment entry tidak wajib
    const isZeroAdjustment = !!originalSaleId && targetTotal === 0;
    const canProcess = !isProcessing && (isZeroAdjustment || (payments.length > 0 && totalPaid >= targetTotal)) && isAdjustmentReasonValid;

    // Cek apakah semua payment entries menggunakan metode cash
    const isCashOnly =
        payments.length > 0 &&
        payments.every((p) => {
            const pm = paymentMethods.find((m) => m.id === p.paymentMethodId);
            return pm?.isCash ?? false;
        });

    // Kembalian hanya relevan untuk pembayaran cash
    const kembalian = isCashOnly ? Math.max(0, totalPaid - targetTotal) : 0;
    const hasKembalian = isCashOnly && kembalian > 0;

    return (
        <div
            className="modal-overlay"
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
            }}
        >
            <div
                className="modal-content"
                style={{
                    background: "var(--bg-card)",
                    borderRadius: "24px",
                    padding: "32px",
                    width: "100%",
                    maxWidth: "500px",
                    maxHeight: "90vh",
                    overflowY: "auto",
                    boxShadow: "var(--shadow-lg)",
                }}
            >
                {/* Header */}
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "24px",
                    }}
                >
                    <h2 style={{ margin: 0 }}>Pembayaran</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none",
                            border: "none",
                            fontSize: "24px",
                            cursor: "pointer",
                            color: "var(--text-muted)",
                        }}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                {/* Total tagihan / Tagihan Tambahan */}
                <div
                    style={{
                        background: originalSaleId ? "rgba(245,158,11,0.08)" : "var(--spa-green-bg)",
                        border: originalSaleId ? "1.5px dashed #f59e0b" : "none",
                        padding: "20px",
                        borderRadius: "16px",
                        marginBottom: "24px",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "13px", color: originalSaleId ? "#d97706" : "var(--text-muted)", marginBottom: "4px", fontWeight: originalSaleId ? 700 : 400 }}>
                        {originalSaleId ? `⚡ Tagihan Tambahan (${referenceSaleCode ?? ""})` : "Total Tagihan"}
                    </div>
                    <div
                        style={{ fontSize: "36px", fontWeight: 800, color: originalSaleId ? "#d97706" : "var(--spa-green)" }}
                    >
                        {formatCurrency(targetTotal)}
                    </div>
                    {originalSaleId && (
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "6px" }}>
                            Total Baru: {formatCurrency(order.grandTotal)} &nbsp;·&nbsp; Sudah Dibayar: {formatCurrency(alreadyPaid)}
                        </div>
                    )}
                </div>

                {/* Pilih metode */}
                <div style={{ marginBottom: "24px" }}>
                    <label style={{ display: "block", marginBottom: "12px", fontWeight: 600 }}>
                        Pilih Metode
                    </label>
                    <div
                        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}
                    >
                        {paymentMethods.map((pm) => (
                            <button
                                key={pm.id}
                                onClick={() => {
                                    setSelectedPaymentMethod(pm);
                                    setPaymentAmount(
                                        Math.max(0, targetTotal - totalPaid).toString()
                                    );
                                }}
                                style={{
                                    padding: "14px 8px",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "8px",
                                    borderRadius: "12px",
                                    transition: "all 0.2s",
                                    background:
                                        selectedPaymentMethod?.id === pm.id
                                            ? "var(--spa-green-bg)"
                                            : "var(--bg-main)",
                                    border:
                                        selectedPaymentMethod?.id === pm.id
                                            ? "2px solid var(--spa-green)"
                                            : "2px solid var(--border-color)",
                                }}
                            >
                                <i
                                    className={`fa-solid ${
                                        pm.isCash
                                            ? "fa-money-bill-wave"
                                            : pm.code === "QRIS"
                                            ? "fa-qrcode"
                                            : "fa-credit-card"
                                    }`}
                                    style={{
                                        fontSize: "22px",
                                        color:
                                            selectedPaymentMethod?.id === pm.id
                                                ? "var(--spa-green)"
                                                : "var(--text-secondary)",
                                    }}
                                ></i>
                                <span
                                    style={{
                                        fontSize: "11px",
                                        fontWeight: 600,
                                        color:
                                            selectedPaymentMethod?.id === pm.id
                                                ? "var(--spa-green)"
                                                : "var(--text-secondary)",
                                    }}
                                >
                                    {pm.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input jumlah + referensi */}
                {selectedPaymentMethod && (
                    <div
                        style={{
                            marginBottom: "24px",
                            background: "var(--bg-main)",
                            padding: "16px",
                            borderRadius: "12px",
                        }}
                    >
                        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                            <div style={{ flex: 1 }}>
                                <label
                                    style={{
                                        display: "block",
                                        marginBottom: "8px",
                                        fontWeight: 600,
                                        fontSize: "12px",
                                        color: "var(--text-muted)",
                                    }}
                                >
                                    Jumlah
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="search-input"
                                    style={{ width: "100%", padding: "12px", textAlign: "right", fontWeight: 700 }}
                                />
                            </div>
                            {selectedPaymentMethod.requiresReference && (
                                <div style={{ flex: 1 }}>
                                    <label
                                        style={{
                                            display: "block",
                                            marginBottom: "8px",
                                            fontWeight: 600,
                                            fontSize: "12px",
                                            color: "var(--text-muted)",
                                        }}
                                    >
                                        No. Referensi
                                    </label>
                                    <input
                                        type="text"
                                        value={paymentReference}
                                        onChange={(e) => setPaymentReference(e.target.value)}
                                        placeholder="Masukkan ref"
                                        className="search-input"
                                        style={{ width: "100%", padding: "12px" }}
                                    />
                                </div>
                            )}
                        </div>
                        <button onClick={onAddEntry} className="action-btn secondary" style={{ width: "100%" }}>
                            <i className="fa-solid fa-plus"></i> Tambah
                        </button>
                    </div>
                )}

                {/* Daftar payment entries */}
                {payments.length > 0 && (
                    <div
                        style={{
                            background: "var(--bg-main)",
                            padding: "16px",
                            borderRadius: "12px",
                            marginBottom: "24px",
                        }}
                    >
                        {payments.map((p, i) => (
                            <div
                                key={i}
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                }}
                            >
                                <span style={{ color: "var(--text-muted)" }}>
                                    Entry #{i + 1}
                                    {p.referenceNumber && ` — ${p.referenceNumber}`}
                                </span>
                                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                    <span style={{ color: "var(--spa-green)", fontWeight: 700 }}>
                                        {formatCurrency(p.amount)}
                                    </span>
                                    <button
                                        onClick={() => onRemoveEntry(i)}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            color: "var(--accent-red)",
                                        }}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* ── Total Dibayar & Kembalian ── */}
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                                marginTop: "8px",
                                paddingTop: "12px",
                                borderTop: "1px solid var(--border-color)",
                                fontSize: "14px",
                            }}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "var(--text-muted)" }}>Total Dibayar</span>
                                <span style={{ color: "var(--spa-green)", fontWeight: 700 }}>
                                    {formatCurrency(totalPaid)}
                                </span>
                            </div>

                            {/* Kembalian — hanya tampil jika metode cash & ada kelebihan bayar */}
                            {hasKembalian && (
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        background: "var(--spa-green-bg)",
                                        border: "1.5px solid var(--spa-green)",
                                        borderRadius: "10px",
                                        padding: "10px 14px",
                                        marginTop: "4px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <i
                                            className="fa-solid fa-money-bill-wave"
                                            style={{ color: "var(--spa-green)", fontSize: "16px" }}
                                        ></i>
                                        <span style={{ color: "var(--spa-green)", fontWeight: 700 }}>
                                            Kembalian
                                        </span>
                                    </div>
                                    <span
                                        style={{
                                            color: "var(--spa-green)",
                                            fontWeight: 800,
                                            fontSize: "18px",
                                        }}
                                    >
                                        {formatCurrency(kembalian)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Alasan Penyesuaian (Update) */}
                {originalSaleId && setAdjustmentReason && (
                    <div
                        style={{
                            marginBottom: "24px",
                            background: "rgba(245,158,11,0.05)",
                            border: "1.5px dashed #f59e0b",
                            padding: "16px",
                            borderRadius: "16px",
                        }}
                    >
                        <label
                            style={{
                                display: "block",
                                marginBottom: "8px",
                                fontWeight: 700,
                                fontSize: "13px",
                                color: "#d97706",
                            }}
                        >
                            Alasan Penyesuaian (Wajib) *
                        </label>
                        <input
                            type="text"
                            value={adjustmentReason}
                            onChange={(e) => setAdjustmentReason(e.target.value)}
                            placeholder="Masukkan alasan (misal: salah pesan)"
                            className="search-input"
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "10px",
                                border: "1.5px solid #f59e0b",
                                background: "var(--bg-card)",
                                color: "var(--text-primary)",
                                outline: "none",
                            }}
                            required
                        />
                    </div>
                )}

                {/* Process button */}
                <button
                    className="action-btn primary"
                    onClick={onProcess}
                    disabled={!canProcess}
                    style={{
                        width: "100%",
                        padding: "18px",
                        fontSize: "16px",
                        opacity: canProcess ? 1 : 0.5,
                    }}
                >
                    {isProcessing ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                    ) : (
                        <>
                            {originalSaleId
                                ? <><i className="fa-solid fa-pen-to-square"></i> Simpan Penyesuaian</>
                                : <><i className="fa-solid fa-check-circle"></i> Proses Pembayaran</>
                            }
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}