"use client";

import { useState, useEffect } from "react";
import { 
    Typography, 
    Card, 
    Row, 
    Col, 
    Switch, 
    Spin, 
    Badge, 
    Tooltip,
    Avatar,
    Divider,
    Space,
    Empty
} from "antd";
import { notification } from "@afx/utils/antd-global";
import { 
    CreditCardOutlined, 
    EyeOutlined, 
    EyeInvisibleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    InfoCircleOutlined,
    ShopOutlined
} from "@ant-design/icons";
import { 
    GetGroupedPaymentMethodsService, 
    UpdatePaymentMethodService 
} from "@afx/services/payment-method.service";
import { IPaymentMethodGroup, IPaymentMethod } from "@afx/interfaces/payment-method.iface";

export default function MasterPaymentMethods() {
    const [loading, setLoading] = useState(false);
    const [groups, setGroups] = useState<IPaymentMethodGroup[]>([]);
    const [updatingIds, setUpdatingIds] = useState<Record<number, boolean>>({});

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await GetGroupedPaymentMethodsService();
            if (res.success && res.data) {
                setGroups(res.data.groups);
            }
        } catch (err: any) {
            notification.error({
                title: "Gagal memuat data",
                description: err.message || "Terjadi kesalahan saat mengambil data metode pembayaran."
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdate = async (id: number, values: { isActive?: boolean; isVisibleInPOS?: boolean }) => {
        setUpdatingIds(prev => ({ ...prev, [id]: true }));
        try {
            const res = await UpdatePaymentMethodService(id, values);
            if (res.success) {
                notification.success({
                    title: "Berhasil diperbarui",
                    description: "Status metode pembayaran telah diperbarui."
                });
                // Update local state for immediate feedback
                setGroups(prevGroups => prevGroups.map(group => ({
                    ...group,
                    paymentMethods: group.paymentMethods.map(pm => {
                        if (pm.id === id) {
                            return {
                                ...pm,
                                isActive: values.isActive !== undefined ? values.isActive : pm.isActive,
                                isVisibleInPOS: values.isVisibleInPOS !== undefined ? values.isVisibleInPOS : pm.isVisibleInPOS
                            };
                        }
                        return pm;
                    })
                })));
            } else {
                notification.error({
                    title: "Gagal memperbarui",
                    description: res.message
                });
            }
        } catch (err: any) {
            notification.error({
                title: "Kesalahan sistem",
                description: err.message
            });
        } finally {
            setUpdatingIds(prev => ({ ...prev, [id]: false }));
        }
    };

    const renderPaymentMethod = (pm: IPaymentMethod) => (
        <Col xs={24} sm={12} lg={8} key={pm.id}>
            <Card 
                className={`h-full border-slate-100 transition-all hover:shadow-xl hover:-translate-y-1 rounded-[2rem] overflow-hidden ${!pm.isActive ? 'bg-slate-50' : 'bg-white'}`}
                styles={{ body: { padding: '1.5rem' } }}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl border border-slate-100 bg-white flex items-center justify-center overflow-hidden shadow-sm p-2 transition-all ${!pm.isActive ? 'grayscale opacity-40' : 'group-hover:scale-105'}`}>
                            <img 
                                src={pm.imageUrl || "https://placehold.co/100x100/f1f5f9/94a3b8?text=Payment"} 
                                alt={pm.name} 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://placehold.co/100x100/f1f5f9/94a3b8?text=Payment";
                                }}
                            />
                        </div>
                        <div>
                            <Typography.Title level={5} className="!m-0 text-slate-800 font-bold tracking-tight">
                                {pm.name}
                            </Typography.Title>
                            <Typography.Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/60">
                                {pm.code}
                            </Typography.Text>
                        </div>
                    </div>
                    <Badge 
                        status={pm.isActive ? "success" : "default"} 
                        text={pm.isActive ? "Aktif" : "Non-aktif"} 
                        className="text-[10px] font-bold"
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pm.isActive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                                {pm.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                            </div>
                            <div>
                                <Typography.Text className="block text-xs font-bold text-slate-700">Status Pembayaran</Typography.Text>
                                <Typography.Text className="text-[10px] text-slate-400">Aktifkan untuk menerima pembayaran</Typography.Text>
                            </div>
                        </div>
                        <Switch 
                            size="small"
                            checked={pm.isActive} 
                            loading={updatingIds[pm.id]}
                            onChange={(checked) => handleUpdate(pm.id, { isActive: checked })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 transition-colors hover:bg-slate-100">
                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${pm.isVisibleInPOS ? 'bg-blue-500/10 text-blue-600' : 'bg-slate-200 text-slate-400'}`}>
                                {pm.isVisibleInPOS ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                            </div>
                            <div>
                                <Typography.Text className="block text-xs font-bold text-slate-700">Tampil di POS</Typography.Text>
                                <Typography.Text className="text-[10px] text-slate-400">Muncul di menu kasir</Typography.Text>
                            </div>
                        </div>
                        <Switch 
                            size="small"
                            checked={pm.isVisibleInPOS} 
                            loading={updatingIds[pm.id]}
                            onChange={(checked) => handleUpdate(pm.id, { isVisibleInPOS: checked })}
                        />
                    </div>
                </div>

                {pm.requiresReference && (
                    <div className="mt-4 flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-100">
                        <InfoCircleOutlined className="text-amber-500 text-xs" />
                        <Typography.Text className="text-[10px] text-amber-600 font-medium italic">
                            Memerlukan nomor referensi/struk saat konfirmasi
                        </Typography.Text>
                    </div>
                )}
            </Card>
        </Col>
    );

    return (
        <div className="p-4 lg:p-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10">
                <div>
                    <Typography.Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">
                        Master Metode Pembayaran
                    </Typography.Title>
                    <Typography.Text className="text-slate-400 font-medium">
                        Kelola berbagai pilihan pembayaran untuk pelanggan dan integrasi POS
                    </Typography.Text>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <ShopOutlined className="text-xl" />
                    </div>
                   
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <Spin size="large" className="custom-spin-emerald" />
                    <Typography.Text className="mt-6 text-slate-400 font-medium animate-pulse">
                        Menyiapkan konfigurasi pembayaran...
                    </Typography.Text>
                </div>
            ) : groups.length === 0 ? (
                <Empty 
                    description="Belum ada metode pembayaran yang terdaftar" 
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="py-32 bg-white rounded-[3rem] border border-slate-100"
                />
            ) : (
                <div className="space-y-12">
                    {groups.map(group => (
                        <div key={group.id} className="relative">
                            <div className="flex items-center gap-4 mb-6 px-2">
                                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-800 font-bold text-lg">
                                    {group.sortOrder}
                                </div>
                                <div>
                                    <Typography.Title level={4} className="!m-0 text-slate-800 font-extrabold">
                                        {group.name}
                                    </Typography.Title>
                                    <Typography.Text className="text-slate-400 text-xs font-medium">
                                        {group.description || `Grup pembayaran ${group.name.toLowerCase()}`}
                                    </Typography.Text>
                                </div>
                                <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 to-transparent ml-4" />
                            </div>

                            <Row gutter={[24, 24]}>
                                {group.paymentMethods.map(pm => renderPaymentMethod(pm))}
                            </Row>
                        </div>
                    ))}
                </div>
            )}

            <style jsx global>{`
                .custom-spin-emerald .ant-spin-dot-item {
                    background-color: #10b981 !important;
                }
                .ant-switch-checked {
                    background-color: #10b981 !important;
                }
            `}</style>
        </div>
    );
}
