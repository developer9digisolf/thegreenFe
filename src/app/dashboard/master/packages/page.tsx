"use client";

import { useState } from "react";
import Link from "next/link";

interface Package {
    id: string;
    name: string;
    code: string;
    serviceName: string;
    serviceDuration: number;
    voucherCount: number;
    price: number;
    validityDays: number;
    discount: string;
    soldCount: number;
    status: "active" | "inactive";
    colorClass: "hemat" | "premium" | "vip" | "signature";
    icon: string;
}

const dummyPackages: Package[] = [
    {
        id: "P001",
        name: "Paket Hemat Traditional",
        code: "PKG-HMT-TRAD",
        serviceName: "Traditional Massage",
        serviceDuration: 60,
        voucherCount: 5,
        price: 650000,
        validityDays: 90,
        discount: "13%",
        soldCount: 12,
        status: "active",
        colorClass: "hemat",
        icon: "fa-solid fa-tag",
    },
    {
        id: "P002",
        name: "Paket Premium Aroma",
        code: "PKG-PRM-AROMA",
        serviceName: "Aromatherapy",
        serviceDuration: 90,
        voucherCount: 10,
        price: 1800000,
        validityDays: 180,
        discount: "18%",
        soldCount: 8,
        status: "active",
        colorClass: "premium",
        icon: "fa-solid fa-crown",
    },
    {
        id: "P003",
        name: "Paket VIP Traditional",
        code: "PKG-VIP-TRAD",
        serviceName: "Traditional Massage",
        serviceDuration: 60,
        voucherCount: 20,
        price: 2200000,
        validityDays: 365,
        discount: "27%",
        soldCount: 3,
        status: "active",
        colorClass: "vip",
        icon: "fa-solid fa-gem",
    },
    {
        id: "P004",
        name: "Paket Signature",
        code: "PKG-SIGNATURE",
        serviceName: "Signature Green Spa",
        serviceDuration: 120,
        voucherCount: 5,
        price: 1500000,
        validityDays: 90,
        discount: "14%",
        soldCount: 15,
        status: "active",
        colorClass: "signature",
        icon: "fa-solid fa-star",
    },
    {
        id: "P005",
        name: "Paket Promo Hot Stone",
        code: "PKG-PROMO-HS",
        serviceName: "Hot Stone Therapy",
        serviceDuration: 90,
        voucherCount: 5,
        price: 1200000,
        validityDays: 90,
        discount: "14%",
        soldCount: 7,
        status: "inactive",
        colorClass: "hemat", // Reusing 'hemat' style for inactive/promo but checking opacity in render
        icon: "fa-solid fa-tag",
    },
];

