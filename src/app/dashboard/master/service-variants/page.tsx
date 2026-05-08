"use client";

import { useState, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Dropdown, 
  MenuProps, 
  Modal, 
  Form, 
  notification, 
  Row, 
  Col, 
  Select, 
  Spin, 
  Tag, 
  Input,
  InputNumber, 
  Switch, 
  Card
} from "antd";
import { 
  MoreOutlined, 
  PlusOutlined, 
  TagsOutlined,
  ReloadOutlined
} from "@ant-design/icons";
import { 
  BranchServiceVariantGetAllService,
  BranchServiceVariantCreateService,
  BranchServiceVariantUpdateService,
  BranchServiceVariantDeleteService
} from "@afx/services/master/branch-service-variants.service";
import { 
  ServiceGetAllService,
  VariantGetAllActiveService
} from "@afx/services/service.service";
import { IBranchServiceVariant } from "@afx/interfaces/service.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { useAuth } from "@afx/contexts/AuthContext";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export default function ServiceVariantsPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<IBranchServiceVariant[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    
    // Filters
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Dropdown Data
    const [services, setServices] = useState<any[]>([]);
    const [variants, setVariants] = useState<any[]>([]);
    const [branches, setBranches] = useState<any[]>([]);

    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedItem, setSelectedItem] = useState<IBranchServiceVariant | null>(null);
    const [forms] = Form.useForm();

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; label: string }>({
        open: false,
        id: null,
        label: ""
    });

    // Initialize data
    useEffect(() => {
        if (user) {
            const userBranches = (user as any).branches || [];
            setBranches(userBranches.map((b: any) => ({ label: b.branchName, value: b.branchId })));
            if (userBranches.length > 0 && !selectedBranchId) {
                setSelectedBranchId(userBranches[0].branchId);
            }
        }
        
        const fetchMaster = async () => {
            try {
                const [resServices, resVariants] = await Promise.all([
                    ServiceGetAllService({ Page: 1, PageSize: 100 }),
                    VariantGetAllActiveService()
                ]);
                
                if (resServices.success) setServices(resServices.data);
                if (resVariants.success) setVariants(resVariants.data);
            } catch (err) {
                console.error("Failed to fetch master data", err);
            }
        };
        fetchMaster();
    }, [user]);

    const fetchData = async (page = pagination.current, pageSize = pagination.pageSize, search = searchQuery) => {
        if (!selectedBranchId) return;
        
        setLoading(true);
        try {
            const params: any = { 
                Page: page, 
                PageSize: pageSize,
                SortColumn: "createdat",
                SortDirection: "desc",
                BranchId: selectedBranchId,
                Search: search
            };
            if (selectedServiceId) params.ServiceId = selectedServiceId;
            
            const res = await BranchServiceVariantGetAllService(params);
            if (res.success) {
                setData(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch data", err);
            notification.error({ 
                message: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data varian layanan"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, selectedBranchId, selectedServiceId]);

    const handleOpenCreate = () => {
        setFormType("create");
        setSelectedItem(null);
        forms.resetFields();
        forms.setFieldsValue({ 
            branchId: selectedBranchId,
            isActive: true,
            sortOrder: 1
        });
        setOpenForm(true);
    };

    const handleOpenEdit = (item: IBranchServiceVariant) => {
        setFormType("update");
        setSelectedItem(item);
        
        // Find the serviceId from the variants list
        const variant = variants.find(v => v.id === item.serviceVariantId);
        
        forms.setFieldsValue({
            branchId: item.branchId,
            serviceId: variant?.serviceId,
            serviceVariantId: item.serviceVariantId,
            price: item.price,
            isActive: item.isActive,
            sortOrder: item.sortOrder,
            notes: item.notes
        });
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            setLoading(true);

            // serviceId is only for UI filtering, remove it before sending to API
            const { serviceId, ...payload } = values;

            if (formType === "create") {
                const res = await BranchServiceVariantCreateService(payload);
                if (res.success) {
                    notification.success({ message: "Varian berhasil ditambahkan ke cabang" });
                    setOpenForm(false);
                    fetchData(1);
                }
            } else if (selectedItem) {
                const res = await BranchServiceVariantUpdateService(selectedItem.id, payload);
                if (res.success) {
                    notification.success({ message: "Varian berhasil diperbarui" });
                    setOpenForm(false);
                    fetchData();
                }
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menyimpan",
                description: err?.message || "Terjadi kesalahan saat menyimpan data"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        try {
            const res = await BranchServiceVariantDeleteService(deleteModal.id);
            if (res.success) {
                notification.success({ message: "Varian berhasil dihapus dari cabang" });
                setDeleteModal({ open: false, id: null, label: "" });
                fetchData();
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menghapus",
                description: err?.message || "Terjadi kesalahan saat menghapus varian"
            });
        } finally {
            setLoading(false);
        }
    };

    const columns: Column[] = [
        {
            key: "serviceName",
            title: "Layanan",
            width: "250px",
            render: (_: any, record: IBranchServiceVariant) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <i className={record.icon || "fa-solid fa-spa"} />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-slate-700">{record.serviceName}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{record.serviceVariantLabel}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "serviceVariantDuration", 
            title: "Durasi", 
            width: "120px", 
            align: "center",
            render: (v: number) => <Tag color="orange" className="rounded-full px-3">{v} Menit</Tag>
        },
        { 
            key: "price", 
            title: "Harga Cabang", 
            width: "180px", 
            align: "right",
            render: (v: number) => <span className="font-bold text-emerald-600">Rp {v?.toLocaleString('id-ID')}</span>
        },
        { 
            key: "serviceVariantDefaultPrice", 
            title: "Harga Default", 
            width: "180px", 
            align: "right",
            render: (v: number) => <span className="text-slate-400 line-through text-xs">Rp {v?.toLocaleString('id-ID')}</span>
        },
        { 
            key: "isActive", 
            title: "Status", 
            width: "100px", 
            align: "center", 
            render: (v: boolean) => <Tag color={v ? "green" : "red"} className="rounded-full px-3">{v ? "Aktif" : "Nonaktif"}</Tag> 
        },
        {
            key: "actions",
            title: "Aksi",
            width: "100px",
            align: "center",
            render: (_: any, record: IBranchServiceVariant) => {
                const items: MenuProps["items"] = [
                    { key: "edit", label: "Edit", onClick: () => handleOpenEdit(record) },
                    { type: "divider" },
                    { key: "delete", label: "Hapus", danger: true, onClick: () => setDeleteModal({ open: true, id: record.id, label: `${record.serviceName} - ${record.serviceVariantLabel}` }) },
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
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                <div>
                    <Typography.Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">Varian Layanan per Cabang</Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">Kelola durasi dan harga khusus layanan untuk setiap cabang</Typography.Text>
                </div>
                <div className="flex items-center gap-3">
                     <Button 
                        type="primary" 
                        size="large" 
                        icon={<PlusOutlined />}
                        onClick={handleOpenCreate}
                        className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
                    >
                        Tambah Varian Cabang
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-3xl border-none shadow-sm mb-6 bg-white/60 backdrop-blur-md">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={8}>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Cabang</span>
                            <Select 
                                className="w-full h-12 custom-select" 
                                value={selectedBranchId}
                                onChange={setSelectedBranchId}
                                options={branches}
                                placeholder="Pilih Cabang"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Layanan</span>
                            <Select 
                                className="w-full h-12 custom-select" 
                                value={selectedServiceId}
                                onChange={setSelectedServiceId}
                                options={services.map(s => ({ label: s.name, value: s.id }))}
                                placeholder="Semua Layanan"
                                allowClear
                                showSearch
                                optionFilterProp="label"
                            />
                        </div>
                    </Col>
                    <Col xs={24} md={8}>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-transparent uppercase tracking-widest ml-1 select-none">RESET</span>
                            <Button 
                                icon={<ReloadOutlined />} 
                                onClick={() => {
                                    setSelectedServiceId(null);
                                    setSearchQuery("");
                                    fetchData(1, pagination.pageSize, "");
                                }}
                                className="h-12 rounded-xl px-6 bg-slate-100 border-none font-bold text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center gap-2 w-fit"
                            >
                                Reset Filter
                            </Button>
                        </div>
                    </Col>
                </Row>
            </Card>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable 
                    columns={columns} 
                    data={data} 
                    loading={loading} 
                    pageInfo={{ currentPage: pagination.current, pageSize: pagination.pageSize, total: pagination.total }} 
                    onPageChange={(p) => setPagination(prev => ({ ...prev, current: p }))} 
                    onPageSizeChange={(s) => setPagination(prev => ({ ...prev, pageSize: s, current: 1 }))}
                    searchPlaceholder="Cari varian..." 
                    searchable={true}
                    onSearch={(val) => {
                        setSearchQuery(val);
                        fetchData(1, pagination.pageSize, val);
                    }}
                />
            </div>

            <Modal 
                width={650} 
                open={openForm} 
                onCancel={() => !loading && setOpenForm(false)} 
                footer={null} 
                centered 
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
                            <TagsOutlined size={24} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : "Update"} Varian Cabang
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Konfigurasi harga dan status varian di cabang</p>
                        </div>
                    </div>
                } 
                destroyOnHidden 
                className="custom-modal"
            >
                <Spin spinning={loading}>
                    <UseForm form={forms} initialValues={{ isActive: true, sortOrder: 1 }}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24}>
                                <UseFormItem name="branchId" label="Cabang" {...itemLayouts} rules={[{ required: true }]}>
                                    <Select className="w-full h-12 custom-select" options={branches} placeholder="Pilih cabang..." />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="serviceId" label="Layanan" {...itemLayouts} rules={[{ required: true }]}>
                                    <Select 
                                        className="w-full h-12 custom-select" 
                                        options={services.map(s => ({ label: s.name, value: s.id }))}
                                        placeholder="Pilih layanan..."
                                        showSearch
                                        optionFilterProp="label"
                                        onChange={() => forms.setFieldValue("serviceVariantId", undefined)}
                                    />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) => prevValues.serviceId !== currentValues.serviceId}>
                                    {({ getFieldValue }) => {
                                        const serviceId = getFieldValue("serviceId");
                                        const filteredVariants = variants.filter(v => v.serviceId === serviceId);
                                        return (
                                            <UseFormItem name="serviceVariantId" label="Varian Layanan" {...itemLayouts} rules={[{ required: true }]}>
                                                <Select 
                                                    className="w-full h-12 custom-select" 
                                                    options={filteredVariants.map(v => ({ 
                                                        label: `${v.label} (${v.duration} min) - Default: Rp ${v.price?.toLocaleString()}`, 
                                                        value: v.id 
                                                    }))}
                                                    placeholder={serviceId ? "Pilih varian..." : "Pilih layanan dulu"}
                                                    disabled={!serviceId}
                                                    onChange={(val) => {
                                                        const selectedVar = variants.find(v => v.id === val);
                                                        if (selectedVar) {
                                                            forms.setFieldValue("price", selectedVar.price);
                                                        }
                                                    }}
                                                />
                                            </UseFormItem>
                                        );
                                    }}
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="price" label="Harga Cabang (Rp)" {...itemLayouts} rules={[{ required: true }]}>
                                    <InputNumber 
                                        className="w-full h-12 rounded-xl border-2 border-slate-100 flex items-center bg-slate-50 font-bold" 
                                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                        parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                                        placeholder="150,000"
                                    />
                                </UseFormItem>
                            </Col>
                            <Col xs={24} md={12}>
                                <UseFormItem name="sortOrder" label="Urutan" {...itemLayouts}>
                                    <InputNumber className="w-full h-12 rounded-xl border-2 border-slate-100 flex items-center bg-slate-50" />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="notes" label="Catatan Internal" {...itemLayouts}>
                                    <Input.TextArea 
                                        placeholder="Tambahkan catatan jika ada (opsional)..." 
                                        rows={3} 
                                        className="rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-700 p-4 hover:border-emerald-500 focus:border-emerald-500 transition-all"
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 mt-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">Status Aktif</span>
                                        <span className="text-xs text-slate-400">Aktifkan untuk menampilkan varian ini di POS cabang</span>
                                    </div>
                                    <UseFormItem name="isActive" valuePropName="checked" noStyle>
                                        <Switch className="bg-slate-200" />
                                    </UseFormItem>
                                </div>
                            </Col>
                            
                            <Col span={24} className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <Button size="large" className="rounded-xl px-8 border-none bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 h-12" onClick={() => setOpenForm(false)}>Batal</Button>
                                <Button type="primary" size="large" className="rounded-xl px-10 bg-emerald-500 hover:bg-emerald-600 border-none font-bold text-white h-12 shadow-lg shadow-emerald-500/20 transition-all active:scale-95" onClick={handleSave}>Simpan Perubahan</Button>
                            </Col>
                        </Row>
                    </UseForm>
                </Spin>
            </Modal>

            {deleteModal.open && (
                <ConfirmActionModal
                    config={ActionPresets.delete(deleteModal.label)}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setDeleteModal({ open: false, id: null, label: "" })}
                    loading={loading}
                />
            )}

            <style jsx global>{`
                .custom-select .ant-select-selector { height: 48px !important; border-radius: 12px !important; border: 2px solid #f1f5f9 !important; background-color: #fafafa !important; display: flex !important; align-items: center !important; }
                .custom-select .ant-select-selection-item { line-height: 44px !important; font-weight: 500 !important; }
                .custom-modal .ant-modal-content { border-radius: 2.5rem !important; padding: 2rem !important; }
                .custom-modal .ant-modal-header { margin-bottom: 2rem !important; }
                .ant-input-number-input { height: 44px !important; }
            `}</style>
        </div>
    );
}
