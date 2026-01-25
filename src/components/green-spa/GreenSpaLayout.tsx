"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { ThemeProvider, classicTheme } from "@doar/shared/styled";
import { useAuth } from "@afx/contexts/AuthContext";
import { getRoleName } from "@afx/interfaces/auth.iface";
import "../../app/dashboard/green-spa.css";

export default function GreenSpaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout } = useAuth();

    // Get role name (handles both string and number)
    const roleName = user?.role !== undefined ? getRoleName(user.role) : 'User';

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

    const handleLogout = () => {
        message.success("Logout berhasil");
        logout();
    };

    const userMenuItems: MenuProps["items"] = [
        {
            key: "profile",
            label: (
                <div style={{ padding: "4px 0" }}>
                    <div style={{ fontWeight: 600 }}>{user?.username}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{user?.email || "-"}</div>
                    <div style={{ fontSize: 11, color: "#059669", marginTop: 4 }}>
                        <i className="fa-solid fa-shield-halved" style={{ marginRight: 4 }}></i>
                        {roleName}
                    </div>
                </div>
            ),
            disabled: true,
        },
        { type: "divider" },
        {
            key: "settings",
            label: "Pengaturan Akun",
            icon: <i className="fa-solid fa-gear"></i>,
        },
        {
            key: "logout",
            label: "Logout",
            icon: <i className="fa-solid fa-right-from-bracket"></i>,
            danger: true,
            onClick: handleLogout,
        },
    ];

    const getRoleColor = (role?: string | number) => {
        const name = role !== undefined ? getRoleName(role).toLowerCase() : '';
        switch (name) {
            case "owner":
                return "#7c3aed";
            case "admin":
                return "#059669";
            case "office":
                return "#0891b2";
            case "therapist":
                return "#d97706";
            case "member":
                return "#6366f1";
            default:
                return "#6b7280";
        }
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
                                href="/dashboard/master/credit-packages"
                                className={`nav-item ${isActive("/dashboard/master/credit-packages")}`}
                                title="Paket Kredit"
                            >
                                <i className="fa-solid fa-coins"></i>
                                {!isCollapsed && <span className="nav-item-text">Paket Kredit</span>}
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

                    {/* User Profile Section */}
                    <div className="sidebar-footer">
                        <Dropdown menu={{ items: userMenuItems }} placement="topRight" trigger={["click"]}>
                            <div className={`user-profile ${isCollapsed ? "collapsed" : ""}`}>
                                <div
                                    className="user-avatar"
                                    style={{ backgroundColor: getRoleColor(user?.role) }}
                                >
                                    {user?.username?.charAt(0).toUpperCase() || "U"}
                                </div>
                                {!isCollapsed && (
                                    <div className="user-info">
                                        <div className="user-name">{user?.username}</div>
                                        <div className="user-role">{roleName}</div>
                                    </div>
                                )}
                                {!isCollapsed && (
                                    <i className="fa-solid fa-chevron-up user-menu-icon"></i>
                                )}
                            </div>
                        </Dropdown>
                    </div>

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

            <style jsx global>{`
                .sidebar-footer {
                    padding: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    margin-top: auto;
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .user-profile:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .user-profile.collapsed {
                    justify-content: center;
                    padding: 10px;
                }

                .user-avatar {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .user-info {
                    flex: 1;
                    min-width: 0;
                }

                .user-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .user-role {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .user-menu-icon {
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                }

                .sidebar {
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-nav {
                    flex: 1;
                    overflow-y: auto;
                }
            `}</style>
        </ThemeProvider>
    );
}
