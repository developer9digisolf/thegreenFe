"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  DatePicker,
  Button,
  Table,
  Card,
  Typography,
  Space,
  Tag,
  App,
  Empty,
  Select,
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
  SolutionOutlined,
  ReloadOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import {
  getCashierSessionReports,
  exportCashierSessionReports,
} from "@afx/services/cashier-session-report.service";
import {
  ICashierSessionReportItem,
  ICashierSessionReportRequest,
} from "@afx/interfaces/cashier-session-report.iface";
import { GetBranchesService } from "@afx/services/master/branches.service";
import { IResBranch } from "@afx/interfaces/master/branch.iface";
import { useSearchParams, useRouter } from "next/navigation";

// Extend dayjs with weekOfYear plugin
dayjs.extend(weekOfYear);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type FilterType = "Day" | "Week" | "Month" | "Custom";

// ─── Summary Card Component ─────────────────────────────────────────────────────
interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "emerald" | "blue" | "slate" | "amber";
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-500",
    blue: "bg-blue-50 text-blue-500",
    slate: "bg-slate-50 text-slate-500",
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
export default function CashierSessionReportPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { message } = App.useApp();

  // ─── Filter States ────────────────────────────────────────────────────────────
  const [dateFilterType, setDateFilterType] = useState<FilterType>("Month");
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [search, setSearch] = useState("");
  const [branchId, setBranchId] = useState<number | undefined>(undefined);

  // ─── Data States ───────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ICashierSessionReportItem[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    lastPage: 1,
  });
  const [exporting, setExporting] = useState(false);

  // ─── Sorting States ───────────────────────────────────────────────────────────
  const [sortColumn, setSortColumn] = useState("openedat");
  const [sortDirection, setSortDirection] = useState("desc");

  // ─── Branches State ────────────────────────────────────────────────────────────
  const [branches, setBranches] = useState<IResBranch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [branchSearch, setBranchSearch] = useState("");

  // ─── Fetch Branches ────────────────────────────────────────────────────────────
  const fetchBranches = useCallback(async (searchTerm = "") => {
    setLoadingBranches(true);
    try {
      const res = await GetBranchesService({
        page: 1,
        pageSize: 100,
        search: searchTerm,
        sortColumn: "name",
        sortDirection: "asc" as const,
      });
      if (res.success) {
        setBranches(res.data || []);
      } else {
        message.warning(
          "Gagal memuat data branch. Filter branch tidak tersedia.",
        );
        setBranches([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch branches:", err);
      message.warning(
        "Gagal memuat data branch. Filter branch tidak tersedia.",
      );
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  }, []);

  // ─── Debounce for branch search ─────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBranches(branchSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [branchSearch, fetchBranches]);

  // ─── Summary Calculations ──────────────────────────────────────────────────────
  const totalSessions = data.length;
  const openSessions = data.filter((item) => item.status === "open").length;
  const closedSessions = data.filter((item) => item.status === "closed").length;
  const totalSalesAmount = data.reduce(
    (acc, curr) => acc + curr.totalSalesAmount,
    0,
  );

  // ─── Fetch Data ───────────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (page = 1, pageSize = pagination.pageSize) => {
      if (!selectedDate && dateFilterType !== "Custom") return;
      if (dateFilterType === "Custom" && !dateRange) return;

      setLoading(true);
      try {
        const params: ICashierSessionReportRequest = {
          Page: page,
          PageSize: pageSize,
          Search: search,
          SortColumn: sortColumn,
          SortDirection: sortDirection,
          BranchId: branchId,
        };

        if (dateFilterType === "Day" && selectedDate) {
          params.StartDate = selectedDate.format("YYYY-MM-DD");
          params.EndDate = selectedDate.format("YYYY-MM-DD");
        } else if (dateFilterType === "Month" && selectedDate) {
          params.StartDate = selectedDate.startOf("month").format("YYYY-MM-DD");
          params.EndDate = selectedDate.endOf("month").format("YYYY-MM-DD");
        } else if (dateFilterType === "Week" && selectedDate) {
          params.StartDate = selectedDate.startOf("week").format("YYYY-MM-DD");
          params.EndDate = selectedDate.endOf("week").format("YYYY-MM-DD");
        } else if (dateFilterType === "Custom" && dateRange) {
          params.StartDate = dateRange[0].format("YYYY-MM-DD");
          params.EndDate = dateRange[1].format("YYYY-MM-DD");
        }

        // Update URL params
        const newParams = new URLSearchParams();
        if (page) newParams.set("Page", page.toString());
        if (pageSize) newParams.set("PageSize", pageSize.toString());
        if (search) newParams.set("Search", search);
        if (sortColumn) newParams.set("SortColumn", sortColumn);
        if (sortDirection) newParams.set("SortDirection", sortDirection);
        if (params.StartDate) newParams.set("StartDate", params.StartDate);
        if (params.EndDate) newParams.set("EndDate", params.EndDate);
        if (branchId) newParams.set("BranchId", branchId.toString());
        newParams.set("FilterType", dateFilterType);

        const queryString = newParams.toString();
        router.push(
          `${window.location.pathname}${queryString ? `?${queryString}` : ""}`,
          { scroll: false },
        );

        const res = await getCashierSessionReports(params);
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
          message.error(res.message || "Gagal memuat data Cashier Session");
        }
      } catch (err: any) {
        message.error(err?.message || "Gagal memuat data Cashier Session");
      } finally {
        setLoading(false);
      }
    },
    [
      dateFilterType,
      selectedDate,
      dateRange,
      search,
      branchId,
      sortColumn,
      sortDirection,
      pagination.pageSize,
      router,
    ],
  );

  // ─── Effects ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilterType, selectedDate, dateRange]);

  // ─── Handle Reset ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setDateFilterType("Month");
    setSelectedDate(dayjs());
    setDateRange(null);
    setSearch("");
    setBranchId(undefined);
    setSortColumn("openedat");
    setSortDirection("desc");
  };

  // ─── Handle Table Sort ────────────────────────────────────────────────────────
  const handleTableChange = (newPagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortColumn(sorter.field);
      setSortDirection(sorter.order === "ascend" ? "asc" : "desc");
    }
    fetchData(newPagination.current, newPagination.pageSize);
  };

  // ─── Handle Export Excel ───────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      // Build params same as current filters
      const params: ICashierSessionReportRequest = {
        Page: pagination.current,
        PageSize: pagination.pageSize,
        Search: search,
        SortColumn: sortColumn,
        SortDirection: sortDirection,
        BranchId: branchId,
      };

      if (dateFilterType === "Day" && selectedDate) {
        params.StartDate = selectedDate.format("YYYY-MM-DD");
        params.EndDate = selectedDate.format("YYYY-MM-DD");
      } else if (dateFilterType === "Month" && selectedDate) {
        params.StartDate = selectedDate.startOf("month").format("YYYY-MM-DD");
        params.EndDate = selectedDate.endOf("month").format("YYYY-MM-DD");
      } else if (dateFilterType === "Week" && selectedDate) {
        params.StartDate = selectedDate.startOf("week").format("YYYY-MM-DD");
        params.EndDate = selectedDate.endOf("week").format("YYYY-MM-DD");
      } else if (dateFilterType === "Custom" && dateRange) {
        params.StartDate = dateRange[0].format("YYYY-MM-DD");
        params.EndDate = dateRange[1].format("YYYY-MM-DD");
      }

      const blob = await exportCashierSessionReports(params);
      const url = window.URL.createObjectURL(new Blob([blob as any]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `CashierSessionReport_${dayjs().format("YYYYMMDD")}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      message.error("Gagal mengekspor data");
    }
  };

  // ─── Helper Function to Format Currency ───────────────────────────────────────
  const formatCurrency = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return "-";
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  // ─── Table Columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: "Session Code",
      dataIndex: "sessionCode",
      key: "sessionCode",
      sorter: true,
      render: (code: string) => (
        <button
          onClick={() =>
            router.push(`/dashboard/reports/cashier-session/${code}/sales`)
          }
          className="font-mono font-bold text-emerald-600 hover:text-emerald-700 transition-colors bg-transparent border-none cursor-pointer p-0 text-left"
        >
          {code}
        </button>
      ),
    },
    {
      title: "Cashier",
      dataIndex: "employeeName",
      key: "employeeName",
      render: (name: string) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
            {name?.charAt(0) || "C"}
          </div>
          <Text className="font-medium text-slate-800">{name || "-"}</Text>
        </div>
      ),
    },
    {
      title: "Branch",
      dataIndex: "branchName",
      key: "branchName",
      render: (name: string) => (
        <Text className="text-slate-600">{name || "-"}</Text>
      ),
    },
    {
      title: "Opened At",
      dataIndex: "openedAt",
      key: "openedAt",
      sorter: true,
      render: (date: string) => (
        <div>
          <div className="text-sm font-medium">
            {dayjs(date).format("DD MMM YYYY")}
          </div>
          <div className="text-[10px] text-slate-400">
            {dayjs(date).format("HH:mm")}
          </div>
        </div>
      ),
    },
    {
      title: "Closed At",
      dataIndex: "closedAt",
      key: "closedAt",
      sorter: true,
      render: (date: string | null) =>
        date ? (
          <div>
            <div className="text-sm font-medium">
              {dayjs(date).format("DD MMM YYYY")}
            </div>
            <div className="text-[10px] text-slate-400">
              {dayjs(date).format("HH:mm")}
            </div>
          </div>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: "Opening Cash",
      dataIndex: "openingCash",
      key: "openingCash",
      sorter: true,
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Expected Closing Cash",
      dataIndex: "expectedClosingCash",
      key: "expectedClosingCash",
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Actual Closing Cash",
      dataIndex: "actualClosingCash",
      key: "actualClosingCash",
      align: "right" as const,
      render: (amount: number | null) =>
        amount !== null ? formatCurrency(amount) : "-",
    },
    {
      title: "Cash Difference",
      dataIndex: "cashDifference",
      key: "cashDifference",
      align: "right" as const,
      render: (amount: number) => {
        const color =
          amount === 0
            ? "text-slate-600"
            : amount > 0
              ? "text-emerald-600"
              : "text-red-600";
        return (
          <Text className={`font-bold ${color}`}>{formatCurrency(amount)}</Text>
        );
      },
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      align: "center" as const,
      render: (count: number) => <Tag className="rounded-lg">{count} Trx</Tag>,
    },
    {
      title: "Total Sales Amount",
      dataIndex: "totalSalesAmount",
      key: "totalSalesAmount",
      sorter: true,
      align: "right" as const,
      render: (amount: number) => (
        <Text strong className="text-emerald-600">
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: "Cash Received",
      dataIndex: "totalCashReceived",
      key: "totalCashReceived",
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Non Cash Received",
      dataIndex: "totalNonCashReceived",
      key: "totalNonCashReceived",
      align: "right" as const,
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: true,
      render: (status: string) => (
        <Tag
          color={status === "open" ? "success" : "default"}
          className="text-[10px] uppercase font-extrabold rounded-full px-3"
        >
          {status}
        </Tag>
      ),
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────────
  return (
    <App>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Title
              level={2}
              className="m-0 text-slate-800 font-extrabold tracking-tight"
            >
              Laporan Cashier Session
            </Title>
            <Text className="text-slate-500">
              Analisis sesi kasir dan perbedaan uang tunai
            </Text>
          </div>
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

            {/* Branch */}
            <div className="flex flex-col gap-1">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Branch
              </Text>
              <Select
                className="w-48"
                placeholder="Pilih Branch"
                value={branchId}
                onChange={(value) => setBranchId(value)}
                allowClear
                loading={loadingBranches}
                showSearch
                onSearch={(value) => setBranchSearch(value)}
                filterOption={false}
                options={branches.map((branch) => ({
                  label: branch.name,
                  value: branch.id,
                }))}
              />
            </div>

            {/* Search */}
            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                Cari
              </Text>
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-emerald-500 focus:outline-none transition-all"
                  placeholder="Kode Session, Nama Kasir..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchData(1)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-1 justify-end h-full mt-auto">
              <Space>
                <Button
                  type="primary"
                  className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20"
                  onClick={() => fetchData(1)}
                  loading={loading}
                >
                  Tampilkan Laporan
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleReset}
                  className="rounded-xl h-10"
                >
                  Reset
                </Button>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={handleExport}
                  loading={exporting}
                  disabled={data.length === 0}
                  className="rounded-xl h-10 border-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                >
                  Export Excel
                </Button>
              </Space>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            title="Total Session"
            value={`${totalSessions} Session`}
            icon={<SolutionOutlined />}
            color="blue"
          />
          <SummaryCard
            title="Open Session"
            value={`${openSessions} Session`}
            icon={<WalletOutlined />}
            color="emerald"
          />
          <SummaryCard
            title="Closed Session"
            value={`${closedSessions} Session`}
            icon={<CheckCircleOutlined />}
            color="slate"
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
              <Empty description="Pilih kriteria filter dan klik Tampilkan Laporan" />
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
    </App>
  );
}
