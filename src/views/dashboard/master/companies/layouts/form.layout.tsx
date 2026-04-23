import { Plus } from "lucide-react";
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

  return (
    <Modal
      width={800}
      title={
        <div className="flex items-center gap-4">
          <Plus size={18} />
          <Typography className="text-xl">
            {props?.formType === "create" ?
              "Tambah"
            : props?.formType === "detail" ?
              "Detail"
            : "Update"}{" "}
            Company
          </Typography>
        </div>
      }
      open={props?.open}
      onCancel={() => {
        !loading && props?.onCancle();
      }}
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
                  placeholder="Masukkan alamat..."
                  className="!border-2 !border-gray-200 focus:!border-orange-500 focus:!ring-4 focus:!ring-orange-100 !rounded-xl transition-all duration-200"
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
                  placeholder="Masukkan deskripsi..."
                  className="!border-2 !border-gray-200 focus:!border-orange-500 focus:!ring-4 focus:!ring-orange-100 !rounded-xl transition-all duration-200"
                />
              </UseFormItem>
            </Col>
            <Col span={24}>
              {props?.formType === "create" && (
                <button
                  type="button"
                  onClick={() => props?.handleSubmit()}
                  disabled={loading}
                  className={`w-full lg:w-[200px] float-right mt-3 px-4 py-2 rounded-lg font-bold text-lg text-white transition-colors ${
                    loading ? "!bg-[#999]" : (
                      "!bg-orange-500 hover:!bg-orange-600"
                    )
                  }`}
                >
                  Submit
                </button>
              )}
              {props?.formType === "detail" && (
                <button
                  type="button"
                  onClick={() => {
                    props?.setFormType("update");
                  }}
                  disabled={loading}
                  className={`w-full lg:w-[200px] float-right mt-3 px-4 py-2 rounded-lg font-bold text-lg text-white transition-colors ${
                    loading ? "!bg-[#999]" : (
                      "!bg-orange-500 hover:!bg-orange-600"
                    )
                  }`}
                >
                  Update
                </button>
              )}
              {props?.formType === "update" && (
                <div className="flex items-center gap-4 justify-end mt-4">
                  <Typography
                    className="font-display cursor-pointer shadow-sm border border-gray-100 p-2 px-6 w-full lg:w-[200px] rounded-lg text-center text-base font-semibold"
                    onClick={() => props?.setFormType("detail")}
                  >
                    Kembali
                  </Typography>
                  <button
                    type="button"
                    onClick={() => props?.handleSubmit()}
                    disabled={loading}
                    className={`w-full lg:w-[200px] px-4 py-2 rounded-lg font-bold text-lg text-white transition-colors ${
                      loading ? "!bg-[#999]" : (
                        "!bg-orange-500 hover:!bg-orange-600"
                      )
                    }`}
                  >
                    Submit
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
