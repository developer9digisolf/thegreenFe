"use client";

import { useState, useEffect, useCallback } from "react";
import { Button, Table, Card, Typography, Tag, App, Empty, Input } from "antd";
import {
  ArrowLeftOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getCashierSessionSales,
  exportCashierSessionSales,
} from "@afx/services/cashier-session-sales.service";
import {
  ICashierSessionSalesRequest,
  ICashierSessionSalesItem,
} from "@afx/interfaces/cashier-session-sales.iface";
import { useParams, useRouter } from "next/navigation";

const { Title, Text } = Typography;

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function CashierSessionSalesPage() {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const sessionCode = (params?.sessionCode as string) || "";

  // ─── Data States ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ICashierSessionSalesItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    lastPage: 1,
  });

  // ─── Sorting States ───────────────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState("createdat");
  const [sortDirection, setSortDirection] = useState("desc");
  const [search, setSearch] = useState("");
  const [exporting, setExporting] = useState(false);

  // ─── Helper Function to Format Currency ───────────────────────────────────────
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "-";
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // ─── Helper Function to Get Payment Status Color ─────────────────────────────
  const getPaymentStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      paid: "success",
      unpaid: "error",
      partial: "warning",
      refunded: "default",
    };
    return statusColors[status] || "default";
  };

  // ─── Fetch Data ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      if (!sessionCode) return;

      setLoading(true);
      try {
        const requestParams: ICashierSessionSalesRequest = {
          Page: page,
          PageSize: pageSize,
          Search: search,
          SortColumn: sortColumn,
          SortDirection: sortDirection,
          SessionCode: sessionCode,
        };

        const res = await getCashierSessionSales(requestParams);
        if (res.success) {
          setData(res.data || []);
          setPagination({
            current: res.pagination?.currentPage || page,
            pageSize: res.pagination?.pageSize || pageSize,
            total: res.pagination?.total || 0,
            lastPage: res.pagination?.lastPage || 1,
          });
        } else {
          setData([]);
          message.error(res.message || "Gagal memuat data Sales");
        }
      } catch (err: any) {
        message.error(err?.message || "Gagal memuat data Sales");
      } finally {
        setLoading(false);
      }
    },
    [sessionCode, search, sortColumn, sortDirection, pagination.pageSize],
  );

  // ─── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionCode]);

  // ─── Debounce Search ─────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) {
        fetchData(1);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [search]);

  // ─── Handle Table Sort ────────────────────────────────────────────────────────
  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortColumn(sorter.field);
      setSortDirection(sorter.order === "ascend" ? "asc" : "desc");
    }
    fetchData(newPagination.current, newPagination.pageSize);
  };

  // ─── Handle Export ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    if (!sessionCode) return;

    setExporting(true);
    try {
      const params: ICashierSessionSalesRequest = {
        Page: 1,
        PageSize: 10,
        Search: search,
        SortColumn: sortColumn,
        SortDirection: sortDirection,
        SessionCode: sessionCode,
      };

      const blob = await exportCashierSessionSales(params);
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement("a");
      link.href = url;
      const filename = `CashierSessionSales-${sessionCode}.xlsx`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      message.success("Export berhasil!");
    } catch (err) {
      message.error("Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Sale Code",
      dataIndex: "saleCode",
      key: "saleCode",
      sorter: true,
      render: (code: string) => (
        <Text className="font-mono font-bold text-slate-800">{code}</Text>
      ),
    },
    {
      title: "Sale Date",
      dataIndex: "saleDate",
      key: "saleDate",
      sorter: true,
      render: (date: string) => (
        <div>
          <div className="text-sm font-medium">
            {dayjs(date).format("DD MMM YYYY")}
          </div>
          <div className="text-[10px] text-slate-400">
            {dayjs(date).format("HH:mm:ss")}
          </div>
        </div>
      ),
    },
    {
      title: "Sale Type",
      dataIndex: "saleTypeName",
      key: "saleTypeName",
      sorter: true,
      render: (type: string) => (
        <Tag className="rounded-lg bg-blue-50 text-blue-600 border-none">
          {type || "-"}
        </Tag>
      ),
    },
    {
      title: "Member Name",
      dataIndex: "memberName",
      key: "memberName",
      render: (name: string | null, record: ICashierSessionSalesItem) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            {name ? name.charAt(0) : <UserOutlined />}
          </div>
          <div>
            <Text className="font-medium text-slate-800 block">
              {name || "Guest"}
            </Text>
            {record.memberPhone && (
              <Text className="text-[10px] text-slate-400">
                {record.memberPhone}
              </Text>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Items",
      dataIndex: "itemCount",
      key: "itemCount",
      align: "center" as const,
      render: (count: number) => (
        <div className="flex items-center justify-center gap-1">
          <ShoppingOutlined className="text-slate-400 text-xs" />
          <Text className="font-medium">{count}</Text>
        </div>
      ),
    },
    {
      title: "Payment Methods",
      dataIndex: "paymentMethods",
      key: "paymentMethods",
      render: (methods: string[]) => (
        <div className="flex flex-wrap gap-1">
          {methods?.map((method: string, index: number) => (
            <Tag
              key={index}
              className="rounded-lg bg-purple-50 text-purple-600 border-none text-xs"
            >
              {method}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatusName",
      key: "paymentStatusName",
      sorter: true,
      render: (status: string, record: ICashierSessionSalesItem) => (
        <Tag
          color={getPaymentStatusColor(record.paymentStatus)}
          className="text-[10px] uppercase font-extrabold rounded-full px-3"
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      sorter: true,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-emerald-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Amount Paid",
      dataIndex: "amountPaid",
      key: "amountPaid",
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────────
  return (
    <App>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.push("/dashboard/reports/cashier-session")}
              className="rounded-xl border-none shadow-sm hover:shadow-md transition-all"
            >
              Back
            </Button>
            <div>
              <Title
                level={2}
                className="m-0 text-slate-800 font-extrabold tracking-tight"
              >
                Detail Sales
              </Title>
              <Text className="text-slate-500">
                Daftar transaksi untuk session{" "}
                <Text strong className="text-emerald-600">
                  {sessionCode}
                </Text>
              </Text>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <Input
              placeholder="Cari Sale Code, Member Name..."
              prefix={<SearchOutlined className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 h-10 rounded-xl"
              allowClear
            />
            {/* Export Button */}
            <Button
              type="default"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              loading={exporting}
              disabled={data.length === 0}
              className="rounded-xl h-10 border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
            >
              Export
            </Button>
            <Card size="small" className="rounded-xl shadow-sm border-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <ShoppingOutlined className="text-xl" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Total Sales
                  </div>
                  <div className="text-lg font-extrabold text-slate-800">
                    {pagination.total} Trx
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Table */}
        <Card className="rounded-2xl shadow-sm border-none overflow-hidden p-0">
          {data.length > 0 || loading ? (
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                onChange: (page, pageSize) => fetchData(page, pageSize),
                onShowSizeChange: (current, size) => fetchData(current, size),
                className: "px-6 pb-4",
              }}
              onChange={handleTableChange}
              className="premium-table"
              scroll={{ x: "max-content" }}
            />
          ) : (
            <div className="py-20 flex flex-col items-center justify-center bg-white">
              <Empty
                description="Tidak ada transaksi untuk session ini"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </Card>

        <style jsx global>{`
          .premium-table .ant-table-thead > tr > th {
            background: #f8fafc !important;
            color: #64748b !important;
            font-size: 11px !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
            letter-spacing: 0.05em !important;
            border-bottom: 1px solid #f1f5f9 !important;
          }
          .premium-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f8fafc !important;
          }
          .premium-table .ant-table-row:hover > td {
            background: #fdfdfd !important;
          }
        `}</style>
      </div>
    </App>
  );
}
