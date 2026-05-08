"use client";

import { useState, useEffect } from "react";
import { useApi } from "@afx/utils/useApi";
import type { Branch, GateState } from "@afx/interfaces/pos.iface";

// ============================================
// Types
// ============================================
interface UsePosSessionReturn {
    gateState: GateState;
    setGateState: (state: GateState) => void;
    branches: Branch[];
    selectedBranch: Branch | null;
    setSelectedBranch: (branch: Branch | null) => void;
    activeSession: any;
    activeSessionsMap: Record<number, any>;
    openingCash: string;
    setOpeningCash: (v: string) => void;
    closingCash: string;
    setClosingCash: (v: string) => void;
    cashMovementReason: string;
    setCashMovementReason: (v: string) => void;
    isProcessing: boolean;
    handleSelectBranch: (branch: Branch) => Promise<void>;
    /**
     * [FIX] Sekarang mengembalikan Promise<boolean>:
     *   - true  = sesi berhasil ditutup
     *   - false = gagal (validasi / API error)
     * Caller (POSPage) wajib cek nilai ini sebelum reload/toast.
     */
    handleForceCloseSession: () => Promise<boolean>;
    handleOpenSession: (onReady: (branchId: number) => void) => Promise<void>;
}

// ============================================
// Hook
// ============================================
export function usePosSession(
    showToast: (msg: string, type?: "success" | "error" | "info") => void
): UsePosSessionReturn {
    const { get, post } = useApi();

    const [gateState, setGateState]     = useState<GateState>("INITIALIZING");
    const [branches, setBranches]       = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [activeSession, setActiveSession]   = useState<any>(null);
    const [activeSessionsMap, setActiveSessionsMap] = useState<Record<number, any>>({});
    const [isProcessing, setIsProcessing]     = useState(false);

    const [openingCash, setOpeningCash]           = useState("");
    const [closingCash, setClosingCash]           = useState("");
    const [cashMovementReason, setCashMovementReason] = useState("");

    // ── Inisialisasi ────────────────────────────────────────────────────────
    useEffect(() => {
        let isMounted = true;

        const initializeData = async (): Promise<boolean> => {
            const authDataStr = localStorage.getItem("THEGREEN@USER");
            if (!authDataStr) return false;

            const userData = JSON.parse(authDataStr);
            const userBranches: Branch[] = userData?.branches || [];
            if (userBranches.length === 0) return false;

            if (isMounted) setBranches(userBranches);

            // Fetch status sesi semua cabang secara paralel
            const sessionsMap: Record<number, any> = {};
            await Promise.all(
                userBranches.map(async (b) => {
                    try {
                        const res = await get(`/cashier-sessions/branch/${b.branchId}/active`);
                        if (res.success && res.data) {
                            sessionsMap[b.branchId] = res.data;
                        }
                    } catch {
                        // Abaikan error per-cabang agar tidak memblokir cabang lain
                    }
                })
            );

            if (!isMounted) return true;

            setActiveSessionsMap(sessionsMap);

            if (userBranches.length === 1) {
                const single = userBranches[0];
                setSelectedBranch(single);

                if (sessionsMap[single.branchId]) {
                    // [FIX] Set activeSession untuk single-branch agar FORCE_CLOSE panel punya data
                    setActiveSession(sessionsMap[single.branchId]);
                    setGateState("FORCE_CLOSE");
                } else {
                    setGateState("OPEN_SESSION");
                }
            } else {
                // Multi-branch: biarkan user pilih, activeSession di-set saat pilih cabang
                setGateState("SELECT_BRANCH");
            }

            return true;
        };

        const run = async () => {
            const ok = await initializeData();
            if (!ok && isMounted) {
                // Retry sekali setelah 300ms (misal localStorage belum siap)
                setTimeout(async () => {
                    const retryOk = await initializeData();
                    if (!retryOk && isMounted) {
                        showToast("Akses ditolak: Data cabang tidak ditemukan.", "error");
                        setGateState("SELECT_BRANCH");
                    }
                }, 300);
            }
        };

        run();
        return () => { isMounted = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Pilih Cabang ────────────────────────────────────────────────────────
    const handleSelectBranch = async (branch: Branch): Promise<void> => {
        setSelectedBranch(branch);
        setGateState("INITIALIZING");

        try {
            const res = await get(`/cashier-sessions/branch/${branch.branchId}/active`);
            if (res.success && res.data) {
                // [FIX] Selalu set activeSession saat masuk FORCE_CLOSE
                // agar panel FORCE_CLOSE punya data lengkap (id, userName, sessionCode)
                setActiveSession(res.data);
                setActiveSessionsMap((prev) => ({ ...prev, [branch.branchId]: res.data }));
                setGateState("FORCE_CLOSE");
            } else {
                setActiveSession(null);
                setGateState("OPEN_SESSION");
            }
        } catch {
            setActiveSession(null);
            setGateState("OPEN_SESSION");
        }
    };

    // ── Tutup Paksa Sesi Lama ────────────────────────────────────────────────
    /**
     * [FIX] Mengembalikan boolean agar caller tahu hasilnya:
     *   true  = berhasil ditutup
     *   false = gagal (validasi / API error)
     *
     * Ini penting agar POSPage tidak salah menampilkan toast sukses
     * atau melakukan reload ketika sesi sebenarnya belum tertutup.
     */
    const handleForceCloseSession = async (): Promise<boolean> => {
        // Validasi kas aktual
        if (!closingCash || parseFloat(closingCash) < 0) {
            showToast("Masukkan kas aktual untuk menutup sesi lama", "error");
            return false;
        }

        // [FIX] Pastikan activeSession tersedia; fallback ke activeSessionsMap
        const sessionToClose =
            activeSession ??
            (selectedBranch ? activeSessionsMap[selectedBranch.branchId] : null) ??
            Object.values(activeSessionsMap).find(Boolean);

        if (!sessionToClose?.id) {
            showToast("Data sesi tidak ditemukan, coba muat ulang halaman", "error");
            return false;
        }

        setIsProcessing(true);
        try {
            const res = await post(`/cashier-sessions/${sessionToClose.id}/close`, {
                ActualClosingCash: parseFloat(closingCash),
                Notes: cashMovementReason || null,
            });

            if (res.success) {
                // Bersihkan state lokal
                if (selectedBranch) {
                    setActiveSessionsMap((prev) => {
                        const next = { ...prev };
                        delete next[selectedBranch.branchId];
                        return next;
                    });
                }
                setActiveSession(null);
                setClosingCash("");
                setCashMovementReason("");
                // Tidak set gateState di sini — biarkan caller (POSPage) yang handle
                // agar tidak bertabrakan dengan window.location.reload()
                return true;  // ← [FIX] return true saat sukses
            } else {
                showToast(res.message || "Gagal menutup sesi lama", "error");
                return false; // ← [FIX] return false saat gagal
            }
        } catch {
            showToast("Gagal menutup sesi lama", "error");
            return false;
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Buka Sesi Baru ───────────────────────────────────────────────────────
    const handleOpenSession = async (
        onReady: (branchId: number) => void
    ): Promise<void> => {
        if (!openingCash || parseFloat(openingCash) < 0) {
            showToast("Masukkan jumlah kas awal yang valid", "error");
            return;
        }
        if (!selectedBranch) {
            showToast("Branch tidak ditemukan", "error");
            return;
        }

        setIsProcessing(true);
        try {
            const res = await post("/cashier-sessions/open", {
                OpeningCash: parseFloat(openingCash),
                BranchId: selectedBranch.branchId,
                note: null,
            });

            if (res.success) {
                setOpeningCash("");
                setGateState("READY");
                onReady(selectedBranch.branchId);
            } else {
                showToast(res.message || "Gagal membuka sesi", "error");
            }
        } catch {
            showToast("Gagal membuka sesi", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    return {
        gateState,
        setGateState,
        branches,
        selectedBranch,
        setSelectedBranch,
        activeSession,
        activeSessionsMap,
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
    };
}