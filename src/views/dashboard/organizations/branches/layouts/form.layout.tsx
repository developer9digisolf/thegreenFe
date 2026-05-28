"use client";

import React, { useEffect, useState } from "react";
import { UseForm } from "@afx/components/form/form.layout";
import { IPropsFormBranch } from "@afx/interfaces/master/branch.iface";
import { IActionBranch, IStateBranch } from "@afx/models/dashboard/master/branches.model";
import { useStore } from "@afx/store/core";
import { Col, Spin, Typography, Form, Card, Button, Tabs, Input } from "antd";
import { ArrowLeft, Plus, MapPin, ListChecks, Info, Image as ImageIcon, Receipt } from "lucide-react";

// Impor komponen terpisah
import BranchPaymentMethodsTab from "./BranchPaymentMethodsTab";
import BranchGalleryTab from "./BranchGalleryTab";
import BranchGeneralTab from "./BranchGeneralTab";
import BranchAdditionalCostsTab from "./BranchAdditionalCostsTab";

export function FormBranch(props: IPropsFormBranch) {
  const { state: { branch }, isLoading } = useStore<IStateBranch, IActionBranch>("branches");
  const loading = isLoading("createBranch") || isLoading("updateBranch") || false;
  
  const [activeTab, setActiveTab] = useState<string>("general");

  // Inisialisasi Nilai ke Form
  useEffect(() => {
    if (props?.open) {
      if (props?.formType === "create") {
        props.forms.resetFields();
        props.forms.setFieldsValue({
          imageGaleries: [],
          imageUrl: null,
          commissionType: "percentage",
          commissionAmount: 25,
          commissionBonusType: "percentage",
          commissionBonusAmount: 5,
        });
      } else if (props?.formType === "update" || props?.formType === "detail") {
        if (branch && branch.id) {
          props.forms.setFieldsValue({
            code: branch.code,
            name: branch.name,
            email: branch.email,
            phone: branch.phone,
            address: branch.address,
            city: branch.city,
            province: branch.province,
            postalCode: branch.postalCode,
            latitude: branch.latitude,
            longitude: branch.longitude,
            isMainBranch: branch.isMainBranch,
            description: branch.description,
            imageUrl: branch.imageUrl,
            imageGaleries: branch.imageGaleries || [],
            commissionType: branch.commissionType || "percentage",
            commissionAmount: branch.commissionAmount || 25,
            commissionBonusType: branch.commissionBonusType || "percentage",
            commissionBonusAmount: branch.commissionBonusAmount || 5,
          });
        }
      }
    }
  }, [props?.open, props?.formType, branch, props.forms]);

  const renderHeader = () => (
    <div className="flex items-center gap-3 p-2">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
        {props?.formType === "create" ? <Plus size={20} /> : <MapPin size={20} />}
      </div>
      <div className="flex flex-col text-left">
        <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
          {props?.formType === "create" ? "Tambah" : props?.formType === "detail" ? "Detail" : "Perbarui"} Cabang (Branch)
        </Typography>
        <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Lengkapi informasi data cabang Anda</p>
      </div>
    </div>
  );

  const renderFormActions = () => (
    <Col span={24}>
      {props?.formType === "create" && (
        <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
          <button type="submit" disabled={loading} className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"}`}>
            {loading ? "Memproses..." : "Simpan Cabang"}
          </button>
        </div>
      )}
      {props?.formType === "detail" && (
        <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
          <button type="button" onClick={() => props?.setFormType("update")} disabled={loading} className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"}`}>
            Edit Data
          </button>
        </div>
      )}
      {props?.formType === "update" && (
        <div className="flex items-center gap-4 justify-end mt-6 border-t border-slate-100 pt-6">
          <button type="button" className="px-6 py-3 rounded-xl text-slate-500 bg-slate-50 hover:bg-slate-100 font-bold transition-all" onClick={() => props?.setFormType("detail")}>Batal</button>
          <button type="submit" disabled={loading} className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${loading ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"}`}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      )}
    </Col>
  );

  const tabsItems = [
    {
      key: "general",
      label: <div className="flex items-center gap-2"><Info size={16} />Informasi Umum</div>,
      children: (
        <div className="max-w-[100%] mx-auto py-4">
          <Spin spinning={loading} size="small" classNames={{ root: "w-full" }}>
            <UseForm form={props?.forms} onFinish={props.handleSubmit}>
              {/* Field tersembunyi yang datanya diisi oleh Gallery */}
              <Form.Item name="imageUrl" noStyle><Input type="hidden" /></Form.Item>
              <Form.Item name="imageGaleries" noStyle><Input type="hidden" /></Form.Item>

              <BranchGeneralTab forms={props.forms} formType={props.formType} isOpen={props.open} />
              
              {/* Render actions submit button di dalam <Form> */}
              {renderFormActions()}
            </UseForm>
          </Spin>
        </div>
      ),
    },
    {
      key: "payment",
      label: <div className="flex items-center gap-2"><ListChecks size={16} />Metode Pembayaran</div>,
      children: (
        <div className="max-w-[900px] mx-auto py-4">
          <BranchPaymentMethodsTab branchId={branch?.id} isOpen={props.open} />
        </div>
      ),
    },
    {
      key: "gallery",
      label: <div className="flex items-center gap-2"><ImageIcon size={16} />Galeri Foto</div>,
      children: (
        <div className="max-w-[900px] mx-auto py-4">
          <BranchGalleryTab branch={branch} forms={props.forms} formType={props.formType} isOpen={props.open} handleUpdateGallery={props.handleUpdateGallery} />
        </div>
      ),
    },
    {
      key: "additionalCost",
      label: <div className="flex items-center gap-2"><Receipt size={16} />Biaya Tambahan</div>,
      children: (
        <div className="max-w-[900px] mx-auto py-4">
          <BranchAdditionalCostsTab branchId={branch?.id} isOpen={props.open} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Card
        className="border-0 shadow-sm rounded-2xl overflow-hidden mt-4"
        title={
          <div className="flex items-center justify-between">
            {renderHeader()}
            <Button type="text" icon={<ArrowLeft size={18} />} onClick={props.onCancel} className="flex items-center gap-2 text-slate-400 hover:text-slate-600">
              Kembali ke Daftar
            </Button>
          </div>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabsItems.filter((item) => {
            if (props.formType === "create" && item.key === "payment") return false;
            return true;
          })}
          className="premium-tabs"
        />
      </Card>
      <style jsx global>{`
        .premium-tabs .ant-tabs-nav { margin-bottom: 24px !important; padding: 0 16px; }
        .premium-tabs .ant-tabs-tab { padding: 12px 16px !important; font-weight: 600 !important; transition: all 0.3s !important; }
        .premium-tabs .ant-tabs-tab-active { color: #10b981 !important; }
        .premium-tabs .ant-tabs-ink-bar { background: #10b981 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
        .premium-table .ant-table-thead > tr > th { background: #f8fafc !important; color: #64748b !important; font-size: 11px !important; text-transform: uppercase !important; font-weight: 700 !important; letter-spacing: 0.05em !important; border-bottom: 1px solid #f1f5f9 !important; }
        .premium-table .ant-table-tbody > tr > td { border-bottom: 1px solid #f8fafc !important; padding: 12px 16px !important; }
        .premium-table .ant-table-row:hover > td { background: #fdfdfd !important; }
      `}</style>
    </>
  );
}