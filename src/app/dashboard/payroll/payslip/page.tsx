"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Typography, Button, Tag, App, Select } from "antd";
import {
  FileTextOutlined,
  ReloadOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import {
  GetPayslipsService,
  GetPayslipByIdService,
  GetPayrollPeriodsService,
} from "@afx/services/payroll.service";
import {
  IPayslip,
  IPayslipPaginationRequest,
  IPayrollPeriod,
  IPayrollPeriodPaginationRequest,
} from "@afx/interfaces/payroll.iface";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";

export default function PayslipPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { notification } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<IPayslip[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [payrollPeriodCode, setPayrollPeriodCode] = useState<string | null>(
    null,
  );
  const [payrollPeriods, setPayrollPeriods] = useState<IPayrollPeriod[]>([]);
  const [payrollPeriodSearch, setPayrollPeriodSearch] = useState("");
  const [loadingPayrollPeriods, setLoadingPayrollPeriods] = useState(false);

  // Fetch payroll periods with debounce
  const fetchPayrollPeriods = useCallback(
    async (search: string = "") => {
      setLoadingPayrollPeriods(true);
      try {
        const params: IPayrollPeriodPaginationRequest = {
          page: 1,
          pageSize: 100,
          sortColumn: "createdat",
          sortDirection: "desc",
          search,
        };
        const res = await GetPayrollPeriodsService(params);
        if (res.success && res.data) {
          setPayrollPeriods(res.data);
          // Set default to first period if not already set
          if (!payrollPeriodCode && res.data.length > 0) {
            setPayrollPeriodCode(res.data[0].periodCode);
          }
        }
      } catch (err: any) {
        notification.error({
          message: "Gagal Memuat Periode Payroll",
          description: err?.message || "Terjadi kesalahan",
        });
      } finally {
        setLoadingPayrollPeriods(false);
      }
    },
    [payrollPeriodCode],
  );

  // Debounce function for search
  const debounce = useCallback(
    (func: (...args: any[]) => void, delay: number) => {
      let timeoutId: NodeJS.Timeout;
      return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    },
    [],
  );

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((search: string) => {
      fetchPayrollPeriods(search);
    }, 1500),
    [debounce, fetchPayrollPeriods],
  );

  useEffect(() => {
    const periodCode = searchParams?.get("PayrollPeriodCode");
    if (periodCode) {
      setPayrollPeriodCode(periodCode);
    }
    fetchPayrollPeriods();
  }, [searchParams, fetchPayrollPeriods]);

  // Handle payroll period search with debounce
  useEffect(() => {
    if (payrollPeriodSearch) {
      debouncedSearch(payrollPeriodSearch);
    } else {
      fetchPayrollPeriods("");
    }
  }, [payrollPeriodSearch, debouncedSearch, fetchPayrollPeriods]);

  const fetchData = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    search = searchQuery,
  ) => {
    setLoading(true);
    try {
      const params: IPayslipPaginationRequest = {
        page,
        pageSize,
        sortColumn: "createdat",
        sortDirection: "desc",
        search,
      };

      if (payrollPeriodCode) {
        params.PayrollPeriodCode = payrollPeriodCode;
      }

      const res = await GetPayslipsService(params);
      if (res.success) {
        setData(res.data);
        setPagination({
          current: res.pagination?.currentPage || 1,
          pageSize: res.pagination?.pageSize || 10,
          total: res.pagination?.total || 0,
        });
      }
    } catch (err: any) {
      notification.error({
        title: "Gagal Memuat Data",
        description: err?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, payrollPeriodCode]);

  const formatCurrency = (amount: number) =>
    `Rp ${amount?.toLocaleString("id-ID", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateString: string | null) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleDateString("id-ID", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "default",
      sent: "blue",
      viewed: "cyan",
      paid: "green",
    };
    return colors[status?.toLowerCase()] || "default";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Draft",
      sent: "Terkirim",
      viewed: "Dilihat",
      paid: "Dibayar",
    };
    return labels[status?.toLowerCase()] || status;
  };

  const handleViewDetail = async (record: IPayslip) => {
    router.push(`/dashboard/payroll/payslip/${record.id}`);
  };

  const columns: Column[] = [
    {
      key: "payslipCode",
      title: "Kode Payslip",
      width: "200px",
      render: (_: any, record: IPayslip) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-700">{record.payslipCode}</span>
          <span className="text-xs text-slate-400">{record.employeeName}</span>
        </div>
      ),
    },
    {
      key: "payrollPeriodName",
      title: "Periode Payroll",
      width: "180px",
      render: (v: string) => (
        <span className="text-sm text-slate-700">{v}</span>
      ),
    },
    {
      key: "earnings",
      title: "Penghasilan",
      width: "200px",
      align: "right",
      render: (_: any, record: IPayslip) => (
        <div className="text-sm">
          <div className="text-slate-600">
            Kotor: {formatCurrency(record.grossEarnings)}
          </div>
          <div className="font-bold text-slate-900">
            Bersih: {formatCurrency(record.netPay)}
          </div>
        </div>
      ),
    },
    {
      key: "workInfo",
      title: "Info Kerja",
      width: "150px",
      render: (_: any, record: IPayslip) => (
        <div className="text-sm">
          <div className="text-slate-600">Sesi: {record.totalSessions}</div>
          <div className="text-slate-600">Jam: {record.totalHoursWorked}</div>
          <div className="text-slate-600">Hari: {record.daysWorked}</div>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      width: "120px",
      align: "center",
      render: (v: string) => (
        <Tag color={getStatusColor(v)} className="rounded-full px-3">
          {getStatusLabel(v)}
        </Tag>
      ),
    },
    {
      key: "createdAt",
      title: "Tanggal Dibuat",
      width: "140px",
      render: (v: string) => (
        <span className="text-sm text-slate-700">{formatDate(v)}</span>
      ),
    },
    {
      key: "actions",
      title: "Aksi",
      width: "100px",
      align: "center",
      render: (_: any, record: IPayslip) => (
        <div className="flex justify-center gap-2">
          <Button
            type="primary"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Detail
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 lg:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <Typography.Title
            level={2}
            className="!m-0 text-slate-800 font-extrabold tracking-tight"
          >
            Payslip
          </Typography.Title>
          <Typography.Text className="text-slate-400 font-medium">
            Kelola slip gaji karyawan
          </Typography.Text>
          {payrollPeriodCode && (
            <div className="mt-2">
              <Tag color="green" className="rounded-full px-3">
                Periode: {payrollPeriodCode}
              </Tag>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Select
            placeholder="Pilih Periode Payroll"
            value={payrollPeriodCode}
            onChange={(value) => setPayrollPeriodCode(value)}
            loading={loadingPayrollPeriods}
            showSearch
            onSearch={(value) => setPayrollPeriodSearch(value)}
            filterOption={false}
            style={{ width: 300 }}
            className="h-12"
            options={payrollPeriods.map((period) => ({
              label: `${period.periodName} (${period.periodCode})`,
              value: period.periodCode,
            }))}
          />
          <button
            onClick={() => {
              setSearchQuery("");
              fetchData(1, pagination.pageSize, "");
            }}
            className="h-12 rounded-xl px-6 bg-slate-100 border-none font-bold text-slate-500 hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
          >
            <ReloadOutlined /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total Payslip
              </p>
              <p className="text-3xl font-extrabold text-slate-800">
                {pagination.total}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="fa-solid fa-file-invoice-dollar text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total Penghasilan Kotor
              </p>
              <p className="text-2xl font-extrabold text-emerald-600">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.grossEarnings, 0),
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="fa-solid fa-money-bill-trend-up text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total Potongan
              </p>
              <p className="text-2xl font-extrabold text-red-600">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.totalDeductions, 0),
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <i className="fa-solid fa-arrow-trend-down text-xl" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Total Penghasilan Bersih
              </p>
              <p className="text-2xl font-extrabold text-slate-900">
                {formatCurrency(
                  data.reduce((sum, item) => sum + item.netPay, 0),
                )}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
              <i className="fa-solid fa-wallet text-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-slate-100">
        <UseDynamicTable
          columns={columns}
          data={data}
          pageInfo={{
            currentPage: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
          }}
          onPageChange={(p) =>
            setPagination((prev) => ({ ...prev, current: p }))
          }
          onPageSizeChange={(s) =>
            setPagination((prev) => ({ ...prev, pageSize: s, current: 1 }))
          }
          sortState={{ key: null, direction: null }}
          onSortChange={() => {}}
          searchPlaceholder="Cari payslip (nama, kode)..."
          searchable={true}
          onSearch={(val) => {
            setSearchQuery(val);
            fetchData(1, pagination.pageSize, val);
          }}
        />
      </div>
    </div>
  );
}