export default function MasterPackages() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

    const handleOpenDetailModal = (pkg: Package) => {
        setSelectedPackage(pkg);
        setShowDetailModal(true);
    };

    const handleOpenEditModal = (pkg: Package) => {
        setSelectedPackage(pkg);
        setShowAddModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Paket Voucher</h1>
                    <p className="page-subtitle">Kelola template paket voucher yang dijual</p>
                </div>
                <div className="header-actions">
                    <Link href="/dashboard/master/vouchers" className="btn btn-secondary">
                        <i className="fa-solid fa-tags"></i>
                        Lihat Voucher Terjual
                    </Link>
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                        <i className="fa-solid fa-plus"></i>
                        Tambah Paket
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-box"></i>
                    </div>
                    <div className="stat-value">6</div>
                    <div className="stat-label">Paket Aktif</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-shopping-cart"></i>
                    </div>
                    <div className="stat-value">38</div>
                    <div className="stat-label">Terjual Bulan Ini</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fa-solid fa-ticket"></i>
                    </div>
                    <div className="stat-value">284</div>
                    <div className="stat-label">Total Voucher Aktif</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                    <div className="stat-value">Rp 45.6jt</div>
                    <div className="stat-label">Revenue Bulan Ini</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Paket Voucher</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Cari paket..." />
                        </div>
                        <select className="filter-select">
                            <option value="">Semua Layanan</option>
                            <option value="traditional">Traditional Massage</option>
                            <option value="aroma">Aromatherapy</option>
                            <option value="signature">Signature Green Spa</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Nonaktif</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Paket</th>
                                <th>Layanan</th>
                                <th>Voucher</th>
                                <th>Harga</th>
                                <th>Diskon</th>
                                <th>Berlaku</th>
                                <th>Terjual</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyPackages.map((pkg) => (
                                <tr key={pkg.id}>
                                    <td>
                                        <div className="package-info">
                                            <div
                                                className={`package-icon ${pkg.colorClass}`}
                                                style={{ opacity: pkg.status === "inactive" ? 0.5 : 1 }}
                                            >
                                                <i className={pkg.icon}></i>
                                            </div>
                                            <div>
                                                <div
                                                    className="package-name"
                                                    style={{
                                                        color: pkg.status === "inactive" ? "var(--text-muted)" : "var(--text-primary)",
                                                    }}
                                                >
                                                    {pkg.name}
                                                </div>
                                                <div className="package-code">{pkg.code}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="service-tag">
                                            <i className="fa-solid fa-spa"></i>
                                            {pkg.serviceName} {pkg.serviceDuration}'
                                        </div>
                                    </td>
                                    <td>
                                        <div className="voucher-count">
                                            <span
                                                className="voucher-count-num"
                                                style={{
                                                    color: pkg.status === "inactive" ? "var(--text-muted)" : "var(--spa-green)",
                                                }}
                                            >
                                                {pkg.voucherCount}
                                            </span>
                                            <span className="voucher-count-label">voucher</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="price-info">
                                            <div
                                                className="price-package"
                                                style={{
                                                    color: pkg.status === "inactive" ? "var(--text-muted)" : "var(--text-primary)",
                                                }}
                                            >
                                                {formatCurrency(pkg.price)}
                                            </div>
                                            <div className="price-per">{formatCurrency(pkg.price / pkg.voucherCount)}/voucher</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="discount-badge"
                                            style={{
                                                background: pkg.status === "inactive" ? "var(--bg-main)" : "",
                                                color: pkg.status === "inactive" ? "var(--text-muted)" : "",
                                            }}
                                        >
                                            <i className="fa-solid fa-percent"></i>
                                            {pkg.discount}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="validity-tag">{pkg.validityDays} hari</span>
                                    </td>
                                    <td>
                                        <div className="sold-count">
                                            <div
                                                className="sold-num"
                                                style={{
                                                    color: pkg.status === "inactive" ? "var(--text-muted)" : "",
                                                }}
                                            >
                                                {pkg.soldCount}
                                            </div>
                                            <div className="sold-label">paket</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${pkg.status === "active" ? "badge-green" : "badge-red"}`}>
                                            {pkg.status === "active" ? "Aktif" : "Nonaktif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action"
                                                title="Lihat Detail"
                                                onClick={() => handleOpenDetailModal(pkg)}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-action"
                                                title="Edit"
                                                onClick={() => handleOpenEditModal(pkg)}
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button className="btn-action delete" title="Hapus">
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <div className="table-info">Menampilkan 1-5 dari 5 paket</div>
                    <div className="pagination">
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add/Edit Package Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedPackage ? "Edit Paket Voucher" : "Tambah Paket Voucher Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-group">
                            <label className="form-label">
                                Pilih Layanan <span className="required">*</span>
                            </label>
                            <select className="form-select" id="serviceSelect">
                                <option value="">-- Pilih Layanan --</option>
                                <option value="150000">Traditional Massage - 60 menit - Rp 150.000</option>
                                <option value="220000">Aromatherapy Massage - 90 menit - Rp 220.000</option>
                                <option value="280000">Hot Stone Therapy - 90 menit - Rp 280.000</option>
                                <option value="180000">Deep Tissue Massage - 60 menit - Rp 180.000</option>
                                <option value="350000">Signature Green Spa - 120 menit - Rp 350.000</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Nama Paket <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    id="packageName"
                                    placeholder="Contoh: Paket Hemat Traditional"
                                    defaultValue={selectedPackage?.name}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Kode Paket</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    id="packageCode"
                                    placeholder="PKG-XXX-XXX"
                                    style={{ fontFamily: "monospace" }}
                                    defaultValue={selectedPackage?.code}
                                />
                                <div className="form-hint">Auto-generate jika dikosongkan</div>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Jumlah Voucher <span className="required">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    id="voucherCount"
                                    placeholder="5"
                                    min="1"
                                    defaultValue={selectedPackage?.voucherCount}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Masa Berlaku <span className="required">*</span>
                                </label>
                                <select className="form-select" id="validityDays" defaultValue={selectedPackage?.validityDays}>
                                    <option value="30">30 hari</option>
                                    <option value="60">60 hari</option>
                                    <option value="90">90 hari</option>
                                    <option value="180">180 hari</option>
                                    <option value="365">365 hari (1 tahun)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Harga Paket <span className="required">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                id="packagePrice"
                                placeholder="650000"
                                defaultValue={selectedPackage?.price}
                            />
                            <div className="form-hint">Masukkan harga tanpa titik atau koma</div>
                        </div>

                        {/* Calculation Box placeholder - logic would need JS state to update dynamically */}
                        <div className="calc-box" id="calcBox">
                            <div className="calc-title">
                                <i className="fa-solid fa-calculator"></i>
                                Kalkulasi Otomatis
                            </div>
                            <div className="calc-row">
                                <span className="calc-label">Harga Normal</span>
                                <span className="calc-value" id="calcNormal">
                                    -
                                </span>
                            </div>
                            <div className="calc-row">
                                <span className="calc-label">Harga Paket</span>
                                <span className="calc-value" id="calcPackage">
                                    -
                                </span>
                            </div>
                            <div className="calc-row">
                                <span className="calc-label">Hemat</span>
                                <span className="calc-value highlight" id="calcSaving">
                                    -
                                </span>
                            </div>
                            <div className="calc-row">
                                <span className="calc-label">Harga per Voucher</span>
                                <span className="calc-value" id="calcPerVoucher">
                                    -
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedPackage(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary">
                            <i className="fa-solid fa-check"></i>
                            Simpan Paket
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedPackage && (
                <div className={`modal-overlay ${showDetailModal ? "show" : ""}`}>
                    <div className="modal large">
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Paket</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-header">
                                <div
                                    className={`detail-icon ${selectedPackage.colorClass}`}
                                    style={{
                                        background:
                                            selectedPackage.colorClass === "hemat"
                                                ? "var(--accent-cyan-light)"
                                                : selectedPackage.colorClass === "premium"
                                                    ? "var(--spa-green-bg)"
                                                    : selectedPackage.colorClass === "vip"
                                                        ? "var(--accent-orange-light)"
                                                        : "var(--accent-purple-light)",
                                        color:
                                            selectedPackage.colorClass === "hemat"
                                                ? "var(--accent-cyan)"
                                                : selectedPackage.colorClass === "premium"
                                                    ? "var(--spa-green)"
                                                    : selectedPackage.colorClass === "vip"
                                                        ? "var(--accent-orange)"
                                                        : "var(--accent-purple)",
                                    }}
                                >
                                    <i className={selectedPackage.icon}></i>
                                </div>
                                <div className="detail-info">
                                    <h3>{selectedPackage.name}</h3>
                                    <p>
                                        {selectedPackage.code} • Dibuat 15 Jan 2024
                                    </p>
                                    <div className="detail-meta">
                                        <div className="detail-meta-item">
                                            <i className="fa-solid fa-spa"></i>
                                            {selectedPackage.serviceName} {selectedPackage.serviceDuration}'
                                        </div>
                                        <div className="detail-meta-item">
                                            <i className="fa-solid fa-ticket"></i>
                                            {selectedPackage.voucherCount} voucher
                                        </div>
                                        <div className="detail-meta-item">
                                            <i className="fa-solid fa-calendar"></i>
                                            Berlaku {selectedPackage.validityDays} hari
                                        </div>
                                        <div className="detail-meta-item">
                                            <i className="fa-solid fa-tag"></i>
                                            {formatCurrency(selectedPackage.price)} (hemat {selectedPackage.discount})
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-stats">
                                <div className="detail-stat">
                                    <div className="detail-stat-value">{selectedPackage.soldCount}</div>
                                    <div className="detail-stat-label">Paket Terjual</div>
                                </div>
                                <div className="detail-stat">
                                    <div className="detail-stat-value" style={{ color: "var(--spa-green)" }}>
                                        {selectedPackage.soldCount * selectedPackage.voucherCount}
                                    </div>
                                    <div className="detail-stat-label">Total Voucher</div>
                                </div>
                                <div className="detail-stat">
                                    <div className="detail-stat-value" style={{ color: "var(--accent-blue)" }}>
                                        {selectedPackage.soldCount * selectedPackage.voucherCount * 0.4 /* dummy calc */}
                                    </div>
                                    <div className="detail-stat-label">Voucher Terpakai</div>
                                </div>
                                <div className="detail-stat">
                                    <div className="detail-stat-value" style={{ color: "var(--accent-orange)" }}>
                                        {selectedPackage.soldCount * selectedPackage.voucherCount * 0.6 /* dummy calc */}
                                    </div>
                                    <div className="detail-stat-label">Voucher Aktif</div>
                                </div>
                            </div>

                            <div className="detail-section-title">
                                <i className="fa-solid fa-users"></i>
                                Pembeli Paket Ini
                            </div>

                            <table className="mini-table">
                                <thead>
                                    <tr>
                                        <th>Member</th>
                                        <th>Tgl Beli</th>
                                        <th>Expired</th>
                                        <th>Voucher Terpakai</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Dummy buyer data */}
                                    <tr>
                                        <td>
                                            <div className="buyer-info">
                                                <div className="buyer-avatar">SW</div>
                                                <span className="buyer-name">Sarah Wijaya</span>
                                            </div>
                                        </td>
                                        <td>15 Jan 2024</td>
                                        <td>15 Apr 2024</td>
                                        <td>
                                            <div className="voucher-progress">
                                                <div className="progress-bar" style={{ width: "100px" }}>
                                                    <div className="progress-fill" style={{ width: "60%" }}></div>
                                                </div>
                                                <span className="progress-text">3/5</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge badge-green">Aktif</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedPackage(null);
                                }}
                            >
                                Tutup
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setShowAddModal(true);
                                }}
                            >
                                <i className="fa-solid fa-pen"></i>
                                Edit Paket
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
