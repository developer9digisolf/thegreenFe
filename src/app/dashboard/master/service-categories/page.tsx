"use client";

import { useState, useEffect } from "react";
import { Select } from "antd";
import { ServiceCategoryGetAllService, ServiceCategoryCreateService, ServiceCategoryUpdateService, ServiceCategoryDeleteService } from "@afx/services/service-category.service";
import { IServiceCategory, ICreateServiceCategoryRequest, IUpdateServiceCategoryRequest } from "@afx/interfaces/service-category.iface";

export default function MasterServiceCategories() {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<IServiceCategory[]>([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<IServiceCategory | null>(null);

    // Form state
    const [formData, setFormData] = useState<Partial<IServiceCategory>>({
        sortOrder: 0,
        color: "#8b5cf6",
        isActive: true
    });

    const fetchData = async (page = 1, pageSize = 10, search?: string) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize };
            if (search) params.search = search;
            
            const res = await ServiceCategoryGetAllService(params);
            if (res.success) {
                setCategories(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (err) {
            console.error("Failed to fetch categories", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, pagination.pageSize, searchText);
    };

    const handleOpenCreateModal = () => {
        setSelectedCategory(null);
        setFormData({
            name: "",
            description: "",
            icon: "",
            color: "#8b5cf6",
            sortOrder: 0,
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (category: IServiceCategory) => {
        setSelectedCategory(category);
        setFormData({ ...category });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.name) {
            alert("Nama kategori harus diisi!");
            return;
        }

        try {
            if (selectedCategory) {
                // Update
                const payload: IUpdateServiceCategoryRequest = {
                    name: formData.name,
                    description: formData.description,
                    icon: formData.icon,
                    color: formData.color,
                    sortOrder: Number(formData.sortOrder),
                    isActive: formData.isActive
                };
                const res = await ServiceCategoryUpdateService(selectedCategory.id, payload);
                if (res.success) {
                    setShowAddModal(false);
                    fetchData(pagination.current, pagination.pageSize, searchText);
                } else {
                    alert(res.message || "Gagal mengupdate kategori");
                }
            } else {
                // Create
                const payload: ICreateServiceCategoryRequest = {
                    name: formData.name!,
                    description: formData.description,
                    icon: formData.icon,
                    color: formData.color,
                    sortOrder: Number(formData.sortOrder)
                };
                const res = await ServiceCategoryCreateService(payload);
                if (res.success) {
                    setShowAddModal(false);
                    fetchData(1, pagination.pageSize, searchText);
                } else {
                    alert(res.message || "Gagal membuat kategori");
                }
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

        try {
            const res = await ServiceCategoryDeleteService(id);
            if (res.success) {
                fetchData(pagination.current, pagination.pageSize, searchText);
            } else {
                alert(res.message || "Gagal menghapus kategori");
            }
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Terjadi kesalahan saat menghapus");
        }
    };

    const handlePageChange = (page: number) => {
        fetchData(page, pagination.pageSize, searchText);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Kategori Layanan</h1>
                    <p className="page-subtitle">Kelola kategori layanan untuk pengelompokan menu</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Kategori
                </button>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Kategori</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Cari kategori..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button className="btn btn-secondary" onClick={handleSearch}>
                            Cari
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px' }}>ID</th>
                                    <th>Nama Kategori</th>
                                    <th>Deskripsi</th>
                                    <th>Icon</th>
                                    <th>Warna</th>
                                    <th style={{ width: '80px' }}>Urutan</th>
                                    <th style={{ width: '80px' }}>Services</th>
                                    <th style={{ width: '80px' }}>Status</th>
                                    <th style={{ width: '100px' }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} style={{ textAlign: "center" }}>Tidak ada data</td>
                                    </tr>
                                ) : (
                                    categories.map((category) => (
                                        <tr key={category.id}>
                                            <td>{category.id}</td>
                                            <td>
                                                <div className="service-info">
                                                    <div
                                                        className="service-icon"
                                                        style={{
                                                            backgroundColor: `${category.color}20`,
                                                            color: category.color,
                                                        }}
                                                    >
                                                        <i className={category.icon || "fa-solid fa-spa"}></i>
                                                    </div>
                                                    <div className="service-name">{category.name}</div>
                                                </div>
                                            </td>
                                            <td>{category.description || "-"}</td>
                                            <td>
                                                {category.icon ? <code className="text-sm">{category.icon}</code> : "-"}
                                            </td>
                                            <td>
                                                {category.color ? (
                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                        <div
                                                            style={{
                                                                width: "16px",
                                                                height: "16px",
                                                                borderRadius: "4px",
                                                                backgroundColor: category.color,
                                                            }}
                                                        ></div>
                                                        <span className="text-sm">{category.color}</span>
                                                    </div>
                                                ) : "-"}
                                            </td>
                                            <td>{category.sortOrder}</td>
                                            <td>{category.serviceCount || 0}</td>
                                            <td>
                                                <span
                                                    className={`badge ${category.isActive ? "badge-green" : "badge-red"}`}
                                                >
                                                    {category.isActive ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action"
                                                        title="Edit"
                                                        onClick={() => handleOpenEditModal(category)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        title="Hapus"
                                                        onClick={() => handleDelete(category.id)}
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
                        Menampilkan {categories.length > 0 ? ((pagination.current - 1) * pagination.pageSize) + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} kategori
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

            {/* Add/Edit Category Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">
                                Nama Kategori <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Massage"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Deskripsi singkat kategori..."
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Icon Class (FontAwesome)
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="fa-solid fa-spa"
                                    value={formData.icon || ""}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Warna (Hex)
                                </label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    <input
                                        type="color"
                                        className="form-input"
                                        style={{ width: "50px", padding: 2, height: "38px" }}
                                        value={formData.color || "#8b5cf6"}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="#8b5cf6"
                                        value={formData.color || ""}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        style={{ flex: 1 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Urutan
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="1"
                                    value={formData.sortOrder || 0}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                                />
                            </div>
                            {selectedCategory && (
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <Select
                                        style={{ width: '100%', height: '40px' }}
                                        value={formData.isActive ? "active" : "inactive"}
                                        onChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                                        options={[
                                            { label: "Aktif", value: "active" },
                                            { label: "Nonaktif", value: "inactive" }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedCategory(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fa-solid fa-check"></i>
                            Simpan Kategori
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
