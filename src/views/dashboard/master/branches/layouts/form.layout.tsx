import { useEffect } from "react";
import { Plus, MapPin } from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { IPropsFormBranch } from "@afx/interfaces/master/branch.iface";
import {
  IActionBranch,
  IStateBranch,
} from "@afx/models/dashboard/master/branches.model";
import { useStore } from "@afx/store/core";
import { Col, Modal, Row, Spin, Typography, Switch, InputNumber } from "antd";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export function FormBranch(props: IPropsFormBranch) {
  const {
    state: { branch },
    isLoading,
  } = useStore<IStateBranch, IActionBranch>("branches");

  const loading =
    isLoading("createBranch") || isLoading("updateBranch") || false;

  useEffect(() => {
    if (props?.open) {
      if (props?.formType === "create") {
        props?.forms?.resetFields();
      } else if (branch) {
        props?.forms?.setFieldsValue(branch);
      }
    }
  }, [props?.open, branch, props?.formType, props?.forms]);

  return (
    <Modal
      width={800}
      title={
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
            {props?.formType === "create" ? <Plus size={20} /> : <MapPin size={20} />}
          </div>
          <div className="flex flex-col">
            <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
              {props?.formType === "create" ?
                "Tambah"
              : props?.formType === "detail" ?
                "Detail"
              : "Update"}{" "}
              Cabang (Branch)
            </Typography>
            <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Lengkapi informasi data cabang Anda</p>
          </div>
        </div>
      }
      open={props?.open}
      onCancel={() => {
        !loading && props?.onCancel();
      }}
      destroyOnClose={true}
      footer={[]}
    >
      <Spin spinning={loading} size="small">
        <UseForm
          form={props?.forms}
          initialValues={props?.formType === "create" ? { isMainBranch: false } : branch}
          onFinish={props.handleSubmit}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <UseFormItem
                name="code"
                label="Kode Cabang"
                {...itemLayouts}
                rules={[{ required: true, message: "Field kode wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan kode (contoh: BR001)"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem
                name="isMainBranch"
                label="Cabang Pusat?"
                {...itemLayouts}
                valuePropName="checked"
              >
                <Switch disabled={props?.formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={24}>
              <UseFormItem
                name="name"
                label="Nama Cabang"
                {...itemLayouts}
                rules={[{ required: true, message: "Field nama wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan nama cabang"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            
            <Col xs={24} lg={12}>
              <UseFormItem
                name="email"
                label="Email"
                {...itemLayouts}
                rules={[
                  { required: true, message: "Field email wajib diisi" },
                  { type: "email", message: "Format email tidak valid" },
                ]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan email cabang"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={12}>
              <UseFormItem
                name="phone"
                label="Telepon"
                {...itemLayouts}
                rules={[
                  { required: true, message: "Field telepon wajib diisi" },
                ]}
              >
                <UseInput
                  standart={false}
                  placeholder="Masukkan nomor telepon"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>

            <Col span={24}>
              <UseFormItem
                name="address"
                label="Alamat Lengkap"
                {...itemLayouts}
                rules={[{ required: true, message: "Field alamat wajib diisi" }]}
              >
                <UseInputArea
                  standart={false}
                  disabled={props?.formType === "detail"}
                  placeholder="Masukkan alamat lengkap cabang..."
                  rows={3}
                />
              </UseFormItem>
            </Col>

            <Col xs={24} lg={8}>
              <UseFormItem
                name="city"
                label="Kota"
                {...itemLayouts}
                rules={[{ required: true, message: "Wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Kota"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={8}>
              <UseFormItem
                name="province"
                label="Provinsi"
                {...itemLayouts}
                rules={[{ required: true, message: "Wajib diisi" }]}
              >
                <UseInput
                  standart={false}
                  placeholder="Provinsi"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={8}>
              <UseFormItem
                name="postalCode"
                label="Kode Pos"
                {...itemLayouts}
              >
                <UseInput
                  standart={false}
                  placeholder="Kode Pos"
                  disabled={props?.formType === "detail"}
                />
              </UseFormItem>
            </Col>

            <Col xs={24} lg={12}>
              <UseFormItem
                name="latitude"
                label="Latitude"
                {...itemLayouts}
              >
                <InputNumber
                  className="w-full h-[46px] flex items-center px-2 !rounded-xl !border-2 !border-gray-100"
                  placeholder="Contoh: 3.5952"
                  disabled={props?.formType === "detail"}
                  stringMode
                />
              </UseFormItem>
            </Col>
            <Col xs={24} lg={12}>
              <UseFormItem
                name="longitude"
                label="Longitude"
                {...itemLayouts}
              >
                <InputNumber
                  className="w-full h-[46px] flex items-center px-2 !rounded-xl !border-2 !border-gray-100"
                  placeholder="Contoh: 98.6722"
                  disabled={props?.formType === "detail"}
                  stringMode
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
                  placeholder="Masukkan deskripsi singkat cabang..."
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
                    {loading ? "Processing..." : "Simpan Cabang"}
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
