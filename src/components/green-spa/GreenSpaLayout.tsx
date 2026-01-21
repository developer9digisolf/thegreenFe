"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeProvider, classicTheme } from "@doar/shared/styled";
import "../../app/dashboard/green-spa.css"; // Import the CSS

export default function GreenSpaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Auto-collapse on POS page
    useEffect(() => {
        if (pathname === "/dashboard/pos") {
            setIsCollapsed(true);
        }
    }, [pathname]);

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") return "active";
        if (path !== "/dashboard" && pathname.startsWith(path)) return "active";
        return "";
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <ThemeProvider theme={classicTheme}>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
            />
            <div className={`app-container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
                {/* Sidebar */}
                <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
                    <div className="sidebar-header">
                        <Link href="/dashboard" className="sidebar-logo">
                            <div className="sidebar-logo-icon">
                                <i className="fa-solid fa-spa" style={{ color: "white" }}></i>
                            </div>
                            {!isCollapsed && (
                                <div className="sidebar-logo-text">
                                    The <span>Green</span> Spa
                                </div>
                            )}
                        </Link>
                    </div>

                    <nav className="sidebar-nav">
                        <div className="nav-section">
                            {!isCollapsed && <div className="nav-section-title">Menu Utama</div>}
                            <Link
                                href="/dashboard"
                                className={`nav-item ${isActive("/dashboard")}`}
                                title="Dashboard"
                            >
                                <i className="fa-solid fa-grid-2"></i>
                                {!isCollapsed && <span className="nav-item-text">Dashboard</span>}
                            </Link>
                            <Link
                                href="/pos"
                                className={`nav-item ${isActive("/pos")}`}
                                title="Point of Sale"
                            >
                                <i className="fa-solid fa-cash-register"></i>
                                {!isCollapsed && (
                                    <>
                                        <span className="nav-item-text">Point of Sale</span>
                                        <span className="nav-item-badge">POS</span>
                                    </>
                                )}
                            </Link>
                        </div>

                        <div className="nav-section">
                            {!isCollapsed && <div className="nav-section-title">Master Data</div>}
                            <Link
                                href="/dashboard/master/members"
                                className={`nav-item ${isActive("/dashboard/master/members")}`}
                                title="Member"
                            >
                                <i className="fa-solid fa-users"></i>
                                {!isCollapsed && <span className="nav-item-text">Member</span>}
                            </Link>
                            <Link
                                href="/dashboard/master/service-categories"
                                className={`nav-item ${isActive("/dashboard/master/service-categories")}`}
                                title="Kategori Layanan"
                            >
                                <i className="fa-solid fa-list-check"></i>
                                {!isCollapsed && <span className="nav-item-text">Kategori Layanan</span>}
                            </Link>
                            <Link
                                href="/dashboard/master/services"
                                className={`nav-item ${isActive("/dashboard/master/services")}`}
                                title="Layanan"
                            >
                                <i className="fa-solid fa-hand-sparkles"></i>
                                {!isCollapsed && <span className="nav-item-text">Layanan</span>}
                            </Link>
                            <Link
                                href="/dashboard/master/therapists"
                                className={`nav-item ${isActive("/dashboard/master/therapists")}`}
                                title="Therapist"
                            >
                                <i className="fa-solid fa-user-nurse"></i>
                                {!isCollapsed && <span className="nav-item-text">Therapist</span>}
                            </Link>
                            <Link
                                href="/dashboard/master/packages"
                                className={`nav-item ${isActive("/dashboard/master/packages")}`}
                                title="Paket Voucher"
                            >
                                <i className="fa-solid fa-ticket"></i>
                                {!isCollapsed && <span className="nav-item-text">Paket Voucher</span>}
                            </Link>
                            <Link
                                href="/dashboard/vouchers"
                                className={`nav-item ${isActive("/dashboard/vouchers")}`}
                                title="Voucher Terjual"
                            >
                                <i className="fa-solid fa-tags"></i>
                                {!isCollapsed && <span className="nav-item-text">Voucher Terjual</span>}
                            </Link>
                            <Link
                                href="/dashboard/master/rooms"
                                className={`nav-item ${isActive("/dashboard/master/rooms")}`}
                                title="Ruangan"
                            >
                                <i className="fa-solid fa-door-open"></i>
                                {!isCollapsed && <span className="nav-item-text">Ruangan</span>}
                            </Link>
                        </div>

                        <div className="nav-section">
                            {!isCollapsed && <div className="nav-section-title">Pengaturan</div>}
                            <Link href="#" className="nav-item" title="Cabang">
                                <i className="fa-solid fa-building"></i>
                                {!isCollapsed && <span className="nav-item-text">Cabang</span>}
                            </Link>
                            <Link href="#" className="nav-item" title="Komisi">
                                <i className="fa-solid fa-percent"></i>
                                {!isCollapsed && <span className="nav-item-text">Komisi</span>}
                            </Link>
                            <Link href="#" className="nav-item" title="Shift Kerja">
                                <i className="fa-solid fa-clock"></i>
                                {!isCollapsed && <span className="nav-item-text">Shift Kerja</span>}
                            </Link>
                        </div>

                        <div className="nav-section">
                            {!isCollapsed && <div className="nav-section-title">Laporan</div>}
                            <Link href="#" className="nav-item" title="Laporan Penjualan">
                                <i className="fa-solid fa-chart-line"></i>
                                {!isCollapsed && <span className="nav-item-text">Laporan Penjualan</span>}
                            </Link>
                            <Link href="#" className="nav-item" title="Laporan Komisi">
                                <i className="fa-solid fa-file-invoice-dollar"></i>
                                {!isCollapsed && <span className="nav-item-text">Laporan Komisi</span>}
                            </Link>
                        </div>
                    </nav>

                    {/* Toggle Button */}
                    <button
                        className="sidebar-toggle"
                        onClick={toggleSidebar}
                        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        <i className={`fa-solid ${isCollapsed ? "fa-chevron-right" : "fa-chevron-left"}`}></i>
                    </button>
                </aside>

                {/* Main Content */}
                <main className={`main-content ${isCollapsed ? "expanded" : ""}`}>{children}</main>
            </div>
        </ThemeProvider>
    );
}
