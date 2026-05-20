"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  App,
  Button,
  Form,
  Input,
  InputNumber,
  Card,
  Divider,
  Spin,
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  DollarOutlined,
  WalletOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import {
  GetPayslipByIdService,
  UpdatePayslipService,
} from "@afx/services/payroll.service";
import { IPayslip, IUpdatePayslipRequest } from "@afx/interfaces/payroll.iface";

export default function PayslipEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { notification } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payslip, setPayslip] = useState<IPayslip | null>(null);

  useEffect(() => {
    fetchPayslip();
  }, [resolvedParams.id]);

  const fetchPayslip = async () => {
    setLoading(true);
    try {
      const id = parseInt(resolvedParams.id);
      if (isNaN(id)) {
        notification.error({
          message: "ID tidak valid",
          description: "ID payslip tidak ditemukan.",
        });
        return;
      }
      const res = await GetPayslipByIdService(id);
      if (res.success && res.data) {
        setPayslip(res.data);
        // Populate form with payslip data
        form.setFieldsValue({
          baseSalary: res.data.baseSalary,
          totalCommission: res.data.totalCommission,
          totalBonus: res.data.totalBonus,
          overtimePay: res.data.overtimePay,
          otherEarnings: res.data.otherEarnings,
          taxDeduction: res.data.taxDeduction,
          insuranceDeduction: res.data.insuranceDeduction,
          penaltyDeduction: res.data.penaltyDeduction,
          otherDeductions: res.data.otherDeductions,
          totalSessions: res.data.totalSessions,
          totalHoursWorked: res.data.totalHoursWorked,
          averageRating: res.data.averageRating,
          daysWorked: res.data.daysWorked,
          employeeNotes: res.data.employeeNotes,
          internalNotes: res.data.internalNotes,
        });
      }
    } catch (err: any) {
      notification.error({
        message: "Gagal memuat data",
        description: err?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const id = parseInt(resolvedParams.id);
      const updateData: IUpdatePayslipRequest = {
        baseSalary: values.baseSalary || 0,
        totalCommission: values.totalCommission || 0,
        totalBonus: values.totalBonus || 0,
        overtimePay: values.overtimePay || 0,
        otherEarnings: values.otherEarnings || 0,
        taxDeduction: values.taxDeduction || 0,
        insuranceDeduction: values.insuranceDeduction || 0,
        penaltyDeduction: values.penaltyDeduction || 0,
        otherDeductions: values.otherDeductions || 0,
        totalSessions: values.totalSessions || 0,
        totalHoursWorked: values.totalHoursWorked || 0,
        averageRating: values.averageRating || 0,
        daysWorked: values.daysWorked || 0,
        employeeNotes: values.employeeNotes || "",
        internalNotes: values.internalNotes || "",
        updateReason: values.updateReason || "",
      };

      const res = await UpdatePayslipService(id, updateData);

      if (res.success) {
        notification.success({
          message: "Berhasil",
          description: "Payslip berhasil diperbarui.",
        });
        router.push(`/dashboard/payroll/payslip/${id}`);
      }
    } catch (error: any) {
      notification.error({
        message: "Gagal update payslip",
        description: error?.message || "Terjadi kesalahan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) =>
    `Rp ${(amount ?? 0).toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Memuat data..." />
      </div>
    );
  }

  if (!payslip) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        Data tidak ditemukan
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
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
              Edit Payslip
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {payslip.payslipCode} - {payslip.employeeName}
            </p>
          </div>
        </div>
      </div>

      {/* Employee Info Card */}
      <Card className="mb-6 border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 text-xl flex-shrink-0">
            <UserOutlined />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-slate-800">
              {payslip.employeeName}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2">
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
            </div>
          </div>
        </div>
      </Card>

      {/* Form */}
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="space-y-6"
      >
        {/* Earnings Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <DollarOutlined className="text-emerald-600" />
              <span className="text-slate-700">Pendapatan</span>
            </div>
          }
          className="border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label="Gaji Pokok"
              name="baseSalary"
              rules={[{ required: true, message: "Gaji pokok wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Total Komisi"
              name="totalCommission"
              rules={[{ required: true, message: "Komisi wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Total Bonus"
              name="totalBonus"
              rules={[{ required: true, message: "Bonus wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Lembur"
              name="overtimePay"
              rules={[{ required: true, message: "Lembur wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Pendapatan Lainnya"
              name="otherEarnings"
              rules={[
                { required: true, message: "Pendapatan lain wajib diisi" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Deductions Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <WalletOutlined className="text-red-600" />
              <span className="text-slate-700">Potongan</span>
            </div>
          }
          className="border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Form.Item
              label="Pajak"
              name="taxDeduction"
              rules={[{ required: true, message: "Pajak wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Asuransi"
              name="insuranceDeduction"
              rules={[{ required: true, message: "Asuransi wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Denda"
              name="penaltyDeduction"
              rules={[{ required: true, message: "Denda wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Potongan Lainnya"
              name="otherDeductions"
              rules={[{ required: true, message: "Potongan lain wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                formatter={(value) => formatCurrency(value as number)}
                parser={(value) => {
                  const num = value
                    ? Number(value.replace(/[^0-9.-]+/g, ""))
                    : 0;
                  return num as any;
                }}
                min={0}
                placeholder="0"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Work Information Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-blue-600" />
              <span className="text-slate-700">Informasi Kerja</span>
            </div>
          }
          className="border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Form.Item
              label="Total Sesi"
              name="totalSessions"
              rules={[{ required: true, message: "Total sesi wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                readOnly
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Total Jam Kerja"
              name="totalHoursWorked"
              rules={[
                { required: true, message: "Total jam kerja wajib diisi" },
              ]}
            >
              <InputNumber
                style={{ width: "100%" }}
                readOnly
                min={0}
                placeholder="0"
              />
            </Form.Item>

            <Form.Item
              label="Rating Rata-rata"
              name="averageRating"
              rules={[{ required: true, message: "Rating wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                max={5}
                step={0.1}
                readOnly
                placeholder="0.0"
              />
            </Form.Item>

            <Form.Item
              label="Hari Kerja"
              name="daysWorked"
              rules={[{ required: true, message: "Hari kerja wajib diisi" }]}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                readOnly
                placeholder="0"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Notes Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <UserOutlined className="text-purple-600" />
              <span className="text-slate-700">Catatan</span>
            </div>
          }
          className="border-slate-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item label="Catatan Karyawan" name="employeeNotes">
              <Input.TextArea rows={3} placeholder="Catatan untuk karyawan" />
            </Form.Item>

            <Form.Item label="Catatan Internal" name="internalNotes">
              <Input.TextArea rows={3} placeholder="Catatan internal" />
            </Form.Item>
          </div>

          <Divider />

          <Form.Item
            label="Alasan Perubahan"
            name="updateReason"
            rules={[
              { required: true, message: "Alasan perubahan wajib diisi" },
            ]}
            tooltip="Jelaskan mengapa Anda melakukan perubahan pada payslip ini"
          >
            <Input.TextArea
              rows={2}
              placeholder="Contoh: Koreksi untuk perhitungan lembur"
            />
          </Form.Item>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={() => router.back()}>Batal</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={submitting}
          >
            Simpan Perubahan
          </Button>
        </div>
      </Form>
    </div>
  );
}
