import { useState } from "react";
import { Button, Divider, Typography, Dropdown, MenuProps } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { IPropsPosition } from "@afx/interfaces/master/position.iface";
import {
  IActionPosition,
  IStatePosition,
} from "@afx/models/dashboard/master/positions.model";
import { useStore } from "@afx/store/core";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";
import dayjs from "dayjs";

export function BrowsePosition(props: IPropsPosition & { handleEdit: (id: number) => void }) {
  const {
    isLoading,
    state: { positions, pageInfo },
  } = useStore<IStatePosition, IActionPosition>("positions");

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
    },
    {
      key: "name",
      title: "Nama Jabatan",
      width: "200px",
      align: "left",
    },
    {
      key: "description",
      title: "Deskripsi",
      width: "250px",
      align: "left",
    },
    {
      key: "baseSalary",
      title: "Gaji Pokok",
      width: "150px",
      align: "right",
      render: (value: number) => {
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(value);
      },
    },
    {
      key: "employeeCount",
      title: "Jumlah Karyawan",
      width: "150px",
      align: "center",
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
          Daftar Jabatan (Positions)
        </Typography>
        <Button
          size="large"
          type="primary"
          onClick={props?.setOpenFormCreate}
          className="hidden lg:block"
        >
          Tambah Jabatan
        </Button>
      </div>
      <Button
        size="middle"
        className="float-end my-2 lg:hidden"
        type="primary"
        onClick={props?.setOpenFormCreate}
      >
        Tambah Jabatan
      </Button>
      <Divider />
      <UseDynamicTable
        columns={columns}
        data={positions || []}
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
        searchPlaceholder="Cari jabatan..."
      />

      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.code)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, code: "" })}
          loading={isLoading("deletePosition")}
        />
      )}
    </>
  );
}
