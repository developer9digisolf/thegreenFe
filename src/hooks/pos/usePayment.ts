"use client";

import { useState } from "react";
import { useApi } from "@afx/utils/useApi";
import { rest } from "@afx/utils/config.rest";
import type {
    CartItem,
    PaymentEntry,
    PaymentMethod,
    SalePayload,
} from "@afx/interfaces/pos.iface";

interface UsePaymentReturn {
    showPaymentModal: boolean;
    openPaymentModal: () => void;
    closePaymentModal: () => void;

    payments: PaymentEntry[];
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: (pm: PaymentMethod | null) => void;
    paymentAmount: string;
    setPaymentAmount: (v: string) => void;
    paymentReference: string;
    setPaymentReference: (v: string) => void;
    addPaymentEntry: () => void;
    removePaymentEntry: (index: number) => void;

    /**
     * Kirim POST /pos/sales dengan semua data keranjang + pembayaran.
     * Dipanggil saat tombol "Proses" di ModalPayment diklik.
     */
    processSale: (params: {
        cartItems: CartItem[];
        grandTotal: number;
        branchId: number;
        memberId?: number | null;
        therapistId?: number | null;
        saleType?: number;
        notes?: string | null;
        onSuccess: () => void;
    }) => Promise<void>;

    // ── Close session ───────────────────────────
    showCloseSessionModal: boolean;
    sessionDetail: any;
    loadingSessionDetail: boolean;
    openCloseSessionModal: (sessionId: number) => Promise<void>;
    closeCloseSessionModal: () => void;
    closingCash: string;
    setClosingCash: (v: string) => void;
    handleCloseSession: (sessionId: number, onSuccess: () => void) => Promise<void>;

    isProcessing: boolean;
}

export function usePayment(
    showToast: (msg: string, type?: "success" | "error" | "info") => void
): UsePaymentReturn {
    const { get, post } = useApi();
    const [isProcessing, setIsProcessing] = useState(false);

    // ── Payment modal state ────────────────────────────────────────────────────
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [paymentReference, setPaymentReference] = useState("");

    const openPaymentModal = () => {
        setPayments([]);
        setSelectedPaymentMethod(null);
        setPaymentReference("");
        setShowPaymentModal(true);
    };

    const closePaymentModal = () => setShowPaymentModal(false);

    const addPaymentEntry = () => {
        if (!selectedPaymentMethod || !paymentAmount) return;
        const amount = parseFloat(paymentAmount);
        if (amount <= 0) return;

        if (selectedPaymentMethod.requiresReference && !paymentReference) {
            showToast(
                `Nomor referensi diperlukan untuk pembayaran ${selectedPaymentMethod.name}`,
                "error"
            );
            return;
        }

        setPayments((prev) => [
            ...prev,
            {
                paymentMethodId: selectedPaymentMethod.id,
                amount,
                referenceNumber: paymentReference || undefined,
            },
        ]);
        setSelectedPaymentMethod(null);
        setPaymentAmount("");
        setPaymentReference("");
    };

    const removePaymentEntry = (index: number) =>
        setPayments((prev) => prev.filter((_, i) => i !== index));

    // ── POST /pos/sales ────────────────────────────────────────────────────────
    const processSale = async ({
        cartItems,
        grandTotal,
        branchId,
        memberId,
        therapistId,
        saleType = 0,
        notes = null,
        onSuccess,
    }: {
        cartItems: CartItem[];
        grandTotal: number;
        branchId: number;
        memberId?: number | null;
        therapistId?: number | null;
        saleType?: number;
        notes?: string | null;
        onSuccess: () => void;
    }) => {
        if (cartItems.length === 0) {
            showToast("Keranjang kosong", "error");
            return;
        }

        if (payments.length === 0) {
            showToast("Pilih metode pembayaran terlebih dahulu", "error");
            return;
        }

        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid < grandTotal) {
            showToast("Total pembayaran kurang dari tagihan", "error");
            return;
        }

        // Saat ini hanya support 1 payment method (ambil yang pertama).
        // Jika BE sudah support split payment, bisa diextend di sini.
        const primaryPayment = payments[0];

        const payload: SalePayload = {
            SaleType: saleType,
            BranchId: branchId,
            MemberId: memberId ?? null,
            TherapistId: therapistId ?? null,
            PaymentMethodId: primaryPayment.paymentMethodId,
            notes: notes,
            amountPaid: totalPaid,
            Items: cartItems.flatMap((item) =>
                // Expand quantity → N items (sesuai struktur BE yang menerima array items)
                Array.from({ length: item.quantity }, () => ({
                    ItemType: item.itemType,
                    BranchServiceVariantId: item.branchServiceVariantId,
                    ServicePackageId: item.servicePackageId,
                    CreditPackageId: item.creditPackageId,
                    Notes: item.notes ?? null,
                    AppointmentDate: item.appointmentDate ?? null,
                    StartTime: item.startTime ?? null,
                    AppointmentNotes: item.appointmentNotes ?? null,
                }))
            ),
        };

        setIsProcessing(true);
        try {
            const response = await post("pos/sales", payload);

            if (response.success) {
                setShowPaymentModal(false);
                setPayments([]);
                showToast("Pembayaran berhasil!");
                onSuccess();
            } else {
                showToast(response.message || "Gagal memproses pembayaran", "error");
            }
        } catch {
            showToast("Gagal memproses pembayaran", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Close session modal ────────────────────────────────────────────────────
    const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);
    const [sessionDetail, setSessionDetail] = useState<any>(null);
    const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
    const [closingCash, setClosingCash] = useState("");

    const openCloseSessionModal = async (sessionId: number) => {
        setLoadingSessionDetail(true);
        setShowCloseSessionModal(true);
        try {
            const response = await get(
                rest.cashierSessionDetailFull.replace(":id", sessionId.toString())
            );
            if (response.success && response.data) {
                setSessionDetail(response.data);
                setClosingCash(response.data.expectedClosingCash?.toString() || "0");
            }
        } catch {
        } finally {
            setLoadingSessionDetail(false);
        }
    };

    const closeCloseSessionModal = () => {
        setShowCloseSessionModal(false);
        setSessionDetail(null);
        setClosingCash("");
    };

    const handleCloseSession = async (sessionId: number, onSuccess: () => void) => {
        if (!closingCash || parseFloat(closingCash) < 0) {
            showToast("Masukkan jumlah kas akhir yang valid", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const response = await post(
                rest.cashierSessionClose.replace(":id", sessionId.toString()),
                { actualClosingCash: parseFloat(closingCash) }
            );
            if (response.success) {
                closeCloseSessionModal();
                onSuccess();
            } else {
                showToast(response.message || "Gagal menutup sesi", "error");
            }
        } catch {
            showToast("Gagal menutup sesi", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        showPaymentModal,
        openPaymentModal,
        closePaymentModal,

        payments,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        paymentAmount,
        setPaymentAmount,
        paymentReference,
        setPaymentReference,
        addPaymentEntry,
        removePaymentEntry,
        processSale,

        showCloseSessionModal,
        sessionDetail,
        loadingSessionDetail,
        openCloseSessionModal,
        closeCloseSessionModal,
        closingCash,
        setClosingCash,
        handleCloseSession,

        isProcessing,
    };
}