"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Typography,
  Tag,
  App,
  Button,
  Table,
  Modal,
  Form,
  InputNumber,
  Input,
} from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import {
  GetPayrollPeriodByCodeService,
  GetPayrollCalculationsService,
  UpdatePayrollCalculationService,
} from "@afx/services/payroll.service";
import {
  IPayrollPeriod,
  IPayrollCalculation,
  IPayrollEmployeeCalculation,
} from "@afx/interfaces/payroll.iface";
import { useRouter } from "next/navigation";

export default function PayrollCalculationsPage() {
  const params = useParams();
  const router = useRouter();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPayrollEmployeeCalculation[]>([]);
  const [period, setPeriod] = useState<IPayrollPeriod | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] =
    useState<IPayrollCalculation | null>(null);
  const [editForm] = Form.useForm();

  const periodCode = (params?.code as string) || "";

  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
  ) => {
    setLoading(true);
    try {
      const res = await GetPayrollCalculationsService(periodCode, {
        page,
        pageSize,
        sortColumn: "createdat",
        sortDirection: "desc",
      });
      console.log("API Response:", res);

      if (res.success) {
        const responseData = res.data as any;
        console.log("Response Data:", responseData);

        if (responseData?.pageData) {
          setData(responseData.pageData);
          setPagination({
            current: responseData?.pageInfo?.currentPage || 1,
            pageSize: responseData?.pageInfo?.pageSize || 10,
            total: responseData?.pageInfo?.total || 0,
          });
        } else if (responseData?.data?.pageData) {
          setData(responseData.data.pageData);
          setPagination({
            current: responseData.data?.pageInfo?.currentPage || 1,
            pageSize: responseData.data?.pageInfo?.pageSize || 10,
            total: responseData.data?.pageInfo?.total || 0,
          });
        } else if (Array.isArray(responseData)) {
          setData(responseData);
        }
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      notification.error({
        message: "Gagal Memuat Data",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPeriod = async () => {
    try {
      const res = await GetPayrollPeriodByCodeService(periodCode);
      if (res.success) {
        setPeriod(res.data);
      }
    } catch (err: any) {
      notification.error({
        message: "Gagal Memuat Periode",
        description: err?.message || "Terjadi kesalahan",
      });
    }
  };

  useEffect(() => {
    fetchPeriod();
  }, [periodCode]);

  useEffect(() => {
    if (period) {
      fetchData();
    }
  }, [pagination.current, pagination.pageSize, period]);

  const formatCurrency = (amount: number) =>
    `Rp ${amount?.toLocaleString("id-ID", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (dateString: string | null) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "orange",
      calculated: "blue",
      paid: "green",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pending",
      calculated: "Dihitung",
      paid: "Dibayar",
    };
    return labels[status?.toLowerCase()] || status;
  };

  const handleOpenEdit = (record: IPayrollCalculation) => {
    setSelectedCalculation(record);
    editForm.setFieldsValue({
      baseCommission: record.baseCommission,
      bonusAmount: record.bonusAmount,
      penaltyAmount: record.penaltyAmount,
      overtimeAmount: record.overtimeAmount,
      otherAdjustments: record.otherAdjustments,
      notes: record.notes,
      adjustmentNotes: record.adjustmentNotes || "",
    });
    setEditModalOpen(true);
  };

  const handleSubmitEdit = async () => {
    if (!selectedCalculation?.id) return;
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      const res = await UpdatePayrollCalculationService(
        selectedCalculation.id,
        values,
      );
      if (res.success) {
        notification.success({
          message: "Berhasil",
          description: "Perhitungan gaji berhasil diperbarui",
        });
        setEditModalOpen(false);
        setSelectedCalculation(null);
        editForm.resetFields();
        fetchData(pagination.current, pagination.pageSize);
      }
    } catch (err: any) {
      notification.error({
        message: "Gagal Memperbarui",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  // Main table columns for employee summary
  const employeeColumns = [
    {
      title: "Karyawan",
      dataIndex: "employeeName",
      key: "employeeName",
      width: "200px",
      render: (text: string) => (
        <div className="font-bold text-slate-700">{text}</div>
      ),
    },
    {
      title: "Total Sesi",
      dataIndex: "totalSessions",
      key: "totalSessions",
      width: "100px",
      align: "center" as const,
      render: (text: number) => (
        <span className="font-semibold text-slate-700">{text}</span>
      ),
    },
    {
      title: "Komisi Dasar",
      dataIndex: "totalBaseCommission",
      key: "totalBaseCommission",
      width: "150px",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-semibold text-slate-700">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Bonus",
      dataIndex: "totalBonusAmount",
      key: "totalBonusAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-emerald-600 font-semibold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Penalti",
      dataIndex: "totalPenaltyAmount",
      key: "totalPenaltyAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-red-600 font-semibold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Overtime",
      dataIndex: "totalOvertimeAmount",
      key: "totalOvertimeAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-blue-600 font-semibold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Penyesuaian",
      dataIndex: "totalOtherAdjustments",
      key: "totalOtherAdjustments",
      width: "140px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-purple-600 font-semibold">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "150px",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Status Pembayaran",
      key: "paymentStatus",
      width: "180px",
      align: "center" as const,
      render: (_: any, record: IPayrollEmployeeCalculation) => (
        <div className="flex gap-1 justify-center flex-wrap">
          {record.pendingCount > 0 && (
            <Tag color="orange" className="rounded-full px-2 text-xs">
              {record.pendingCount} Pending
            </Tag>
          )}
          {record.approvedCount > 0 && (
            <Tag color="blue" className="rounded-full px-2 text-xs">
              {record.approvedCount} Disetujui
            </Tag>
          )}
          {record.paidCount > 0 && (
            <Tag color="green" className="rounded-full px-2 text-xs">
              {record.paidCount} Dibayar
            </Tag>
          )}
        </div>
      ),
    },
  ];

  // Sub-table columns for detailed calculations
  const detailColumns = [
    {
      title: "Kode Sesi",
      dataIndex: "sessionCode",
      key: "sessionCode",
      width: "180px",
      render: (text: string) => (
        <span className="text-sm text-slate-600 font-mono">{text}</span>
      ),
    },
    {
      title: "Tanggal Sesi",
      dataIndex: "sessionDate",
      key: "sessionDate",
      width: "150px",
      render: (text: string) => (
        <span className="text-sm text-slate-600">{formatDate(text)}</span>
      ),
    },
    {
      title: "Komisi Dasar",
      dataIndex: "baseCommission",
      key: "baseCommission",
      width: "150px",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-semibold text-slate-700 text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Bonus",
      dataIndex: "bonusAmount",
      key: "bonusAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-emerald-600 font-semibold text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Penalti",
      dataIndex: "penaltyAmount",
      key: "penaltyAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-red-600 font-semibold text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Overtime",
      dataIndex: "overtimeAmount",
      key: "overtimeAmount",
      width: "120px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-blue-600 font-semibold text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Penyesuaian",
      dataIndex: "otherAdjustments",
      key: "otherAdjustments",
      width: "140px",
      align: "right" as const,
      render: (value: number) => (
        <span className="text-purple-600 font-semibold text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: "150px",
      align: "right" as const,
      render: (value: number) => (
        <span className="font-bold text-slate-900 text-sm">
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "120px",
      align: "center" as const,
      render: (status: string) => (
        <Tag color={getStatusColor(status)} className="rounded-full px-3">
          {getStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "actions",
      width: "80px",
      align: "center" as const,
      render: (_: any, record: IPayrollCalculation) => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => handleOpenEdit(record)}
          className="text-blue-600 hover:text-blue-800"
        />
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/dashboard/payroll")}
          className="hover:bg-slate-100"
        >
          Kembali
        </Button>
        <div className="flex-1">
          <Typography.Title
            level={2}
            className="!m-0 text-slate-800 font-extrabold tracking-tight"
          >
            Calculations - {periodCode}
          </Typography.Title>
          {period && (
            <Typography.Text className="text-slate-400 font-medium">
              {period.periodName}
            </Typography.Text>
          )}
        </div>
      </div>

      {period && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Sesi
                </p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {period.totalSessions}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <i className="fa-solid fa-calendar-check text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Karyawan
                </p>
                <p className="text-3xl font-extrabold text-slate-800">
                  {period.totalEmployees}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                <i className="fa-solid fa-users text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Gaji Kotor
                </p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {formatCurrency(period.totalGrossPay)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <i className="fa-solid fa-money-bill-trend-up text-xl" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Total Gaji Bersih
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {formatCurrency(period.totalNetPay)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <i className="fa-solid fa-wallet text-xl" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
        <Table
          columns={employeeColumns}
          dataSource={data}
          loading={loading}
          rowKey="employeeId"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} karyawan`,
            onChange: (page, pageSize) => {
              setPagination({
                current: page,
                pageSize: pageSize || 10,
                total: pagination.total,
              });
            },
            onShowSizeChange: (current, size) => {
              setPagination({
                current: 1,
                pageSize: size,
                total: pagination.total,
              });
            },
          }}
          expandable={{
            expandedRowKeys,
            onExpandedRowsChange: (keys) => setExpandedRowKeys([...keys]),
            expandIcon: ({ expanded, onExpand, record }) =>
              expanded ? (
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined rotate={90} />}
                  onClick={(e) => onExpand(record, e)}
                  className="text-slate-600 hover:text-slate-900"
                />
              ) : (
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined rotate={-90} />}
                  onClick={(e) => onExpand(record, e)}
                  className="text-slate-600 hover:text-slate-900"
                />
              ),
            expandedRowRender: (record: IPayrollEmployeeCalculation) => (
              <div className="pl-4 pr-0">
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="mb-3 flex items-center justify-between">
                    <Typography.Text strong className="text-slate-700">
                      Detail Perhitungan - {record.employeeName}
                    </Typography.Text>
                    <Typography.Text className="text-slate-500 text-sm">
                      {formatDate(record.earliestSessionDate)} -{" "}
                      {formatDate(record.latestSessionDate)}
                    </Typography.Text>
                  </div>
                  <Table
                    columns={detailColumns}
                    dataSource={record.calculations}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    bordered={false}
                    className="mb-0"
                  />
                </div>
              </div>
            ),
            rowExpandable: (record: IPayrollEmployeeCalculation) =>
              record.calculations && record.calculations.length > 0,
          }}
        />
      </div>

      {/* Edit Calculation Modal */}
      <Modal
        width={700}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setSelectedCalculation(null);
          editForm.resetFields();
        }}
        footer={null}
        centered
        title={
          <div className="flex items-center gap-3">
            <EditOutlined />
            <span className="font-bold">Edit Perhitungan Gaji</span>
          </div>
        }
      >
        {selectedCalculation && (
          <Form form={editForm} layout="vertical" className="mt-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Typography.Text className="text-sm text-slate-500 block mb-1">
                  Kode Sesi
                </Typography.Text>
                <Typography.Text strong className="text-slate-900">
                  {selectedCalculation.sessionCode}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text className="text-sm text-slate-500 block mb-1">
                  Karyawan
                </Typography.Text>
                <Typography.Text strong className="text-slate-900">
                  {selectedCalculation.employeeName}
                </Typography.Text>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Typography.Text className="text-sm text-slate-500 block mb-1">
                  Tanggal Sesi
                </Typography.Text>
                <Typography.Text className="text-slate-700">
                  {formatDate(selectedCalculation.sessionDate)}
                </Typography.Text>
              </div>
              <div>
                <Typography.Text className="text-sm text-slate-500 block mb-1">
                  Harga Layanan
                </Typography.Text>
                <Typography.Text className="text-slate-700">
                  {formatCurrency(selectedCalculation.servicePrice)}
                </Typography.Text>
              </div>
            </div>

            <Form.Item
              name="baseCommission"
              label="Komisi Dasar"
              rules={[{ required: true, message: "Komisi dasar wajib diisi" }]}
            >
              <InputNumber
                min={0}
                step={1000}
                formatter={(value) =>
                  `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => {
                  const parsed = value?.replace(/\Rp\s?|(,*)/g, "");
                  return parsed ? Number(parsed) : 0;
                }}
                style={{ width: "100%" }}
                className="text-slate-900"
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Item
                name="bonusAmount"
                label="Bonus"
                rules={[{ required: true, message: "Bonus wajib diisi" }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\Rp\s?|(,*)/g, "");
                    return parsed ? Number(parsed) : 0;
                  }}
                  style={{ width: "100%" }}
                  className="text-slate-900"
                />
              </Form.Item>

              <Form.Item
                name="penaltyAmount"
                label="Penalti"
                rules={[{ required: true, message: "Penalti wajib diisi" }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\Rp\s?|(,*)/g, "");
                    return parsed ? Number(parsed) : 0;
                  }}
                  style={{ width: "100%" }}
                  className="text-slate-900"
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <Form.Item
                name="overtimeAmount"
                label="Overtime"
                rules={[{ required: true, message: "Overtime wajib diisi" }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\Rp\s?|(,*)/g, "");
                    return parsed ? Number(parsed) : 0;
                  }}
                  style={{ width: "100%" }}
                  className="text-slate-900"
                />
              </Form.Item>

              <Form.Item
                name="otherAdjustments"
                label="Penyesuaian Lainnya"
                rules={[{ required: true, message: "Penyesuaian wajib diisi" }]}
              >
                <InputNumber
                  min={0}
                  step={1000}
                  formatter={(value) =>
                    `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => {
                    const parsed = value?.replace(/\Rp\s?|(,*)/g, "");
                    return parsed ? Number(parsed) : 0;
                  }}
                  style={{ width: "100%" }}
                  className="text-slate-900"
                />
              </Form.Item>
            </div>

            <Form.Item name="notes" label="Catatan">
              <Input.TextArea
                placeholder="Tambahkan catatan (opsional)..."
                rows={2}
                className="text-slate-900"
              />
            </Form.Item>

            <Form.Item name="adjustmentNotes" label="Catatan Penyesuaian">
              <Input.TextArea
                placeholder="Catatan penyesuaian (opsional)..."
                rows={2}
                className="text-slate-900"
              />
            </Form.Item>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <Button
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedCalculation(null);
                  editForm.resetFields();
                }}
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitEdit}
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Simpan Perubahan
              </Button>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
}
