"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  DatePicker,
  Select,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  message,
  Tooltip,
} from "antd";
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs, { Dayjs } from "dayjs";
import { GetTimesheetService } from "@afx/services/timesheet.service";
import {
  TimesheetType,
  ITimesheetData,
  ITimesheetRecord,
  ITimesheetRequest,
} from "@afx/interfaces/timesheet.iface";

export default function TimesheetPage() {
  const [loading, setLoading] = useState(false);
  const [timesheetData, setTimesheetData] = useState<ITimesheetData | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [startDate, setStartDate] = useState<Dayjs>(dayjs().subtract(7, "day"));
  const [endDate, setEndDate] = useState<Dayjs>(dayjs());
  const [timesheetType, setTimesheetType] = useState<TimesheetType>(
    TimesheetType.Daily,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchTimesheet = async () => {
    setLoading(true);
    try {
      const request: ITimesheetRequest = {
        type: timesheetType,
        page: currentPage,
        pageSize: pageSize,
      };

      // Add date parameters based on timesheet type
      if (timesheetType === TimesheetType.Daily) {
        request.date = selectedDate.format("YYYY-MM-DD");
      } else if (timesheetType === TimesheetType.DateRange) {
        request.startDate = startDate.format("YYYY-MM-DD");
        request.endDate = endDate.format("YYYY-MM-DD");
      }

      const response = await GetTimesheetService(request);
      if (response.meta.success) {
        setTimesheetData((response as any).data);
      } else {
        message.error(
          response.meta.message || "Failed to fetch timesheet data",
        );
      }
    } catch (error: any) {
      console.error("Error fetching timesheet:", error);
      message.error(error.message || "Failed to fetch timesheet data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimesheet();
  }, [selectedDate, startDate, endDate, timesheetType, currentPage, pageSize]);

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const getStatusText = (status: string | number) => {
    // Handle both string and number status values from backend
    const statusMap: Record<string | number, string> = {
      0: "present",
      1: "late",
      2: "absent",
      3: "on_leave",
      4: "holiday",
      5: "pending",
      present: "present",
      late: "late",
      absent: "absent",
      on_leave: "on_leave",
      holiday: "holiday",
      pending: "pending",
    };
    return statusMap[status] || "unknown";
  };

  const getStatusTag = (status: string | number) => {
    const statusText = getStatusText(status);
    switch (statusText) {
      case "present":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Present
          </Tag>
        );
      case "absent":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Absent
          </Tag>
        );
      case "late":
        return (
          <Tag icon={<WarningOutlined />} color="warning">
            Late
          </Tag>
        );
      case "on_leave":
        return <Tag color="blue">On Leave</Tag>;
      case "holiday":
        return <Tag color="purple">Holiday</Tag>;
      case "pending":
        return <Tag color="default">Pending</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const formatTime = (time: string | null) => {
    if (!time) return "-";
    return dayjs(time).format("HH:mm:ss");
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes || minutes === 0) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeName",
      key: "employeeName",
      fixed: "left" as const,
      width: 200,
      render: (name: string, record: ITimesheetRecord) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            {record.employeeCode} • {record.position}
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
    },
    {
      title: "Scheduled Time",
      key: "scheduledTime",
      width: 150,
      render: (_: any, record: ITimesheetRecord) => (
        <div>
          <div>{formatTime(record.scheduledStartTime)}</div>
          <div style={{ fontSize: "12px", color: "#888" }}>
            to {formatTime(record.scheduledEndTime)}
          </div>
        </div>
      ),
    },
    {
      title: "Clock In",
      dataIndex: "clockInTime",
      key: "clockInTime",
      width: 120,
      render: (time: string | null) => formatTime(time),
    },
    {
      title: "Clock Out",
      dataIndex: "clockOutTime",
      key: "clockOutTime",
      width: 120,
      render: (time: string | null) => formatTime(time),
    },
    {
      title: "Work Duration",
      dataIndex: "totalWorkMinutes",
      key: "totalWorkMinutes",
      width: 120,
      render: (minutes: number | null) => formatDuration(minutes),
    },
    {
      title: "Break Duration",
      dataIndex: "totalBreakMinutes",
      key: "totalBreakMinutes",
      width: 120,
      render: (minutes: number | null) => formatDuration(minutes),
    },
    {
      title: "Overtime",
      dataIndex: "overtimeMinutes",
      key: "overtimeMinutes",
      width: 100,
      render: (minutes: number | null) => formatDuration(minutes),
    },
    {
      title: "Late",
      dataIndex: "lateMinutes",
      key: "lateMinutes",
      width: 100,
      render: (minutes: number | null) => formatDuration(minutes),
    },
    {
      title: "Early Departure",
      dataIndex: "earlyDepartureMinutes",
      key: "earlyDepartureMinutes",
      width: 130,
      render: (minutes: number | null) => formatDuration(minutes),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      width: 150,
      ellipsis: true,
      render: (notes: string | null) => notes || "-",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 600 }}>
          Timesheet
        </h1>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Space size="large" wrap>
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              Timesheet Type
            </label>
            <Select
              value={timesheetType}
              onChange={setTimesheetType}
              style={{ width: 150 }}
            >
              <Select.Option value={TimesheetType.Daily}>Daily</Select.Option>
              <Select.Option value={TimesheetType.Weekly}>Weekly</Select.Option>
              <Select.Option value={TimesheetType.Monthly}>
                Monthly
              </Select.Option>
              <Select.Option value={TimesheetType.DateRange}>
                Custom
              </Select.Option>
            </Select>
          </div>

          {timesheetType === TimesheetType.Daily && (
            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                Date
              </label>
              <DatePicker
                value={selectedDate}
                onChange={(date) => date && setSelectedDate(date)}
                format="YYYY-MM-DD"
              />
            </div>
          )}

          {timesheetType === TimesheetType.DateRange && (
            <>
              <div>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  Start Date
                </label>
                <DatePicker
                  value={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  format="YYYY-MM-DD"
                />
              </div>
              <div>
                <label
                  style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
                >
                  End Date
                </label>
                <DatePicker
                  value={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  format="YYYY-MM-DD"
                />
              </div>
            </>
          )}

          <Button
            type="primary"
            className="mt-7"
            icon={<CalendarOutlined />}
            onClick={fetchTimesheet}
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      </Card>

      {timesheetData && (
        <>
          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Employees"
                  value={timesheetData.summary.totalEmployees}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Present"
                  value={timesheetData.summary.totalPresent}
                  styles={{ content: { color: "#52c41a" } }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Absent"
                  value={timesheetData.summary.totalAbsent}
                  styles={{ content: { color: "#f5222d" } }}
                  prefix={<CloseCircleOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Work Hours"
                  value={timesheetData.summary.totalWorkHours}
                  precision={1}
                  suffix="hrs"
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Timesheet Table */}
          {timesheetData.dailyRecords.map((dailyRecord) => (
            <Card
              key={dailyRecord.date}
              style={{ marginBottom: 16 }}
              title={
                <Space>
                  <CalendarOutlined />
                  <span>
                    {dayjs(dailyRecord.date).format("dddd, MMMM D, YYYY")}
                  </span>
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title="Present">
                    <Tag color="success">
                      {dailyRecord.dailySummary.totalPresent}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Absent">
                    <Tag color="error">
                      {dailyRecord.dailySummary.totalAbsent}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Late">
                    <Tag color="warning">
                      {dailyRecord.dailySummary.totalLate}
                    </Tag>
                  </Tooltip>
                </Space>
              }
            >
              <Table
                columns={columns}
                dataSource={dailyRecord.records}
                loading={loading}
                rowKey={(record) => `${dailyRecord.date}-${record.employeeId}`}
                pagination={false}
                scroll={{ x: 1400 }}
                size="middle"
              />
            </Card>
          ))}

          {/* Custom Pagination */}
          {timesheetData.pagination && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-4 bg-white border-t border-gray-200 gap-4">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                Menampilkan {Math.max(0, (currentPage - 1) * pageSize + 1)}–
                {Math.min(
                  currentPage * pageSize,
                  timesheetData.pagination.totalDays,
                )}{" "}
                dari {timesheetData.pagination.totalDays} hari
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 order-1 sm:order-2 w-full sm:w-auto">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Tampilkan</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageSize(newSize);
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>hari</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage <= 1}
                    className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage)}
                    className="min-w-[32px] h-8 px-2 text-sm border rounded bg-blue-600 text-white border-blue-600 font-medium transition-colors"
                  >
                    {currentPage}
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          timesheetData.pagination!.totalPages,
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      currentPage >= timesheetData.pagination.totalPages
                    }
                    className="p-1.5 border border-gray-300 rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!timesheetData && !loading && (
        <Card>
          <div style={{ textAlign: "center", padding: 40 }}>
            <p style={{ color: "#888" }}>No timesheet data available</p>
          </div>
        </Card>
      )}
    </div>
  );
}
