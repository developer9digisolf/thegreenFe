'use client';

import { useEffect, useMemo } from "react";
import { 
  Plus, Building2, MapPin, Phone, Mail, 
  Info, ShieldCheck, ChevronRight, Save, X,
  Globe, Fingerprint, Layers
} from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { IPropsFormCompany } from "@afx/interfaces/master/company.iface";
import {
  IActionCompany,
  IStateCompany,
} from "@afx/models/dashboard/master/companies.model";
import { useStore } from "@afx/store/core";
import { Col, Modal, Row, Select, Spin, Typography, Tag, Card, Button, Input, TreeSelect } from "antd";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

export function FormCompany(props: IPropsFormCompany) {
  const {
    state: { company, companies, allCompaniesFlat },
    isLoading,
    useActions
  } = useStore<IStateCompany, IActionCompany>("companies");

  const loading =
    isLoading("createCompany") || isLoading("updateCompany") || isLoading("getCompany") || false;

  useEffect(() => {
    if (props?.open) {
      if (props?.formType === "create") {
        props?.forms?.resetFields();
      } else if (company && (props?.formType === "update" || props?.formType === "detail")) {
        props?.forms?.setFieldsValue(company);
      }
    }
  }, [props?.open, company, props?.formType, props?.forms]);

  // Convert hierarchical company data to TreeSelect format
  const treeData = useMemo(() => {
    const mapNode = (nodes: any[]): any[] => {
      return nodes.map(node => ({
        title: `${node.name} (${node.code})`,
        value: node.id,
        disabled: node.id === company?.id, // Prevent self-parenting
        children: node.children ? mapNode(node.children) : undefined
      }));
    };
    return mapNode(companies || []);
  }, [companies, company?.id]);

  const renderHeader = () => (
    <div className="flex items-center justify-between w-full pr-6">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-700 ${
          props?.formType === "create" ? "bg-emerald-600 text-white" : "bg-slate-900 text-emerald-500"
        }`}>
          {props?.formType === "create" ? <Plus size={28} /> : <Building2 size={28} />}
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <Typography className="text-xl font-black text-slate-950 m-0 leading-tight">
              {props?.formType === "create" ? "New Entity" : (company?.name || "Entity Profile")}
            </Typography>
            {props?.formType !== "create" && (
               <Tag className={`rounded-lg px-2 py-0.5 font-black border-none uppercase text-[9px] tracking-widest ${
                 props?.formType === 'detail' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'
               }`}>
                  {props?.formType}
               </Tag>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-black m-0 mt-1 uppercase tracking-widest opacity-60 flex items-center gap-2">
            <Globe size={12} /> Master Organizational Map
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {props?.formType === "detail" && (
          <Button
            type="primary"
            icon={<Layers size={18} />}
            onClick={() => props?.setFormType("update")}
            className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
          >
            Modify Structure
          </Button>
        )}
        {(props?.formType === "update" || props?.formType === "create") && (
          <div className="flex items-center gap-3">
            <Button
              icon={<X size={18} />}
              onClick={() => props?.onCancle()}
              className="h-12 px-5 rounded-xl bg-slate-50 text-slate-400 border-none font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
            >
              Discard
            </Button>
            <Button
              type="primary"
              icon={<Save size={18} />}
              onClick={() => props.forms.submit()}
              loading={loading}
              className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
            >
              {props?.formType === 'create' ? 'Register Company' : 'Commit Changes'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      width={1000}
      title={renderHeader()}
      open={props?.open}
      onCancel={() => !loading && props?.onCancle()}
      destroyOnHidden={true}
      footer={null}
      centered
      className="company-modal-premium"
      styles={{ 
        body: { padding: '40px', maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' },
        mask: { backdropFilter: 'blur(16px)', backgroundColor: 'rgba(15, 23, 42, 0.8)' }
      }}
      closable={false}
    >
      <Spin spinning={loading} description={<span className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-500 mt-4 block">Building Hierarchy...</span>}>
        <UseForm form={props?.forms} onFinish={props.handleSubmit}>
          <div className="flex flex-col gap-8">
            {/* Identity Card */}
            <Card className="rounded-[40px] border-none shadow-[0_15px_50px_rgba(0,0,0,0.02)] overflow-hidden bg-slate-50/40 p-8">
              <Row gutter={[32, 24]}>
                <Col span={8}>
                  <UseFormItem
                    name="code"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4 text-center">Entity Code</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Code is required" }]}
                  >
                    <Input
                      placeholder="e.g. TGS-HQ"
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-16 px-6 border-slate-100 bg-white font-black text-slate-800 text-lg uppercase text-center"
                    />
                  </UseFormItem>
                </Col>
                <Col span={16}>
                  <UseFormItem
                    name="name"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Corporate Name</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Name is required" }]}
                  >
                    <Input
                      placeholder="e.g. The Green Spa Indonesia"
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-16 px-6 border-slate-100 bg-white font-black text-slate-800 text-lg"
                    />
                  </UseFormItem>
                </Col>
                <Col span={24}>
                  <UseFormItem
                    name="parentId"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Parent Organization</span>}
                    {...itemLayouts}
                  >
                    <TreeSelect
                      showSearch
                      treeData={treeData}
                      placeholder="Select parent company (optional)"
                      allowClear
                      treeDefaultExpandAll
                      disabled={props?.formType === "detail"}
                      className="h-16 premium-tree-select"
                      popupClassName="premium-tree-dropdown"
                    />
                  </UseFormItem>
                </Col>
              </Row>
            </Card>

            {/* Contact & Details */}
            <Row gutter={[32, 32]}>
              <Col span={12}>
                <div className="flex flex-col gap-6">
                  <UseFormItem
                    name="email"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Official Email</span>}
                    {...itemLayouts}
                    rules={[{ required: true, type: 'email' }]}
                  >
                    <Input
                      prefix={<Mail size={16} className="text-slate-300 mr-2" />}
                      placeholder="corporate@thegreen.id"
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-14 px-4 border-slate-100 bg-white font-bold"
                    />
                  </UseFormItem>
                  <UseFormItem
                    name="phone"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Phone Line</span>}
                    {...itemLayouts}
                    rules={[{ required: true }]}
                  >
                    <Input
                      prefix={<Phone size={16} className="text-slate-300 mr-2" />}
                      placeholder="+62 8xx..."
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-14 px-4 border-slate-100 bg-white font-bold"
                    />
                  </UseFormItem>
                </div>
              </Col>
              <Col span={12}>
                <UseFormItem
                  name="address"
                  label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Physical Address</span>}
                  {...itemLayouts}
                  rules={[{ required: true }]}
                >
                  <Input.TextArea
                    rows={5}
                    placeholder="Provide full corporate address..."
                    disabled={props?.formType === "detail"}
                    className="rounded-2xl px-4 py-4 border-slate-100 bg-white font-bold"
                  />
                </UseFormItem>
              </Col>
              <Col span={24}>
                 <UseFormItem
                    name="description"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Corporate Description</span>}
                    {...itemLayouts}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Additional organizational details..."
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl px-4 py-4 border-slate-100 bg-white font-bold"
                    />
                  </UseFormItem>
              </Col>
            </Row>
          </div>
        </UseForm>
      </Spin>

      <style jsx global>{`
        .company-modal-premium .ant-modal-content {
          border-radius: 48px;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
        }
        .company-modal-premium .ant-modal-header {
          padding: 48px 40px 24px;
          border-bottom: none;
        }
        .premium-tree-select .ant-select-selector {
          border-radius: 16px !important;
          height: 64px !important;
          padding: 14px 24px !important;
          border: 1px solid #f1f5f9 !important;
          background: #fff !important;
        }
        .premium-tree-select .ant-select-selection-placeholder {
          line-height: 36px !important;
          font-weight: 700;
          color: #cbd5e1;
        }
        .premium-tree-select .ant-select-selection-item {
          line-height: 36px !important;
          font-weight: 900;
          color: #0f172a;
        }

        .premium-tree-dropdown {
          border-radius: 24px !important;
          padding: 8px !important;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15) !important;
          border: 1px solid #f1f5f9 !important;
        }
        
        .premium-tree-dropdown .ant-select-tree {
          background: transparent !important;
        }

        .premium-tree-dropdown .ant-select-tree-node-content-wrapper {
          border-radius: 12px !important;
          padding: 8px 12px !important;
          transition: all 0.2s !important;
        }
        
        .premium-tree-dropdown .ant-select-tree-node-selected {
          background: #f0fdf4 !important;
          color: #059669 !important;
        }

        /* Responsive Adjustments */
        @media (max-width: 1024px) {
          .company-modal-premium {
            width: 95% !important;
            max-width: 95% !important;
          }
          .company-modal-premium .ant-modal-content {
            border-radius: 32px;
          }
          .company-modal-premium .ant-modal-header {
            padding: 32px 24px 16px;
          }
        }

        @media (max-width: 640px) {
          .company-modal-premium .ant-modal-content {
             border-radius: 0;
          }
          .company-modal-premium .ant-modal-header {
             padding: 24px 16px 12px;
          }
          .company-modal-premium .ant-modal-body {
             padding: 20px 16px !important;
             max-height: calc(100vh - 120px) !important;
          }
        }
      `}</style>
    </Modal>
  );
}
