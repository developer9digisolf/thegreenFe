"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Space,
  Tag,
  Tooltip,
  message,
} from "antd";
import { UsePagination, PageInfo } from "@afx/components/tables/pagination";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { GetTimesheetService } from "@afx/services/timesheet.service";
import {
  IDailyAttendance,
  IEmployeeTimesheet,
  ITimesheetData,
  ITimesheetRequest,
} from "@afx/interfaces/timesheet.iface";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "on_leave"
  | "holiday"
  | "pending";

interface CellConfig {
  label: string;
  bg: string;
  color: string;
  border: string;
}

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AttendanceStatus, CellConfig> = {
  present: { label: "H", bg: "#C0DD97", color: "#27500A", border: "#97C459" },
  late: { label: "T", bg: "#FAC775", color: "#633806", border: "#EF9F27" },
  absent: { label: "", bg: "transparent", color: "#aaa", border: "#ddd" },
  on_leave: { label: "C", bg: "#B5D4F4", color: "#0C447C", border: "#85B7EB" },
  holiday: { label: "L", bg: "#CECBF6", color: "#3C3489", border: "#AFA9EC" },
  pending: { label: "?", bg: "#D3D1C7", color: "#444441", border: "#B4B2A9" },
};

const STATUS_LABEL: Record<AttendanceStatus, string> = {
  present: "Hadir",
  late: "Terlambat",
  absent: "Tidak Hadir",
  on_leave: "Cuti",
  holiday: "Libur",
  pending: "Pending",
};

