"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  DatePicker, 
  Button, 
  Table, 
  Card, 
  Typography, 
  Space, 
  Tag, 
  message, 
  Empty,
  Tooltip
} from "antd";
import { 
  SearchOutlined, 
  FileExcelOutlined, 
  CalendarOutlined,
  DollarCircleOutlined,
  SolutionOutlined,
  UserOutlined,
  ShoppingOutlined
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { 
  getSalesPaid, 
  exportSalesExcel 
} from "@afx/services/sales-report.service";
import { 
  ISalePaidItem 
} from "@afx/interfaces/sales-report.iface";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function SalesReportPage() {
  // Filters
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [search, setSearch] = useState("");
  
  // Data
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ISalePaidItem[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Summary
  const totalGrandTotal = data.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalTransactions = pagination.total;

  const fetchData = useCallback(async (page = 1) => {
    if (!dateRange) return;

    setLoading(true);
    try {
      const params: ISalesPaidRequest = {
        Page: page,
        PageSize: pagination.pageSize,
        StartDate: dateRange[0].format("YYYY-MM-DD"),
        EndDate: dateRange[1].format("YYYY-MM-DD"),
        Search: search,
      };

      const res = await getSalesPaid(params);
      if (res.success) {
        setData(res.data);
        setPagination({
          current: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || 10,
          total: res.pagination?.total || 0,
        });
      } else {
        setData([]);
      }
    } catch (err: any) {
      message.error(err?.message || "Gagal memuat data penjualan");
    } finally {
      setLoading(false);
    }
  }, [dateRange, search, pagination.pageSize]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const handleExport = async () => {
    if (!dateRange) return;
    try {
      const params: ISalesPaidRequest = {
        StartDate: dateRange[0].format("YYYY-MM-DD"),
        EndDate: dateRange[1].format("YYYY-MM-DD"),
        Search: search,
      };

      const blob = await exportSalesExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Sales_Report_${dayjs().format('YYYYMMDD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      message.error("Gagal mengekspor data");
    }
  };

  const columns = [
    {
      title: "Kode Transaksi",
      dataIndex: "saleCode",
      key: "saleCode",
      render: (code: string) => (
        <Text className="font-mono font-bold text-slate-800">{code}</Text>
      ),
    },
    {
      title: "Tanggal",
      dataIndex: "saleDate",
      key: "saleDate",
      render: (date: string) => (
        <div>
          <div className="text-sm font-medium">{dayjs(date).format("DD MMM YYYY")}</div>
          <div className="text-[10px] text-slate-400">{dayjs(date).format("HH:mm:ss")}</div>
        </div>
      ),
    },
    {
      title: "Member",
      dataIndex: "memberName",
      key: "memberName",
      render: (text: string, record: ISalePaidItem) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            {text?.charAt(0) || "G"}
          </div>
          <div>
            <div className="font-bold text-slate-800">{text || "Guest"}</div>
            {record.memberPhone && <div className="text-xs text-slate-400">{record.memberPhone}</div>}
          </div>
        </Space>
      ),
    },
    {
      title: "Tipe",
      dataIndex: "saleTypeName",
      key: "saleTypeName",
      render: (type: string) => (
        <Tag className="rounded-full px-3 capitalize" color={type === "Package" ? "purple" : "blue"}>
          {type}
        </Tag>
      ),
    },
    {
      title: "Item",
      dataIndex: "itemCount",
      key: "itemCount",
      align: "center" as const,
      render: (count: number) => <Tag className="rounded-lg">{count} Item</Tag>,
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-emerald-600">
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Metode Bayar",
      dataIndex: "paymentMethods",
      key: "paymentMethods",
      render: (methods: string[]) => (
        <div className="flex flex-wrap gap-1">
          {methods?.map((m, i) => (
            <Tag key={i} color="cyan" className="text-[10px] font-bold">{m}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "paymentStatusName",
      key: "paymentStatusName",
      render: (status: string) => (
        <Tag color="success" className="text-[10px] uppercase font-extrabold rounded-full px-3">
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={2} className="m-0 text-slate-800 font-extrabold tracking-tight">Laporan Penjualan</Title>
          <Text className="text-slate-500">Analisis histori penjualan yang sudah lunas</Text>
        </div>
        <Space>
          <Button 
            icon={<FileExcelOutlined />} 
            onClick={handleExport}
            className="rounded-xl h-10 px-6 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            Export Excel
          </Button>
        </Space>
      </div>

      {/* Filters */}
      <Card className="rounded-2xl shadow-sm border-none overflow-visible">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rentang Tanggal</Text>
            <RangePicker 
              className="h-10 rounded-xl"
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) setDateRange([dates[0], dates[1]]);
                else setDateRange(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cari Transaksi</Text>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="Kode transaksi, nama member..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1 justify-end h-full mt-auto">
            <Button 
              type="primary" 
              className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
              onClick={() => fetchData(1)}
              loading={loading}
            >
              Tampilkan Laporan
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Penjualan" 
          value={`Rp ${totalGrandTotal.toLocaleString("id-ID")}`} 
          icon={<DollarCircleOutlined />} 
          color="emerald" 
        />
        <SummaryCard 
          title="Total Transaksi" 
          value={`${totalTransactions} Penjualan`} 
          icon={<SolutionOutlined />} 
          color="blue" 
        />
        {/* <SummaryCard 
          title="Tipe Produk" 
          value="Paket / Voucher" 
          icon={<ShoppingOutlined />} 
          color="purple" 
        /> */}
        <SummaryCard 
          title="Periode Laporan" 
          value={dateRange ? `${dateRange[0].format("DD MMM")} - ${dateRange[1].format("DD MMM")}` : "-"} 
          icon={<CalendarOutlined />} 
          color="amber" 
        />
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
              onChange: (page) => fetchData(page),
              className: "px-6 pb-4",
            }}
            className="premium-table"
          />
        ) : (
          <div className="py-20 flex flex-col items-center justify-center bg-white">
            <Empty description={dateRange ? "Data tidak ditemukan" : "Pilih rentang tanggal terlebih dahulu"} />
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
        .ant-picker, .ant-select-selector {
          border-color: #e2e8f0 !important;
          border-radius: 12px !important;
        }
        .ant-picker-focused, .ant-select-focused .ant-select-selector {
          border-color: #3d6b5f !important;
          box-shadow: 0 0 0 2px rgba(61, 107, 95, 0.1) !important;
        }
      `}</style>
    </div>
  );
}

function SummaryCard({ title, value, icon, color }: { title: string; value: string; icon: any; color: string }) {
  const colorMap: any = {
    emerald: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
    purple: "bg-purple-50 text-purple-500",
    amber: "bg-amber-50 text-amber-500",
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[color]}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</div>
          <div className="text-xl font-extrabold text-slate-800">{value}</div>
        </div>
      </div>
    </Card>
  );
}
