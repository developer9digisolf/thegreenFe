"use client";

import { useState, useCallback } from "react";
import { useApi } from "@afx/utils/useApi";
import { rest } from "@afx/utils/config.rest";
import type { PosInitData, Order, PendingOrder, Member, ServiceVariant, Package } from "@afx/interfaces/pos.iface";

interface UsePosDataReturn {
    initData: PosInitData | null;
    loading: boolean;
    loadInitData: () => Promise<void>;

    currentOrder: Order | null;
    setCurrentOrder: (o: Order | null) => void;
    pendingOrders: PendingOrder[];

    selectedMember: Member | null;
    memberSearch: string;
    setMemberSearch: (v: string) => void;
    memberResults: Member[];
    showMemberDropdown: boolean;
    setShowMemberDropdown: (v: boolean) => void;

    selectedTherapist: number | null;
    setSelectedTherapist: (id: number | null) => void;

    createNewOrder: (saleType?: number) => Promise<Order | null>;
    loadPendingOrders: () => Promise<void>;
    selectOrder: (orderId: number) => Promise<void>;

    addServiceToCart: (variant: ServiceVariant) => Promise<void>;
    addPackageToCart: (pkg: Package) => Promise<void>;
    updateItemQuantity: (itemId: number, delta: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;

    setOrderMember: (member: Member | null) => Promise<void>;
    holdOrder: () => Promise<void>;

    applyDiscount: (type: "fixed" | "percent", value: number) => Promise<void>;
    removeDiscount: () => Promise<void>;

    submitCashMovement: (
        sessionId: number,
        type: "in" | "out",
        amount: number,
        reason: string
    ) => Promise<void>;

    isProcessing: boolean;
    getFilteredServices: (selectedCategory: number | null, search: string) => ServiceVariant[];
}

export function usePosData(
    showToast: (msg: string, type?: "success" | "error" | "info") => void
): UsePosDataReturn {
    const { get, post, put, del } = useApi();

    const [initData, setInitData] = useState<PosInitData | null>(null);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberResults, setMemberResults] = useState<Member[]>([]);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);

    const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);

    // ── Core load ──────────────────────────────
    const loadInitData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await get(rest.posInit);
            if (response.success && response.data) {
                setInitData(response.data);
                setPendingOrders(response.data.pendingOrders || []);
            }
        } catch {
            // silently fail; caller may show toast if desired
        } finally {
            setLoading(false);
        }
    }, [get]);

    const loadPendingOrders = async () => {
        try {
            const response = await get(rest.posOrdersPending);
            if (response.success && response.data) setPendingOrders(response.data);
        } catch {}
    };

    // ── Member ─────────────────────────────────
    const searchMembers = useCallback(
        async (query: string) => {
            if (query.length < 2) { setMemberResults([]); return; }
            try {
                const response = await get(
                    `${rest.member}?search=${encodeURIComponent(query)}&pageSize=5`
                );
                if (response.success && response.data?.items) {
                    setMemberResults(response.data.items);
                }
            } catch {}
        },
        [get]
    );

    const handleSetMemberSearch = (v: string) => {
        setMemberSearch(v);
        searchMembers(v);
        setShowMemberDropdown(true);
    };

    // ── Order ──────────────────────────────────
    const createNewOrder = async (saleType = 0): Promise<Order | null> => {
        try {
            const response = await post(rest.posOrders, {
                saleType,
                memberId: selectedMember?.id || null,
            });
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                return response.data;
            } else {
                showToast(response.message || "Gagal membuat order", "error");
                return null;
            }
        } catch {
            showToast("Gagal membuat order", "error");
            return null;
        }
    };

    const selectOrder = async (orderId: number) => {
        try {
            const response = await get(
                rest.posOrderDetail.replace(":id", orderId.toString())
            );
            if (response.success && response.data) {
                setCurrentOrder(response.data);
            }
        } catch {}
    };

    // ── Cart ───────────────────────────────────
    const addItemToOrder = async (
        itemType: number,
        itemId: number,
        order?: Order | null
    ) => {
        const targetOrder = order || currentOrder;
        if (!targetOrder) return;

        const payload: Record<string, unknown> = {
            itemType,
            quantity: 1,
            serviceVariantId: itemType === 0 ? itemId : null,
            packageId: itemType === 1 ? itemId : null,
            creditPackageId: itemType === 2 ? itemId : null,
        };

        try {
            const response = await post(
                rest.posOrderItems.replace(":id", targetOrder.id.toString()),
                payload
            );
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                showToast("Item ditambahkan ke keranjang");
            } else {
                showToast(response.message || "Gagal menambahkan item", "error");
            }
        } catch {
            showToast("Gagal menambahkan item", "error");
        }
    };

    const addServiceToCart = async (variant: ServiceVariant) => {
        if (!currentOrder) {
            const newOrder = await createNewOrder(0);
            if (newOrder) await addItemToOrder(0, variant.id, newOrder);
            return;
        }
        await addItemToOrder(0, variant.id);
    };

    const addPackageToCart = async (pkg: Package) => {
        if (!currentOrder) {
            const newOrder = await createNewOrder(1);
            if (newOrder) await addItemToOrder(1, pkg.id, newOrder);
            return;
        }
        await addItemToOrder(1, pkg.id);
    };

    const updateItemQuantity = async (itemId: number, delta: number) => {
        if (!currentOrder) return;
        const item = currentOrder.items.find((i) => i.id === itemId);
        if (!item) return;

        const newQty = item.quantity + delta;
        if (newQty < 1) { await removeItem(itemId); return; }

        try {
            const response = await put(
                rest.posOrderItem
                    .replace(":id", currentOrder.id.toString())
                    .replace(":itemId", itemId.toString()),
                { quantity: newQty }
            );
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
            }
        } catch {}
    };

    const removeItem = async (itemId: number) => {
        if (!currentOrder) return;
        try {
            const response = await del(
                rest.posOrderItem
                    .replace(":id", currentOrder.id.toString())
                    .replace(":itemId", itemId.toString())
            );
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                await loadPendingOrders();
                showToast("Item dihapus dari keranjang", "info");
            }
        } catch {
            showToast("Gagal menghapus item", "error");
        }
    };

    const setOrderMember = async (member: Member | null) => {
        setSelectedMember(member);
        setShowMemberDropdown(false);
        setMemberSearch("");
        setMemberResults([]);

        if (!currentOrder) return;
        try {
            const response = await put(
                rest.posOrderMember.replace(":id", currentOrder.id.toString()),
                { memberId: member?.id || null }
            );
            if (response.success && response.data) setCurrentOrder(response.data);
        } catch {}
    };

    const holdOrder = async () => {
        if (!currentOrder) return;
        setIsProcessing(true);
        try {
            const response = await post(
                rest.posOrderHold.replace(":id", currentOrder.id.toString()),
                {}
            );
            if (response.success) {
                setCurrentOrder(null);
                setSelectedMember(null);
                await loadPendingOrders();
                showToast("Order ditahan");
            }
        } catch {
            showToast("Gagal menahan order", "error");
        } finally {
            setIsProcessing(false);
        }
    };

    // ── Discount ───────────────────────────────
    const applyDiscount = async (type: "fixed" | "percent", value: number) => {
        if (!currentOrder || value <= 0) return;
        const payload: Record<string, unknown> =
            type === "fixed" ? { discountAmount: value } : { discountPercent: value };
        try {
            const response = await put(
                rest.posOrderDiscount.replace(":id", currentOrder.id.toString()),
                payload
            );
            if (response.success && response.data) {
                setCurrentOrder(response.data);
                showToast("Diskon berhasil diterapkan");
            }
        } catch {
            showToast("Gagal menerapkan diskon", "error");
        }
    };

    const removeDiscount = async () => {
        if (!currentOrder) return;
        try {
            const response = await put(
                rest.posOrderDiscount.replace(":id", currentOrder.id.toString()),
                { discountAmount: 0 }
            );
            if (response.success && response.data) setCurrentOrder(response.data);
        } catch {}
    };

    // ── Cash Movement ──────────────────────────
    const submitCashMovement = async (
        sessionId: number,
        type: "in" | "out",
        amount: number,
        reason: string
    ) => {
        try {
            const response = await post(
                rest.cashierSessionMovement.replace(":id", sessionId.toString()),
                { movementType: type === "in" ? 3 : 4, amount, reason }
            );
            if (response.success) {
                await loadInitData();
                showToast(`Kas ${type === "in" ? "masuk" : "keluar"} berhasil dicatat`);
            } else {
                showToast(response.message || "Gagal mencatat pergerakan kas", "error");
            }
        } catch {
            showToast("Gagal mencatat pergerakan kas", "error");
        }
    };

    // ── Filter helper ──────────────────────────
    const getFilteredServices = (
        selectedCategory: number | null,
        search: string
    ): ServiceVariant[] => {
        if (!initData) return [];
        let services: ServiceVariant[];
        if (selectedCategory === null) {
            services = initData.categories.flatMap((c) => c.services);
        } else {
            const cat = initData.categories.find((c) => c.id === selectedCategory);
            services = cat?.services || [];
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            services = services.filter(
                (s) =>
                    s.displayName.toLowerCase().includes(q) ||
                    s.serviceName.toLowerCase().includes(q)
            );
        }
        return services;
    };

    return {
        initData,
        loading,
        loadInitData,

        currentOrder,
        setCurrentOrder,
        pendingOrders,

        selectedMember,
        memberSearch,
        setMemberSearch: handleSetMemberSearch,
        memberResults,
        showMemberDropdown,
        setShowMemberDropdown,

        selectedTherapist,
        setSelectedTherapist,

        createNewOrder,
        loadPendingOrders,
        selectOrder,

        addServiceToCart,
        addPackageToCart,
        updateItemQuantity,
        removeItem,

        setOrderMember,
        holdOrder,

        applyDiscount,
        removeDiscount,
        submitCashMovement,

        isProcessing,
        getFilteredServices,
    };
}
