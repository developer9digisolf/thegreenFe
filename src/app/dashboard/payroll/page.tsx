"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import {
  Typography,
  Tag,
  App,
  Button,
  Modal,
  Descriptions,
  Dropdown,
  Form,
  Input,
  DatePicker,
  Select,
  Table,
} from "antd";
import type { MenuProps } from "antd";
import {
  ReloadOutlined,
  PlusOutlined,
  MoreOutlined,
  CalendarOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import {
  GetPayrollPeriodsService,
  CreatePayrollPeriodService,
  GetPayrollPeriodByCodeService,
  UpdatePayrollPeriodService,
  DeletePayrollPeriodService,
  GetPayrollCalculationsService,
  UpdatePayrollPeriodStatusService,
} from "@afx/services/payroll.service";
import {
  IPayrollPeriod,
  IPayrollCalculation,
} from "@afx/interfaces/payroll.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";

export default function PayrollPage() {
  const router = useRouter();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPayrollPeriod[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<IPayrollPeriod | null>(
    null,
  );
  const [editPeriod, setEditPeriod] = useState<IPayrollPeriod | null>(null);
  const [calculations, setCalculations] = useState<IPayrollCalculation[]>([]);
  const [calculationsPagination, setCalculationsPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchQuery,
  ) => {
    setLoading(true);
    try {
      const res = await GetPayrollPeriodsService({
        page,
        pageSize,
        sortColumn: "createdat",
        sortDirection: "desc",
        search,
      });
      if (res.success) {
        setData(res.data);
        setPagination({
          current: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || 10,
          total: res.pagination?.total || 0,
        });
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Memuat Data",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const formatCurrency = (amount: number) =>
    `Rp ${amount?.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
      calculated: "blue",
      approved: "green",
      paid: "success",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      calculated: "Dihitung",
      approved: "Disetujui",
      paid: "Dibayar",
    };
    return labels[status?.toLowerCase()] || status;
  };

  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setLoading(true);
      const res = await CreatePayrollPeriodService({
        PeriodCode: values.periodCode,
        periodName: values.periodName,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        frequency: values.frequency,
        description: values.description,
      });
      if (res.success) {
        notification.success({ title: "Periode Payroll Berhasil Ditambahkan" });
        setCreateModalOpen(false);
        createForm.resetFields();
        fetchData(1);
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Menambahkan Periode",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (record: IPayrollPeriod) => {
    setLoading(true);
    try {
      const res = await GetPayrollPeriodByCodeService(record.periodCode);
      if (res.success) {
        setSelectedPeriod(res.data);
        await fetchCalculations(record.periodCode);
        setDetailModalOpen(true);
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Memuat Detail",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCalculations = async (
    code: string,
    page = calculationsPagination.current,
    pageSize = calculationsPagination.pageSize,
  ) => {
    try {
      const res = await GetPayrollCalculationsService(code, {
        page,
        pageSize,
        sortColumn: "createdat",
        sortDirection: "desc",
        search: "",
      });
      if (res.success) {
        const responseData = res.data as any;
        if (responseData?.pageData) {
          setCalculations(responseData.pageData);
          setCalculationsPagination({
            current: responseData?.pageInfo?.currentPage || 1,
            pageSize: responseData?.pageInfo?.pageSize || 10,
            total: responseData?.pageInfo?.total || 0,
          });
        }
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Memuat Calculations",
        description: err?.message || "Terjadi kesalahan",
      });
    }
  };

  const handleOpenEdit = (record: IPayrollPeriod) => {
    if (record.status?.toLowerCase() !== "draft") {
      notification.warning({
        title: "Tidak Dapat Mengedit",
        description: "Hanya periode dengan status Draft yang dapat diedit",
      });
      return;
    }
    setEditPeriod(record);
    editForm.setFieldsValue({
      periodCode: record.periodCode,
      periodName: record.periodName,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
      frequency:
        typeof record.frequency === "string"
          ? record.frequency === "weekly"
            ? 0
            : record.frequency === "biweekly"
              ? 1
              : record.frequency === "monthly"
                ? 2
                : 3
          : record.frequency,
      description: record.description,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editPeriod?.id) return;
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      const res = await UpdatePayrollPeriodService(editPeriod.id, {
        PeriodCode: values.periodCode,
        periodName: values.periodName,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate.format("YYYY-MM-DD"),
        frequency: values.frequency,
        description: values.description,
      });
      if (res.success) {
        notification.success({ title: "Periode Payroll Berhasil Diperbarui" });
        setEditModalOpen(false);
        setEditPeriod(null);
        editForm.resetFields();
        fetchData(pagination.current, pagination.pageSize, searchQuery);
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Memperbarui Periode",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record: IPayrollPeriod) => {
    Modal.confirm({
      title: "Hapus Periode Payroll",
      content: `Apakah Anda yakin ingin menghapus periode ${record.periodName}? Tindakan ini tidak dapat dibatalkan.`,
      okText: "Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          const res = await DeletePayrollPeriodService(record.id);
          if (res.success) {
            notification.success({ title: "Periode Payroll Berhasil Dihapus" });
            fetchData(pagination.current, pagination.pageSize, searchQuery);
          }
        } catch (err: any) {
          notification.error({
            title: "Gagal Menghapus Periode",
            description: err?.message || "Terjadi kesalahan",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleViewCalculations = (record: IPayrollPeriod) => {
    router.push(`/dashboard/payroll/${record.periodCode}/calculations`);
  };

  const handleStartProcessing = async (record: IPayrollPeriod) => {
    Modal.confirm({
      title: "Mulai Proses Perhitungan",
      content: `Apakah Anda yakin ingin memulai perhitungan gaji untuk periode ${record.periodName}? Status akan berubah menjadi Sedang Diproses.`,
      okText: "Mulai Proses",
      cancelText: "Batal",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await UpdatePayrollPeriodStatusService(record.id, {
            Status: 1, // Processing
            note: null,
          });
          if (res.success) {
            notification.success({
              title: "Proses Perhitungan Dimulai",
            });
            fetchData(pagination.current, pagination.pageSize, searchQuery);
          }
        } catch (err: any) {
          notification.error({
            title: "Gagal Memulai Proses",
            description: err?.message || "Terjadi kesalahan",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleApprove = async (record: IPayrollPeriod) => {
    Modal.confirm({
      title: "Setujui Periode Payroll",
      content: `Apakah Anda yakin ingin menyetujui periode ${record.periodName}? Status akan berubah menjadi Disetujui.`,
      okText: "Setujui",
      cancelText: "Batal",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await UpdatePayrollPeriodStatusService(record.id, {
            Status: 3, // Approved
            note: null,
          });
          if (res.success) {
            notification.success({
              title: "Periode Payroll Berhasil Disetujui",
            });
            fetchData(pagination.current, pagination.pageSize, searchQuery);
          }
        } catch (err: any) {
          notification.error({
            title: "Gagal Menyetujui Periode",
            description: err?.message || "Terjadi kesalahan",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleMarkAsPaid = async (record: IPayrollPeriod) => {
    Modal.confirm({
      title: "Tandai Sudah Dibayar",
      content: `Apakah Anda yakin ingin menandai periode ${record.periodName} sebagai sudah dibayar?`,
      okText: "Tandai Dibayar",
      cancelText: "Batal",
      onOk: async () => {
        try {
          setLoading(true);
          const res = await UpdatePayrollPeriodStatusService(record.id, {
            Status: 4, // Paid
            note: null,
          });
          if (res.success) {
            notification.success({
              title: "Periode Payroll Berhasil Ditandai Dibayar",
            });
            fetchData(pagination.current, pagination.pageSize, searchQuery);
          }
        } catch (err: any) {
          notification.error({
            title: "Gagal Menandai Periode",
            description: err?.message || "Terjadi kesalahan",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const columns: Column[] = [
    {
      key: "periodName",
      title: "Periode",
      width: "200px",
      render: (_: any, record: IPayrollPeriod) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{record.periodName}</span>
          <span className="text-xs text-slate-400">{record.periodCode}</span>
        </div>
      ),
    },
    {
      key: "startDate",
      title: "Tanggal",
      width: "180px",
      render: (_: any, record: IPayrollPeriod) => (
        <div className="text-sm">
          <div className="text-slate-700">{formatDate(record.startDate)}</div>
          <div className="text-xs text-slate-400">
            s/d {formatDate(record.endDate)}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: "120px",
      align: "center",
      render: (v: string) => (
        <Tag color={getStatusColor(v)} className="rounded-full px-3">
          {getStatusLabel(v)}
        </Tag>
      ),
    },
    {
      key: "totalEmployees",
      title: "Karyawan",
      width: "100px",
      align: "center",
      render: (v: number) => (
        <span className="font-bold text-slate-700">{v}</span>
      ),
    },
    {
      key: "totalNetPay",
      title: "Total Gaji Bersih",
      width: "200px",
      align: "right",
      render: (v: number) => (
        <span className="font-bold text-slate-900">{formatCurrency(v)}</span>
      ),
    },
    {
      key: "actions",
      title: "Aksi",
      width: "100px",
      align: "center",
      render: (_: any, record: IPayrollPeriod) => {
        const items: MenuProps["items"] = [];

        // Show "Lihat Calculations" only if status is NOT draft
        if (record.status?.toLowerCase() !== "draft") {
          items.push({
            key: "calculations",
            label: "Lihat Calculations",
            onClick: () => handleViewCalculations(record),
          });
        }

        items.push({
          key: "detail",
          label: "Detail",
          onClick: () => handleOpenDetail(record),
        });

        // Status-based actions
        if (record.status?.toLowerCase() === "calculated") {
          items.push({
            key: "approve",
            label: "Setujui",
            onClick: () => handleApprove(record),
            icon: <CheckCircleOutlined />,
          });
        } else if (record.status?.toLowerCase() === "approved") {
          items.push({
            key: "markpaid",
            label: "Tandai Dibayar",
            onClick: () => handleMarkAsPaid(record),
            icon: <DollarOutlined />,
          });
        }

        if (record.status?.toLowerCase() === "draft") {
          items.push({
            key: "startprocess",
            label: "Mulai Proses",
            onClick: () => handleStartProcessing(record),
            icon: <PlayCircleOutlined />,
          });
          items.push({
            key: "edit",
            label: "Edit",
            onClick: () => handleOpenEdit(record),
          });
          items.push({
            type: "divider",
          });
          items.push({
            key: "delete",
            label: "Hapus",
            onClick: () => handleDelete(record),
            danger: true,
            icon: <DeleteOutlined />,
          });
        }

        return (
          <div className="flex justify-center">
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <Typography.Title
            level={2}
            className="!m-0 text-slate-800 font-extrabold tracking-tight"
          >
            Payroll
          </Typography.Title>
          <Typography.Text className="text-slate-400 font-medium">
            Kelola periode dan gaji karyawan
          </Typography.Text>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setSearchQuery("");
              fetchData(1, pagination.pageSize, "");
            }}
            className="h-12 rounded-xl px-6 bg-slate-100 border-none font-bold text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ReloadOutlined /> Refresh
          </button>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalOpen(true)}
            className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
          >
            Tambah Periode
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total Periode
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                {pagination.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="fa-solid fa-calendar-days text-xl" />
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
                {data.reduce((sum, item) => sum + item.totalEmployees, 0)}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
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
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.totalGrossPay, 0),
                )}
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
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.totalNetPay, 0),
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <i className="fa-solid fa-wallet text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
        <UseDynamicTable
          columns={columns}
          data={data}
          pageInfo={{
            currentPage: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onPageChange={(p) =>
            setPagination((prev) => ({ ...prev, current: p }))
          }
          onPageSizeChange={(s) =>
            setPagination((prev) => ({ ...prev, pageSize: s, current: 1 }))
          }
          sortState={{ key: null, direction: null }}
          onSortChange={() => {}}
          searchPlaceholder="Cari periode payroll..."
          searchable={true}
          onSearch={(val) => {
            setSearchQuery(val);
            fetchData(1, pagination.pageSize, val);
          }}
        />
      </div>

      {/* Create Modal */}
      <Modal
        width={600}
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false);
          createForm.resetFields();
        }}
        footer={null}
        centered
        title={
          <div className="flex items-center gap-3">
            <CalendarOutlined />
            <span className="font-bold">Tambah Periode Payroll</span>
          </div>
        }
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="periodCode"
            label="Kode Periode"
            rules={[{ required: true, message: "Kode periode wajib diisi" }]}
          >
            <Input placeholder="Contoh: MEI2026" className="text-slate-900" />
          </Form.Item>
          <Form.Item
            name="periodName"
            label="Nama Periode"
            rules={[{ required: true, message: "Nama periode wajib diisi" }]}
          >
            <Input placeholder="Contoh: Mei 2026" className="text-slate-900" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Tanggal Mulai"
              rules={[{ required: true, message: "Tanggal mulai wajib diisi" }]}
            >
              <DatePicker
                className="w-full text-slate-900"
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Tanggal Selesai"
              rules={[
                { required: true, message: "Tanggal selesai wajib diisi" },
              ]}
            >
              <DatePicker
                className="w-full text-slate-900"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </div>
          <Form.Item
            name="frequency"
            label="Frekuensi"
            rules={[{ required: true, message: "Frekuensi wajib diisi" }]}
          >
            <Select
              className="w-full text-slate-900"
              placeholder="Pilih frekuensi"
            >
              <Select.Option value={0}>Mingguan (Weekly)</Select.Option>
              <Select.Option value={1}>Dua Mingguan (Bi-Weekly)</Select.Option>
              <Select.Option value={2}>Bulanan (Monthly)</Select.Option>
              <Select.Option value={3}>
                Dua Kali Sebulan (Semi-Monthly)
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea
              placeholder="Tambahkan deskripsi (opsional)..."
              rows={3}
              className="text-slate-900"
            />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setCreateModalOpen(false);
                createForm.resetFields();
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="primary"
              onClick={handleCreate}
              loading={loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        width={600}
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false);
          setEditPeriod(null);
          editForm.resetFields();
        }}
        footer={null}
        centered
        title={
          <div className="flex items-center gap-3">
            <CalendarOutlined />
            <span className="font-bold">Edit Periode Payroll</span>
          </div>
        }
      >
        <Form form={editForm} layout="vertical" className="mt-4">
          <Form.Item
            name="periodCode"
            label="Kode Periode"
            rules={[{ required: true, message: "Kode periode wajib diisi" }]}
          >
            <Input placeholder="Contoh: MEI2026" className="text-slate-900" />
          </Form.Item>
          <Form.Item
            name="periodName"
            label="Nama Periode"
            rules={[{ required: true, message: "Nama periode wajib diisi" }]}
          >
            <Input placeholder="Contoh: Mei 2026" className="text-slate-900" />
          </Form.Item>
          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="startDate"
              label="Tanggal Mulai"
              rules={[{ required: true, message: "Tanggal mulai wajib diisi" }]}
            >
              <DatePicker
                className="w-full text-slate-900"
                format="DD/MM/YYYY"
              />
            </Form.Item>
            <Form.Item
              name="endDate"
              label="Tanggal Selesai"
              rules={[
                { required: true, message: "Tanggal selesai wajib diisi" },
              ]}
            >
              <DatePicker
                className="w-full text-slate-900"
                format="DD/MM/YYYY"
              />
            </Form.Item>
          </div>
          <Form.Item
            name="frequency"
            label="Frekuensi"
            rules={[{ required: true, message: "Frekuensi wajib diisi" }]}
          >
            <Select
              className="w-full text-slate-900"
              placeholder="Pilih frekuensi"
            >
              <Select.Option value={0}>Mingguan (Weekly)</Select.Option>
              <Select.Option value={1}>Dua Mingguan (Bi-Weekly)</Select.Option>
              <Select.Option value={2}>Bulanan (Monthly)</Select.Option>
              <Select.Option value={3}>
                Dua Kali Sebulan (Semi-Monthly)
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="Deskripsi">
            <Input.TextArea
              placeholder="Tambahkan deskripsi (opsional)..."
              rows={3}
              className="text-slate-900"
            />
          </Form.Item>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              onClick={() => {
                setEditModalOpen(false);
                setEditPeriod(null);
                editForm.resetFields();
              }}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="primary"
              onClick={handleUpdate}
              loading={loading}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              Perbarui
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        width={700}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        centered
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="fa-solid fa-calendar-days" />
            </div>
            <span className="font-bold text-slate-800">
              Detail Periode Payroll
            </span>
          </div>
        }
      >
        {selectedPeriod && (
          <Descriptions column={2} bordered className="mt-4">
            <Descriptions.Item label="Kode Periode">
              {selectedPeriod.periodCode}
            </Descriptions.Item>
            <Descriptions.Item label="Nama Periode">
              {selectedPeriod.periodName}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Mulai">
              {formatDate(selectedPeriod.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Tanggal Selesai">
              {formatDate(selectedPeriod.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Frekuensi">
              {selectedPeriod.frequency}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusColor(selectedPeriod.status)}>
                {getStatusLabel(selectedPeriod.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Karyawan">
              {selectedPeriod.totalEmployees}
            </Descriptions.Item>
            <Descriptions.Item label="Jumlah Sesi">
              {selectedPeriod.totalSessions}
            </Descriptions.Item>
            <Descriptions.Item label="Total Gaji Kotor">
              {formatCurrency(selectedPeriod.totalGrossPay)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Potongan">
              {formatCurrency(selectedPeriod.totalDeductions)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Gaji Bersih" span={2}>
              {formatCurrency(selectedPeriod.totalNetPay)}
            </Descriptions.Item>
            <Descriptions.Item label="Deskripsi" span={2}>
              {selectedPeriod.description || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Dibuat Pada" span={2}>
              {formatDate(selectedPeriod.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Dihitung Pada" span={2}>
              {formatDate(selectedPeriod.calculatedAt)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
