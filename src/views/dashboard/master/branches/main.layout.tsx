"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowseBranch } from "./layouts/browse.layout";
import { FormBranch } from "./layouts/form.layout";
import { BranchOperatingHoursModal } from "./layouts/operating-hours.layout";
import {
  IActionBranch,
  IStateBranch,
} from "@afx/models/dashboard/master/branches.model";
import { IReqFormBranch } from "@afx/interfaces/master/branch.iface";

export default function BranchView() {
  const {
    useActions,
    state: { branch },
  } = useStore<IStateBranch, IActionBranch>("branches");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormBranch>();
  const [formType, setFormType] = useState<string>("create");

  // State for Operating Hours Modal
  const [operatingHoursModal, setOperatingHoursModal] = useState<{
    open: boolean;
    branchId: number;
    branchName: string;
  }>({
    open: false,
    branchId: 0,
    branchName: "",
  });

  const [tempSearch, setTempSearch] = useState<string>("");

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  const getBranches = () => {
    const params = {
      search: keyword,
      page,
      pageSize,
      sortColumn: "createdAt",
      sortDirection: "desc" as const,
    };
    useActions<"getBranches">("getBranches", [params], true);
  };

  useEffect(() => {
    getBranches();
  }, [page, pageSize, keyword]);

  const handleDetail = (id: number) => {
    useActions<"getBranch">("getBranch", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = () => {
    return forms
      .validateFields()
      .then((val) => {
        if (formType === "create") {
          useActions<"createBranch">(
            "createBranch",
            [
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getBranches();
                  }, 0);
                }
              },
            ],
            true,
          );
        } else {
          useActions<"updateBranch">(
            "updateBranch",
            [
              branch?.id,
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getBranches();
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
          key: "FUNC-CREATE-BRANCH",
        });
      });
  };

  const handleDelete = (id: number) => {
    useActions<"deleteBranch">(
      "deleteBranch",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            getBranches();
          }
        },
      ],
      true,
    );
  };

  const handleOperatingHours = (record: any) => {
    setOperatingHoursModal({
      open: true,
      branchId: record.id,
      branchName: record.name,
    });
  };

  return (
    <>
      {(formType === "detail" || !openFormCreate) && (
        <BrowseBranch
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
            useActions<"getBranch">("getBranch", [id], true);
            setFormType("update");
            setOpenFormCreate(true);
          }}
          handleDelete={(v: number) => handleDelete(v)}
          handleOperatingHours={handleOperatingHours}
        />
      )}

      {openFormCreate && (
        <FormBranch
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

      {operatingHoursModal.open && (
        <BranchOperatingHoursModal
          branchId={operatingHoursModal.branchId}
          branchName={operatingHoursModal.branchName}
          open={operatingHoursModal.open}
          onClose={() => setOperatingHoursModal({ ...operatingHoursModal, open: false })}
        />
      )}
    </>
  );
}
