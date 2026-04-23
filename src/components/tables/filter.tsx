'use client'
import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronRight } from 'lucide-react';

export interface FilterOption {
    label: string;
    value: string;
}

export interface FilterSection {
    key: string;
    title: string;
    type: 'checkbox' | 'price-range';
    options?: FilterOption[];
}

export interface FilterValues {
    [sectionKey: string]: string[] | { min: string; max: string };
}

interface FilterPopupProps {
    // Config: what sections and options to show
    filterConfig: FilterSection[];
    // Controlled state
    values: FilterValues;
    onChange: (values: FilterValues) => void;
    onApply?: (values: FilterValues) => void;
    onReset?: () => void;
}

export function UseFilterPopup({ filterConfig, values, onChange, onApply, onReset }: FilterPopupProps) {
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

    // Count active filters for badge
    const activeCount = filterConfig.reduce((count, section) => {
        const val = values[section.key];
        if (!val) return count;
        if (Array.isArray(val)) return count + val.length;
        // price range: count as 1 if either min or max is set
        if ((val as any).min || (val as any).max) return count + 1;
        return count;
    }, 0);

    const handleCheckboxToggle = (sectionKey: string, optionValue: string) => {
        const current = (values[sectionKey] as string[]) ?? [];
        const updated = current.includes(optionValue)
            ? current.filter(v => v !== optionValue)
            : [...current, optionValue];
        onChange({ ...values, [sectionKey]: updated });
    };

    const handlePriceChange = (sectionKey: string, field: 'min' | 'max', val: string) => {
        const current = (values[sectionKey] as { min: string; max: string }) ?? { min: '', max: '' };
        onChange({ ...values, [sectionKey]: { ...current, [field]: val } });
    };

    const handleReset = () => {
        // Build empty state for all sections
        const empty: FilterValues = {};
        filterConfig.forEach(section => {
            empty[section.key] = section.type === 'price-range' ? { min: '', max: '' } : [];
        });
        onChange(empty);
        onReset?.();
    };

    const handleApply = () => {
        onApply?.(values);
        setIsOpen(false);
    };

    return (
        <div className="relative inline-block text-left" ref={popupRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
            >
                <Filter size={16} />
                <span>Filter</span>
                {activeCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                        {activeCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 z-20 w-64 mt-2 origin-top-right bg-white border border-gray-200 rounded-md shadow-xl max-h-[32rem] overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {filterConfig.map((section, idx) => (
                            <React.Fragment key={section.key}>
                                {idx > 0 && <hr className="border-gray-100" />}

                                {section.type === 'checkbox' && section.options && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
                                        <div className="space-y-2">
                                            {section.options.map(opt => (
                                                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={((values[section.key] as string[]) ?? []).includes(opt.value)}
                                                        onChange={() => handleCheckboxToggle(section.key, opt.value)}
                                                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm text-gray-600">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {section.type === 'price-range' && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium text-gray-900">{section.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={((values[section.key] as any) ?? {}).min ?? ''}
                                                onChange={e => handlePriceChange(section.key, 'min', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                            <span className="text-gray-400">-</span>
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={((values[section.key] as any) ?? {}).max ?? ''}
                                                onChange={e => handlePriceChange(section.key, 'max', e.target.value)}
                                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                                            />
                                            <button
                                                onClick={handleApply}
                                                className="p-1.5 bg-orange-400 text-white rounded hover:bg-orange-500 transition-colors flex-shrink-0"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}

                        <hr className="border-gray-100" />

                        <div className="flex items-center justify-between pt-2">
                            <button
                                onClick={handleReset}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Reset Filters
                            </button>
                            <button
                                onClick={handleApply}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}