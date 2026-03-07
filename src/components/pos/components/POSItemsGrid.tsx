/**
 * POS Items Grid Component
 * Displays services, packages, or credit packages in a grid
 */

'use client';

import React from 'react';
import { Category, Package, CreditPackage, PosMode } from '../types/pos.types';

interface IPOSItemsGridProps {
  mode: PosMode;
  categories: Category[];
  selectedCategory: number | null;
  packages: Package[];
  creditPackages: CreditPackage[];
  onItemClick: (item: any) => void;
}

export function POSItemsGrid({
  mode,
  categories,
  selectedCategory,
  packages,
  creditPackages,
  onItemClick,
}: IPOSItemsGridProps) {
  const getFilteredItems = () => {
    if (mode === 'session') {
      if (selectedCategory === null) {
        // Return all services from all categories
        return categories.flatMap((cat) =>
          cat.services.map((service) => ({
            ...service,
            categoryColor: cat.color,
            categoryName: cat.name,
          }))
        );
      }
      const category = categories.find((cat) => cat.id === selectedCategory);
      return category?.services || [];
    }

    if (mode === 'voucher') {
      return packages;
    }

    if (mode === 'redeem') {
      return creditPackages;
    }

    return [];
  };

  const items = getFilteredItems();

  if (items.length === 0) {
    return (
      <div className="items-grid empty">
        <div className="empty-icon">📦</div>
        <p>No items available</p>
      </div>
    );
  }

  return (
    <div className="items-grid">
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="item-card"
          onClick={() => onItemClick(item)}
          style={{
            borderLeftColor: item.categoryColor || '#ddd',
          }}
        >
          <div className="item-header">
            {item.icon && <div className="item-icon">{item.icon}</div>}
            <div className="item-name">{item.displayName || item.name}</div>
          </div>

          {item.itemDescription && (
            <div className="item-description">{item.itemDescription}</div>
          )}

          {item.variantName && (
            <div className="item-variant">{item.variantName}</div>
          )}

          {item.duration > 0 && (
            <div className="item-duration">⏱ {item.duration} min</div>
          )}

          {mode === 'voucher' && item.totalSessions > 0 && (
            <div className="item-sessions">{item.totalSessions} sessions</div>
          )}

          {mode === 'redeem' && item.bonusPercentage > 0 && (
            <div className="item-bonus">+{item.bonusPercentage}% bonus</div>
          )}

          <div className="item-footer">
            <div className="item-price">{formatPrice(item)}</div>
            <button className="add-btn">Add</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatPrice(item: any): string {
  let price = 0;

  if (item.unitPrice) {
    price = item.unitPrice;
  } else if (item.price) {
    price = item.price;
  } else if (item.payAmount) {
    price = item.payAmount;
  } else if (item.pricePerSession) {
    price = item.pricePerSession;
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

export default POSItemsGrid;
