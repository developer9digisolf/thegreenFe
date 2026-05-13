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
    state: { company, companies, allCompaniesFlat },
    isLoading,
  } = useStore<IStateCompany, IActionCompany>("companies");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormCompany>();
  const [formType, setFormType] = useState<string>("create");

  const [tempSearch, setTempSearch] = useState<string>("");

  const checkIsDescendant = (nodes: any[], currentId: number, targetId: number): boolean => {
    for (const node of nodes) {
      if (node.id === currentId) {
        const isChild = (children: any[]): boolean => {
          for (const child of children) {
            if (child.id === targetId) return true;
            if (child.children && isChild(child.children)) return true;
          }
          return false;
        };
        return node.children ? isChild(node.children) : false;
      }
      if (node.children && checkIsDescendant(node.children, currentId, targetId)) return true;
    }
    return false;
  };

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
        if (formType === "update") {
          if (val.parentId === company?.id) {
            notification.warning({
              message: "Validasi Gagal",
              description: "Perusahaan tidak boleh menjadi induk bagi dirinya sendiri.",
              duration: 3,
            });
            return;
          }

          // Check for descendant (Circular Reference)
          if (val.parentId && checkIsDescendant(companies, company?.id, val.parentId)) {
            notification.warning({
              message: "Validasi Struktur Gagal",
              description: "Anak perusahaan tidak bisa menjadi induk bagi perusahaan di atasnya (Circular Reference).",
              duration: 4,
            });
            return;
          }

          // Check for "Perusahaan Utama" selection or promotion to Root by "Anak Perusahaan"
          const targetParent = allCompaniesFlat.find(c => c.id === val.parentId);
          const isTargetMaster = targetParent && !targetParent.parentId;
          const isBecomingRoot = !val.parentId;
          const isUpdatingChild = !!company?.parentId;

          if (isUpdatingChild && (isBecomingRoot || isTargetMaster)) {
            notification.warning({
              message: "Validasi Struktur Gagal",
              description: "Anak perusahaan tidak boleh diubah menjadi Perusahaan Utama atau memilih Perusahaan Utama sebagai induk langsung.",
              duration: 4,
            });
            return;
          }

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
        } else {
          useActions<"createCompany">(
            "createCompany",
            [
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  getCompanies();
                }
              },
            ],
            true,
          );
        }
      })
      .catch((err: any) => {
        if (err?.errorFields) {
          notification.warning({
            message: "Data Belum Lengkap",
            description: "Silakan lengkapi semua kolom yang wajib diisi.",
            duration: 2,
            key: "FUNC-VALIDATION-ERROR",
          });
        }
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
