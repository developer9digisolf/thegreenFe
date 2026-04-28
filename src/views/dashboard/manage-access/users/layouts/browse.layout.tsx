import { useState } from "react";
import { Button, Divider, Typography, Dropdown, MenuProps, Tag } from "antd";
import { MoreOutlined } from "@ant-design/icons";
import { IPropsUser } from "@afx/interfaces/master/user.iface";
import {
  IActionUser,
  IStateUser,
} from "@afx/models/dashboard/manage-access/users.model";
import { useStore } from "@afx/store/core";
import { UseDynamicTable, Column } from "@afx/components/tables/DynamicTable";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";
import dayjs from "dayjs";

export function BrowseUser(props: IPropsUser) {
  const {
    isLoading,
    state: { users, pageInfo },
  } = useStore<IStateUser, IActionUser>("users");

  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    id: number | null;
    username: string;
  }>({
    open: false,
    id: null,
    username: "",
  });

  const columns: Column[] = [
    {
      key: "username",
      title: "Username",
      width: "150px",
      align: "left",
      render: (value: string) => <span className="font-medium text-slate-700">{value}</span>
    },
    {
      key: "email",
      title: "Email",
      width: "200px",
      align: "left",
    },
    {
      key: "role",
      title: "Role",
      width: "120px",
      align: "center",
      render: (value: string) => {
        let color = "blue";
        if (value === "owner") color = "gold";
        if (value === "admin") color = "purple";
        if (value === "therapist") color = "cyan";
        if (value === "office") color = "geekblue";
        if (value === "cashier") color = "orange";
        return <Tag color={color} className="uppercase font-semibold">{value}</Tag>;
      }
    },
    {
      key: "employeeName",
      title: "Employee",
      width: "150px",
      align: "left",
      render: (value: string, record: any) => value || record.employeeId || "-"
    },
    {
      key: "isActive",
      title: "Status",
      width: "100px",
      align: "center",
      render: (value: boolean) => (
        <Tag color={value ? "success" : "error"}>
          {value ? "Active" : "Inactive"}
        </Tag>
      )
    },
    {
      key: "lastLoginAt",
      title: "Last Login",
      width: "180px",
      align: "center",
      render: (value: string) => {
        return value ? dayjs(value).format("DD MMM YYYY HH:mm") : "-";
      },
    },
    {
      key: "createdAt",
      title: "Created At",
      width: "150px",
      align: "center",
      render: (value: string) => {
        return value ? dayjs(value).format("DD MMM YYYY") : "-";
      },
    },
    {
      key: "actions",
      title: "Actions",
      width: "80px",
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
            label: "Delete",
            danger: true,
            onClick: () => {
              setDeleteModal({
                open: true,
                id: record?.id,
                username: record?.username,
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
      setDeleteModal({ open: false, id: null, username: "" });
    }
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography className="text-xl font-semibold">
          User Management
        </Typography>
        <Button
          size="large"
          type="primary"
          onClick={props?.setOpenFormCreate}
          className="hidden lg:block"
        >
          Add User
        </Button>
      </div>
      <Button
        size="middle"
        className="float-end my-2 lg:hidden"
        type="primary"
        onClick={props?.setOpenFormCreate}
      >
        Add User
      </Button>
      <Divider />
      <UseDynamicTable
        columns={columns}
        data={users || []}
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
        searchPlaceholder="Search users..."
      />

      {deleteModal.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteModal.username)}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteModal({ open: false, id: null, username: "" })}
          loading={isLoading("deleteUser")}
        />
      )}
    </>
  );
}
