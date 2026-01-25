"use client";

import { useState, useEffect } from "react";
import { Select, Rate, Tag, message } from "antd";
import { 
    GetTherapistsService, 
    CreateTherapistService, 
    UpdateTherapistService, 
    DeleteTherapistService 
} from "@afx/services/therapist.service";
import { 
    ITherapist, 
    ICreateTherapistRequest, 
    IUpdateTherapistRequest,
    getQueueStatusName 
} from "@afx/interfaces/therapist.iface";
import { getGenderName } from "@afx/interfaces/member.iface";

// Predefined skills based on service categories
const SKILL_OPTIONS = [
    { label: "Massage", value: "Massage" },
    { label: "Therapy", value: "Therapy" },
    { label: "Body Care", value: "Body Care" },
    { label: "Facial", value: "Facial" },
    { label: "Paket", value: "Paket" },
    { label: "Traditional", value: "Traditional" },
    { label: "Reflexology", value: "Reflexology" },
    { label: "Aromatherapy", value: "Aromatherapy" }
];

export default function MasterTherapists() {
    const [loading, setLoading] = useState(false);
    const [therapists, setTherapists] = useState<ITherapist[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [genderFilter, setGenderFilter] = useState<string>("");

    const [showModal, setShowModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<ITherapist | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<ITherapist & { skills: string[] }>>({});

    const fetchData = async (page = 1, pageSize = 10, search?: string, gender?: string) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize };
            if (search) params.search = search;
            if (gender) params.gender = gender;
            
            const res = await GetTherapistsService(params);
            if (res.success) {
                setTherapists(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch therapists", err);
            message.error("Gagal memuat data therapist");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, pagination.pageSize, searchText, genderFilter);
    };

    const handleOpenCreateModal = () => {
        setSelectedTherapist(null);
        setFormData({
            name: "",
            phone: "",
            address: "",
            gender: undefined,
            skills: []
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (therapist: ITherapist) => {
        setSelectedTherapist(therapist);
        setFormData({ 
            ...therapist,
            skills: therapist.skills || []
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            message.error("Nama therapist harus diisi!");
            return;
        }

        try {
            if (selectedTherapist) {
                // Update
                const payload: IUpdateTherapistRequest = {
                    name: formData.name,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    gender: typeof formData.gender === 'number' ? formData.gender : undefined,
                    skills: formData.skills || [],
                    isActive: formData.isActive
                };
                const res = await UpdateTherapistService(selectedTherapist.id, payload);
                if (res.success) {
                    message.success("Therapist berhasil diupdate");
                    setShowModal(false);
                    fetchData(pagination.current, pagination.pageSize, searchText, genderFilter);
                } else {
                    message.error(res.message || "Gagal mengupdate therapist");
                }
            } else {
                // Create
                const payload: ICreateTherapistRequest = {
                    name: formData.name!,
                    phone: formData.phone || undefined,
                    address: formData.address || undefined,
                    gender: typeof formData.gender === 'number' ? formData.gender : undefined,
                    skills: formData.skills || []
                };
                const res = await CreateTherapistService(payload);
                if (res.success) {
                    message.success("Therapist berhasil ditambahkan");
                    setShowModal(false);
                    fetchData(1, pagination.pageSize, searchText, genderFilter);
                } else {
                    message.error(res.message || "Gagal membuat therapist");
                }
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus therapist ini?")) return;

        try {
            const res = await DeleteTherapistService(id);
            if (res.success) {
                message.success("Therapist berhasil dihapus");
                fetchData(pagination.current, pagination.pageSize, searchText, genderFilter);
            } else {
                message.error(res.message || "Gagal menghapus therapist");
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || "Terjadi kesalahan saat menghapus");
        }
    };

    const handlePageChange = (page: number) => {
        fetchData(page, pagination.pageSize, searchText, genderFilter);
    };

    const getQueueStatusBadgeClass = (status: any): string => {
        const statusName = getQueueStatusName(status).toLowerCase();
        switch (statusName) {
            case 'available': return 'badge-green';
            case 'busy': return 'badge-yellow';
            case 'break': return 'badge-orange';
            case 'offline': return 'badge-gray';
            default: return 'badge-gray';
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Therapist</h1>
                    <p className="page-subtitle">Kelola data therapist / terapis spa</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Therapist
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Therapist</h3>
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
                            placeholder="Gender"
                            allowClear
                            value={genderFilter || undefined}
                            onChange={(value) => {
                                setGenderFilter(value || "");
                                fetchData(1, pagination.pageSize, searchText, value || "");
                            }}
                            options={[
                                { label: "Semua Gender", value: "" },
                                { label: "Laki-laki", value: "Male" },
                                { label: "Perempuan", value: "Female" }
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
                                    <th style={{ width: '90px' }}>Kode</th>
                                    <th>Nama</th>
                                    <th>No. HP</th>
                                    <th>Gender</th>
                                    <th>Skills</th>
                                    <th style={{ width: '120px' }}>Rating</th>
                                    <th style={{ width: '80px' }}>Sessions</th>
                                    <th style={{ width: '100px' }}>Status</th>
                                    <th style={{ width: '100px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {therapists.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center", padding: "40px" }}>
                                            <i className="fa-solid fa-user-nurse" style={{ fontSize: 40, color: "#ccc", marginBottom: 12 }}></i>
                                            <p>Tidak ada data therapist</p>
                                        </td>
                                    </tr>
                                ) : (
                                    therapists.map((therapist) => (
                                        <tr key={therapist.id}>
                                            <td>
                                                <code className="text-sm" style={{ color: '#d97706' }}>{therapist.code}</code>
                                            </td>
                                            <td>
                                                <div className="service-info">
                                                    <div
                                                        className="service-icon"
                                                        style={{
                                                            backgroundColor: "#fef3c7",
                                                            color: "#d97706",
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-user-nurse"></i>
                                                    </div>
                                                    <div>
                                                        <div className="service-name">{therapist.name}</div>
                                                        <div style={{ fontSize: 11, color: '#888' }}>
                                                            Bergabung: {therapist.joinDate}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{therapist.phone || "-"}</td>
                                            <td>{getGenderName(therapist.gender)}</td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {therapist.skills && therapist.skills.length > 0 ? (
                                                        therapist.skills.slice(0, 3).map((skill, idx) => (
                                                            <Tag key={idx} color="blue" style={{ margin: 0, fontSize: 11 }}>
                                                                {skill}
                                                            </Tag>
                                                        ))
                                                    ) : (
                                                        <span style={{ color: '#999' }}>-</span>
                                                    )}
                                                    {therapist.skills && therapist.skills.length > 3 && (
                                                        <Tag color="default" style={{ margin: 0, fontSize: 11 }}>
                                                            +{therapist.skills.length - 3}
                                                        </Tag>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <Rate 
                                                        disabled 
                                                        defaultValue={therapist.rating} 
                                                        allowHalf 
                                                        style={{ fontSize: 12 }}
                                                    />
                                                    <span style={{ fontSize: 12, color: '#666' }}>
                                                        ({therapist.reviewCount})
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ fontWeight: 600 }}>{therapist.totalSessions}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${therapist.isActive ? getQueueStatusBadgeClass(therapist.queueStatus) : 'badge-red'}`}>
                                                    {therapist.isActive ? getQueueStatusName(therapist.queueStatus) : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action"
                                                        title="Edit"
                                                        onClick={() => handleOpenEditModal(therapist)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        title="Hapus"
                                                        onClick={() => handleDelete(therapist.id)}
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
                        Menampilkan {therapists.length > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} therapist
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

            {/* Add/Edit Therapist Modal */}
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal" style={{ maxWidth: 600 }}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedTherapist ? "Edit Therapist" : "Tambah Therapist Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">
                                    Nama Therapist <span className="required">*</span>
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
                                <label className="form-label">No. HP</label>
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
                            {selectedTherapist && (
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Status</label>
                                    <Select
                                        style={{ width: '100%', height: 40 }}
                                        value={formData.isActive}
                                        onChange={(value) => setFormData({ ...formData, isActive: value })}
                                        options={[
                                            { label: "Aktif", value: true },
                                            { label: "Nonaktif", value: false }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Skills / Keahlian</label>
                            <Select
                                mode="multiple"
                                style={{ width: '100%' }}
                                placeholder="Pilih keahlian"
                                value={formData.skills || []}
                                onChange={(value) => setFormData({ ...formData, skills: value })}
                                options={SKILL_OPTIONS}
                            />
                            <small style={{ color: '#888', marginTop: 4, display: 'block' }}>
                                Pilih satu atau lebih keahlian yang dimiliki therapist
                            </small>
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

                        {selectedTherapist && (
                            <div className="form-row" style={{ marginTop: 16 }}>
                                <div style={{ 
                                    flex: 1, 
                                    padding: 16, 
                                    backgroundColor: '#f9fafb', 
                                    borderRadius: 8,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: 12, color: '#666' }}>Total Sessions</div>
                                    <div style={{ fontSize: 24, fontWeight: 700, color: '#059669' }}>
                                        {selectedTherapist.totalSessions}
                                    </div>
                                </div>
                                <div style={{ 
                                    flex: 1, 
                                    padding: 16, 
                                    backgroundColor: '#f9fafb', 
                                    borderRadius: 8,
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: 12, color: '#666' }}>Rating</div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                        <span style={{ fontSize: 24, fontWeight: 700, color: '#d97706' }}>
                                            {selectedTherapist.rating.toFixed(1)}
                                        </span>
                                        <Rate 
                                            disabled 
                                            value={selectedTherapist.rating} 
                                            allowHalf 
                                            style={{ fontSize: 16 }}
                                        />
                                    </div>
                                    <div style={{ fontSize: 11, color: '#888' }}>
                                        {selectedTherapist.reviewCount} reviews
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowModal(false);
                                setSelectedTherapist(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fa-solid fa-check"></i>
                            {selectedTherapist ? "Update Therapist" : "Simpan Therapist"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
