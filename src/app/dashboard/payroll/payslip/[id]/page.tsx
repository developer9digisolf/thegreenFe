"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { App, Tag, Button, Modal, Input, Form, Tooltip } from "antd";
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
  DownloadOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import {
  GetPayslipByIdService,
  UpdatePayslipStatusService,
} from "@afx/services/payroll.service";
import { IPayslip, PayslipStatus } from "@afx/interfaces/payroll.iface";
import html2pdf from "html2pdf.js";

/* ── Types ──────────────────────────────────────────────── */

interface StatusOption {
  value: PayslipStatus;
  label: string;
  icon: React.ReactNode;
  disabled: boolean;
  tooltip: string;
}

/* ── Constants ──────────────────────────────────────────── */

const STATUS_META: Record<
  string,
  { color: string; label: string; antColor: string }
> = {
  "0": { color: "default", label: "Draft", antColor: "default" },
  "1": { color: "blue", label: "Terkirim", antColor: "blue" },
  "2": { color: "cyan", label: "Dilihat", antColor: "cyan" },
  "3": { color: "green", label: "Dibayar", antColor: "green" },
  "-1": { color: "red", label: "Dibatalkan", antColor: "red" },
};

const getStatusMeta = (status: string | number) =>
  STATUS_META[String(status)] ?? {
    color: "default",
    label: String(status),
    antColor: "default",
  };

/* ── Status option builder ──────────────────────────────── */

/**
 * Hanya dua trigger status: Sent dan Paid.
 * - Jika status saat ini sudah sama atau melewati opsi → disabled.
 */
function buildStatusOptions(currentStatus: number): StatusOption[] {
  const options: Omit<StatusOption, "disabled" | "tooltip">[] = [
    {
      value: PayslipStatus.Sent,
      label: "Kirim",
      icon: <SendOutlined />,
    },
    {
      value: PayslipStatus.Paid,
      label: "Bayar",
      icon: <WalletOutlined />,
    },
  ];

  return options.map((opt) => {
    if (opt.value === currentStatus) {
      return { ...opt, disabled: true, tooltip: "Ini adalah status saat ini" };
    }
    if (opt.value < currentStatus) {
      return { ...opt, disabled: true, tooltip: "Status ini sudah dilewati" };
    }
    return { ...opt, disabled: false, tooltip: "" };
  });
}

/* ── Formatters ─────────────────────────────────────────── */

