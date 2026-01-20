"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Voucher {
    id: string;
    code: string;
    packageName: string;
    serviceName: string;
    packageType: "hemat" | "premium" | "vip" | "signature";
    buyerName: string;
    buyerPhone: string;
    buyerInitials: string;
    buyerAvatarColor?: string; // Hex color
    purchaseDate: string;
    expiryDate: string;
    status: "active" | "expiring_soon" | "used" | "expired";
    usedBy?: string;
    usedDate?: string;
    therapist?: string;
}

const dummyVouchers: Voucher[] = [
    {
        id: "V001",
        code: "VCH-240115-0001",
        packageName: "Paket Hemat",
        serviceName: "Traditional Massage 60'",
        packageType: "hemat",
        buyerName: "Sarah Wijaya",
        buyerPhone: "0812-3456-7890",
        buyerInitials: "SW",
        purchaseDate: "15 Jan 2024",
        expiryDate: "15 Apr 2024",
        status: "active",
    },
    {
        id: "V002",
        code: "VCH-240115-0002",
        packageName: "Paket Hemat",
        serviceName: "Traditional Massage 60'",
        packageType: "hemat",
        buyerName: "Sarah Wijaya",
        buyerPhone: "0812-3456-7890",
        buyerInitials: "SW",
        purchaseDate: "15 Jan 2024",
        expiryDate: "22 Jan 2024",
        status: "expiring_soon",
    },
    {
        id: "V003",
        code: "VCH-240115-0003",
        packageName: "Paket Hemat",
        serviceName: "Traditional Massage 60'",
        packageType: "hemat",
        buyerName: "Sarah Wijaya",
        buyerPhone: "0812-3456-7890",
        buyerInitials: "SW",
        purchaseDate: "15 Jan 2024",
        expiryDate: "15 Apr 2024",
        status: "used",
        usedBy: "Rina (teman)",
        usedDate: "20 Jan 2024",
    },
    {
        id: "V004",
        code: "VCH-240120-0010",
        packageName: "Paket Premium",
        serviceName: "Aromatherapy 90'",
        packageType: "premium",
        buyerName: "Budi Santoso",
        buyerPhone: "0812-9876-5432",
        buyerInitials: "BS",
        buyerAvatarColor: "#dbeafe",
        purchaseDate: "20 Jan 2024",
        expiryDate: "20 Jul 2024",
        status: "active",
    },
    {
        id: "V005",
        code: "VCH-240110-0005",
        packageName: "Paket Signature",
        serviceName: "Signature Green Spa 120'",
        packageType: "signature",
        buyerName: "Rina Kusuma",
        buyerPhone: "0813-5554-4433",
        buyerInitials: "RK",
        buyerAvatarColor: "#ede9fe",
        purchaseDate: "10 Jan 2024",
        expiryDate: "10 Apr 2024",
        status: "used",
        usedBy: "Rina Kusuma",
        usedDate: "25 Jan 2024",
    },
    {
        id: "V006",
        code: "VCH-240205-0001",
        packageName: "Paket VIP",
        serviceName: "Traditional Massage 60'",
        packageType: "vip",
        buyerName: "Diana Hartono",
        buyerPhone: "0812-6667-7788",
        buyerInitials: "DH",
        buyerAvatarColor: "#ffedd5",
        purchaseDate: "05 Feb 2024",
        expiryDate: "05 Feb 2025",
        status: "active",
    },
    {
        id: "V007",
        code: "VCH-231101-0008",
        packageName: "Paket Hemat",
        serviceName: "Traditional Massage 60'",
        packageType: "hemat",
        buyerName: "Andi Prasetyo",
        buyerPhone: "0813-7778-8899",
        buyerInitials: "AP",
        buyerAvatarColor: "#fee2e2",
        purchaseDate: "01 Nov 2023",
        expiryDate: "01 Feb 2024",
        status: "expired",
    },
];

