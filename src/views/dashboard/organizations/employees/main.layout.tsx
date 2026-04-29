"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowseEmployee } from "@afx/views/dashboard/master/employees/layouts/browse.layout";
import { FormEmployee } from "@afx/views/dashboard/master/employees/layouts/form.layout";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import {
  IActionEmployee,
  IStateEmployee,
} from "@afx/models/dashboard/master/employees.model";
import { IReqFormEmployee } from "@afx/interfaces/master/employee.iface";

export default function EmployeeView() {
  const {
    useActions: useEmployeeActions,
    state: employeeState,
  } = useStore<IStateEmployee, IActionEmployee>("employees");

  const { useActions: useDeptActions } = useStore<any, any>("departments");
  const { useActions: usePosActions } = useStore<any, any>("positions");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormEmployee>();
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

  const getEmployees = () => {
    const params = {
      search: keyword,
      page,
      pageSize,
      sortColumn: "createdAt",
      sortDirection: "desc" as const,
    };
    useEmployeeActions<"getEmployees">("getEmployees", [params], true);
  };

  const getExtras = () => {
    useDeptActions<any>("getDepartments", [{}], true);
    usePosActions<any>("getPositions", [{}], true);
  };

  useEffect(() => {
    getEmployees();
  }, [page, pageSize, keyword]);

  useEffect(() => {
    getExtras();
  }, []);

  const handleDetail = (id: number) => {
    useEmployeeActions<"getEmployee">("getEmployee", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = () => {
    return forms
      .validateFields()
      .then((val) => {
        // Format dates to ISO strings for API
        const payload = {
          ...val,
          dateOfBirth: val.dateOfBirth ? val.dateOfBirth.toISOString() : null,
          hireDate: val.hireDate ? val.hireDate.toISOString() : null,
        };

        if (formType === "create") {
          useEmployeeActions<"createEmployee">(
            "createEmployee",
            [
              payload,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getEmployees();
                  }, 0);
                }
              },
            ],
            true,
          );
        } else {
          useEmployeeActions<"updateEmployee">(
            "updateEmployee",
            [
              employeeState?.employee?.id,
              payload,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getEmployees();
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
          key: "FUNC-CREATE-EMPLOYEE",
        });
      });
  };

  const handleDelete = (id: number) => {
    useEmployeeActions<"deleteEmployee">(
      "deleteEmployee",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            setDeleteConfirm({ open: false, id: 0, name: "" });
            getEmployees();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      {(formType === "detail" || !openFormCreate) && (
        <BrowseEmployee
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
            useEmployeeActions<"getEmployee">("getEmployee", [id], true);
            setFormType("update");
            setOpenFormCreate(true);
          }}
          handleDelete={(id: number, name: string) => setDeleteConfirm({ open: true, id, name })}
        />
      )}

      {openFormCreate && (
        <FormEmployee
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
      )}

      {deleteConfirm.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteConfirm.name)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onClose={() => setDeleteConfirm({ open: false, id: 0, name: "" })}
          loading={employeeState?.loading?.deleteEmployee}
        />
      )}
    </>
  );
}
