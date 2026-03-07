/**
 * POS API Service
 * All API calls for the POS system
 */

import request from '@afx/utils/request.utils';
import { PosInitData, Order, Member, CashierSession } from '../types/pos.types';

const API_BASE = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:5100/api/';

// Endpoints
const POS_ENDPOINTS = {
  INIT: 'pos/init',
  SEARCH_MEMBER: 'members/search',
  GET_MEMBER_DETAIL: 'members',
  CREATE_SESSION: 'cashier-sessions',
  CLOSE_SESSION: 'cashier-sessions',
  CREATE_ORDER: 'pos/orders',
  UPDATE_ORDER: 'pos/orders',
  PENDING_ORDERS: 'pos/pending',
  COMPLETE_ORDER: 'pos/orders/complete',
  CANCEL_ORDER: 'pos/orders/cancel',
  ADD_PAYMENT: 'pos/orders/payment',
  FINALIZE_ORDER: 'pos/orders/finalize',
};

/**
 * Get POS initialization data
 */
export async function getPosInitData(): Promise<PosInitData> {
  const response = await request<PosInitData>({
    url: POS_ENDPOINTS.INIT,
    method: 'GET',
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to initialize POS');
}

/**
 * Search members by phone or name
 */
export async function searchMembers(query: string): Promise<Member[]> {
  if (!query || query.length < 2) return [];

  const response = await request<Member[]>({
    url: POS_ENDPOINTS.SEARCH_MEMBER,
    method: 'GET',
    data: { query },
  });

  if (response.success) {
    return response.data;
  }

  return [];
}

/**
 * Get member details
 */
export async function getMemberDetail(memberId: number): Promise<Member> {
  const response = await request<Member>({
    url: `${POS_ENDPOINTS.GET_MEMBER_DETAIL}/${memberId}`,
    method: 'GET',
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to get member details');
}

/**
 * Create cashier session
 */
export async function createCashierSession(openingCash: number): Promise<CashierSession> {
  const response = await request<CashierSession>({
    url: POS_ENDPOINTS.CREATE_SESSION,
    method: 'POST',
    data: { openingCash },
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to create session');
}

/**
 * Close cashier session
 */
export async function closeCashierSession(
  sessionId: number,
  actualClosingCash: number
): Promise<CashierSession> {
  const response = await request<CashierSession>({
    url: `${POS_ENDPOINTS.CLOSE_SESSION}/${sessionId}`,
    method: 'PUT',
    data: { actualClosingCash },
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to close session');
}

/**
 * Create new order
 */
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const response = await request<Order>({
    url: POS_ENDPOINTS.CREATE_ORDER,
    method: 'POST',
    data: orderData,
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to create order');
}

/**
 * Update existing order
 */
export async function updateOrder(orderId: number, orderData: Partial<Order>): Promise<Order> {
  const response = await request<Order>({
    url: `${POS_ENDPOINTS.UPDATE_ORDER}/${orderId}`,
    method: 'PUT',
    data: orderData,
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to update order');
}

/**
 * Complete order (set as pending)
 */
export async function completeOrder(orderId: number): Promise<Order> {
  const response = await request<Order>({
    url: `${POS_ENDPOINTS.COMPLETE_ORDER}/${orderId}`,
    method: 'POST',
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to complete order');
}

/**
 * Cancel order
 */
export async function cancelOrder(orderId: number): Promise<void> {
  const response = await request<void>({
    url: `${POS_ENDPOINTS.CANCEL_ORDER}/${orderId}`,
    method: 'DELETE',
  });

  if (!response.success) {
    throw new Error(response.message || 'Failed to cancel order');
  }
}

/**
 * Add payment to order
 */
export async function addPayment(
  orderId: number,
  paymentMethodId: number,
  amount: number,
  referenceNumber?: string
): Promise<Order> {
  const response = await request<Order>({
    url: `${POS_ENDPOINTS.ADD_PAYMENT}/${orderId}`,
    method: 'POST',
    data: {
      paymentMethodId,
      amount,
      referenceNumber,
    },
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to add payment');
}

/**
 * Finalize order
 */
export async function finalizeOrder(orderId: number): Promise<Order> {
  const response = await request<Order>({
    url: `${POS_ENDPOINTS.FINALIZE_ORDER}/${orderId}`,
    method: 'POST',
  });

  if (response.success) {
    return response.data;
  }

  throw new Error(response.message || 'Failed to finalize order');
}

/**
 * Get pending orders
 */
export async function getPendingOrders(): Promise<any[]> {
  const response = await request<any[]>({
    url: POS_ENDPOINTS.PENDING_ORDERS,
    method: 'GET',
  });

  if (response.success) {
    return response.data;
  }

  return [];
}
