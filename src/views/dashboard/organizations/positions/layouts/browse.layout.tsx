"use client";

import { useStore } from "@afx/store/core";
import { 
    Table, 
    Tag, 
    Pagination, 
    Tooltip, 
    Input,
    Popconfirm
} from "antd";
import { 
    PlusOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined,
    UserOutlined,
    SolutionOutlined,
    CalendarOutlined,
    DollarCircleOutlined
} from "@ant-design/icons";
import { 
    IStatePosition, 
    IActionPosition 
} from "@afx/models/dashboard/master/positions.model";
import { IPropsPosition } from "@afx/interfaces/master/position.iface";
import dayjs from "dayjs";

export const BrowsePosition = ({
    page,
    pageSize,
    setPage,
    setPageSize,
    onSearch,
    searchText,
    setSearchText,
    setOpenFormCreate,
    handleToDetail,
    handleDelete
}: IPropsPosition) => {
    const {
        state: positionState,
    } = useStore<IStatePosition, IActionPosition>("positions");

    const positions = positionState?.positions || [];
    const pageInfo = positionState?.pageInfo || { total: 0 };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const columns = [
        {
            title: 'POSITION INFO',
            key: 'position',
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        border: '1px solid #e2e8f0'
                    }}>
                        {record.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{record.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            <Tag color="blue" style={{ margin: 0, fontSize: '10px', lineHeight: '14px', borderRadius: '4px' }}>{record.code}</Tag>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'BASE SALARY',
            dataIndex: 'baseSalary',
            key: 'baseSalary',
            render: (value: number) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#059669', fontWeight: 600 }}>
                    <DollarCircleOutlined />
                    {formatCurrency(value)}
                </div>
            )
        },
        {
            title: 'EMPLOYEE COUNT',
            dataIndex: 'employeeCount',
            key: 'employeeCount',
            align: 'center' as const,
            render: (count: number) => (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <UserOutlined style={{ color: '#94a3b8' }} />
                    <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
            )
        },
        {
            title: 'CREATED AT',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '13px' }}>
                    <CalendarOutlined style={{ fontSize: '12px' }} />
                    {dayjs(date).format("DD MMM YYYY")}
                </div>
            )
        },
        {
            title: 'ACTION',
            key: 'action',
            align: 'center' as const,
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <Tooltip title="Edit">
                        <button 
                            onClick={() => handleToDetail(record.id)}
                            style={{ 
                                width: 32, height: 32, borderRadius: 8, border: '1px solid #e2e8f0', 
                                background: 'white', cursor: 'pointer', color: '#3b82f6' 
                            }}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Delete">
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
        <div className="position-management-container" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Position Management</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Manage roles, responsibilities, and base salary configurations</p>
                </div>
                <button 
                    onClick={setOpenFormCreate}
                    style={{ 
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px',
                        fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10,
                        cursor: 'pointer', boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)'
                    }}
                >
                    <PlusOutlined /> <span>Add Position</span>
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16, 185, 129, 0.05)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <SolutionOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{pageInfo.total}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Total Positions</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Position List</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <SearchOutlined style={{ position: 'absolute', left: 14, color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Search name, code..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && onSearch(searchText)}
                                style={{ padding: '9px 16px 9px 40px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', width: 250 }}
                            />
                        </div>
                        <button 
                            onClick={() => onSearch(searchText)}
                            style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '9px 20px', borderRadius: 12, fontWeight: 600, cursor: 'pointer' }}
                        >
                            Search
                        </button>
                    </div>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={positions} 
                    pagination={false}
                    rowKey="id"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                        Showing <b>{positions.length > 0 ? ((page - 1) * pageSize) + 1 : 0}</b> to <b>{Math.min(page * pageSize, pageInfo.total)}</b> of <b>{pageInfo.total}</b> positions
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
                    border-bottom: 1px solid #f1f5f9 !important;
                }
                .ant-table-tbody > tr > td {
                    border-bottom: 1px solid #f8fafc !important;
                    padding: 16px 24px !important;
                }
                .ant-table-tbody > tr:hover > td {
                    background: #f8fafc !important;
                }
            `}</style>
        </div>
    );
};
