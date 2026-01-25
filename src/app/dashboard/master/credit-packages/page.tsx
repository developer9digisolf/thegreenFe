"use client";

import { useState, useEffect } from "react";
import { Select, InputNumber, message } from "antd";
import { ICreditPackage, ICreateCreditPackageRequest, IUpdateCreditPackageRequest } from "@afx/interfaces/credit-package.iface";
import { CreditPackageGetAllService, CreditPackageCreateService, CreditPackageUpdateService, CreditPackageDeleteService } from "@afx/services/credit-package.service";

export default function MasterCreditPackages() {
    const [packages, setPackages] = useState<ICreditPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<ICreditPackage | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        description: string;
        payAmount: number;
        creditAmount: number;
        validityDays: number;
        sortOrder: number;
        isActive: boolean;
    }>({
        name: "",
        description: "",
        payAmount: 0,
        creditAmount: 0,
        validityDays: 365,
        sortOrder: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);

    // Fetch Data
    const fetchData = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: pagination.pageSize };
            if (search) params.search = search;
            
            const res = await CreditPackageGetAllService(params);
            if (res.success) {
                setPackages(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch credit packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
            payAmount: 0,
            creditAmount: 0,
            validityDays: 365,
            sortOrder: 0,
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (pkg: ICreditPackage) => {
        setSelectedPackage(pkg);
        setFormData({
            name: pkg.name,
            description: pkg.description || "",
            payAmount: pkg.payAmount,
            creditAmount: pkg.creditAmount,
            validityDays: pkg.validityDays,
            sortOrder: pkg.sortOrder,
            isActive: pkg.isActive
        });
        setShowAddModal(true);
    };

    // Auto-calculate credit amount when pay amount changes
    const handlePayAmountChange = (value: number | null) => {
        const pay = value || 0;
        setFormData(prev => ({
            ...prev,
            payAmount: pay,
            // If credit amount is less than pay amount, set it equal
            creditAmount: prev.creditAmount < pay ? pay : prev.creditAmount
        }));
    };

    // Save Handler
    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            message.warning("Nama paket wajib diisi");
            return;
        }
        if (!formData.payAmount || formData.payAmount <= 0) {
            message.warning("Jumlah bayar harus lebih dari 0");
            return;
        }
        if (!formData.creditAmount || formData.creditAmount < formData.payAmount) {
            message.warning("Jumlah kredit harus lebih besar atau sama dengan jumlah bayar");
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
                const payload: IUpdateCreditPackageRequest = {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    payAmount: formData.payAmount,
                    creditAmount: formData.creditAmount,
                    validityDays: formData.validityDays,
                    sortOrder: formData.sortOrder,
                    isActive: formData.isActive
                };

                const res = await CreditPackageUpdateService(selectedPackage.id, payload);
                if (res.success) {
                    message.success("Paket kredit berhasil diperbarui");
                    setShowAddModal(false);
                    fetchData(pagination.current, searchText);
                } else {
                    message.error(res.message || "Gagal memperbarui paket kredit");
                }
            } else {
                // Create
                const payload: ICreateCreditPackageRequest = {
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    payAmount: formData.payAmount,
                    creditAmount: formData.creditAmount,
                    validityDays: formData.validityDays,
                    sortOrder: formData.sortOrder
                };

                const res = await CreditPackageCreateService(payload);
                if (res.success) {
                    message.success("Paket kredit berhasil dibuat");
                    setShowAddModal(false);
                    fetchData(1, searchText);
                } else {
                    message.error(res.message || "Gagal membuat paket kredit");
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
        if (!confirm(`Apakah Anda yakin ingin menghapus paket kredit "${name}"?`)) return;

        try {
            const res = await CreditPackageDeleteService(id);
            if (res.success) {
                message.success("Paket kredit berhasil dihapus");
                fetchData(pagination.current, searchText);
            } else {
                message.error(res.message || "Gagal menghapus paket kredit");
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

    // Calculate bonus preview
    const bonusAmount = formData.creditAmount - formData.payAmount;
    const bonusPercentage = formData.payAmount > 0 
        ? ((bonusAmount / formData.payAmount) * 100).toFixed(1) 
        : '0';

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Paket Kredit</h1>
                    <p className="page-subtitle">Kelola paket top-up kredit untuk member</p>
                </div>
                <button className="btn btn-primary" onClick={handleOpenCreateModal}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Paket Kredit
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-coins"></i>
                    </div>
                    <div className="stat-value">{pagination.total}</div>
                    <div className="stat-label">Total Paket Kredit</div>
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
                    <h3 className="card-title">Daftar Paket Kredit</h3>
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
                                <th>Bayar</th>
                                <th>Dapat Kredit</th>
                                <th>Bonus</th>
                                <th>Masa Berlaku</th>
                                <th>Urutan</th>
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
                                        Tidak ada data paket kredit
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
                                            <span className="price-tag" suppressHydrationWarning>
                                                {formatCurrency(pkg.payAmount)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: '#2e7d32' }} suppressHydrationWarning>
                                                {formatCurrency(pkg.creditAmount)}
                                            </span>
                                        </td>
                                        <td>
                                            <div>
                                                <span className="badge badge-orange" suppressHydrationWarning>
                                                    +{formatCurrency(pkg.bonusAmount)}
                                                </span>
                                                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                                                    ({pkg.bonusPercentage}%)
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="duration-tag">
                                                <i className="fa-regular fa-calendar"></i>
                                                {pkg.validityDays} hari
                                            </span>
                                        </td>
                                        <td>
                                            <span className="badge badge-gray">
                                                #{pkg.sortOrder}
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
                <div className="modal" style={{ maxWidth: '550px' }}>
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedPackage ? "Edit Paket Kredit" : "Tambah Paket Kredit"}
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
                                placeholder="Contoh: Gold Credit"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Jumlah Bayar <span className="required">*</span>
                                </label>
                                <InputNumber
                                    min={0}
                                    value={formData.payAmount}
                                    onChange={handlePayAmountChange}
                                    style={{ width: '100%', height: '40px' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                    addonBefore="Rp"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Dapat Kredit <span className="required">*</span>
                                </label>
                                <InputNumber
                                    min={formData.payAmount}
                                    value={formData.creditAmount}
                                    onChange={(value) => setFormData({ ...formData, creditAmount: value || formData.payAmount })}
                                    style={{ width: '100%', height: '40px' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                    parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                    addonBefore="Rp"
                                />
                            </div>
                        </div>

                        {/* Bonus Preview */}
                        <div style={{ 
                            backgroundColor: bonusAmount > 0 ? '#fff8e1' : '#f5f5f5', 
                            padding: '12px 16px', 
                            borderRadius: '8px',
                            marginBottom: '16px',
                            border: bonusAmount > 0 ? '1px solid #ffe082' : '1px solid #e0e0e0'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: '#666' }}>
                                    <i className="fa-solid fa-gift" style={{ marginRight: '8px', color: '#ff9800' }}></i>
                                    Bonus Kredit:
                                </span>
                                <span style={{ fontWeight: 600, color: bonusAmount > 0 ? '#e65100' : '#666' }} suppressHydrationWarning>
                                    +{formatCurrency(bonusAmount)} ({bonusPercentage}%)
                                </span>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Masa Berlaku <span className="required">*</span>
                                </label>
                                <InputNumber
                                    min={1}
                                    max={3650}
                                    value={formData.validityDays}
                                    onChange={(value) => setFormData({ ...formData, validityDays: value || 365 })}
                                    style={{ width: '100%', height: '40px' }}
                                    addonAfter="hari"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Urutan Tampil</label>
                                <InputNumber
                                    min={0}
                                    value={formData.sortOrder}
                                    onChange={(value) => setFormData({ ...formData, sortOrder: value || 0 })}
                                    style={{ width: '100%', height: '40px' }}
                                />
                            </div>
                        </div>

                        <div className="form-group">
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
