"use client";

import { useState } from "react";

export default function MasterRooms() {
    return (
        <>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Master Ruangan</h1>
                    <p className="page-subtitle">Kelola data ruangan spa</p>
                </div>
            </div>

            <div className="card">
                <div className="card-body" style={{ padding: "40px", textAlign: "center" }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px", color: "var(--text-muted)" }}>
                        <i className="fa-solid fa-person-digging"></i>
                    </div>
                    <h3>Fitur Sedang Dalam Pengembangan</h3>
                    <p style={{ color: "var(--text-secondary)" }}>
                        Halaman manajemen ruangan akan segera tersedia.
                    </p>
                </div>
            </div>
        </>
    );
}
