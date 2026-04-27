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
  InputNumber,
  Space,
  Divider,
  Dropdown,
  MenuProps
} from "antd";
import { 
  MoreOutlined, 
  PlusOutlined, 
  UnorderedListOutlined,
  ClockCircleOutlined,
  TagOutlined,
  DeleteOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import { 
  ServiceGetAllService, 
  ServiceGetDetailService, 
  ServiceCreateService, 
  ServiceUpdateService, 
  ServiceDeleteService, 
  VariantAddService, 
  VariantUpdateService, 
  VariantDeleteService 
} from "@afx/services/service.service";
import { ServiceCategoryGetActiveService } from "@afx/services/service-category.service";
import { IServiceCategory } from "@afx/interfaces/service-category.iface";
import { IService, IServiceDetail, ICreateServiceRequest, IUpdateServiceRequest } from "@afx/interfaces/service.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

interface VariantFormData {
    id?: number;
    label: string;
    duration: number;
    price: number;
    sortOrder: number;
    isActive: boolean;
    isNew?: boolean;
    isDeleted?: boolean;
}

export default function MasterServices() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [services, setServices] = useState<IService[]>([]);
    const [categories, setCategories] = useState<IServiceCategory[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);

    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedService, setSelectedService] = useState<IServiceDetail | null>(null);
    const [variants, setVariants] = useState<VariantFormData[]>([]);
    const [forms] = Form.useForm();

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: ""
    });

    const fetchData = async (page = pagination.current, pageSize = pagination.pageSize, search = searchText, categoryId = filterCategory) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize };
            if (search) params.search = search;
            if (categoryId) params.categoryId = categoryId;
            
            const res = await ServiceGetAllService(params);
            if (res.success) {
                setServices(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch services", err);
            notification.error({ 
                message: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data layanan"
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await ServiceCategoryGetActiveService();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, [pagination.current, pagination.pageSize, searchText, filterCategory]);

    const handleSearch = () => {
        setSearchText(tempSearch);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleOpenCreate = () => {
        setFormType("create");
        setSelectedService(null);
        setVariants([{
            label: "",
            duration: 60,
            price: 0,
            sortOrder: 0,
            isActive: true,
            isNew: true
        }]);
        setOpenForm(true);
    };

    const handleOpenEdit = async (service: IService) => {
        setLoading(true);
        try {
            const res = await ServiceGetDetailService(service.id);
            if (res.success && res.data) {
                setFormType("update");
                setSelectedService(res.data);
                setVariants(res.data.variants.map(v => ({
                    id: v.id,
                    label: v.label || "",
                    duration: v.duration,
                    price: v.price,
                    sortOrder: v.sortOrder,
                    isActive: v.isActive,
                    isNew: false,
                    isDeleted: false
                })));
                setOpenForm(true);
            }
        } catch (error: any) {
            notification.error({ message: "Gagal mengambil detail layanan", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDetail = async (service: IService) => {
        setLoading(true);
        try {
            const res = await ServiceGetDetailService(service.id);
            if (res.success && res.data) {
                setFormType("detail");
                setSelectedService(res.data);
                setVariants(res.data.variants.map(v => ({
                    id: v.id,
                    label: v.label || "",
                    duration: v.duration,
                    price: v.price,
                    sortOrder: v.sortOrder,
                    isActive: v.isActive,
                    isNew: false,
                    isDeleted: false
                })));
                setOpenForm(true);
            }
        } catch (error: any) {
            notification.error({ message: "Gagal mengambil detail layanan", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleAddVariant = () => {
        const maxSort = variants.length > 0 ? Math.max(...variants.map(v => v.sortOrder)) : -1;
        setVariants([...variants, {
            label: "",
            duration: 60,
            price: 0,
            sortOrder: maxSort + 1,
            isActive: true,
            isNew: true
        }]);
    };

    const handleRemoveVariant = (index: number) => {
        const variant = variants[index];
        if (variant.id && !variant.isNew) {
            const updated = [...variants];
            updated[index] = { ...variant, isDeleted: true };
            setVariants(updated);
        } else {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    const handleVariantChange = (index: number, field: keyof VariantFormData, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            
            const activeVariants = variants.filter(v => !v.isDeleted);
            if (activeVariants.length === 0) {
                notification.warning({ message: "Validasi Gagal", description: "Minimal harus ada 1 variasi harga" });
                return;
            }

            setSaving(true);

            if (formType === "create") {
                const createPayload: ICreateServiceRequest = {
                    ...values,
                    variants: activeVariants.map(v => ({
                        label: v.label?.trim() || undefined,
                        duration: v.duration,
                        price: v.price,
                        sortOrder: v.sortOrder
                    }))
                };

                const res = await ServiceCreateService(createPayload);
                if (res.success) {
                    notification.success({ message: "Layanan berhasil ditambahkan" });
                    setOpenForm(false);
                    fetchData(1);
                } else {
                    notification.error({ message: "Gagal Menyimpan", description: res.message });
                }
            } else if (selectedService) {
                // Update Service
                const updatePayload: IUpdateServiceRequest = { ...values };
                await ServiceUpdateService(selectedService.id, updatePayload);

                // Handle variants
                for (const v of variants) {
                    if (v.isDeleted && v.id) {
                        await VariantDeleteService(v.id);
                    } else if (v.isNew && !v.isDeleted) {
                        await VariantAddService(selectedService.id, {
                            label: v.label?.trim() || undefined,
                            duration: v.duration,
                            price: v.price,
                            sortOrder: v.sortOrder
                        });
                    } else if (v.id && !v.isDeleted) {
                        await VariantUpdateService(v.id, {
                            label: v.label?.trim() || undefined,
                            duration: v.duration,
                            price: v.price,
                            sortOrder: v.sortOrder,
                            isActive: v.isActive
                        });
                    }
                }

                notification.success({ message: "Layanan berhasil diperbarui" });
                setOpenForm(false);
                fetchData();
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
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        try {
            const res = await ServiceDeleteService(deleteModal.id);
            if (res.success) {
                notification.success({ message: "Layanan berhasil dihapus" });
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData();
            } else {
                notification.error({ message: "Gagal Menghapus", description: res.message });
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menghapus",
                description: err?.message || "Terjadi kesalahan saat menghapus layanan"
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

    const formatPriceRange = (service: IService) => {
        if (!service.minPrice && !service.maxPrice) return "-";
        if (service.minPrice === service.maxPrice) {
            return formatCurrency(service.minPrice || 0);
        }
        return `${formatCurrency(service.minPrice || 0)} - ${formatCurrency(service.maxPrice || 0)}`;
    };

    const formatDurationRange = (service: IService) => {
        if (!service.minDuration && !service.maxDuration) return "-";
        if (service.minDuration === service.maxDuration) {
            return `${service.minDuration}m`;
        }
        return `${service.minDuration} - ${service.maxDuration}m`;
    };

    const columns: Column[] = [
        {
            key: "id",
            title: "ID",
            width: "70px",
            align: "center",
        },
        {
            key: "name",
            title: "Layanan",
            width: "300px",
            render: (_: any, record: IService) => {
                const cat = categories.find(c => c.id === record.categoryId);
                return (
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
                            style={{ backgroundColor: `${cat?.color || '#059669'}15`, color: cat?.color || '#059669' }}
                        >
                            <i className={record.icon || cat?.icon || "fa-solid fa-spa"} />
                        </div>
                        <div className="flex flex-col">
                            <div className="font-bold text-slate-700 truncate">{record.name}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{record.description || "Tidak ada deskripsi"}</div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: "categoryName",
            title: "Kategori",
            width: "150px",
            render: (v: string, record: IService) => {
                const cat = categories.find(c => c.id === record.categoryId);
                return (
                    <Tag 
                        icon={<TagOutlined />} 
                        style={{ backgroundColor: `${cat?.color || '#64748b'}10`, color: cat?.color || '#64748b', borderColor: `${cat?.color || '#64748b'}20` }}
                        className="rounded-full px-3 font-medium border"
                    >
                        {v || cat?.name || "-"}
                    </Tag>
                );
            }
        },
        {
            key: "duration",
            title: "Durasi",
            width: "140px",
            align: "center",
            render: (_: any, record: IService) => (
                <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium bg-slate-50 py-1 px-2 rounded-lg border border-slate-100">
                    <ClockCircleOutlined className="text-slate-400 text-xs" />
                    <span>{formatDurationRange(record)}</span>
                </div>
            )
        },
        {
            key: "price",
            title: "Harga",
            width: "220px",
            render: (_: any, record: IService) => (
                <div className="font-bold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-lg border border-emerald-100 inline-block">
                    {formatPriceRange(record)}
                </div>
            )
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
            )
        },
        {
            key: "actions",
            title: "Aksi",
            width: "100px",
            align: "center",
            render: (_: any, record: IService) => {
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
                        Master Layanan
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola menu layanan spa, durasi, dan variasi harga
                    </Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                    className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
                >
                    Tambah Layanan
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable
                    columns={columns}
                    data={services}
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
                    searchPlaceholder="Cari nama layanan..."
                    filters={
                        <div className="flex items-center gap-3">
                            <Typography.Text className="text-slate-400 font-medium whitespace-nowrap">Filter by:</Typography.Text>
                            <Select
                                placeholder="Semua Kategori"
                                style={{ width: 220 }}
                                className="custom-select-large"
                                allowClear
                                value={filterCategory}
                                onChange={(val) => {
                                    setFilterCategory(val);
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                            />
                        </div>
                    }
                />
            </div>

            {/* Modal Form */}
            <Modal
                width={850}
                open={openForm}
                onCancel={() => !saving && setOpenForm(false)}
                footer={null}
                centered
                destroyOnHidden
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
                            <UnorderedListOutlined style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : formType === "detail" ? "Detail" : "Update"} Layanan
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Kelola informasi layanan dan variasi harga</p>
                        </div>
                    </div>
                }
                className="custom-modal"
            >
                <Spin spinning={saving || (loading && formType !== "create")}>
                    <UseForm form={forms} initialValues={selectedService || { sortOrder: 0, isActive: true }}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24} md={16}>
                                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 mb-6">
                                    <Typography.Title level={5} className="!mb-4 text-slate-800 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-emerald-500 rounded-full" />
                                        Informasi Dasar
                                    </Typography.Title>
                                    <Row gutter={[16, 0]}>
                                        <Col span={24}>
                                            <UseFormItem name="name" label="Nama Layanan" {...itemLayouts} rules={[{ required: true, message: "Nama wajib diisi" }]}>
                                                <UseInput placeholder="Contoh: Balinese Massage" disabled={formType === "detail"} />
                                            </UseFormItem>
                                        </Col>
                                        <Col span={24} md={12}>
                                            <UseFormItem name="categoryId" label="Kategori" {...itemLayouts} rules={[{ required: true, message: "Kategori wajib dipilih" }]}>
                                                <Select 
                                                    className="w-full h-[46px] custom-select" 
                                                    placeholder="Pilih Kategori"
                                                    disabled={formType === "detail"}
                                                    options={categories.map(cat => ({ label: cat.name, value: cat.id }))}
                                                />
                                            </UseFormItem>
                                        </Col>
                                        <Col span={24} md={12}>
                                            <UseFormItem name="icon" label="Icon (FontAwesome)" {...itemLayouts}>
                                                <UseInput placeholder="fa-solid fa-spa" disabled={formType === "detail"} />
                                            </UseFormItem>
                                        </Col>
                                        <Col span={24}>
                                            <UseFormItem name="description" label="Deskripsi" {...itemLayouts}>
                                                <UseInputArea placeholder="Deskripsi singkat layanan..." disabled={formType === "detail"} rows={2} />
                                            </UseFormItem>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                            
                            <Col span={24} md={8}>
                                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 h-full">
                                    <Typography.Title level={5} className="!mb-4 text-slate-800 flex items-center gap-2">
                                        <div className="w-2 h-6 bg-blue-500 rounded-full" />
                                        Pengaturan
                                    </Typography.Title>
                                    <UseFormItem name="sortOrder" label="Urutan Tampil" {...itemLayouts}>
                                        <UseInput type="number" placeholder="0" disabled={formType === "detail"} />
                                    </UseFormItem>
                                    <UseFormItem name="isActive" label="Status Layanan" {...itemLayouts}>
                                        <Select 
                                            className="w-full h-[46px] custom-select" 
                                            disabled={formType === "detail"}
                                            options={[
                                                { label: "Aktif", value: true },
                                                { label: "Nonaktif", value: false }
                                            ]}
                                        />
                                    </UseFormItem>
                                </div>
                            </Col>

                            <Col span={24}>
                                <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-50 mt-4">
                                    <div className="flex items-center justify-between mb-6">
                                        <Typography.Title level={5} className="!m-0 text-slate-800 flex items-center gap-2">
                                            <div className="w-2 h-6 bg-amber-500 rounded-full" />
                                            Variasi Harga & Durasi
                                        </Typography.Title>
                                        {formType !== "detail" && (
                                            <Button 
                                                type="dashed" 
                                                icon={<PlusCircleOutlined />} 
                                                onClick={handleAddVariant}
                                                className="rounded-xl font-bold text-emerald-600 border-emerald-200 hover:text-emerald-700 hover:border-emerald-300"
                                            >
                                                Tambah Variasi
                                            </Button>
                                        )}
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full border-separate border-spacing-y-3">
                                            <thead>
                                                <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                                    <th className="px-4 text-left pb-2">Label</th>
                                                    <th className="px-4 text-left pb-2" style={{ width: '150px' }}>Durasi (menit)</th>
                                                    <th className="px-4 text-left pb-2" style={{ width: '220px' }}>Harga</th>
                                                    {formType !== "detail" && <th className="px-4 text-center pb-2" style={{ width: '80px' }}>Aksi</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {variants.filter(v => !v.isDeleted).map((variant, index) => {
                                                    const realIndex = variants.indexOf(variant);
                                                    return (
                                                        <tr key={index} className="bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                                            <td className="px-4 py-3 rounded-l-2xl">
                                                                <UseInput 
                                                                    placeholder="Contoh: Single, Couple, dll" 
                                                                    value={variant.label} 
                                                                    onChange={(e) => handleVariantChange(realIndex, 'label', e.target.value)}
                                                                    disabled={formType === "detail"}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <InputNumber 
                                                                    min={1} 
                                                                    value={variant.duration} 
                                                                    onChange={(val) => handleVariantChange(realIndex, 'duration', val || 60)}
                                                                    className="w-full h-[46px] rounded-xl flex items-center border-2 border-slate-100"
                                                                    disabled={formType === "detail"}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <InputNumber 
                                                                    min={0} 
                                                                    value={variant.price} 
                                                                    onChange={(val) => handleVariantChange(realIndex, 'price', val || 0)}
                                                                    className="w-full h-[46px] rounded-xl flex items-center border-2 border-slate-100 font-bold text-emerald-600"
                                                                    formatter={(value) => `Rp ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                                    parser={(value) => value?.replace(/Rp\s?|(\.*)/g, '') as any}
                                                                    disabled={formType === "detail"}
                                                                />
                                                            </td>
                                                            {formType !== "detail" && (
                                                                <td className="px-4 py-3 rounded-r-2xl text-center">
                                                                    <Button 
                                                                        danger 
                                                                        type="text" 
                                                                        icon={<DeleteOutlined />} 
                                                                        onClick={() => handleRemoveVariant(realIndex)}
                                                                        disabled={variants.filter(v => !v.isDeleted).length <= 1}
                                                                        className="hover:bg-red-50 rounded-xl"
                                                                    />
                                                                </td>
                                                            )}
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                                            <Typography.Text className="text-amber-700 font-bold">!</Typography.Text>
                                        </div>
                                        <div>
                                            <Typography.Text className="text-amber-800 font-bold block">Penting</Typography.Text>
                                            <Typography.Text className="text-amber-700 text-xs">
                                                Setiap layanan harus memiliki minimal satu variasi harga. Jika layanan hanya memiliki satu harga, biarkan label kosong atau isi dengan "Standard".
                                            </Typography.Text>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col span={24} className="mt-12 flex justify-end gap-3 pt-8 border-t border-slate-100">
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
                                            Simpan Layanan
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
