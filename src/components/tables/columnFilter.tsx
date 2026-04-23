'use client'
import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Column } from './DynamicTable';

interface ColumnFilterPopupProps {
    columns: Column[];
    visibleColumns: string[];
    onToggle: (key: string) => void;
    onSetVisible: (keys: string[]) => void;
}

export function UseColumnFilterPopup({ columns, visibleColumns, onToggle, onSetVisible }: ColumnFilterPopupProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const allVisible = visibleColumns.length === columns.length;
    const hiddenCount = columns.length - visibleColumns.length;

    const handleToggle = (key: string) => {
        // Enforce minimum 1 column
        if (visibleColumns.includes(key) && visibleColumns.length <= 1) return;
        onToggle(key);
    };

    const handleSelectAll = () => {
        onSetVisible(columns.map(c => c.key));
    };

    const handleDeselectAll = () => {
        // Keep at minimum the first column
        onSetVisible([columns[0].key]);
    };

    return (
        <div className="relative inline-block text-left" ref={popupRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
            >
                <LayoutGrid size={16} />
                <span>Kolom</span>
                {hiddenCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-gray-500 rounded-full">
                        -{hiddenCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 w-56 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-xl">
                    <div className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tampilkan Kolom</h4>
                            <button
                                onClick={allVisible ? handleDeselectAll : handleSelectAll}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                {allVisible ? 'Sembunyikan semua' : 'Tampilkan semua'}
                            </button>
                        </div>

                        <div className="space-y-1">
                            {columns.map(col => {
                                const isVisible = visibleColumns.includes(col.key);
                                const isLastVisible = isVisible && visibleColumns.length <= 1;
                                return (
                                    <label
                                        key={col.key}
                                        className={`flex items-center gap-3 p-1 rounded ${isLastVisible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                                        title={isLastVisible ? 'Minimal 1 kolom harus ditampilkan' : undefined}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isVisible}
                                            onChange={() => handleToggle(col.key)}
                                            disabled={isLastVisible}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                        <span className="text-sm text-gray-700">{col.title}</span>
                                    </label>
                                );
                            })}
                        </div>

                        {visibleColumns.length < columns.length && (
                            <p className="text-xs text-gray-400 pt-1">
                                {hiddenCount} kolom disembunyikan
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}