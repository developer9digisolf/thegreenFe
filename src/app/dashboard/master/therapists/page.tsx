"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Therapist {
    id: string;
    name: string;
    initials: string;
    phone: string;
    gender: "female" | "male";
    joinDate?: string;
    address?: string;
    skills: ("massage" | "therapy" | "bodycare" | "facial")[];
    rating: number;
    ratingCount: number;
    sessionsMonth: number;
    commissionMonth: number;
    status: "available" | "busy" | "off" | "leave";
}

const dummyTherapists: Therapist[] = [
    {
        id: "T001",
        name: "Dewi Wulandari",
        initials: "DW",
        phone: "0812-3456-7890",
        gender: "female",
        skills: ["massage", "therapy", "bodycare"],
        rating: 4.9,
        ratingCount: 156,
        sessionsMonth: 52,
        commissionMonth: 2340000,
        status: "available",
    },
    {
        id: "T002",
        name: "Sri Astuti",
        initials: "SA",
        phone: "0813-5554-3322",
        gender: "female",
        skills: ["massage", "facial"],
        rating: 4.7,
        ratingCount: 98,
        sessionsMonth: 45,
        commissionMonth: 1890000,
        status: "busy",
    },
    {
        id: "T003",
        name: "Budi Prasetyo",
        initials: "BP",
        phone: "0815-7778-8899",
        gender: "male",
        skills: ["massage", "therapy"],
        rating: 4.8,
        ratingCount: 124,
        sessionsMonth: 48,
        commissionMonth: 2160000,
        status: "available",
    },
    {
        id: "T004",
        name: "Nia Rahmawati",
        initials: "NR",
        phone: "0817-2223-4455",
        gender: "female",
        skills: ["facial", "bodycare"],
        rating: 4.9,
        ratingCount: 87,
        sessionsMonth: 38,
        commissionMonth: 1520000,
        status: "available",
    },
    {
        id: "T005",
        name: "Yuni Susanti",
        initials: "YS",
        phone: "0818-6667-7788",
        gender: "female",
        skills: ["massage", "therapy", "bodycare", "facial"],
        rating: 4.6,
        ratingCount: 203,
        sessionsMonth: 56,
        commissionMonth: 2520000,
        status: "busy",
    },
    {
        id: "T006",
        name: "Andi Hermawan",
        initials: "AH",
        phone: "0819-3334-5566",
        gender: "male",
        skills: ["massage", "therapy"],
        rating: 4.8,
        ratingCount: 145,
        sessionsMonth: 43,
        commissionMonth: 1935000,
        status: "available",
    },
    {
        id: "T007",
        name: "Rina Nurhasanah",
        initials: "RN",
        phone: "0821-4445-6677",
        gender: "female",
        skills: ["massage"],
        rating: 4.2,
        ratingCount: 34,
        sessionsMonth: 0,
        commissionMonth: 0,
        status: "leave",
    },
    {
        id: "T008",
        name: "Lina Marlina",
        initials: "LM",
        phone: "0822-5556-7788",
        gender: "female",
        skills: ["massage", "bodycare"],
        rating: 4.9,
        ratingCount: 112,
        sessionsMonth: 60,
        commissionMonth: 2700000,
        status: "off",
    },
];

