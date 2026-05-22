"use client";

import { useState, useEffect } from "react";
import { Select, InputNumber, message } from "antd";
import { IPackage, ICreatePackageRequest, IUpdatePackageRequest } from "@afx/interfaces/package.iface";
import { PackageGetAllService, PackageCreateService, PackageUpdateService, PackageDeleteService } from "@afx/services/package.service";
import { VariantGetAllActiveService } from "@afx/services/service.service";
import { IServiceVariantList } from "@afx/interfaces/service.iface";

export default function MasterPackages() {
    const [packages, setPackages] = useState<IPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState<IServiceVariantList[]>([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<IPackage | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        totalSessions: number;
        price: number;
        validityDays: number | null;
        serviceVariantId: number | null;
        isActive: boolean;
    }>({
        name: "",
        description: "",
        totalSessions: 10,
        price: 0,
        validityDays: 365,
        serviceVariantId: null,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    // Fetch Data
    const fetchData = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: pagination.pageSize };
            if (search) params.search = search;
            
            const res = await PackageGetAllService(params);
            if (res.success) {
                setPackages(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch packages:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVariants = async () => {
        try {
            const res = await VariantGetAllActiveService();
            if (res.success) {
                setVariants(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch variants:", error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchVariants();
    }, []);

    const handleSearch = () => {
        fetchData(1, searchText);
    };

    // Modal Handlers
    const handleOpenCreateModal = () => {
        setSelectedPackage(null);
        setFormData({
            name: "",
            description: "",
            totalSessions: 10,
            price: 0,
            validityDays: 365,
            serviceVariantId: null,
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (pkg: IPackage) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || "",
            totalSessions: pkg.totalSessions,
            price: pkg.price,
            validityDays: pkg.validityDays,
            serviceVariantId: pkg.serviceVariantId || null,
            isActive: pkg.isActive
        });
        setShowAddModal(true);
    };

    // Save Handler
    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            message.warning("Nama paket wajib diisi");
            return;
        }
        if (!formData.totalSessions || formData.totalSessions < 1) {
            message.warning("Jumlah sesi minimal 1");
            return;
        }
        if (!formData.price || formData.price < 0) {
            message.warning("Harga tidak valid");
            return;
        }
        if (!formData.validityDays || formData.validityDays < 1) {
            message.warning("Masa berlaku minimal 1 hari");
            return;
        }

        setSaving(true);
        try {
            if (selectedPackage) {
                // Update
                const payload: IUpdatePackageRequest = {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    totalSessions: formData.totalSessions,
                    price: formData.price,
                    validityDays: formData.validityDays!,
                    isActive: formData.isActive
                };

                // Handle service variant
                if (formData.serviceVariantId) {
                    payload.serviceVariantId = formData.serviceVariantId;
                } else if (selectedPackage.serviceVariantId && !formData.serviceVariantId) {
                    payload.clearServiceVariant = true;
                }

                const res = await PackageUpdateService(selectedPackage.id, payload);
                if (res.success) {
                    message.success("Paket berhasil diperbarui");
                    setShowAddModal(false);
                    fetchData(pagination.current, searchText);
                } else {
                    message.error(res.message || "Gagal memperbarui paket");
                }
            } else {
                // Create
                const payload: ICreatePackageRequest = {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    totalSessions: formData.totalSessions,
                    price: formData.price,
                    validityDays: formData.validityDays!,
                    serviceVariantId: formData.serviceVariantId || undefined
                };

                const res = await PackageCreateService(payload);
                if (res.success) {
                    message.success("Paket berhasil dibuat");
                    setShowAddModal(false);
                    fetchData(1, searchText);
                } else {
                    message.error(res.message || "Gagal membuat paket");
                }
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus paket "${name}"?`)) return;

        try {
            const res = await PackageDeleteService(id);
            if (res.success) {
                message.success("Paket berhasil dihapus");
                fetchData(pagination.current, searchText);
            } else {
                message.error(res.message || "Gagal menghapus paket");
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

    // Calculate price per session preview
    const pricePerSession = formData.totalSessions > 0 ? formData.price / formData.totalSessions : 0;
    
    // Calculate savings preview
    const selectedVariant = variants.find(v => v.id === formData.serviceVariantId);
    const savingsPreview = selectedVariant && formData.totalSessions > 0
        ? (selectedVariant.price * formData.totalSessions) - formData.price
        : null;

    // Variant options for Select
    const variantOptions = variants.map(v => ({
        label: `${v.categoryName} > ${v.serviceName} (${v.duration} menit) - ${formatCurrency(v.price)}`,
        value: v.id
    }));

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Paket Voucher</h1>
                    <p className="page-subtitle">Kelola paket voucher/sesi untuk member</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Paket
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fa-solid fa-ticket"></i>
                    </div>
                    <div className="stat-value">{pagination.total}</div>
                    <div className="stat-label">Total Paket</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-check-circle"></i>
                    </div>
                    <div className="stat-value">{packages.filter(p => p.isActive).length}</div>
                    <div className="stat-label">Paket Aktif</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Paket Voucher</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input 
                                type="text" 
                                placeholder="Cari paket..." 
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
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Nama Paket</th>
                                <th>Layanan</th>
                                <th>Jumlah Sesi</th>
                                <th>Harga</th>
                                <th>Harga/Sesi</th>
                                <th>Masa Berlaku</th>
                                <th>Status</th>
                                <th style={{ width: '100px' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : packages.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                        Tidak ada data paket
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id}>
                                        <td>{pkg.id}</td>
                                        <td>
                                            <div>
                                                <div className="service-name">{pkg.name}</div>
                                                {pkg.description && (
                                                    <div className="service-desc">{pkg.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            {pkg.serviceVariantName ? (
                                                <span className="category-tag" style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #c8e6c9' }}>
                                                    <i className="fa-solid fa-spa" style={{ marginRight: "5px" }}></i>
                                                    {pkg.serviceVariantName}
                                                </span>
                                            ) : (
                                                <span className="badge badge-blue">Semua Layanan</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className="badge badge-purple">
                                                {pkg.totalSessions} sesi
                                            </span>
                                        </td>
                                        <td>
                                            <span className="price-tag" suppressHydrationWarning>
                                                {formatCurrency(pkg.price)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#666' }} suppressHydrationWarning>
                                                {formatCurrency(pkg.pricePerSession)}
                                            </span>
                                            {pkg.savings && pkg.savings > 0 && (
                                                <div style={{ fontSize: '11px', color: '#2e7d32' }} suppressHydrationWarning>
                                                    Hemat {formatCurrency(pkg.savings)}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span className="duration-tag">
                                                <i className="fa-regular fa-calendar"></i>
                                                {pkg.validityDays} hari
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${pkg.isActive ? "badge-green" : "badge-red"}`}>
                                                {pkg.isActive ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action"
                                                    title="Edit"
                                                    onClick={() => handleOpenEditModal(pkg)}
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                </button>
                                                <button
                                                    className="btn-action delete"
                                                    title="Hapus"
                                                    onClick={() => handleDelete(pkg.id, pkg.name)}
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
                </div>
                <div className="table-footer">
                    <div className="table-info">
                        Menampilkan {packages.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} paket
                    </div>
                    {pagination.total > pagination.pageSize && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={pagination.current === 1}
                                onClick={() => fetchData(pagination.current - 1, searchText)}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span style={{ padding: '0 12px' }}>
                                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                            </span>
                            <button
                                className="page-btn"
                                disabled={pagination.current * pagination.pageSize >= pagination.total}
                                onClick={() => fetchData(pagination.current + 1, searchText)}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal" style={{ maxWidth: '600px' }}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedPackage ? "Edit Paket Voucher" : "Tambah Paket Voucher"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">
                                Nama Paket <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Paket Hemat 10 Sesi"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Layanan Spesifik (Opsional)</label>
                            <Select
                                showSearch
                                allowClear
                                placeholder="-- Semua Layanan --"
                                optionFilterProp="label"
                                style={{ width: '100%', height: '40px' }}
                                value={formData.serviceVariantId}
                                onChange={(value) => setFormData({ ...formData, serviceVariantId: value })}
                                options={variantOptions}
                            />
                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                Kosongkan jika paket bisa digunakan untuk semua layanan
                            </p>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Jumlah Sesi <span className="required">*</span>
                                </label>
                                <InputNumber
                                    min={1}
                                    max={100}
                                    value={formData.totalSessions}
                                    onChange={(value) => setFormData({ ...formData, totalSessions: value || 1 })}
                                    style={{ width: '100%', height: '40px' }}
                                    addonAfter="sesi"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Masa Berlaku <span className="required">*</span>
                                </label>
                                <InputNumber
                                    min={1}
                                    max={3650}
                                    value={formData.validityDays}
                                    onChange={(value) => setFormData({ ...formData, validityDays: value })}
                                    style={{ width: '100%', height: '40px' }}
                                    addonAfter="hari"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Harga Paket <span className="required">*</span>
                            </label>
                            <InputNumber
                                min={0}
                                value={formData.price}
                                onChange={(value) => setFormData({ ...formData, price: value || 0 })}
                                style={{ width: '100%', height: '40px' }}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                addonBefore="Rp"
                            />
                        </div>

                        {/* Preview Box */}
                        <div style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '16px', 
                            borderRadius: '12px',
                            marginTop: '20px',
                            border: '1px dashed #e2e8f0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: 500 }}>Harga per sesi</span>
                                <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px' }} suppressHydrationWarning>
                                    {formatCurrency(pricePerSession)}
                                </span>
                            </div>
                            {savingsPreview !== null && savingsPreview > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748b', fontSize: '12px' }}>Total Penghematan</span>
                                    <span style={{ fontWeight: 600, color: '#2e7d32', fontSize: '13px' }} suppressHydrationWarning>
                                        Hemat {formatCurrency(savingsPreview)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Deskripsi paket (opsional)..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            ></textarea>
                        </div>

                        {selectedPackage && (
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
                            onClick={() => setShowAddModal(false)}
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
                                    Simpan Paket
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