function getStatusConfig(status: string): CellConfig {
  return STATUS_CONFIG[status as AttendanceStatus] ?? STATUS_CONFIG.absent;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * A single attendance cell (colored dot with optional label)
 */
function AttendanceCell({
  status,
  date,
  isWeekend,
}: {
  status: string;
  date: string;
  isWeekend: boolean;
}) {
  const cfg = getStatusConfig(status);
  const tooltipTitle = `${dayjs(date).format("DD MMM YYYY")} · ${STATUS_LABEL[status as AttendanceStatus] ?? status}`;

  return (
    <Tooltip title={tooltipTitle} placement="top" mouseEnterDelay={0.3}>
      <div
        style={{
          width: 22,
          height: 22,
          margin: "0 auto",
          borderRadius: 4,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 9,
          fontWeight: 600,
          color: cfg.color,
          cursor: "default",
          transition: "transform 0.1s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.25)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        {cfg.label}
      </div>
    </Tooltip>
  );
}

/**
 * Summary badge at the end of each row
 */
function SummaryBadge({
  value,
  color,
  bg,
  title,
}: {
  value: number | string;
  color: string;
  bg: string;
  title: string;
}) {
  return (
    <Tooltip title={title}>
      <div
        style={{
          minWidth: 32,
          padding: "2px 6px",
          borderRadius: 6,
          background: bg,
          color,
          fontSize: 12,
          fontWeight: 600,
          textAlign: "center",
          cursor: "default",
        }}
      >
        {value}
      </div>
    </Tooltip>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────

function Legend() {
  const items: { status: AttendanceStatus; label: string }[] = [
    { status: "present", label: "Hadir" },
    { status: "late", label: "Terlambat" },
    { status: "absent", label: "Tidak Hadir" },
    { status: "on_leave", label: "Cuti" },
    { status: "holiday", label: "Libur" },
  ];

  return (
    <div
      style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}
    >
      {items.map(({ status, label }) => {
        const cfg = STATUS_CONFIG[status];
        return (
          <div
            key={status}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              fontSize: 12,
              color: "#666",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 3,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                flexShrink: 0,
              }}
            />
            {label}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TimesheetCalendarTable() {
  const [loading, setLoading] = useState(false);
  const [timesheetData, setTimesheetData] = useState<ITimesheetData | null>(
    null,
  );
  const [selectedMonth, setSelectedMonth] = useState<Dayjs>(dayjs());
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50); // large page for calendar view

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchTimesheet = async () => {
    setLoading(true);
    try {
      const request: ITimesheetRequest = {
        monthYear: selectedMonth.format("MM-YYYY"),
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
      };
      const response = await GetTimesheetService(request);
      if (response.meta.success) {
        setTimesheetData(response.rawData as unknown as ITimesheetData);
      } else {
        message.error(response.meta.message || "Gagal memuat data timesheet");
      }
    } catch (error: any) {
      message.error(error.message || "Gagal memuat data timesheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchTimesheet();
  };

  // ── Derived values ─────────────────────────────────────────────────────────

  const year = selectedMonth.year();
  const month = selectedMonth.month(); // 0-indexed
  const daysInMonth = selectedMonth.daysInMonth();

  /** Array of day numbers 1..N with metadata */
  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => {
    const d = i + 1;
    const date = dayjs(new Date(year, month, d));
    const dow = date.day(); // 0=Sun
    return { day: d, dow, isWeekend: dow === 0 || dow === 6 };
  });

  /** Build a map date-string → status for each employee */
  function buildAttMap(emp: IEmployeeTimesheet): Record<string, string> {
    const map: Record<string, string> = {};
    (emp.dailyAttendances ?? []).forEach((a: IDailyAttendance) => {
      map[a.date] = a.status;
    });
    return map;
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  const prevMonth = () => setSelectedMonth((m) => m.subtract(1, "month"));
  const nextMonth = () => setSelectedMonth((m) => m.add(1, "month"));

  // ── Render ─────────────────────────────────────────────────────────────────

  const employees = timesheetData?.pageData ?? [];

  return (
    <div style={{ padding: 24 }}>
      {/* ── Page header ── */}
      <h1 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 600 }}>
        Timesheet
      </h1>

      {/* ── Filters ── */}
      <Card style={{ marginBottom: 20 }}>
        <Space size="large" wrap>
          {/* Month picker */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
              Bulan
            </div>
            <DatePicker
              value={selectedMonth}
              onChange={(d) => d && setSelectedMonth(d)}
              picker="month"
              format="MMMM YYYY"
            />
          </div>

          {/* Quick nav */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
              Navigasi
            </div>
            <Space>
              <Button icon={<ChevronLeft size={14} />} onClick={prevMonth} />
              <span
                style={{
                  fontWeight: 500,
                  minWidth: 110,
                  textAlign: "center",
                  display: "inline-block",
                }}
              >
                {MONTHS_ID[month]} {year}
              </span>
              <Button icon={<ChevronRight size={14} />} onClick={nextMonth} />
            </Space>
          </div>

          {/* Search */}
          <div>
            <div style={{ fontWeight: 500, marginBottom: 6, fontSize: 13 }}>
              Cari
            </div>
            <Input
              placeholder="Nama atau kode karyawan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 240 }}
              prefix={<SearchOutlined />}
              allowClear
            />
          </div>

          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={handleSearch}
            loading={loading}
            style={{ marginTop: 22 }}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {/* ── Summary stats ── */}
      {employees.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          {[
            {
              icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
              label: "Total Karyawan",
              value: timesheetData?.pageInfo?.total ?? 0,
              color: "#333",
            },
            {
              icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
              label: "Total Hadir",
              value: employees.reduce(
                (s, e) => s + e.monthlySummary.totalPresent,
                0,
              ),
              color: "#27500A",
            },
            {
              icon: <WarningOutlined style={{ color: "#fa8c16" }} />,
              label: "Total Terlambat",
              value: employees.reduce(
                (s, e) => s + e.monthlySummary.totalLate,
                0,
              ),
              color: "#633806",
            },
            {
              icon: <CloseCircleOutlined style={{ color: "#f5222d" }} />,
              label: "Total Tidak Hadir",
              value: employees.reduce(
                (s, e) => s + e.monthlySummary.totalAbsent,
                0,
              ),
              color: "#a32d2d",
            },
          ].map((stat) => (
            <Card
              key={stat.label}
              size="small"
              style={{ minWidth: 150 }}
              styles={{ body: { padding: "10px 16px" } }}
            >
              <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
                {stat.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 600, color: stat.color }}>
                {stat.icon} {stat.value}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Calendar table ── */}
      <Card styles={{ body: { padding: 0 } }}>
        {loading && (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
            Memuat data...
          </div>
        )}

        {!loading && employees.length === 0 && (
          <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
            Tidak ada data timesheet untuk periode ini.
          </div>
        )}

        {employees.length > 0 && (
          <div>
            {/* Legend */}
            <div style={{ padding: "12px 16px 0" }}>
              <Legend />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  borderCollapse: "collapse",
                  width: "100%",
                  tableLayout: "fixed",
                  minWidth: 900,
                }}
              >
                {/* ── Column widths ── */}
                <colgroup>
                  <col style={{ width: 200 }} />
                  {dayColumns.map(({ day }) => (
                    <col key={day} style={{ width: 30 }} />
                  ))}
                  {/* Summary cols */}
                  <col style={{ width: 40 }} />
                  <col style={{ width: 40 }} />
                  <col style={{ width: 40 }} />
                  <col style={{ width: 52 }} />
                </colgroup>

                {/* ── Header ── */}
                <thead>
                  <tr
                    style={{
                      background: "#fafafa",
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    {/* Employee col */}
                    <th
                      style={{
                        padding: "8px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        fontSize: 12,
                        color: "#555",
                        position: "sticky",
                        left: 0,
                        background: "#fafafa",
                        zIndex: 3,
                        borderRight: "1px solid #f0f0f0",
                      }}
                    >
                      Karyawan
                    </th>

                    {/* Day cols */}
                    {dayColumns.map(({ day, dow }) => (
                      <th
                        key={day}
                        style={{
                          padding: "4px 0",
                          textAlign: "center",
                          borderRight: "1px solid #f0f0f0",
                          background: "#fafafa",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            lineHeight: 1.2,
                          }}
                        >
                          {day}
                        </div>
                        <div
                          style={{
                            fontSize: 9,
                            color: "#aaa",
                            lineHeight: 1.2,
                          }}
                        >
                          {DAYS_ID[dow]}
                        </div>
                      </th>
                    ))}

                    {/* Summary headers */}
                    {[
                      {
                        key: "H",
                        title: "Hadir",
                        color: "#27500A",
                        bg: "#C0DD97",
                      },
                      {
                        key: "T",
                        title: "Terlambat",
                        color: "#633806",
                        bg: "#FAC775",
                      },
                      {
                        key: "A",
                        title: "Tidak Hadir",
                        color: "#888",
                        bg: "#eee",
                      },
                      {
                        key: "Jam",
                        title: "Jam Kerja",
                        color: "#444",
                        bg: "#f5f5f5",
                      },
                    ].map((s) => (
                      <Tooltip key={s.key} title={s.title}>
                        <th
                          style={{
                            padding: "4px 4px",
                            textAlign: "center",
                            fontSize: 11,
                            fontWeight: 600,
                            color: s.color,
                            background: s.bg,
                            borderLeft: "1px solid #f0f0f0",
                            cursor: "default",
                          }}
                        >
                          {s.key}
                        </th>
                      </Tooltip>
                    ))}
                  </tr>
                </thead>

                {/* ── Body ── */}
                <tbody>
                  {employees.map((emp, idx) => {
                    const attMap = buildAttMap(emp);
                    const s = emp.monthlySummary;
                    const isEven = idx % 2 === 0;

                    return (
                      <tr
                        key={emp.employeeId}
                        style={{
                          background: isEven ? "#fff" : "#fafcff",
                          borderBottom: "1px solid #f5f5f5",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#e6f4ff")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = isEven
                            ? "#fff"
                            : "#fafcff")
                        }
                      >
                        {/* Employee info */}
                        <td
                          style={{
                            padding: "6px 12px",
                            position: "sticky",
                            left: 0,
                            background: "inherit",
                            zIndex: 2,
                            borderRight: "1px solid #f0f0f0",
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 13,
                              lineHeight: 1.3,
                            }}
                          >
                            {emp.employeeName}
                          </div>
                          <div
                            style={{
                              fontSize: 11,
                              color: "#888",
                              lineHeight: 1.3,
                            }}
                          >
                            {emp.employeeCode} · {emp.position}
                          </div>
                          <Tag
                            style={{
                              marginTop: 2,
                              fontSize: 10,
                              lineHeight: "16px",
                              padding: "0 5px",
                            }}
                            color="blue"
                          >
                            {emp.department}
                          </Tag>
                        </td>

                        {/* Day cells */}
                        {dayColumns.map(({ day, isWeekend }) => {
                          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                          const status = attMap[dateStr] ?? "absent";
                          return (
                            <td
                              key={day}
                              style={{
                                padding: "4px 2px",
                                textAlign: "center",
                                borderRight: "1px solid #f5f5f5",
                                background: isWeekend
                                  ? "rgba(0,0,0,0.02)"
                                  : "transparent",
                                verticalAlign: "middle",
                              }}
                            >
                              <AttendanceCell
                                status={status}
                                date={dateStr}
                                isWeekend={isWeekend}
                              />
                            </td>
                          );
                        })}

                        {/* Summary cells */}
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 4px",
                            borderLeft: "1px solid #f0f0f0",
                            verticalAlign: "middle",
                          }}
                        >
                          <SummaryBadge
                            value={s.totalPresent}
                            color="#27500A"
                            bg="#C0DD97"
                            title="Total Hadir"
                          />
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 4px",
                            verticalAlign: "middle",
                          }}
                        >
                          <SummaryBadge
                            value={s.totalLate}
                            color="#633806"
                            bg="#FAC775"
                            title="Total Terlambat"
                          />
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 4px",
                            verticalAlign: "middle",
                          }}
                        >
                          <SummaryBadge
                            value={s.totalAbsent}
                            color="#888"
                            bg="#eee"
                            title="Total Tidak Hadir"
                          />
                        </td>
                        <td
                          style={{
                            textAlign: "center",
                            padding: "4px 6px",
                            verticalAlign: "middle",
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#444" }}>
                            {s.totalWorkHours > 0
                              ? `${s.totalWorkHours.toFixed(1)}h`
                              : "–"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {timesheetData?.pageInfo && (
              <div style={{ borderTop: "1px solid #e5e7eb" }}>
                <UsePagination
                  pageInfo={{
                    currentPage: timesheetData.pageInfo.currentPage,
                    path: timesheetData.pageInfo.path,
                    total: timesheetData.pageInfo.total,
                    pageSize: timesheetData.pageInfo.pageSize,
                  }}
                  onPageChange={(page) => setCurrentPage(page)}
                  onPageSizeChange={(size) => setPageSize(size)}
                />
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