const formatCurrency = (amount: number) =>
  `Rp ${(amount ?? 0).toLocaleString("id-ID", {
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

/* ── Main page ──────────────────────────────────────────── */

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
  const [modalOpen, setModalOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<PayslipStatus | null>(
    null,
  );
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPayslipDetail();
  }, [resolvedParams.id]);

  /* ── Data fetching ── */

  const fetchPayslipDetail = async () => {
    setLoading(true);
    try {
      const id = parseInt(resolvedParams.id);
      if (isNaN(id)) {
        notification.error({
          title: "ID tidak valid",
          description: "ID payslip tidak ditemukan.",
        });
        return;
      }
      const res = await GetPayslipByIdService(id);
      if (res.success) setPayslip(res.data);
    } catch (err: any) {
      notification.error({
        title: "Gagal memuat data",
        description: err?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ── PDF export ── */

  const handleExportPDF = async () => {
    if (!payslip) return;

    try {
      const statusMeta = getStatusMeta(payslip.status);

      // Status badge colors (inline — no Tailwind dependency)
      const statusBg =
        statusMeta.color === "green"
          ? "#dcfce7"
          : statusMeta.color === "blue"
            ? "#dbeafe"
            : statusMeta.color === "cyan"
              ? "#cffafe"
              : statusMeta.color === "red"
                ? "#fee2e2"
                : "#f1f5f9";

      const statusFg =
        statusMeta.color === "green"
          ? "#166534"
          : statusMeta.color === "blue"
            ? "#1e40af"
            : statusMeta.color === "cyan"
              ? "#155e75"
              : statusMeta.color === "red"
                ? "#991b1b"
                : "#475569";

      // Helper: flex row (label left, value right) — avoids table collapse bug
      const row = (label: string, value: string) => `
        <div style="display:flex;justify-content:space-between;align-items:center;
                    padding:6px 0;border-bottom:1px solid #f1f5f9;">
          <span style="color:#64748b;font-size:11px;">${label}</span>
          <span style="color:#1e293b;font-size:11px;font-weight:600;">${value}</span>
        </div>`;

      // Helper: info cell (payment timestamps)
      const infoCell = (label: string, value: string) => `
        <div style="flex:1;min-width:100px;">
          <div style="font-size:10px;color:#94a3b8;margin-bottom:3px;">${label}</div>
          <div style="font-size:11px;font-weight:600;color:#334155;">${value}</div>
        </div>`;

      // Stat boxes (work summary)
      const statBoxes = [
        {
          v: payslip.totalSessions,
          l: "Sesi",
          bg: "#f0fdf4",
          c: "#166534",
          border: "#bbf7d0",
        },
        {
          v: payslip.totalHoursWorked,
          l: "Jam Kerja",
          bg: "#eff6ff",
          c: "#1e40af",
          border: "#bfdbfe",
        },
        {
          v: payslip.daysWorked,
          l: "Hari Kerja",
          bg: "#faf5ff",
          c: "#6b21a8",
          border: "#e9d5ff",
        },
        {
          v: payslip.averageRating.toFixed(1),
          l: "Rating",
          bg: "#fffbeb",
          c: "#92400e",
          border: "#fde68a",
        },
      ]
        .map(
          (s) => `
          <div style="flex:1;background:${s.bg};border:1px solid ${s.border};border-radius:10px;
                      padding:14px 8px;text-align:center;">
            <div style="font-size:26px;font-weight:700;color:${s.c};line-height:1;">${s.v}</div>
            <div style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;
                        margin-top:5px;font-weight:600;">${s.l}</div>
          </div>`,
        )
        .join("");

      const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      color: #1e293b;
      background: #ffffff;
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
<div style="padding:12mm 14mm 12mm 14mm;">

  <!-- ① Header strip -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;
              padding-bottom:14px;margin-bottom:16px;border-bottom:3px solid #059669;">
    <div>
      <div style="font-size:28px;font-weight:800;color:#059669;letter-spacing:-1px;line-height:1;">
        SLIP GAJI
      </div>
      <div style="font-size:10px;color:#94a3b8;margin-top:4px;letter-spacing:0.3px;">
        ${payslip.payslipCode}
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:16px;font-weight:700;color:#0f172a;">${payslip.employeeName}</div>
      <div style="font-size:11px;color:#64748b;margin-top:4px;">Periode: <strong>${payslip.payrollPeriodName}</strong></div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Tanggal: <strong>${formatDate(payslip.createdAt)}</strong></div>
      <div style="margin-top:6px;display:inline-block;background:${statusBg};color:${statusFg};
                  font-size:10px;font-weight:700;padding:3px 12px;border-radius:99px;">
        ${statusMeta.label}
      </div>
    </div>
  </div>

  <!-- ② Work summary -->
  <div style="display:flex;gap:10px;margin-bottom:18px;">
    ${statBoxes}
  </div>

  <!-- ③ Earnings + Deductions side by side -->
  <div style="display:flex;gap:12px;margin-bottom:18px;">

    <!-- Earnings -->
    <div style="flex:1;border:1px solid #d1fae5;border-radius:12px;overflow:hidden;">
      <div style="background:#f0fdf4;padding:10px 14px;border-bottom:1px solid #d1fae5;">
        <span style="font-size:10px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:0.8px;">
          &#x2714;&nbsp; Pendapatan
        </span>
      </div>
      <div style="padding:4px 14px 10px;">
        ${row("Gaji pokok", formatCurrency(payslip.baseSalary))}
        ${row("Komisi", formatCurrency(payslip.totalCommission))}
        ${row("Bonus", formatCurrency(payslip.totalBonus))}
        ${row("Lembur", formatCurrency(payslip.overtimePay))}
        ${row("Lainnya", formatCurrency(payslip.otherEarnings))}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;
                  background:#dcfce7;padding:10px 14px;margin-top:0;">
        <span style="font-size:12px;font-weight:700;color:#166534;">Total kotor</span>
        <span style="font-size:14px;font-weight:800;color:#059669;">${formatCurrency(payslip.grossEarnings)}</span>
      </div>
    </div>

    <!-- Deductions -->
    <div style="flex:1;border:1px solid #fecaca;border-radius:12px;overflow:hidden;">
      <div style="background:#fef2f2;padding:10px 14px;border-bottom:1px solid #fecaca;">
        <span style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.8px;">
          &#x2212;&nbsp; Potongan
        </span>
      </div>
      <div style="padding:4px 14px 10px;">
        ${row("Pajak", formatCurrency(payslip.taxDeduction))}
        ${row("Asuransi", formatCurrency(payslip.insuranceDeduction))}
        ${row("Denda", formatCurrency(payslip.penaltyDeduction))}
        ${row("Lainnya", formatCurrency(payslip.otherDeductions))}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;
                  background:#fee2e2;padding:10px 14px;">
        <span style="font-size:12px;font-weight:700;color:#991b1b;">Total potongan</span>
        <span style="font-size:14px;font-weight:800;color:#dc2626;">${formatCurrency(payslip.totalDeductions)}</span>
      </div>
    </div>
  </div>

  <!-- ④ Net Pay banner -->
  <div style="background:linear-gradient(135deg,#064e3b 0%,#065f46 60%,#047857 100%);
              border-radius:14px;padding:20px 24px;display:flex;
              justify-content:space-between;align-items:center;margin-bottom:18px;">
    <div>
      <div style="font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;">
        Pendapatan Bersih
      </div>
      <div style="font-size:32px;font-weight:800;color:#ffffff;margin-top:4px;letter-spacing:-0.5px;">
        ${formatCurrency(payslip.netPay)}
      </div>
    </div>
    ${
      payslip.paymentReference
        ? `<div style="text-align:right;background:rgba(255,255,255,0.08);
                       border-radius:10px;padding:10px 16px;">
        <div style="font-size:9px;color:#6ee7b7;text-transform:uppercase;letter-spacing:0.8px;">
          Referensi Pembayaran
        </div>
        <div style="font-size:13px;font-weight:700;color:#a7f3d0;margin-top:3px;">
          ${payslip.paymentReference}
        </div>
      </div>`
        : ""
    }
  </div>

  <!-- ⑤ Payment info + Notes -->
  <div style="display:flex;gap:12px;margin-bottom:16px;">

    <div style="flex:1;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;">
      <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;
                  letter-spacing:0.8px;margin-bottom:12px;">Informasi Pembayaran</div>
      <div style="display:flex;flex-wrap:wrap;gap:12px;">
        ${infoCell("Dibuat", formatDateTime(payslip.createdAt))}
        ${infoCell("Dikirim", formatDateTime(payslip.sentAt))}
        ${infoCell("Dilihat", formatDateTime(payslip.viewedAt))}
        ${infoCell("Dibayar", formatDateTime(payslip.paidAt))}
      </div>
    </div>

    ${
      payslip.employeeNotes || payslip.internalNotes
        ? `<div style="flex:1;border:1px solid #e2e8f0;border-radius:12px;padding:14px 16px;">
        <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;
                    letter-spacing:0.8px;margin-bottom:10px;">Catatan</div>
        ${
          payslip.employeeNotes
            ? `<div style="margin-bottom:8px;">
            <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                        letter-spacing:0.5px;margin-bottom:3px;">Karyawan</div>
            <div style="font-size:11px;color:#334155;line-height:1.5;">${payslip.employeeNotes}</div>
          </div>`
            : ""
        }
        ${
          payslip.internalNotes
            ? `<div>
            <div style="font-size:9px;color:#94a3b8;font-weight:600;text-transform:uppercase;
                        letter-spacing:0.5px;margin-bottom:3px;">Internal</div>
            <div style="font-size:11px;color:#334155;line-height:1.5;">${payslip.internalNotes}</div>
          </div>`
            : ""
        }
      </div>`
        : ""
    }
  </div>

  <!-- ⑥ Footer -->
  <div style="text-align:center;font-size:9px;color:#cbd5e1;
              padding-top:10px;border-top:1px solid #f1f5f9;margin-top:auto;">
    Dokumen ini dibuat secara otomatis &nbsp;·&nbsp; ${new Date().toLocaleString("id-ID")}
  </div>

</div>
</body>
</html>`;

      const opt = {
        margin: 0,
        filename: `Payslip_${payslip.payslipCode}.pdf`,
        image: { type: "jpeg" as const, quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          width: 794,
          windowWidth: 794,
        },
        jsPDF: {
          unit: "mm" as const,
          format: "a4" as const,
          orientation: "portrait" as const,
        },
        pagebreak: { mode: [] as string[] },
      };

      // Pass the full HTML string directly — html2pdf renders it in an
      // isolated iframe so <body> / <head> styles are respected correctly.
      const blob: Blob = await html2pdf()
        .set(opt)
        .from(htmlContent, "string")
        .output("blob");

      window.open(URL.createObjectURL(blob), "_blank");

      notification.success({ title: "Export PDF berhasil" });
    } catch (error: any) {
      notification.error({
        title: "Gagal export PDF",
        description: error?.message,
      });
    }
  };

  /* ── Status modal ── */

  const openStatusModal = () => {
    setSelectedStatus(null);
    form.resetFields();
    form.setFieldsValue({
      PaymentReference: payslip?.paymentReference ?? "",
      PaymentMethod: payslip?.paymentMethod ?? "",
      Notes: "",
    });
    setModalOpen(true);
  };

  const handleSelectStatus = (value: PayslipStatus) => {
    // Toggle off if already selected
    setSelectedStatus((prev) => (prev === value ? null : value));
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === null) {
      notification.warning({
        title: "Pilih status baru",
        description: "Silakan pilih status yang ingin diterapkan.",
      });
      return;
    }

    try {
      const values = await form.validateFields();
      setUpdatingStatus(true);

      const id = parseInt(resolvedParams.id);
      const res = await UpdatePayslipStatusService(id, {
        Status: selectedStatus,
        PaymentReference: values.PaymentReference || null,
        PaymentMethod: values.PaymentMethod || null,
        Notes: values.Notes || null,
      });

      if (res.success) {
        notification.success({
          title: "Status berhasil diupdate",
          description: `Status diubah menjadi ${getStatusMeta(res.data.status).label}`,
        });
        setModalOpen(false);
        setSelectedStatus(null);
        await fetchPayslipDetail();
      }
    } catch (error: any) {
      notification.error({
        title: "Gagal update status",
        description: error?.message || "Terjadi kesalahan.",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* ── Render ── */

  if (loading || !payslip) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Memuat data…
      </div>
    );
  }

  const currentStatusNum = parseInt(payslip.status);
  const statusOptions = buildStatusOptions(currentStatusNum);
  const statusMeta = getStatusMeta(payslip.status);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4">
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
        <div className="flex items-center gap-2">
          <Button icon={<EditOutlined />} onClick={openStatusModal}>
            Update Status
          </Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
          >
            Export PDF
          </Button>
        </div>
      </div>

      {/* ── PDF content wrapper ── */}
      <div id="payslip-pdf-content" className="space-y-4">
        {/* Card: Info karyawan */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-lg flex-shrink-0">
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
            color={statusMeta.antColor}
            className="rounded-full px-3 py-1 text-xs font-medium flex-shrink-0"
          >
            {statusMeta.label}
          </Tag>
        </div>

        {/* Card: Ringkasan kerja */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <CardTitle icon={<BarChartOutlined />} label="Ringkasan kerja" />
          <div className="flex flex-wrap gap-3">
            <StatBox
              value={payslip.totalSessions}
              label="Sesi"
              color="emerald"
            />
            <StatBox
              value={payslip.totalHoursWorked}
              label="Jam"
              color="blue"
            />
            <StatBox value={payslip.daysWorked} label="Hari" color="purple" />
            <StatBox
              value={payslip.averageRating.toFixed(1)}
              label="Rating"
              color="amber"
            />
          </div>
        </div>

        {/* Cards: Pendapatan & Potongan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <CardTitle
              icon={<CheckCircleOutlined />}
              label="Pendapatan"
              labelClass="text-emerald-700"
            />
            <RowItem
              label="Gaji pokok"
              value={formatCurrency(payslip.baseSalary)}
            />
            <RowItem
              label="Komisi"
              value={formatCurrency(payslip.totalCommission)}
            />
            <RowItem label="Bonus" value={formatCurrency(payslip.totalBonus)} />
            <RowItem
              label="Lembur"
              value={formatCurrency(payslip.overtimePay)}
            />
            <RowItem
              label="Lainnya"
              value={formatCurrency(payslip.otherEarnings)}
            />
            <TotalBar
              label="Total kotor"
              value={formatCurrency(payslip.grossEarnings)}
              variant="earn"
            />
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <CardTitle
              icon={<MinusCircleOutlined />}
              label="Potongan"
              labelClass="text-red-700"
            />
            <RowItem
              label="Pajak"
              value={formatCurrency(payslip.taxDeduction)}
            />
            <RowItem
              label="Asuransi"
              value={formatCurrency(payslip.insuranceDeduction)}
            />
            <RowItem
              label="Denda"
              value={formatCurrency(payslip.penaltyDeduction)}
            />
            <RowItem
              label="Lainnya"
              value={formatCurrency(payslip.otherDeductions)}
            />
            <TotalBar
              label="Total potongan"
              value={formatCurrency(payslip.totalDeductions)}
              variant="deduct"
            />
          </div>
        </div>

        {/* Card: Net pay */}
        <div className="bg-emerald-800 rounded-xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 flex items-center justify-center text-emerald-200 text-lg">
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

        {/* Cards: Info pembayaran & Catatan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <CardTitle
              icon={<InfoCircleOutlined />}
              label="Informasi pembayaran"
            />
            <div className="flex gap-4 flex-wrap">
              <PayInfo
                label="Dibuat"
                value={formatDateTime(payslip.createdAt)}
              />
              <PayInfo label="Dikirim" value={formatDateTime(payslip.sentAt)} />
              <PayInfo
                label="Dilihat"
                value={formatDateTime(payslip.viewedAt)}
              />
              <PayInfo label="Dibayar" value={formatDateTime(payslip.paidAt)} />
            </div>
          </div>

          {(payslip.employeeNotes || payslip.internalNotes) && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <CardTitle icon={<FileTextOutlined />} label="Catatan" />
              <div className="space-y-3">
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

      {/* ── Update Status Modal ── */}
      <Modal
        title="Update Status Payslip"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={560}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="mt-4">
          {/* Current status */}
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-600 mb-2">
              Status saat ini
            </p>
            <Tag
              color={statusMeta.antColor}
              className="text-sm px-3 py-1 rounded-full"
            >
              {statusMeta.label}
            </Tag>
          </div>

          {/* Status selector */}
          <div className="mb-6">
            <p className="text-sm font-medium text-slate-600 mb-2">
              Pilih status baru
            </p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((opt) => {
                const isSelected = selectedStatus === opt.value;
                const selectedClass = isSelected
                  ? "!bg-emerald-50 !border-emerald-400 !text-emerald-700"
                  : "";

                return (
                  <Tooltip key={opt.value} title={opt.tooltip} placement="top">
                    <Button
                      disabled={opt.disabled}
                      onClick={() => handleSelectStatus(opt.value)}
                      className={`flex items-center gap-1.5 ${selectedClass}`}
                      icon={opt.icon}
                    >
                      {opt.label}
                    </Button>
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Fields — only shown when relevant */}
          {selectedStatus === PayslipStatus.Paid && (
            <>
              <Form.Item
                label="Referensi Pembayaran"
                name="PaymentReference"
                rules={[{ required: true, message: "Referensi wajib diisi" }]}
              >
                <Input placeholder="Contoh: TRF-20250501-009" />
              </Form.Item>
              <Form.Item
                label="Metode Pembayaran"
                name="PaymentMethod"
                rules={[
                  { required: true, message: "Metode pembayaran wajib diisi" },
                ]}
              >
                <Input placeholder="Contoh: Transfer, Cash" />
              </Form.Item>
            </>
          )}

          <Form.Item label="Catatan" name="Notes">
            <Input.TextArea
              rows={3}
              placeholder="Catatan tambahan (opsional)"
            />
          </Form.Item>

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={() => setModalOpen(false)}>Batal</Button>
            <Button
              type="primary"
              loading={updatingStatus}
              onClick={handleUpdateStatus}
              disabled={selectedStatus === null}
            >
              Simpan perubahan
            </Button>
          </div>
        </Form>
      </Modal>
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
      <span className="text-sm">{icon}</span>
      {label}
    </div>
  );
}

const STAT_COLORS: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-600",
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  amber: "bg-amber-50 text-amber-600",
};

function StatBox({
  value,
  label,
  color,
}: {
  value: string | number;
  label: string;
  color: string;
}) {
  return (
    <div
      className={`flex-1 min-w-[100px] rounded-lg p-3 text-center ${STAT_COLORS[color] ?? "bg-slate-50 text-slate-600"}`}
    >
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] text-slate-400 font-medium tracking-widest mt-1 uppercase">
        {label}
      </div>
    </div>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}

function TotalBar({
  label,
  value,
  variant,
}: {
  label: string;
  value: string;
  variant: "earn" | "deduct";
}) {
  const cls =
    variant === "earn"
      ? "bg-emerald-50 text-emerald-800"
      : "bg-red-50 text-red-800";
  const valCls = variant === "earn" ? "text-emerald-700" : "text-red-700";
  return (
    <div
      className={`flex justify-between items-center mt-3 rounded-lg px-4 py-3 ${cls}`}
    >
      <span className="text-sm font-semibold">{label}</span>
      <span className={`text-base font-bold ${valCls}`}>{value}</span>
    </div>
  );
}

function PayInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 min-w-[120px]">
      <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}
