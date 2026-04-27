"use client";

import { useState, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Divider, 
  Dropdown, 
  MenuProps, 
  Modal, 
  Form, 
  notification, 
  Row, 
  Col, 
  Select, 
  Spin,
  Tag
} from "antd";
import { 
  MoreOutlined, 
  PlusOutlined, 
  UnorderedListOutlined
} from "@ant-design/icons";
import { 
  ServiceCategoryGetAllService, 
  ServiceCategoryCreateService, 
  ServiceCategoryUpdateService, 
  ServiceCategoryDeleteService 
} from "@afx/services/service-category.service";
import { IServiceCategory } from "@afx/interfaces/service-category.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export default function MasterServiceCategories() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<IServiceCategory[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedCategory, setSelectedCategory] = useState<IServiceCategory | null>(null);
    const [forms] = Form.useForm();

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: ""
    });

    const fetchData = async (page = pagination.current, pageSize = pagination.pageSize, search = searchText) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize };
            if (search) params.search = search;
            
            const res = await ServiceCategoryGetAllService(params);
            if (res.success) {
                setCategories(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch categories", err);
            notification.error({ 
                message: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data kategori"
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
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleOpenCreate = () => {
        setFormType("create");
        setSelectedCategory(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (category: IServiceCategory) => {
        setFormType("update");
        setSelectedCategory(category);
        setOpenForm(true);
    };

    const handleOpenDetail = (category: IServiceCategory) => {
        setFormType("detail");
        setSelectedCategory(category);
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            setLoading(true);

            if (formType === "create") {
                const res = await ServiceCategoryCreateService(values);
                if (res.success) {
                    notification.success({ message: "Kategori berhasil dibuat" });
                    setOpenForm(false);
                    fetchData(1);
                } else {
                    notification.error({ message: res.message || "Gagal membuat kategori" });
                }
            } else if (selectedCategory) {
                const res = await ServiceCategoryUpdateService(selectedCategory.id, values);
                if (res.success) {
                    notification.success({ message: "Kategori berhasil diperbarui" });
                    setOpenForm(false);
                    fetchData();
                } else {
                    notification.error({ message: res.message || "Gagal memperbarui kategori" });
                }
            }
        } catch (err: any) {
            console.error(err);
            if (err?.errorFields) {
                notification.warning({
                    message: "Validasi Gagal",
                    description: err.errorFields[0].errors[0],
                });
            } else {
                notification.error({ 
                    message: "Gagal Menyimpan",
                    description: err?.message || "Terjadi kesalahan saat menyimpan data"
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        try {
            const res = await ServiceCategoryDeleteService(deleteModal.id);
            if (res.success) {
                notification.success({ message: "Kategori berhasil dihapus" });
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData();
            } else {
                notification.error({ message: res.message || "Gagal menghapus kategori" });
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menghapus",
                description: err?.message || "Terjadi kesalahan saat menghapus kategori"
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: Column[] = [
        {
            key: "id",
            title: "ID",
            width: "80px",
            align: "center",
        },
        {
            key: "name",
            title: "Kategori",
            width: "250px",
            render: (_: any, record: IServiceCategory) => (
                <div className="flex items-center gap-3">
                    <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                        style={{ backgroundColor: `${record.color}15`, color: record.color }}
                    >
                        <i className={record.icon || "fa-solid fa-spa"} />
                    </div>
                    <div className="font-bold text-slate-700 truncate">{record.name}</div>
                </div>
            )
        },
        {
            key: "description",
            title: "Deskripsi",
            width: "300px",
            render: (v: string) => <span className="text-slate-500">{v || "-"}</span>
        },
        {
            key: "color",
            title: "Warna",
            width: "120px",
            align: "center",
            render: (v: string) => v ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: v }} />
                    <span className="text-xs font-mono text-slate-400">{v}</span>
                </div>
            ) : "-"
        },
        {
            key: "sortOrder",
            title: "Urutan",
            width: "100px",
            align: "center",
        },
        {
            key: "serviceCount",
            title: "Layanan",
            width: "120px",
            align: "center",
            render: (v: number) => <Tag color="blue" className="rounded-full px-3">{v || 0} items</Tag>
        },
        {
            key: "isActive",
            title: "Status",
            width: "120px",
            align: "center",
            render: (v: boolean) => (
                <Tag color={v ? "green" : "red"} className="rounded-full px-3">
                    {v ? "Aktif" : "Nonaktif"}
                </Tag>
            )
        },
        {
            key: "actions",
            title: "Aksi",
            width: "100px",
            align: "center",
            render: (_: any, record: IServiceCategory) => {
                const items: MenuProps["items"] = [
                    { key: "detail", label: "Detail", onClick: () => handleOpenDetail(record) },
                    { key: "edit", label: "Edit", onClick: () => handleOpenEdit(record) },
                    { type: "divider" },
                    { 
                        key: "delete", 
                        label: "Hapus", 
                        danger: true, 
                        onClick: () => setDeleteModal({ open: true, id: record.id, name: record.name }) 
                    },
                ];
                return (
                    <div className="flex justify-center">
                        <Dropdown menu={{ items }} trigger={["click"]}>
                            <Button type="text" icon={<MoreOutlined />} />
                        </Dropdown>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <Typography.Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">
                        Master Kategori Layanan
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola kategori layanan untuk pengelompokan menu pada POS dan Dashboard
                    </Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                    className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
                >
                    Tambah Kategori
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable
                    columns={columns}
                    data={categories}
                    loading={loading}
                    pageInfo={{
                        currentPage: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total
                    }}
                    onPageChange={(p) => setPagination(prev => ({ ...prev, current: p }))}
                    onPageSizeChange={(s) => setPagination(prev => ({ ...prev, pageSize: s, current: 1 }))}
                    searchText={tempSearch}
                    setSearchText={setTempSearch}
                    onSearch={handleSearch}
                    searchPlaceholder="Cari nama kategori..."
                />
            </div>

            {/* Modal Form */}
            <Modal
                width={650}
                open={openForm}
                onCancel={() => !loading && setOpenForm(false)}
                footer={null}
                centered
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
                            <UnorderedListOutlined size={24} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : formType === "detail" ? "Detail" : "Update"} Kategori
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Kelola informasi kategori layanan Anda</p>
                        </div>
                    </div>
                }
                destroyOnHidden
                className="custom-modal"
            >
                <Spin spinning={loading}>
                    <UseForm form={forms} initialValues={selectedCategory || { color: "#8b5cf6", sortOrder: 0, isActive: true }}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24}>
                                <UseFormItem name="name" label="Nama Kategori" {...itemLayouts} rules={[{ required: true, message: "Nama wajib diisi" }]}>
                                    <UseInput placeholder="Contoh: Massage, Facial, dll" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="description" label="Deskripsi" {...itemLayouts}>
                                    <UseInputArea placeholder="Deskripsi singkat kategori..." disabled={formType === "detail"} rows={3} />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="icon" label="Icon (FontAwesome)" {...itemLayouts}>
                                    <UseInput placeholder="fa-solid fa-spa" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="color" label="Warna" {...itemLayouts}>
                                    <div className="flex gap-2">
                                        <div className="relative shrink-0">
                                            <input 
                                                type="color" 
                                                className="w-14 h-[46px] rounded-xl border-2 border-slate-100 p-1 cursor-pointer bg-white" 
                                                disabled={formType === "detail"}
                                                onChange={(e) => forms.setFieldValue("color", e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <UseFormItem name="color" noStyle>
                                                <UseInput placeholder="#000000" disabled={formType === "detail"} />
                                            </UseFormItem>
                                        </div>
                                    </div>
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="sortOrder" label="Urutan Tampil" {...itemLayouts}>
                                    <UseInput type="number" placeholder="0" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="isActive" label="Status Kategori" {...itemLayouts}>
                                    <Select 
                                        className="w-full h-[46px] custom-select" 
                                        disabled={formType === "detail"}
                                        options={[
                                            { label: "Aktif", value: true },
                                            { label: "Nonaktif", value: false }
                                        ]}
                                    />
                                </UseFormItem>
                            </Col>

                            <Col span={24} className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
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
                                        >
                                            Simpan Kategori
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

            {/* Modal Delete */}
            {deleteModal.open && (
                <ConfirmActionModal
                    config={ActionPresets.delete(deleteModal.name)}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
                    loading={loading}
                />
            )}

            <style jsx global>{`
                .custom-select .ant-select-selector {
                    height: 46px !important;
                    border-radius: 12px !important;
                    border: 2px solid #f1f5f9 !important;
                    background-color: #fafafa !important;
                    display: flex !important;
                    align-items: center !important;
                }
                .custom-select .ant-select-selection-item {
                    line-height: 42px !important;
                    font-weight: 500 !important;
                }
            `}</style>
        </div>
    );
}
