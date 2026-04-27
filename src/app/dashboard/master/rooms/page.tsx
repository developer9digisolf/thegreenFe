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
  Divider,
  Dropdown,
  MenuProps
} from "antd";
import { 
  MoreOutlined, 
  PlusOutlined, 
  HomeOutlined,
  TeamOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ToolOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import { 
    GetRoomsService, 
    CreateRoomService, 
    UpdateRoomService, 
    DeleteRoomService 
} from "@afx/services/room.service";
import { 
    IRoom, 
    ICreateRoomRequest, 
    IUpdateRoomRequest,
    getRoomStatusName 
} from "@afx/interfaces/room.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export default function MasterRooms() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
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
            
            const res = await GetRoomsService(params);
            if (res.success) {
                setRooms(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch rooms", err);
            notification.error({ 
                message: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data ruangan"
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
        setSelectedRoom(null);
        setOpenForm(true);
    };

    const handleOpenEdit = (room: IRoom) => {
        setFormType("update");
        setSelectedRoom(room);
        setOpenForm(true);
    };

    const handleOpenDetail = (room: IRoom) => {
        setFormType("detail");
        setSelectedRoom(room);
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            setSaving(true);

            if (formType === "create") {
                const res = await CreateRoomService(values as ICreateRoomRequest);
                if (res.success) {
                    notification.success({ message: "Ruangan berhasil ditambahkan" });
                    setOpenForm(false);
                    fetchData(1);
                } else {
                    notification.error({ message: "Gagal Menyimpan", description: res.message });
                }
            } else if (selectedRoom) {
                const res = await UpdateRoomService(selectedRoom.id, values as IUpdateRoomRequest);
                if (res.success) {
                    notification.success({ message: "Ruangan berhasil diperbarui" });
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
            const res = await DeleteRoomService(deleteModal.id);
            if (res.success) {
                notification.success({ message: "Ruangan berhasil dihapus" });
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData();
            } else {
                notification.error({ message: "Gagal Menghapus", description: res.message });
            }
        } catch (err: any) {
            console.error(err);
            notification.error({ 
                message: "Gagal Menghapus",
                description: err?.message || "Terjadi kesalahan saat menghapus ruangan"
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status: number) => {
        const name = getRoomStatusName(status);
        switch (name.toLowerCase()) {
            case 'available': 
                return <Tag icon={<CheckCircleOutlined />} color="green" className="rounded-full px-3">Available</Tag>;
            case 'occupied': 
                return <Tag icon={<ExclamationCircleOutlined />} color="orange" className="rounded-full px-3">Occupied</Tag>;
            case 'maintenance': 
                return <Tag icon={<ToolOutlined />} color="red" className="rounded-full px-3">Maintenance</Tag>;
            default: 
                return <Tag className="rounded-full px-3">{name}</Tag>;
        }
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
            title: "Ruangan",
            width: "250px",
            render: (_: any, record: IRoom) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                        <HomeOutlined />
                    </div>
                    <div className="flex flex-col">
                        <div className="font-bold text-slate-700">{record.name}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[200px]">{record.description || "Tidak ada deskripsi"}</div>
                    </div>
                </div>
            )
        },
        {
            key: "capacity",
            title: "Kapasitas",
            width: "120px",
            align: "center",
            render: (v: number) => (
                <div className="flex items-center justify-center gap-1.5 text-slate-600 font-bold bg-slate-50 py-1 px-3 rounded-lg border border-slate-100">
                    <TeamOutlined className="text-slate-400 text-xs" />
                    <span>{v} Org</span>
                </div>
            )
        },
        {
            key: "status",
            title: "Status Ruang",
            width: "150px",
            align: "center",
            render: (v: number) => getStatusTag(v)
        },
        {
            key: "isActive",
            title: "Aktif",
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
            render: (_: any, record: IRoom) => {
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
                        Master Ruangan
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola kapasitas dan status ketersediaan ruangan treatment
                    </Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    size="large" 
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreate}
                    className="h-12 px-8 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 bg-emerald-500 hover:bg-emerald-600 border-none transition-all active:scale-95"
                >
                    Tambah Ruangan
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable
                    columns={columns}
                    data={rooms}
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
                    searchPlaceholder="Cari nama ruangan..."
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
                                    { label: "Available", value: "Available" },
                                    { label: "Occupied", value: "Occupied" },
                                    { label: "Maintenance", value: "Maintenance" }
                                ]}
                            />
                        </div>
                    }
                />
            </div>

            {/* Modal Form */}
            <Modal
                width={550}
                open={openForm}
                onCancel={() => !saving && setOpenForm(false)}
                footer={null}
                centered
                destroyOnHidden
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-sm border border-amber-500/20">
                            <HomeOutlined style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : formType === "detail" ? "Detail" : "Update"} Ruangan
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Kelola informasi ruangan dan kapasitas treatment</p>
                        </div>
                    </div>
                }
                className="custom-modal"
            >
                <Spin spinning={saving || (loading && formType !== "create")}>
                    <UseForm form={forms} initialValues={selectedRoom || { status: 0, capacity: 1, isActive: true }}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24}>
                                <UseFormItem name="name" label="Nama Ruangan" {...itemLayouts} rules={[{ required: true, message: "Nama wajib diisi" }]}>
                                    <UseInput placeholder="Contoh: VIP Room 01, Treatment Room A" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="capacity" label="Kapasitas (Orang)" {...itemLayouts} rules={[{ required: true, message: "Kapasitas wajib diisi" }]}>
                                    <InputNumber 
                                        min={1} 
                                        max={20} 
                                        className="w-full h-[46px] rounded-xl flex items-center border-2 border-slate-100" 
                                        disabled={formType === "detail"} 
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="status" label="Status Ketersediaan" {...itemLayouts}>
                                    <Select 
                                        className="w-full h-[46px] custom-select" 
                                        disabled={formType === "detail"}
                                        options={[
                                            { label: "Available", value: 0 },
                                            { label: "Occupied", value: 1 },
                                            { label: "Maintenance", value: 2 }
                                        ]}
                                    />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="description" label="Deskripsi Ruangan" {...itemLayouts}>
                                    <UseInputArea placeholder="Informasi tambahan tentang fasilitas ruangan..." disabled={formType === "detail"} rows={3} />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="isActive" label="Status Aktif" {...itemLayouts}>
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
                                            loading={saving}
                                        >
                                            Simpan Ruangan
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
