"use client";

import { useState, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Tag, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Spin, 
  InputNumber,
  Dropdown,
  MenuProps,
  TimePicker
} from "antd";
import { notification } from "@afx/utils/antd-global";
import { 
  MoreOutlined, 
  PlusOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  CoffeeOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { 
    GetShiftsService, 
    CreateShiftService, 
    UpdateShiftService, 
    DeleteShiftService 
} from "@afx/services/master/shift.service";
import { 
    IResShift, 
    IReqFormShift 
} from "@afx/interfaces/master/shift.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import dayjs from "dayjs";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export default function ShiftsView() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [shifts, setShifts] = useState<IResShift[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [tempSearch, setTempSearch] = useState("");

    const [openForm, setOpenForm] = useState(false);
    const [formType, setFormType] = useState<"create" | "update" | "detail">("create");
    const [selectedShift, setSelectedShift] = useState<IResShift | null>(null);
    const [forms] = Form.useForm();

    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: ""
    });

    const fetchData = async (page = pagination.current, pageSize = pagination.pageSize, search = searchText) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize, sortColumn: "createdat", sortDirection: "desc" };
            if (search) params.search = search;
            
            const res = await GetShiftsService(params);
            if (res.success) {
                setShifts(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch shifts", err);
            notification.error({ 
                title: "Gagal Memuat Data",
                description: err?.message || "Terjadi kesalahan saat memuat data shift"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [searchText]);

    const handleOpenCreate = () => {
        setFormType("create");
        setSelectedShift(null);
        forms.resetFields();
        forms.setFieldsValue({ breakMinutes: 60 });
        setOpenForm(true);
    };

    const handleOpenEdit = (shift: IResShift) => {
        setFormType("update");
        setSelectedShift(shift);
        forms.resetFields();
        forms.setFieldsValue({
            ...shift,
            startTime: shift.startTime ? dayjs(shift.startTime, "HH:mm") : null,
            endTime: shift.endTime ? dayjs(shift.endTime, "HH:mm") : null,
            breakMinutes: shift.breakMinutes ?? 0,
        });
        setOpenForm(true);
    };

    const handleOpenDetail = (shift: IResShift) => {
        setFormType("detail");
        setSelectedShift(shift);
        forms.resetFields();
        forms.setFieldsValue({
            ...shift,
            startTime: shift.startTime ? dayjs(shift.startTime, "HH:mm") : null,
            endTime: shift.endTime ? dayjs(shift.endTime, "HH:mm") : null,
            breakMinutes: shift.breakMinutes ?? 0,
        });
        setOpenForm(true);
    };

    const handleSave = async () => {
        try {
            const values = await forms.validateFields();
            
            const payload = {
                ...values,
                startTime: values.startTime ? values.startTime.format("HH:mm") : "",
                endTime: values.endTime ? values.endTime.format("HH:mm") : "",
            };

            setSaving(true);
            if (formType === "create") {
                const res = await CreateShiftService(payload as IReqFormShift);
                if (res.success) {
                    notification.success({ title: "Shift berhasil dibuat" });
                    setOpenForm(false);
                    fetchData();
                } else {
                    notification.error({ title: "Gagal Menyimpan", description: res.message });
                }
            } else if (selectedShift) {
                const res = await UpdateShiftService(selectedShift.id, payload as IReqFormShift);
                if (res.success) {
                    notification.success({ title: "Shift berhasil diperbarui" });
                    setOpenForm(false);
                    fetchData();
                } else {
                    notification.error({ title: "Gagal Menyimpan", description: res.message });
                }
            }
        } catch (err: any) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.id) return;
        setSaving(true);
        try {
            const res = await DeleteShiftService(deleteModal.id);
            if (res.success) {
                notification.success({ title: "Shift berhasil dihapus" });
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData();
            } else {
                notification.error({ title: "Gagal Menghapus", description: res.message });
            }
        } catch (err: any) {
            notification.error({ title: "Gagal Menghapus", description: err.message });
        } finally {
            setSaving(false);
        }
    };

    const columns: Column[] = [
        {
            title: "Shift",
            key: "name",
            render: (_, record: IResShift) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-500/20">
                        <ClockCircleOutlined style={{ fontSize: 22 }} />
                    </div>
                    <div className="flex flex-col">
                        <Typography.Text className="font-bold text-slate-700">{record.name}</Typography.Text>
                        <Tag className="w-fit text-[10px] font-bold border-none bg-indigo-50 text-indigo-500 rounded-md">
                            {record.code}
                        </Tag>
                    </div>
                </div>
            )
        },
        {
            title: "Jam Kerja",
            key: "startTime",
            render: (_, record: IResShift) => (
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                        <Typography.Text className="text-xs font-bold text-emerald-600">{record.startTime}</Typography.Text>
                    </div>
                    <Typography.Text className="text-slate-300 font-bold"> - </Typography.Text>
                    <div className="px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-100">
                        <Typography.Text className="text-xs font-bold text-rose-600">{record.endTime}</Typography.Text>
                    </div>
                </div>
            )
        },
        {
            title: "Istirahat",
            key: "breakMinutes",
            render: (val: number) => (
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <CoffeeOutlined className="text-amber-500" />
                    <span>{val} Menit</span>
                </div>
            )
        },
        {
            title: "Karyawan",
            key: "employeeCount",
            render: (val: number) => (
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <UsergroupAddOutlined className="text-blue-500" />
                    <span>{val} Orang</span>
                </div>
            )
        },
        {
            title: "Aksi",
            key: "action",
            align: "center",
            width: 80,
            render: (_, record) => {
                const menuItems: MenuProps['items'] = [
                    { key: 'detail', label: 'Lihat Detail', icon: <EyeOutlined />, onClick: () => handleOpenDetail(record) },
                    { key: 'edit', label: 'Edit Shift', icon: <EditOutlined />, onClick: () => handleOpenEdit(record) },
                    { type: 'divider' },
                    { key: 'delete', label: 'Hapus Shift', icon: <DeleteOutlined />, danger: true, onClick: () => setDeleteModal({ open: true, id: record.id, name: record.name }) }
                ];
                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                        <Button type="text" icon={<MoreOutlined />} className="hover:bg-slate-100 rounded-lg" />
                    </Dropdown>
                );
            }
        }
    ];

    return (
        <div className="p-4 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <Typography.Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">
                        Master Shift Kerja
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola jam operasional dan pembagian waktu kerja karyawan
                    </Typography.Text>
                </div>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    size="large" 
                    className="bg-emerald-500 hover:bg-emerald-600 border-none rounded-xl h-12 px-6 font-bold shadow-lg shadow-emerald-500/20"
                    onClick={handleOpenCreate}
                >
                    Tambah Shift Baru
                </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
                <UseDynamicTable
                    columns={columns}
                    data={shifts}
                    loading={loading}
                    pageInfo={{
                        currentPage: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total
                    }}
                    onPageChange={(page) => fetchData(page, pagination.pageSize)}
                    onPageSizeChange={(pageSize) => fetchData(1, pageSize)}
                    onSearch={(val) => {
                        setTempSearch(val);
                        setSearchText(val);
                        setPagination(prev => ({ ...prev, current: 1 }));
                    }}
                    searchText={tempSearch}
                    setSearchText={setTempSearch}
                    searchPlaceholder="Cari nama atau kode shift..."
                />
            </div>

            <Modal
                open={openForm}
                onCancel={() => !saving && setOpenForm(false)}
                footer={null}
                width={600}
                centered
                title={
                    <div className="flex items-center gap-4 p-2">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-500/20">
                            <CalendarOutlined style={{ fontSize: 24 }} />
                        </div>
                        <div className="flex flex-col">
                            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
                                {formType === "create" ? "Tambah" : formType === "detail" ? "Detail" : "Update"} Shift
                            </Typography>
                            <p className="text-xs text-slate-400 font-medium m-0 mt-1">Konfigurasi jam mulai dan berakhir operasional</p>
                        </div>
                    </div>
                }
                className="custom-modal"
            >
                <Spin spinning={saving}>
                    <UseForm form={forms}>
                        <Row gutter={[24, 0]} className="mt-6">
                            <Col span={24} md={12}>
                                <UseFormItem name="code" label="Kode Shift" {...itemLayouts} rules={[{ required: true, message: "Kode wajib diisi" }]}>
                                    <UseInput placeholder="Contoh: MORNING, SHIFT01" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="name" label="Nama Shift" {...itemLayouts} rules={[{ required: true, message: "Nama wajib diisi" }]}>
                                    <UseInput placeholder="Contoh: Pagi, Siang, Malam" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="startTime" label="Jam Mulai" {...itemLayouts} rules={[{ required: true, message: "Waktu mulai wajib diisi" }]}>
                                    <TimePicker format="HH:mm" className="w-full h-[46px] rounded-xl border-2 border-slate-100" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24} md={12}>
                                <UseFormItem name="endTime" label="Jam Berakhir" {...itemLayouts} rules={[{ required: true, message: "Waktu berakhir wajib diisi" }]}>
                                    <TimePicker format="HH:mm" className="w-full h-[46px] rounded-xl border-2 border-slate-100" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="breakMinutes" label="Durasi Istirahat (Menit)" {...itemLayouts} rules={[{ required: true, message: "Durasi istirahat wajib diisi" }]}>
                                    <InputNumber min={0} className="w-full h-[46px] rounded-xl flex items-center border-2 border-slate-100" disabled={formType === "detail"} />
                                </UseFormItem>
                            </Col>
                            <Col span={24}>
                                <UseFormItem name="description" label="Keterangan" {...itemLayouts}>
                                    <UseInputArea placeholder="Informasi tambahan tentang shift ini..." disabled={formType === "detail"} rows={3} />
                                </UseFormItem>
                            </Col>

                            <Col span={24} className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-100">
                                {formType !== "detail" ? (
                                    <>
                                        <Button size="large" className="rounded-xl px-8 border-none bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 h-12" onClick={() => setOpenForm(false)}>Batal</Button>
                                        <Button type="primary" size="large" className="rounded-xl px-12 bg-emerald-500 hover:bg-emerald-600 border-none font-bold h-12 shadow-lg shadow-emerald-500/20" onClick={handleSave} loading={saving}>Simpan Shift</Button>
                                    </>
                                ) : (
                                    <Button size="large" className="rounded-xl px-8 bg-indigo-500 hover:bg-indigo-600 text-white border-none font-bold h-12 shadow-lg shadow-indigo-500/20" onClick={() => setOpenForm(false)}>Tutup</Button>
                                )}
                            </Col>
                        </Row>
                    </UseForm>
                </Spin>
            </Modal>

            {deleteModal.open && (
                <ConfirmActionModal
                    config={ActionPresets.delete(deleteModal.name)}
                    onConfirm={handleDelete}
                    onClose={() => !saving && setDeleteModal({ open: false, id: null, name: "" })}
                    loading={saving}
                />
            )}
        </div>
    );
}
