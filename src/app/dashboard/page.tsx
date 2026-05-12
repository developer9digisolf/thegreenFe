'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { DatePicker, Spin, Empty, Table, Badge, Card, Row, Col, Space, Typography, Select } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { DynamicChart } from '@afx/components/dynamic/chart-loader';
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
    GetTopServicesService
} from '@afx/services/dashboard.service';
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
    ITopService
} from '@afx/interfaces/dashboard.iface';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export default function Dashboard() {
    const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
        dayjs().subtract(7, 'day'),
        dayjs()
    ]);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [loading, setLoading] = useState(true);
    
    const [summary, setSummary] = useState<ISummaryRevenue | null>(null);
    const [salesPerf, setSalesPerf] = useState<ISalesPerformance | null>(null);
    const [topTherapists, setTopTherapists] = useState<ITopTherapist[]>([]);
    const [topMembers, setTopMembers] = useState<ITopMember[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<IPaymentMethodTotal | null>(null);
    const [recentSales, setRecentSales] = useState<IRecentSale[]>([]);
    const [recentSessions, setRecentSessions] = useState<IRecentSession[]>([]);
    const [peakHours, setPeakHours] = useState<IPeakHour | null>(null);
    const [customerSegmentation, setCustomerSegmentation] = useState<ICustomerSegmentation | null>(null);
    const [topServices, setTopServices] = useState<ITopService[]>([]);

    const fetchData = async () => {
        setLoading(true);
        const params = {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD'),
            period: period
        };

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
                topServicesRes
            ] = await Promise.all([
                GetSummaryRevenueService(),
                GetSalesPerformanceService(params),
                GetTopTherapistsService(params),
                GetPaymentMethodTotalsService(params),
                GetRecentSalesService(params),
                GetRecentSessionsService(params),
                GetTopMembersService(params),
                GetPeakHoursService(params),
                GetCustomerSegmentationService(params),
                GetTopServicesService(params)
            ]);

            if (summaryRes.meta.success) setSummary(summaryRes.data);
            if (salesRes.meta.success) setSalesPerf(salesRes.data);
            if (therapistsRes.meta.success) {
                const filtered = therapistsRes.data.filter((t: ITopTherapist) => t.name && t.employeeCode);
                setTopTherapists(filtered);
            }
            if (paymentMethodsRes.meta.success) setPaymentMethods(paymentMethodsRes.data);
            if (salesRecentRes.meta.success) setRecentSales(salesRecentRes.data);
            if (sessionsRecentRes.meta.success) setRecentSessions(sessionsRecentRes.data);
            if (membersRes.meta.success) setTopMembers(membersRes.data);
            if (peakRes.meta.success) setPeakHours(peakRes.data);
            if (segmentRes.meta.success) setCustomerSegmentation(segmentRes.data);
            if (topServicesRes.meta.success) setTopServices(topServicesRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dateRange, period]);

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
                title: { text: 'Revenue', style: { fontWeight: 600, color: '#64748b' } },
                labels: {
                    style: { fontWeight: 500, colors: '#64748b' },
                    formatter: (val: number) => {
                        if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
                        if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
                        return `Rp ${val}`;
                    }
                }
            },
            {
                opposite: true,
                title: { text: 'Quantity', style: { fontWeight: 600, color: '#64748b' } },
                labels: { style: { fontWeight: 500, colors: '#64748b' } }
            }
        ],
        colors: ['#3d6b5f', '#3b82f6'],
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '35%',
                dataLabels: { position: 'top' }
            }
        },
        dataLabels: { enabled: false },
        stroke: { width: [0, 2] },
        grid: { borderColor: '#f1f5f9' },
        legend: { position: 'top' as const },
        tooltip: {
            y: {
                formatter: (val: number, opts: any) => {
                    if (opts.seriesIndex === 0) return formatCurrency(val); // Revenue
                    return val + ' qty'; // Quantity
                }
            }
        }
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
        colors: ['#3d6b5f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
        legend: { 
            position: 'bottom' as const,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            labels: { colors: '#64748b' },
            formatter: (seriesName: string, opts: any) => {
                const val = opts.w.globals.series[opts.seriesIndex];
                return `${seriesName}: ${formatCurrency(val)}`;
            }
        },
        stroke: { show: false },
        dataLabels: {
            enabled: true,
            formatter: (val: any, opts: any) => {
                // Show percentage in data labels but could also show absolute value
                return val.toFixed(1) + '%';
            },
            dropShadow: { enabled: false }
        },
        tooltip: {
            y: {
                formatter: (val: number) => formatCurrency(val)
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
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

    const peakChartOptions = useMemo(() => ({
        chart: { 
            id: 'peak-hours',
            toolbar: { show: false },
            zoom: { enabled: false }
        },
        xaxis: {
            categories: peakHours?.labels || [],
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            title: { text: 'Jumlah Sesi' }
        },
        colors: ['#8b5cf6'],
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [50, 100]
            }
        },
        grid: { borderColor: '#f1f5f9' },
        markers: { size: 4, strokeWidth: 2 }
    }), [peakHours]);

    const segmentChartOptions = useMemo(() => ({
        chart: { id: 'customer-segmentation' },
        labels: ['Baru', 'Kembali'],
        colors: ['#3d6b5f', '#f59e0b'],
        legend: { position: 'bottom' as const },
        stroke: { show: false },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        total: {
                            show: true,
                            label: 'Total',
                            formatter: () => customerSegmentation?.totalCustomers || 0
                        }
                    }
                }
            }
        }
    }), [customerSegmentation]);
    
    const topServicesChartOptions = useMemo(() => ({
        chart: { 
            id: 'top-services',
            toolbar: { show: false },
            fontFamily: 'Inter, sans-serif'
        },
        plotOptions: {
            bar: {
                borderRadius: 12,
                horizontal: true,
                distributed: true,
                barHeight: '55%',
                dataLabels: { 
                    position: 'top', // Inside the bar at the end
                }
            }
        },
        colors: ['#3d6b5f', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
        xaxis: {
            categories: topServices.slice(0, 5).map(s => s.serviceName),
            labels: {
                style: { fontWeight: 600, colors: '#64748b' },
                formatter: (val: number) => {
                    if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
                    if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
                    return `Rp ${val}`;
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
            labels: {
                style: { fontWeight: 700, colors: '#1e293b' }
            }
        },
        dataLabels: {
            enabled: true,
            textAnchor: 'end',
            style: { 
                colors: ['#fff'],
                fontWeight: 800,
                fontSize: '12px'
            },
            formatter: (val: number) => formatCurrency(val),
            offsetX: -10,
            dropShadow: { enabled: true, opacity: 0.3 }
        },
        grid: {
            borderColor: '#f1f5f9',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } }
        },
        tooltip: {
            theme: 'dark',
            y: {
                formatter: (val: number) => formatCurrency(val)
            }
        },
        legend: { show: false }
    }), [topServices]);

    const topServicesSeries = useMemo(() => [{
        name: 'Revenue',
        data: topServices.slice(0, 5).map(s => s.totalRevenue)
    }], [topServices]);

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
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">Dashboard</h1>
                    <p className="text-slate-500 text-sm">Selamat datang di The Green Spa Management System</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                    <div className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Filter Periode</div>
                    <RangePicker 
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange([dates[0]!, dates[1]!])}
                        allowClear={false}
                        className="dashboard-range-picker !bg-slate-50 !border-none"
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {summaryCards.map((card, index) => {
                    const styles = colorMap[card.color];
                    return (
                        <div key={index} className={`bg-white rounded-[2rem] p-5 sm:p-7 shadow-sm border border-slate-100 hover:shadow-xl ${styles.hover} hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden`}>
                            <div className={`w-12 h-12 rounded-2xl ${styles.bg} ${styles.text} flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform`}>
                                <i className={`fa-solid ${card.icon}`}></i>
                            </div>
                            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tighter truncate">{card.value}</div>
                            <div className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider">{card.title}</div>
                            {card.growth !== undefined && (
                                <div className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-bold ${card.growth >= 0 ? 'text-emerald-500 bg-emerald-50' : 'text-red-500 bg-red-50'} mt-4 w-fit px-2 py-1 rounded-full`}>
                                    <i className={`fa-solid ${card.growth >= 0 ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i> {Math.abs(card.growth)}% 
                                    <span className="font-normal text-slate-400 ml-1 hidden sm:inline">vs periode lalu</span>
                                </div>
                            )}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${styles.blob} rounded-full -mr-16 -mt-16 blur-2xl ${styles.blobHover} transition-colors`}></div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-extrabold text-slate-900 m-0">Performa Penjualan</h3>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <Select 
                                value={period} 
                                onChange={(val: 'daily' | 'weekly' | 'monthly') => {
                                    setPeriod(val);
                                    const end = dayjs();
                                    let start = dayjs();
                                    if (val === 'daily') start = end.subtract(7, 'day');
                                    else if (val === 'weekly') start = end.subtract(1, 'month');
                                    else if (val === 'monthly') start = end.subtract(3, 'month');
                                    setDateRange([start, end]);
                                }}
                                className="period-select"
                                variant="borderless"
                                options={[
                                    { value: 'daily', label: 'Harian' },
                                    { value: 'weekly', label: 'Mingguan' },
                                    { value: 'monthly', label: 'Bulanan' }
                                ]}
                            />
                        </div>
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
                <div className="bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
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

            {/* Row 3: Peak Hours & Customer Segmentation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6">Jam Sibuk</h3>
                    {loading ? <div className="h-[350px] flex items-center justify-center"><Spin /></div> : (
                        peakHours && peakHours.labels.length > 0 ? (
                            <DynamicChart 
                                type="area"
                                options={peakChartOptions}
                                series={[{ name: 'Sesi', data: peakHours.values }]}
                                height={350}
                            />
                        ) : <Empty description="Tidak ada data jam sibuk" />
                    )}
                </div>
                <div className="bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <h3 className="text-xl font-extrabold text-slate-900 mb-6">Segmentasi Pelanggan</h3>
                    {loading ? <div className="h-[350px] flex items-center justify-center"><Spin /></div> : (
                        customerSegmentation && customerSegmentation.totalCustomers > 0 ? (
                            <div className="flex flex-col items-center">
                                <DynamicChart 
                                    type="donut"
                                    options={segmentChartOptions}
                                    series={[customerSegmentation.newCustomers, customerSegmentation.returningCustomers]}
                                    height={350}
                                />
                                <div className="grid grid-cols-2 gap-4 w-full mt-4">
                                    <div className="p-3 bg-emerald-50 rounded-2xl text-center">
                                        <div className="text-xs font-bold text-emerald-600 uppercase">Baru</div>
                                        <div className="text-lg font-black text-slate-900">{customerSegmentation.newPercentage}%</div>
                                    </div>
                                    <div className="p-3 bg-amber-50 rounded-2xl text-center">
                                        <div className="text-xs font-bold text-amber-600 uppercase">Kembali</div>
                                        <div className="text-lg font-black text-slate-900">{customerSegmentation.returningPercentage}%</div>
                                    </div>
                                </div>
                            </div>
                        ) : <div className="h-[350px] flex items-center justify-center"><Empty description="Tidak ada data pelanggan pada periode ini" /></div>
                    )}
                </div>
            </div>

            {/* Detailed Info Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Recent Sales */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Penjualan Terbaru</h3>
                        {/* <Link href="/dashboard/sales" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link> */}
                    </div>
                    <div className="p-0 overflow-x-auto table-wrapper">
                        <Table 
                            dataSource={recentSales.slice(0, 5)}
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
                                            color={record.paymentStatus === 'paid' ? '#3d6b5f' : '#f59e0b'} 
                                            text={text} 
                                            className="text-[10px] font-bold uppercase tracking-wider"
                                        />
                                    )
                                }
                            ]}
                        />
                    </div>
                </div>

                {/* Top Members */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Top Member Loyal</h3>
                    </div>
                    <div className="p-5 sm:p-8 pt-0 flex flex-col gap-4 sm:gap-6">
                        {loading ? <Spin className="mt-4" /> : (
                            topMembers.length > 0 ? topMembers.slice(0, 5).map((member, idx) => (
                                <div key={idx} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                        {member.name ? member.name.split(' ').map(n => n[0]).join('') : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-black text-slate-900 truncate">{member.name || 'Unknown Member'}</div>
                                        <div className="text-[10px] font-bold text-slate-400 mb-2">{member.phone}</div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                <i className="fa-solid fa-crown text-[10px]"></i>
                                                <span className="text-xs font-black">{member.transactionCount} Transaksi</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400">
                                                Total <span className="text-slate-900">{formatCurrency(member.totalAmountSpent)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <Empty description="Belum ada data member" />
                        )}
                    </div>
                </div>
            </div>

            {/* Detailed Info Grid Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                {/* Recent Sessions */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Sesi Terkini</h3>
                        {/* <Link href="/dashboard/bookings" className="text-emerald-500 text-sm font-bold no-underline hover:underline">Lihat Semua</Link> */}
                    </div>
                    <div className="p-0 overflow-x-auto table-wrapper">
                        <Table 
                            dataSource={recentSessions.slice(0, 5)}
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
                                    render: (text) => <span className="text-sm text-slate-600 truncate max-w-[120px] inline-block">{text}</span>
                                },
                                {
                                    title: 'Status',
                                    dataIndex: 'statusName',
                                    key: 'status',
                                    render: (text, record) => (
                                        <div className={`px-2 py-0.5 rounded-full w-fit text-[10px] font-extrabold uppercase tracking-widest border ${
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

                {/* Top Therapists */}
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-5 sm:p-8 pb-4 sm:pb-6 flex items-center justify-between">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Top Therapist</h3>
                    </div>
                    <div className="p-5 sm:p-8 pt-0 flex flex-col gap-4 sm:gap-6">
                        {loading ? <Spin className="mt-4" /> : (
                            topTherapists.length > 0 ? topTherapists.slice(0, 5).map((therapist, idx) => (
                                <div key={idx} className="flex items-center gap-5 p-4 rounded-3xl hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                        {therapist.name ? therapist.name.split(' ').map(n => n[0]).join('') : '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-lg font-black text-slate-900 truncate">{therapist.name || 'Unknown Therapist'}</div>
                                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2">{therapist.employeeCode}</div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                                                <i className="fa-solid fa-star text-[10px]"></i>
                                                <span className="text-xs font-black">{therapist.averageRate}</span>
                                            </div>
                                            <div className="text-xs font-bold text-slate-400">
                                                <span className="text-slate-900">{therapist.totalSession}</span> Sesi Selesai
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )) : <Empty description="Belum ada data terapis" />
                        )}
                    </div>
                </div>
            </div>


            {/* Detailed Info Grid Row 3: Top Services */}
            <div className="grid grid-cols-1 gap-8 mt-8">
                <div className="bg-white rounded-[2.5rem] p-5 sm:p-8 shadow-sm border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-extrabold text-slate-900 m-0">Top 5 Performa Layanan</h3>
                    </div>
                    {loading ? <div className="h-[400px] flex items-center justify-center"><Spin /></div> : (
                        topServices.length > 0 ? (
                            <DynamicChart 
                                type="bar"
                                options={topServicesChartOptions}
                                series={topServicesSeries}
                                height={400}
                            />
                        ) : <Empty description="Tidak ada data layanan" />
                    )}
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
                /* Hide scrollbars for tables and their wrappers */
                .dashboard-table ::-webkit-scrollbar,
                .table-wrapper ::-webkit-scrollbar {
                    display: none;
                }
                .dashboard-table,
                .table-wrapper {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .period-select {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 4px 8px;
                    font-weight: 700;
                    color: #3d6b5f;
                }
                .period-select .ant-select-selection-item {
                    color: #3d6b5f !important;
                }
                .dashboard-range-picker {
                    background: #f8fafc;
                    border: none;
                    border-radius: 12px;
                    padding: 6px 12px;
                }
                .dashboard-range-picker:hover, .dashboard-range-picker-focused {
                    background: #f1f5f9;
                    box-shadow: none;
                }
            `}</style>
        </div>
    );
}