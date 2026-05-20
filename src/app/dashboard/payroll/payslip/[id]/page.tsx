"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { App, Tag } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  WalletOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { GetPayslipByIdService } from "@afx/services/payroll.service";
import { IPayslip } from "@afx/interfaces/payroll.iface";

export default function PayslipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState<IPayslip | null>(null);

  useEffect(() => {
    fetchPayslipDetail();
  }, [resolvedParams.id]);

  const fetchPayslipDetail = async () => {
    setLoading(true);
    try {
      const id = parseInt(resolvedParams.id);
      if (isNaN(id)) {
        notification.error({
          message: "Invalid ID",
          description: "ID payslip tidak valid",
        });
        return;
      }
      const res = await GetPayslipByIdService(id);
      if (res.success) {
        setPayslip(res.data);
      }
    } catch (err: any) {
      notification.error({
        message: "Gagal Memuat Detail Payslip",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `Rp ${amount?.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const formatDate = (dateString: string | null) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        });

  const formatDateTime = (dateString: string | null) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "default",
      sent: "blue",
      viewed: "cyan",
      paid: "green",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      sent: "Terkirim",
      viewed: "Dilihat",
      paid: "Dibayar",
    };
    return labels[status?.toLowerCase()] || status;
  };

  if (loading || !payslip) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Memuat data...
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-4">
      {/* Top bar */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeftOutlined />
          Kembali
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-800 leading-none">
            Detail payslip
          </h1>
          <p className="text-xs text-slate-400 mt-1">{payslip.payslipCode}</p>
        </div>
      </div>

      {/* Card 1 — Info karyawan */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl flex-shrink-0">
          <UserOutlined />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-slate-800 truncate">
            {payslip.employeeName}
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1">
            <span className="text-xs text-slate-400">
              Kode:{" "}
              <span className="text-slate-600 font-medium">
                {payslip.payslipCode}
              </span>
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <CalendarOutlined className="text-emerald-400" />
              Periode:{" "}
              <span className="text-slate-600 font-medium">
                {payslip.payrollPeriodName}
              </span>
            </span>
            <span className="text-xs text-slate-400">
              Tanggal:{" "}
              <span className="text-slate-600 font-medium">
                {formatDate(payslip.createdAt)}
              </span>
            </span>
          </div>
        </div>
        <Tag
          color={getStatusColor(payslip.status)}
          className="rounded-full px-3 py-1 text-xs font-medium flex-shrink-0"
        >
          {getStatusLabel(payslip.status)}
        </Tag>
      </div>

      {/* Card 2 — Ringkasan kerja */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <CardTitle icon={<BarChartOutlined />} label="Ringkasan kerja" />
        <div className="flex gap-3">
          <StatBox
            value={payslip.totalSessions}
            label="Sesi"
            color="emerald"
            width="150px"
          />
          <StatBox
            value={payslip.totalHoursWorked}
            label="Jam"
            color="blue"
            width="150px"
          />
          <StatBox
            value={payslip.daysWorked}
            label="Hari"
            color="purple"
            width="150px"
          />
          <StatBox
            value={payslip.averageRating.toFixed(1)}
            label="Rating"
            color="amber"
            width="150px"
          />
        </div>
      </div>

      {/* Card 3 & 4 — Pendapatan & Potongan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pendapatan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <CardTitle
            icon={<CheckCircleOutlined className="text-emerald-500" />}
            label="Pendapatan"
            labelClass="text-emerald-700"
          />
          <div className="space-y-0">
            <RowItem
              label="Gaji pokok"
              value={formatCurrency(payslip.baseSalary)}
              labelWidth="150px"
            />
            <RowItem
              label="Komisi"
              value={formatCurrency(payslip.totalCommission)}
              labelWidth="150px"
            />
            <RowItem
              label="Bonus"
              value={formatCurrency(payslip.totalBonus)}
              labelWidth="150px"
            />
            <RowItem
              label="Lembur"
              value={formatCurrency(payslip.overtimePay)}
              labelWidth="150px"
            />
            <RowItem
              label="Lainnya"
              value={formatCurrency(payslip.otherEarnings)}
              labelWidth="150px"
            />
          </div>
          <div className="flex justify-between items-center mt-3 bg-emerald-50 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-emerald-800">
              Total kotor
            </span>
            <span className="text-base font-bold text-emerald-700">
              {formatCurrency(payslip.grossEarnings)}
            </span>
          </div>
        </div>

        {/* Potongan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <CardTitle
            icon={<MinusCircleOutlined className="text-red-400" />}
            label="Potongan"
            labelClass="text-red-700"
          />
          <div className="space-y-0">
            <RowItem
              label="Pajak"
              value={formatCurrency(payslip.taxDeduction)}
              labelWidth="150px"
            />
            <RowItem
              label="Asuransi"
              value={formatCurrency(payslip.insuranceDeduction)}
              labelWidth="150px"
            />
            <RowItem
              label="Denda"
              value={formatCurrency(payslip.penaltyDeduction)}
              labelWidth="150px"
            />
            <RowItem
              label="Lainnya"
              value={formatCurrency(payslip.otherDeductions)}
              labelWidth="150px"
            />
          </div>
          <div className="flex justify-between items-center mt-3 bg-red-50 rounded-lg px-4 py-3">
            <span className="text-sm font-semibold text-red-800">
              Total potongan
            </span>
            <span className="text-base font-bold text-red-700">
              {formatCurrency(payslip.totalDeductions)}
            </span>
          </div>
        </div>
      </div>

      {/* Card 5 — Pendapatan bersih */}
      <div className="bg-emerald-800 rounded-xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-lg bg-emerald-700 flex items-center justify-center text-emerald-200 text-xl">
            <WalletOutlined />
          </div>
          <div>
            <p className="text-xs text-emerald-400 tracking-widest uppercase">
              Pendapatan bersih
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">
              {formatCurrency(payslip.netPay)}
            </p>
          </div>
        </div>
        {payslip.paymentReference && (
          <div className="text-right">
            <p className="text-xs text-emerald-400">Referensi pembayaran</p>
            <p className="text-sm font-semibold text-emerald-200 mt-0.5">
              {payslip.paymentReference}
            </p>
          </div>
        )}
      </div>

      {/* Card 6 & 7 — Informasi pembayaran & Catatan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Informasi pembayaran */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <CardTitle
            icon={<InfoCircleOutlined />}
            label="Informasi pembayaran"
          />
          <div className="flex gap-6">
            <PayInfo
              label="Dibuat"
              value={formatDateTime(payslip.createdAt)}
              width="180px"
            />
            <PayInfo
              label="Dikirim"
              value={formatDateTime(payslip.sentAt)}
              width="180px"
            />
            <PayInfo
              label="Dilihat"
              value={formatDateTime(payslip.viewedAt)}
              width="180px"
            />
            <PayInfo
              label="Dibayar"
              value={formatDateTime(payslip.paidAt)}
              width="180px"
            />
          </div>
        </div>

        {/* Catatan */}
        {(payslip.employeeNotes || payslip.internalNotes) && (
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <CardTitle icon={<FileTextOutlined />} label="Catatan" />
            <div className="space-y-4">
              {payslip.employeeNotes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Karyawan</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {payslip.employeeNotes}
                  </p>
                </div>
              )}
              {payslip.internalNotes && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Internal</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {payslip.internalNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────── */

function CardTitle({
  icon,
  label,
  labelClass = "text-slate-500",
}: {
  icon: React.ReactNode;
  label: string;
  labelClass?: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs font-semibold tracking-wide uppercase mb-4 ${labelClass}`}
    >
      <span className="text-[14px]">{icon}</span>
      {label}
    </div>
  );
}

const statColors: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatBox({
  value,
  label,
  color,
  width = "auto",
}: {
  value: string | number;
  label: string;
  color: string;
  width?: string;
}) {
  return (
    <div
      className={`rounded-lg p-3 text-center ${statColors[color] ?? "bg-slate-50 text-slate-600"}`}
      style={{ width }}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-400 font-medium tracking-widest mt-1 uppercase">
        {label}
      </div>
    </div>
  );
}

function RowItem({
  label,
  value,
  labelWidth = "auto",
}: {
  label: string;
  value: string;
  labelWidth?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500" style={{ minWidth: labelWidth }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function PayInfo({
  label,
  value,
  width = "auto",
}: {
  label: string;
  value: string;
  width?: string;
}) {
  return (
    <div style={{ width }}>
      <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
