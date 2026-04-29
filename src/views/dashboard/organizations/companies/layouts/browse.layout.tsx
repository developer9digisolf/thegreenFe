'use client';

import { useState, useMemo } from "react";
import { 
  Button, Typography, Tag, Card, Input, Table, 
  Tooltip, Empty, Space, Badge, Avatar, 
  Dropdown, MenuProps, Breadcrumb
} from "antd";
import { 
  Search, Plus, MoreVertical, Building2, 
  Mail, Phone, MapPin, Calendar, Layers,
  ChevronRight, ExternalLink, Trash2, Edit3
} from "lucide-react";
import { IPropsCompany } from "@afx/interfaces/master/company.iface";
import {
  IActionCompany,
  IStateCompany,
} from "@afx/models/dashboard/master/companies.model";
import { useStore } from "@afx/store/core";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";
import dayjs from "dayjs";

export function BrowseCompany(props: IPropsCompany & { handleEdit: (id: number) => void }) {
  const {
    isLoading,
    state: { companies, pageInfo },
  } = useStore<IStateCompany, IActionCompany>("companies");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
    code: string;
  }>({
    open: false,
    id: null,
    code: "",
  });

  const columns = [
    {
      title: 'COMPANY IDENTITY',
      dataIndex: 'name',
      key: 'name',
      width: '35%',
      render: (text: string, record: any) => (
        <div className="flex items-center gap-4 py-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm flex-shrink-0">
            <Building2 size={22} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-800 text-[15px] tracking-tight truncate">{text}</span>
              <Tag className="m-0 bg-slate-100 text-slate-500 border-none font-black text-[9px] px-1.5 py-0 rounded-md">
                {record.code}
              </Tag>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                <Layers size={10} /> {record.children ? `${record.children.length} Subsidiaries` : 'Standalone Entity'}
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'CONTACT & LOCATION',
      key: 'contact',
      width: '30%',
      render: (_: any, record: any) => (
        <div className="flex flex-col gap-1.5 py-2">
          <div className="flex items-center gap-2 text-slate-600 group">
            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
              <Mail size={12} />
            </div>
            <span className="text-xs font-semibold truncate">{record.email || '-'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 group">
            <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
              <MapPin size={12} />
            </div>
            <span className="text-xs font-semibold truncate italic opacity-80">{record.address || '-'}</span>
          </div>
        </div>
      )
    },
    {
      title: 'ESTABLISHED',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: '15%',
      align: 'center' as const,
      render: (value: string) => (
        <div className="flex flex-col items-center gap-1">
          <Tag className="m-0 bg-blue-50 text-blue-600 border-blue-100 font-black text-[10px] px-2 rounded-lg py-0.5">
            {value ? dayjs(value).format("MMM YYYY") : "-"}
          </Tag>
          <span className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">Creation Date</span>
        </div>
      )
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: '10%',
      align: 'center' as const,
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            key: "detail",
            label: <span className="font-bold text-xs">View Identity</span>,
            icon: <ExternalLink size={14} />,
            onClick: () => props?.handleToDetail(record?.id),
          },
          {
            key: "edit",
            label: <span className="font-bold text-xs text-emerald-600">Modify Authority</span>,
            icon: <Edit3 size={14} className="text-emerald-500" />,
            onClick: () => props?.handleEdit(record?.id),
          },
          { type: "divider" },
          {
            key: "delete",
            label: <span className="font-bold text-xs">Terminate Entity</span>,
            icon: <Trash2 size={14} />,
            danger: true,
            onClick: () => setDeleteModal({
              open: true,
              id: record?.id,
              code: record?.code || record?.name,
            }),
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              icon={<MoreVertical size={18} className="text-slate-400 hover:text-slate-900" />}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 transition-all"
            />
          </Dropdown>
        );
      },
    },
  ];

  const handleDeleteConfirm = () => {
    if (deleteModal.id) {
      props?.handleDelete(deleteModal.id);
      setDeleteModal({ open: false, id: null, code: "" });
    }
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <Breadcrumb 
            items={[
              { title: <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Master Control</span> },
              { title: <span className="text-slate-900 font-black text-[10px] uppercase tracking-widest">Organizational Map</span> }
            ]}
          />
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-[24px] bg-emerald-600 text-white flex items-center justify-center shadow-2xl shadow-emerald-600/20">
              <Building2 size={32} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-3xl font-black text-slate-950 tracking-tight m-0 leading-none">
                Companies
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Badge status="processing" color="#10b981" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {pageInfo?.total || 0} Registered Entities
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group hidden sm:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <Input
              placeholder="Locate entity..."
              value={props?.searchText}
              onChange={(e) => props?.setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && props?.onSearch()}
              className="w-72 h-14 pl-12 pr-6 rounded-2xl border-none shadow-sm group-hover:shadow-md transition-all font-bold text-slate-700 bg-white"
            />
          </div>
          <Button
            type="primary"
            onClick={props?.setOpenFormCreate}
            icon={<Plus size={20} />}
            className="h-14 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 border-none font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-3"
          >
            Register Entity
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="rounded-[48px] border-none shadow-[0_20px_80px_rgba(0,0,0,0.04)] overflow-hidden bg-white premium-table-card">
        <Table
          columns={columns}
          dataSource={companies || []}
          pagination={{
            current: pageInfo?.currentPage || 1,
            total: pageInfo?.total || 0,
            pageSize: pageInfo?.pageSize || 10,
            onChange: props?.setPage,
            onShowSizeChange: (_, size) => props?.setPageSize(size),
            showSizeChanger: true,
            className: "px-8 py-6 m-0 border-t border-slate-50 font-bold text-slate-500",
            placement: 'bottomRight'
          }}
          loading={isLoading("getCompanies")}
          rowKey="id"
          expandable={{
            indentSize: 24,
            expandIcon: ({ expanded, onExpand, record }) =>
              record.children && record.children.length > 0 ? (
                <button
                  onClick={e => onExpand(record, e)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    expanded ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  <ChevronRight size={14} className={`transition-transform duration-300 ${expanded ? 'rotate-90' : ''}`} />
                </button>
              ) : <div className="w-6" />
          }}
          className="premium-tree-table"
          locale={{
            emptyText: (
              <div className="py-20 flex flex-col items-center">
                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 mb-4">
                  <Building2 size={40} />
                </div>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No entities found in this sector</span>
              </div>
            )
          }}
        />
      </Card>

      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.code)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, code: "" })}
          loading={isLoading("deleteCompany")}
        />
      )}

      <style jsx global>{`
        .premium-tree-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-weight: 900 !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          padding: 24px 32px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .premium-tree-table .ant-table-tbody > tr > td {
          padding: 16px 32px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .premium-tree-table .ant-table-tbody > tr:hover > td {
          background: #fdfdfd !important;
        }
        .premium-tree-table .ant-table-row-indent + .ant-table-row-expand-icon {
          margin-right: 12px;
        }
        .premium-table-card .ant-card-body {
          padding: 0 !important;
        }
        .ant-table-pagination.ant-pagination {
          margin: 16px 32px !important;
        }
      `}</style>
    </div>
  );
}
