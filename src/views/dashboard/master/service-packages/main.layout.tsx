"use client";

import { useStore } from "@afx/store/core";
import { Form } from "antd";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BrowseServicePackage } from "./layouts/browse.layout";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
import {
  IActionServicePackage,
  IStateServicePackage,
} from "@afx/models/dashboard/master/service-packages.model";
import { ICreateServicePackageRequest } from "@afx/interfaces/service-package.iface";

export default function ServicePackageView() {
  const router = useRouter();
  const {
    useActions: usePackageActions,
    state: packageState,
    isLoading,
  } = useStore<IStateServicePackage, IActionServicePackage>("servicePackages");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
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

  const getServicePackages = () => {
    const params = {
      Search: keyword,
      Page: page,
      PageSize: pageSize,
      SortColumn: "createdat",
      SortDirection: "desc",
    };
    usePackageActions<"getServicePackages">("getServicePackages", [params], true);
  };

  useEffect(() => {
    getServicePackages();
  }, [page, pageSize, keyword]);

  const handleDelete = (id: number) => {
    usePackageActions<"deleteServicePackage">(
      "deleteServicePackage",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            setDeleteConfirm({ open: false, id: 0, name: "" });
            getServicePackages();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      <BrowseServicePackage
        {...{ page, pageSize, setPage, setPageSize }}
        onSearch={handleSearch}
        searchText={tempSearch}
        setSearchText={setTempSearch}
        setOpenFormCreate={() => router.push("/dashboard/master/service-packages/create")}
        handleToDetail={(v: number) => router.push(`/dashboard/master/service-packages/update/${v}`)}
        handleEdit={(id: number) => router.push(`/dashboard/master/service-packages/update/${id}`)}
        handleDelete={(id: number, name: string) => setDeleteConfirm({ open: true, id, name })}
      />

      {deleteConfirm.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteConfirm.name)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onClose={() => setDeleteConfirm({ open: false, id: 0, name: "" })}
          loading={isLoading("deleteServicePackage")}
        />
      )}
    </>
  );
}
