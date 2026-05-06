"use client";

import { useState } from "react";
import { useApi } from "@afx/utils/useApi";
import { rest } from "@afx/utils/config.rest";
import type { Order, PaymentEntry, PaymentMethod } from "@afx/interfaces/pos.iface";

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

    processPayment: (
        order: Order,
        therapistId: number | null,
        onSuccess: () => void
    ) => Promise<void>;

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

    // ── Payment modal state ─────────────────────
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [payments, setPayments] = useState<PaymentEntry[]>([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentMethod | null>(null);
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

    const processPayment = async (
        order: Order,
        therapistId: number | null,
        onSuccess: () => void
    ) => {
        if (payments.length === 0) return;
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        if (totalPaid < order.grandTotal) {
            showToast("Total pembayaran kurang dari tagihan", "error");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await post(
                rest.posOrderPay.replace(":id", order.id.toString()),
                {
                    payments: payments.map((p) => ({
                        paymentMethodId: p.paymentMethodId,
                        amount: p.amount,
                        referenceNumber: p.referenceNumber || null,
                    })),
                    amountReceived: totalPaid,
                    therapistId: therapistId || null,
                }
            );
            if (response.success) {
                setShowPaymentModal(false);
                setPayments([]);
                onSuccess();
                showToast("Pembayaran berhasil!");
            } else {
                showToast(response.message || "Gagal memproses pembayaran", "error");
            }
        } catch {
            showToast("Gagal memproses pembayaran", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Close session modal state ───────────────
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

    const handleCloseSession = async (
        sessionId: number,
        onSuccess: () => void
    ) => {
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
        processPayment,

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
