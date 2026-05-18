"use client";

import { useState, useEffect } from "react";
import { Select, InputNumber } from "antd";
import { message } from "@afx/utils/antd-global";
import { ICreditPackage, ICreateCreditPackageRequest, IUpdateCreditPackageRequest } from "@afx/interfaces/credit-package.iface";
import { CreditPackageGetAllService, CreditPackageCreateService, CreditPackageUpdateService, CreditPackageDeleteService } from "@afx/services/credit-package.service";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";

export default function MasterCreditPackages() {
    const [packages, setPackages] = useState<ICreditPackage[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [searchText, setSearchText] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<ICreditPackage | null>(null);
    const [formData, setFormData] = useState<{
        code: string;
        name: string;
        description: string;
        payAmount: number;
        creditAmount: number;
        validityDays: number;
        sortOrder: number;
        isActive: boolean;
    }>({
        code: "",
        name: "",
        description: "",
        payAmount: 0,
        creditAmount: 0,
        validityDays: 365,
        sortOrder: 0,
        isActive: true
    });
    const [saving, setSaving] = useState(false);
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: number | null; name: string }>({
        open: false,
        id: null,
        name: ""
    });

    // Fetch Data
    const fetchData = async (page = 1, search?: string) => {
        setLoading(true);
        try {
            const params: any = { page, pageSize: pagination.pageSize };
            if (search) params.search = search;
            
            const res = await CreditPackageGetAllService(params);
            if (res.success) {
                setPackages(res.data);
                setPagination({
                    current: res.pagination?.currentPage || 1,
                    pageSize: res.pagination?.pageSize || 10,
                    total: res.pagination?.total || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch credit packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = () => {
        fetchData(1, searchText);
    };

    // Modal Handlers
    const handleOpenCreateModal = () => {
        setSelectedPackage(null);
        setFormData({
            code: "",
            name: "",
            description: "",
            payAmount: 0,
            creditAmount: 0,
            validityDays: 365,
            sortOrder: 0,
            isActive: true
        });
        setShowAddModal(true);
    };

    const handleOpenEditModal = (pkg: ICreditPackage) => {
        setSelectedPackage(pkg);
        setFormData({
            code: pkg.code || "",
            name: pkg.name,
            description: pkg.description || "",
            payAmount: pkg.payAmount,
            creditAmount: pkg.creditAmount,
            validityDays: pkg.validityDays,
            sortOrder: pkg.sortOrder,
            isActive: pkg.isActive
        });
        setShowAddModal(true);
    };

    // Auto-calculate credit amount when pay amount changes
    const handlePayAmountChange = (value: number | null) => {
        const pay = value || 0;
        setFormData(prev => ({
            ...prev,
            payAmount: pay,
            // If credit amount is less than pay amount, set it equal
            creditAmount: prev.creditAmount < pay ? pay : prev.creditAmount
        }));
    };

    // Save Handler
    const handleSave = async () => {
        // Validation
        if (!formData.name?.trim()) {
            message.warning("Nama paket wajib diisi");
            return;
        }
        if (!formData.payAmount || formData.payAmount <= 0) {
            message.warning("Jumlah bayar harus lebih dari 0");
            return;
        }
        if (!formData.creditAmount || formData.creditAmount < formData.payAmount) {
            message.warning("Jumlah kredit harus lebih besar atau sama dengan jumlah bayar");
            return;
        }
        if (!formData.validityDays || formData.validityDays < 1) {
            message.warning("Masa berlaku minimal 1 hari");
            return;
        }

        setSaving(true);
        try {
            if (selectedPackage) {
                // Update
                const payload: IUpdateCreditPackageRequest = {
                    code: formData.code.trim() || undefined,
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    payAmount: formData.payAmount,
                    creditAmount: formData.creditAmount,
                    validityDays: formData.validityDays,
                    sortOrder: formData.sortOrder,
                    isActive: formData.isActive
                };

                const res = await CreditPackageUpdateService(selectedPackage.id, payload);
                if (res.success) {
                    message.success("Paket kredit berhasil diperbarui");
                    setShowAddModal(false);
                    fetchData(pagination.current, searchText);
                } else {
                    message.error(res.message || "Gagal memperbarui paket kredit");
                }
            } else {
                // Create
                const payload: ICreateCreditPackageRequest = {
                    code: formData.code.trim() || undefined,
                    name: formData.name.trim(),
                    description: formData.description?.trim() || undefined,
                    payAmount: formData.payAmount,
                    creditAmount: formData.creditAmount,
                    validityDays: formData.validityDays,
                    sortOrder: formData.sortOrder
                };

                const res = await CreditPackageCreateService(payload);
                if (res.success) {
                    message.success("Paket kredit berhasil dibuat");
                    setShowAddModal(false);
                    fetchData(1, searchText);
                } else {
                    message.error(res.message || "Gagal membuat paket kredit");
                }
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Terjadi kesalahan saat menyimpan");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ open: true, id, name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModal.id) return;
        
        setLoading(true);
        try {
            const res = await CreditPackageDeleteService(deleteModal.id);
            if (res.success) {
                message.success("Paket kredit berhasil dihapus");
                setDeleteModal({ open: false, id: null, name: "" });
                fetchData(pagination.current, searchText);
            } else {
                message.error(res.message || "Gagal menghapus paket kredit");
            }
        } catch (error: any) {
            console.error(error);
            message.error(error.message || "Terjadi kesalahan saat menghapus");
        } finally {
            setLoading(false);
        }
    };

    // Helpers
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate bonus preview
    const bonusAmount = formData.creditAmount - formData.payAmount;
    const bonusPercentage = formData.payAmount > 0 
        ? ((bonusAmount / formData.payAmount) * 100).toFixed(1) 
        : '0';

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Master Paket Kredit</h1>
                    <p className="text-slate-500 mt-1">Kelola paket top-up kredit untuk member</p>
                </div>
                <button 
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#3d6b5f] to-[#2d5047] text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    onClick={handleOpenCreateModal}
                >
                    <i className="fa-solid fa-plus"></i>
                    Tambah Paket Kredit
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 text-xl mb-4">
                        <i className="fa-solid fa-coins"></i>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{pagination.total}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Total Paket Kredit</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-xl mb-4">
                        <i className="fa-solid fa-check-circle"></i>
                    </div>
                    <div className="text-3xl font-bold text-slate-800">{packages.filter(p => p.isActive).length}</div>
                    <div className="text-sm font-medium text-slate-500 mt-1">Paket Aktif</div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-bottom border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
                    <h3 className="text-lg font-bold text-slate-800">Daftar Paket Kredit</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                            <input 
                                type="text" 
                                placeholder="Cari paket..." 
                                className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d6b5f]/20 focus:border-[#3d6b5f] transition-all w-full md:w-64"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button 
                            className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
                            onClick={handleSearch}
                        >
                            Cari
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-y border-slate-100">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-16">ID</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Paket</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bayar</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dapat Kredit</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bonus</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Masa Berlaku</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Urutan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : packages.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ textAlign: "center", padding: "20px" }}>
                                        Tidak ada data paket kredit
                                    </td>
                                </tr>
                            ) : (
                                packages.map((pkg) => (
                                    <tr key={pkg.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-400 font-medium">{pkg.id}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-slate-800">{pkg.name}</div>
                                                {pkg.description && (
                                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-1">{pkg.description}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-700" suppressHydrationWarning>
                                            {formatCurrency(pkg.payAmount)}
                                        </td>
                                        <td className="px-6 py-4 font-extrabold text-emerald-700" suppressHydrationWarning>
                                            {formatCurrency(pkg.creditAmount)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-600 text-xs font-bold w-fit" suppressHydrationWarning>
                                                    <i className="fa-solid fa-plus text-[10px]"></i>
                                                    {formatCurrency(pkg.bonusAmount)}
                                                </span>
                                                <div className="text-[10px] text-slate-400 mt-1 font-semibold pl-1">
                                                    ({pkg.bonusPercentage}%)
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-600 text-sm">
                                                <i className="fa-regular fa-calendar text-slate-300"></i>
                                                {pkg.validityDays} hari
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-xs font-bold">
                                                #{pkg.sortOrder}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                                pkg.isActive 
                                                    ? "bg-emerald-100 text-emerald-700" 
                                                    : "bg-slate-100 text-slate-400"
                                            }`}>
                                                {pkg.isActive ? "Aktif" : "Nonaktif"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-[#3d6b5f] hover:border-[#3d6b5f] hover:bg-emerald-50/50 transition-all"
                                                    title="Edit"
                                                    onClick={() => handleOpenEditModal(pkg)}
                                                >
                                                    <i className="fa-solid fa-pen text-xs"></i>
                                                </button>
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                                                    title="Hapus"
                                                    onClick={() => handleDelete(pkg.id, pkg.name)}
                                                >
                                                    <i className="fa-solid fa-trash text-xs"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="table-footer">
                    <div className="table-info">
                        Menampilkan {packages.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0}-
                        {Math.min(pagination.current * pagination.pageSize, pagination.total)} dari {pagination.total} paket
                    </div>
                    {pagination.total > pagination.pageSize && (
                        <div className="pagination">
                            <button
                                className="page-btn"
                                disabled={pagination.current === 1}
                                onClick={() => fetchData(pagination.current - 1, searchText)}
                            >
                                <i className="fa-solid fa-chevron-left"></i>
                            </button>
                            <span style={{ padding: '0 12px' }}>
                                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
                            </span>
                            <button
                                className="page-btn"
                                disabled={pagination.current * pagination.pageSize >= pagination.total}
                                onClick={() => fetchData(pagination.current + 1, searchText)}
                            >
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                showAddModal ? "visible opacity-100" : "invisible opacity-0"
            }`}>
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                
                <div className={`relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden transition-all duration-300 transform ${
                    showAddModal ? "translate-y-0 scale-100" : "translate-y-8 scale-95"
                }`}>
                    <div className="px-8 py-6 bg-emerald-50/50 border-b border-slate-100 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-800">
                            {selectedPackage ? "Edit Paket Kredit" : "Tambah Paket Kredit"}
                        </h3>
                        <button 
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 transition-all" 
                            onClick={() => setShowAddModal(false)}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                                        Kode Paket <span className="text-slate-400 font-normal text-[10px] uppercase ml-1">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d6b5f]/20 focus:border-[#3d6b5f] transition-all uppercase"
                                        placeholder="Contoh: GOLD-250"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                                        Nama Paket <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d6b5f]/20 focus:border-[#3d6b5f] transition-all"
                                        placeholder="Contoh: Gold Credit"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                                        Jumlah Bayar <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        min={0}
                                        size="large"
                                        value={formData.payAmount}
                                        onChange={handlePayAmountChange}
                                        className="w-full !rounded-xl !bg-slate-50 !border-slate-200 focus-within:!ring-2 focus-within:!ring-[#3d6b5f]/20 focus-within:!border-[#3d6b5f]"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                        parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                        addonBefore={<span className="font-bold text-slate-500">Rp</span>}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                                        Dapat Kredit <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        min={formData.payAmount}
                                        size="large"
                                        value={formData.creditAmount}
                                        onChange={(value) => setFormData({ ...formData, creditAmount: value || formData.payAmount })}
                                        className="w-full !rounded-xl !bg-slate-50 !border-slate-200 focus-within:!ring-2 focus-within:!ring-[#3d6b5f]/20 focus-within:!border-[#3d6b5f]"
                                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                                        parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                                        addonBefore={<span className="font-bold text-emerald-600">Rp</span>}
                                    />
                                </div>
                            </div>

                            {/* Bonus Preview Box */}
                            <div className={`p-4 rounded-2xl border transition-all duration-500 ${
                                bonusAmount > 0 
                                    ? "bg-orange-50/50 border-orange-100" 
                                    : "bg-slate-50 border-slate-100 opacity-50"
                            }`}>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        <i className="fa-solid fa-gift mr-2 text-orange-400"></i>
                                        Bonus Kredit
                                    </span>
                                    <span className="font-black text-orange-600 text-lg" suppressHydrationWarning>
                                        +{formatCurrency(bonusAmount)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-orange-200/20">
                                    <span className="text-slate-400 text-[11px] font-bold">PERSENTASE</span>
                                    <span className="font-bold text-orange-500 text-sm" suppressHydrationWarning>
                                        {bonusPercentage}%
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">
                                        Masa Berlaku <span className="text-red-500">*</span>
                                    </label>
                                    <InputNumber
                                        min={1}
                                        max={3650}
                                        size="large"
                                        value={formData.validityDays}
                                        onChange={(value) => setFormData({ ...formData, validityDays: value || 365 })}
                                        className="w-full !rounded-xl !bg-slate-50 !border-slate-200 focus-within:!ring-2 focus-within:!ring-[#3d6b5f]/20 focus-within:!border-[#3d6b5f]"
                                        addonAfter={<span className="text-slate-400 font-bold">hari</span>}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Urutan</label>
                                    <InputNumber
                                        min={0}
                                        size="large"
                                        value={formData.sortOrder}
                                        onChange={(value) => setFormData({ ...formData, sortOrder: value || 0 })}
                                        className="w-full !rounded-xl !bg-slate-50 !border-slate-200 focus-within:!ring-2 focus-within:!ring-[#3d6b5f]/20 focus-within:!border-[#3d6b5f]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Deskripsi</label>
                                <textarea
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d6b5f]/20 focus:border-[#3d6b5f] transition-all resize-none"
                                    rows={3}
                                    placeholder="Deskripsi paket (opsional)..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {selectedPackage && (
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Status</label>
                                    <Select
                                        size="large"
                                        className="w-full !rounded-xl"
                                        value={formData.isActive ? "active" : "inactive"}
                                        onChange={(value) => setFormData({ ...formData, isActive: value === "active" })}
                                        getPopupContainer={(trigger) => trigger.parentElement}
                                        options={[
                                            { label: <span className="font-bold text-emerald-600">Aktif</span>, value: "active" },
                                            { label: <span className="font-bold text-slate-400">Nonaktif</span>, value: "inactive" }
                                        ]}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
                        <button
                            className="px-6 py-3 text-slate-500 font-bold hover:text-slate-800 transition-colors disabled:opacity-50"
                            onClick={() => setShowAddModal(false)}
                            disabled={saving}
                        >
                            Batal
                        </button>
                        <button 
                            className="flex items-center gap-2 px-8 py-3 bg-[#3d6b5f] text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100" 
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    Simpan Paket
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {deleteModal.open && (
                <ConfirmActionModal
                    config={ActionPresets.delete(deleteModal.name)}
                    onConfirm={handleDeleteConfirm}
                    onClose={() => setDeleteModal({ open: false, id: null, name: "" })}
                    loading={loading}
                />
            )}
        </>
    );
}
