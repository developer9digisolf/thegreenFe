"use client";

import React, { useEffect, useState, useMemo } from "react";
import { DatePicker, Spin, Empty, Table, Badge } from "antd";
import dayjs from "dayjs";
import { DynamicChart } from "@afx/components/dynamic/chart-loader";
import {
  GetSummaryRevenueService,
  GetSalesPerformanceService,
  GetTopTherapistsService,
  GetPaymentMethodTotalsService,
  GetRecentSalesService,
  GetRecentSessionsService,
  GetTopMembersService,
  GetPeakHoursService,
  GetCustomerSegmentationService,
  GetTopServicesService,
} from "@afx/services/dashboard.service";
import {
  ISummaryRevenue,
  ISalesPerformance,
  ITopTherapist,
  ITopMember,
  IPaymentMethodTotal,
  IRecentSale,
  IRecentSession,
  IPeakHour,
  ICustomerSegmentation,
  ITopService,
} from "@afx/interfaces/dashboard.iface";

const { RangePicker } = DatePicker;

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function fmtShort(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)} rb`;
  return `Rp ${value}`;
}

function initials(name: string) {
  return (name || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  growth,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  growth?: number;
  icon: string;
  accent: "teal" | "blue" | "purple" | "amber";
}) {
  const accentMap = {
    teal: { bg: "#E1F5EE", text: "#0F6E56" },
    blue: { bg: "#E6F1FB", text: "#185FA5" },
    purple: { bg: "#EEEDFE", text: "#534AB7" },
    amber: { bg: "#FAEEDA", text: "#854F0B" },
  };
  const a = accentMap[accent];
  return (
    <div className="kpi-card">
      <div
        className="kpi-icon-wrap"
        style={{ background: a.bg, color: a.text }}
      >
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {growth !== undefined && (
        <div className={`kpi-badge ${growth >= 0 ? "up" : "dn"}`}>
          <i
            className={`fa-solid ${growth >= 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"}`}
          />
          {Math.abs(growth)}%
        </div>
      )}
    </div>
  );
}

function Avatar({
  name,
  variant,
}: {
  name: string;
  variant: "teal" | "blue" | "purple";
}) {
  const styles = {
    teal: { background: "#E1F5EE", color: "#0F6E56" },
    blue: { background: "#E6F1FB", color: "#185FA5" },
    purple: { background: "#EEEDFE", color: "#534AB7" },
  };
  return (
    <div className="avatar" style={styles[variant]}>
      {initials(name)}
    </div>
  );
}

const AVATAR_VARIANTS: ("teal" | "blue" | "purple")[] = [
  "teal",
  "blue",
  "purple",
  "teal",
  "blue",
];

