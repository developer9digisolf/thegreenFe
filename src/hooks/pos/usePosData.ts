"use client";

import { useState, useCallback, useMemo } from "react";
import type { PosInitData, Member, ServiceVariant, Package, ServiceCategory } from "@afx/interfaces/pos.iface";
import {
    GetPosInitService,
    GetBranchServicesService,
    GetActivePaymentMethodsService,
    GetAvailableTherapistsService,
    SearchMembersPosService,
    GetServiceCategoriesService,
} from "@afx/services/pos.service";
import { CreditPackageGetActiveService } from "@afx/services/credit-package.service";

// ============================================
// TYPES
// ============================================
export interface CartItem {
    cartKey:         string;
    itemType:        number; // 0=Service, 1=Package, 2=CreditPackage
    serviceVariantId: number | null;
    packageId:       number | null;
    creditPackageId: number | null;
    displayName:     string;
    duration:        number;
    unitPrice:       number;
    quantity:        number;
    icon?:           string;
}

export interface UsePosDataReturn {
    // Init
    initData:         PosInitData | null;
    loading:          boolean;
    loadInitData:     (branchId?: number) => Promise<void>;

    // Kategori
    categories:          ServiceCategory[];
    categoriesLoading:   boolean;

    // Services
    services:                ServiceVariant[];
    loadServicesByCategory:  (branchId: number, categoryId: number | null) => Promise<void>;

    // Member
    selectedMember:       Member | null;
    setSelectedMember:    (m: Member | null) => void;
    memberSearch:         string;
    setMemberSearch:      (v: string) => void;
    memberResults:        Member[];
    showMemberDropdown:   boolean;
    setShowMemberDropdown:(v: boolean) => void;

    // Therapist
    selectedTherapist:    number | null;
    setSelectedTherapist: (id: number | null) => void;

    // Cart
    cartItems:               CartItem[];
    cartSubtotal:            number;
    cartDiscount:            number;
    setCartDiscount:         (val: number) => void;
    cartGrandTotal:          number;
    cartTotalDuration:       number;
    addServiceToCart:        (variant: ServiceVariant) => void;
    addPackageToCart:        (pkg: Package) => void;
    addCreditPackageToCart:  (cp: any) => void;
    updateCartItemQuantity:  (key: string, delta: number) => void;
    removeCartItem:          (key: string) => void;
    clearCart:               () => void;

    getFilteredServices: (selectedCategory: number | null, search: string) => ServiceVariant[];
}

// ============================================
// HELPER
// ============================================
function mapServiceVariant(srv: any): ServiceVariant {
    return {
        id:            srv.serviceVariantId,        // pakai serviceVariantId sebagai id unik
        serviceId:     srv.id,                      // id row sebagai referensi service
        serviceName:   srv.serviceName,
        variantName:   srv.serviceVariantLabel,
        displayName:   `${srv.serviceName} ${srv.serviceVariantLabel ?? ""}`.trim(),
        duration:      srv.serviceVariantDuration ?? 0,
        price:         srv.price,
        icon:          srv.icon ?? "fa-spa",
        categoryColor: srv.categoryColor ?? "var(--spa-green)",
        categoryId:    null,                        // backend belum kirim, filter pakai backend
    };
}

function mapServiceCategory(c: any): ServiceCategory {
    return {
        id:           c.id,
        name:         c.name,
        description:  c.description,
        icon:         c.icon,
        color:        c.color,
        sortOrder:    c.sortOrder ?? 0,
        isActive:     c.isActive,
        serviceCount: c.serviceCount,
    };
}

