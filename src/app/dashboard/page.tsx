'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { DatePicker, Spin, Empty, Table, Badge, Card, Row, Col, Space, Typography } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { DynamicChart } from '@afx/components/dynamic/chart-loader';
import { 
    GetSummaryRevenueService, 
    GetSalesPerformanceService, 
    GetTopTherapistsService, 
    GetPaymentMethodTotalsService, 
    GetRecentSalesService, 
    GetRecentSessionsService 
} from '@afx/services/dashboard.service';
import { 
    ISummaryRevenue, 
    ISalesPerformance, 
    ITopTherapist, 
    IPaymentMethodTotal, 
    IRecentSale, 
    IRecentSession 
} from '@afx/interfaces/dashboard.iface';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function Dashboard() {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(7, 'day'),
        dayjs()
    ]);
    const [loading, setLoading] = useState(true);
    
    const [summary, setSummary] = useState<ISummaryRevenue | null>(null);
    const [salesPerf, setSalesPerf] = useState<ISalesPerformance | null>(null);
    const [topTherapists, setTopTherapists] = useState<ITopTherapist[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodTotal | null>(null);
    const [recentSales, setRecentSales] = useState<IRecentSale[]>([]);
    const [recentSessions, setRecentSessions] = useState<IRecentSession[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const params = {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            period: 'daily' as const
        };

        try {
            const [
                summaryRes,
                salesRes,
                therapistsRes,
                paymentsRes,
                salesRecentRes,
                sessionsRecentRes
            ] = await Promise.all([
                GetSummaryRevenueService(),
                GetSalesPerformanceService(params),
                GetTopTherapistsService(params),
                GetPaymentMethodTotalsService(params),
                GetRecentSalesService(params),
                GetRecentSessionsService(params)
            ]);

            if (summaryRes.meta.success) setSummary(summaryRes.data);
            if (salesRes.meta.success) setSalesPerf(salesRes.data);
            if (therapistsRes.meta.success) setTopTherapists(therapistsRes.data);
            if (paymentsRes.meta.success) setPaymentMethods(paymentsRes.data);
            if (salesRecentRes.meta.success) setRecentSales(salesRecentRes.data);
            if (sessionsRecentRes.meta.success) setRecentSessions(sessionsRecentRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(value);
    };

    const salesChartOptions = useMemo(() => ({
        chart: {
            id: 'sales-performance',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        xaxis: {
            categories: salesPerf?.labels || [],
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: [
            {
                title: { text: 'Revenue' },
                labels: {
                    formatter: (val: number) => formatCurrency(val)
                }
            },
            {
                opposite: true,
                title: { text: 'Quantity' }
            }
        ],
        colors: ['#10b981', '#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '50%'
            }
        },
        dataLabels: { enabled: false },
        stroke: { width: [0, 2] },
        grid: { borderColor: '#f1f5f9' },
        legend: { position: 'top' as const }
    }), [salesPerf]);

    const salesChartSeries = useMemo(() => [
        {
            name: 'Revenue',
            type: 'bar',
            data: salesPerf?.sales || []
        },
        {
            name: 'Quantity',
            type: 'line',
            data: salesPerf?.quantities || []
        }
    ], [salesPerf]);

    const paymentChartOptions = useMemo(() => ({
        chart: { id: 'payment-methods' },
        labels: paymentMethods?.labels || [],
        colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
        legend: { position: 'bottom' as const },
        plotOptions: {
            pie: {
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: (w: any) => {
                                const sum = w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                                return formatCurrency(sum);
                            }
                        }
                    }
                }
            }
        }
    }), [paymentMethods]);

    const summaryCards = [
        {
            title: 'Revenue Hari Ini',
            value: formatCurrency(summary?.todayRevenue || 0),
            growth: summary?.todayGrowth,
            icon: 'fa-money-bill-wave',
            color: 'blue'
        },
        {
            title: 'Revenue Bulan Ini',
            value: formatCurrency(summary?.monthRevenue || 0),
            growth: summary?.monthGrowth,
            icon: 'fa-chart-line',
            color: 'emerald'
        },
        {
            title: 'Rata-rata Transaksi',
            value: formatCurrency(summary?.avgTransaction || 0),
            growth: summary?.avgGrowth,
            icon: 'fa-hand-holding-dollar',
            color: 'purple'
        },
        {
            title: 'Total Transaksi',
            value: summary?.totalTransactions || 0,
            growth: summary?.transactionGrowth,
            icon: 'fa-receipt',
            color: 'orange'
        }
    ];

    const colorMap: Record<string, any> = {
        blue: {
            bg: 'bg-blue-50',
            text: 'text-blue-500',
            hover: 'hover:shadow-blue-500/5',
            blob: 'bg-blue-500/5',
            blobHover: 'group-hover:bg-blue-500/10'
        },
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-500',
            hover: 'hover:shadow-emerald-500/5',
            blob: 'bg-emerald-500/5',
            blobHover: 'group-hover:bg-emerald-500/10'
        },
        purple: {
            bg: 'bg-purple-50',
            text: 'text-purple-500',
            hover: 'hover:shadow-purple-500/5',
            blob: 'bg-purple-500/5',
            blobHover: 'group-hover:bg-purple-500/10'
        },
        orange: {
            bg: 'bg-orange-50',
            text: 'text-orange-500',
            hover: 'hover:shadow-orange-500/5',
            blob: 'bg-orange-500/5',
            blobHover: 'group-hover:bg-orange-500/10'
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Selamat datang di The Green Spa Management System</p>
                </div>
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <RangePicker 
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                        allowClear={false}
                        className="border-none shadow-none"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {summaryCards.map((card, index) => {
                    const styles = colorMap[card.color];
                    return (
                        <div key={index} className={`bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl ${styles.hover} hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                            <div className={`w-12 h-12 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform`}>
                                <i className={`fa-solid ${card.icon}`}></i>
                            </div>
                            <div className="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{card.value}</div>
                            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</div>
                            {card.growth !== undefined && (
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${card.growth >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'} mt-4 w-fit px-2 py-1 rounded-full`}>
                                    <i className={`fa-solid ${card.growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i> {Math.abs(card.growth)}% 
                                    <span className="font-normal text-slate-400 ml-1">vs periode lalu</span>
                                </div>
                            )}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${styles.blob} rounded-full -mr-16 -mt-16 blur-2xl ${styles.blobHover} transition-colors`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Performa Penjualan</h3>
                        <Badge status="processing" text="Real-time" className="font-bold text-xs" />
                    </div>
                    {loading ? <div className="h-[350px] flex items-center justify-center"><Spin /></div> : (
                        salesPerf && salesPerf.labels.length > 0 ? (
                            <DynamicChart 
                                type="bar"
                                options={salesChartOptions}
                                series={salesChartSeries}
                                height={350}
                            />
                        ) : <Empty description="Tidak ada data penjualan" />
                    )}
                </div>
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6">Metode Pembayaran</h3>
                    {loading ? <div className="h-[350px] flex items-center justify-center"><Spin /></div> : (
                        paymentMethods && paymentMethods.labels.length > 0 ? (
                            <DynamicChart 
                                type="donut"
                                options={paymentChartOptions}
                                series={paymentMethods.values}
                                height={350}
                            />
                        ) : <Empty description="Tidak ada data pembayaran" />
                    )}
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Sales */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-8 pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Penjualan Terbaru</h3>
                        <Link href="/dashboard/sales" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <Table 
                            dataSource={recentSales}
                            loading={loading}
                            pagination={false}
                            rowKey="id"
                            className="dashboard-table"
                            columns={[
                                {
                                    title: 'Kode',
                                    dataIndex: 'saleCode',
                                    key: 'saleCode',
                                    render: (text) => <span className="font-bold text-slate-700">{text.split('-')[0]}</span>
                                },
                                {
                                    title: 'Member',
                                    dataIndex: 'memberName',
                                    key: 'memberName',
                                    render: (text, record) => (
                                        <div>
                                            <div className="font-bold text-slate-900">{text}</div>
                                            <div className="text-[10px] text-slate-400">{record.memberPhone}</div>
                                        </div>
                                    )
                                },
                                {
                                    title: 'Total',
                                    dataIndex: 'grandTotal',
                                    key: 'grandTotal',
                                    render: (val) => <span className="font-black text-slate-900">{formatCurrency(val)}</span>
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'paymentStatusName',
                                    key: 'paymentStatus',
                                    render: (text, record) => (
                                        <Badge 
                                            color={record.paymentStatus === 'paid' ? '#10b981' : '#f59e0b'} 
                                            text={text} 
                                            className="text-[10px] font-bold uppercase tracking-wider"
                                        />
                                    )
                                }
                            ]}
                        />
                    </div>
                </div>

                {/* Top Therapists */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-8 pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Top Therapist</h3>
                    </div>
                    <div className="p-8 pt-0 flex flex-col gap-6">
                        {loading ? <Spin className="mt-4" /> : (
                            topTherapists.length > 0 ? topTherapists.map((therapist, idx) => (
                                <div key={idx} className="flex items-center gap-5 group">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold text-lg shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                                        {therapist.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-base font-bold text-slate-900 mb-0.5">{therapist.name}</div>
                                        <div className="text-sm text-slate-500">{therapist.totalSession} Sesi Selesai</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-amber-500">
                                            <i className="fa-solid fa-star text-[10px]"></i>
                                            <span className="text-sm font-black">{therapist.averageRate}</span>
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">{therapist.employeeCode}</div>
                                    </div>
                                </div>
                            )) : <Empty description="Belum ada data terapis" />
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Sessions Row */}
            <div className="mt-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 pb-6 flex items-center justify-between">
                    <h3 className="text-xl font-extrabold text-slate-900 m-0">Sesi Terkini</h3>
                    <Link href="/dashboard/bookings" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link>
                </div>
                <div className="p-0 overflow-x-auto">
                    <Table 
                        dataSource={recentSessions}
                        loading={loading}
                        pagination={false}
                        rowKey="id"
                        className="dashboard-table"
                        columns={[
                            {
                                title: 'Waktu',
                                dataIndex: 'scheduledTime',
                                key: 'scheduledTime',
                                render: (text, record) => (
                                    <div>
                                        <div className="font-bold text-slate-900">{dayjs(record.sessionDate).format('DD MMM')}</div>
                                        <div className="text-[10px] text-slate-400">{text.split('.')[0]}</div>
                                    </div>
                                )
                            },
                            {
                                title: 'Member',
                                dataIndex: 'memberName',
                                key: 'memberName',
                                render: (text) => <span className="font-bold text-slate-700">{text}</span>
                            },
                            {
                                title: 'Layanan',
                                dataIndex: 'serviceName',
                                key: 'serviceName',
                                render: (text) => <span className="text-sm text-slate-600">{text}</span>
                            },
                            {
                                title: 'Terapis',
                                dataIndex: 'therapistName',
                                key: 'therapistName',
                                render: (text) => <Badge status="success" text={text} className="text-xs font-semibold" />
                            },
                            {
                                title: 'Status',
                                dataIndex: 'statusName',
                                key: 'status',
                                render: (text, record) => (
                                    <div className={`px-3 py-1 rounded-full w-fit text-[10px] font-extrabold uppercase tracking-widest border ${
                                        record.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        record.status === 'claimed' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-amber-50 text-amber-600 border-amber-100'
                                    }`}>
                                        {text}
                                    </div>
                                )
                            }
                        ]}
                    />
                </div>
            </div>

            <style jsx global>{`
                .dashboard-table .ant-table {
                    background: transparent;
                }
                .dashboard-table .ant-table-thead > tr > th {
                    background: #f8fafc;
                    color: #64748b;
                    font-size: 11px;
                    text-transform: uppercase;
                    font-weight: 800;
                    letter-spacing: 0.05em;
                    border-bottom: 1px solid #f1f5f9;
                    padding: 16px 24px;
                }
                .dashboard-table .ant-table-tbody > tr > td {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .dashboard-table .ant-table-tbody > tr:hover > td {
                    background: #f1f5f9/30 !important;
                }
            `}</style>
        </div>
    );
}