/**
 * POS State Management Hook
 * Centralized state management for the POS system
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Order,
  OrderItem,
  Member,
  Therapist,
  Category,
  Package,
  CreditPackage,
  PaymentMethod,
  PosMode,
  PosInitData,
  PendingOrder,
  CashierSession,
} from '../types/pos.types';
import {
  getPosInitData,
  searchMembers,
  getMemberDetail,
  createCashierSession,
  closeCashierSession,
  createOrder,
  updateOrder,
  completeOrder,
  cancelOrder,
  addPayment,
  finalizeOrder,
  getPendingOrders,
} from '../services/pos.service';

export function usePosState() {
  // Loading states
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Initialization data
  const [initData, setInitData] = useState<PosInitData | null>(null);

  // Mode
  const [mode, setMode] = useState<PosMode>('session');

  // Current order
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  // Pending orders
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);

  // Selections
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [selectedCreditPackage, setSelectedCreditPackage] = useState<number | null>(null);

  // Member
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  // Payment
  const [payments, setPayments] = useState<{ paymentMethodId: number; amount: number; referenceNumber?: string }[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [referenceNumber, setReferenceNumber] = useState('');

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCloseSessionModal, setShowCloseSessionModal] = useState(false);

  // Notes
  const [orderNotes, setOrderNotes] = useState('');

  // Session closing
  const [closingCash, setClosingCash] = useState(0);

  // Initialize POS
  const initializePOS = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosInitData();
      setInitData(data);
      setPendingOrders(data.pendingOrders || []);
    } catch (error) {
      console.error('Failed to initialize POS:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Search members
  const handleMemberSearch = useCallback(async (query: string) => {
    setMemberSearch(query);

    if (!query || query.length < 2) {
      setMemberResults([]);
      setShowMemberDropdown(false);
      return;
    }

    try {
      const results = await searchMembers(query);
      setMemberResults(results);
      setShowMemberDropdown(results.length > 0);
    } catch (error) {
      console.error('Failed to search members:', error);
    }
  }, []);

  // Select member
  const selectMember = useCallback(async (member: Member) => {
    try {
      const detail = await getMemberDetail(member.id);
      setSelectedMember(detail);
      setMemberSearch(detail.name);
      setShowMemberDropdown(false);
      setMemberResults([]);
    } catch (error) {
      console.error('Failed to get member details:', error);
    }
  }, []);

  // Clear member
  const clearMember = useCallback(() => {
    setSelectedMember(null);
    setMemberSearch('');
    setShowMemberDropdown(false);
    setMemberResults([]);
  }, []);

  // Add item to order
  const addToOrder = useCallback((item: OrderItem) => {
    setCurrentOrder((prevOrder) => {
      if (!prevOrder) {
        // Create new order
        return {
          id: 0,
          saleCode: '',
          saleType: 1,
          saleTypeName: 'Session Sale',
          cashierSessionId: initData?.currentSession?.id || 0,
          items: [item],
          totalItems: 1,
          totalDuration: item.duration,
          subtotal: item.subtotal,
          discountAmount: 0,
          taxAmount: 0,
          grandTotal: item.subtotal,
          amountPaid: 0,
          changeAmount: 0,
          paymentStatus: 0,
          paymentStatusName: 'Unpaid',
        };
      }

      // Add to existing order
      const existingItemIndex = prevOrder.items.findIndex(
        (i) =>
          i.serviceVariantId === item.serviceVariantId &&
          i.packageId === item.packageId &&
          i.creditPackageId === item.creditPackageId
      );

      let newItems: OrderItem[];
      if (existingItemIndex >= 0) {
        // Update quantity
        newItems = prevOrder.items.map((i, index) =>
          index === existingItemIndex
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
            : i
        );
      } else {
        newItems = [...prevOrder.items, item];
      }

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalDuration = newItems.reduce((sum, i) => sum + i.duration * i.quantity, 0);
      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        ...prevOrder,
        items: newItems,
        totalItems,
        totalDuration,
        subtotal,
        grandTotal: subtotal - prevOrder.discountAmount + prevOrder.taxAmount,
      };
    });
  }, [initData?.currentSession?.id]);

  // Remove item from order
  const removeFromOrder = useCallback((itemIndex: number) => {
    setCurrentOrder((prevOrder) => {
      if (!prevOrder) return null;

      const newItems = prevOrder.items.filter((_, i) => i !== itemIndex);

      if (newItems.length === 0) {
        return null;
      }

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalDuration = newItems.reduce((sum, i) => sum + i.duration * i.quantity, 0);
      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        ...prevOrder,
        items: newItems,
        totalItems,
        totalDuration,
        subtotal,
        grandTotal: subtotal - prevOrder.discountAmount + prevOrder.taxAmount,
      };
    });
  }, []);

  // Update item quantity
  const updateItemQuantity = useCallback((itemIndex: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemIndex);
      return;
    }

    setCurrentOrder((prevOrder) => {
      if (!prevOrder) return null;

      const newItems = prevOrder.items.map((i, index) =>
        index === itemIndex
          ? { ...i, quantity, subtotal: quantity * i.unitPrice }
          : i
      );

      const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
      const totalDuration = newItems.reduce((sum, i) => sum + i.duration * i.quantity, 0);
      const subtotal = newItems.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        ...prevOrder,
        items: newItems,
        totalItems,
        totalDuration,
        subtotal,
        grandTotal: subtotal - prevOrder.discountAmount + prevOrder.taxAmount,
      };
    });
  }, [removeFromOrder]);

  // Clear order
  const clearOrder = useCallback(() => {
    setCurrentOrder(null);
    setSelectedTherapist(null);
    setSelectedPackage(null);
    setSelectedCreditPackage(null);
    setSelectedCategory(null);
    setOrderNotes('');
    setPayments([]);
    setSelectedPaymentMethod(null);
    setPaymentAmount(0);
    setReferenceNumber('');
  }, []);

  // Complete order (set as pending)
  const handleCompleteOrder = useCallback(async () => {
    if (!currentOrder || !initData?.currentSession) return;

    setSubmitting(true);
    try {
      await completeOrder(currentOrder.id);
      await refreshPendingOrders();
      clearOrder();
      setShowCompleteModal(false);
    } catch (error) {
      console.error('Failed to complete order:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [currentOrder, initData?.currentSession]);

  // Refresh pending orders
  const refreshPendingOrders = useCallback(async () => {
    try {
      const orders = await getPendingOrders();
      setPendingOrders(orders);
    } catch (error) {
      console.error('Failed to fetch pending orders:', error);
    }
  }, []);

  // Add payment
  const handleAddPayment = useCallback(() => {
    if (!selectedPaymentMethod || paymentAmount <= 0) return;

    setPayments((prev) => [
      ...prev,
      {
        paymentMethodId: selectedPaymentMethod,
        amount: paymentAmount,
        referenceNumber: referenceNumber || undefined,
      },
    ]);

    setSelectedPaymentMethod(null);
    setPaymentAmount(0);
    setReferenceNumber('');
  }, [selectedPaymentMethod, paymentAmount, referenceNumber]);

  // Remove payment
  const removePayment = useCallback((index: number) => {
    setPayments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Finalize order
  const handleFinalizeOrder = useCallback(async () => {
    if (!currentOrder) return;

    setSubmitting(true);
    try {
      await finalizeOrder(currentOrder.id);
      await refreshPendingOrders();
      clearOrder();
      setShowPaymentModal(false);
    } catch (error) {
      console.error('Failed to finalize order:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [currentOrder]);

  // Close session
  const handleCloseSession = useCallback(async () => {
    if (!initData?.currentSession) return;

    setSubmitting(true);
    try {
      await closeCashierSession(initData.currentSession.id, closingCash);
      await initializePOS();
      setShowCloseSessionModal(false);
    } catch (error) {
      console.error('Failed to close session:', error);
      throw error;
    } finally {
      setSubmitting(false);
    }
  }, [initData?.currentSession, closingCash, initializePOS]);

  // Get categories by mode
  const getCategories = useCallback((): Category[] => {
    if (!initData) return [];
    if (mode === 'session') return initData.categories;
    return [];
  }, [initData, mode]);

  // Get packages by mode
  const getPackages = useCallback((): Package[] => {
    if (!initData) return [];
    if (mode === 'voucher') return initData.packages;
    return [];
  }, [initData, mode]);

  // Get credit packages by mode
  const getCreditPackages = useCallback((): CreditPackage[] => {
    if (!initData) return [];
    if (mode === 'redeem') return initData.creditPackages;
    return [];
  }, [initData, mode]);

  // Calculate totals
  const getTotalPaid = useCallback(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const getRemainingAmount = useCallback(() => {
    if (!currentOrder) return 0;
    return currentOrder.grandTotal - getTotalPaid();
  }, [currentOrder, getTotalPaid()]);

  // Initialize on mount
  useEffect(() => {
    initializePOS();
  }, [initializePOS]);

  return {
    // State
    loading,
    submitting,
    initData,
    mode,
    currentOrder,
    pendingOrders,
    selectedCategory,
    selectedTherapist,
    selectedPackage,
    selectedCreditPackage,
    selectedMember,
    memberSearch,
    memberResults,
    showMemberDropdown,
    payments,
    selectedPaymentMethod,
    paymentAmount,
    referenceNumber,
    showPaymentModal,
    showCompleteModal,
    showCloseSessionModal,
    orderNotes,
    closingCash,

    // Setters
    setMode,
    setSelectedCategory,
    setSelectedTherapist,
    setSelectedPackage,
    setSelectedCreditPackage,
    setMemberSearch,
    setShowMemberDropdown,
    setPayments,
    setSelectedPaymentMethod,
    setPaymentAmount,
    setReferenceNumber,
    setShowPaymentModal,
    setShowCompleteModal,
    setShowCloseSessionModal,
    setOrderNotes,
    setClosingCash,

    // Actions
    initializePOS,
    handleMemberSearch,
    selectMember,
    clearMember,
    addToOrder,
    removeFromOrder,
    updateItemQuantity,
    clearOrder,
    handleCompleteOrder,
    refreshPendingOrders,
    handleAddPayment,
    removePayment,
    handleFinalizeOrder,
    handleCloseSession,

    // Getters
    getCategories,
    getPackages,
    getCreditPackages,
    getTotalPaid,
    getRemainingAmount,

    // Payment methods
    paymentMethods: initData?.paymentMethods || [],
    therapists: initData?.therapists || [],
    currentSession: initData?.currentSession,
  };
}
