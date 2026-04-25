import { useEffect } from "react";
import { Plus, Building2 } from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { IPropsFormCompany } from "@afx/interfaces/master/company.iface";
import {
  IActionCompany,
  IStateCompany,
} from "@afx/models/dashboard/master/companies.model";
import { useStore } from "@afx/store/core";
import { Col, Modal, Row, Spin, Typography } from "antd";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export function FormCompany(props: IPropsFormCompany) {
  const {
    state: { company },
    isLoading,
  } = useStore<IStateCompany, IActionCompany>("companies");

  const loading =
    isLoading("createCompany") || isLoading("updateCompany") || false;

  useEffect(() => {
    if (props?.open) {
      if (props?.formType === "create") {
        props?.forms?.resetFields();
      } else if (company) {
        props?.forms?.setFieldsValue(company);
      }
    }
  }, [props?.open, company, props?.formType, props?.forms]);

  return (
    <Modal
      width={700}
      title={
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
            {props?.formType === "create" ? <Plus size={20} /> : <Building2 size={20} />}
          </div>
          <div className="flex flex-col">
            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
              {props?.formType === "create" ?
                "Tambah"
              : props?.formType === "detail" ?
                "Detail"
              : "Update"}{" "}
              Company
            </Typography>
            <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Lengkapi informasi data perusahaan Anda</p>
          </div>
        </div>
      }
      open={props?.open}
      onCancel={() => {
        !loading && props?.onCancle();
      }}
      destroyOnHidden={true}
      footer={[]}
    >
      <Spin spinning={loading} size="small">
        <UseForm
          form={props?.forms}
          initialValues={props?.formType === "create" ? undefined : company}
        >
          <Row gutter={[16, 8]}>
            <Col span={24}>
              <UseFormItem
                name="code"
                label="Kode"
                {...itemLayouts}
                rules={[{ required: true, message: "field kode wajib di isi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan kode"
                  disabled={props?.formType === "detail" ? true : false}
                />
              </UseFormItem>
            </Col>
            <Col span={24}>
              <UseFormItem
                name="name"
                label="Nama Company"
                {...itemLayouts}
                rules={[{ required: true, message: "field nama wajib di isi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan nama company"
                  disabled={props?.formType === "detail" ? true : false}
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={12}>
              <UseFormItem
                name="email"
                label="Email"
                {...itemLayouts}
                rules={[
                  { required: true, message: "field email wajib di isi" },
                  { type: "email", message: "format email tidak valid" },
                ]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan email"
                  disabled={props?.formType === "detail" ? true : false}
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={12}>
              <UseFormItem
                name="phone"
                label="Telepon"
                {...itemLayouts}
                rules={[
                  { required: true, message: "field telepon wajib di isi" },
                ]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan nomor telepon"
                  disabled={props?.formType === "detail" ? true : false}
                />
              </UseFormItem>
            </Col>
            <Col span={24}>
              <UseFormItem
                name="address"
                label="Alamat"
                {...itemLayouts}
                rules={[
                  { required: true, message: "field alamat wajib di isi" },
                ]}
              >
                <UseInputArea
                  standart={false}
                  disabled={props?.formType === "detail" ? true : false}
                  placeholder="Masukkan alamat lengkap perusahaan..."
                  className="!border-2 !border-gray-100 focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10 !rounded-xl transition-all duration-200"
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
                  disabled={props?.formType === "detail" ? true : false}
                  placeholder="Masukkan deskripsi singkat perusahaan..."
                  className="!border-2 !border-gray-100 focus:!border-emerald-500 focus:!ring-4 focus:!ring-emerald-500/10 !rounded-xl transition-all duration-200"
                />
              </UseFormItem>
            </Col>
            <Col span={24}>
              {props?.formType === "create" && (
                <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
                  <button
                    type="button"
                    onClick={() => props?.handleSubmit()}
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : (
                        "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                      )
                    }`}
                  >
                    {loading ? "Processing..." : "Simpan Company"}
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
                      loading ? "bg-slate-400 cursor-not-allowed" : (
                        "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                      )
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
                    type="button"
                    onClick={() => props?.handleSubmit()}
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                      loading ? "bg-slate-400 cursor-not-allowed" : (
                        "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                      )
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
