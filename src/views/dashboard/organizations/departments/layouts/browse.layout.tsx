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
    AppstoreOutlined,
    CalendarOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";
import { 
    IStateDepartment, 
    IActionDepartment 
} from "@afx/models/dashboard/master/departments.model";
import { IPropsDepartment } from "@afx/interfaces/master/department.iface";
import dayjs from "dayjs";

export const BrowseDepartment = ({
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
}: IPropsDepartment) => {
    const {
        state: departmentState,
    } = useStore<IStateDepartment, IActionDepartment>("departments");

    const departments = departmentState?.departments || [];
    const pageInfo = departmentState?.pageInfo || { total: 0 };

    const columns = [
        {
            title: 'DEPARTMENT INFO',
            key: 'department',
            render: (text: any, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ 
                        width: 44, 
                        height: 44, 
                        borderRadius: '12px', 
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 700,
                        border: '1px solid #fee2e2'
                    }}>
                        {record.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{record.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            <Tag color="volcano" style={{ margin: 0, fontSize: '10px', lineHeight: '14px', borderRadius: '4px' }}>{record.code}</Tag>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'DESCRIPTION',
            dataIndex: 'description',
            key: 'description',
            render: (desc: string) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: '13px' }}>
                    <InfoCircleOutlined style={{ fontSize: '12px', opacity: 0.7 }} />
                    <span style={{ 
                        maxWidth: '300px', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                    }}>
                        {desc || "No description provided"}
                    </span>
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
        <div className="department-management-container" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Department Management</h1>
                    <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Organize your business units and functional departments</p>
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
                    <PlusOutlined /> <span>Add Department</span>
                </button>
            </div>

            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
                <div style={{ background: 'white', padding: 24, borderRadius: 20, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                        <AppstoreOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{pageInfo.total}</div>
                    <div style={{ fontSize: 14, color: '#64748b' }}>Total Departments</div>
                </div>
            </div>

            <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 10px 40px rgba(0, 0, 0, 0.04)', border: '1px solid #edf2f7', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', margin: 0 }}>Department List</h3>
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
                    dataSource={departments} 
                    pagination={false}
                    rowKey="id"
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#64748b', fontSize: 13 }}>
                        Showing <b>{departments.length > 0 ? ((page - 1) * pageSize) + 1 : 0}</b> to <b>{Math.min(page * pageSize, pageInfo.total)}</b> of <b>{pageInfo.total}</b> departments
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
