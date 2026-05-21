"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DatePicker,
  Select,
  Button,
  Table,
  Card,
  Typography,
  Space,
  Tag,
  message,
  Empty,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  FileExcelOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  getCommissionsByEmployee,
  getCommissionSessions,
  exportCommissionsExcel,
} from "@afx/services/master/commissions.service";
import {
  ICommissionByEmployee,
  ICommissionSession,
  DateFilterType,
  ICommissionFilterRequest,
} from "@afx/interfaces/commission.iface";
import { CommissionDetailDrawer } from "./components/CommissionDetailDrawer";

// Extend dayjs with weekOfYear plugin
dayjs.extend(weekOfYear);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

// ─── Summary Card Component ─────────────────────────────────────────────────────
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "indigo" | "amber";
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
    indigo: "bg-indigo-50 text-indigo-500",
    amber: "bg-amber-50 text-amber-500",
  };

  return (
    <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colorMap[color]}`}
        >
          {icon}
        </div>
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {title}
          </div>
          <div className="text-xl font-extrabold text-slate-800">{value}</div>
        </div>
      </div>
    </Card>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────────
export default function CommissionsReportPage() {
  // ─── Filter States ────────────────────────────────────────────────────────────
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("Month");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState("");

  // ─── Data States ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ICommissionByEmployee[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ─── Detail States ─────────────────────────────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<ICommissionByEmployee | null>(null);
  const [sessions, setSessions] = useState<ICommissionSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionPagination, setSessionPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // ─── Computed Values ───────────────────────────────────────────────────────────
  const totalCommission = data.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalSessions = data.reduce((acc, curr) => acc + curr.sessionCount, 0);

  // ─── Fetch Commission Data ─────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (page = 1) => {
      if (!selectedDate && dateFilterType !== "Custom") return;
      if (dateFilterType === "Custom" && !dateRange) return;

      setLoading(true);
      try {
        const params: ICommissionFilterRequest = {
          Page: page,
          PageSize: pagination.pageSize,
          DateFilterType: dateFilterType,
          Search: search,
        };

        if (dateFilterType === "Day" && selectedDate) {
          params.Date = selectedDate.format("YYYY-MM-DD");
        } else if (dateFilterType === "Month" && selectedDate) {
          params.Month = selectedDate.month() + 1;
          params.Year = selectedDate.year();
        } else if (dateFilterType === "Week" && selectedDate) {
          params.Week = selectedDate.week();
          params.Year = selectedDate.year();
        } else if (dateFilterType === "Custom" && dateRange) {
          params.StartDate = dateRange[0].format("YYYY-MM-DD");
          params.EndDate = dateRange[1].format("YYYY-MM-DD");
        }

        const res = await getCommissionsByEmployee(params);
        if (res.success) {
          setData(res.data || []);
          setPagination({
            current: res.pagination?.currentPage || 1,
            pageSize: res.pagination?.pageSize || 10,
            total: res.pagination?.total || 0,
          });
        } else {
          setData([]);
        }
      } catch (err: any) {
        message.error(err?.message || "Gagal memuat data komisi");
      } finally {
        setLoading(false);
      }
    },
    [dateFilterType, selectedDate, dateRange, search, pagination.pageSize],
  );

  // ─── Fetch Session Details ─────────────────────────────────────────────────────
  const fetchSessions = useCallback(
    async (employeeId: number, page = 1) => {
      setLoadingSessions(true);
      try {
        const params: ICommissionFilterRequest = {
          Page: page,
          PageSize: sessionPagination.pageSize,
          DateFilterType: dateFilterType,
          EmployeeId: employeeId,
        };

        if (dateFilterType === "Day" && selectedDate) {
          params.Date = selectedDate.format("YYYY-MM-DD");
        } else if (dateFilterType === "Month" && selectedDate) {
          params.Month = selectedDate.month() + 1;
          params.Year = selectedDate.year();
        } else if (dateFilterType === "Week" && selectedDate) {
          params.Week = selectedDate.week();
          params.Year = selectedDate.year();
        } else if (dateFilterType === "Custom" && dateRange) {
          params.StartDate = dateRange[0].format("YYYY-MM-DD");
          params.EndDate = dateRange[1].format("YYYY-MM-DD");
        }

        const res = await getCommissionSessions(params);
        if (res.success) {
          setSessions(res.data || []);
          setSessionPagination({
            current: res.pagination?.currentPage || 1,
            pageSize: res.pagination?.pageSize || 10,
            total: res.pagination?.total || 0,
          });
        }
      } catch (err: any) {
        message.error("Gagal memuat detail sesi");
      } finally {
        setLoadingSessions(false);
      }
    },
    [dateFilterType, selectedDate, dateRange, sessionPagination.pageSize],
  );

  // ─── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, [dateFilterType, selectedDate, dateRange]);

  // ─── Export to Excel ───────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params: ICommissionFilterRequest = {
        DateFilterType: dateFilterType,
      };
      if (dateFilterType === "Day" && selectedDate)
        params.Date = selectedDate.format("YYYY-MM-DD");
      else if (dateFilterType === "Month" && selectedDate) {
        params.Month = selectedDate.month() + 1;
        params.Year = selectedDate.year();
      } else if (dateFilterType === "Week" && selectedDate) {
        params.Week = selectedDate.week();
        params.Year = selectedDate.year();
      } else if (dateFilterType === "Custom" && dateRange) {
        params.StartDate = dateRange[0].format("YYYY-MM-DD");
        params.EndDate = dateRange[1].format("YYYY-MM-DD");
      }

      const blob = await exportCommissionsExcel(params);
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Commission_Report_${dayjs().format("YYYYMMDD")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      message.error("Gagal mengekspor data");
    }
  };

  // ─── Show Employee Detail ─────────────────────────────────────────────────────
  const showEmployeeDetail = (employee: ICommissionByEmployee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
    fetchSessions(employee.id, 1);
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Nama Karyawan",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: ICommissionByEmployee) => (
        <Space>
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
            {text?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-bold text-slate-800">{text}</div>
            <div className="text-xs text-slate-500">{record.positionName}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Jumlah Sesi",
      dataIndex: "sessionCount",
      key: "sessionCount",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="blue" className="rounded-full px-3">
          {count} Sesi
        </Tag>
      ),
    },
    {
      title: "Komisi",
      dataIndex: "commissionAmount",
      key: "commissionAmount",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-slate-700">
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Bonus",
      dataIndex: "bonusAmount",
      key: "bonusAmount",
      align: "right" as const,
      render: (amount: number) => (
        <Text
          type={amount > 0 ? "success" : "secondary"}
          className="font-medium"
        >
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-emerald-600">
          Rp {(amount || 0).toLocaleString("id-ID")}
        </Text>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center" as const,
      render: (_: any, record: ICommissionByEmployee) => (
        <Tooltip title="Lihat Detail Sesi">
          <Button
            type="text"
            icon={<EyeOutlined className="text-emerald-500" />}
            onClick={() => showEmployeeDetail(record)}
          />
        </Tooltip>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title
            level={2}
            className="m-0 text-slate-800 font-extrabold tracking-tight"
          >
            Laporan Komisi
          </Title>
          <Text className="text-slate-500">
            Monitor performa dan komisi karyawan Anda
          </Text>
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
          {/* Filter Type */}
          <div className="flex flex-col gap-1">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Filter Tipe
            </Text>
            <Select
              className="w-40 h-10 rounded-xl"
              value={dateFilterType}
              onChange={(val) => {
                setDateFilterType(val);
                setSelectedDate(dayjs());
              }}
              options={[
                { label: "Harian", value: "Day" },
                { label: "Mingguan", value: "Week" },
                { label: "Bulanan", value: "Month" },
                { label: "Kustom", value: "Custom" },
              ]}
            />
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              {dateFilterType === "Day"
                ? "Pilih Tanggal"
                : dateFilterType === "Week"
                  ? "Pilih Minggu"
                  : dateFilterType === "Month"
                    ? "Pilih Bulan"
                    : "Pilih Rentang"}
            </Text>
            {dateFilterType === "Custom" ? (
              <RangePicker
                className="h-10 rounded-xl"
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1])
                    setDateRange([dates[0], dates[1]]);
                  else setDateRange(null);
                }}
              />
            ) : (
              <DatePicker
                className="h-10 rounded-xl"
                picker={
                  dateFilterType === "Month"
                    ? "month"
                    : dateFilterType === "Week"
                      ? "week"
                      : "date"
                }
                value={selectedDate}
                onChange={(date) => setSelectedDate(date)}
              />
            )}
          </div>

          {/* Search */}
          <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
              Cari Karyawan
            </Text>
            <div className="relative">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-all"
                placeholder="Nama karyawan, posisi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
              />
            </div>
          </div>

          {/* Submit Button */}
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
          title="Total Komisi"
          value={`Rp ${totalCommission.toLocaleString("id-ID")}`}
          icon={<DollarCircleOutlined />}
          color="emerald"
        />
        <SummaryCard
          title="Total Sesi"
          value={`${totalSessions} Sesi`}
          icon={<SolutionOutlined />}
          color="blue"
        />
        <SummaryCard
          title="Periode"
          value={
            dateFilterType === "Custom"
              ? `${dateRange?.[0].format("DD/MM")} - ${dateRange?.[1].format("DD/MM")}`
              : selectedDate?.format(
                  dateFilterType === "Month" ? "MMMM YYYY" : "DD MMM YYYY",
                ) || "-"
          }
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
            <Empty description="Pilih kriteria filter dan klik Tampilkan Laporan" />
          </div>
        )}
      </Card>

      {/* Detail Drawer */}
      <CommissionDetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedEmployee}
        sessions={sessions}
        loadingSessions={loadingSessions}
        sessionPagination={sessionPagination}
        onSessionPageChange={(page) =>
          selectedEmployee && fetchSessions(selectedEmployee.id, page)
        }
        dateFilterType={dateFilterType}
        selectedDate={selectedDate}
        dateRange={dateRange}
      />

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
        .ant-picker,
        .ant-select-selector {
          border-color: #e2e8f0 !important;
          border-radius: 12px !important;
        }
        .ant-picker-focused,
        .ant-select-focused .ant-select-selector {
          border-color: #3d6b5f !important;
          box-shadow: 0 0 0 2px rgba(61, 107, 95, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
