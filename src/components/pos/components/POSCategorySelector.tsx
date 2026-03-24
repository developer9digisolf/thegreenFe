/**
 * POS Category Selector Component
 * Displays categories in a grid for easy selection
 */

'use client';

import React from 'react';
import { Category } from '../types/pos.types';

interface IPOSCategorySelectorProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (categoryId: number | null) => void;
}

export function POSCategorySelector({
  categories,
  selectedCategory,
  onSelectCategory,
}: IPOSCategorySelectorProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="category-selector">
      <button
        className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        <div className="category-icon">🏠</div>
        <div className="category-name">All</div>
      </button>

      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
          onClick={() => onSelectCategory(category.id)}
          style={{
            borderColor: category.color ? `${category.color}40` : undefined,
          }}
        >
          {category.icon && (
            <div className="category-icon">{category.icon}</div>
          )}
          <div className="category-name">{category.name}</div>
          {category.services?.length > 0 && (
            <div className="category-count">{category.services.length}</div>
          )}
        </button>
      ))}
    </div>
  );
}

export default POSCategorySelector;
