"use client";

import React, { useState, useEffect, useRef } from "react";
import { ThemeProvider, classicTheme } from "@doar/shared/styled";
import { Dropdown, Tooltip } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@afx/contexts/AuthContext";
import { getRoleName } from "@afx/interfaces/auth.iface";
import { 
  SearchOutlined, 
  BellOutlined, 
  MoonOutlined, 
  DownOutlined,
  RightOutlined,
  MenuOutlined,
  CloseOutlined
} from "@ant-design/icons";
import "../../app/dashboard/green-spa.css";

// Define interfaces for menu configuration
interface SubMenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
}

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  roles: string[];
  path?: string;
  badge?: string;
  subItems?: SubMenuItem[];
}

interface MenuSection {
  section: string;
  items: MenuItem[];
}

// Define menu items with role permissions and subitems
const menuConfig: MenuSection[] = [
  {
    section: "MAIN MENU",
    items: [
      { key: "dashboard", label: "Dashboard", icon: "fa-solid fa-gauge-high", path: "/dashboard", roles: ["Owner", "Admin", "Office"] },
      { key: "pos", label: "Point of Sale", badge: "POS", icon: "fa-solid fa-cash-register", path: "/dashboard/pos", roles: ["Owner", "Admin"] },
      { key: "kiosk", label: "Kiosk Check-in", icon: "fa-solid fa-qrcode", path: "/dashboard/kiosk", roles: ["Owner", "Admin"] },
    ]
  },
  {
    section: "TRANSACTIONS",
    items: [
      { key: "sales", label: "Penjualan", icon: "fa-solid fa-file-invoice-dollar", path: "/dashboard/transactions/sales", roles: ["Owner", "Office"] },
      { key: "bookings", label: "Booking & Sesi", icon: "fa-solid fa-calendar-days", path: "/dashboard/transactions/bookings", roles: ["Owner", "Admin"] },
      { key: "vouchers", label: "Voucher Terjual", icon: "fa-solid fa-ticket", path: "/dashboard/transactions/vouchers", roles: ["Owner", "Office"] },
      { key: "cashier-session", label: "Sesi Kasir", icon: "fa-solid fa-clock-rotate-left", path: "/dashboard/transactions/cashier-session", roles: ["Owner", "Admin"] },
    ]
  },
  {
    section: "SETTINGS",
    items: [
      { 
        key: "master", 
        label: "Master Data", 
        icon: "fa-solid fa-database", 
        roles: ["Owner", "Admin"],
        subItems: [
          { key: "company", label: "Perusahaan", icon: "fa-solid fa-building", path: "/dashboard/master/companies" },
          { key: "member", label: "Member", icon: "fa-solid fa-users", path: "/dashboard/master/members" },
          { key: "service-category", label: "Kategori Layanan", icon: "fa-solid fa-list-ul", path: "/dashboard/master/service-categories" },
          { key: "service", label: "Layanan", icon: "fa-solid fa-hand-holding-heart", path: "/dashboard/master/services" },
          { key: "therapist", label: "Therapist", icon: "fa-solid fa-user-doctor", path: "/dashboard/master/therapists" },
          { key: "voucher-package", label: "Paket Voucher", icon: "fa-solid fa-box-archive", path: "/dashboard/master/voucher-packages" },
          { key: "credit-package", label: "Paket Kredit", icon: "fa-solid fa-coins", path: "/dashboard/master/credit-packages" },
          { key: "room", label: "Ruangan", icon: "fa-solid fa-door-open", path: "/dashboard/master/rooms" },
        ]
      },
    ]
  }
];

