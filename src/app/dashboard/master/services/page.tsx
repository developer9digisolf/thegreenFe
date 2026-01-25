"use client";

import { useState, useEffect } from "react";
import { Select, InputNumber, message } from "antd";
import { IService, IServiceDetail, ICreateServiceRequest, IUpdateServiceRequest, ICreateServiceVariantRequest, IServiceVariant } from "@afx/interfaces/service.iface";
import { ServiceGetAllService, ServiceGetDetailService, ServiceCreateService, ServiceUpdateService, ServiceDeleteService, VariantAddService, VariantUpdateService, VariantDeleteService } from "@afx/services/service.service";
import { ServiceCategoryGetActiveService } from "@afx/services/service-category.service";
import { IServiceCategory } from "@afx/interfaces/service-category.iface";

interface VariantFormData {
    id?: number;
    label: string;
    duration: number;
    price: number;
    sortOrder: number;
    isActive: boolean;
    isNew?: boolean;
    isDeleted?: boolean;
}

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

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedService, setSelectedService] = useState<IServiceDetail | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        categoryId: number | undefined;
        description: string;
        icon: string;
        sortOrder: number;
        isActive: boolean;
    }>({
        name: "",
        categoryId: undefined,
        description: "",
        icon: "",
        sortOrder: 0,
        isActive: true
    });
    const [variants, setVariants] = useState<VariantFormData[]>([]);
    const [saving, setSaving] = useState(false);

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

    // Modal Handlers
    const handleOpenCreateModal = () => {
        setSelectedService(null);
        setFormData({
            name: "",
            categoryId: undefined,
            description: "",
            icon: "",
            sortOrder: 0,
            isActive: true
        });
        // Start with one empty variant
        setVariants([{
            label: "",
            duration: 60,
            price: 0,
            sortOrder: 0,
            isActive: true,
            isNew: true
        }]);
        setShowAddModal(true);
    };

    const handleOpenEditModal = async (service: IService) => {
        try {
            setLoading(true);
            const res = await ServiceGetDetailService(service.id);
            if (res.success && res.data) {
                setSelectedService(res.data);
                setFormData({
                    name: res.data.name,
                    categoryId: res.data.categoryId,
                    description: res.data.description || "",
                    icon: res.data.icon || "",
                    sortOrder: res.data.sortOrder,
                    isActive: res.data.isActive
                });
                setVariants(res.data.variants.map(v => ({
                    id: v.id,
                    label: v.label || "",
                    duration: v.duration,
                    price: v.price,
                    sortOrder: v.sortOrder,
                    isActive: v.isActive,
                    isNew: false,
                    isDeleted: false
                })));
                setShowAddModal(true);
            }
        } catch (error) {
            console.error("Failed to fetch service detail:", error);
            message.error("Gagal mengambil detail layanan");
        } finally {
            setLoading(false);
        }
    };

    // Variant Handlers
    const handleAddVariant = () => {
        const maxSort = variants.length > 0 ? Math.max(...variants.map(v => v.sortOrder)) : -1;
        setVariants([...variants, {
            label: "",
            duration: 60,
            price: 0,
            sortOrder: maxSort + 1,
            isActive: true,
            isNew: true
        }]);
    };

    const handleRemoveVariant = (index: number) => {
        const variant = variants[index];
        if (variant.id && !variant.isNew) {
            // Mark existing variant as deleted
            const updated = [...variants];
            updated[index] = { ...variant, isDeleted: true };
            setVariants(updated);
        } else {
            // Remove new variant from array
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    const handleVariantChange = (index: number, field: keyof VariantFormData, value: any) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        setVariants(updated);
    };

    // Save Handler
    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            message.warning("Nama layanan wajib diisi");
            return;
        }
        if (!formData.categoryId) {
            message.warning("Kategori wajib dipilih");
            return;
        }

        const activeVariants = variants.filter(v => !v.isDeleted);
        if (activeVariants.length === 0) {
            message.warning("Minimal harus ada 1 variasi harga");
            return;
        }

        for (const v of activeVariants) {
            if (!v.duration || v.duration <= 0) {
                message.warning("Durasi harus lebih dari 0");
                return;
            }
            if (v.price < 0) {
                message.warning("Harga tidak boleh negatif");
                return;
            }
        }

        setSaving(true);
        try {
            if (selectedService) {
                // UPDATE MODE
                // 1. Update service info
                const updatePayload: IUpdateServiceRequest = {
                    name: formData.name.trim(),
                    categoryId: formData.categoryId,
                    description: formData.description?.trim() || undefined,
                    icon: formData.icon?.trim() || undefined,
                    sortOrder: formData.sortOrder,
                    isActive: formData.isActive
                };
                await ServiceUpdateService(selectedService.id, updatePayload);

                // 2. Handle variants
                for (const v of variants) {
                    if (v.isDeleted && v.id) {
                        // Delete existing variant
                        await VariantDeleteService(v.id);
                    } else if (v.isNew && !v.isDeleted) {
                        // Add new variant
                        await VariantAddService(selectedService.id, {
                            label: v.label?.trim() || undefined,
                            duration: v.duration,
                            price: v.price,
                            sortOrder: v.sortOrder
                        });
                    } else if (v.id && !v.isDeleted) {
                        // Update existing variant
                        await VariantUpdateService(v.id, {
                            label: v.label?.trim() || undefined,
                            duration: v.duration,
                            price: v.price,
                            sortOrder: v.sortOrder,
                            isActive: v.isActive
                        });
                    }
                }

                message.success("Layanan berhasil diperbarui");
            } else {
                // CREATE MODE
                const createPayload: ICreateServiceRequest = {
                    categoryId: formData.categoryId,
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    icon: formData.icon?.trim() || undefined,
                    sortOrder: formData.sortOrder,
                    variants: activeVariants.map(v => ({
                        label: v.label?.trim() || undefined,
                        duration: v.duration,
                        price: v.price,
                        sortOrder: v.sortOrder
                    }))
                };

                const res = await ServiceCreateService(createPayload);
                if (res.success) {
                    message.success("Layanan berhasil ditambahkan");
                } else {
                    message.error(res.message || "Gagal membuat layanan");
                    return;
                }
            }

            setShowAddModal(false);
            fetchData(pagination.current, searchText, filterCategory);
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus layanan "${name}"?`)) return;

        try {
            const res = await ServiceDeleteService(id);
            if (res.success) {
                message.success("Layanan berhasil dihapus");
                fetchData(pagination.current, searchText, filterCategory);
            } else {
                message.error(res.message || "Gagal menghapus layanan");
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Terjadi kesalahan saat menghapus");
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

    const getCategoryDetails = (id: number) => {
        return categories.find(c => c.id === id) || { name: 'Unknown', color: '#ccc', icon: 'fa-solid fa-spa' };
    };

    const categoryOptions = categories.map(cat => ({
        label: cat.name,
        value: cat.id
    }));

    const formatPriceRange = (service: IService) => {
        if (!service.minPrice && !service.maxPrice) return "-";
        if (service.minPrice === service.maxPrice) {
            return formatCurrency(service.minPrice || 0);
        }
        return `${formatCurrency(service.minPrice || 0)} - ${formatCurrency(service.maxPrice || 0)}`;
    };

    const formatDurationRange = (service: IService) => {
        if (!service.minDuration && !service.maxDuration) return "-";
        if (service.minDuration === service.maxDuration) {
            return `${service.minDuration} menit`;
        }
        return `${service.minDuration} - ${service.maxDuration} menit`;
    };

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
                                <th>Variasi</th>
                                <th>Durasi</th>
                                <th>Harga</th>
                                <th>Status</th>
                                <th style={{ width: '100px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : services.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>
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
                                                <span className="badge badge-blue">
                                                    {service.variantCount} variasi
                                                </span>
                                            </td>
                                            <td>
                                                <span className="duration-tag">
                                                    <i className="fa-regular fa-clock"></i>
                                                    {formatDurationRange(service)}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="price-tag" suppressHydrationWarning>
                                                    {formatPriceRange(service)}
                                                </span>
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
                <div className="modal" style={{ maxWidth: '700px' }}>
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
                                placeholder="Contoh: Balinese Massage"
                                value={formData.name}
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

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Deskripsi singkat layanan..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Variants Section */}
                        <div className="form-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <label className="form-label" style={{ margin: 0 }}>
                                    Variasi Harga <span className="required">*</span>
                                </label>
                                <button 
                                    type="button" 
                                    className="btn btn-secondary btn-sm"
                                    onClick={handleAddVariant}
                                    style={{ padding: '6px 12px', fontSize: '13px' }}
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    Tambah Variasi
                                </button>
                            </div>

                            <div className="variants-table">
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '25%' }}>Label</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '25%' }}>Durasi (menit)</th>
                                            <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', width: '35%' }}>Harga</th>
                                            <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #e5e7eb', width: '15%' }}>Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {variants.filter(v => !v.isDeleted).length === 0 ? (
                                            <tr>
                                                <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                                                    Belum ada variasi. Klik "Tambah Variasi" untuk menambahkan.
                                                </td>
                                            </tr>
                                        ) : (
                                            variants.map((variant, index) => {
                                                if (variant.isDeleted) return null;
                                                return (
                                                    <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                        <td style={{ padding: '8px' }}>
                                                            <input
                                                                type="text"
                                                                className="form-input"
                                                                placeholder="Standard"
                                                                value={variant.label}
                                                                onChange={(e) => handleVariantChange(index, 'label', e.target.value)}
                                                                style={{ height: '36px' }}
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <InputNumber
                                                                min={1}
                                                                max={480}
                                                                value={variant.duration}
                                                                onChange={(value) => handleVariantChange(index, 'duration', value || 60)}
                                                                style={{ width: '100%', height: '36px' }}
                                                                addonAfter="menit"
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px' }}>
                                                            <InputNumber
                                                                min={0}
                                                                value={variant.price}
                                                                onChange={(value) => handleVariantChange(index, 'price', value || 0)}
                                                                style={{ width: '100%', height: '36px' }}
                                                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                                                parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                                                addonBefore="Rp"
                                                            />
                                                        </td>
                                                        <td style={{ padding: '8px', textAlign: 'center' }}>
                                                            <button
                                                                type="button"
                                                                className="btn-action delete"
                                                                onClick={() => handleRemoveVariant(index)}
                                                                title="Hapus variasi"
                                                                disabled={variants.filter(v => !v.isDeleted).length <= 1}
                                                                style={{
                                                                    opacity: variants.filter(v => !v.isDeleted).length <= 1 ? 0.5 : 1,
                                                                    cursor: variants.filter(v => !v.isDeleted).length <= 1 ? 'not-allowed' : 'pointer'
                                                                }}
                                                            >
                                                                <i className="fa-solid fa-trash"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                                <i className="fa-solid fa-info-circle" style={{ marginRight: '5px' }}></i>
                                Minimal harus ada 1 variasi harga. Label bersifat opsional.
                            </p>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedService(null);
                            }}
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button 
                            className="btn btn-primary" 
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    Simpan Layanan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
