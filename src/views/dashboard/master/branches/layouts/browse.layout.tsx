import { useState } from "react";
import { Button, Divider, Typography, Dropdown, MenuProps, Tag } from "antd";
import { MoreOutlined, HomeOutlined } from "@ant-design/icons";
import { IPropsBranch } from "@afx/interfaces/master/branch.iface";
import {
  IActionBranch,
  IStateBranch,
} from "@afx/models/dashboard/master/branches.model";
import { useStore } from "@afx/store/core";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";
import dayjs from "dayjs";

export function BrowseBranch(props: IPropsBranch & { handleEdit: (id: number) => void }) {
  const {
    isLoading,
    state: { branches, pageInfo },
  } = useStore<IStateBranch, IActionBranch>("branches");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
    code: string;
  }>({
    open: false,
    id: null,
    code: "",
  });

  const columns: Column[] = [
    {
      key: "code",
      title: "Kode",
      width: "120px",
      align: "center",
      render: (value: string, record: any) => (
        <div className="flex items-center justify-center gap-2">
          {record.isMainBranch && <HomeOutlined className="text-emerald-600" title="Pusat" />}
          <span>{value}</span>
        </div>
      )
    },
    {
      key: "name",
      title: "Nama Cabang",
      width: "200px",
      align: "left",
    },
    {
      key: "city",
      title: "Kota",
      width: "150px",
      align: "center",
    },
    {
      key: "phone",
      title: "Telepon",
      width: "150px",
      align: "center",
    },
    {
      key: "email",
      title: "Email",
      width: "200px",
      align: "left",
    },
    {
      key: "isMainBranch",
      title: "Status",
      width: "120px",
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "blue" : "default"}>
          {value ? "Pusat" : "Cabang"}
        </Tag>
      )
    },
    {
      key: "createdAt",
      title: "Tanggal Dibuat",
      width: "150px",
      align: "center",
      render: (value: string) => {
        return value ? dayjs(value).format("DD MMM YYYY") : "-";
      },
    },
    {
      key: "actions",
      title: "Aksi",
      width: "100px",
      align: "center",
      render: (_: any, record: any) => {
        const items: MenuProps["items"] = [
          {
            key: "detail",
            label: "Detail",
            onClick: () => {
              props?.handleToDetail(record?.id);
            },
          },
          {
            key: "edit",
            label: "Edit",
            onClick: () => {
              props?.handleEdit(record?.id);
            },
          },
          {
            type: "divider",
          },
          {
            key: "delete",
            label: "Hapus",
            danger: true,
            onClick: () => {
              setDeleteModal({
                open: true,
                id: record?.id,
                code: record?.code || record?.name,
              });
            },
          },
        ];

        return (
          <div className="flex justify-center">
            <Dropdown menu={{ items }} trigger={["click"]}>
              <Button
                type="text"
                icon={<MoreOutlined />}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const handleDeleteConfirm = () => {
    if (deleteModal.id) {
      props?.handleDelete(deleteModal.id);
      setDeleteModal({ open: false, id: null, code: "" });
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography className="text-xl font-semibold">
          Daftar Cabang (Branches)
        </Typography>
        <Button
          size="large"
          type="primary"
          onClick={props?.setOpenFormCreate}
          className="hidden lg:block"
        >
          Tambah Cabang
        </Button>
      </div>
      <Button
        size="middle"
        className="float-end my-2 lg:hidden"
        type="primary"
        onClick={props?.setOpenFormCreate}
      >
        Tambah Cabang
      </Button>
      <Divider />
      <UseDynamicTable
        columns={columns}
        data={branches || []}
        pageInfo={{
          currentPage: pageInfo?.currentPage || 1,
          total: pageInfo?.total || 0,
          pageSize: pageInfo?.pageSize || 10,
        }}
        onPageChange={props?.setPage}
        onPageSizeChange={props?.setPageSize}
        sortState={{ key: null, direction: null }}
        onSortChange={() => {}}
        onSearch={props?.onSearch}
        searchText={props?.searchText}
        setSearchText={props?.setSearchText}
        searchPlaceholder="Cari cabang..."
      />

      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.code)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, code: "" })}
          loading={isLoading("deleteBranch")}
        />
      )}
    </>
  );
}
