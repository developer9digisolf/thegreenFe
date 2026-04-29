'use client';

import React, { useEffect } from "react";
import { Plus, Layout } from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { IPropsFormDepartment } from "@afx/interfaces/master/department.iface";
import {
  IActionDepartment,
  IStateDepartment,
} from "@afx/models/dashboard/master/departments.model";
import { useStore } from "@afx/store/core";
import { Col, Modal, Row, Spin, Typography } from "antd";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export function FormDepartment(props: IPropsFormDepartment) {
  const {
    state: { department },
    isLoading,
  } = useStore<IStateDepartment, IActionDepartment>("departments");

  const loading =
    isLoading("createDepartment") || isLoading("updateDepartment") || false;

  // SET FORM VALUES WHEN DEPARTMENT DATA IS AVAILABLE
  useEffect(() => {
    if (props?.open) {
      if (props?.formType === "create") {
        props.forms.resetFields();
      } else if (props?.formType === "update" || props?.formType === "detail") {
        if (department && department.id) {
          props.forms.setFieldsValue({
            code: department.code,
            name: department.name,
            description: department.description,
          });
        }
      }
    }
  }, [props?.open, props?.formType, department, props.forms]);

  const renderHeader = () => (
    <div className="flex items-center gap-3 p-2">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
        {props?.formType === "create" ? <Plus size={20} /> : <Layout size={20} />}
      </div>
      <div className="flex flex-col text-left">
        <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
          {props?.formType === "create" ?
            "Tambah"
          : props?.formType === "detail" ?
            "Detail"
          : "Update"}{" "}
          Departemen (Department)
        </Typography>
        <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Lengkapi informasi data departemen Anda</p>
      </div>
    </div>
  );

  return (
    <Modal
      width={600}
      title={renderHeader()}
      open={props?.open}
      onCancel={() => {
        !loading && props?.onCancel();
      }}
      destroyOnHidden={true}
      footer={[]}
    >
      <Spin spinning={loading} size="small">
        <UseForm
          form={props?.forms}
          onFinish={props.handleSubmit}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <UseFormItem
                name="code"
                label="Kode Departemen"
                {...itemLayouts}
                rules={[{ required: true, message: "Field kode wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan kode (contoh: DEP001)"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem
                name="name"
                label="Nama Departemen"
                {...itemLayouts}
                rules={[{ required: true, message: "Field nama wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan nama departemen"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            
            <Col span={24}>
              <UseFormItem
                name="description"
                label="Deskripsi"
                {...itemLayouts}
              >
                <UseInputArea
                  standart={false}
                  disabled={props?.formType === "detail"}
                  placeholder="Masukkan deskripsi singkat departemen..."
                  rows={4}
                />
              </UseFormItem>
            </Col>

            <Col span={24}>
              {props?.formType === "create" && (
                <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                    }`}
                  >
                    {loading ? "Processing..." : "Simpan Departemen"}
                  </button>
                </div>
              )}
              {props?.formType === "detail" && (
                <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      props?.setFormType("update");
                    }}
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                    }`}
                  >
                    Edit Data
                  </button>
                </div>
              )}
              {props?.formType === "update" && (
                <div className="flex items-center gap-4 justify-end mt-6 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 font-bold transition-all"
                    onClick={() => props?.setFormType("detail")}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                    }`}
                  >
                    {loading ? "Saving..." : "Simpan Perubahan"}
                  </button>
                </div>
              )}
            </Col>
          </Row>
        </UseForm>
      </Spin>
    </Modal>
  );
}
