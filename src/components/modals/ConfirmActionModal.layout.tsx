"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "textarea" | "select" | "date" | "number";

export interface FieldGroup {
  groupLabel: string;
  groupKey: string;
  fields: ActionField[];
}

export type FieldOrGroup = ActionField | FieldGroup;

export function isFieldGroup(f: FieldOrGroup): f is FieldGroup {
  return "groupLabel" in f && "fields" in f;
}

export interface ActionField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string | number }[];
  defaultValue?: string | number;
  hint?: string;
  prefix?: string;
  suffix?: string;
}

export type ActionVariant =
  | "primary"
  | "success"
  | "danger"
  | "warning"
  | "info";

interface ActionConfigBase {
  title: string;
  subtitle?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ActionVariant;
  icon?:
    | "check"
    | "x"
    | "send"
    | "ban"
    | "trash"
    | "ship"
    | "warning"
    | "info"
    | "question";
}

interface ActionConfigNoFields extends ActionConfigBase {
  fields?: [];
  description: string;
}

interface ActionConfigWithFields extends ActionConfigBase {
  fields: [FieldOrGroup, ...FieldOrGroup[]];
  description?: string;
}

export type ActionConfig = ActionConfigNoFields | ActionConfigWithFields;

export interface ConfirmActionModalProps {
  config: ActionConfig;
  onConfirm: (values: Record<string, any>) => void | Promise<void>;
  onClose: () => void;
  loading?: boolean;
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PRESET CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

export const ActionPresets: Record<
  string,
  (docCode?: string, fields?: ActionField[]) => ActionConfig
> = {
  submit: (code, fields) => ({
    title: "Ajukan dokumen",
    subtitle: code,
    description:
      "Dokumen akan dikirim untuk direview. Pastikan semua data sudah benar.",
    confirmLabel: "Ajukan",
    variant: "info",
    icon: "send",
    fields: (fields ?? [
      {
        key: "notes",
        label: "Catatan",
        type: "textarea",
        placeholder: "Catatan tambahan",
        required: true,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  approve: (code, fields) => ({
    title: "Setujui dokumen",
    subtitle: code,
    description: "Dokumen akan disetujui dan lanjut ke tahap berikutnya.",
    confirmLabel: "Setujui",
    variant: "success",
    icon: "check",
    fields: (fields ?? [
      {
        key: "notes",
        label: "Catatan persetujuan",
        type: "textarea",
        placeholder: "Catatan tambahan",
        required: false,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  reject: (code, fields) => ({
    title: "Tolak dokumen",
    subtitle: code,
    description: "Dokumen akan dikembalikan ke drafter. Wajib sertakan alasan.",
    confirmLabel: "Tolak",
    variant: "danger",
    icon: "x",
    fields: (fields ?? [
      {
        key: "rejectionReason",
        label: "Alasan penolakan",
        type: "textarea",
        placeholder: "Tuliskan alasan penolakan...",
        required: true,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  cancel: (code, fields) => ({
    title: "Batalkan dokumen",
    subtitle: code,
    description:
      "Dokumen akan dibatalkan dan tidak dapat diproses lebih lanjut.",
    confirmLabel: "Batalkan",
    variant: "danger",
    icon: "ban",
    fields: (fields ?? [
      {
        key: "CancelReason",
        label: "Alasan pembatalan",
        type: "textarea",
        placeholder: "Tuliskan alasan pembatalan...",
        required: true,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  void: (code, fields) => ({
    title: "Void dokumen",
    subtitle: code,
    description: "Dokumen akan di-void. Tindakan ini tidak dapat dibatalkan.",
    confirmLabel: "Void",
    variant: "danger",
    icon: "ban",
    fields: (fields ?? [
      {
        key: "voidReason",
        label: "Alasan void",
        type: "textarea",
        placeholder: "Tuliskan alasan void...",
        required: true,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  delete: (code, fields) => {
    const base: ActionConfigBase & { description: string } = {
      title: "Hapus dokumen",
      subtitle: code,
      description: `Data ${code} akan dihapus permanen dan tidak dapat dipulihkan.`,
      confirmLabel: "Hapus",
      variant: "danger",
      icon: "trash",
    };
    if (fields && fields.length > 0) {
      return { ...base, fields: fields as [ActionField, ...ActionField[]] };
    }
    return base;
  },

  pick: (code, fields) => ({
    title: "Siapkan barang",
    subtitle: code,
    description:
      "Status akan berubah ke Picking. Tim gudang akan mulai menyiapkan barang.",
    confirmLabel: "Proses Pick",
    variant: "primary",
    icon: "check",
    fields: (fields ?? [
      {
        key: "notes",
        label: "Catatan gudang",
        type: "textarea",
        placeholder: "Catatan untuk tim gudang",
        required: false,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  deliver: (code, fields) => ({
    title: "Konfirmasi penerimaan",
    subtitle: code,
    description: "Tandai bahwa barang sudah diterima oleh pelanggan.",
    confirmLabel: "Konfirmasi Terima",
    variant: "success",
    icon: "check",
    fields: (fields ?? [
      {
        key: "receiverName",
        label: "Nama penerima",
        type: "text",
        placeholder: "Nama lengkap penerima",
        required: true,
      },
      {
        key: "receiverNotes",
        label: "Catatan penerimaan",
        type: "textarea",
        placeholder: "Catatan tambahan",
        required: false,
      },
      {
        key: "notes",
        label: "Catatan",
        type: "textarea",
        placeholder: "Catatan tambahan",
        required: false,
      },
    ]) as [ActionField, ...ActionField[]],
  }),

  post: (code, fields) => {
    const base: ActionConfigBase & { description: string } = {
      title: "Kirim Order",
      subtitle: code,
      confirmLabel: "Kirim",
      variant: "success",
      icon: "check",
      description: `Apakah anda yakin ingin mengirim Order ${code}`,
    };
    if (fields && fields.length > 0) {
      return { ...base, fields: fields as [ActionField, ...ActionField[]] };
    }
    return base;
  },

  confirm: (code, fields) => {
    const base: ActionConfigBase & { description: string } = {
      title: "Konfirmasi Order",
      subtitle: code,
      confirmLabel: "Konfirmasi",
      variant: "success",
      icon: "check",
      description: `Apakah anda yakin ingin mengkonfirmasi Order ${code}`,
    };
    if (fields && fields.length > 0) {
      return { ...base, fields: fields as [ActionField, ...ActionField[]] };
    }
    return base;
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// ICON MAP
// ─────────────────────────────────────────────────────────────────────────────

function ActionIcon({
  name,
  className,
}: {
  name: ActionConfig["icon"];
  className?: string;
}) {
  const cls = className ?? "w-5 h-5";
  switch (name) {
    case "check":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      );
    case "x":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    case "send":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
      );
    case "ban":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <circle cx="12" cy="12" r="10" strokeWidth={2} />
          <path
            strokeLinecap="round"
            strokeWidth={2}
            d="M4.93 4.93l14.14 14.14"
          />
        </svg>
      );
    case "trash":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      );
    case "ship":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14M12 5l7 7-7 7"
          />
        </svg>
      );
    case "warning":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    case "info":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    case "question":
      return (
        <svg
          className={cls}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      );
    default:
      return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT STYLES
// ─────────────────────────────────────────────────────────────────────────────

const variantStyles: Record<
  ActionVariant,
  { icon: string; btn: string; badge: string }
> = {
  primary: {
    icon: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    btn: "bg-blue-600 hover:bg-blue-700 text-white border-blue-600",
    badge: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300",
  },
  success: {
    icon: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    btn: "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600",
    badge:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300",
  },
  danger: {
    icon: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    btn: "bg-red-600 hover:bg-red-700 text-white border-red-600",
    badge: "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
  },
  warning: {
    icon: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    btn: "bg-amber-500 hover:bg-amber-600 text-white border-amber-500",
    badge:
      "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300",
  },
  info: {
    icon: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600",
    badge:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: flatten all ActionField dari FieldOrGroup[] untuk init values & validate
// ─────────────────────────────────────────────────────────────────────────────

function flattenFields(fields: FieldOrGroup[]): ActionField[] {
  return fields.flatMap((f) => (isFieldGroup(f) ? f.fields : [f]));
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function ConfirmActionModal({
  config,
  onConfirm,
  onClose,
  loading = false,
  className = "",
}: ConfirmActionModalProps) {
  const {
    title,
    subtitle,
    description,
    confirmLabel = "Konfirmasi",
    cancelLabel = "Batal",
    variant = "primary",
    icon,
    fields = [],
  } = config;

  const styles = variantStyles[variant];
  const firstInputRef = useRef<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  >(null);

  // Init values dari semua flat fields (termasuk yang di dalam group)
  const [values, setValues] = useState<Record<string, any>>(() =>
    Object.fromEntries(
      flattenFields(fields as FieldOrGroup[]).map((f) => [
        f.key,
        f.defaultValue ?? "",
      ]),
    ),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, []);

  const setValue = (key: string, value: any) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    flattenFields(fields as FieldOrGroup[]).forEach((f) => {
      if (f.required && !String(values[f.key] ?? "").trim()) {
        newErrors[f.key] = `${f.label} wajib diisi`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    await onConfirm(values);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) onClose();
  };

  // ── renderField: didefinisikan di DALAM component agar bisa akses state ──
  const renderField = (field: ActionField, isFirstInForm?: boolean) => (
    <div key={field.key}>
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 tracking-wide">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.type === "text" && (
        <input
          ref={
            isFirstInForm ?
              (el) => {
                firstInputRef.current = el;
              }
            : undefined
          }
          type="text"
          className={`form-input text-sm w-full ${errors[field.key] ? "border-red-400 focus:border-red-500" : ""}`}
          placeholder={field.placeholder}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          disabled={loading}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          ref={
            isFirstInForm ?
              (el) => {
                firstInputRef.current = el as any;
              }
            : undefined
          }
          className={`form-textarea text-sm w-full resize-none ${errors[field.key] ? "border-red-400 focus:border-red-500" : ""}`}
          placeholder={field.placeholder}
          rows={3}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          disabled={loading}
        />
      )}

      {field.type === "select" && (
        <select
          ref={
            isFirstInForm ?
              (el) => {
                firstInputRef.current = el as any;
              }
            : undefined
          }
          className={`form-select text-sm w-full ${errors[field.key] ? "border-red-400 focus:border-red-500" : ""}`}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          disabled={loading}
        >
          <option value="">{field.placeholder ?? "-- Pilih --"}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {field.type === "date" && (
        <input
          ref={
            isFirstInForm ?
              (el) => {
                firstInputRef.current = el;
              }
            : undefined
          }
          type="date"
          className={`form-input text-sm w-full ${errors[field.key] ? "border-red-400 focus:border-red-500" : ""}`}
          value={values[field.key] ?? ""}
          onChange={(e) => setValue(field.key, e.target.value)}
          disabled={loading}
        />
      )}

      {field.type === "number" && (
        <div className="flex items-center gap-2">
          {field.prefix && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              {field.prefix}
            </span>
          )}
          <input
            ref={
              isFirstInForm ?
                (el) => {
                  firstInputRef.current = el;
                }
              : undefined
            }
            type="number"
            className={`form-input text-sm flex-1 ${errors[field.key] ? "border-red-400 focus:border-red-500" : ""}`}
            placeholder={field.placeholder ?? "0"}
            value={values[field.key] ?? ""}
            onChange={(e) => setValue(field.key, e.target.value)}
            disabled={loading}
          />
          {field.suffix && (
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              {field.suffix}
            </span>
          )}
        </div>
      )}

      {errors[field.key] && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <svg
            className="w-3 h-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {errors[field.key]}
        </p>
      )}
      {!errors[field.key] && field.hint && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
          {field.hint}
        </p>
      )}
    </div>
  );

  // ── Track apakah ref pertama sudah di-assign ──
  let firstFieldAssigned = false;
  const renderFieldWithFirstRef = (field: ActionField) => {
    const isFirst = !firstFieldAssigned;
    if (isFirst) firstFieldAssigned = true;
    return renderField(field, isFirst);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className={`bg-white dark:bg-dark rounded-2xl border border-[#e0e6ed] dark:border-[#1b2e4b] flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden shadow-2xl transition-all ${fields?.length === 0 ? "w-full max-w-[400px]" : "w-full max-w-[500px]"} ${className}`}
      >
        {/* ── LAYOUT A: PREMIUM ASYMMETRIC CONFIRMATION (NO FIELDS) ── */}
        {fields?.length === 0 ? (
          <div className="flex flex-col relative group">
            {/* Ambient background glow */}
            <div className={`absolute -inset-1 opacity-20 blur-2xl transition-all duration-500 group-hover:opacity-30 ${variant === 'danger' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
            
            <div className="relative bg-white dark:bg-dark-light">
              <div className="flex justify-end p-4 absolute right-0 top-0 z-10">
                <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-400 hover:text-slate-600">
                  <X size={18} />
                </button>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-8 p-10 pt-12">
                {/* Visual Icon Section */}
                <div className="flex-shrink-0 relative">
                  <div className={`w-20 h-20 rounded-[28%] flex items-center justify-center relative z-10 shadow-2xl transform -rotate-3 transition-transform hover:rotate-0 duration-500 ${styles.icon.replace('w-9 h-9', 'w-20 h-20')}`}>
                    <ActionIcon name={icon || "question"} className="w-10 h-10" />
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute -bottom-2 -right-2 w-20 h-20 rounded-[28%] opacity-20 blur-sm -z-0 rotate-12 ${variant === 'danger' ? 'bg-red-400' : 'bg-emerald-400'}`}></div>
                </div>
                
                {/* Content Section */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <h3 className={`text-2xl font-black tracking-tight leading-none ${variant === 'danger' ? 'text-red-600' : 'text-emerald-600'}`}>
                      {title}
                    </h3>
                    {subtitle && (
                      <div className="flex items-center gap-2">
                        <div className={`h-1 w-8 rounded-full ${variant === 'danger' ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}></div>
                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase opacity-60 ${variant === 'danger' ? 'text-red-700' : 'text-emerald-700'}`}>
                          Ref: {subtitle}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium max-w-sm">
                    {description}
                  </p>
                </div>
              </div>
              
              {/* Premium Footer with integrated buttons */}
              <div className="flex flex-col md:flex-row items-center gap-3 p-8 pt-2 bg-slate-50/50 dark:bg-dark/20">
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`flex-[2] w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 relative overflow-hidden group/btn ${variant === 'danger' ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-500/25' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-emerald-500/25'} disabled:opacity-50`}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  {loading && (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <span className="relative z-10 tracking-wide">{confirmLabel}</span>
                </button>
                
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 w-full py-4 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-white dark:hover:bg-dark-light transition-all disabled:opacity-40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  {cancelLabel}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ── LAYOUT B: FORM CONFIRMATION (WITH FIELDS) ── */
          <>
            <div className="flex items-start gap-3 px-6 pt-6 pb-5 border-b border-[#e0e6ed] dark:border-[#1b2e4b]">
              {icon && (
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${styles.icon}`}>
                  <ActionIcon name={icon} className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-gray-800 dark:text-white leading-tight">
                  {title}
                </p>
                {subtitle && (
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${styles.badge}`}>
                    {subtitle}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[400px]">
              {description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
              
              {(fields as FieldOrGroup[]).map((fieldOrGroup) => {
                if (isFieldGroup(fieldOrGroup)) {
                  let groupFirstFieldAssigned = false;
                  return (
                    <div key={fieldOrGroup.groupKey} className="rounded-xl border border-slate-100 overflow-hidden">
                      <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {fieldOrGroup.groupLabel}
                        </p>
                      </div>
                      <div className="p-4 space-y-4">
                        {fieldOrGroup.fields.map((field) => {
                          const isFirst = !groupFirstFieldAssigned;
                          if (isFirst) groupFirstFieldAssigned = true;
                          return renderField(field, isFirst);
                        })}
                      </div>
                    </div>
                  );
                }
                return renderFieldWithFirstRef(fieldOrGroup);
              })}
            </div>

            <div className="px-6 py-5 border-t border-[#e0e6ed] bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-all disabled:opacity-40"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-8 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-lg ${styles.btn} disabled:opacity-50`}
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {confirmLabel}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
