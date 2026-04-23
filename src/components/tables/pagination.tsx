import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PageInfo {
    currentPage: number;
    path: string;
    total: number;
    pageSize: number;
}

interface PaginationProps {
    pageInfo: PageInfo;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
}

export function UsePagination({ pageInfo, onPageChange, onPageSizeChange }: PaginationProps) {
    const { currentPage, total, pageSize } = pageInfo;

    // Derived — always correct even when total changes from API
    const lastPage = Math.max(1, Math.ceil(total / pageSize));

    const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, total);

    // Clamp currentPage if it's now out of range (e.g. after pageSize change)
    const safePage = Math.min(currentPage, lastPage);
    if (safePage !== currentPage) {
        // Notify parent to correct the page
        onPageChange(safePage);
    }

    const getPageNumbers = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const maxVisible = 5;

        if (lastPage <= maxVisible) {
            for (let i = 1; i <= lastPage; i++) pages.push(i);
        } else if (currentPage <= 3) {
            for (let i = 1; i <= 4; i++) pages.push(i);
            pages.push('...');
            pages.push(lastPage);
        } else if (currentPage >= lastPage - 2) {
            pages.push(1);
            pages.push('...');
            for (let i = lastPage - 3; i <= lastPage; i++) pages.push(i);
        } else {
            pages.push(1);
            pages.push('...');
            pages.push(currentPage - 1);
            pages.push(currentPage);
            pages.push(currentPage + 1);
            pages.push('...');
            pages.push(lastPage);
        }
        return pages;
    };

    return (
        <div className="flex items-center justify-between px-4 py-4 bg-white border-t border-gray-200">
            <div className="text-sm text-gray-500">
                Menampilkan {startItem}–{endItem} dari {total} data
            </div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Tampilkan</span>
                    <select
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    >
                        {[10, 20, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </select>
                    <span>data</span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map((page, index) =>
                        page === '...' ? (
                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`min-w-[32px] h-8 px-2 text-sm border rounded transition-colors ${currentPage === page
                                    ? 'bg-blue-600 text-white border-blue-600 font-medium'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        )
                    )}

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= lastPage || total === 0}
                        className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}