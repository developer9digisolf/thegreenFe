"use client";

import { useState, useEffect } from "react";
import { Select, DatePicker, message } from "antd";
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

export default function MasterMembers() {
    const [loading, setLoading] = useState(false);
    const [members, setMembers] = useState<IMember[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [showModal, setShowModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<IMember | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<IMember>>({});

    const fetchData = async (page = 1, pageSize = 10, search?: string, status?: string) => {
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
        } catch (err) {
            console.error("Failed to fetch members", err);
            message.error("Gagal memuat data member");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, pagination.pageSize, searchText, statusFilter);
    };

    const handleOpenCreateModal = () => {
        setSelectedMember(null);
        setFormData({
            name: "",
            phone: "",
            email: "",
            address: "",
            gender: undefined,
            birthDate: undefined,
            notes: ""
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (member: IMember) => {
        setSelectedMember(member);
        setFormData({ ...member });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            message.error("Nama member harus diisi!");
            return;
        }
        if (!formData.phone) {
            message.error("No. HP member harus diisi!");
            return;
        }

        try {
            if (selectedMember) {
                // Update
                const payload: IUpdateMemberRequest = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email || undefined,
                    address: formData.address || undefined,
                    gender: typeof formData.gender === 'number' ? formData.gender : undefined,
                    birthDate: formData.birthDate || undefined,
                    status: typeof formData.status === 'number' ? formData.status : undefined,
                    notes: formData.notes || undefined
                };
                const res = await UpdateMemberService(selectedMember.id, payload);
                if (res.success) {
                    message.success("Member berhasil diupdate");
                    setShowModal(false);
                    fetchData(pagination.current, pagination.pageSize, searchText, statusFilter);
                } else {
                    message.error(res.message || "Gagal mengupdate member");
                }
            } else {
                // Create
                const payload: ICreateMemberRequest = {
                    name: formData.name!,
                    phone: formData.phone!,
                    email: formData.email || undefined,
                    address: formData.address || undefined,
                    gender: typeof formData.gender === 'number' ? formData.gender : undefined,
                    birthDate: formData.birthDate || undefined,
                    notes: formData.notes || undefined
                };
                const res = await CreateMemberService(payload);
                if (res.success) {
                    message.success("Member berhasil ditambahkan");
                    setShowModal(false);
                    fetchData(1, pagination.pageSize, searchText, statusFilter);
                } else {
                    message.error(res.message || "Gagal membuat member");
                }
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus member ini?")) return;

        try {
            const res = await DeleteMemberService(id);
            if (res.success) {
                message.success("Member berhasil dihapus");
                fetchData(pagination.current, pagination.pageSize, searchText, statusFilter);
            } else {
                message.error(res.message || "Gagal menghapus member");
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || "Terjadi kesalahan saat menghapus");
        }
    };

    const handlePageChange = (page: number) => {
        fetchData(page, pagination.pageSize, searchText, statusFilter);
    };

    const getStatusBadgeClass = (status: any): string => {
        const statusName = getMemberStatusName(status).toLowerCase();
        switch (statusName) {
            case 'active': return 'badge-green';
            case 'pending': return 'badge-yellow';
            case 'inactive': return 'badge-gray';
            case 'blocked': return 'badge-red';
            default: return 'badge-gray';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { 
            style: 'currency', 
            currency: 'IDR',
            minimumFractionDigits: 0 
        }).format(amount);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Member</h1>
                    <p className="page-subtitle">Kelola data member / pelanggan spa</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Member
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Member</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Cari nama, telepon, kode..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Select
                            style={{ width: 140 }}
                            placeholder="Status"
                            allowClear
                            value={statusFilter || undefined}
                            onChange={(value) => {
                                setStatusFilter(value || "");
                                fetchData(1, pagination.pageSize, searchText, value || "");
                            }}
                            options={[
                                { label: "Semua Status", value: "" },
                                { label: "Active", value: "Active" },
                                { label: "Pending", value: "Pending" },
                                { label: "Inactive", value: "Inactive" },
                                { label: "Blocked", value: "Blocked" }
                            ]}
                        />
                        <button className="btn btn-secondary" onClick={handleSearch}>
                            Cari
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "40px" }}>
                            <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 24 }}></i>
                            <p style={{ marginTop: 8 }}>Loading...</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '100px' }}>Kode</th>
                                    <th>Nama</th>
                                    <th>No. HP</th>
                                    <th>Email</th>
                                    <th>Gender</th>
                                    <th>Tgl Lahir</th>
                                    <th>Saldo Credit</th>
                                    <th style={{ width: '90px' }}>Status</th>
                                    <th style={{ width: '100px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                                            <i className="fa-solid fa-users" style={{ fontSize: 40, color: "#ccc", marginBottom: 12 }}></i>
                                            <p>Tidak ada data member</p>
                                        </td>
                                    </tr>
                                ) : (
                                    members.map((member) => (
                                        <tr key={member.id}>
                                            <td>
                                                <code className="text-sm" style={{ color: '#059669' }}>{member.code}</code>
                                            </td>
                                            <td>
                                                <div className="service-info">
                                                    <div
                                                        className="service-icon"
                                                        style={{
                                                            backgroundColor: "#e0f2fe",
                                                            color: "#0284c7",
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-user"></i>
                                                    </div>
                                                    <div>
                                                        <div className="service-name">{member.name}</div>
                                                        <div style={{ fontSize: 11, color: '#888' }}>
                                                            Bergabung: {member.joinDate}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{member.phone}</td>
                                            <td>{member.email || "-"}</td>
                                            <td>{getGenderName(member.gender)}</td>
                                            <td>{member.birthDate || "-"}</td>
                                            <td>
                                                <span style={{ 
                                                    fontWeight: 600, 
                                                    color: member.creditBalance > 0 ? '#059669' : '#6b7280' 
                                                }}>
                                                    {formatCurrency(member.creditBalance)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(member.status)}`}>
                                                    {getMemberStatusName(member.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action"
                                                        title="Edit"
                                                        onClick={() => handleOpenEditModal(member)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        title="Hapus"
                                                        onClick={() => handleDelete(member.id)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="table-footer">
                    <div className="table-info">
                        Menampilkan {members.length > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} member
                    </div>
                    {pagination.total > pagination.pageSize && (
                        <div className="pagination">
                            <button 
                                className="btn btn-sm"
                                disabled={pagination.current === 1}
                                onClick={() => handlePageChange(pagination.current - 1)}
                            >
                                Prev
                            </button>
                            <span style={{ padding: '0 12px' }}>
                                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                            </span>
                            <button 
                                className="btn btn-sm"
                                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                                onClick={() => handlePageChange(pagination.current + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Member Modal */}
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal" style={{ maxWidth: 600 }}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedMember ? "Edit Member" : "Tambah Member Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">
                                    Nama Member <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nama lengkap"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">
                                    No. HP <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="08xxxxxxxxxx"
                                    value={formData.phone || ""}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="email@example.com"
                                    value={formData.email || ""}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Gender</label>
                                <Select
                                    style={{ width: '100%', height: 40 }}
                                    placeholder="Pilih gender"
                                    allowClear
                                    value={formData.gender}
                                    onChange={(value) => setFormData({ ...formData, gender: value })}
                                    options={[
                                        { label: "Laki-laki", value: 0 },
                                        { label: "Perempuan", value: 1 }
                                    ]}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Tanggal Lahir</label>
                                <DatePicker
                                    style={{ width: '100%', height: 40 }}
                                    placeholder="Pilih tanggal"
                                    format="YYYY-MM-DD"
                                    value={formData.birthDate ? dayjs(formData.birthDate) : null}
                                    onChange={(date) => setFormData({ 
                                        ...formData, 
                                        birthDate: date ? date.format('YYYY-MM-DD') : undefined 
                                    })}
                                />
                            </div>
                            {selectedMember && (
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Status</label>
                                    <Select
                                        style={{ width: '100%', height: 40 }}
                                        value={typeof formData.status === 'number' ? formData.status : 1}
                                        onChange={(value) => setFormData({ ...formData, status: value })}
                                        options={[
                                            { label: "Pending", value: 0 },
                                            { label: "Active", value: 1 },
                                            { label: "Inactive", value: 2 },
                                            { label: "Blocked", value: 3 }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Alamat</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Alamat lengkap"
                                value={formData.address || ""}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Catatan</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Catatan tentang member..."
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            ></textarea>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowModal(false);
                                setSelectedMember(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fa-solid fa-check"></i>
                            {selectedMember ? "Update Member" : "Simpan Member"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
