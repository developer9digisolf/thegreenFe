"use client";

import { useState, useEffect } from "react";
import { Select, InputNumber, message } from "antd";
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

export default function MasterRooms() {
    const [loading, setLoading] = useState(false);
    const [rooms, setRooms] = useState<IRoom[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");

    const [showModal, setShowModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<IRoom>>({});

    const fetchData = async (page = 1, pageSize = 10, search?: string, status?: string) => {
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
        } catch (err) {
            console.error("Failed to fetch rooms", err);
            message.error("Gagal memuat data ruangan");
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
        setSelectedRoom(null);
        setFormData({
            name: "",
            capacity: 1,
            description: ""
        });
        setShowModal(true);
    };

    const handleOpenEditModal = (room: IRoom) => {
        setSelectedRoom(room);
        setFormData({ ...room });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            message.error("Nama ruangan harus diisi!");
            return;
        }

        try {
            if (selectedRoom) {
                // Update
                const payload: IUpdateRoomRequest = {
                    name: formData.name,
                    capacity: formData.capacity || 1,
                    description: formData.description || undefined,
                    status: typeof formData.status === 'number' ? formData.status : undefined,
                    isActive: formData.isActive
                };
                const res = await UpdateRoomService(selectedRoom.id, payload);
                if (res.success) {
                    message.success("Ruangan berhasil diupdate");
                    setShowModal(false);
                    fetchData(pagination.current, pagination.pageSize, searchText, statusFilter);
                } else {
                    message.error(res.message || "Gagal mengupdate ruangan");
                }
            } else {
                // Create
                const payload: ICreateRoomRequest = {
                    name: formData.name!,
                    capacity: formData.capacity || 1,
                    description: formData.description || undefined
                };
                const res = await CreateRoomService(payload);
                if (res.success) {
                    message.success("Ruangan berhasil ditambahkan");
                    setShowModal(false);
                    fetchData(1, pagination.pageSize, searchText, statusFilter);
                } else {
                    message.error(res.message || "Gagal membuat ruangan");
                }
            }
        } catch (err: any) {
            console.error(err);
            message.error(err.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus ruangan ini?")) return;

        try {
            const res = await DeleteRoomService(id);
            if (res.success) {
                message.success("Ruangan berhasil dihapus");
                fetchData(pagination.current, pagination.pageSize, searchText, statusFilter);
            } else {
                message.error(res.message || "Gagal menghapus ruangan");
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
        const statusName = getRoomStatusName(status).toLowerCase();
        switch (statusName) {
            case 'available': return 'badge-green';
            case 'occupied': return 'badge-yellow';
            case 'maintenance': return 'badge-red';
            default: return 'badge-gray';
        }
    };

    const getStatusIcon = (status: any): string => {
        const statusName = getRoomStatusName(status).toLowerCase();
        switch (statusName) {
            case 'available': return 'fa-solid fa-check-circle';
            case 'occupied': return 'fa-solid fa-user';
            case 'maintenance': return 'fa-solid fa-tools';
            default: return 'fa-solid fa-question-circle';
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Ruangan</h1>
                    <p className="page-subtitle">Kelola data ruangan treatment spa</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Ruangan
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Ruangan</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Cari nama ruangan..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Select
                            style={{ width: 160 }}
                            placeholder="Status"
                            allowClear
                            value={statusFilter || undefined}
                            onChange={(value) => {
                                setStatusFilter(value || "");
                                fetchData(1, pagination.pageSize, searchText, value || "");
                            }}
                            options={[
                                { label: "Semua Status", value: "" },
                                { label: "Available", value: "Available" },
                                { label: "Occupied", value: "Occupied" },
                                { label: "Maintenance", value: "Maintenance" }
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
                                    <th style={{ width: '60px' }}>ID</th>
                                    <th>Nama Ruangan</th>
                                    <th>Deskripsi</th>
                                    <th style={{ width: '100px' }}>Kapasitas</th>
                                    <th style={{ width: '120px' }}>Status</th>
                                    <th style={{ width: '80px' }}>Aktif</th>
                                    <th style={{ width: '100px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rooms.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: "center", padding: "40px" }}>
                                            <i className="fa-solid fa-door-open" style={{ fontSize: 40, color: "#ccc", marginBottom: 12 }}></i>
                                            <p>Tidak ada data ruangan</p>
                                        </td>
                                    </tr>
                                ) : (
                                    rooms.map((room) => (
                                        <tr key={room.id}>
                                            <td>{room.id}</td>
                                            <td>
                                                <div className="service-info">
                                                    <div
                                                        className="service-icon"
                                                        style={{
                                                            backgroundColor: getRoomStatusName(room.status) === 'Available' 
                                                                ? "#dcfce7" 
                                                                : getRoomStatusName(room.status) === 'Occupied'
                                                                    ? "#fef3c7"
                                                                    : "#fee2e2",
                                                            color: getRoomStatusName(room.status) === 'Available' 
                                                                ? "#16a34a" 
                                                                : getRoomStatusName(room.status) === 'Occupied'
                                                                    ? "#d97706"
                                                                    : "#dc2626",
                                                        }}
                                                    >
                                                        <i className="fa-solid fa-door-open"></i>
                                                    </div>
                                                    <div className="service-name">{room.name}</div>
                                                </div>
                                            </td>
                                            <td>{room.description || "-"}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <span style={{ 
                                                    display: 'inline-flex', 
                                                    alignItems: 'center', 
                                                    gap: 6,
                                                    fontWeight: 600 
                                                }}>
                                                    <i className="fa-solid fa-user" style={{ fontSize: 12, color: '#888' }}></i>
                                                    {room.capacity}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getStatusBadgeClass(room.status)}`}>
                                                    <i className={getStatusIcon(room.status)} style={{ marginRight: 4, fontSize: 10 }}></i>
                                                    {getRoomStatusName(room.status)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${room.isActive ? "badge-green" : "badge-red"}`}>
                                                    {room.isActive ? "Ya" : "Tidak"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action"
                                                        title="Edit"
                                                        onClick={() => handleOpenEditModal(room)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        title="Hapus"
                                                        onClick={() => handleDelete(room.id)}
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
                        Menampilkan {rooms.length > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} ruangan
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

            {/* Add/Edit Room Modal */}
            <div className={`modal-overlay ${showModal ? "show" : ""}`}>
                <div className="modal" style={{ maxWidth: 500 }}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedRoom ? "Edit Ruangan" : "Tambah Ruangan Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">
                                Nama Ruangan <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Room 1, VIP Room, dll"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group" style={{ flex: 1 }}>
                                <label className="form-label">Kapasitas</label>
                                <InputNumber
                                    style={{ width: '100%', height: 40 }}
                                    min={1}
                                    max={10}
                                    value={formData.capacity || 1}
                                    onChange={(value) => setFormData({ ...formData, capacity: value || 1 })}
                                />
                                <small style={{ color: '#888', marginTop: 4, display: 'block' }}>
                                    Jumlah maksimal orang dalam ruangan
                                </small>
                            </div>
                            {selectedRoom && (
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label className="form-label">Status</label>
                                    <Select
                                        style={{ width: '100%', height: 40 }}
                                        value={typeof formData.status === 'number' ? formData.status : 0}
                                        onChange={(value) => setFormData({ ...formData, status: value })}
                                        options={[
                                            { label: "Available", value: 0 },
                                            { label: "Occupied", value: 1 },
                                            { label: "Maintenance", value: 2 }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Deskripsi ruangan (opsional)"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {selectedRoom && (
                            <div className="form-group">
                                <label className="form-label">Status Aktif</label>
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
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowModal(false);
                                setSelectedRoom(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fa-solid fa-check"></i>
                            {selectedRoom ? "Update Ruangan" : "Simpan Ruangan"}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
