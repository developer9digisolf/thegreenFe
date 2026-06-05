"use client";

import { useStore } from "@afx/store/core";
import { Table, Pagination, Tooltip, Input, Tag, Image } from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import {
  IStatePromoBanner,
  IActionPromoBanner,
} from "@afx/models/dashboard/master/promo-banners.model";
import { IPropsPromoBanner } from "@afx/interfaces/promo-banner.iface";
import { IServicePackage } from "@afx/interfaces/service-package.iface";
import { ICreditPackage } from "@afx/interfaces/credit-package.iface";
import dayjs from "dayjs";

export const BrowsePromoBanner = ({
  page,
  pageSize,
  setPage,
  setPageSize,
  onSearch,
  searchText,
  setSearchText,
  setOpenFormCreate,
  handleEdit,
  handleDelete,
  packages = [],
  creditPackages = [],
}: IPropsPromoBanner) => {
  const { state: promoBannerState, isLoading } = useStore<
    IStatePromoBanner,
    IActionPromoBanner
  >("promoBanners");

  const promoBanners = promoBannerState?.promoBanners || [];
  const pageInfo = promoBannerState?.pageInfo || { total: 0 };

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case "voucher_pack":
        return "Voucher Pack";
      case "amount_credit":
        return "Amount Credit";
      case "external_url":
        return "External URL";
      default:
        return actionType;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case "voucher_pack":
        return "blue";
      case "amount_credit":
        return "orange";
      case "external_url":
        return "purple";
      default:
        return "default";
    }
  };

  const getActionValueDisplay = (actionType: string, actionValue: string) => {
    if (!actionValue) return "-";

    switch (actionType) {
      case "voucher_pack": {
        const pkg = packages.find((p) => String(p.id) === actionValue);
        return pkg?.name || actionValue;
      }
      case "amount_credit": {
        const cp = creditPackages.find((c) => String(c.id) === actionValue);
        return cp
          ? `${cp.name} - Rp ${cp.creditAmount.toLocaleString("id-ID")}`
          : actionValue;
      }
      case "external_url":
        return actionValue;
      default:
        return actionValue;
    }
  };

  const formatDate = (date: string) => {
    return date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-";
  };

  const columns = [
    {
      title: "IMAGE",
      key: "image",
      width: 100,
      render: (text: any, record: any) => (
        <div>
          {record.imageUrl ? (
            <Image
              src={record.imageUrl}
              alt={record.title}
              width={60}
              height={60}
              style={{ borderRadius: 8, objectFit: "cover" }}
              preview={{
                cover: <PlusOutlined />,
              }}
            />
          ) : (
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                backgroundColor: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "#94a3b8",
              }}
            >
              No Image
            </div>
          )}
        </div>
      ),
    },
    {
      title: "TITLE",
      key: "title",
      render: (text: any, record: any) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1e293b", fontSize: 13 }}>
            {record.title}
          </div>
          <div
            style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}
            className="line-clamp-2"
          >
            {record.description || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "ACTION TYPE",
      key: "actionType",
      width: 140,
      render: (text: any, record: any) => (
        <Tag color={getActionTypeColor(record.actionType)}>
          {getActionTypeLabel(record.actionType)}
        </Tag>
      ),
    },
    {
      title: "ACTION VALUE",
      key: "actionValue",
      width: 200,
      render: (text: any, record: any) => (
        <div style={{ fontSize: 12, color: "#475569" }}>
          {getActionValueDisplay(record.actionType, record.actionValue)}
        </div>
      ),
    },
    {
      title: "START DATE",
      key: "startDate",
      width: 140,
      render: (text: any, record: any) => (
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {formatDate(record.startDate)}
        </div>
      ),
    },
    {
      title: "END DATE",
      key: "endDate",
      width: 140,
      render: (text: any, record: any) => (
        <div style={{ fontSize: 12, color: "#64748b" }}>
          {formatDate(record.endDate)}
        </div>
      ),
    },
    {
      title: "SORT ORDER",
      key: "sortOrder",
      width: 100,
      align: "center" as const,
      render: (text: any, record: any) => (
        <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>
          {record.sortOrder || 0}
        </div>
      ),
    },
    {
      title: "CREATED AT",
      key: "createdAt",
      width: 140,
      render: (text: any, record: any) => (
        <div style={{ fontSize: 12, color: "#94a3b8" }}>
          {formatDate(record.createdAt)}
        </div>
      ),
    },
    {
      title: "AKSI",
      key: "action",
      width: 100,
      align: "center" as const,
      render: (text: any, record: any) => (
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <Tooltip title="Ubah">
            <button
              onClick={() => handleEdit(record.id)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                color: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <EditOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Hapus">
            <button
              onClick={() => handleDelete(record.id, record.title)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "white",
                cursor: "pointer",
                color: "#ef4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div
      className="promo-banner-management-container"
      style={{ padding: "24px" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Promo Banner
          </h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>
            Kelola promo banner untuk promosi di The Green Spa
          </p>
        </div>
        <button
          onClick={setOpenFormCreate}
          style={{
            background: "linear-gradient(135deg, #3d6b5f 0%, #2d5a4e 100%)",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "12px",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            boxShadow: "0 10px 15px -3px rgba(61, 107, 95, 0.2)",
          }}
        >
          <PlusOutlined /> <span>Tambah Banner</span>
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid #edf2f7",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(61, 107, 95, 0.05)",
              color: "#3d6b5f",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <PictureOutlined style={{ fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#1e293b" }}>
            {pageInfo.total}
          </div>
          <div style={{ fontSize: 14, color: "#64748b" }}>Total Banner</div>
        </div>
        <div
          style={{
            background: "white",
            padding: 24,
            borderRadius: 20,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
            border: "1px solid #edf2f7",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "rgba(5, 150, 105, 0.05)",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <PlusOutlined style={{ fontSize: 20 }} />
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1e293b" }}>
            Aktif
          </div>
          <div style={{ fontSize: 14, color: "#64748b" }}>
            Banner yang tersedia
          </div>
        </div>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 24,
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
          border: "1px solid #edf2f7",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#1e293b",
              margin: 0,
            }}
          >
            Daftar Promo Banner
          </h3>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <SearchOutlined
                style={{ position: "absolute", left: 14, color: "#94a3b8" }}
              />
              <Input
                placeholder="Cari judul, deskripsi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={onSearch}
                style={{
                  padding: "9px 16px 9px 40px",
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  width: 250,
                  height: 40,
                }}
              />
            </div>
            <button
              onClick={onSearch}
              style={{
                background: "#f1f5f9",
                color: "#475569",
                border: "1px solid #e2e8f0",
                padding: "0 20px",
                borderRadius: 12,
                fontWeight: 600,
                cursor: "pointer",
                height: 40,
              }}
            >
              Cari
            </button>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={promoBanners}
          pagination={false}
          loading={isLoading("getPromoBanners")}
          rowKey="id"
          scroll={{ x: 1200 }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <div style={{ color: "#64748b", fontSize: 13 }}>
            Menampilkan{" "}
            <b>
              {promoBanners.length > 0
                ? (Number(page) - 1) * Number(pageSize) + 1
                : 0}
            </b>{" "}
            sampai{" "}
            <b>
              {Math.min(
                Number(page) * Number(pageSize),
                Number(pageInfo?.total) || 0,
              )}
            </b>{" "}
            dari <b>{Number(pageInfo?.total) || 0}</b> banner
          </div>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={pageInfo.total}
            onChange={(p, s) => {
              setPage(p);
              if (s) setPageSize(s);
            }}
            showSizeChanger={false}
          />
        </div>
      </div>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.05em !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
