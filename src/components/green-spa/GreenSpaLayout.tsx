"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Dropdown, message } from "antd";
import type { MenuProps } from "antd";
import { ThemeProvider, classicTheme } from "@doar/shared/styled";
import { useAuth } from "@afx/contexts/AuthContext";
import { getRoleName } from "@afx/interfaces/auth.iface";
import "../../app/dashboard/green-spa.css";

// Define menu items with role permissions
interface MenuItem {
    key: string;
    path: string;
    icon: string;
    label: string;
    badge?: string;
    roles: string[]; // Which roles can see this menu
    external?: boolean; // Open in new tab
}

interface MenuSection {
    title: string;
    items: MenuItem[];
    roles: string[]; // Which roles can see this section
}

const menuConfig: MenuSection[] = [
    {
        title: "Menu Utama",
        roles: ["owner", "admin", "office"],
        items: [
            {
                key: "dashboard",
                path: "/dashboard",
                icon: "fa-grid-2",
                label: "Dashboard",
                roles: ["owner", "admin", "office"]
            },
            {
                key: "pos",
                path: "/pos",
                icon: "fa-cash-register",
                label: "Point of Sale",
                badge: "POS",
                roles: ["owner", "admin"] // Office tidak bisa akses POS
            },
            {
                key: "kiosk",
                path: "/kiosk",
                icon: "fa-qrcode",
                label: "Kiosk Check-in",
                roles: ["owner", "admin", "office"],
                external: true // Open in new tab
            }
        ]
    },
    {
        title: "Transaksi",
        roles: ["owner", "admin", "office"],
        items: [
            {
                key: "bookings",
                path: "/dashboard/bookings",
                icon: "fa-calendar-days",
                label: "Booking & Sesi",
                roles: ["owner", "admin", "office"]
            },
            {
                key: "vouchers",
                path: "/dashboard/vouchers",
                icon: "fa-tags",
                label: "Voucher Terjual",
                roles: ["owner", "admin", "office"]
            }
        ]
    },
    {
        title: "Master Data",
        roles: ["owner", "admin", "office"],
        items: [
            {
                key: "members",
                path: "/dashboard/master/members",
                icon: "fa-users",
                label: "Member",
                roles: ["owner", "admin", "office"]
            },
            {
                key: "service-categories",
                path: "/dashboard/master/service-categories",
                icon: "fa-list-check",
                label: "Kategori Layanan",
                roles: ["owner", "admin"]
            },
            {
                key: "services",
                path: "/dashboard/master/services",
                icon: "fa-hand-sparkles",
                label: "Layanan",
                roles: ["owner", "admin"]
            },
            {
                key: "therapists",
                path: "/dashboard/master/therapists",
                icon: "fa-user-nurse",
                label: "Therapist",
                roles: ["owner", "admin"]
            },
            {
                key: "packages",
                path: "/dashboard/master/packages",
                icon: "fa-ticket",
                label: "Paket Voucher",
                roles: ["owner", "admin"]
            },
            {
                key: "credit-packages",
                path: "/dashboard/master/credit-packages",
                icon: "fa-coins",
                label: "Paket Kredit",
                roles: ["owner", "admin"]
            },
            {
                key: "rooms",
                path: "/dashboard/master/rooms",
                icon: "fa-door-open",
                label: "Ruangan",
                roles: ["owner", "admin"]
            }
        ]
    },
    {
        title: "Pengaturan",
        roles: ["owner", "admin"],
        items: [
            {
                key: "branches",
                path: "#",
                icon: "fa-building",
                label: "Cabang",
                roles: ["owner"]
            },
            {
                key: "commission",
                path: "#",
                icon: "fa-percent",
                label: "Komisi",
                roles: ["owner", "admin"]
            },
            {
                key: "shifts",
                path: "#",
                icon: "fa-clock",
                label: "Shift Kerja",
                roles: ["owner", "admin"]
            }
        ]
    },
    {
        title: "Laporan",
        roles: ["owner", "admin"],
        items: [
            {
                key: "sales-report",
                path: "#",
                icon: "fa-chart-line",
                label: "Laporan Penjualan",
                roles: ["owner", "admin"]
            },
            {
                key: "commission-report",
                path: "#",
                icon: "fa-file-invoice-dollar",
                label: "Laporan Komisi",
                roles: ["owner", "admin"]
            }
        ]
    }
];

export default function GreenSpaLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();

    // Get role name (handles both string and number)
    const roleName = user?.role !== undefined ? getRoleName(user.role) : 'User';
    const roleKey = roleName.toLowerCase();

    // Redirect if not authenticated or wrong role
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        // Check if role is allowed to access admin
        const allowedRoles = ['owner', 'admin', 'office'];
        if (!allowedRoles.includes(roleKey)) {
            message.error('Anda tidak memiliki akses ke halaman ini');
            logout();
        }
    }, [isAuthenticated, roleKey, router, logout]);

    // Filter menu based on role
    const filteredMenu = menuConfig
        .filter(section => section.roles.includes(roleKey))
        .map(section => ({
            ...section,
            items: section.items.filter(item => item.roles.includes(roleKey))
        }))
        .filter(section => section.items.length > 0);

    // Auto-collapse on POS page
    useEffect(() => {
        if (pathname === "/pos") {
            setIsCollapsed(true);
        }
    }, [pathname]);

    const isActive = (path: string) => {
        if (path === "/dashboard" && pathname === "/dashboard") return "active";
        if (path !== "/dashboard" && path !== "#" && pathname.startsWith(path)) return "active";
        return "";
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        message.success("Logout berhasil");
        logout();
    };

    const handleMenuClick = (item: MenuItem, e: React.MouseEvent) => {
        if (item.external) {
            e.preventDefault();
            window.open(item.path, '_blank');
        }
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
                        {filteredMenu.map((section, sectionIndex) => (
                            <div className="nav-section" key={sectionIndex}>
                                {!isCollapsed && <div className="nav-section-title">{section.title}</div>}
                                {section.items.map((item) => (
                                    <Link
                                        key={item.key}
                                        href={item.path}
                                        className={`nav-item ${isActive(item.path)}`}
                                        title={item.label}
                                        target={item.external ? "_blank" : undefined}
                                        onClick={(e) => handleMenuClick(item, e)}
                                    >
                                        <i className={`fa-solid ${item.icon}`}></i>
                                        {!isCollapsed && (
                                            <>
                                                <span className="nav-item-text">{item.label}</span>
                                                {item.badge && <span className="nav-item-badge">{item.badge}</span>}
                                                {item.external && (
                                                    <i className="fa-solid fa-arrow-up-right-from-square nav-item-external"></i>
                                                )}
                                            </>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ))}
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

                .nav-item-external {
                    font-size: 10px;
                    margin-left: auto;
                    opacity: 0.5;
                }
            `}</style>
        </ThemeProvider>
    );
}
