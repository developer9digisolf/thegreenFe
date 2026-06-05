"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Tag,
  Modal,
  Form,
  notification,
  Select,
  Spin,
  Dropdown,
  MenuProps,
  Switch,
  Input,
  InputNumber,
} from "antd";
import {
  MoreOutlined,
  PlusOutlined,
  DollarOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import {
  AdditionalCostGetAllService,
  AdditionalCostGetDetailService,
  AdditionalCostCreateService,
  AdditionalCostUpdateService,
  AdditionalCostDeleteService,
} from "@afx/services/additional-cost.service";
import {
  IAdditionalCost,
  IAdditionalCostDetail,
  ICreateAdditionalCostRequest,
  IUpdateAdditionalCostRequest,
  AdditionalCostTypeEnum,
} from "@afx/interfaces/additional-cost.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";

const { TextArea } = Input;

export default function AdditionalCostsView() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [additionalCosts, setAdditionalCosts] = useState<IAdditionalCost[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState("");
  const [tempSearch, setTempSearch] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [formType, setFormType] = useState<"create" | "update" | "detail">(
    "create",
  );
  const [selectedCost, setSelectedCost] =
    useState<IAdditionalCostDetail | null>(null);
  const [forms] = Form.useForm();

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
    name: string;
  }>({
    open: false,
    id: null,
    name: "",
  });

  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchText,
  ) => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
        SortColumn: "createdat",
        SortDirection: "desc",
      };
      if (search) params.search = search;

      const res = await AdditionalCostGetAllService(params);

      if (res.success) {
        setAdditionalCosts(res.data);
        setPagination({
          current: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || 10,
          total: res.pagination?.total || 0,
        });
      } else {
        console.error("[AdditionalCostsView] API call failed:", res.message);
      }
    } catch (err: any) {
      console.error("Failed to fetch additional costs", err);
      notification.error({
        title: "Gagal Memuat Data",
        description:
          err?.message || "Terjadi kesalahan saat memuat data biaya tambahan",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, searchText]);

  const handleSearch = () => {
    setSearchText(tempSearch);
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleOpenCreate = () => {
    setFormType("create");
    setSelectedCost(null);
    forms.resetFields();
    forms.setFieldsValue({ isPercentage: false, sortOrder: 0 });
    setOpenForm(true);
  };

  const handleOpenEdit = async (cost: IAdditionalCost) => {
    setLoading(true);
    try {
      const res = await AdditionalCostGetDetailService(cost.id);
      if (res.success && res.data) {
        setFormType("update");
        setSelectedCost(res.data);
        forms.setFieldsValue(res.data);
        setOpenForm(true);
      }
    } catch (error: any) {
      notification.error({
        title: "Gagal mengambil detail biaya tambahan",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = async (cost: IAdditionalCost) => {
    setLoading(true);
    try {
      const res = await AdditionalCostGetDetailService(cost.id);
      if (res.success && res.data) {
        setFormType("detail");
        setSelectedCost(res.data);
        forms.setFieldsValue(res.data);
        setOpenForm(true);
      }
    } catch (error: any) {
      notification.error({
        title: "Gagal mengambil detail biaya tambahan",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedCost(null);
    forms.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await forms.validateFields();
      setSaving(true);

      if (formType === "create") {
        const createPayload: ICreateAdditionalCostRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          costType: values.costType,
          defaultPrice: values.defaultPrice,
          isPercentage: values.isPercentage,
          sortOrder: values.sortOrder || 0,
        };
        const res = await AdditionalCostCreateService(createPayload);
        if (res.success) {
          notification.success({
            title: "Biaya tambahan berhasil ditambahkan",
          });
          handleCloseForm();
          fetchData(1);
        } else {
          notification.error({
            title: "Gagal Menyimpan",
            description: res.message,
          });
        }
      } else if (selectedCost) {
        const updatePayload: IUpdateAdditionalCostRequest = {
          code: values.code,
          name: values.name,
          description: values.description,
          costType: values.costType,
          defaultPrice: values.defaultPrice,
          isPercentage: values.isPercentage,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
        };
        const res = await AdditionalCostUpdateService(
          selectedCost.id,
          updatePayload,
        );
        if (res.success) {
          notification.success({ title: "Biaya tambahan berhasil diperbarui" });
          handleCloseForm();
          fetchData();
        } else {
          notification.error({
            title: "Gagal Menyimpan",
            description: res.message,
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err?.errorFields) {
        notification.warning({
          title: "Validasi Gagal",
          description: err.errorFields[0].errors[0],
        });
      } else {
        notification.error({
          title: "Gagal Menyimpan",
          description: err?.message || "Terjadi kesalahan saat menyimpan data",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.id) return;
    setLoading(true);
    try {
      const res = await AdditionalCostDeleteService(deleteModal.id);
      if (res.success) {
        notification.success({ title: "Biaya tambahan berhasil dihapus" });
        setDeleteModal({ open: false, id: null, name: "" });
        fetchData();
      } else {
        notification.error({
          title: "Gagal Menghapus",
          description: res.message,
        });
      }
    } catch (err: any) {
      console.error(err);
      notification.error({
        title: "Gagal Menghapus",
        description:
          err?.message || "Terjadi kesalahan saat menghapus biaya tambahan",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const getCostTypeLabel = (costType: string) => {
    const labels: Record<string, string> = {
      service_fee: "Service Fee",
      tax: "Pajak",
      gratuity: "Gratuity/Tip",
      delivery_fee: "Biaya Pengiriman",
      packaging_fee: "Biaya Packaging",
      admin_fee: "Biaya Admin",
      vip_fee: "Biaya VIP",
      other: "Lainnya",
    };
    return labels[costType] || costType;
  };

  const getCostTypeColor = (costType: string) => {
    const colors: Record<string, string> = {
      service_fee: "#059669",
      tax: "#dc2626",
      gratuity: "#d97706",
      delivery_fee: "#2563eb",
      packaging_fee: "#7c3aed",
      admin_fee: "#0891b2",
      vip_fee: "#db2777",
      other: "#64748b",
    };
    return colors[costType] || "#64748b";
  };

  const columns: Column[] = [
    { key: "id", title: "ID", width: "70px", align: "center" },
    {
      key: "name",
      title: "Nama Biaya",
      width: "300px",
      render: (_: any, record: IAdditionalCost) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
            style={{
              backgroundColor: `${getCostTypeColor(record.costType)}15`,
              color: getCostTypeColor(record.costType),
            }}
          >
            <DollarOutlined />
          </div>
          <div className="flex flex-col">
            <div className="font-bold text-slate-700 truncate">
              {record.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
              {record.description || "Tidak ada deskripsi"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "code",
      title: "Kode",
      width: "150px",
      render: (v: string) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded">
          {v}
        </span>
      ),
    },
    {
      key: "costType",
      title: "Tipe Biaya",
      width: "180px",
      render: (v: string) => (
        <Tag
          style={{
            backgroundColor: `${getCostTypeColor(v)}10`,
            color: getCostTypeColor(v),
            borderColor: `${getCostTypeColor(v)}20`,
          }}
          className="rounded-full px-3 font-medium border"
        >
          {getCostTypeLabel(v)}
        </Tag>
      ),
    },
    {
      key: "price",
      title: "Harga Default",
      width: "200px",
      render: (_: any, record: IAdditionalCost) => (
        <div className="flex items-center gap-2">
          <div
            className="font-bold bg-slate-50 py-1 px-3 rounded-lg border border-slate-100"
            style={{ color: record.isPercentage ? "#059669" : "#d97706" }}
          >
            {record.isPercentage
              ? `${record.defaultPrice}%`
              : formatCurrency(record.defaultPrice)}
          </div>
          <Tag
            color={record.isPercentage ? "green" : "orange"}
            className="text-xs"
          >
            {record.isPercentage ? "Persentase" : "Nominal"}
          </Tag>
        </div>
      ),
    },
    {
      key: "isActive",
      title: "Status",
      width: "100px",
      align: "center",
      render: (v: boolean) => (
        <Tag color={v ? "green" : "red"} className="rounded-full px-3">
          {v ? "Aktif" : "Nonaktif"}
        </Tag>
      ),
    },
    {
      key: "actions",
      title: "Aksi",
      width: "100px",
      align: "center",
      render: (_: any, record: IAdditionalCost) => {
        const items: MenuProps["items"] = [
          {
            key: "detail",
            label: "Detail",
            icon: <EyeOutlined />,
            onClick: () => handleOpenDetail(record),
          },
          {
            key: "edit",
            label: "Edit",
            icon: <EditOutlined />,
            onClick: () => handleOpenEdit(record),
          },
          { type: "divider" },
          {
            key: "delete",
            label: "Hapus",
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () =>
              setDeleteModal({ open: true, id: record.id, name: record.name }),
          },
        ];
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

  const isDetail = formType === "detail";

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <Typography.Title
            level={2}
            className="!m-0 text-slate-800 font-extrabold tracking-tight"
          >
            Master Biaya Tambahan
          </Typography.Title>
          <Typography.Text className="text-slate-400 font-medium">
            Kelola biaya tambahan seperti pajak, tip, dan biaya layanan lainnya
          </Typography.Text>
        </div>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
        >
          Tambah Biaya Tambahan
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
        <UseDynamicTable
          columns={columns}
          data={additionalCosts}
          loading={loading}
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
          sortState={{ key: "createdAt", direction: "desc" }}
          onSortChange={() => {}}
          searchText={tempSearch}
          setSearchText={setTempSearch}
          onSearch={handleSearch}
          searchPlaceholder="Cari nama biaya tambahan..."
        />
      </div>

      {/* Form Modal */}
      <Modal
        title={
          formType === "create"
            ? "Tambah Biaya Tambahan"
            : formType === "detail"
              ? "Detail Biaya Tambahan"
              : "Edit Biaya Tambahan"
        }
        open={openForm}
        onCancel={() => !saving && handleCloseForm()}
        footer={null}
        width={700}
        destroyOnHidden
      >
        <Spin spinning={saving || (loading && formType !== "create")}>
          <Form form={forms} layout="vertical" onFinish={handleSave}>
            {/* Baris 1: Nama Biaya & Kode */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label="Nama Biaya"
                rules={[{ required: true, message: "Nama wajib diisi" }]}
              >
                <Input placeholder="Contoh: Service Fee" disabled={isDetail} />
              </Form.Item>
              <Form.Item
                name="code"
                label="Kode"
                rules={[
                  { required: true, message: "Kode wajib diisi" },
                  {
                    pattern: /^[A-Z0-9_]+$/,
                    message: "Kode harus huruf kapital, angka, dan underscore",
                  },
                ]}
              >
                <Input placeholder="SERVICE_FEE" disabled={isDetail} />
              </Form.Item>
            </div>

            {/* Baris 2: Tipe Biaya & Urutan Tampil */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="costType"
                label="Tipe Biaya"
                rules={[
                  { required: true, message: "Tipe biaya wajib dipilih" },
                ]}
              >
                <Select
                  placeholder="Pilih Tipe Biaya"
                  disabled={isDetail}
                  options={Object.entries(AdditionalCostTypeEnum).map(
                    ([key, value]) => ({
                      label: key
                        .replace(/([A-Z])/g, " $1")
                        .trim()
                        .replace(/^./, (str) => str.toUpperCase()),
                      value,
                    }),
                  )}
                />
              </Form.Item>
              <Form.Item
                name="sortOrder"
                label="Urutan Tampil"
                initialValue={0}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                  disabled={isDetail}
                />
              </Form.Item>
            </div>

            {/* Baris 3: Deskripsi */}
            <Form.Item name="description" label="Deskripsi">
              <TextArea
                rows={3}
                placeholder="Deskripsi biaya tambahan..."
                disabled={isDetail}
              />
            </Form.Item>

            {/* Baris 4: Tipe Harga & Nilai Default */}
            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="isPercentage"
                label="Tipe Harga"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Persentase"
                  unCheckedChildren="Nominal"
                  disabled={isDetail}
                />
              </Form.Item>
              <Form.Item
                name="defaultPrice"
                label="Nilai Default"
                rules={[
                  { required: true, message: "Nilai default wajib diisi" },
                ]}
              >
                <InputNumber
                  min={0}
                  style={{ width: "100%" }}
                  placeholder="0"
                  disabled={isDetail}
                />
              </Form.Item>
            </div>

            {/* Baris 5: Status Aktif (hanya edit/detail) */}
            {formType !== "create" && (
              <Form.Item
                name="isActive"
                label="Status Aktif"
                valuePropName="checked"
              >
                <Switch
                  checkedChildren="Aktif"
                  unCheckedChildren="Nonaktif"
                  disabled={isDetail}
                />
              </Form.Item>
            )}

            {/* Footer Buttons */}
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                {isDetail ? (
                  <Button type="primary" onClick={() => setFormType("update")}>
                    Edit Data
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleCloseForm}>Batal</Button>
                    <Button type="primary" htmlType="submit" loading={saving}>
                      {formType === "create" ? "Simpan" : "Update"}
                    </Button>
                  </>
                )}
              </div>
            </Form.Item>
          </Form>
        </Spin>
      </Modal>

      {/* Delete Confirm Modal */}
      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.name)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
          loading={loading}
        />
      )}
    </div>
  );
}
