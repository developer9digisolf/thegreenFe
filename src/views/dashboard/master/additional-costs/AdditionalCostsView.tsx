"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Tag,
  Modal,
  Form,
  notification,
  Row,
  Col,
  Select,
  Spin,
  Dropdown,
  MenuProps,
  Switch,
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
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

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
    forms.setFieldsValue({
      isPercentage: false,
      sortOrder: 0,
    });
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
          setOpenForm(false);
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
          notification.success({
            title: "Biaya tambahan berhasil diperbarui",
          });
          setOpenForm(false);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

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
            style={{
              color: record.isPercentage ? "#059669" : "#d97706",
            }}
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

  return (
    <div className="p-4 lg:p-8">
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

      <Modal
        width={700}
        open={openForm}
        onCancel={() => !saving && setOpenForm(false)}
        footer={null}
        centered
        destroyOnHidden
        title={
          <div className="flex items-center gap-4 p-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
              <DollarOutlined style={{ fontSize: 24 }} />
            </div>
            <div className="flex flex-col">
              <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                {formType === "create"
                  ? "Tambah"
                  : formType === "detail"
                    ? "Detail"
                    : "Update"}{" "}
                Biaya Tambahan
              </Typography>
              <p className="text-xs text-slate-400 font-medium m-0 mt-1">
                Kelola informasi biaya tambahan
              </p>
            </div>
          </div>
        }
        className="custom-modal"
      >
        <Spin spinning={saving || (loading && formType !== "create")}>
          <UseForm
            form={forms}
            initialValues={
              selectedCost || { isPercentage: false, sortOrder: 0 }
            }
          >
            <Row gutter={[24, 0]} className="mt-6">
              <Col span={24}>
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                  <Typography.Title
                    level={5}
                    className="!mb-4 text-slate-800 flex items-center gap-2"
                  >
                    <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                    Informasi Dasar
                  </Typography.Title>
                  <Row gutter={[16, 0]}>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="name"
                        label="Nama Biaya"
                        {...itemLayouts}
                        rules={[
                          { required: true, message: "Nama wajib diisi" },
                        ]}
                      >
                        <UseInput
                          placeholder="Contoh: Service Fee"
                          disabled={formType === "detail"}
                        />
                      </UseFormItem>
                    </Col>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="code"
                        label="Kode"
                        {...itemLayouts}
                        rules={[
                          { required: true, message: "Kode wajib diisi" },
                          {
                            pattern: /^[A-Z0-9_]+$/,
                            message:
                              "Kode harus huruf kapital, angka, dan underscore",
                          },
                        ]}
                      >
                        <UseInput
                          placeholder="SERVICE_FEE"
                          disabled={formType === "detail"}
                        />
                      </UseFormItem>
                    </Col>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="costType"
                        label="Tipe Biaya"
                        {...itemLayouts}
                        rules={[
                          {
                            required: true,
                            message: "Tipe biaya wajib dipilih",
                          },
                        ]}
                      >
                        <Select
                          className="w-full h-[46px] custom-select"
                          placeholder="Pilih Tipe Biaya"
                          disabled={formType === "detail"}
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
                      </UseFormItem>
                    </Col>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="sortOrder"
                        label="Urutan Tampil"
                        {...itemLayouts}
                      >
                        <UseInput
                          type="number"
                          placeholder="0"
                          disabled={formType === "detail"}
                        />
                      </UseFormItem>
                    </Col>
                    <Col span={24}>
                      <UseFormItem
                        name="description"
                        label="Deskripsi"
                        {...itemLayouts}
                      >
                        <UseInputArea
                          placeholder="Deskripsi biaya tambahan..."
                          disabled={formType === "detail"}
                          rows={2}
                        />
                      </UseFormItem>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col span={24}>
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                  <Typography.Title
                    level={5}
                    className="!mb-4 text-slate-800 flex items-center gap-2"
                  >
                    <div className="w-2 h-6 bg-blue-500 rounded-full" />
                    Konfigurasi Harga
                  </Typography.Title>
                  <Row gutter={[16, 0]}>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="isPercentage"
                        label="Tipe Harga"
                        {...itemLayouts}
                        valuePropName="checked"
                      >
                        <Switch
                          checkedChildren="Persentase"
                          unCheckedChildren="Nominal"
                          disabled={formType === "detail"}
                        />
                      </UseFormItem>
                    </Col>
                    <Col span={24} md={12}>
                      <UseFormItem
                        name="defaultPrice"
                        label="Nilai Default"
                        {...itemLayouts}
                        rules={[
                          {
                            required: true,
                            message: "Nilai default wajib diisi",
                          },
                        ]}
                      >
                        <UseInput
                          type="number"
                          placeholder="0"
                          disabled={formType === "detail"}
                        />
                      </UseFormItem>
                    </Col>
                  </Row>
                </div>
              </Col>
              {formType !== "create" && (
                <Col span={24}>
                  <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                    <Typography.Title
                      level={5}
                      className="!mb-4 text-slate-800 flex items-center gap-2"
                    >
                      <div className="w-2 h-6 bg-amber-500 rounded-full" />
                      Status
                    </Typography.Title>
                    <UseFormItem
                      name="isActive"
                      label="Status Aktif"
                      {...itemLayouts}
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Aktif"
                        unCheckedChildren="Nonaktif"
                        disabled={formType === "detail"}
                      />
                    </UseFormItem>
                  </div>
                </Col>
              )}
              <Col
                span={24}
                className="mt-12 flex justify-end gap-3 pt-8 border-t border-slate-100"
              >
                {formType !== "detail" ? (
                  <>
                    <Button
                      size="large"
                      className="rounded-xl px-8 border-none bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 h-12"
                      onClick={() => setOpenForm(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      className="rounded-xl px-10 bg-emerald-500 hover:bg-emerald-600 border-none font-bold text-white h-12 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                      onClick={handleSave}
                      loading={saving}
                    >
                      Simpan Biaya Tambahan
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    size="large"
                    className="rounded-xl px-10 bg-emerald-500 hover:bg-emerald-600 border-none font-bold text-white h-12 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    onClick={() => setFormType("update")}
                  >
                    Edit Data
                  </Button>
                )}
              </Col>
            </Row>
          </UseForm>
        </Spin>
      </Modal>

      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.name)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
          loading={loading}
        />
      )}

      <style jsx global>{`
        .custom-select .ant-select-selector,
        .custom-select-large .ant-select-selector {
          height: 46px !important;
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          background-color: #fafafa !important;
          display: flex !important;
          align-items: center !important;
        }
        .custom-select .ant-select-selection-item,
        .custom-select-large .ant-select-selection-item {
          line-height: 42px !important;
          font-weight: 500 !important;
        }
        .custom-modal .ant-modal-content {
          border-radius: 2.5rem !important;
          padding: 2rem !important;
        }
        .custom-modal .ant-modal-header {
          margin-bottom: 2rem !important;
        }
      `}</style>
    </div>
  );
}