// ============================================
// HOOK
// ============================================
export function usePosData(
    showToast: (msg: string, type?: "success" | "error" | "info") => void
): UsePosDataReturn {

    // ── State ──────────────────────────────────────────────────────────────────
    const [initData, setInitData]                     = useState<PosInitData | null>(null);
    const [loading, setLoading]                       = useState(false);
    const [categories, setCategories]                 = useState<ServiceCategory[]>([]);
    const [categoriesLoading, setCategoriesLoading]   = useState(false);
    const [services, setServices]                     = useState<ServiceVariant[]>([]);
    const [selectedMember, setSelectedMember]         = useState<Member | null>(null);
    const [memberSearch, setMemberSearch]             = useState("");
    const [memberResults, setMemberResults]           = useState<Member[]>([]);
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [selectedTherapist, setSelectedTherapist]   = useState<number | null>(null);
    const [cartItems, setCartItems]                   = useState<CartItem[]>([]);
    const [cartDiscount, setCartDiscount]             = useState(0);

    // ── Computed cart values ───────────────────────────────────────────────────
    const cartSubtotal      = useMemo(() => cartItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0), [cartItems]);
    const cartGrandTotal    = useMemo(() => Math.max(0, cartSubtotal - cartDiscount), [cartSubtotal, cartDiscount]);
    const cartTotalDuration = useMemo(() => cartItems.reduce((acc, i) => acc + i.duration * i.quantity, 0), [cartItems]);

    // ── Load kategori ──────────────────────────────────────────────────────────
    const loadCategories = useCallback(async (branchId: number) => {
        setCategoriesLoading(true);
        try {
            const res = await GetServiceCategoriesService(branchId);
            if (res.success && Array.isArray(res.data)) {
                setCategories(res.data.map(mapServiceCategory));
            }
        } catch {
            // silent fail — chip "Semua" tetap bisa dipakai
        } finally {
            setCategoriesLoading(false);
        }
    }, []);

    // ── Load services (bisa dengan atau tanpa filter kategori) ─────────────────
    const loadServicesByCategory = useCallback(async (branchId: number, categoryId: number | null) => {
        if (!branchId) {
            showToast("Branch tidak ditemukan", "error");
            return;
        }
        setLoading(true);
        try {
            const res = await GetBranchServicesService(branchId, categoryId ?? undefined);
            if (res.success && Array.isArray(res.data)) {
                setServices(res.data.map(mapServiceVariant));
            }
        } catch {
            showToast("Gagal memuat layanan", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    // ── Load init data ─────────────────────────────────────────────────────────
    const loadInitData = useCallback(async (branchId?: number) => {
        setLoading(true);
        try {
            const [initRes, creditPackagesRes] = await Promise.all([
                GetPosInitService().catch(() => ({ success: false, data: null })),
                CreditPackageGetActiveService().catch(() => ({ success: false, data: [] })),
            ]);

            let combinedData: PosInitData = initRes.success && initRes.data
                ? initRes.data
                : {
                    hasOpenSession: true, categories: [], packages: [],
                    creditPackages: [], paymentMethods: [], pendingOrders: [], therapists: [],
                  };

            // Override creditPackages from master API if successful
            if ((creditPackagesRes as any).success && Array.isArray((creditPackagesRes as any).data)) {
                combinedData.creditPackages = (creditPackagesRes as any).data;
            } else if (Array.isArray(creditPackagesRes)) {
                // In case request() returns data directly (standard in some older parts of the app)
                combinedData.creditPackages = creditPackagesRes;
            }

            const bId = branchId ?? (combinedData.currentSession as any)?.branchId;

            if (bId) {
                // Fetch services & kategori paralel — tanpa filter kategori (load semua dulu)
                const [servicesRes] = await Promise.all([
                    GetBranchServicesService(bId).catch(() => ({ success: false, data: [] })),
                    loadCategories(bId),
                ]);

                if (servicesRes.success && Array.isArray(servicesRes.data)) {
                    const mapped = servicesRes.data.map(mapServiceVariant);
                    setServices(mapped);

                    // Tetap isi initData.categories untuk backward compatibility
                    combinedData.categories = [{
                        id: 999, name: "Semua Layanan", sortOrder: 1,
                        services: mapped,
                    }];
                }
            }

            if (!initRes.success) {
                const [payRes, therapistRes] = await Promise.all([
                    GetActivePaymentMethodsService().catch(() => ({ data: [] })),
                    GetAvailableTherapistsService().catch(() => ({ data: [] })),
                ]);
                combinedData.paymentMethods = payRes.data     ?? [];
                combinedData.therapists     = therapistRes.data ?? [];
            }

            setInitData(combinedData);
        } catch {
            showToast("Gagal memuat layanan kasir", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast, loadCategories]);

    // ── Member search ──────────────────────────────────────────────────────────
    const searchMembers = useCallback(async (query: string) => {
        if (query.length < 2) { setMemberResults([]); return; }
        try {
            const res = await SearchMembersPosService(query);
            if (res.success && res.data?.items) setMemberResults(res.data.items);
        } catch {}
    }, []);

    const handleSetMemberSearch = useCallback((v: string) => {
        setMemberSearch(v);
        searchMembers(v);
        setShowMemberDropdown(true);
    }, [searchMembers]);

    // ── Cart handlers ──────────────────────────────────────────────────────────
    const addServiceToCart = useCallback((variant: ServiceVariant) => {
        const key = `service-${variant.id}`;
        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === key);
            if (existing) return prev.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, {
                cartKey: key, itemType: 0, serviceVariantId: variant.id,
                packageId: null, creditPackageId: null, displayName: variant.displayName,
                duration: variant.duration, unitPrice: variant.price, quantity: 1, icon: variant.icon,
            }];
        });
    }, []);

    const addPackageToCart = useCallback((pkg: Package) => {
        const key = `package-${pkg.id}`;
        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === key);
            if (existing) return prev.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, {
                cartKey: key, itemType: 1, serviceVariantId: null,
                packageId: pkg.id, creditPackageId: null, displayName: pkg.name,
                duration: 0, unitPrice: pkg.price, quantity: 1,
            }];
        });
    }, []);

    const addCreditPackageToCart = useCallback((cp: any) => {
        const key = `credit-${cp.id}`;
        setCartItems(prev => {
            const existing = prev.find(i => i.cartKey === key);
            if (existing) return prev.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, {
                cartKey: key, itemType: 2, serviceVariantId: null,
                packageId: null, creditPackageId: cp.id, displayName: cp.name,
                duration: 0, unitPrice: cp.payAmount, quantity: 1,
            }];
        });
    }, []);

    const updateCartItemQuantity = useCallback((key: string, delta: number) => {
        setCartItems(prev =>
            prev.map(i => i.cartKey === key ? { ...i, quantity: i.quantity + delta } : i)
                .filter(i => i.quantity > 0)
        );
    }, []);

    const removeCartItem = useCallback((key: string) => {
        setCartItems(prev => prev.filter(i => i.cartKey !== key));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
        setCartDiscount(0);
        setSelectedMember(null);
        setSelectedTherapist(null);
    }, []);

    // ── Filter services di frontend (untuk search realtime) ────────────────────
    // Catatan: filter by kategori sudah ditangani backend via loadServicesByCategory.
    // getFilteredServices hanya dipakai untuk search text lokal.
    const getFilteredServices = useCallback((selectedCategory: number | null, search: string): ServiceVariant[] => {
        let result = selectedCategory === null
            ? services
            : services.filter(s => s.categoryId === selectedCategory);

        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(s =>
                s.displayName?.toLowerCase().includes(q) ||
                s.serviceName?.toLowerCase().includes(q)
            );
        }
        return result;
    }, [services]);

    // ── Return ─────────────────────────────────────────────────────────────────
    return {
        initData, loading, loadInitData,
        categories, categoriesLoading,
        services, loadServicesByCategory,
        selectedMember, setSelectedMember,
        memberSearch, setMemberSearch: handleSetMemberSearch,
        memberResults, showMemberDropdown, setShowMemberDropdown,
        selectedTherapist, setSelectedTherapist,
        cartItems, cartSubtotal, cartDiscount, setCartDiscount,
        cartGrandTotal, cartTotalDuration,
        addServiceToCart, addPackageToCart, addCreditPackageToCart,
        updateCartItemQuantity, removeCartItem, clearCart,
        getFilteredServices,
    };
}