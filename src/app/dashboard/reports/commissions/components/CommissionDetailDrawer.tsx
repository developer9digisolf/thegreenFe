"use client";

import { useState, useCallback } from "react";
import { Drawer, Table, Typography, Tag, Card, Space } from "antd";
import {
  ICommissionByEmployee,
  ICommissionSession,
  DateFilterType,
} from "@afx/interfaces/commission.iface";
import dayjs from "dayjs";

const { Text } = Typography;

interface CommissionDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: ICommissionByEmployee | null;
  sessions: ICommissionSession[];
  loadingSessions: boolean;
  sessionPagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onSessionPageChange: (page: number) => void;
  dateFilterType: DateFilterType;
  selectedDate?: dayjs.Dayjs | null;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs] | null;
}

export function CommissionDetailDrawer({
  open,
  onClose,
  employee,
  sessions,
  loadingSessions,
  sessionPagination,
  onSessionPageChange,
}: CommissionDetailDrawerProps) {
  const getSessionColumns = () => [
    {
      title: "Sesi",
      dataIndex: "sessionCode",
      key: "sessionCode",
      render: (code: string, record: ICommissionSession) => (
        <div>
          <div className="font-mono text-xs font-bold text-slate-700">
            {code}
          </div>
          <div className="text-[10px] text-slate-400">
            {dayjs(record.sessionDate).format("DD MMM YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Layanan",
      dataIndex: "serviceName",
      key: "serviceName",
      render: (text: string, record: ICommissionSession) => (
        <div>
          <div className="text-sm font-medium text-slate-800">{text}</div>
          <div className="text-xs text-slate-400">
            {record.serviceVariantName}
          </div>
        </div>
      ),
    },
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
      render: (text: string) => (
        <Text className="text-sm text-slate-600">{text || "Guest"}</Text>
      ),
    },
    {
      title: "Komisi",
      dataIndex: "commissionAmount",
      key: "commissionAmount",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-xs text-slate-700">
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Bonus",
      dataIndex: "commissionBonus",
      key: "commissionBonus",
      align: "right" as const,
      render: (amount: number) => (
        <Text
          type={amount > 0 ? "success" : "secondary"}
          className="text-xs font-medium"
        >
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalCommission",
      key: "totalCommission",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-xs text-emerald-600">
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      align: "center" as const,
      render: (rating: number | null) => {
        if (!rating)
          return (
            <Text type="secondary" className="text-xs">
              -
            </Text>
          );
        const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
        return (
          <div className="flex items-center gap-1">
            <span className="text-amber-400 text-xs">{stars}</span>
            <span className="text-xs font-bold text-slate-600">{rating}</span>
          </div>
        );
      },
    },
    {
      title: "Komentar",
      dataIndex: "comment",
      key: "comment",
      render: (comment: string | null) => (
        <Text className="text-xs italic text-slate-500">{comment || "-"}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        let color = "default";
        if (status === "Completed") color = "success";
        if (status === "Claimed") color = "processing";
        return (
          <Tag color={color} className="text-[10px] uppercase font-bold">
            {status}
          </Tag>
        );
      },
    },
  ];

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
            {employee?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {employee?.name}
            </div>
            <div className="text-xs text-slate-500">
              {employee?.positionName}
            </div>
          </div>
        </div>
      }
      placement="right"
      width={650}
      onClose={onClose}
      open={open}
      styles={{
        header: {
          borderBottom: "1px solid #f1f5f9",
          padding: "20px 24px",
          background: "#ffffff",
        },
        body: { padding: "0", background: "#f8fafc" },
      }}
      className="commission-drawer"
    >
      {/* Summary Cards */}
      <div className="p-6 bg-slate-50 border-b border-slate-200">
        <div className="grid grid-cols-2 gap-4">
          <Card className="rounded-xl shadow-sm border border-slate-100 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">
              Total Komisi
            </div>
            <div className="text-xl font-extrabold text-emerald-600">
              {formatCurrency(employee?.totalAmount || 0)}
            </div>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">
              Sesi Terdaftar
            </div>
            <div className="text-xl font-extrabold text-blue-600">
              {employee?.sessionCount || 0} Sesi
            </div>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">
              Komisi Dasar
            </div>
            <div className="text-xl font-extrabold text-slate-700">
              {formatCurrency(employee?.commissionAmount || 0)}
            </div>
          </Card>
          <Card className="rounded-xl shadow-sm border border-slate-100 bg-white">
            <div className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-wider">
              Bonus Komisi
            </div>
            <div className="text-xl font-extrabold text-amber-600">
              {formatCurrency(employee?.bonusAmount || 0)}
            </div>
          </Card>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="p-4 bg-white min-h-[400px]">
        <Table
          columns={getSessionColumns()}
          dataSource={sessions}
          rowKey="id"
          loading={loadingSessions}
          pagination={{
            ...sessionPagination,
            size: "small",
            onChange: onSessionPageChange,
            className: "px-4 py-4",
            showSizeChanger: false,
          }}
          className="commission-session-table"
          scroll={{ x: 900 }}
        />
      </div>

      <style jsx global>{`
        .commission-drawer .ant-drawer-body {
          display: flex;
          flex-direction: column;
        }
        .commission-session-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em !important;
          border-bottom: 2px solid #e2e8f0 !important;
        }
        .commission-session-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f1f5f9 !important;
          padding: 12px 8px !important;
        }
        .commission-session-table .ant-table-row:hover > td {
          background: #fdfdfd !important;
        }
        .commission-session-table .ant-pagination-item-active {
          border-color: #10b981 !important;
        }
        .commission-session-table .ant-pagination-item-active a {
          color: #10b981 !important;
        }
      `}</style>
    </Drawer>
  );
}
