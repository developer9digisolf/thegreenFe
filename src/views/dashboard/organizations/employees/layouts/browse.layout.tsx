"use client";

import { useStore } from "@afx/store/core";
import { 
    Table, 
    Tag, 
    Pagination, 
    Tooltip
} from "antd";
import { useRouter } from "next/navigation";
import { 
    PlusOutlined, 
    SearchOutlined, 
    EditOutlined, 
    DeleteOutlined,
    UserOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    TeamOutlined
} from "@ant-design/icons";
import { 
    IStateEmployee, 
    IActionEmployee 
} from "@afx/models/dashboard/master/employees.model";
import { IPropsEmployee } from "@afx/interfaces/master/employee.iface";

// ─── Helpers ─────────────────────────────────────────────────────────────────
// BE mengembalikan employmentStatus sebagai string: "active" | "onleave" | "terminated"
const STATUS_MAP: Record<string, { color: string; label: string }> = {
    active:     { color: "success", label: "Aktif"      },
    onleave:    { color: "warning", label: "Cuti"        },
    terminated: { color: "error",   label: "Terminated"  },
};

function getStatusTag(status: string) {
    const key = (status || "").toLowerCase();
    const s   = STATUS_MAP[key] ?? { color: "default", label: status || "Unknown" };
    return (
        <Tag color={s.color} style={{ borderRadius: 6, fontWeight: 600 }}>
            {s.label}
        </Tag>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export const BrowseEmployee = ({
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
}: IPropsEmployee) => {
    const router = useRouter();
    const { state: employeeState } = useStore<IStateEmployee, IActionEmployee>("employees");

    const employees = employeeState?.employees || [];
    const pageInfo  = employeeState?.pageInfo  || { total: 0 };

    const columns = [
        {
            title: "EMPLOYEE",
            key: "employee",
            render: (_: any, record: any) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ 
                        width: 44, height: 44, borderRadius: 12,
                        backgroundColor: "#ecfdf5", color: "#10b981",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700,
                        border: "1px solid #d1fae5", overflow: "hidden"
                    }}>
                        {record.photoUrl ? (
                            <img 
                                src={record.photoUrl} 
                                alt={record.fullName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => {
                                    (e.target as any).style.display = "none";
                                    (e.target as any).parentElement.innerText =
                                        record.fullName?.charAt(0).toUpperCase() || "?";
                                }}
                            />
                        ) : (
                            record.fullName?.charAt(0).toUpperCase() || "?"
                        )}
                    </div>
                    <div>
                        <div style={{ fontWeight: 700, color: "#1e293b" }}>{record.fullName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                            <Tag color="orange" style={{ margin: 0, fontSize: 10, lineHeight: "14px", borderRadius: 4 }}>
                                {record.employeeCode}
                            </Tag>
                            <span>• {record.nickname || "-"}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "CONTACT & ADDRESS",
            key: "contact",
            render: (_: any, record: any) => (
                <div style={{ fontSize: 13 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569" }}>
                        <PhoneOutlined style={{ fontSize: 12 }} />
                        {record.phone || "-"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#94a3b8", marginTop: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: 12 }} />
                        <span style={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {record.address || "Alamat tidak diatur"}
                        </span>
                    </div>
                </div>
            )
        },
        {
            title: "JENIS KELAMIN",
            dataIndex: "gender",
            key: "gender",
            render: (gender: number) => (
                <span style={{ 
                    fontSize: 13, fontWeight: 600,
                    color:      gender === 1 ? "#3b82f6" : "#ec4899",
                    background: gender === 1 ? "#eff6ff" : "#fdf2f8",
                    padding: "4px 8px", borderRadius: 6
                }}>
                    {gender === 1 ? "Laki-laki" : "Perempuan"}
                </span>
            )
        },
        {
            title: "STATUS",
            dataIndex: "employmentStatus",
            key: "status",
            // ✅ BE mengembalikan string ("active" | "onleave" | "terminated")
            render: (status: string) => getStatusTag(status)
        },
        {
            title: "AKSI",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <Tooltip title="Lihat Detail / Ubah">
                        <button 
                            onClick={() => router.push(`/dashboard/organizations/employees/${record.id}`)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", color: "#3b82f6" }}
                        >
                            <EditOutlined />
                        </button>
                    </Tooltip>
                    <Tooltip title="Hapus">
                        <button 
                            onClick={() => handleDelete(record.id, record.fullName)}
                            style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2e8f0", background: "white", cursor: "pointer", color: "#ef4444" }}
                        >
                            <DeleteOutlined />
                        </button>
                    </Tooltip>
                </div>
            )
        }
    ];

    return (
        <div className="employee-management-container" style={{ padding: 24 }}>
            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: 0 }}>Manajemen Karyawan</h1>
                    <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>Kelola data karyawan, terapis, dan staf operasional</p>
                </div>
                <button 
                    onClick={setOpenFormCreate}
                    style={{ 
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white", border: "none", padding: "12px 24px", borderRadius: 12,
                        fontWeight: 700, display: "flex", alignItems: "center", gap: 10,
                        cursor: "pointer", boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.2)"
                    }}
                >
                    <PlusOutlined /> <span>Tambah Karyawan</span>
                </button>
            </div>

            {/* ── Stats ── */}
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 32 }}>
                <div style={{ background: "white", padding: 24, borderRadius: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #edf2f7" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(16,185,129,0.05)", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <TeamOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>{pageInfo.total}</div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Total Karyawan</div>
                </div>
                <div style={{ background: "white", padding: 24, borderRadius: 20, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #edf2f7" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(59,130,246,0.05)", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                        <UserOutlined style={{ fontSize: 20 }} />
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>
                        {/* ✅ Filter pakai string "active" bukan angka 0 */}
                        {employees.filter(e =>
                            String(e.employmentStatus).toLowerCase() === "active"
                        ).length}
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b" }}>Karyawan Aktif</div>
                </div>
            </div>

            {/* ── Table ── */}
            <div style={{ background: "white", borderRadius: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.04)", border: "1px solid #edf2f7", overflow: "hidden" }}>
                <div style={{ padding: 24, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1e293b", margin: 0 }}>Daftar Karyawan</h3>
                    <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                            <SearchOutlined style={{ position: "absolute", left: 14, color: "#94a3b8" }} />
                            <input 
                                type="text" 
                                placeholder="Cari nama, kode..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && onSearch(searchText)}
                                style={{ padding: "9px 16px 9px 40px", borderRadius: 12, border: "1px solid #e2e8f0", background: "#f8fafc", width: 250 }}
                            />
                        </div>
                        <button 
                            onClick={() => onSearch(searchText)}
                            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "9px 20px", borderRadius: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                            Cari
                        </button>
                    </div>
                </div>

                <Table 
                    columns={columns} 
                    dataSource={employees} 
                    pagination={false}
                    rowKey="id"
                />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", borderTop: "1px solid #f1f5f9" }}>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                        Menampilkan{" "}
                        <b>{employees.length > 0 ? ((Number(page) - 1) * Number(pageSize)) + 1 : 0}</b>
                        {" "}sampai{" "}
                        <b>{Math.min(Number(page) * Number(pageSize), Number(pageInfo?.total) || 0)}</b>
                        {" "}dari <b>{Number(pageInfo?.total) || 0}</b> karyawan
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