export default function MasterTherapists() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);

    const handleOpenDetailModal = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setShowDetailModal(true);
    };

    const handleOpenEditModal = (therapist: Therapist) => {
        setSelectedTherapist(therapist);
        setShowAddModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case "available":
                return "status-badge available";
            case "busy":
                return "status-badge busy";
            case "off":
                return "status-badge off";
            case "leave":
                return "status-badge leave";
            default:
                return "status-badge";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "available":
                return "Tersedia";
            case "busy":
                return "Sibuk";
            case "off":
                return "Istirahat";
            case "leave":
                return "Cuti";
            default:
                return status;
        }
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Therapist</h1>
                    <p className="page-subtitle">Kelola data therapist dan keahlian mereka</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Therapist
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-icon green">
                        <i className="fa-solid fa-user-nurse"></i>
                    </div>
                    <div className="stat-value">8</div>
                    <div className="stat-label">Total Therapist</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <div className="stat-value">5</div>
                    <div className="stat-label">Tersedia Sekarang</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <i className="fa-solid fa-star"></i>
                    </div>
                    <div className="stat-value">4.8</div>
                    <div className="stat-label">Rata-rata Rating</div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <i className="fa-solid fa-calendar-check"></i>
                    </div>
                    <div className="stat-value">342</div>
                    <div className="stat-label">Sesi Bulan Ini</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Therapist</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Cari therapist..." />
                        </div>
                        <select className="filter-select">
                            <option value="">Semua Keahlian</option>
                            <option value="massage">Massage</option>
                            <option value="therapy">Therapy</option>
                            <option value="bodycare">Body Care</option>
                            <option value="facial">Facial</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Semua Status</option>
                            <option value="available">Tersedia</option>
                            <option value="busy">Sibuk</option>
                            <option value="off">Istirahat</option>
                            <option value="leave">Cuti</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Therapist</th>
                                <th>Keahlian</th>
                                <th>Rating</th>
                                <th>Sesi</th>
                                <th>Komisi Bulan Ini</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyTherapists.map((therapist) => (
                                <tr key={therapist.id}>
                                    <td>
                                        <div className="therapist-info">
                                            <div
                                                className={`therapist-avatar ${therapist.gender}`}
                                                style={{ opacity: therapist.status === "leave" ? 0.6 : 1 }}
                                            >
                                                {therapist.initials}
                                            </div>
                                            <div>
                                                <div
                                                    className="therapist-name"
                                                    style={{ color: therapist.status === "leave" ? "var(--text-muted)" : "var(--text-primary)" }}
                                                >
                                                    {therapist.name}
                                                </div>
                                                <div className="therapist-phone">
                                                    <i className="fa-solid fa-phone"></i>
                                                    {therapist.phone}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="skill-tags">
                                            {therapist.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className={`skill-tag ${skill}`}
                                                    style={{ opacity: therapist.status === "leave" ? 0.6 : 1 }}
                                                >
                                                    {skill === "massage"
                                                        ? "Massage"
                                                        : skill === "therapy"
                                                            ? "Therapy"
                                                            : skill === "bodycare"
                                                                ? "Body Care"
                                                                : "Facial"}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="rating-display">
                                            <div className="rating-stars" style={{ opacity: therapist.status === "leave" ? 0.5 : 1 }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <i
                                                        key={i}
                                                        className={`fa-solid fa-star${i >= Math.floor(therapist.rating) ? "-half-stroke" : ""}`}
                                                        style={{
                                                            color: i >= Math.ceil(therapist.rating) ? "var(--text-muted)" : "",
                                                            display: i >= Math.ceil(therapist.rating) ? "none" : "inline-block", // Simplified star logic for dummy
                                                        }}
                                                    ></i>
                                                ))}
                                                {/* Fallback specific icons logic is complex without full component, using simple text for now if stars are complex */}
                                            </div>
                                            <span className="rating-value" style={{ opacity: therapist.status === "leave" ? 0.6 : 1 }}>
                                                {therapist.rating}
                                            </span>
                                            <span className="rating-count">({therapist.ratingCount})</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="session-info">
                                            <div
                                                className="session-total"
                                                style={{ color: therapist.status === "leave" ? "var(--text-muted)" : "var(--text-primary)" }}
                                            >
                                                {therapist.sessionsMonth}
                                            </div>
                                            <div className="session-month">bulan ini</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="commission-info">
                                            <div
                                                className="commission-total"
                                                style={{ color: therapist.status === "leave" ? "var(--text-muted)" : "var(--spa-green)" }}
                                            >
                                                {formatCurrency(therapist.commissionMonth)}
                                            </div>
                                            <div className="commission-month">bulan ini</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={getStatusBadgeClass(therapist.status)}>
                                            <span
                                                className="status-dot"
                                                style={{ animation: therapist.status === "available" || therapist.status === "busy" ? "pulse 2s infinite" : "none" }}
                                            ></span>
                                            {getStatusLabel(therapist.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action"
                                                title="Detail"
                                                onClick={() => handleOpenDetailModal(therapist)}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-action"
                                                title="Edit"
                                                onClick={() => handleOpenEditModal(therapist)}
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
                    <div className="table-info">Menampilkan 1-8 dari 8 therapist</div>
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

            {/* Add/Edit Therapist Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedTherapist ? "Edit Therapist" : "Tambah Therapist Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    Nama Lengkap <span className="required">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Nama lengkap therapist"
                                    defaultValue={selectedTherapist?.name}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Jenis Kelamin <span className="required">*</span>
                                </label>
                                <select className="form-select" defaultValue={selectedTherapist?.gender || ""}>
                                    <option value="">-- Pilih --</option>
                                    <option value="female">Perempuan</option>
                                    <option value="male">Laki-laki</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">
                                    No. Telepon <span className="required">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="0812-xxxx-xxxx"
                                    defaultValue={selectedTherapist?.phone}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tanggal Bergabung</label>
                                <input type="date" className="form-input" />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Alamat</label>
                            <textarea
                                className="form-textarea"
                                rows={2}
                                placeholder="Alamat lengkap..."
                                defaultValue={selectedTherapist?.address}
                            ></textarea>
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Keahlian <span className="required">*</span>
                            </label>
                            <div className="skill-checkboxes">
                                <label className={`skill-checkbox ${selectedTherapist?.skills.includes('massage') ? 'selected' : ''}`}>
                                    <input type="checkbox" defaultChecked={selectedTherapist?.skills.includes('massage')} />
                                    <span className="skill-checkbox-icon massage">
                                        <i className="fa-solid fa-hands"></i>
                                    </span>
                                    <span className="skill-checkbox-text">Massage</span>
                                    {selectedTherapist?.skills.includes('massage') && (
                                        <span className="skill-checkbox-check">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    )}
                                </label>
                                <label className={`skill-checkbox ${selectedTherapist?.skills.includes('therapy') ? 'selected' : ''}`}>
                                    <input type="checkbox" defaultChecked={selectedTherapist?.skills.includes('therapy')} />
                                    <span className="skill-checkbox-icon therapy">
                                        <i className="fa-solid fa-heart-pulse"></i>
                                    </span>
                                    <span className="skill-checkbox-text">Therapy</span>
                                    {selectedTherapist?.skills.includes('therapy') && (
                                        <span className="skill-checkbox-check">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    )}
                                </label>
                                <label className={`skill-checkbox ${selectedTherapist?.skills.includes('bodycare') ? 'selected' : ''}`}>
                                    <input type="checkbox" defaultChecked={selectedTherapist?.skills.includes('bodycare')} />
                                    <span className="skill-checkbox-icon bodycare">
                                        <i className="fa-solid fa-pump-soap"></i>
                                    </span>
                                    <span className="skill-checkbox-text">Body Care</span>
                                    {selectedTherapist?.skills.includes('bodycare') && (
                                        <span className="skill-checkbox-check">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    )}
                                </label>
                                <label className={`skill-checkbox ${selectedTherapist?.skills.includes('facial') ? 'selected' : ''}`}>
                                    <input type="checkbox" defaultChecked={selectedTherapist?.skills.includes('facial')} />
                                    <span className="skill-checkbox-icon facial">
                                        <i className="fa-solid fa-face-smile"></i>
                                    </span>
                                    <span className="skill-checkbox-text">Facial</span>
                                    {selectedTherapist?.skills.includes('facial') && (
                                        <span className="skill-checkbox-check">
                                            <i className="fa-solid fa-check"></i>
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select className="form-select" defaultValue={selectedTherapist?.status || "available"}>
                                <option value="available">Tersedia</option>
                                <option value="off">Istirahat</option>
                                <option value="leave">Cuti</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedTherapist(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary">
                            <i className="fa-solid fa-check"></i>
                            Simpan Therapist
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedTherapist && (
                <div className={`modal-overlay ${showDetailModal ? "show" : ""}`}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3 className="modal-title">Detail Therapist</h3>
                            <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-header">
                                <div className={`detail-avatar ${selectedTherapist.gender}`}>
                                    {selectedTherapist.initials}
                                </div>
                                <div className="detail-info">
                                    <h3>{selectedTherapist.name}</h3>
                                    <p>
                                        <i className="fa-solid fa-phone"></i> {selectedTherapist.phone}
                                    </p>
                                    <p>
                                        <i className="fa-solid fa-star" style={{ color: "var(--accent-yellow)" }}></i> {selectedTherapist.rating} ({selectedTherapist.ratingCount} reviews)
                                    </p>
                                </div>
                            </div>

                            <div className="detail-stats">
                                <div className="detail-stat">
                                    <div className="detail-stat-value">{selectedTherapist.sessionsMonth}</div>
                                    <div className="detail-stat-label">Sesi Bulan Ini</div>
                                </div>
                                <div className="detail-stat">
                                    <div className="detail-stat-value" style={{ color: "var(--spa-green)" }}>
                                        {formatCurrency(selectedTherapist.commissionMonth)}
                                    </div>
                                    <div className="detail-stat-label">Komisi Bulan Ini</div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" style={{ marginBottom: '12px' }}>Keahlian</label>
                                <div className="skill-tags" style={{ justifyContent: 'center' }}>
                                    {selectedTherapist.skills.map((skill) => (
                                        <span
                                            key={skill}
                                            className={`skill-tag ${skill}`}
                                            style={{ fontSize: '13px', padding: '6px 12px' }}
                                        >
                                            {skill === "massage"
                                                ? "Massage"
                                                : skill === "therapy"
                                                    ? "Therapy"
                                                    : skill === "bodycare"
                                                        ? "Body Care"
                                                        : "Facial"}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedTherapist(null);
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
                                Edit Therapist
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
