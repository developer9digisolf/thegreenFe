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

  const handleSearch = useRef(
    debounce((value: string) => {
      setKeywords(value);
      setPage(1);
    }, 1500),
  ).current;

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
              (code: number) => {
                if (code === 20000) {
                  forms.resetFields();
                  setOpenFormCreate(false);
                  getCompanies();
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
              (code: number) => {
                if (code === 20000) {
                  forms.resetFields();
                  setOpenFormCreate(false);
                  getCompanies();
                  setFormType("create");
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
        (code: number) => {
          if (code === 20000) {
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
        setOpenFormCreate={() => {
          setFormType("create");
          setOpenFormCreate(true);
        }}
        handleToDetail={(v: number) => handleDetail(v)}
        handleDelete={(v: number) => handleDelete(v)}
      />

      <FormCompany
        {...{ formType, forms }}
        open={openFormCreate}
        onCancle={() => {
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
