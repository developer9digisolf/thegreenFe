"use client";

import { useState } from "react";
import Link from "next/link";

interface Member {
    id: string;
    name: string;
    phone: string;
    email: string;
    joinDate: string;
    voucherBalance: number;
    totalVisits: number;
    status: "active" | "inactive" | "expiring";
    initials: string;
    avatarColor: string;
    birthDate?: string;
    gender?: "F" | "M";
    address?: string;
    avoidAreas?: string[];
    vouchers?: { name: string; remaining: number; expiry: string }[];
    favoriteTherapist?: string;
}

const dummyMembers: Member[] = [
    {
        id: "M001",
        name: "Sarah Wijaya",
        phone: "081234567890",
        email: "sarah.wijaya@email.com",
        joinDate: "15 Jan 2024",
        voucherBalance: 8,
        totalVisits: 24,
        status: "active",
        initials: "SW",
        avatarColor: "var(--spa-green-bg)", // Using CSS var from global/layout
        birthDate: "12 Mei 1990",
        gender: "F",
        address: "Jl. Sudirman No. 10, Jakarta",
        avoidAreas: ["Leher", "Pinggang Bawah", "Lutut Kiri"],
        vouchers: [
            { name: "Paket Hemat", remaining: 5, expiry: "15 Jun 2025" },
            { name: "Paket Signature", remaining: 3, expiry: "20 Mar 2025" },
        ],
        favoriteTherapist: "Maya Putri",
    },
    {
        id: "M002",
        name: "Budi Santoso",
        phone: "081298765432",
        email: "budi.s@email.com",
        joinDate: "22 Feb 2024",
        voucherBalance: 10,
        totalVisits: 18,
        status: "active",
        initials: "BS",
        avatarColor: "var(--accent-blue-light)",
    },
    {
        id: "M003",
        name: "Rina Kusuma",
        phone: "081355544433",
        email: "rina.k@email.com",
        joinDate: "10 Mar 2024",
        voucherBalance: 0,
        totalVisits: 12,
        status: "active",
        initials: "RK",
        avatarColor: "var(--accent-purple-light)",
    },
    {
        id: "M004",
        name: "Diana Hartono",
        phone: "081266677788",
        email: "diana.h@email.com",
        joinDate: "05 Apr 2024",
        voucherBalance: 3,
        totalVisits: 8,
        status: "expiring",
        initials: "DH",
        avatarColor: "var(--accent-yellow-light)",
    },
    {
        id: "M005",
        name: "Andi Prasetyo",
        phone: "081377788899",
        email: "andi.p@email.com",
        joinDate: "18 Dec 2023",
        voucherBalance: 0,
        totalVisits: 32,
        status: "inactive",
        initials: "AP",
        avatarColor: "var(--accent-red-light)",
    },
];

