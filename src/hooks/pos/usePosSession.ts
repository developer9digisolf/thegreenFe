"use client";

import { useState, useEffect } from "react";
import { useApi } from "@afx/utils/useApi";
import type { Branch, GateState } from "@afx/interfaces/pos.iface";

interface UsePosSessionReturn {
    gateState: GateState;
    setGateState: (state: GateState) => void;
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
    handleSelectBranch: (branch: Branch) => Promise<void>;
    handleForceCloseSession: () => Promise<void>;
    handleOpenSession: (onReady: () => void) => Promise<void>;
}

export function usePosSession(
    showToast: (msg: string, type?: "success" | "error" | "info") => void
): UsePosSessionReturn {
    const { get, post } = useApi();

    const [gateState, setGateState] = useState<GateState>("INITIALIZING");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [activeSession, setActiveSession] = useState<any>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const [openingCash, setOpeningCash] = useState("");
    const [closingCash, setClosingCash] = useState("");
    const [cashMovementReason, setCashMovementReason] = useState("");

    const handleSelectBranch = async (branch: Branch) => {
        setSelectedBranch(branch);
        setGateState("INITIALIZING");
        try {
            const res = await get(`/cashier-sessions/branch/${branch.branchId}/active`);
            if (res.success && res.data) {
                setActiveSession(res.data);
                setGateState("FORCE_CLOSE");
            } else {
                setGateState("OPEN_SESSION");
            }
        } catch {
            setGateState("OPEN_SESSION");
        }
    };

    useEffect(() => {
        const loadData = () => {
            const authDataStr = localStorage.getItem("THEGREEN@USER");
            if (authDataStr) {
                const userData = JSON.parse(authDataStr);
                const userBranches: Branch[] = userData?.branches || [];
                if (userBranches.length > 0) {
                    setBranches(userBranches);
                    if (userBranches.length === 1) {
                        handleSelectBranch(userBranches[0]);
                    } else {
                        setGateState("SELECT_BRANCH");
                    }
                    return true;
                }
            }
            return false;
        };

        const success = loadData();
        if (!success) {
            const timeout = setTimeout(() => {
                if (!loadData()) {
                    showToast("Akses ditolak: Data cabang tidak ditemukan.", "error");
                    setGateState("SELECT_BRANCH");
                }
            }, 300);
            return () => clearTimeout(timeout);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleForceCloseSession = async () => {
        if (!closingCash || parseFloat(closingCash) < 0) {
            showToast("Masukkan kas aktual untuk menutup sesi lama", "error");
            return;
        }
        setIsProcessing(true);
        try {
            const res = await post(`/cashier-sessions/${activeSession.id}/close`, {
                ActualClosingCash: parseFloat(closingCash),
                Notes: cashMovementReason || null,
            });
            if (res.success) {
                showToast("Sesi lama berhasil ditutup!");
                setActiveSession(null);
                setClosingCash("");
                setCashMovementReason("");
                setGateState("OPEN_SESSION");
            } else {
                showToast(res.message || "Gagal menutup sesi lama", "error");
            }
        } catch {
            showToast("Gagal menutup sesi lama", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOpenSession = async (onReady: () => void) => {
        if (!openingCash || parseFloat(openingCash) < 0) {
            showToast("Masukkan jumlah kas awal yang valid", "error");
            return;
        }
        if (!selectedBranch) return;

        setIsProcessing(true);
        try {
            const response = await post("/cashier-sessions/open", {
                OpeningCash: parseFloat(openingCash),
                BranchId: selectedBranch.branchId,
                note: null,
            });
            if (response.success) {
                setOpeningCash("");
                setGateState("READY");
                onReady();
            } else {
                showToast(response.message || "Gagal membuka sesi", "error");
            }
        } catch {
            showToast("Gagal membuka sesi", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return {
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
        handleSelectBranch,
        handleForceCloseSession,
        handleOpenSession,
        setGateState,
    };
}
