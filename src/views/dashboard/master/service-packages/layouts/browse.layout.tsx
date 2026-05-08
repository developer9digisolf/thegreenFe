"use client";

import { useStore } from "@afx/store/core";
import { 
    Table, 
    Tag, 
    Pagination, 
    Tooltip, 
    Input,
} from "antd";
import { 
    PlusOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined,
    TagOutlined,
    ShoppingOutlined,
    ClockCircleOutlined,
    DollarCircleOutlined
} from "@ant-design/icons";
import { 
    IStateServicePackage, 
    IActionServicePackage 
} from "@afx/models/dashboard/master/service-packages.model";
import { IPropsServicePackage } from "@afx/interfaces/service-package.iface";

export const BrowseServicePackage = ({
    page,
    pageSize,
    setPage,
    setPageSize,
    onSearch,
    searchText,
    setSearchText,
    setOpenFormCreate,
    handleToDetail,
    handleDelete,
    handleEdit
}: IPropsServicePackage) => {
    const {
        state: packageState,
        isLoading
    } = useStore<IStateServicePackage, IActionServicePackage>("servicePackages");

    const packages = packageState?.servicePackages || [];
    const pageInfo = packageState?.pageInfo || { total: 0 };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0
        }).format(amount);
    };

    const columns = [
        {
            title: 'PAKET VOUCHER',
            key: 'package',
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        backgroundColor: `${record.color || '#8b5cf6'}15`,
                        color: record.color || '#8b5cf6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 700,
                        border: `1px solid ${record.color || '#8b5cf6'}30`,
                    }}>
                        <i className={`fa-solid ${record.icon || 'fa-spa'}`} />
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{record.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Tag color="blue" style={{ margin: 0, fontSize: '10px', lineHeight: '14px', borderRadius: '4px' }}>{record.code}</Tag>
                            <span>• {record.category?.name || "No Category"}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'LAYANAN TERKAIT',
            key: 'service',
            render: (text: any, record: any) => (
                <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>{record.service?.name || "-"}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{record.quantity} Sesi</div>
                </div>
            )
        },
        {
            title: 'HARGA',
            key: 'price',
            render: (text: any, record: any) => (
                <div style={{ fontSize: '13px' }}>
                    <div style={{ fontWeight: 700, color: '#059669' }}>{formatCurrency(record.price)}</div>
                    {record.basicPrice > record.price && (
                        <div style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatCurrency(record.basicPrice)}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'MASA BERLAKU',
            key: 'validity',
            render: (text: any, record: any) => {
                const durationUnit = record.duration === 'day' ? 'Hari' : 
                                   record.duration === 'week' ? 'Minggu' : 
                                   record.duration === 'month' ? 'Bulan' : 
                                   record.duration === 'year' ? 'Tahun' : record.duration;
                return (
                    <Tag icon={<ClockCircleOutlined />} color="orange" style={{ borderRadius: '6px', fontWeight: 600 }}>
                        {record.durationExpired} {durationUnit}
                    </Tag>
                );
            }
        },
        {
            title: 'PENGGUNAAN',
            key: 'usage',
            align: 'center' as const,
            render: (text: any, record: any) => (
                <div style={{ fontSize: '13px', color: '#64748b' }}>
                    <b>{record.usedCount || 0}</b> Terpakai
                </div>
            )
        },
        {
            title: 'AKSI',
            key: 'action',
            align: 'center' as const,
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Tooltip title="Ubah">
                        <button 
                            onClick={() => handleEdit(record.id)}
                            style={{ 
                                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', 
                                background: 'white', cursor: 'pointer', color: '#3b82f6' 
                            }}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Hapus">
                        <button 
                            onClick={() => handleDelete(record.id, record.name)}
                            style={{ 
                                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', 
                                background: 'white', cursor: 'pointer', color: '#ef4444' 
                            }}
                        >
                            <DeleteOutlined />
                        </button>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="package-management-container" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Voucher Pack</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Kelola paket voucher layanan spa untuk pelanggan</p>
                </div>
                <button 
                    onClick={setOpenFormCreate}
                    style={{ 
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                        color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.2)'
                    }}
                >
                    <PlusOutlined /> <span>Tambah Paket</span>
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(139, 92, 246, 0.05)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <ShoppingOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{pageInfo.total}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Total Paket</div>
                </div>
                <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(5, 150, 105, 0.05)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <DollarCircleOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#1e293b' }}>Rp Aktif</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Harga Kompetitif</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Daftar Paket Voucher</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <SearchOutlined style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                            <Input 
                                placeholder="Cari nama, kode..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onPressEnter={onSearch}
                                style={{ padding: '9px 16px 9px 40px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', width: 250, height: 40 }}
                            />
                        </div>
                        <button 
                            onClick={onSearch}
                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '0 20px', borderRadius: 12, fontWeight: 600, cursor: 'pointer', height: 40 }}
                        >
                            Cari
                        </button>
                    </div>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={packages} 
                    pagination={false}
                    loading={isLoading("getServicePackages")}
                    rowKey="id"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                        Menampilkan <b>{packages.length > 0 ? ((Number(page) - 1) * Number(pageSize)) + 1 : 0}</b> sampai <b>{Math.min(Number(page) * Number(pageSize), Number(pageInfo?.total) || 0)}</b> dari <b>{Number(pageInfo?.total) || 0}</b> paket
                    </div>
                    <Pagination 
                        current={page}
                        pageSize={pageSize}
                        total={pageInfo.total}
                        onChange={(p, s) => {
                            setPage(p);
                            if (s) setPageSize(s);
                        }}
                        showSizeChanger={false}
                    />
                </div>
            </div>

            <style jsx global>{`
                .ant-table-thead > tr > th {
                    background: #f8fafc !important;
                    color: #94a3b8 !important;
                    font-size: 12px !important;
                    font-weight: 700 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.05em !important;
                }
            `}</style>
        </div>
    );
};
