"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Typography, Tabs, Button, Spin, Input, Collapse, message } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GiftOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  GetMemberByIdService,
  GetMemberServicePackagesService,
} from "@afx/services/member.service";
import {
  IMember,
  IServicePackage,
  getMemberStatusName,
  getGenderName,
} from "@afx/interfaces/member.iface";
import { UsePagination, PageInfo } from "@afx/components/tables/pagination";
import { normalizePhoneNumber } from "./MembersView";

interface MemberDetailViewProps {
  memberId: number;
}

export default function MemberDetailView({ memberId }: MemberDetailViewProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [member, setMember] = useState<IMember | null>(null);

  const [packages, setPackages] = useState<IServicePackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [pagination, setPagination] = useState<PageInfo>({
    currentPage: 1,
    pageSize: 10,
    total: 0,
    path: "",
  });
  const [searchPackages, setSearchPackages] = useState("");
  const [activeTab, setActiveTab] = useState<string>("info");
  const [hasFetchedPackages, setHasFetchedPackages] = useState(false);

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!memberId || isNaN(memberId) || memberId <= 0) {
      message.error("ID Member tidak valid");
      setTimeout(() => router.push("/dashboard/master/members"), 1000);
      return;
    }
    fetchMemberDetails();
  }, [memberId]);

  useEffect(() => {
    if (activeTab === "vouchers" && !hasFetchedPackages) {
      fetchServicePackages(1, 10);
      setHasFetchedPackages(true);
    }
  }, [activeTab]);

  // ── Data fetchers ───────────────────────────────────────────────────────────

  const fetchMemberDetails = async () => {
    setLoading(true);
    try {
      const res = await GetMemberByIdService(memberId);
      if (res.success) {
        setMember(res.data);
      } else {
        message.error(res.message || "Gagal memuat data member");
        router.push("/dashboard/master/members");
      }
    } catch (err: any) {
      console.error("Failed to fetch member details", err);
      message.error(
        err?.message || "Terjadi kesalahan saat memuat data member",
      );
      router.push("/dashboard/master/members");
    } finally {
      setLoading(false);
    }
  };

  const fetchServicePackages = async (
    page: number,
    pageSize: number,
    search: string = searchPackages,
  ) => {
    setPackagesLoading(true);
    try {
      const res = await GetMemberServicePackagesService(memberId, {
        page,
        pageSize,
        search,
      });
      if (res.success && res.data) {
        setPackages(Array.isArray(res.data) ? res.data : []);
        if (res.pagination) {
          setPagination({
            currentPage: res.pagination.currentPage || 1,
            pageSize: res.pagination.pageSize || 10,
            total: res.pagination.total || 0,
            path: res.pagination.path || "",
          });
        }
      }
    } catch (err: any) {
      console.error("Failed to fetch service packages", err);
      message.error(err?.message || "Gagal memuat data voucher pack");
    } finally {
      setPackagesLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  const statusConfig: Record<
    string,
    { bg: string; text: string; label: string }
  > = {
    active: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Active" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", label: "Pending" },
    inactive: { bg: "bg-slate-100", text: "text-slate-500", label: "Inactive" },
    blocked: { bg: "bg-red-50", text: "text-red-700", label: "Blocked" },
  };

  const getStatusBadge = (status: number | string | undefined | null) => {
    const raw = getMemberStatusName(
      typeof status === "string" ? parseInt(status) : (status ?? 0),
    );
    const key = raw?.toLowerCase() ?? "";
    const s = statusConfig[key] ?? {
      bg: "bg-slate-100",
      text: "text-slate-500",
      label: raw ?? String(status ?? "—"),
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
      >
        {s.label}
      </span>
    );
  };

  const voucherStatusConfig: Record<
    string,
    { bg: string; text: string; icon: React.ReactNode }
  > = {
    Active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: <CheckCircleOutlined />,
    },
    Used: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      icon: <CheckCircleOutlined />,
    },
    Expired: {
      bg: "bg-red-50",
      text: "text-red-700",
      icon: <CloseCircleOutlined />,
    },
  };

  const getVoucherBadge = (status: string) => {
    const s = voucherStatusConfig[status] ?? {
      bg: "bg-slate-100",
      text: "text-slate-500",
      icon: null,
    };
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}
      >
        {s.icon} {status}
      </span>
    );
  };

  // ── Sub-components ──────────────────────────────────────────────────────────

  const Field = ({
    label,
    icon,
    children,
  }: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div>
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <div className="flex items-center gap-1.5 text-sm text-slate-700">
        {icon && <span className="text-slate-300 text-sm">{icon}</span>}
        {children}
      </div>
    </div>
  );

  // ── Tab: Member Info ────────────────────────────────────────────────────────

  const renderMemberInfo = () => {
    if (loading || !member) {
      return (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Hero card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
            <UserOutlined style={{ fontSize: 24 }} />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-slate-800 mb-1.5">
              {member.name}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <code className="text-xs text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                {member.code}
              </code>
              {/* {getStatusBadge(member.status)} */}
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">
              Saldo Credit
            </p>
            <p className="text-xl font-semibold text-slate-800">
              {formatCurrency(member.creditBalance)}
            </p>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-5">
            <IdcardOutlined />
            Informasi Member
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Nama Lengkap">{member.name}</Field>
            <Field label="Kode Member">
              <code className="text-xs font-mono text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                {member.code}
              </code>
            </Field>
            <Field label="Nomor Telepon" icon={<PhoneOutlined />}>
              {normalizePhoneNumber(member.phone)}
            </Field>
            <Field label="Email" icon={<MailOutlined />}>
              {member.email ?? <span className="text-slate-300">—</span>}
            </Field>
            <Field label="Gender">{getGenderName(member.gender)}</Field>
            <Field label="Tanggal Lahir" icon={<CalendarOutlined />}>
              {member.birthDate ? (
                dayjs(member.birthDate).format("DD MMMM YYYY")
              ) : (
                <span className="text-slate-300">—</span>
              )}
            </Field>
            <Field label="Tanggal Bergabung" icon={<CalendarOutlined />}>
              {dayjs(member.joinDate).format("DD MMMM YYYY")}
            </Field>
            <Field label="Status">{getStatusBadge(member.status)}</Field>
          </div>

          {member.address && (
            <>
              <div className="border-t border-slate-100 my-5" />
              <Field label="Alamat" icon={<EnvironmentOutlined />}>
                <span className="leading-relaxed">{member.address}</span>
              </Field>
            </>
          )}

          {member.notes && (
            <>
              <div className="border-t border-slate-100 my-5" />
              <div>
                <p className="text-xs text-slate-400 mb-2">Catatan Internal</p>
                <p className="text-sm text-slate-600 bg-slate-50 border-l-2 border-slate-200 pl-3 py-2 pr-4 rounded-r-lg leading-relaxed">
                  {member.notes}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // ── Tab: Voucher Pack ───────────────────────────────────────────────────────

  const renderVoucherPack = () => (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Cari voucher pack..."
          value={searchPackages}
          onChange={(e) => setSearchPackages(e.target.value)}
          onPressEnter={() => fetchServicePackages(1, pagination.pageSize)}
          prefix={<SearchOutlined className="text-slate-300" />}
          className="h-9 rounded-xl text-sm"
        />
        <Button
          onClick={() => fetchServicePackages(1, pagination.pageSize)}
          className="h-9 px-5 rounded-xl text-sm border-slate-200 text-slate-600"
        >
          Cari
        </Button>
      </div>

      {/* Package list */}
      {packagesLoading ? (
        <div className="flex justify-center items-center py-16">
          <Spin size="large" />
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center">
          <GiftOutlined className="text-4xl text-slate-200 mb-3" />
          <p className="text-sm font-medium text-slate-500">
            Tidak Ada Voucher Pack
          </p>
          <p className="text-sm text-slate-400 mt-1">
            Member ini belum memiliki voucher pack
          </p>
        </div>
      ) : (
        packages.map((pkg) => {
          const usedRatio =
            pkg.totalSession > 0
              ? (pkg.usedSession / pkg.totalSession) * 100
              : 0;
          const isFullyUsed = pkg.usedSession >= pkg.totalSession;

          return (
            <div
              key={pkg.id}
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden"
            >
              <div className="p-5 space-y-3">
                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <GiftOutlined style={{ fontSize: 16 }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-slate-800 leading-snug">
                          {pkg.name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {pkg.serviceName}
                        </p>
                      </div>
                      {getStatusBadge(pkg.status)}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {pkg.description && (
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {pkg.description}
                  </p>
                )}

                {/* Date range */}
                {pkg.validFrom && pkg.validTo && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ClockCircleOutlined style={{ fontSize: 11 }} />
                    {dayjs(pkg.validFrom).format("DD MMM YYYY")} –{" "}
                    {dayjs(pkg.validTo).format("DD MMM YYYY")}
                  </div>
                )}

                {/* Session progress bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-400">
                      Sesi terpakai
                    </span>
                    <span className="text-xs font-medium text-slate-700">
                      {pkg.usedSession} / {pkg.totalSession}
                    </span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFullyUsed ? "bg-red-400" : "bg-teal-500"
                      }`}
                      style={{ width: `${Math.min(usedRatio, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Branch tags */}
                {pkg.packageRules && pkg.packageRules.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {pkg.packageRules.map((rule) => (
                      <span
                        key={rule.id}
                        className="text-xs text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-0.5 rounded-full"
                      >
                        {rule.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Voucher collapse */}
              <div className="border-t border-slate-100">
                <Collapse
                  ghost
                  size="small"
                  items={[
                    {
                      key: "vouchers",
                      label: (
                        <span className="text-xs text-slate-400 font-medium">
                          Lihat voucher{" "}
                          <span className="text-slate-300">
                            ({pkg.packageVouchers?.length ?? 0})
                          </span>
                        </span>
                      ),
                      children: (
                        <div className="space-y-1.5">
                          {pkg.packageVouchers?.map((voucher) => (
                            <div
                              key={voucher.guid}
                              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${
                                voucher.status === "Active"
                                  ? "bg-white border-slate-100"
                                  : "bg-slate-50 border-slate-100"
                              }`}
                            >
                              <code className="text-xs font-mono tracking-wide text-slate-600">
                                {voucher.voucherCode}
                              </code>
                              <div className="flex items-center gap-2.5">
                                {getVoucherBadge(voucher.status)}
                                {voucher.usedAt && (
                                  <span className="text-xs text-slate-400">
                                    {dayjs(voucher.usedAt).format(
                                      "DD MMM YYYY, HH:mm",
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      {!packagesLoading && packages.length > 0 && (
        <UsePagination
          pageInfo={pagination}
          onPageChange={(page) =>
            fetchServicePackages(page, pagination.pageSize)
          }
          onPageSizeChange={(pageSize) => fetchServicePackages(1, pageSize)}
        />
      )}
    </div>
  );

  // ── Root ────────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 lg:p-8 mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/dashboard/master/members")}
          className="text-slate-500 hover:text-slate-800"
        >
          Kembali
        </Button>
        <div>
          <Typography.Title
            level={3}
            className="!m-0 text-slate-800 font-semibold"
          >
            Detail Member
          </Typography.Title>
          <Typography.Text className="text-slate-400 text-sm">
            Lihat informasi lengkap dan voucher pack member
          </Typography.Text>
        </div>
      </div>

      {/* Tab container */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          className="px-6 lg:px-8 pt-4"
          items={[
            {
              key: "info",
              label: (
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <UserOutlined /> Member Info
                </span>
              ),
              children: <div className="pb-6">{renderMemberInfo()}</div>,
            },
            {
              key: "vouchers",
              label: (
                <span className="flex items-center gap-1.5 text-sm font-medium">
                  <GiftOutlined /> Voucher Pack
                </span>
              ),
              children: <div className="pb-6">{renderVoucherPack()}</div>,
            },
          ]}
        />
      </div>
    </div>
  );
}