export default function VouchersPage() {
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    const handleOpenDetailModal = (voucher: Voucher) => {
        setSelectedVoucher(voucher);
        setShowDetailModal(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You could add a toast notification here
    };

    const getPackageIcon = (type: string) => {
        switch (type) {
            case "hemat":
                return "fa-solid fa-tag";
            case "premium":
                return "fa-solid fa-crown";
            case "vip":
                return "fa-solid fa-gem";
            case "signature":
                return "fa-solid fa-star";
            default:
                return "fa-solid fa-ticket";
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Voucher Terjual</h1>
                    <p className="page-subtitle">Daftar semua voucher individual yang sudah diterbitkan</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-secondary">
                        <i className="fa-solid fa-file-export"></i>
                        Export
                    </button>
                    <Link href="/dashboard/master/packages" className="btn btn-primary">
                        <i className="fa-solid fa-box"></i>
                        Master Paket
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-ticket"></i>
                    </div>
                    <div className="stat-value">284</div>
                    <div className="stat-label">Voucher Aktif</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-check-circle"></i>
                    </div>
                    <div className="stat-value">156</div>
                    <div className="stat-label">Voucher Terpakai</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-clock"></i>
                    </div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">Expired Segera (7 hari)</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red">
                        <i className="fa-solid fa-times-circle"></i>
                    </div>
                    <div className="stat-value">23</div>
                    <div className="stat-label">Voucher Expired</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Voucher</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Cari kode voucher..." />
                        </div>
                        <select className="filter-select">
                            <option value="">Semua Paket</option>
                            <option value="hemat">Paket Hemat Traditional</option>
                            <option value="premium">Paket Premium Aroma</option>
                            <option value="vip">Paket VIP Traditional</option>
                            <option value="signature">Paket Signature</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="used">Terpakai</option>
                            <option value="expired">Expired</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Semua Member</option>
                            <option value="sarah">Sarah Wijaya</option>
                            <option value="budi">Budi Santoso</option>
                            <option value="rina">Rina Kusuma</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Kode Voucher</th>
                                <th>Paket / Layanan</th>
                                <th>Pembeli</th>
                                <th>Tgl Beli</th>
                                <th>Expired</th>
                                <th>Status</th>
                                <th>Dipakai Oleh</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyVouchers.map((voucher) => (
                                <tr key={voucher.id}>
                                    <td>
                                        <div className="voucher-code" style={{ opacity: voucher.status === "expired" || voucher.status === "used" ? 0.5 : 1 }}>
                                            {voucher.code}
                                            <i
                                                className="fa-regular fa-copy"
                                                title="Copy"
                                                onClick={() => copyToClipboard(voucher.code)}
                                            ></i>
                                        </div>
                                    </td>
                                    <td>
                                        <div
                                            className={`package-tag ${voucher.packageType}`}
                                            style={{ opacity: voucher.status === "expired" || voucher.status === "used" ? 0.7 : 1 }}
                                        >
                                            <i className={getPackageIcon(voucher.packageType)}></i>
                                            {voucher.packageName}
                                        </div>
                                        <div
                                            className="service-name"
                                            style={{ opacity: voucher.status === "expired" ? 0.5 : 1 }}
                                        >
                                            {voucher.serviceName}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="buyer-info" style={{ opacity: voucher.status === "expired" ? 0.7 : 1 }}>
                                            <div
                                                className="buyer-avatar"
                                                style={{
                                                    background: voucher.buyerAvatarColor || "var(--spa-green-bg)",
                                                    color: voucher.buyerAvatarColor ? "var(--text-primary)" : "var(--spa-green)", // Simplified color logic
                                                }}
                                            >
                                                {voucher.buyerInitials}
                                            </div>
                                            <div>
                                                <div className="buyer-name">{voucher.buyerName}</div>
                                                <div className="buyer-phone">{voucher.buyerPhone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="date-info" style={{ opacity: voucher.status === "expired" ? 0.7 : 1 }}>
                                            {voucher.purchaseDate}
                                        </span>
                                    </td>
                                    <td>
                                        <span
                                            className={`date-info ${voucher.status === "expired"
                                                    ? "expired"
                                                    : voucher.status === "expiring_soon"
                                                        ? "soon"
                                                        : ""
                                                }`}
                                        >
                                            {voucher.expiryDate}
                                        </span>
                                    </td>
                                    <td>
                                        {voucher.status === "active" && (
                                            <span className="badge badge-green">
                                                <i className="fa-solid fa-circle" style={{ fontSize: "6px" }}></i> Aktif
                                            </span>
                                        )}
                                        {voucher.status === "expiring_soon" && (
                                            <span className="badge badge-yellow">
                                                <i className="fa-solid fa-clock" style={{ fontSize: "10px" }}></i> Segera Exp
                                            </span>
                                        )}
                                        {voucher.status === "used" && (
                                            <span className="badge badge-blue">
                                                <i className="fa-solid fa-check" style={{ fontSize: "10px" }}></i> Terpakai
                                            </span>
                                        )}
                                        {voucher.status === "expired" && (
                                            <span className="badge badge-red">
                                                <i className="fa-solid fa-times" style={{ fontSize: "10px" }}></i> Expired
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {voucher.status === "used" ? (
                                            <div className="used-info">
                                                <div className="used-by">{voucher.usedBy}</div>
                                                <div className="used-date">{voucher.usedDate}</div>
                                            </div>
                                        ) : (
                                            <span style={{ color: "var(--text-muted)" }}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action"
                                                title="Detail"
                                                onClick={() => handleOpenDetailModal(voucher)}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                            {voucher.status !== "expired" && voucher.status !== "used" && (
                                                <button className="btn-action print" title="Print">
                                                    <i className="fa-solid fa-print"></i>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <div className="table-info">Menampilkan 1-7 dari 463 voucher</div>
                    <div className="pagination">
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <button className="page-btn">...</button>
                        <button className="page-btn">67</button>
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedVoucher && (
                <div className={`modal-overlay ${showDetailModal ? "show" : ""}`}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Voucher</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="voucher-detail-card">
                                <div className="voucher-detail-code">{selectedVoucher.code}</div>
                                <div className="voucher-detail-package">
                                    {selectedVoucher.packageName} ({selectedVoucher.packageType})
                                </div>
                                <div className="voucher-detail-service">
                                    <i className="fa-solid fa-spa"></i> {selectedVoucher.serviceName}
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Informasi Pembelian</div>
                                <div className="detail-row">
                                    <span className="detail-label">Pembeli</span>
                                    <span className="detail-value">{selectedVoucher.buyerName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">No. Telepon</span>
                                    <span className="detail-value">{selectedVoucher.buyerPhone}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tanggal Beli</span>
                                    <span className="detail-value">{selectedVoucher.purchaseDate}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tanggal Expired</span>
                                    <span className="detail-value">{selectedVoucher.expiryDate}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Status</span>
                                    <span className="detail-value">
                                        {selectedVoucher.status === "active" && <span className="badge badge-green">Aktif</span>}
                                        {selectedVoucher.status === "expiring_soon" && <span className="badge badge-yellow">Segera Exp</span>}
                                        {selectedVoucher.status === "used" && <span className="badge badge-blue">Terpakai</span>}
                                        {selectedVoucher.status === "expired" && <span className="badge badge-red">Expired</span>}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-section-title">Informasi Penggunaan</div>
                                <div className="detail-row">
                                    <span className="detail-label">Dipakai Oleh</span>
                                    <span
                                        className="detail-value"
                                        style={{ color: selectedVoucher.usedBy ? "var(--text-primary)" : "var(--text-muted)" }}
                                    >
                                        {selectedVoucher.usedBy || "Belum digunakan"}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tanggal Pakai</span>
                                    <span
                                        className="detail-value"
                                        style={{ color: selectedVoucher.usedDate ? "var(--text-primary)" : "var(--text-muted)" }}
                                    >
                                        {selectedVoucher.usedDate || "-"}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Therapist</span>
                                    <span className="detail-value" style={{ color: "var(--text-muted)" }}>
                                        -
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                                Tutup
                            </button>
                            <button className="btn btn-primary">
                                <i className="fa-solid fa-print"></i>
                                Print Voucher
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
