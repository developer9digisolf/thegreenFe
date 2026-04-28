"use client";

import React, { useState, useEffect } from "react";
import { Dropdown, Spin, App } from "antd";
import { ApartmentOutlined, CheckOutlined, LoadingOutlined } from "@ant-design/icons";
import { AuthSwitchCompanyService, AuthHelper } from "@afx/services/auth.service";
import { useAuth } from "@afx/contexts/AuthContext";

const CompanySwitcher = () => {
  const { message: messageApi } = App.useApp();
  const { user } = useAuth();
  const [switching, setSwitching] = useState<number | null>(null);

  // Get current company ID from user profile
  const currentCompanyId = (user as any)?.companyId;
  
  // Use companies assigned to the user from auth/me (real-time data)
  const userCompanies = (user as any)?.companies || [];
  
  // Map API fields (companyId, companyName) to internal fields (id, name)
  const companies = userCompanies.map((c: any) => ({
    id: c.companyId || c.id,
    name: c.companyName || c.name || "Unknown Company"
  }));

  const currentCompany = companies.find(c => Number(c.id) === Number(currentCompanyId)) || (companies.length > 0 ? companies[0] : null);

  const handleSwitch = async (companyId: number) => {
    if (companyId === Number(currentCompanyId)) return;
    
    setSwitching(companyId);
    const hide = messageApi.loading('Switching workspace...', 0);
    
    try {
      const response = await AuthSwitchCompanyService(companyId);
      if (response?.data) {
        // Save new auth details including the new active company context
        AuthHelper.saveAuth(response.data);
        
        messageApi.success('Workspace switched successfully');
        
        // Refresh to reload all company-specific data contexts
        window.location.reload();
      }
    } catch (error: any) {
      console.error("Failed to switch company:", error);
      messageApi.error(error?.message || 'Failed to switch workspace');
    } finally {
      setSwitching(null);
      hide();
    }
  };

  const menuItems = companies
    .filter(company => Number(company.id) !== Number(currentCompanyId))
    .map(company => ({
      key: company.id.toString(),
      label: (
        <div className="flex items-center justify-between min-w-[220px] py-1.5">
          <div className="flex items-center gap-3">
            <ApartmentOutlined className="text-slate-400" />
            <span className="text-sm font-medium text-slate-600">
              {company.name}
            </span>
          </div>
          {switching === company.id && <LoadingOutlined className="text-emerald-500" />}
        </div>
      ),
      onClick: () => handleSwitch(Number(company.id)),
      disabled: switching !== null
    }));

  return (
    <Dropdown 
      menu={{ items: menuItems }} 
      trigger={['click']}
      placement="bottomRight"
      popupRender={(menu) => (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden min-w-[260px] animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="px-5 py-4 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Identity Control</span>
              <span className="text-xs font-bold text-slate-600">Switch Authorized Workspace</span>
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {menuItems.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No other workspaces</span>
              </div>
            ) : (
              React.cloneElement(menu as React.ReactElement)
            )}
          </div>
        </div>
      )}
    >
      <div className="flex items-center gap-3 py-2 px-4 rounded-2xl cursor-pointer transition-all border border-slate-100 bg-white hover:bg-emerald-50 hover:border-emerald-100 hover:shadow-lg hover:shadow-emerald-500/5 group">
        <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-all shadow-inner">
          <ApartmentOutlined className="text-lg" />
        </div>
        <div className="hidden lg:flex flex-col">
          <span className="text-[9px] text-slate-400 font-black uppercase tracking-[0.1em] leading-none mb-1.5 opacity-70">Current Workspace</span>
          <span className="text-[13px] font-black text-slate-800 leading-none truncate max-w-[140px] tracking-tight">
            {currentCompany?.name || "Select Workspace"}
          </span>
        </div>
        <DownOutlined className="text-[10px] text-slate-300 ml-1 group-hover:text-emerald-500 group-hover:translate-y-0.5 transition-all" />
      </div>
    </Dropdown>
  );
};

const DownOutlined = ({ className }: { className?: string }) => (
  <svg className={className} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

export default CompanySwitcher;
