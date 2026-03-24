/**
 * POS Cart Component
 * Displays current order items and totals
 */

'use client';

import React from 'react';
import { Order } from '../types/pos.types';

interface IPOSCartProps {
  order: Order | null;
  onRemoveItem: (index: number) => void;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onProceedToPayment: () => void;
  onClearOrder: () => void;
}

export function POSCart({
  order,
  onRemoveItem,
  onUpdateQuantity,
  onProceedToPayment,
  onClearOrder,
}: IPOSCartProps) {
  if (!order) {
    return (
      <div className="pos-cart empty">
        <div className="empty-cart-icon">🛒</div>
        <p>No items in cart</p>
      </div>
    );
  }

  return (
    <div className="pos-cart">
      <div className="cart-header">
        <h3>Current Order</h3>
        <button className="clear-btn" onClick={onClearOrder}>
          Clear
        </button>
      </div>

      <div className="cart-items">
        {order.items.map((item, index) => (
          <div key={`${item.id}-${index}`} className="cart-item">
            <div className="item-info">
              <div className="item-name">{item.itemName}</div>
              {item.itemDescription && (
                <div className="item-description">{item.itemDescription}</div>
              )}
              <div className="item-price">{formatCurrency(item.unitPrice)}</div>
            </div>

            <div className="item-controls">
              <button
                className="qty-btn"
                onClick={() => onUpdateQuantity(index, item.quantity - 1)}
              >
                -
              </button>
              <span className="qty">{item.quantity}</span>
              <button
                className="qty-btn"
                onClick={() => onUpdateQuantity(index, item.quantity + 1)}
              >
                +
              </button>
            </div>

            <div className="item-subtotal">{formatCurrency(item.subtotal)}</div>

            <button
              className="remove-btn"
              onClick={() => onRemoveItem(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>

        {order.discountAmount > 0 && (
          <div className="summary-row discount">
            <span>Discount</span>
            <span>-{formatCurrency(order.discountAmount)}</span>
          </div>
        )}

        {order.taxAmount > 0 && (
          <div className="summary-row">
            <span>Tax</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
        )}

        <div className="summary-row total">
          <span>Total</span>
          <span className="total-amount">{formatCurrency(order.grandTotal)}</span>
        </div>

        {order.totalDuration > 0 && (
          <div className="summary-row">
            <span>Duration</span>
            <span>{order.totalDuration} min</span>
          </div>
        )}
      </div>

      <button className="proceed-btn" onClick={onProceedToPayment}>
        Proceed to Payment
      </button>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default POSCart;