export default function GreenSpaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({ master: true });
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const mobile = width <= 1024;
      
      setIsMobile(prev => {
        if (prev !== mobile) return mobile;
        return prev;
      });
      
      setIsCollapsed(prev => {
        if (mobile) return true;
        return false;
      });
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        if (isCollapsed && !isMobile) {
          setIsCollapsed(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCollapsed, isMobile]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSubMenu = (key: string) => {
    setOpenSubMenus(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter menu based on search query and user role
  const filteredMenu = menuConfig.map(section => {
    const filteredItems = section.items.filter(item => {
      const currentRoleName = getRoleName(user?.role || "Admin");
      const hasPermission = item.roles.some(r => r.toLowerCase() === currentRoleName.toLowerCase());
      if (!hasPermission) return false;

      // Search matching logic
      if (!searchQuery) return true;
      
      const matchLabel = item.label.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSubItems = item.subItems?.some(sub => 
        sub.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      return matchLabel || matchSubItems;
    }).map(item => {
      // If parent doesn't match but sub-item does, we should filter sub-items too
      if (searchQuery && item.subItems) {
        const matchingSubItems = item.subItems.filter(sub => 
          sub.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return { ...item, subItems: matchingSubItems.length > 0 ? matchingSubItems : item.subItems };
      }
      return item;
    });

    return { ...section, items: filteredItems };
  }).filter(section => section.items.length > 0);

  const userMenuItems = [
    { key: "profile", label: <Link href="/dashboard/profile">My Profile</Link> },
    { key: "settings", label: <Link href="/dashboard/settings">Settings</Link> },
    { type: "divider" as const },
    { key: "logout", label: "Logout", onClick: logout, danger: true },
  ];

  const userRole = user?.role || "Cashier";
  const roleLabel = getRoleName(userRole);

  return (
    <ThemeProvider theme={classicTheme}>
      <div className={`flex min-h-screen bg-slate-100 font-sans ${!isCollapsed && isMobile ? "overflow-hidden" : ""}`}>
        
        {/* Mobile Overlay */}
        {!isCollapsed && isMobile && (
          <div 
            className="fixed inset-0 bg-black/50 z-[999] transition-opacity" 
            onClick={toggleSidebar} 
          />
        )}

        {/* Sidebar */}
        <aside 
          className={`
            fixed top-0 left-0 h-screen bg-[#0D1117] transition-all duration-300 z-[1000] flex flex-col
            ${isCollapsed ? (isMobile ? "-left-[280px]" : "w-20") : "w-[280px]"}
          `}
        >
          {/* Sidebar Header */}
          <div className={`p-6 flex flex-col gap-4 ${isCollapsed && !isMobile ? "items-center px-2" : ""}`}>
            <div className="flex items-center justify-between w-full">
              <Link href="/dashboard" className="flex items-center gap-3 no-underline">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-emerald-500/30 shrink-0">
                  G
                </div>
                {(!isCollapsed || isMobile) && (
                  <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">The Green Spa</span>
                )}
              </Link>
              {isMobile && !isCollapsed && (
                <button 
                  onClick={() => setIsCollapsed(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition-all border border-white/10 cursor-pointer shrink-0 ml-2"
                >
                  <CloseOutlined className="text-lg" />
                </button>
              )}
            </div>

            {(!isCollapsed || isMobile) && (
              <div className="relative flex items-center group">
                <SearchOutlined className={`absolute left-3 transition-colors ${searchQuery ? "text-emerald-500" : "text-white/40"} text-sm`} />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  placeholder="Search menu..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-white text-sm outline-none focus:border-emerald-500 focus:bg-white/10 transition-all placeholder:text-white/20"
                />
                {searchQuery ? (
                  <CloseOutlined 
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-[10px] text-white/40 hover:text-white cursor-pointer transition-colors" 
                  />
                ) : (
                  !isMobile && (
                    <div className="absolute right-3 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white/20 font-medium hidden sm:block group-focus-within:hidden">
                      ⌘K
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 px-3 overflow-y-auto scrollbar-hide pb-4">
            {filteredMenu.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mx-auto mb-3">
                  <SearchOutlined className="text-2xl" />
                </div>
                <p className="text-white/40 text-sm font-medium m-0">No results found</p>
                <p className="text-white/20 text-[11px] mt-1 m-0">Try different keywords</p>
              </div>
            ) : filteredMenu.map((section, idx) => (
              <div key={idx} className="mb-6">
                {(!isCollapsed || isMobile) && (
                  <h4 className="text-[11px] font-bold text-white/25 mb-2 pl-3 uppercase tracking-widest">
                    {section.section}
                  </h4>
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map(item => {
                    const isActive = pathname === item.path || (item.subItems?.some(sub => pathname === sub.path));
                    const hasSubItems = !!item.subItems;
                    const isOpen = openSubMenus[item.key] || (searchQuery && hasSubItems);

                    const menuItem = (
                      <div 
                        className={`
                          flex items-center rounded-xl cursor-pointer transition-all no-underline
                          ${isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 font-semibold" : "text-white/50 hover:bg-white/5 hover:text-white"}
                          ${isCollapsed && !isMobile ? "justify-center w-12 h-12" : "gap-3 px-3 py-2.5 w-full"}
                        `}
                        onClick={() => {
                          if (hasSubItems) {
                            if (!isCollapsed || isMobile) toggleSubMenu(item.key);
                          } else if (item.path) {
                            router.push(item.path);
                          }
                        }}
                      >
                        <i className={`${item.icon} text-lg w-6 flex items-center justify-center text-center`}></i>
                        {(!isCollapsed || isMobile) && (
                          <>
                            <span className="text-sm flex-1">{item.label}</span>
                            {item.badge && <span className="bg-emerald-400/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold">{item.badge}</span>}
                            {hasSubItems && (
                              <div className="text-[10px] opacity-50">
                                {isOpen ? <DownOutlined /> : <RightOutlined />}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );

                    return (
                      <div key={item.key} className={isCollapsed && !isMobile ? "flex justify-center" : ""}>
                        {isCollapsed && !isMobile ? (
                          <Dropdown 
                            menu={{ 
                              items: hasSubItems ? item.subItems?.map(sub => ({
                                key: sub.key,
                                label: <Link href={sub.path} className="no-underline">{sub.label}</Link>,
                                icon: <i className={`${sub.icon} text-xs w-4 flex items-center justify-center`}></i>
                              })) : [] 
                            }} 
                            placement="rightTop"
                            disabled={!hasSubItems}
                          >
                            {hasSubItems ? (
                              menuItem
                            ) : (
                              <Tooltip title={item.label} placement="right">
                                {menuItem}
                              </Tooltip>
                            )}
                          </Dropdown>
                        ) : menuItem}

                        {/* Submenu */}
                        {hasSubItems && isOpen && (!isCollapsed || isMobile) && (
                          <div className="ml-5 mt-1 pl-3 border-l border-white/10 flex flex-col gap-0.5">
                            {item.subItems?.map(sub => (
                              <Link 
                                key={sub.key} 
                                href={sub.path}
                                className={`
                                  flex items-center gap-3 px-3 py-2 rounded-lg text-sm no-underline transition-all
                                  ${pathname === sub.path ? "text-emerald-500 font-semibold" : "text-white/40 hover:text-white hover:bg-white/5"}
                                `}
                              >
                                <i className={`${sub.icon} text-xs w-4 flex items-center justify-center opacity-70`}></i>
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-5 border-t border-white/5">
            <div className={`flex items-center bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-all ${isCollapsed && !isMobile ? "justify-center w-12 h-12 mx-auto" : "gap-3 p-3"}`}>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                <i className="fa-solid fa-circle-question text-lg w-6 flex items-center justify-center"></i>
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-white">Help Centre</span>
                  <span className="text-[10px] text-white/40">Get support now</span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Wrapper */}
        <div 
          className={`
            flex-1 flex flex-col min-h-screen transition-all duration-300
            ${isMobile ? "ml-0" : (isCollapsed ? "ml-20" : "ml-[280px]")}
          `}
        >
          {/* Top Header */}
          <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-[90]">
            <div className="flex items-center gap-5">
              <button 
                className="w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center cursor-pointer text-slate-500 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                onClick={toggleSidebar}
              >
                <MenuOutlined />
              </button>
              <div className="hidden md:block">
                <h1 className="text-2xl font-extrabold text-slate-900 m-0 tracking-tight leading-none">Hello, {user?.username || "Admin"}!</h1>
                <p className="text-sm text-slate-500 m-0 mt-1">Welcome back to The Green Spa Management System</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg text-slate-500 cursor-pointer hover:bg-slate-200 hover:text-slate-900 transition-all">
                  <MoonOutlined />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-lg text-slate-500 cursor-pointer hover:bg-slate-200 hover:text-slate-900 transition-all relative">
                  <BellOutlined />
                  <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></div>
                </div>
              </div>

              <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
                <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl cursor-pointer transition-all border border-transparent hover:bg-emerald-50 hover:border-emerald-100 group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                    {user?.username?.charAt(0).toUpperCase() || "A"}
                  </div>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-sm font-bold text-slate-900 leading-tight">{user?.username || "Admin"}</span>
                    <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{roleLabel}</span>
                  </div>
                  <DownOutlined className="text-[10px] text-slate-400 ml-1 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Dropdown>
            </div>
          </header>

          <main className="p-8 flex-1 overflow-y-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}
