'use client';

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowseUser } from "./layouts/browse.layout";
import { FormUser } from "./layouts/form.layout";
import {
  IActionUser,
  IStateUser,
} from "@afx/models/dashboard/manage-access/users.model";
import { IReqFormUser } from "@afx/interfaces/master/user.iface";

export default function UserView() {
  const {
    useActions,
    state: { user },
  } = useStore<IStateUser, IActionUser>("users");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormUser>();
  const [formType, setFormType] = useState<string>("create");

  const [tempSearch, setTempSearch] = useState<string>("");

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  const getUsers = () => {
    const params = {
      Search: keyword,
      Page: page,
      PageSize: pageSize,
      SortColumn: "createdat",
      SortDirection: "desc" as const,
    };
    useActions<"getUsers">("getUsers", [params], true);
  };

  useEffect(() => {
    getUsers();
  }, [page, pageSize, keyword]);

  const handleDetail = (id: number) => {
    useActions<"getUser">("getUser", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = (val: any) => {
    if (formType === "create") {
      useActions<"createUser">(
        "createUser",
        [
          val,
          (code: any) => {
            const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
            if (isSuccess) {
              setTimeout(() => {
                setOpenFormCreate(false);
                forms.resetFields();
                getUsers();
              }, 0);
            }
          },
        ],
        true,
      );
    } else {
      useActions<"updateUser">(
        "updateUser",
        [
          user?.id,
          val,
          (code: any) => {
            const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
            if (isSuccess) {
              setTimeout(() => {
                setOpenFormCreate(false);
                forms.resetFields();
                getUsers();
                setFormType("create");
              }, 0);
            }
          },
        ],
        true,
      );
    }
  };

  const handleDelete = (id: number) => {
    useActions<"deleteUser">(
      "deleteUser",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            getUsers();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      <BrowseUser
        {...{ page, pageSize, setPage, setPageSize }}
        onSearch={handleSearch}
        searchText={tempSearch}
        setSearchText={setTempSearch}
        setOpenFormCreate={() => {
          setFormType("create");
          setOpenFormCreate(true);
        }}
        handleToDetail={(v: number) => handleDetail(v)}
        handleEdit={(id: number) => {
          useActions<"getUser">("getUser", [id], true);
          setFormType("update");
          setOpenFormCreate(true);
        }}
        handleDelete={(v: number) => handleDelete(v)}
      />

      <FormUser
        {...{ formType, forms }}
        open={openFormCreate}
        onCancel={() => {
          setOpenFormCreate(false);
          forms.resetFields();
          setFormType("create");
        }}
        setFormType={(v: any) => setFormType(v)}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