export default function MasterMember() {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);

    const handleOpenViewModal = (member: Member) => {
        setSelectedMember(member);
        setShowViewModal(true);
    };

    const handleOpenEditModal = (member: Member) => {
        // In a real app, populate the form with member data
        setSelectedMember(member);
        setShowAddModal(true);
    };

    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Member</h1>
                    <p className="page-subtitle">Kelola data member The Green Spa</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                    <i className="fa-solid fa-plus"></i>
                    Tambah Member
                </button>
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-mini">
                    <div className="stat-mini-value">1,248</div>
                    <div className="stat-mini-label">Total Member</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-value">847</div>
                    <div className="stat-mini-label">Member Aktif</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-value">156</div>
                    <div className="stat-mini-label">Punya Voucher</div>
                </div>
                <div className="stat-mini">
                    <div className="stat-mini-value">+42</div>
                    <div className="stat-mini-label">Bulan Ini</div>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Daftar Member</h3>
                    <div className="filters">
                        <div className="search-box">
                            <i className="fa-solid fa-magnifying-glass"></i>
                            <input type="text" placeholder="Cari nama atau telepon..." />
                        </div>
                        <select className="filter-select">
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                        </select>
                        <select className="filter-select">
                            <option value="">Semua Voucher</option>
                            <option value="has">Punya Voucher</option>
                            <option value="no">Tidak Punya</option>
                        </select>
                    </div>
                </div>
                <div className="card-body">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Tanggal Bergabung</th>
                                <th>Sisa Voucher</th>
                                <th>Total Kunjungan</th>
                                <th>Status</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dummyMembers.map((member) => (
                                <tr key={member.id}>
                                    <td>
                                        <div className="member-info">
                                            <div
                                                className="member-avatar"
                                                style={{
                                                    background: member.avatarColor,
                                                    color:
                                                        member.avatarColor === "var(--accent-blue-light)"
                                                            ? "var(--accent-blue)"
                                                            : member.avatarColor === "var(--accent-purple-light)"
                                                                ? "var(--accent-purple)"
                                                                : member.avatarColor === "var(--accent-yellow-light)"
                                                                    ? "var(--accent-yellow)"
                                                                    : member.avatarColor === "var(--accent-red-light)"
                                                                        ? "var(--accent-red)"
                                                                        : "var(--spa-green)",
                                                }}
                                            >
                                                {member.initials}
                                            </div>
                                            <div>
                                                <div className="member-name">{member.name}</div>
                                                <div className="member-phone">{member.phone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{member.joinDate}</td>
                                    <td>
                                        <div
                                            className="voucher-count"
                                            style={{
                                                color: member.voucherBalance === 0 ? "var(--text-muted)" : "var(--spa-green)",
                                            }}
                                        >
                                            {member.voucherBalance}
                                        </div>
                                        <div className="voucher-label">sesi tersisa</div>
                                    </td>
                                    <td>
                                        <strong>{member.totalVisits}</strong> kunjungan
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${member.status === "active"
                                                    ? "badge-green"
                                                    : member.status === "expiring"
                                                        ? "badge-yellow"
                                                        : "badge-red"
                                                }`}
                                        >
                                            {member.status === "active"
                                                ? "Aktif"
                                                : member.status === "expiring"
                                                    ? "Hampir Expired"
                                                    : "Tidak Aktif"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action"
                                                title="Lihat Detail"
                                                onClick={() => handleOpenViewModal(member)}
                                            >
                                                <i className="fa-solid fa-eye"></i>
                                            </button>
                                            <button
                                                className="btn-action"
                                                title="Edit"
                                                onClick={() => handleOpenEditModal(member)}
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
                    <div className="table-info">Menampilkan 1-5 dari 1,248 member</div>
                    <div className="pagination">
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-left"></i>
                        </button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <button className="page-btn">...</button>
                        <button className="page-btn">250</button>
                        <button className="page-btn">
                            <i className="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <div className={`modal-overlay ${showAddModal ? "show" : ""}`}>
                <div className="modal">
                    <div className="modal-header">
                        <h3 className="modal-title">
                            {selectedMember ? "Edit Member" : "Tambah Member Baru"}
                        </h3>
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>
                            &times;
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Nama Lengkap *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Masukkan nama lengkap"
                                    defaultValue={selectedMember?.name}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">No. Telepon *</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    placeholder="08xxxxxxxxxx"
                                    defaultValue={selectedMember?.phone}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                placeholder="email@example.com"
                                defaultValue={selectedMember?.email}
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Tanggal Lahir</label>
                                <input type="date" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Jenis Kelamin</label>
                                <select className="form-select" defaultValue={selectedMember?.gender || ""}>
                                    <option value="">Pilih</option>
                                    <option value="F">Perempuan</option>
                                    <option value="M">Laki-laki</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Alamat</label>
                            <textarea
                                className="form-textarea"
                                rows={3}
                                placeholder="Masukkan alamat lengkap"
                                defaultValue={selectedMember?.address}
                            ></textarea>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Area Hindari Pijat</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Contoh: Leher, Pinggang Bawah"
                                defaultValue={selectedMember?.avoidAreas?.join(", ")}
                            />
                            <div className="form-hint">
                                Pisahkan dengan koma jika lebih dari satu area
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setShowAddModal(false);
                                setSelectedMember(null);
                            }}
                        >
                            Batal
                        </button>
                        <button className="btn btn-primary">
                            <i className="fa-solid fa-check"></i>
                            Simpan Member
                        </button>
                    </div>
                </div>
            </div>

            {/* View Member Detail Modal */}
            {selectedMember && (
                <div className={`modal-overlay ${showViewModal ? "show" : ""}`}>
                    <div className="modal" style={{ maxWidth: "640px" }}>
                        <div className="modal-header" style={{ background: "var(--spa-green-bg)" }}>
                            <h3 className="modal-title">Detail Member</h3>
                            <button className="modal-close" onClick={() => setShowViewModal(false)}>
                                &times;
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* Member Card */}
                            <div
                                style={{
                                    background: "var(--gradient-spa)",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    color: "white",
                                    marginBottom: "24px",
                                }}
                            >
                                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                                    <div
                                        style={{
                                            width: "64px",
                                            height: "64px",
                                            background: "rgba(255,255,255,0.25)",
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "24px",
                                            fontWeight: 800,
                                        }}
                                    >
                                        {selectedMember.initials}
                                    </div>
                                    <div>
                                        <h4
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 700,
                                                marginBottom: "4px",
                                            }}
                                        >
                                            {selectedMember.name}
                                        </h4>
                                        <p style={{ opacity: 0.9, display: "flex", alignItems: "center", gap: "6px" }}>
                                            <i className="fa-solid fa-phone"></i> {selectedMember.phone}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            borderRadius: "12px",
                                            padding: "14px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div style={{ fontSize: "28px", fontWeight: 800 }}>{selectedMember.voucherBalance}</div>
                                        <div style={{ fontSize: "11px", textTransform: "uppercase", opacity: 0.85 }}>Sisa Voucher</div>
                                    </div>
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            borderRadius: "12px",
                                            padding: "14px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div style={{ fontSize: "28px", fontWeight: 800 }}>{selectedMember.totalVisits}</div>
                                        <div style={{ fontSize: "11px", textTransform: "uppercase", opacity: 0.85 }}>Kunjungan</div>
                                    </div>
                                    <div
                                        style={{
                                            background: "rgba(255,255,255,0.2)",
                                            borderRadius: "12px",
                                            padding: "14px",
                                            textAlign: "center",
                                        }}
                                    >
                                        <div style={{ fontSize: "28px", fontWeight: 800 }}>1</div>
                                        <div style={{ fontSize: "11px", textTransform: "uppercase", opacity: 0.85 }}>Tahun</div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr",
                                    gap: "16px",
                                    marginBottom: "24px",
                                }}
                            >
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Email</div>
                                    <div style={{ fontWeight: 600 }}>{selectedMember.email}</div>
                                </div>
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                        Tanggal Bergabung
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{selectedMember.joinDate}</div>
                                </div>
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                        Jenis Kelamin
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{selectedMember.gender === "F" ? "Perempuan" : "Laki-laki"}</div>
                                </div>
                                <div style={{ background: "var(--bg-main)", borderRadius: "12px", padding: "16px" }}>
                                    <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                                        Tanggal Lahir
                                    </div>
                                    <div style={{ fontWeight: 600 }}>{selectedMember.birthDate}</div>
                                </div>
                            </div>

                            {/* Body Preference Section */}
                            {selectedMember.avoidAreas && selectedMember.avoidAreas.length > 0 && (
                                <div
                                    style={{
                                        background: "var(--accent-red-light)",
                                        border: "1px solid #fecaca",
                                        borderRadius: "12px",
                                        padding: "16px",
                                        marginBottom: "24px",
                                    }}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                        <i className="fa-solid fa-circle-exclamation" style={{ color: "var(--accent-red)" }}></i>
                                        <span
                                            style={{
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                color: "var(--accent-red)",
                                                textTransform: "uppercase",
                                                letterSpacing: "0.5px",
                                            }}
                                        >
                                            Area Hindari Pijat
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {selectedMember.avoidAreas.map((area, idx) => (
                                            <span
                                                key={idx}
                                                style={{
                                                    background: "white",
                                                    color: "var(--accent-red)",
                                                    padding: "8px 14px",
                                                    borderRadius: "20px",
                                                    fontSize: "13px",
                                                    fontWeight: 600,
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                }}
                                            >
                                                <i className="fa-solid fa-xmark"></i> {area}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Active Vouchers */}
                            {selectedMember.vouchers && selectedMember.vouchers.length > 0 && (
                                <div style={{ marginBottom: "24px" }}>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            marginBottom: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <i className="fa-solid fa-ticket" style={{ color: "var(--spa-green)" }}></i>
                                        Voucher Aktif
                                    </div>
                                    {selectedMember.vouchers.map((voucher, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                background: "var(--bg-main)",
                                                borderRadius: "12px",
                                                padding: "16px",
                                                marginBottom: "10px",
                                                border: "1px solid var(--border-color)",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: "flex",
                                                    justifyContent: "space-between",
                                                    alignItems: "center",
                                                    marginBottom: "6px",
                                                }}
                                            >
                                                <span style={{ fontWeight: 700 }}>{voucher.name}</span>
                                                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--spa-green)" }}>
                                                    {voucher.remaining} sesi
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Exp: {voucher.expiry}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Favorite Therapist */}
                            {selectedMember.favoriteTherapist && (
                                <div>
                                    <div
                                        style={{
                                            fontSize: "13px",
                                            fontWeight: 700,
                                            color: "var(--text-muted)",
                                            textTransform: "uppercase",
                                            letterSpacing: "0.5px",
                                            marginBottom: "12px",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        <i className="fa-solid fa-heart" style={{ color: "var(--accent-red)" }}></i>
                                        Therapist Favorit
                                    </div>
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            alignItems: "center",
                                            gap: "8px",
                                            background: "var(--accent-yellow-light)",
                                            padding: "10px 16px",
                                            borderRadius: "20px",
                                            border: "1px solid rgba(234, 179, 8, 0.3)",
                                        }}
                                    >
                                        <i className="fa-solid fa-star" style={{ color: "var(--accent-yellow)" }}></i>
                                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#a16207" }}>
                                            {selectedMember.favoriteTherapist}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedMember(null);
                                }}
                            >
                                Tutup
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    setShowViewModal(false);
                                    setShowAddModal(true); // Switch to edit mode
                                }}
                            >
                                <i className="fa-solid fa-pen"></i>
                                Edit Member
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
