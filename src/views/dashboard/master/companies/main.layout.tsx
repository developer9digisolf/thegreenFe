"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { debounce } from "lodash";
import { useEffect, useRef, useState } from "react";
import { BrowseCompany } from "./layouts/browse.layout";
import { FormCompany } from "./layouts/form.layout";
import {
  IActionCompany,
  IStateCompany,
} from "@afx/models/dashboard/master/companies.model";
import { IReqFormCompany } from "@afx/interfaces/master/company.iface";

export default function CompanyView() {
  const {
    useActions,
    state: { company },
    isLoading,
  } = useStore<IStateCompany, IActionCompany>("companies");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormCompany>();
  const [formType, setFormType] = useState<string>("create");

  const [tempSearch, setTempSearch] = useState<string>("");

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  const getCompanies = () => {
    const params = {
      search: keyword,
      page,
      pageSize,
      sortColumn: "",
      sortDirection: "asc" as const,
    };
    useActions<"getCompanies">("getCompanies", [params], true);
  };

  useEffect(() => {
    getCompanies();
  }, [page, pageSize, keyword]);

  const handleDetail = (id: number) => {
    useActions<"getCompany">("getCompany", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = () => {
    return forms
      .validateFields()
      .then((val) => {
        if (formType === "create") {
          useActions<"createCompany">(
            "createCompany",
            [
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  getCompanies();
                  // For company creation, we might want to stay open to add branches/etc later
                  // but for now let's at least keep it open as requested
                }
              },
            ],
            true,
          );
        } else {
          useActions<"updateCompany">(
            "updateCompany",
            [
              company?.id,
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  getCompanies();
                  setFormType("detail");
                }
              },
            ],
            true,
          );
        }
      })
      .catch((err: any) => {
        notification.warning({
          message: "Failed to load data",
          description: err?.errorFields?.[0]?.errors,
          duration: 2,
          key: "FUNC-CREATE-COMPANY",
        });
      });
  };

  const handleDelete = (id: number) => {
    useActions<"deleteCompany">(
      "deleteCompany",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            getCompanies();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      <BrowseCompany
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
          useActions<"getCompany">("getCompany", [id], true);
          setFormType("update");
          setOpenFormCreate(true);
        }}
        handleDelete={(v: number) => handleDelete(v)}
      />

      <FormCompany
        {...{ formType, forms }}
        open={openFormCreate}
        onCancle={() => {
          if (formType === "update") {
            setFormType("detail");
          } else {
            setOpenFormCreate(false);
            forms.resetFields();
            setFormType("create");
          }
        }}
        setFormType={(v: any) => setFormType(v)}
        handleSubmit={handleSubmit}
      />
    </>
  );
}