// ─── main component ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().subtract(7, "day"),
    dayjs(),
  ]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [loading, setLoading] = useState(true);

  const [summary, setSummary] = useState<ISummaryRevenue | null>(null);
  const [salesPerf, setSalesPerf] = useState<ISalesPerformance | null>(null);
  const [topTherapists, setTopTherapists] = useState<ITopTherapist[]>([]);
  const [topMembers, setTopMembers] = useState<ITopMember[]>([]);
  const [paymentMethods, setPaymentMethods] =
    useState<IPaymentMethodTotal | null>(null);
  const [recentSales, setRecentSales] = useState<IRecentSale[]>([]);
  const [recentSessions, setRecentSessions] = useState<IRecentSession[]>([]);
  const [peakHours, setPeakHours] = useState<IPeakHour | null>(null);
  const [customerSegmentation, setCustomerSegmentation] =
    useState<ICustomerSegmentation | null>(null);
  const [topServices, setTopServices] = useState<ITopService[]>([]);

  // Helper: hitung dateRange berdasarkan period
  function getDateRangeForPeriod(
    p: "daily" | "weekly" | "monthly",
  ): [dayjs.Dayjs, dayjs.Dayjs] {
    const end = dayjs();
    if (p === "daily") return [end.subtract(7, "day"), end];
    if (p === "weekly") return [end.subtract(4, "week"), end];
    return [end.subtract(6, "month"), end];
  }

  // Saat period berubah → update dateRange (fetchData akan terpanggil otomatis via useEffect dateRange)
  function handlePeriodChange(p: "daily" | "weekly" | "monthly") {
    setPeriod(p);
    setDateRange(getDateRangeForPeriod(p));
  }

  // Satu useEffect untuk semua perubahan
  useEffect(() => {
    fetchData();
  }, [dateRange, period]);

  const fetchData = async () => {
    setLoading(true);

    const baseParams = {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
    };

    // Only sales performance uses period
    const salesParams = { ...baseParams, period };

    try {
      const [
        summaryRes,
        salesRes,
        therapistsRes,
        paymentMethodsRes,
        salesRecentRes,
        sessionsRecentRes,
        membersRes,
        peakRes,
        segmentRes,
        topServicesRes,
      ] = await Promise.all([
        GetSummaryRevenueService(),
        GetSalesPerformanceService(salesParams),
        GetTopTherapistsService(baseParams),
        GetPaymentMethodTotalsService(baseParams),
        GetRecentSalesService(baseParams),
        GetRecentSessionsService(baseParams),
        GetTopMembersService(baseParams),
        GetPeakHoursService(baseParams),
        GetCustomerSegmentationService(baseParams),
        GetTopServicesService(baseParams),
      ]);

      if (summaryRes.meta.success) setSummary(summaryRes.data);
      if (salesRes.meta.success) setSalesPerf(salesRes.data);
      if (therapistsRes.meta.success) {
        const d =
          typeof therapistsRes.data === "object" &&
          therapistsRes.data !== null &&
          "pageData" in therapistsRes.data
            ? therapistsRes.data.pageData
            : therapistsRes.data;
        setTopTherapists(
          d.filter((t: ITopTherapist) => t.name && t.employeeCode),
        );
      }
      if (paymentMethodsRes.meta.success)
        setPaymentMethods(paymentMethodsRes.data);
      if (salesRecentRes.meta.success) {
        const d =
          typeof salesRecentRes.data === "object" &&
          salesRecentRes.data !== null &&
          "pageData" in salesRecentRes.data
            ? salesRecentRes.data.pageData
            : salesRecentRes.data;
        setRecentSales(d);
      }
      if (sessionsRecentRes.meta.success) {
        const d =
          typeof sessionsRecentRes.data === "object" &&
          sessionsRecentRes.data !== null &&
          "pageData" in sessionsRecentRes.data
            ? sessionsRecentRes.data.pageData
            : sessionsRecentRes.data;
        setRecentSessions(d);
      }
      if (membersRes.meta.success) {
        const d =
          typeof membersRes.data === "object" &&
          membersRes.data !== null &&
          "pageData" in membersRes.data
            ? membersRes.data.pageData
            : membersRes.data;
        setTopMembers(d);
      }
      if (peakRes.meta.success) setPeakHours(peakRes.data);
      if (segmentRes.meta.success) setCustomerSegmentation(segmentRes.data);
      if (topServicesRes.meta.success) {
        const d =
          typeof topServicesRes.data === "object" &&
          topServicesRes.data !== null &&
          "pageData" in topServicesRes.data
            ? topServicesRes.data.pageData
            : topServicesRes.data;
        setTopServices(d);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when dateRange changes (all widgets)
  useEffect(() => {
    fetchData();
  }, [dateRange]);

  // Re-fetch only sales performance when period changes
  const fetchSalesOnly = async () => {
    const salesParams = {
      startDate: dateRange[0].format("YYYY-MM-DD"),
      endDate: dateRange[1].format("YYYY-MM-DD"),
      period,
    };
    try {
      const salesRes = await GetSalesPerformanceService(salesParams);
      if (salesRes.meta.success) setSalesPerf(salesRes.data);
    } catch (err) {
      console.error("Error fetching sales performance:", err);
    }
  };

  useEffect(() => {
    fetchSalesOnly();
  }, [period]);

  // ─── chart options ──────────────────────────────────────────────────────────

  const salesChartOptions = useMemo(
    () => ({
      chart: {
        id: "sales-performance",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      xaxis: {
        categories: salesPerf?.labels || [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
      },
      yaxis: [
        {
          title: {
            text: "Revenue",
            style: { fontWeight: 500, color: "#94a3b8", fontSize: "11px" },
          },
          labels: {
            style: { colors: "#94a3b8", fontSize: "11px" },
            formatter: (val: number) => fmtShort(val),
          },
        },
        {
          opposite: true,
          title: {
            text: "Qty sesi",
            style: { fontWeight: 500, color: "#94a3b8", fontSize: "11px" },
          },
          labels: {
            style: { colors: "#94a3b8", fontSize: "11px" },
            formatter: (val: number) => `${val}`,
          },
        },
      ],
      colors: ["#1D9E75", "#FBBF24"],
      plotOptions: {
        bar: { borderRadius: 5, columnWidth: "40%" },
      },
      dataLabels: { enabled: false },
      stroke: { width: [0, 0], curve: "smooth" as const },
      grid: { borderColor: "#f1f5f9", strokeDashArray: 3 },
      legend: { show: false },
      tooltip: {
        y: {
          formatter: (val: number, opts: any) =>
            opts.seriesIndex === 0 ? fmt(val) : `${val} sesi`,
        },
      },
    }),
    [salesPerf],
  );

  const salesChartSeries = useMemo(
    () => [
      { name: "Revenue", type: "bar", data: salesPerf?.sales || [] },
      { name: "Qty Sesi", type: "bar", data: salesPerf?.quantities || [] },
    ],
    [salesPerf],
  );

  const paymentChartOptions = useMemo(
    () => ({
      chart: { id: "payment-methods", fontFamily: "inherit" },
      labels: paymentMethods?.labels || [],
      colors: ["#1D9E75", "#378ADD", "#7F77DD", "#BA7517", "#D85A30"],
      legend: { show: false },
      stroke: { show: false },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { fontSize: "12px", fontWeight: 500 },
        dropShadow: { enabled: false },
      },
      tooltip: { y: { formatter: (val: number) => fmt(val) } },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                fontSize: "12px",
                color: "#94a3b8",
                formatter: (w: any) =>
                  fmtShort(
                    w.globals.seriesTotals.reduce(
                      (a: number, b: number) => a + b,
                      0,
                    ),
                  ),
              },
            },
          },
        },
      },
    }),
    [paymentMethods],
  );

  const peakChartOptions = useMemo(
    () => ({
      chart: {
        id: "peak-hours",
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: "inherit",
      },
      xaxis: {
        categories: peakHours?.labels || [],
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: "#94a3b8", fontSize: "11px" } },
      },
      yaxis: {
        labels: {
          style: { colors: "#94a3b8", fontSize: "11px" },
        },
      },
      colors: ["#7F77DD"],
      stroke: { curve: "smooth" as const, width: 2 },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.02,
          stops: [40, 100],
        },
      },
      grid: { borderColor: "#f1f5f9", strokeDashArray: 3 },
      markers: { size: 3, strokeWidth: 0 },
      dataLabels: { enabled: false },
      legend: { show: false },
      tooltip: { y: { formatter: (val: number) => `${val} sesi` } },
    }),
    [peakHours],
  );

  const segmentChartOptions = useMemo(
    () => ({
      chart: { id: "segmentation", fontFamily: "inherit" },
      labels: ["Pelanggan Baru", "Pelanggan Kembali"],
      colors: ["#1D9E75", "#378ADD"],
      legend: { show: false },
      stroke: { show: false },
      dataLabels: { enabled: false },
      plotOptions: {
        pie: {
          donut: {
            size: "72%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                fontSize: "12px",
                color: "#94a3b8",
                formatter: () => `${customerSegmentation?.totalCustomers ?? 0}`,
              },
            },
          },
        },
      },
    }),
    [customerSegmentation],
  );

  const topServicesChartOptions = useMemo(
    () => ({
      chart: {
        id: "top-services",
        toolbar: { show: false },
        fontFamily: "inherit",
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: true,
          distributed: true,
          barHeight: "50%",
        },
      },
      colors: ["#1D9E75", "#378ADD", "#7F77DD", "#BA7517", "#D85A30"],
      xaxis: {
        categories: topServices.slice(0, 5).map((s) => s.serviceName),
        labels: {
          style: { colors: "#94a3b8", fontSize: "11px" },
          formatter: (val: number) => fmtShort(val),
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: "#1e293b", fontSize: "12px", fontWeight: 500 },
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "end" as const,
        style: { colors: ["#fff"], fontWeight: 500, fontSize: "11px" },
        formatter: (val: number) => fmtShort(val),
        offsetX: -8,
        dropShadow: { enabled: false },
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 3,
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
      legend: { show: false },
      tooltip: { y: { formatter: (val: number) => fmt(val) } },
    }),
    [topServices],
  );

  const topServicesSeries = useMemo(
    () => [
      {
        name: "Revenue",
        data: topServices.slice(0, 5).map((s) => s.totalRevenue),
      },
    ],
    [topServices],
  );

  // ─── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="gs-dash">
      {/* ── top bar ── */}
      <div className="gs-topbar">
        <div>
          <h1 className="gs-heading">Dashboard</h1>
          <p className="gs-subheading">The Green Spa Management System</p>
        </div>
        <div className="gs-topbar-right">
          <RangePicker
            value={dateRange}
            onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
            allowClear={false}
            className="gs-rangepicker"
          />
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="gs-kpi-grid">
        <KpiCard
          label="Revenue hari ini"
          value={fmt(summary?.todayRevenue ?? 0)}
          growth={summary?.todayGrowth}
          icon="fa-money-bill-wave"
          accent="teal"
        />
        <KpiCard
          label="Revenue bulan ini"
          value={fmt(summary?.monthRevenue ?? 0)}
          growth={summary?.monthGrowth}
          icon="fa-chart-line"
          accent="blue"
        />
        <KpiCard
          label="Rata-rata transaksi"
          value={fmt(summary?.avgTransaction ?? 0)}
          growth={summary?.avgGrowth}
          icon="fa-hand-holding-dollar"
          accent="purple"
        />
        <KpiCard
          label="Total transaksi"
          value={summary?.totalTransactions ?? 0}
          growth={summary?.transactionGrowth}
          icon="fa-receipt"
          accent="amber"
        />
      </div>

      {/* ── row 1: sales chart + payment donut ── */}
      <div className="gs-row gs-row-2-1">
        {/* Sales chart */}
        <div className="gs-card">
          <div className="gs-card-header">
            <span className="gs-card-title">Performa penjualan</span>
            <div className="gs-legend">
              <span className="gs-legend-item">
                <span
                  className="gs-legend-dot"
                  style={{ background: "#1D9E75" }}
                />
                Revenue
              </span>
              <span className="gs-legend-item">
                <span
                  className="gs-legend-dot"
                  style={{ background: "#FBBF24" }}
                />
                Qty sesi
              </span>

              <div className="gs-period-tabs">
                {(["daily", "weekly", "monthly"] as const).map((p) => (
                  <button
                    key={p}
                    className={`gs-period-btn${period === p ? " active" : ""}`}
                    onClick={() => handlePeriodChange(p)}
                  >
                    {p === "daily"
                      ? "Harian"
                      : p === "weekly"
                        ? "Mingguan"
                        : "Bulanan"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : salesPerf && salesPerf.labels.length > 0 ? (
            <DynamicChart
              type="bar"
              options={salesChartOptions}
              series={salesChartSeries}
              height={280}
            />
          ) : (
            <Empty description="Tidak ada data penjualan" />
          )}
        </div>

        {/* Payment donut */}
        <div className="gs-card">
          <div className="gs-card-title mb-3">Metode pembayaran</div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : paymentMethods && paymentMethods.labels.length > 0 ? (
            <>
              <DynamicChart
                type="donut"
                options={paymentChartOptions}
                series={paymentMethods.values}
                height={240}
              />
              <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-gray-600">
                {paymentMethods.labels.map((label, i) => {
                  const colors = [
                    "#1D9E75",
                    "#378ADD",
                    "#7F77DD",
                    "#BA7517",
                    "#D85A30",
                  ];
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: colors[i] }}
                      />
                      <span>{label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <Empty description="Tidak ada data pembayaran" />
          )}
        </div>
      </div>

      {/* ── row 2: peak hours + segmentation ── */}
      <div className="gs-row gs-row-2-1">
        {/* Peak hours */}
        <div className="gs-card">
          <div className="gs-card-title" style={{ marginBottom: "0.75rem" }}>
            Jam sibuk
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : peakHours && peakHours.labels.length > 0 ? (
            <DynamicChart
              type="area"
              options={peakChartOptions}
              series={[{ name: "Sesi", data: peakHours.values }]}
              height={240}
            />
          ) : (
            <Empty description="Tidak ada data jam sibuk" />
          )}
        </div>

        {/* Customer segmentation */}
        <div className="gs-card">
          <div className="gs-card-title" style={{ marginBottom: "0.75rem" }}>
            Segmentasi pelanggan
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : customerSegmentation &&
            customerSegmentation.totalCustomers > 0 ? (
            <>
              <DynamicChart
                type="donut"
                options={segmentChartOptions}
                series={[
                  customerSegmentation.newCustomers,
                  customerSegmentation.returningCustomers,
                ]}
                height={200}
              />
              <div className="gs-seg-grid">
                <div
                  className="gs-seg-box"
                  style={{ color: "#0F6E56", background: "#E1F5EE" }}
                >
                  <div className="gs-seg-label">Baru</div>
                  <div className="gs-seg-val">
                    {customerSegmentation.newPercentage}%
                  </div>
                  <div className="gs-seg-count">
                    {customerSegmentation.newCustomers} pelanggan
                  </div>
                </div>
                <div
                  className="gs-seg-box"
                  style={{ color: "#185FA5", background: "#E6F1FB" }}
                >
                  <div className="gs-seg-label">Kembali</div>
                  <div className="gs-seg-val">
                    {customerSegmentation.returningPercentage}%
                  </div>
                  <div className="gs-seg-count">
                    {customerSegmentation.returningCustomers} pelanggan
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Empty description="Tidak ada data pelanggan" />
          )}
        </div>
      </div>

      {/* ── row 3: top services (full width) ── */}
      <div className="gs-row">
        <div className="gs-card">
          <div className="gs-card-header">
            <span className="gs-card-title">Top 5 layanan</span>
            <span className="gs-card-hint">berdasarkan revenue</span>
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : topServices.length > 0 ? (
            <DynamicChart
              type="bar"
              options={topServicesChartOptions}
              series={topServicesSeries}
              height={280}
            />
          ) : (
            <Empty description="Tidak ada data layanan" />
          )}
        </div>
      </div>

      {/* ── row 4: recent sales + top members ── */}
      <div className="gs-row gs-row-2">
        {/* Recent sales */}
        <div className="gs-card gs-card-flush">
          <div className="gs-card-header gs-card-header-pad">
            <span className="gs-card-title">Penjualan terbaru</span>
          </div>
          <Table
            dataSource={recentSales.slice(0, 5)}
            loading={loading}
            pagination={false}
            rowKey="id"
            className="gs-table"
            columns={[
              {
                title: "Kode",
                dataIndex: "saleCode",
                key: "saleCode",
                render: (text) => (
                  <span className="gs-code">{text.split("-")[0]}</span>
                ),
              },
              {
                title: "Member",
                dataIndex: "memberName",
                key: "memberName",
                render: (text, record) => (
                  <div>
                    <div className="gs-name">{text}</div>
                    <div className="gs-muted">{record.memberPhone}</div>
                  </div>
                ),
              },
              {
                title: "Total",
                dataIndex: "grandTotal",
                key: "grandTotal",
                render: (val) => <span className="gs-amount">{fmt(val)}</span>,
              },
              {
                title: "Status",
                dataIndex: "paymentStatusName",
                key: "paymentStatus",
                render: (text, record) => (
                  <Badge
                    color={
                      record.paymentStatus === "paid" ? "#1D9E75" : "#BA7517"
                    }
                    text={<span className="gs-badge-text">{text}</span>}
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Top members */}
        <div className="gs-card">
          <div className="gs-card-title" style={{ marginBottom: "1rem" }}>
            Member loyal
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : topMembers.length > 0 ? (
            <div className="gs-list">
              {topMembers.slice(0, 5).map((member, idx) => (
                <div key={idx} className="gs-list-item">
                  <Avatar
                    name={member.name || "?"}
                    variant={AVATAR_VARIANTS[idx]}
                  />
                  <div className="gs-list-body">
                    <div className="gs-name">
                      {member.name || "Unknown Member"}
                    </div>
                    <div className="gs-muted">{member.phone}</div>
                  </div>
                  <div className="gs-list-right">
                    <div className="gs-amount">
                      {fmt(member.totalAmountSpent)}
                    </div>
                    <div className="gs-muted">
                      {member.transactionCount} transaksi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Belum ada data member" />
          )}
        </div>
      </div>

      {/* ── row 5: recent sessions + top therapists ── */}
      <div className="gs-row gs-row-2">
        {/* Recent sessions */}
        <div className="gs-card gs-card-flush">
          <div className="gs-card-header gs-card-header-pad">
            <span className="gs-card-title">Sesi terkini</span>
          </div>
          <Table
            dataSource={recentSessions.slice(0, 5)}
            loading={loading}
            pagination={false}
            rowKey="id"
            className="gs-table"
            columns={[
              {
                title: "Waktu",
                dataIndex: "scheduledTime",
                key: "scheduledTime",
                render: (text, record) => (
                  <div>
                    <div className="gs-name">
                      {dayjs(record.sessionDate).format("DD MMM")}
                    </div>
                    <div className="gs-muted">{text.split(".")[0]}</div>
                  </div>
                ),
              },
              {
                title: "Member",
                dataIndex: "memberName",
                key: "memberName",
                render: (text) => <span className="gs-name">{text}</span>,
              },
              {
                title: "Layanan",
                dataIndex: "serviceName",
                key: "serviceName",
                render: (text) => (
                  <span className="gs-muted gs-truncate">{text}</span>
                ),
              },
              {
                title: "Status",
                dataIndex: "statusName",
                key: "status",
                render: (text, record) => {
                  const cls =
                    record.status === "completed"
                      ? "gs-pill gs-pill-green"
                      : record.status === "claimed"
                        ? "gs-pill gs-pill-blue"
                        : "gs-pill gs-pill-amber";
                  return <span className={cls}>{text}</span>;
                },
              },
            ]}
          />
        </div>

        {/* Top therapists */}
        <div className="gs-card">
          <div className="gs-card-title" style={{ marginBottom: "1rem" }}>
            Top therapist
          </div>
          {loading ? (
            <div className="gs-spin-wrap">
              <Spin />
            </div>
          ) : topTherapists.length > 0 ? (
            <div className="gs-list">
              {topTherapists.slice(0, 5).map((therapist, idx) => (
                <div key={idx} className="gs-list-item">
                  <Avatar
                    name={therapist.name || "?"}
                    variant={AVATAR_VARIANTS[idx]}
                  />
                  <div className="gs-list-body">
                    <div className="gs-name">
                      {therapist.name || "Unknown Therapist"}
                    </div>
                    <div className="gs-muted gs-code-small">
                      {therapist.employeeCode}
                    </div>
                  </div>
                  <div className="gs-list-right">
                    <div className="gs-rating">
                      <i className="fa-solid fa-star" />
                      {therapist.averageRate}
                    </div>
                    <div className="gs-muted">
                      {therapist.totalSession} sesi
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="Belum ada data terapis" />
          )}
        </div>
      </div>

      {/* ── global styles ── */}
      <style jsx global>{`
        .gs-dash {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1.5rem 1.75rem;
          min-height: 100vh;
        }

        /* top bar */
        .gs-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 1.5rem;
        }
        .gs-heading {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .gs-subheading {
          font-size: 13px;
          color: #94a3b8;
          margin: 2px 0 0;
        }
        .gs-topbar-right {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .gs-period-tabs {
          display: flex;
          gap: 2px;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 3px;
        }
        .gs-period-btn {
          border: none;
          background: none;
          padding: 5px 14px;
          border-radius: 7px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          color: #94a3b8;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .gs-period-btn.active {
          background: #f1f5f9;
          color: #1d9e75;
        }
        .gs-rangepicker {
          background: #fff !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          font-size: 13px !important;
        }

        /* KPI grid */
        .gs-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          margin-bottom: 1rem;
        }
        .kpi-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          position: relative;
          overflow: hidden;
        }
        .kpi-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          margin-bottom: 0.75rem;
        }
        .kpi-label {
          font-size: 12px;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .kpi-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .kpi-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 9px;
          border-radius: 100px;
          margin-top: 10px;
        }
        .kpi-badge.up {
          background: #e1f5ee;
          color: #0f6e56;
        }
        .kpi-badge.dn {
          background: #fcebeb;
          color: #a32d2d;
        }

        /* layout rows */
        .gs-row {
          display: grid;
          gap: 10px;
          margin-bottom: 1rem;
        }
        .gs-row-2-1 {
          grid-template-columns: 2fr 1fr;
        }
        .gs-row-2 {
          grid-template-columns: 1fr 1fr;
        }

        /* cards */
        .gs-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          overflow: hidden;
        }
        .gs-card-flush {
          padding: 0;
        }
        .gs-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }
        .gs-card-header-pad {
          padding: 1.25rem 1.5rem 0.75rem;
        }
        .gs-card-title {
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .gs-card-hint {
          font-size: 11px;
          color: #94a3b8;
        }
        .gs-spin-wrap {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* legend */
        .gs-legend {
          display: flex;
          gap: 12px;
        }
        .gs-legend-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #94a3b8;
        }
        .gs-legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          display: inline-block;
          flex-shrink: 0;
        }

        /* segmentation grid */
        .gs-seg-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 12px;
        }
        .gs-seg-box {
          border-radius: 10px;
          padding: 10px 12px;
          text-align: center;
        }
        .gs-seg-label {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 4px;
        }
        .gs-seg-val {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .gs-seg-count {
          font-size: 10px;
          opacity: 0.6;
          margin-top: 2px;
        }

        /* list rows */
        .gs-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .gs-list-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 6px;
          border-radius: 10px;
          transition: background 0.15s;
        }
        .gs-list-item:hover {
          background: #f8fafc;
        }
        .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .gs-list-body {
          flex: 1;
          min-width: 0;
        }
        .gs-list-right {
          text-align: right;
          flex-shrink: 0;
        }

        /* text styles */
        .gs-name {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .gs-muted {
          font-size: 11px;
          color: #94a3b8;
        }
        .gs-amount {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
        }
        .gs-code {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          font-family: monospace;
        }
        .gs-code-small {
          font-size: 10px;
          font-weight: 600;
          color: #1d9e75;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .gs-badge-text {
          font-size: 11px;
          font-weight: 600;
        }
        .gs-truncate {
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 140px;
        }
        .gs-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
          color: #ba7517;
        }
        .gs-rating i {
          font-size: 10px;
        }

        /* status pills */
        .gs-pill {
          font-size: 10px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: inline-block;
          white-space: nowrap;
        }
        .gs-pill-green {
          background: #e1f5ee;
          color: #0f6e56;
        }
        .gs-pill-blue {
          background: #e6f1fb;
          color: #185fa5;
        }
        .gs-pill-amber {
          background: #faeeda;
          color: #854f0b;
        }

        /* table overrides */
        .gs-table .ant-table {
          background: transparent;
          font-size: 13px;
        }
        .gs-table .ant-table-thead > tr > th {
          background: #f8fafc;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid #f1f5f9;
          padding: 10px 20px;
        }
        .gs-table .ant-table-tbody > tr > td {
          padding: 10px 20px;
          border-bottom: 1px solid #f8fafc;
        }
        .gs-table .ant-table-tbody > tr:last-child > td {
          border-bottom: none;
        }
        .gs-table .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
        .gs-table ::-webkit-scrollbar {
          display: none;
        }
        .gs-table {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* responsive */
        @media (max-width: 900px) {
          .gs-row-2-1,
          .gs-row-2 {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .gs-dash {
            padding: 1rem;
          }
          .gs-kpi-grid {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>
    </div>
  );
}
