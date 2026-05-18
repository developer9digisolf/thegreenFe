"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowseBranch } from "./layouts/browse.layout";
import { FormBranch } from "./layouts/form.layout";
import { useAuth } from "@afx/contexts/AuthContext";
import { BranchOperatingHoursModal } from "./layouts/operating-hours.layout";
import { ConfirmActionModal, ActionPresets } from "@afx/components/modals/ConfirmActionModal.layout";
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

  const { user } = useAuth();

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: number; name: string }>({
    open: false,
    id: 0,
    name: "",
  });

  const getPathFromUrl = (url: any) => {
    return typeof url === "string" ? url : (url?.imageUrl || "");
  };

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
        const payload = {
          ...val,
          imageUrl: val.imageUrl ? getPathFromUrl(val.imageUrl) : val.imageUrl,
          ImageGaleries: val.imageGaleries ? val.imageGaleries.map((url: any) => getPathFromUrl(url)) : [],
        };
        
        // Remove lowercase imageGaleries to match backend casing expectation
        delete (payload as any).imageGaleries;

        console.log("🚀 [Branch Submit Payload]:", JSON.stringify(payload, null, 2));

        if (formType === "create") {
          useActions<"createBranch">(
            "createBranch",
            [
              payload,
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
              payload,
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
          message: "Validasi Gagal",
          description: err?.errorFields?.[0]?.errors,
          duration: 2,
          key: "FUNC-CREATE-BRANCH",
        });
      });
  };

  const handleUpdateGallery = (values: Partial<IReqFormBranch>) => {
    if (branch?.id) {
      const galleryUrls = values.imageGaleries || forms.getFieldValue('imageGaleries') || [];
      
      // Send ONLY ImageGaleries for the gallery update request
      const payload = {
        ImageGaleries: galleryUrls.map((url: any) => getPathFromUrl(url)),
      };
      
      console.log("📸 [Branch Gallery Update Payload]:", JSON.stringify(payload, null, 2));
      
      useActions<"updateBranch">(
        "updateBranch",
        [
          branch.id,
          payload,
          (code: any) => {
            const isSuccess = !code || String(code) === "20000" || String(code).startsWith("2");
            if (isSuccess) {
              useActions<"getBranch">("getBranch", [branch.id], true);
              getBranches();
            }
          },
        ],
        true,
      );
    }
  };

  const handleDelete = (id: number) => {
    useActions<"deleteBranch">(
      "deleteBranch",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            setDeleteConfirm({ open: false, id: 0, name: "" });
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
      {!openFormCreate && (
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
        handleDelete={(id: number, name: string) => setDeleteConfirm({ open: true, id, name })}
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
          handleUpdateGallery={handleUpdateGallery}
        />
      )}

      {deleteConfirm.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteConfirm.name)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onClose={() => setDeleteConfirm({ open: false, id: 0, name: "" })}
          loading={false}
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
