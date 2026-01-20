"use client";

import { useState } from "react";
import Link from "next/link";

interface Service {
    id: string;
    name: string;
    description: string;
    category: "massage" | "therapy" | "bodycare" | "facial" | "paket";
    duration: number;
    price: number;
    status: "active" | "inactive";
}

const dummyServices: Service[] = [
    {
        id: "S001",
        name: "Traditional Massage",
        description: "Pijat tradisional untuk relaksasi otot",
        category: "massage",
        duration: 60,
        price: 150000,
        status: "active",
    },
    {
        id: "S002",
        name: "Aromatherapy Massage",
        description: "Pijat dengan minyak aromaterapi",
        category: "massage",
        duration: 90,
        price: 220000,
        status: "active",
    },
    {
        id: "S003",
        name: "Hot Stone Therapy",
        description: "Terapi dengan batu panas vulkanik",
        category: "therapy",
        duration: 90,
        price: 280000,
        status: "active",
    },
    {
        id: "S004",
        name: "Deep Tissue Massage",
        description: "Pijat dalam untuk otot tegang",
        category: "massage",
        duration: 60,
        price: 180000,
        status: "active",
    },
    {
        id: "S005",
        name: "Reflexology",
        description: "Pijat refleksi kaki dan tangan",
        category: "therapy",
        duration: 45,
        price: 120000,
        status: "active",
    },
    {
        id: "S006",
        name: "Full Body Scrub",
        description: "Lulur seluruh badan dengan bahan alami",
        category: "bodycare",
        duration: 60,
        price: 200000,
        status: "active",
    },
    {
        id: "S007",
        name: "Facial Treatment",
        description: "Perawatan wajah lengkap",
        category: "facial",
        duration: 60,
        price: 175000,
        status: "active",
    },
    {
        id: "S008",
        name: "Signature Green Spa",
        description: "Paket lengkap: massage + scrub + facial",
        category: "paket",
        duration: 120,
        price: 350000,
        status: "active",
    },
];

export default function MasterServices() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const handleOpenEditModal = (service: Service) => {
        setSelectedService(service);
        setShowAddModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getServiceIconClass = (category: string, name: string) => {
        // Helper to map category/name to icon classes based on HTML mockup
        if (name.includes("Traditional") || name.includes("Tissue")) return "massage"; // purple light
        if (name.includes("Aroma")) return "aroma"; // pink light
        if (name.includes("Stone")) return "stone"; // orange light
        if (name.includes("Reflex")) return "reflex"; // cyan light
        if (name.includes("Scrub")) return "scrub"; // green bg
        if (category === "facial") return "facial"; // pink light
        if (category === "paket") return "signature"; // gradient
        return "massage";
    };

    const getServiceIcon = (category: string, name: string) => {
        if (name.includes("Traditional") || name.includes("Tissue")) return "fa-solid fa-hand-holding-heart";
        if (name.includes("Aroma")) return "fa-solid fa-spa";
        if (name.includes("Stone")) return "fa-solid fa-gem";
        if (name.includes("Reflex")) return "fa-solid fa-shoe-prints";
        if (name.includes("Scrub")) return "fa-solid fa-droplet";
        if (category === "facial") return "fa-solid fa-face-smile";
        if (category === "paket") return "fa-solid fa-crown";
        return "fa-solid fa-hands";
    };

    const getCategoryTagClass = (category: string) => {
        return category;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "massage":
                return "fa-solid fa-hands";
            case "therapy":
                return "fa-solid fa-heart-pulse";
            case "bodycare":
                return "fa-solid fa-pump-soap";
            case "facial":
                return "fa-solid fa-face-smile";
            case "paket":
                return "fa-solid fa-gift";
            default:
                return "fa-solid fa-spa";
        }
    };

    const getCategoryLabel = (category: string) => {
        if (category === 'paket') return 'Paket';
        if (category === 'bodycare') return 'Body Care';
        // Capitalize first letter
        return category.charAt(0).toUpperCase() + category.slice(1);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Layanan</h1>
                    <p className="page-subtitle">Kelola daftar layanan spa yang tersedia</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
                    <div className="stat-value">8</div>
                    <div className="stat-label">Total Layanan</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-hand-sparkles"></i>
                    </div>
                    <div className="stat-value">5</div>
                    <div className="stat-label">Kategori Massage</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="stat-value">Traditional</div>
                    <div className="stat-label">Layanan Terlaris</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-money-bill-wave"></i>
                    </div>
                    <div className="stat-value">Rp 213K</div>
                    <div className="stat-label">Rata-rata Harga</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Layanan</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Cari layanan..." />
                        </div>
                        <select className="filter-select">
                            <option value="">Semua Kategori</option>
                            <option value="massage">Massage</option>
                            <option value="therapy">Therapy</option>
                            <option value="bodycare">Body Care</option>
                            <option value="facial">Facial</option>
                            <option value="paket">Paket</option>
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
                                <th>Layanan</th>
                                <th>Kategori</th>
                                <th>Durasi</th>
                                <th>Harga</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyServices.map((service) => (
                                <tr key={service.id}>
                                    <td>
                                        <div className="service-info">
                                            <div className={`service-icon ${getServiceIconClass(service.category, service.name)}`}>
                                                <i className={getServiceIcon(service.category, service.name)}></i>
                                            </div>
                                            <div>
                                                <div className="service-name">{service.name}</div>
                                                <div className="service-desc">{service.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`category-tag ${getCategoryTagClass(service.category)}`}>
                                            <i className={getCategoryIcon(service.category)}></i>
                                            {getCategoryLabel(service.category)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="duration-tag">
                                            <i className="fa-regular fa-clock"></i>
                                            {service.duration} menit
                                        </span>
                                    </td>
                                    <td>
                                        <span className="price-tag">{formatCurrency(service.price)}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${service.status === "active" ? "badge-green" : "badge-red"}`}>
                                            {service.status === "active" ? "Aktif" : "Nonaktif"}
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
                    <div className="table-info">Menampilkan 1-8 dari 8 layanan</div>
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
                                defaultValue={selectedService?.name}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Kategori <span className="required">*</span>
                                </label>
                                <select className="form-select" defaultValue={selectedService?.category || ""}>
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="massage">Massage</option>
                                    <option value="therapy">Therapy</option>
                                    <option value="bodycare">Body Care</option>
                                    <option value="facial">Facial</option>
                                    <option value="paket">Paket</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Durasi <span className="required">*</span>
                                </label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-input has-suffix"
                                        placeholder="60"
                                        defaultValue={selectedService?.duration}
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
                                    type="text"
                                    className="form-input has-prefix"
                                    placeholder="150.000"
                                    defaultValue={selectedService?.price}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Deskripsi</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Deskripsi singkat layanan..."
                                defaultValue={selectedService?.description}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" defaultValue={selectedService?.status || "active"}>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                            </select>
                        </div>
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
                        <button className="btn btn-primary">
                            <i className="fa-solid fa-check"></i>
                            Simpan Layanan
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
