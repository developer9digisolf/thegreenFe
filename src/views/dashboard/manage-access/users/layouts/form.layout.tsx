'use client';

import React, { useEffect, useState } from "react";
import { 
  Plus, User, Globe, Layers, ArrowRight, ShieldCheck, 
  UserCheck, Edit3, X, Save, Search, ChevronRight, 
  Trash2, Building2, MapPin, Fingerprint, ArrowLeftRight,
  ShieldAlert, CheckCircle2, ChevronLeft, RefreshCcw
} from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import { UseSelect } from "@afx/components/ui/select/select.layout";
import { IPropsFormUser } from "@afx/interfaces/master/user.iface";
import {
  IActionUser,
  IStateUser,
} from "@afx/models/dashboard/manage-access/users.model";
import { useStore } from "@afx/store/core";
import { Col, Modal, Row, Spin, Typography, Tabs, Tag, Card, Button, Input, Table, Tooltip, Empty } from "antd";
import { useAuth } from "@afx/contexts/AuthContext";

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

const roleOptions = [
  { label: "Owner", value: 0 },
  { label: "Admin", value: 1 },
  { label: "Therapist", value: 2 },
  { label: "Office", value: 4 },
  { label: "Cashier", value: 5 },
];

const AccessTable = ({ 
  data, 
  selectedKeys, 
  onSelectChange, 
  type,
  title,
  subtitle,
  colorClass,
  icon: Icon
}: any) => (
  <div className="flex-1 flex flex-col h-full bg-white rounded-[32px] border border-slate-100 shadow-lg overflow-hidden group hover:border-emerald-100 transition-all duration-500">
    <div className={`px-6 py-4 flex items-center justify-between border-bottom border-slate-50 ${colorClass}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
          <Icon size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/70">{subtitle}</span>
          <span className="text-sm font-black text-white tracking-tight">{title}</span>
        </div>
      </div>
      <Tag className="bg-white/20 text-white border-none px-3 py-0.5 rounded-lg font-black text-[9px]">{data.length} ITEMS</Tag>
    </div>
    
    <div className="p-2 flex-1 overflow-hidden">
      <Table
        size="small"
        dataSource={data}
        rowKey={record => String(record.id)}
        pagination={false}
        scroll={{ y: 350 }}
        rowSelection={{
          selectedRowKeys: selectedKeys,
          onChange: onSelectChange,
        }}
        columns={[
          {
            title: 'NAME',
            dataIndex: 'name',
            render: (text: string, record: any) => (
              <div className="flex flex-col py-1">
                <span className="font-bold text-slate-800 text-[12px] tracking-tight truncate max-w-[200px]">{text || record.companyName || record.branchName}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 opacity-70 truncate max-w-[200px]">
                  {record.email || record.location || (type === 'company' ? 'Entity' : 'Site')}
                </span>
              </div>
            )
          }
        ]}
        className="premium-access-table-compact"
        onRow={(record) => ({
          onClick: () => {
            const key = String(record.id);
            onSelectChange(selectedKeys.includes(key) ? selectedKeys.filter((k: any) => k !== key) : [...selectedKeys, key]);
          },
        })}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-[9px] font-black uppercase tracking-widest text-slate-300">No Data</span>} />
        }}
      />
    </div>
  </div>
);

export function FormUser(props: IPropsFormUser) {
  const {
    state: { user, employees, allCompanies, allBranches, userCompanies, userBranches },
    isLoading,
    useActions
  } = useStore<IStateUser, IActionUser>("users");

  const { user: currentUser, refreshUser } = useAuth();

  // Use separate selection states for each tab/pool to avoid key collisions and cross-pollution
  const [selAvailComp, setSelAvailComp] = useState<React.Key[]>([]);
  const [selAssignComp, setSelAssignComp] = useState<React.Key[]>([]);
  const [selAvailBranch, setSelAvailBranch] = useState<React.Key[]>([]);
  const [selAssignBranch, setSelAssignBranch] = useState<React.Key[]>([]);

  const loading =
    isLoading("createUser") || 
    isLoading("updateUser") || 
    isLoading("getUser") || 
    isLoading("getAllCompanies") || 
    isLoading("getAllBranches") || 
    isLoading("getUserCompanies") || 
    isLoading("getUserBranches") || 
    isLoading("updateUserCompanies") ||
    isLoading("updateUserBranches") ||
    false;

  useEffect(() => {
    if (props?.open) {
      useActions<"getEmployees">("getEmployees", [{ Page: 1, PageSize: 100, SortColumn: "createdat", SortDirection: "desc" }], true);
      
      if (props?.formType === "create") {
        props.forms.resetFields();
      } else if (props?.formType === "update" || props?.formType === "detail") {
        if (user && user.id) {
          props.forms.setFieldsValue({
            username: user.username,
            email: user.email,
            role: roleOptions.find(r => r.label?.toLowerCase() === user.role?.toLowerCase())?.value,
            employeeId: user.employeeId,
          });

          useActions<"getAllCompanies">("getAllCompanies", [], true);
          useActions<"getAllBranches">("getAllBranches", [], true);
          useActions<"getUserCompanies">("getUserCompanies", [user.id], true);
          useActions<"getUserBranches">("getUserBranches", [user.id], true);
        }
      }
    }
  }, [props?.open, props?.formType, user?.id, props.forms]);

  const handleTransfer = (type: 'company' | 'branch', direction: 'add' | 'remove') => {
    if (!user?.id) return;

    if (type === 'company') {
      const currentIds = userCompanies.map(c => Number(c.companyId));
      let newIds: number[] = [];

      if (direction === 'add') {
        const addedIds = selAvailComp.map(Number);
        newIds = [...currentIds, ...addedIds];
        setSelAvailComp([]);
      } else {
        const removedMappingIds = selAssignComp.map(Number);
        newIds = userCompanies
          .filter(c => !removedMappingIds.includes(Number(c.id)))
          .map(c => Number(c.companyId));
        setSelAssignComp([]);
      }

      useActions<"updateUserCompanies">("updateUserCompanies", [user.id, newIds, () => {
        useActions<"getUserCompanies">("getUserCompanies", [user.id], true);
        // Automatically refresh global switcher if current logged-in user is updated
        if (Number(user.id) === Number(currentUser?.id)) {
          refreshUser();
        }
      }], true);
    } else {
      const currentIds = userBranches.map(b => Number(b.branchId));
      let newIds: number[] = [];

      if (direction === 'add') {
        const addedIds = selAvailBranch.map(Number);
        newIds = [...currentIds, ...addedIds];
        setSelAvailBranch([]);
      } else {
        const removedMappingIds = selAssignBranch.map(Number);
        newIds = userBranches
          .filter(b => !removedMappingIds.includes(Number(b.id)))
          .map(b => Number(b.branchId));
        setSelAssignBranch([]);
      }

      useActions<"updateUserBranches">("updateUserBranches", [user.id, newIds, () => {
        useActions<"getUserBranches">("getUserBranches", [user.id], true);
        // Automatically refresh global switcher if current logged-in user is updated
        if (Number(user.id) === Number(currentUser?.id)) {
          refreshUser();
        }
      }], true);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between w-full pr-6">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all duration-700 ${
          props?.formType === "create" ? "bg-emerald-600 text-white" : "bg-slate-900 text-emerald-500"
        }`}>
          {props?.formType === "create" ? <Plus size={28} /> : <Fingerprint size={28} />}
        </div>
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <Typography className="text-xl font-black text-slate-950 m-0 leading-tight">
              {props?.formType === "create" ? "Tambah Pengguna Baru" : (user?.username ? `@${user.username}` : "Profil Pengguna")}
            </Typography>
            {props?.formType !== "create" && (
               <Tag className={`rounded-lg px-2 py-0.5 font-black border-none uppercase text-[9px] tracking-widest ${
                 props?.formType === 'detail' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'
               }`}>
                  {props?.formType === 'detail' ? 'Detail' : 'Ubah'}
               </Tag>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-black m-0 mt-1 uppercase tracking-widest opacity-60 flex items-center gap-2">
            <ShieldAlert size={12} /> Protokol Keamanan Aktif
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {props?.formType === "detail" && (
          <Button
            type="primary"
            icon={<Edit3 size={18} />}
            onClick={() => props?.setFormType("update")}
            className="h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
          >
            Ubah Akun  
          </Button>
        )}
        {(props?.formType === "update" || props?.formType === "create") && (
          <div className="flex items-center gap-3">
            <Button
              icon={<X size={18} />}
              onClick={() => props?.onCancel()}
              className="h-12 px-5 rounded-xl bg-slate-50 text-slate-400 border-none font-bold text-sm hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
            >
              Batal
            </Button>
            <Button
              type="primary"
              icon={<Save size={18} />}
              onClick={() => props.forms.submit()}
              loading={loading}
              className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 border-none font-black text-sm shadow-xl shadow-emerald-600/20 active:scale-95 flex items-center gap-2"
            >
              {props?.formType === 'create' ? 'Buat Pengguna' : 'Simpan Perubahan'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const availableCompanies = (allCompanies || []).filter(item => 
    !(userCompanies || []).some(a => Number(a.companyId) === Number(item.id))
  );

  const availableBranches = (allBranches || []).filter(item => 
    !(userBranches || []).some(a => Number(a.branchId) === Number(item.id))
  );

  useEffect(() => {
    console.log("Authority Data Sync:", {
      user: user?.username,
      allCompanies: allCompanies?.length,
      userCompanies: userCompanies?.length,
      availableCompanies: availableCompanies?.length
    });
  }, [user?.username, allCompanies, userCompanies, availableCompanies]);

  const tabItems = [
    {
      key: "1",
      label: (
        <div className="flex items-center gap-2 py-2 group">
          <User size={18} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-black">Identitas</span>
        </div>
      ),
      children: (
        <div className="py-10 px-2">
          <UseForm form={props?.forms} onFinish={props.handleSubmit}>
            <Card className="rounded-[40px] border-none shadow-[0_15px_50px_rgba(0,0,0,0.02)] overflow-hidden bg-slate-50/40 p-8">
              <Row gutter={[32, 24]}>
                <Col span={12}>
                  <UseFormItem
                    name="username"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Username / ID</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Username wajib diisi" }]}
                  >
                    <Input
                      placeholder="Contoh: administrator_01"
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-16 px-6 border-slate-100 bg-white font-bold text-slate-800 text-lg"
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="email"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Alamat Email</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Email wajib diisi" }, { type: "email", message: "Format email tidak valid" }]}
                  >
                    <Input
                      placeholder="Contoh: admin@thegreen.id"
                      disabled={props?.formType === "detail"}
                      className="rounded-2xl h-16 px-6 border-slate-100 bg-white font-bold text-slate-800 text-lg"
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="role"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Hak Akses (Role)</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Role wajib dipilih" }]}
                  >
                    <UseSelect
                      placeholder="Pilih hak akses..."
                      disabled={props?.formType === "detail"}
                      options={roleOptions}
                      className="rounded-2xl overflow-hidden h-16 border-slate-100 bg-white"
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="employeeId"
                    label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Kaitkan ke Karyawan</span>}
                    {...itemLayouts}
                    rules={[{ required: true, message: "Karyawan wajib dipilih" }]}
                  >
                    <UseSelect
                      placeholder="Pilih karyawan..."
                      disabled={props?.formType === "detail"}
                      options={employees?.map(emp => ({ label: emp.nickname || emp.fullName, value: emp.id })) || []}
                      showSearch
                      className="rounded-2xl overflow-hidden h-16 border-slate-100 bg-white"
                    />
                  </UseFormItem>
                </Col>
                {props?.formType === "create" && (
                  <Col span={24}>
                    <UseFormItem
                      name="password"
                      label={<span className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em] ml-4">Kata Sandi (Password)</span>}
                      {...itemLayouts}
                      rules={[{ required: true, message: "Password wajib diisi" }]}
                    >
                      <Input.Password
                        placeholder="••••••••••••"
                        className="rounded-2xl h-16 px-6 border-slate-100 bg-white font-bold text-slate-800 text-lg"
                      />
                    </UseFormItem>
                  </Col>
                )}
              </Row>
            </Card>
          </UseForm>
        </div>
      ),
    },
    ...((props?.formType !== "create") ? [
      {
        key: "2",
        label: (
          <div className="flex items-center gap-2 py-2 group">
            <Globe size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Akses Perusahaan</span>
          </div>
        ),
        children: (
          <div className="py-6 flex items-stretch gap-6 h-[550px]">
            <AccessTable 
              data={availableCompanies}
              selectedKeys={selAvailComp}
              onSelectChange={setSelAvailComp}
              subtitle="SEMUA PERUSAHAAN"
              title="Tersedia"
              colorClass="bg-slate-800"
              icon={Building2}
              type="company"
            />
            <div className="flex flex-col justify-center gap-4">
              <Button 
                type="primary"
                disabled={props?.formType === 'detail' || selAvailComp.length === 0}
                onClick={() => handleTransfer('company', 'add')}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-none shadow-xl transition-all duration-300 ${
                  selAvailComp.length > 0 ? 'bg-emerald-600 text-white scale-110' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <ChevronRight size={24} strokeWidth={3} />
              </Button>
              <Button 
                type="primary"
                disabled={props?.formType === 'detail' || selAssignComp.length === 0}
                onClick={() => handleTransfer('company', 'remove')}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-none shadow-xl transition-all duration-300 ${
                  selAssignComp.length > 0 ? 'bg-rose-500 text-white scale-110' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </Button>
            </div>
            <AccessTable 
              data={userCompanies}
              selectedKeys={selAssignComp}
              onSelectChange={setSelAssignComp}
              subtitle="ZONA AKSES"
              title="Terpilih"
              colorClass="bg-emerald-600"
              icon={ShieldCheck}
              type="company"
            />
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div className="flex items-center gap-2 py-2 group">
            <Layers size={18} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black">Akses Cabang</span>
          </div>
        ),
        children: (
          <div className="py-6 flex items-stretch gap-6 h-[550px]">
            <AccessTable 
              data={availableBranches}
              selectedKeys={selAvailBranch}
              onSelectChange={setSelAvailBranch}
              subtitle="SEMUA CABANG"
              title="Tersedia"
              colorClass="bg-slate-800"
              icon={MapPin}
              type="branch"
            />
            <div className="flex flex-col justify-center gap-4">
              <Button 
                type="primary"
                disabled={props?.formType === 'detail' || selAvailBranch.length === 0}
                onClick={() => handleTransfer('branch', 'add')}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-none shadow-xl transition-all duration-300 ${
                  selAvailBranch.length > 0 ? 'bg-blue-600 text-white scale-110' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <ChevronRight size={24} strokeWidth={3} />
              </Button>
              <Button 
                type="primary"
                disabled={props?.formType === 'detail' || selAssignBranch.length === 0}
                onClick={() => handleTransfer('branch', 'remove')}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-none shadow-xl transition-all duration-300 ${
                  selAssignBranch.length > 0 ? 'bg-rose-500 text-white scale-110' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <ChevronLeft size={24} strokeWidth={3} />
              </Button>
            </div>
            <AccessTable 
              data={userBranches}
              selectedKeys={selAssignBranch}
              onSelectChange={setSelAssignBranch}
              subtitle="CABANG TERPILIH"
              title="Aktif"
              colorClass="bg-blue-600"
              icon={CheckCircle2}
              type="branch"
            />
          </div>
        ),
      }
    ] : [])
  ];

  return (
    <Modal
      width={props?.formType === 'create' ? 800 : 1100}
      title={renderHeader()}
      open={props?.open}
      onCancel={() => !loading && props?.onCancel()}
      destroyOnHidden={true}
      footer={null}
      centered
      className="authority-modal-v4"
      styles={{ 
        body: { padding: '0 40px 48px' },
        mask: { backdropFilter: 'blur(16px)', backgroundColor: 'rgba(15, 23, 42, 0.8)' }
      }}
      closable={false}
    >
      <Spin spinning={loading} description={<span className="font-black text-[10px] uppercase tracking-[0.3em] text-emerald-500 mt-4 block">Memproses Data...</span>}>
        <div className="relative pt-6">
          <Tabs 
            defaultActiveKey="1" 
            className="authority-tabs-v4" 
            items={tabItems}
            animated={{ inkBar: true, tabPane: true }}
          />
        </div>
      </Spin>
      
      <style jsx global>{`
        .authority-modal-v4 .ant-modal-content {
          border-radius: 48px;
          overflow: hidden;
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.6);
        }
        .authority-modal-v4 .ant-modal-header {
          padding: 48px 40px 24px;
          border-bottom: none;
        }
        .authority-tabs-v4 .ant-tabs-nav::before {
          border-bottom: 2px solid #f1f5f9;
        }
        .authority-tabs-v4 .ant-tabs-tab {
          padding: 12px 0 24px !important;
          margin: 0 48px 0 0 !important;
          color: #94a3b8;
          transition: all 0.5s ease;
        }
        .authority-tabs-v4 .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #0f172a !important;
        }
        .authority-tabs-v4 .ant-tabs-ink-bar {
          background: #10b981;
          height: 6px !important;
          border-radius: 6px 6px 0 0;
          box-shadow: 0 -4px 15px rgba(16, 185, 129, 0.6);
        }
        .premium-access-table-compact .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #94a3b8 !important;
          font-weight: 900 !important;
          font-size: 9px !important;
          padding: 12px 16px !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .premium-access-table-compact .ant-table-tbody > tr > td {
          padding: 8px 16px !important;
          border-bottom: 1px solid #f8fafc !important;
        }
        .premium-access-table-compact .ant-table-tbody > tr:hover > td {
          background: #f8fafc !important;
        }
      `}</style>
    </Modal>
  );
}
