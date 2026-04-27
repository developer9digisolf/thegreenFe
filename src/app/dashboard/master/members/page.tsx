"use client";

import { useState, useEffect, useMemo } from "react";
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
  DatePicker,
  Divider,
  Dropdown,
  MenuProps
} from "antd";
import { 
  MoreOutlined, 
  PlusOutlined, 
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  SolutionOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { 
    GetMembersService, 
    CreateMemberService, 
    UpdateMemberService, 
    DeleteMemberService 
} from "@afx/services/member.service";
import { 
    IMember, 
    ICreateMemberRequest, 
    IUpdateMemberRequest,
    getMemberStatusName,
    getGenderName 
} from "@afx/interfaces/member.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export default function MasterMembers() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedMember, setSelectedMember] = useState<IMember | null>(null);
    
    const memberInitialValues = useMemo(() => {
        if (!selectedMember) return { isActive: true, status: "Active" };
        return {
            ...selectedMember,
            birthDate: selectedMember.birthDate ? dayjs(selectedMember.birthDate) : null
        };
    }, [selectedMember]);
    const [members, setMembers] = useState<IMember[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [forms] = Form.useForm();

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: ""
    });

    const fetchData = async (page = pagination.current, pageSize = pagination.pageSize, search = searchText, status = statusFilter) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize };
            if (search) params.search = search;
            if (status) params.status = status;
            
            const res = await GetMembersService(params);
            if (res.success) {
                setMembers(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch members", err);
            notification.error({ 
                message: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data member"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

    const handleSearch = () => {
        setSearchText(tempSearch);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    const handleOpenCreate = () => {
        setFormType("create");
        setSelectedMember(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (member: IMember) => {
        setFormType("update");
        setSelectedMember(member);
        setOpenForm(true);
    };

    const handleOpenDetail = (member: IMember) => {
        setFormType("detail");
        setSelectedMember(member);
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            setSaving(true);

            const payload = {
                ...values,
                birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : undefined
            };

            if (formType === "create") {
                const res = await CreateMemberService(payload as ICreateMemberRequest);
                if (res.success) {
                    notification.success({ message: "Member berhasil ditambahkan" });
                    setOpenForm(false);
                    fetchData(1);
                } else {
                    notification.error({ message: "Gagal Menyimpan", description: res.message });
                }
            } else if (selectedMember) {
                const res = await UpdateMemberService(selectedMember.id, payload as IUpdateMemberRequest);
                if (res.success) {
                    notification.success({ message: "Member berhasil diperbarui" });
                    setOpenForm(false);
                    fetchData();
                } else {
                    notification.error({ message: "Gagal Menyimpan", description: res.message });
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
            setSaving(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        setLoading(true);
        try {
            const res = await DeleteMemberService(deleteModal.id);
            if (res.success) {
                notification.success({ message: "Member berhasil dihapus" });
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData();
            } else {
                notification.error({ message: "Gagal Menghapus", description: res.message });
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menghapus",
                description: err?.message || "Terjadi kesalahan saat menghapus member"
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

    const getStatusTag = (status: number) => {
        const name = getMemberStatusName(status);
        switch (name.toLowerCase()) {
            case 'active': return <Tag color="green" className="rounded-full px-3">Active</Tag>;
            case 'pending': return <Tag color="orange" className="rounded-full px-3">Pending</Tag>;
            case 'inactive': return <Tag color="default" className="rounded-full px-3">Inactive</Tag>;
            case 'blocked': return <Tag color="red" className="rounded-full px-3">Blocked</Tag>;
            default: return <Tag className="rounded-full px-3">{name}</Tag>;
        }
    };

    const columns: Column[] = [
        {
            key: "code",
            title: "Kode",
            width: "120px",
            render: (v: string) => <code className="text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-lg">{v}</code>
        },
        {
            key: "name",
            title: "Member",
            width: "250px",
            render: (_: any, record: IMember) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 shrink-0">
                        <UserOutlined />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-bold text-slate-700">{record.name}</div>
                        <div className="text-[10px] text-slate-400">Bergabung: {record.joinDate}</div>
                    </div>
                </div>
            )
        },
        {
            key: "phone",
            title: "Kontak",
            width: "200px",
            render: (_: any, record: IMember) => (
                <div className="flex flex-col gap-0.5">
                    <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <PhoneOutlined className="text-slate-400" /> {record.phone}
                    </div>
                    {record.email && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                            <MailOutlined className="text-slate-300" /> {record.email}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: "gender",
            title: "Gender",
            width: "100px",
            align: "center",
            render: (v: number) => <span className="text-xs font-medium text-slate-600">{getGenderName(v)}</span>
        },
        {
            key: "creditBalance",
            title: "Saldo Credit",
            width: "150px",
            align: "right",
            render: (v: number) => (
                <div className={`font-bold ${v > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {formatCurrency(v)}
                </div>
            )
        },
        {
            key: "status",
            title: "Status",
            width: "100px",
            align: "center",
            render: (v: number) => getStatusTag(v)
        },
        {
            key: "actions",
            title: "Aksi",
            width: "100px",
            align: "center",
            render: (_: any, record: IMember) => {
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
                        Master Member
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola data pelanggan, saldo credit, dan riwayat member
                    </Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                    className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
                >
                    Tambah Member
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable
                    columns={columns}
                    data={members}
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
                    searchPlaceholder="Cari nama, telepon, atau kode member..."
                    filters={
                        <div className="flex items-center gap-3">
                            <Typography.Text className="text-slate-400 font-medium whitespace-nowrap">Filter by:</Typography.Text>
                            <Select
                                placeholder="Semua Status"
                                style={{ width: 180 }}
                                className="custom-select-large"
                                allowClear
                                value={statusFilter}
                                onChange={(val) => {
                                    setStatusFilter(val || "");
                                    setPagination(prev => ({ ...prev, current: 1 }));
                                }}
                                options={[
                                    { label: "Active", value: "Active" },
                                    { label: "Pending", value: "Pending" },
                                    { label: "Inactive", value: "Inactive" },
                                    { label: "Blocked", value: "Blocked" }
                                ]}
                            />
                        </div>
                    }
                />
            </div>

            {/* Modal Form */}
            <Modal
                width={750}
                open={openForm}
                onCancel={() => !saving && setOpenForm(false)}
                footer={null}
                centered
                destroyOnHidden
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 shadow-sm border border-blue-500/20">
                            <SolutionOutlined style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : formType === "detail" ? "Detail" : "Update"} Member
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Kelola informasi profil dan keanggotaan pelanggan</p>
                        </div>
                    </div>
                }
                className="custom-modal"
            >
                <Spin spinning={saving || (loading && formType !== "create")}>
                    <UseForm form={forms} initialValues={memberInitialValues}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24} md={12}>
                                <UseFormItem name="name" label="Nama Lengkap" {...itemLayouts} rules={[{ required: true, message: "Nama wajib diisi" }]}>
                                    <UseInput prefix={<UserOutlined className="text-slate-300" />} placeholder="Nama lengkap member" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="phone" label="Nomor Telepon / WA" {...itemLayouts} rules={[{ required: true, message: "Nomor HP wajib diisi" }]}>
                                    <UseInput prefix={<PhoneOutlined className="text-slate-300" />} placeholder="08xxxxxxxxxx" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="email" label="Email" {...itemLayouts}>
                                    <UseInput prefix={<MailOutlined className="text-slate-300" />} placeholder="email@example.com" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="gender" label="Gender" {...itemLayouts}>
                                    <Select 
                                        className="w-full h-[46px] custom-select" 
                                        disabled={formType === "detail"}
                                        options={[
                                            { label: "Laki-laki", value: 0 },
                                            { label: "Perempuan", value: 1 }
                                        ]}
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="birthDate" label="Tanggal Lahir" {...itemLayouts}>
                                    <DatePicker 
                                        className="w-full h-[46px] rounded-xl border-2 border-slate-100 bg-slate-50/50" 
                                        format="YYYY-MM-DD"
                                        disabled={formType === "detail"}
                                        suffixIcon={<CalendarOutlined className="text-slate-300" />}
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="status" label="Status Akun" {...itemLayouts}>
                                    <Select 
                                        className="w-full h-[46px] custom-select" 
                                        disabled={formType === "detail"}
                                        options={[
                                            { label: "Pending", value: 0 },
                                            { label: "Active", value: 1 },
                                            { label: "Inactive", value: 2 },
                                            { label: "Blocked", value: 3 }
                                        ]}
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="address" label="Alamat" {...itemLayouts}>
                                    <UseInputArea prefix={<EnvironmentOutlined className="text-slate-300" />} placeholder="Alamat lengkap member..." disabled={formType === "detail"} rows={2} />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="notes" label="Catatan Internal" {...itemLayouts}>
                                    <UseInputArea placeholder="Informasi tambahan tentang preferensi pelanggan..." disabled={formType === "detail"} rows={2} />
                                </UseFormItem>
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
                                            Simpan Member
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
