"use client";

import { useStore } from "@afx/store/core";
import { Form, notification } from "antd";
import { useEffect, useState } from "react";
import { BrowsePosition } from "./layouts/browse.layout";
import { FormPosition } from "./layouts/form.layout";
import {
  IActionPosition,
  IStatePosition,
} from "@afx/models/dashboard/master/positions.model";
import { IReqFormPosition } from "@afx/interfaces/master/position.iface";

export default function PositionView() {
  const {
    useActions,
    state: { position },
  } = useStore<IStatePosition, IActionPosition>("positions");

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [openFormCreate, setOpenFormCreate] = useState<boolean>(false);
  const [forms] = Form.useForm<IReqFormPosition>();
  const [formType, setFormType] = useState<string>("create");

  const [tempSearch, setTempSearch] = useState<string>("");

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  const getPositions = () => {
    const params = {
      Search: keyword,
      Page: page,
      PageSize: pageSize,
      SortColumn: "createdat",
      SortDirection: "desc" as const,
    };
    useActions<"getPositions">("getPositions", [params], true);
  };

  useEffect(() => {
    getPositions();
  }, [page, pageSize, keyword]);

  const handleDetail = (id: number) => {
    useActions<"getPosition">("getPosition", [id], true);
    setFormType("detail");
    setOpenFormCreate(true);
  };

  const handleSubmit = () => {
    return forms
      .validateFields()
      .then((val) => {
        if (formType === "create") {
          useActions<"createPosition">(
            "createPosition",
            [
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getPositions();
                  }, 0);
                }
              },
            ],
            true,
          );
        } else {
          useActions<"updatePosition">(
            "updatePosition",
            [
              position?.id,
              val,
              (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                  setTimeout(() => {
                    setOpenFormCreate(false);
                    forms.resetFields();
                    getPositions();
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
          key: "FUNC-CREATE-POSITION",
        });
      });
  };

  const handleDelete = (id: number) => {
    useActions<"deletePosition">(
      "deletePosition",
      [
        id,
        (code: any) => {
          const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
          if (isSuccess) {
            getPositions();
          }
        },
      ],
      true,
    );
  };

  return (
    <>
      <BrowsePosition
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
          useActions<"getPosition">("getPosition", [id], true);
          setFormType("update");
          setOpenFormCreate(true);
        }}
        handleDelete={(v: number) => handleDelete(v)}
      />

      <FormPosition
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
