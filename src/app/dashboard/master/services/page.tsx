"use client";

import { useState, useEffect } from "react";
import { Select } from "antd";
import { IService, ICreateServiceRequest, IUpdateServiceRequest } from "@afx/interfaces/service.iface";
import { ServiceGetAllService, ServiceCreateService, ServiceUpdateService, ServiceDeleteService } from "@afx/services/service.service";
import { ServiceCategoryGetActiveService } from "@afx/services/service-category.service";
import { IServiceCategory } from "@afx/interfaces/service-category.iface";

export default function MasterServices() {
    const [services, setServices] = useState<IService[]>([]);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<IServiceCategory[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");
    const [filterCategory, setFilterCategory] = useState<number | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined);

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedService, setSelectedService] = useState<IService | null>(null);
    const [formData, setFormData] = useState<Partial<ICreateServiceRequest & { isActive: boolean }>>({
        name: "",
        categoryId: undefined,
        duration: 60,
        price: 0,
        description: "",
        isActive: true
    });

    // Fetch Data
    const fetchData = async (page = 1, search?: string, categoryId?: number) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: pagination.pageSize };
            if (search) params.search = search;
            if (categoryId) params.categoryId = categoryId;
            
            const res = await ServiceGetAllService(params);
            if (res.success) {
                setServices(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch services:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await ServiceCategoryGetActiveService();
            if (res.success) {
                setCategories(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchCategories();
    }, []);

    const handleSearch = () => {
        fetchData(1, searchText, filterCategory);
    };

    const handleCategoryFilter = (value: number | undefined) => {
        setFilterCategory(value);
        fetchData(1, searchText, value);
    };

    // Handlers
    const handleOpenCreateModal = () => {
        setSelectedService(null);
        setFormData({
            name: "",
            categoryId: undefined,
            duration: 60,
            price: 0,
            description: "",
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (service: IService) => {
        setSelectedService(service);
        setFormData({
            name: service.name,
            categoryId: service.categoryId,
            duration: service.duration,
            price: service.price,
            description: service.description || "",
            isActive: service.isActive
        });
        setShowAddModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.categoryId || !formData.price || !formData.duration) {
            alert("Mohon lengkapi data wajib (Nama, Kategori, Durasi, Harga)");
            return;
        }

        try {
            if (selectedService) {
                // Update
                const payload: IUpdateServiceRequest = {
                    name: formData.name,
                    categoryId: formData.categoryId,
                    duration: Number(formData.duration),
                    price: Number(formData.price),
                    description: formData.description,
                    isActive: formData.isActive
                };
                const res = await ServiceUpdateService(selectedService.id, payload);
                if (res.success) {
                    setShowAddModal(false);
                    fetchData(pagination.current, searchText, filterCategory);
                } else {
                    alert(res.message || "Gagal mengupdate layanan");
                }
            } else {
                // Create
                const payload: ICreateServiceRequest = {
                    name: formData.name,
                    categoryId: formData.categoryId,
                    duration: Number(formData.duration),
                    price: Number(formData.price),
                    description: formData.description
                };
                const res = await ServiceCreateService(payload);
                if (res.success) {
                    setShowAddModal(false);
                    fetchData(1, searchText, filterCategory);
                } else {
                    alert(res.message || "Gagal membuat layanan");
                }
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Terjadi kesalahan saat menyimpan");
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) return;

        try {
            const res = await ServiceDeleteService(id);
            if (res.success) {
                fetchData(pagination.current, searchText, filterCategory);
            } else {
                alert(res.message || "Gagal menghapus layanan");
            }
        } catch (error: any) {
            console.error(error);
            alert(error.message || "Terjadi kesalahan saat menghapus");
        }
    };

    // Helpers
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Using category color/icon if available, else fallback
    const getCategoryDetails = (id: number) => {
        return categories.find(c => c.id === id) || { name: 'Unknown', color: '#ccc', icon: 'fa-solid fa-spa' };
    };

    // Prepare options for Select
    const categoryOptions = categories.map(cat => ({
        label: cat.name,
        value: cat.id
    }));

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Layanan</h1>
                    <p className="page-subtitle">Kelola daftar layanan spa yang tersedia</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Layanan
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-spa"></i>
                    </div>
                    <div className="stat-value">{pagination.total}</div>
                    <div className="stat-label">Total Layanan</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-folder"></i>
                    </div>
                    <div className="stat-value">{categories.length}</div>
                    <div className="stat-label">Kategori</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Layanan</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Cari layanan..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Select
                            placeholder="Semua Kategori"
                            style={{ width: 180, height: 40 }}
                            allowClear
                            value={filterCategory}
                            onChange={handleCategoryFilter}
                            options={categoryOptions}
                        />
                        <button className="btn btn-secondary" onClick={handleSearch}>
                            Cari
                        </button>
                    </div>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Layanan</th>
                                <th>Kategori</th>
                                <th>Durasi</th>
                                <th>Harga</th>
                                <th>Status</th>
                                <th style={{ width: '100px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center", padding: "20px" }}>
                                        Tidak ada data layanan
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => {
                                    const cat = getCategoryDetails(service.categoryId);
                                    return (
                                        <tr key={service.id}>
                                            <td>{service.id}</td>
                                            <td>
                                                <div className="service-info">
                                                    <div
                                                        className="service-icon"
                                                        style={{ backgroundColor: `${cat.color}20`, color: cat.color || '#555' }}
                                                    >
                                                        <i className={service.icon || cat.icon || "fa-solid fa-spa"}></i>
                                                    </div>
                                                    <div>
                                                        <div className="service-name">{service.name}</div>
                                                        <div className="service-desc">{service.description}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className="category-tag"
                                                    style={{
                                                        backgroundColor: `${cat.color}15`,
                                                        color: cat.color,
                                                        border: `1px solid ${cat.color}30`
                                                    }}
                                                >
                                                    <i className={cat.icon || "fa-solid fa-tag"} style={{ marginRight: "5px" }}></i>
                                                    {service.categoryName || cat.name}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="duration-tag">
                                                    <i className="fa-regular fa-clock"></i>
                                                    {service.duration} menit
                                                </span>
                                            </td>
                                            <td>
                                                <span className="price-tag" suppressHydrationWarning>{formatCurrency(service.price)}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${service.isActive ? "badge-green" : "badge-red"}`}>
                                                    {service.isActive ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button
                                                        className="btn-action"
                                                        title="Edit"
                                                        onClick={() => handleOpenEditModal(service)}
                                                    >
                                                        <i className="fa-solid fa-pen"></i>
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        title="Hapus"
                                                        onClick={() => handleDelete(service.id, service.name)}
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <div className="table-info">
                        Menampilkan {services.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} layanan
                    </div>
                    {pagination.total > pagination.pageSize && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={pagination.current === 1}
                                onClick={() => fetchData(pagination.current - 1, searchText, filterCategory)}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span style={{ padding: '0 12px' }}>
                                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                            </span>
                            <button
                                className="page-btn"
                                disabled={pagination.current * pagination.pageSize >= pagination.total}
                                onClick={() => fetchData(pagination.current + 1, searchText, filterCategory)}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Service Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedService ? "Edit Layanan" : "Tambah Layanan Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">
                                Nama Layanan <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Traditional Massage"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Kategori <span className="required">*</span>
                                </label>
                                <Select
                                    showSearch
                                    placeholder="-- Pilih Kategori --"
                                    optionFilterProp="label"
                                    style={{ width: '100%', height: '40px' }}
                                    value={formData.categoryId || null}
                                    onChange={(value) => setFormData({ ...formData, categoryId: value })}
                                    options={categoryOptions}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Durasi (menit) <span className="required">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-input has-suffix"
                                        placeholder="60"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                    />
                                    <span className="input-suffix">menit</span>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Harga <span className="required">*</span>
                            </label>
                            <div className="input-group">
                                <span className="input-prefix">Rp</span>
                                <input
                                    type="number"
                                    className="form-input has-prefix"
                                    placeholder="150000"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Deskripsi singkat layanan..."
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {selectedService && (
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
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedService(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            <i className="fa-solid fa-check"></i>
                            Simpan Layanan
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
