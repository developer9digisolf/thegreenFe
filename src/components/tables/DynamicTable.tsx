"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Filter,
  LayoutGrid,
  Search,
  X
} from "lucide-react";
import { debounce } from "lodash";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface Column {
  key: string;
  title: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  filterPlaceholder?: string;
  sortable?: boolean;
  isCurrency?: boolean;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface FilterSection {
  key: string;
  title: string;
  type: "checkbox" | "radio" | "select" | "text" | "number" | "price-range";
  options?: FilterOption[];
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  multiple?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export interface SortState {
  key: string | null;
  direction: SortDirection;
}

export interface FilterValues {
  [sectionKey: string]:
    | (string | number)[]
    | string
    | number
    | null
    | { min: string; max: string };
}

export interface PageInfo {
  currentPage: number;
  total: number;
  pageSize: number;
}

export interface DynamicTableProps {
  title?: string;
  columns: Column[];
  data: any[];
  filterConfig?: FilterSection[];
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  sortState: SortState;
  onSortChange: (sort: SortState) => void;
  filterValues?: FilterValues;
  onFilterApply?: (values: FilterValues) => void;
  onFilterReset?: () => void;
  fetchDetails?: (record: any) => Promise<any[]>;
  subColumns?: Column[];
  showCheckbox?: boolean;
  onRowAction?: (record: any) => void;
  searchable?: boolean;
  onSearch?: (term: string) => void;
  searchPlaceholder?: string;
  searchText?: string;
  setSearchText?: (val: string) => void;
  filters?: React.JSX.Element | null;
  checkCanExpand?: (record: any) => boolean;
  loading?: boolean;
}

export const emptyFilterValues = (config: FilterSection[]): FilterValues =>
  Object.fromEntries(
    config.map((s) => {
      switch (s.type) {
        case "price-range":
          return [s.key, { min: "", max: "" }];
        case "checkbox":
          return [s.key, []];
        case "number":
          return [s.key, null];
        case "select":
          return [s.key, s.multiple ? [] : ""];
        default:
          return [s.key, ""];
      }
    }),
  );

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER POPUP
// ─────────────────────────────────────────────────────────────────────────────

interface FilterPopupProps {
  filterConfig: FilterSection[];
  appliedValues: FilterValues;
  onApply: (values: FilterValues) => void;
  onReset: () => void;
}

function formatNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("id-ID");
}

function parseNumber(formatted: string): string {
  return formatted.replace(/\./g, "").replace(/,/g, "");
}

function countActive(config: FilterSection[], values: FilterValues): number {
  return config.reduce((count, section) => {
    const val = values[section.key];
    if (val === undefined || val === null || val === "") return count;
    if (Array.isArray(val)) return count + val.length;
    if (typeof val === "object" && "min" in val)
      return val.min || val.max ? count + 1 : count;
    return count + 1;
  }, 0);
}

function FilterPopup({
  filterConfig,
  appliedValues,
  onApply,
  onReset,
}: FilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [openMultiKey, setOpenMultiKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<FilterValues>(appliedValues);

  useClickOutside(ref, () => {
    setDraft(appliedValues);
    setIsOpen(false);
    setOpenMultiKey(null);
  });

  useEffect(() => {
    setDraft(appliedValues);
  }, [appliedValues]);

  const activeCount = countActive(filterConfig, appliedValues);

  const setDraftKey = (key: string, value: FilterValues[string]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleCheckbox = (key: string, optionValue: string | number) => {
    const current = (draft[key] as (string | number)[]) ?? [];
    setDraftKey(
      key,
      current.includes(optionValue) ?
        current.filter((v) => v !== optionValue)
      : [...current, optionValue],
    );
  };

  const handleSingle = (key: string, value: string) => setDraftKey(key, value);
  const handleText = (key: string, value: string) => setDraftKey(key, value);

  const handleNumber = (key: string, formatted: string) => {
    const raw = parseNumber(formatted);
    setDraftKey(key, raw === "" ? null : Number(raw));
  };

  const handlePrice = (
    key: string,
    field: "min" | "max",
    formatted: string,
  ) => {
    const raw = parseNumber(formatted);
    const current = (draft[key] as { min: string; max: string }) ?? {
      min: "",
      max: "",
    };
    setDraftKey(key, { ...current, [field]: raw });
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };
  const handleReset = () => {
    onReset();
    setIsOpen(false);
  };

  const inputCls =
    "w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white";

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
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
        <div className="absolute right-0 z-20 w-72 mt-2 bg-white border border-gray-200 rounded-md shadow-xl min-h-[400px] max-h-[500px] overflow-y-auto">
          <div className="p-4 space-y-5">
            {filterConfig.map((section, idx) => (
              <React.Fragment key={section.key}>
                {idx > 0 && <hr className="border-gray-100" />}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {section.title}
                  </h4>

                  {section.type === "checkbox" && section.options && (
                    <div className="space-y-2">
                      {section.options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={(
                              (draft[section.key] as (string | number)[]) ?? []
                            ).includes(opt.value)}
                            onChange={() =>
                              handleCheckbox(section.key, opt.value)
                            }
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {section.type === "radio" && section.options && (
                    <div className="space-y-2">
                      {section.options.map((opt) => (
                        <label
                          key={opt.value}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={section.key}
                            value={opt.value}
                            checked={
                              (draft[section.key] as string) ===
                              String(opt.value)
                            }
                            onChange={() =>
                              handleSingle(section.key, String(opt.value))
                            }
                            className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-600">
                            {opt.label}
                          </span>
                        </label>
                      ))}
                      {(draft[section.key] as string) !== "" && (
                        <button
                          onClick={() => handleSingle(section.key, "")}
                          className="text-xs text-gray-400 hover:text-gray-600 underline mt-1"
                        >
                          Hapus pilihan
                        </button>
                      )}
                    </div>
                  )}

                  {section.type === "select" &&
                    section.options &&
                    (section.multiple ?
                      <div className="space-y-1">
                        <div className="relative">
                          <div
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white cursor-pointer select-none flex items-center justify-between"
                            onClick={() =>
                              setOpenMultiKey((prev) =>
                                prev === section.key ? null : section.key,
                              )
                            }
                          >
                            <span
                              className={
                                (
                                  (
                                    (draft[section.key] as (
                                      | string
                                      | number
                                    )[]) ?? []
                                  ).length === 0
                                ) ?
                                  "text-gray-400"
                                : "text-gray-700"
                              }
                            >
                              {(
                                (
                                  (draft[section.key] as (string | number)[]) ??
                                  []
                                ).length === 0
                              ) ?
                                (section.placeholder ?? "-- Pilih --")
                              : `${((draft[section.key] as (string | number)[]) ?? []).length} dipilih`
                              }
                            </span>
                            <ChevronDown
                              size={14}
                              className="text-gray-400 flex-shrink-0"
                            />
                          </div>

                          {openMultiKey === section.key && (
                            <div className="absolute z-30 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-[260px] overflow-y-scroll">
                              {section.options!.map((opt) => (
                                <label
                                  key={opt.value}
                                  className="flex items-center px-2 py-2 hover:bg-gray-100 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    className="mr-2 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    checked={(
                                      (draft[section.key] as (
                                        | string
                                        | number
                                      )[]) ?? []
                                    )
                                      .map(String)
                                      .includes(String(opt.value))}
                                    onChange={(e) => {
                                      const current =
                                        (draft[section.key] as (
                                          | string
                                          | number
                                        )[]) ?? [];
                                      setDraftKey(
                                        section.key,
                                        e.target.checked ?
                                          [...current, opt.value]
                                        : current.filter(
                                            (v) =>
                                              String(v) !== String(opt.value),
                                          ),
                                      );
                                    }}
                                  />
                                  <span className="text-sm">{opt.label}</span>
                                </label>
                              ))}
                              {(
                                (draft[section.key] as (string | number)[]) ??
                                []
                              ).length > 0 && (
                                <button
                                  type="button"
                                  className="w-full mt-1 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                                  onClick={() => setDraftKey(section.key, [])}
                                >
                                  Reset
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    : <select
                        value={(draft[section.key] as string) ?? ""}
                        onChange={(e) =>
                          handleSingle(section.key, e.target.value)
                        }
                        className={inputCls}
                      >
                        <option value="">
                          {section.placeholder ?? "-- Pilih --"}
                        </option>
                        {section.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>)}

                  {section.type === "text" && (
                    <input
                      type="text"
                      placeholder={section.placeholder ?? "Ketik..."}
                      value={(draft[section.key] as string) ?? ""}
                      onChange={(e) => handleText(section.key, e.target.value)}
                      className={inputCls}
                    />
                  )}

                  {section.type === "number" && (
                    <div className="flex items-center gap-1">
                      {section.prefix && (
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {section.prefix}
                        </span>
                      )}
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={section.placeholder ?? "0"}
                        value={
                          (
                            draft[section.key] !== null &&
                            draft[section.key] !== ""
                          ) ?
                            formatNumber(String(draft[section.key]))
                          : ""
                        }
                        onChange={(e) =>
                          handleNumber(section.key, e.target.value)
                        }
                        className={inputCls}
                      />
                      {section.suffix && (
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {section.suffix}
                        </span>
                      )}
                    </div>
                  )}

                  {section.type === "price-range" && (
                    <div className="flex items-center gap-2">
                      {section.prefix && (
                        <span className="text-sm text-gray-500 flex-shrink-0">
                          {section.prefix}
                        </span>
                      )}
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Min"
                        value={
                          (draft[section.key] as any)?.min ?
                            formatNumber(
                              String((draft[section.key] as any).min),
                            )
                          : ""
                        }
                        onChange={(e) =>
                          handlePrice(section.key, "min", e.target.value)
                        }
                        className={inputCls}
                      />
                      <span className="text-gray-400 flex-shrink-0">–</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Max"
                        value={
                          (draft[section.key] as any)?.max ?
                            formatNumber(
                              String((draft[section.key] as any).max),
                            )
                          : ""
                        }
                        onChange={(e) =>
                          handlePrice(section.key, "max", e.target.value)
                        }
                        className={inputCls}
                      />
                    </div>
                  )}
                </div>
              </React.Fragment>
            ))}

            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Reset
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

// ─────────────────────────────────────────────────────────────────────────────
// COLUMN FILTER POPUP
// ─────────────────────────────────────────────────────────────────────────────

interface ColumnFilterPopupProps {
  columns: Column[];
  visibleColumns: string[];
  onToggle: (key: string) => void;
  onSetVisible: (keys: string[]) => void;
}

function ColumnFilterPopup({
  columns,
  visibleColumns,
  onToggle,
  onSetVisible,
}: ColumnFilterPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const allVisible = visibleColumns.length === columns.length;
  const hiddenCount = columns.length - visibleColumns.length;
  const visibleColumnsSet = useMemo(
    () => new Set(visibleColumns),
    [visibleColumns],
  );

  const handleToggle = (key: string) => {
    if (visibleColumnsSet.has(key) && visibleColumns.length <= 1) return;
    onToggle(key);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={() => setIsOpen((o) => !o)}
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
        <div className="absolute right-0 z-20 w-56 mt-2 bg-white border border-gray-200 rounded-md shadow-xl">
          <div className="p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tampilkan Kolom
              </h4>
              <button
                onClick={() =>
                  allVisible ?
                    onSetVisible([columns[0].key])
                  : onSetVisible(columns.map((c) => c.key))
                }
                className="text-xs text-blue-600 hover:underline font-medium"
              >
                {allVisible ? "Sembunyikan semua" : "Tampilkan semua"}
              </button>
            </div>
            <div className="space-y-1">
              {columns.map((col) => {
                const isVisible = visibleColumnsSet.has(col.key);
                const isLast = isVisible && visibleColumns.length <= 1;
                return (
                  <label
                    key={col.key}
                    className={`flex items-center gap-3 p-1 rounded ${isLast ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-gray-50"}`}
                    title={
                      isLast ? "Minimal 1 kolom harus ditampilkan" : undefined
                    }
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => handleToggle(col.key)}
                      disabled={isLast}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-sm text-gray-700">{col.title}</span>
                  </label>
                );
              })}
            </div>
            {hiddenCount > 0 && (
              <p className="text-xs text-gray-400">
                {hiddenCount} kolom disembunyikan
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGINATION
// ─────────────────────────────────────────────────────────────────────────────

interface PaginationProps {
  pageInfo: PageInfo;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

function Pagination({
  pageInfo,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const { currentPage, total, pageSize } = pageInfo;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  const getPageNumbers = (): (number | "...")[] => {
    if (lastPage <= 5) return Array.from({ length: lastPage }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, "...", lastPage];
    if (currentPage >= lastPage - 2)
      return [1, "...", lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      lastPage,
    ];
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-white border-t border-gray-200 gap-4">
      <div className="text-sm text-gray-500 order-2 sm:order-1">
        Menampilkan {startItem}–{endItem} dari {total} data
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 order-1 sm:order-2 w-full sm:w-auto">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span>Tampilkan</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span>data</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 max-w-full">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {getPageNumbers().map((page, i) =>
            page === "..." ?
              <span key={`e${i}`} className="px-2 text-gray-400">
                ...
              </span>
            : <button
                key={page}
                onClick={() => onPageChange(page as number)}
                className={`min-w-[32px] h-8 px-2 text-sm border rounded transition-colors ${
                  currentPage === page ?
                    "bg-blue-600 text-white border-blue-600 font-medium"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>,
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

// ─────────────────────────────────────────────────────────────────────────────
// INNER TABLE
// ─────────────────────────────────────────────────────────────────────────────

interface InnerTableProps {
  columns: Column[];
  data: any[];
}

function InnerTable({ columns, data }: InnerTableProps) {
  const totalCols = columns.length + 1;
  return (
    <table className="w-full text-sm text-left border-collapse">
      <thead className="text-xs text-gray-600 bg-gray-50 border-b">
        <tr>
          <th className="px-4 py-3 w-10" />
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 font-medium ${
                col.align === "center" ? "text-center"
                : col.align === "right" ? "text-right"
                : "text-left"
              }`}
              style={{ width: col.width }}
            >
              {col.title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={row.id ?? `inner-row-${index}`}
            className="border-b last:border-0 bg-white hover:bg-gray-50/50 transition-colors"
          >
            <td className="px-4 py-3 w-10" />
            {columns.map((col) => (
              <td
                key={col.key}
                className={`px-4 py-3 ${
                  col.align === "center" ? "text-center"
                  : col.align === "right" ? "text-right"
                  : "text-left"
                }`}
              >
                {col.render ?
                  col.render(row[col.key], row, index)
                : (row[col.key] ?? "-")}
              </td>
            ))}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={totalCols}
              className="px-4 py-6 text-center text-gray-500"
            >
              Tidak ada detail
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────

interface TableRowProps {
  row: any;
  index: number;
  columns: Column[];
  fetchDetails?: (record: any) => Promise<any[]>;
  // subColumns sudah difilter isCurrency dari parent — langsung pakai
  subColumns?: Column[];
  showCheckbox: boolean;
  selectedRowIdsSet: Set<string | number>;
  onRowSelect?: (record: any, isSelected: boolean) => void;
  detailsCache: Record<string | number, any[]>;
  onDetailsFetched: (id: string | number, details: any[]) => void;
  totalCols: number;
  checkCanExpand?: (record: any) => boolean;
}

function TableRow({
  row,
  index,
  columns,
  fetchDetails,
  subColumns,
  showCheckbox,
  selectedRowIdsSet,
  onRowSelect,
  detailsCache,
  onDetailsFetched,
  totalCols,
  checkCanExpand,
}: TableRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const rowId = row.id;
  const isSelected = selectedRowIdsSet.has(rowId);
  const cachedDetails = rowId !== null ? detailsCache[rowId] : undefined;
  const canExpand = fetchDetails !== undefined && (checkCanExpand ? checkCanExpand(row) : true);

  const handleExpand = useCallback(async () => {
    if (!expanded && cachedDetails === undefined && fetchDetails) {
      setLoading(true);
      try {
        const fetched = await fetchDetails(row);
        onDetailsFetched(rowId, fetched);
      } catch (err) {
        console.error("Failed to fetch details", err);
        onDetailsFetched(rowId, []);
      } finally {
        setLoading(false);
      }
    }
    setExpanded((prev) => !prev);
  }, [expanded, cachedDetails, fetchDetails, row, rowId, onDetailsFetched]);

  const detailData = cachedDetails ?? [];

  return (
    <React.Fragment>
      <tr
        onClick={canExpand ? handleExpand : undefined}
        className={`border-b transition-colors ${canExpand ? "cursor-pointer hover:bg-gray-50" : ""} ${expanded || isSelected ? "bg-gray-50/50" : "bg-white"}`}
      >
        <td className="px-4 py-3 w-10 text-center">
          {canExpand && (
            <button
              className="p-1 rounded hover:bg-gray-200 transition-colors focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                handleExpand();
              }}
            >
              {loading ?
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              : expanded ?
                <ChevronDown size={16} className="text-gray-600" />
              : <ChevronRight size={16} className="text-gray-600" />}
            </button>
          )}
        </td>
        {showCheckbox && onRowSelect && (
          <td
            className="px-4 py-3 w-10 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onRowSelect(row, e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          </td>
        )}
        {columns.map((col) => (
          <td
            key={col.key}
            className={`px-4 py-3 ${
              col.align === "center" ? "text-center"
              : col.align === "right" ? "text-right"
              : "text-left"
            }`}
            onClick={
              col.key === "actions" ? (e) => e.stopPropagation() : undefined
            }
          >
            {col.render ?
              col.render(row[col.key], row, index)
            : (row[col.key] ?? "-")}
          </td>
        ))}
      </tr>

      {expanded && (
        <tr className="bg-gray-50/30">
          <td colSpan={totalCols} className="p-0 border-b">
            <div className="p-4 pl-12">
              {loading ?
                <div className="flex items-center justify-center py-6 gap-2 text-sm text-gray-500">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  Memuat detail...
                </div>
              : <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-600">
                    Detail Anak Perusahaan ({detailData.length} item)
                  </div>
                  {subColumns && subColumns.length > 0 ?
                    <InnerTable columns={subColumns} data={detailData} />
                  : <div className="px-4 py-4 text-sm text-gray-400 italic">
                      subColumns belum didefinisikan.
                    </div>
                  }
                </div>
              }
            </div>
          </td>
        </tr>
      )}
    </React.Fragment>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC TABLE — komponen utama
// ─────────────────────────────────────────────────────────────────────────────

export function UseDynamicTable({
  title,
  columns,
  data,
  filterConfig = [],
  pageInfo,
  onPageChange,
  onPageSizeChange,
  sortState,
  onSortChange,
  filterValues,
  onFilterApply,
  onFilterReset,
  fetchDetails,
  subColumns,
  showCheckbox = false,
  onRowAction,
  searchPlaceholder,
  searchable = true,
  onSearch,
  searchText,
  setSearchText,
  filters = null,
  checkCanExpand,
  loading = false,
}: DynamicTableProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  const searchTerm = searchText !== undefined ? searchText : localSearchTerm;
  const setTerm = setSearchText !== undefined ? setSearchText : setLocalSearchTerm;

  // Filter isCurrency pada kolom utama
  const permittedColumns = useMemo(
    () => columns.filter((col) => !col.isCurrency),
    [columns],
  );

  // Filter isCurrency pada subColumns — dilewatkan ke TableRow sudah bersih
  const permittedSubColumns = useMemo(
    () => subColumns?.filter((col) => !col.isCurrency),
    [subColumns],
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    permittedColumns.map((c) => c.key),
  );

  useEffect(() => {
    setVisibleColumns(permittedColumns.map((c) => c.key));
  }, [permittedColumns]);

  const visibleColumnsSet = useMemo(
    () => new Set(visibleColumns),
    [visibleColumns],
  );
  const activeColumns = permittedColumns.filter((col) =>
    visibleColumnsSet.has(col.key),
  );

  const [tableFilters, setTableFilters] = useState<Record<string, string>>({});
  const [selectedRowIds, setSelectedRowIds] = useState<(string | number)[]>([]);
  const [detailsCache, setDetailsCache] = useState<
    Record<string | number, any[]>
  >({});

  const handleDetailsFetched = useCallback(
    (id: string | number, details: any[]) => {
      setDetailsCache((prev) => ({ ...prev, [id]: details }));
    },
    [],
  );

  const processedData = useMemo(() => {
    let result = [...data];
    Object.entries(tableFilters).forEach(([key, value]) => {
      if (!value) return;
      result = result.filter((row) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(value.toLowerCase()),
      );
    });
    return result;
  }, [data, tableFilters]);

  const pagedData = processedData;

  const handleSort = (col: Column) => {
    if (!col.sortable) return;
    if (sortState.key !== col.key) {
      onSortChange({ key: col.key, direction: "asc" });
    } else if (sortState.direction === "asc") {
      onSortChange({ key: col.key, direction: "desc" });
    } else {
      onSortChange({ key: null, direction: null });
    }
  };

  const handleRowSelect = (record: any, isSelected: boolean) => {
    const id = record.id;
    setSelectedRowIds((prev) =>
      isSelected ? [...prev, id] : prev.filter((i) => i !== id),
    );
  };

  const handleSelectAll = (records: any[], isSelected: boolean) => {
    const ids = records.map((r) => r.id);
    setSelectedRowIds((prev) => {
      const prevSet = new Set(prev);
      if (isSelected) {
        return [...prev, ...ids.filter((id) => !prevSet.has(id))];
      } else {
        const idsSet = new Set(ids);
        return prev.filter((id) => !idsSet.has(id));
      }
    });
  };

  const selectedRowIdsSet = useMemo(
    () => new Set(selectedRowIds),
    [selectedRowIds],
  );
  const allSelected =
    pagedData.length > 0 &&
    pagedData.every((row) => selectedRowIdsSet.has(row.id));
  const someSelected =
    pagedData.some((row) => selectedRowIdsSet.has(row.id)) && !allSelected;
  const totalCols = activeColumns.length + 1 + (showCheckbox ? 1 : 0);

  const SortIcon = ({ col }: { col: Column }) => {
    if (!col.sortable) return null;
    if (sortState.key !== col.key)
      return (
        <ArrowUpDown size={12} className="text-gray-400 ml-1 flex-shrink-0" />
      );
    if (sortState.direction === "asc")
      return <ArrowUp size={12} className="text-blue-600 ml-1 flex-shrink-0" />;
    return <ArrowDown size={12} className="text-blue-600 ml-1 flex-shrink-0" />;
  };

  const appliedValues = filterValues ?? emptyFilterValues(filterConfig);

  const handleManualSearch = () => {
    onSearch?.(searchTerm);
  };

  return (
    <div className="bg-white min-h-[400px] sm:min-h-[600px] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {searchable && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="relative flex items-center group flex-1">
                <Search 
                  size={16} 
                  className={`absolute left-3 transition-colors ${searchTerm ? "text-blue-600" : "text-gray-400"}`} 
                />
                <input
                  type="text"
                  className="w-full sm:w-[300px] xl:w-[400px] bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-10 text-sm text-gray-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-gray-400"
                  placeholder={searchPlaceholder || "Search..."}
                  value={searchTerm}
                  onChange={(e) => setTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                />
                {searchTerm && (
                  <button
                    onClick={() => {
                      setTerm("");
                      onSearch?.("");
                    }}
                    className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={handleManualSearch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
              >
                Cari
              </button>
            </div>
          )}
          {showCheckbox && selectedRowIds.length > 0 && (
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-md">
              {selectedRowIds.length} baris dipilih
            </span>
          )}
        </div>

        <div className="flex items-center flex-wrap gap-3 w-full lg:w-auto justify-end">
          {filters !== null && filters}
          <ColumnFilterPopup
            columns={permittedColumns}
            visibleColumns={visibleColumns}
            onToggle={(key) =>
              setVisibleColumns((prev) =>
                prev.includes(key) ?
                  prev.filter((k) => k !== key)
                : [...prev, key],
              )
            }
            onSetVisible={setVisibleColumns}
          />
          {filterConfig.length > 0 && onFilterApply && (
            <FilterPopup
              filterConfig={filterConfig}
              appliedValues={appliedValues}
              onApply={onFilterApply}
              onReset={
                onFilterReset ??
                (() => onFilterApply(emptyFilterValues(filterConfig)))
              }
            />
          )}
        </div>
      </div>

      <div className="w-full min-h-[400px] table-responsive">
        <table className="w-full text-sm text-left border-collapse min-w-[800px]">
          <thead className="text-xs text-gray-600 bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 w-10" />
              {showCheckbox && (
                <th className="px-4 py-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={(e) =>
                      handleSelectAll(pagedData, e.target.checked)
                    }
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
              )}
              {activeColumns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 font-medium ${
                    col.align === "center" ? "text-center"
                    : col.align === "right" ? "text-right"
                    : "text-left"
                  }`}
                  style={{ width: col.width }}
                >
                  <div className="flex flex-col gap-2">
                    <span
                      className={`flex items-center gap-1 ${col.sortable ? "cursor-pointer select-none hover:text-gray-900" : ""} ${
                        col.align === "right" ? "justify-end"
                        : col.align === "center" ? "justify-center"
                        : "justify-start"
                      }`}
                      onClick={() => handleSort(col)}
                    >
                      {col.title}
                      <SortIcon col={col} />
                    </span>
                    {col.filterPlaceholder && (
                      <input
                        type="text"
                        placeholder={col.filterPlaceholder}
                        value={tableFilters[col.key] ?? ""}
                        onChange={(e) =>
                          setTableFilters((prev) => ({
                            ...prev,
                            [col.key]: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1.5 text-xs font-normal border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span>Memuat data...</span>
                  </div>
                </td>
              </tr>
            ) : pagedData.length === 0 ? (
              <tr>
                <td
                  colSpan={totalCols}
                  className="px-4 py-10 text-center text-gray-500"
                >
                  Tidak ada data
                </td>
              </tr>
            ) : (
              pagedData.map((row: any, index) => (
                <TableRow
                  key={row.id ?? `row-${index}`}
                  row={row}
                  index={index}
                  columns={activeColumns}
                  fetchDetails={fetchDetails}
                  subColumns={permittedSubColumns}
                  showCheckbox={showCheckbox}
                  selectedRowIdsSet={selectedRowIdsSet}
                  onRowSelect={handleRowSelect}
                  detailsCache={detailsCache}
                  onDetailsFetched={handleDetailsFetched}
                  totalCols={totalCols}
                  checkCanExpand={checkCanExpand}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <Pagination
        pageInfo={pageInfo}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
