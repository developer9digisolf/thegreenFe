"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowseDepartment } from "./layouts/browse.layout";
import { FormDepartment } from "./layouts/form.layout";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import {
  IActionDepartment,
  IStateDepartment,
} from "@afx/models/dashboard/master/departments.model";
import { IReqFormDepartment } from "@afx/interfaces/master/department.iface";

export default function DepartmentView() {
  const {
    useActions,
    state: { department },
  } = useStore<IStateDepartment, IActionDepartment>("departments");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormDepartment>();
  const [formType, setFormType] = useState<string>("create");

  const [tempSearch, setTempSearch] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: "",
  });

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  const getDepartments = () => {
    const params = {
      Search: keyword,
      Page: page,
      PageSize: pageSize,
      SortColumn: "createdat",
      SortDirection: "desc" as const,
    };
    useActions<"getDepartments">("getDepartments", [params], true);
  };

  useEffect(() => {
    getDepartments();
  }, [page, pageSize, keyword]);

  const handleDetail = (id: number) => {
    useActions<"getDepartment">("getDepartment", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = () => {
    return forms
      .validateFields()
      .then((val) => {
        if (formType === "create") {
          useActions<"createDepartment">(
            "createDepartment",
            [
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getDepartments();
                  }, 0);
                }
              },
            ],
            true,
          );
        } else {
          useActions<"updateDepartment">(
            "updateDepartment",
            [
              department?.id,
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getDepartments();
                    setFormType("create");
                  }, 0);
                }
              },
            ],
            true,
          );
        }
      })
      .catch((err: any) => {
        notification.warning({
          message: "Validation Failed",
          description: err?.errorFields?.[0]?.errors,
          duration: 2,
          key: "FUNC-CREATE-DEPARTMENT",
        });
      });
  };

  const handleDelete = (id: number) => {
    useActions<"deleteDepartment">(
      "deleteDepartment",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            setDeleteConfirm({ open: false, id: 0, name: "" });
            getDepartments();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      <BrowseDepartment
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
          useActions<"getDepartment">("getDepartment", [id], true);
          setFormType("update");
          setOpenFormCreate(true);
        }}
        handleDelete={(id: number, name: string) => setDeleteConfirm({ open: true, id, name })}
      />

      <FormDepartment
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

      {deleteConfirm.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteConfirm.name)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onClose={() => setDeleteConfirm({ open: false, id: 0, name: "" })}
          loading={false}
        />
      )}
    </>
  );
}
