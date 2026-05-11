'use client';

import React, { useEffect, useCallback, useState } from "react";
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
import { Col, Modal, Row, Spin, Typography, Switch, Form, Card, Button, Input, Tabs, Tag, Space, Table, Popconfirm, Select, notification as antdNotification } from "antd";
import { ArrowLeft, Trash2, ListChecks, Info, CreditCard, Edit3 } from "lucide-react";

import dynamic from "next/dynamic";
import { 
  GetBranchPaymentMethodsService, 
  CreateBranchPaymentMethodService, 
  UpdateBranchPaymentMethodService,
  DeleteBranchPaymentMethodService, 
  ToggleBranchPaymentMethodStatusService 
} from "@afx/services/master/branch-payment-method.service";
import { GetGroupedPaymentMethodsService, GetActivePaymentMethodsService } from "@afx/services/payment-method.service";
import { IBranchPaymentMethod } from "@afx/interfaces/master/branch-payment-method.iface";

const MapPicker = dynamic(() => import("@afx/components/ui/maps/MapPicker"), { 
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">Memuat Peta...</div>
});

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

  // State untuk map position
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);

  // Watch form values
  const formLat = Form.useWatch('latitude', props.forms);
  const formLng = Form.useWatch('longitude', props.forms);

  // SET FORM VALUES WHEN BRANCH DATA IS AVAILABLE
  useEffect(() => {
    console.log('FormBranch useEffect - props.open:', props?.open);
    console.log('FormBranch useEffect - formType:', props?.formType);
    console.log('FormBranch useEffect - branch:', branch);
    
    if (props?.open) {
      if (props?.formType === "create") {
        // Reset untuk create
        props.forms.resetFields();
        setMapPosition(null);
      } else if (props?.formType === "update" || props?.formType === "detail") {
        // Set data branch ke form
        if (branch && branch.id) {
          console.log('Setting branch data to form:', branch);
          
          // Set all form values
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
          });
          
          // Set map position
          if (branch.latitude && branch.longitude) {
            const lat = typeof branch.latitude === 'string' ? parseFloat(branch.latitude) : branch.latitude;
            const lng = typeof branch.longitude === 'string' ? parseFloat(branch.longitude) : branch.longitude;
            
            if (!isNaN(lat) && !isNaN(lng)) {
              console.log('Setting map position:', { lat, lng });
              setMapPosition({ lat, lng });
            }
          }
        } else {
          console.warn('No branch data available for update/detail');
        }
      }
    }
  }, [props?.open, props?.formType, branch, props.forms]);

  // Update map position when form latitude/longitude changes (from manual input)
  useEffect(() => {
    if (formLat && formLng) {
      const lat = typeof formLat === 'string' ? parseFloat(formLat) : formLat;
      const lng = typeof formLng === 'string' ? parseFloat(formLng) : formLng;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        console.log('Form changed, updating map position:', { lat, lng });
        setMapPosition({ lat, lng });
      }
    }
  }, [formLat, formLng]);

  // Handle map change
  const handleMapChange = useCallback((coords: { lat: number; lng: number }) => {
    console.log('Map changed, updating form:', coords);
    
    // Update form values
    props.forms.setFieldsValue({
      latitude: coords.lat.toFixed(8),
      longitude: coords.lng.toFixed(8)
    });
    
    // Update map position state
    setMapPosition(coords);
  }, [props.forms]);

  // Handle manual input changes
  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && formLng) {
      const lat = parseFloat(value);
      const lng = typeof formLng === 'string' ? parseFloat(formLng) : formLng;
      
      if (!isNaN(lat) && !isNaN(lng)) {
        props.forms.setFieldsValue({
          latitude: lat.toFixed(8),
        });
        setMapPosition({ lat, lng });
      }
    }
  }, [formLng, props.forms]);

  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && formLat) {
      const lat = typeof formLat === 'string' ? parseFloat(formLat) : formLat;
      const lng = parseFloat(value);
      
      if (!isNaN(lat) && !isNaN(lng)) {
        props.forms.setFieldsValue({
          longitude: lng.toFixed(8),
        });
        setMapPosition({ lat, lng });
      }
    }
  }, [formLat, props.forms]);

  const [activeTab, setActiveTab] = useState<string>("general");
  const [branchPaymentMethods, setBranchPaymentMethods] = useState<IBranchPaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState<boolean>(false);
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  const [isModalPMOpen, setIsModalPMOpen] = useState<boolean>(false);
  const [modalPMMode, setModalPMMode] = useState<"create" | "update">("create");
  const [selectedBPM, setSelectedBPM] = useState<IBranchPaymentMethod | null>(null);
  const [addPMForm] = Form.useForm();

  const fetchBranchPaymentMethods = useCallback(async () => {
    if (branch?.id) {
      setLoadingPaymentMethods(true);
      try {
        const res = await GetBranchPaymentMethodsService(branch.id);
        if (res.success) {
          setBranchPaymentMethods(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch branch payment methods", err);
      } finally {
        setLoadingPaymentMethods(false);
      }
    }
  }, [branch?.id]);

  const fetchAllPaymentMethods = useCallback(async () => {
    try {
      const res = await GetGroupedPaymentMethodsService();
      console.log("Grouped Payment Methods Response:", res);
      
      let groups = [];
      if (res && res.groups) {
        groups = res.groups;
      } else if (Array.isArray(res)) {
        groups = res;
      }

      if (groups.length > 0) {
        const flatList = groups.flatMap((group: any) => group.paymentMethods || []);
        console.log("Flattened Payment Methods:", flatList);
        setAllPaymentMethods(flatList);
      } else {
        // Fallback to active payment methods if grouped is empty or structured differently
        const activeRes = await GetActivePaymentMethodsService();
        if (activeRes && Array.isArray(activeRes)) {
          setAllPaymentMethods(activeRes);
        } else if (activeRes && activeRes.data) {
          setAllPaymentMethods(activeRes.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch all payment methods", err);
    }
  }, []);

  useEffect(() => {
    if (props.open && (props.formType === "detail" || props.formType === "update") && branch?.id) {
      fetchBranchPaymentMethods();
      fetchAllPaymentMethods();
    }
  }, [props.open, props.formType, branch?.id, fetchBranchPaymentMethods, fetchAllPaymentMethods]);

  const handleSavePM = async (values: any) => {
    try {
      if (modalPMMode === "create") {
        const res = await CreateBranchPaymentMethodService({
          branchId: branch!.id,
          paymentMethodId: values.paymentMethodId,
          sortOrder: values.sortOrder || 0,
          notes: values.notes || null,
        });
        if (res.success) {
          antdNotification.success({ message: "Berhasil menambahkan metode pembayaran" });
        }
      } else if (selectedBPM) {
        const res = await UpdateBranchPaymentMethodService(selectedBPM.id, {
          sortOrder: values.sortOrder,
          notes: values.notes,
        });
        if (res.success) {
          antdNotification.success({ message: "Berhasil memperbarui metode pembayaran" });
        }
      }
      
      setIsModalPMOpen(false);
      addPMForm.resetFields();
      fetchBranchPaymentMethods();
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menyimpan metode pembayaran" });
    }
  };

  const handleEditPM = (record: IBranchPaymentMethod) => {
    setSelectedBPM(record);
    setModalPMMode("update");
    addPMForm.setFieldsValue({
      paymentMethodId: record.paymentMethodId,
      sortOrder: record.sortOrder,
      notes: record.notes,
    });
    setIsModalPMOpen(true);
  };

  const handleDeletePM = async (id: number) => {
    try {
      const res = await DeleteBranchPaymentMethodService(id);
      if (res.success) {
        antdNotification.success({ message: "Berhasil menghapus metode pembayaran" });
        fetchBranchPaymentMethods();
      }
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menghapus metode pembayaran" });
    }
  };

  const handleTogglePM = async (id: number) => {
    try {
      const res = await ToggleBranchPaymentMethodStatusService(id);
      if (res.success) {
        fetchBranchPaymentMethods();
      }
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal mengubah status" });
    }
  };

  const renderPaymentMethods = () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Typography.Title level={5} className="m-0">Metode Pembayaran Cabang</Typography.Title>
          <Typography.Text className="text-slate-500 text-xs">Kelola metode pembayaran yang tersedia untuk cabang ini</Typography.Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          onClick={() => {
            setModalPMMode("create");
            setSelectedBPM(null);
            addPMForm.resetFields();
            setIsModalPMOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 border-none rounded-lg"
        >
          Tambah Metode
        </Button>
      </div>

      <Table
        dataSource={branchPaymentMethods}
        loading={loadingPaymentMethods}
        rowKey="id"
        pagination={false}
        className="premium-table"
        columns={[
          {
            title: "Nama",
            dataIndex: "name",
            key: "name",
            render: (text, record) => (
              <Space>
                {record.imageUrl ? (
                  <img 
                    src={record.imageUrl} 
                    alt={text} 
                    className="w-8 h-8 object-contain rounded border border-slate-100" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = "w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400";
                        placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>';
                        parent.prepend(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                    <CreditCard size={16} />
                  </div>
                )}
                <Typography.Text strong>{text}</Typography.Text>
              </Space>
            )
          },
          {
            title: "Catatan",
            dataIndex: "notes",
            key: "notes",
            render: (text) => <Typography.Text className="text-xs text-slate-500">{text || "-"}</Typography.Text>
          },
          {
            title: "Urutan",
            dataIndex: "sortOrder",
            key: "sortOrder",
            width: 80,
            align: "center"
          },
          {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (active, record) => (
              <Switch 
                size="small" 
                checked={active} 
                onChange={() => handleTogglePM(record.id)}
              />
            )
          },
          {
            title: "Aksi",
            key: "action",
            width: 100,
            render: (_, record) => (
              <Space>
                <Button 
                  type="text" 
                  icon={<Edit3 size={16} className="text-blue-500" />} 
                  onClick={() => handleEditPM(record)}
                />
                <Popconfirm
                  title="Hapus metode pembayaran?"
                  description="Aksi ini tidak dapat dibatalkan."
                  onConfirm={() => handleDeletePM(record.id)}
                  okText="Ya, Hapus"
                  cancelText="Batal"
                >
                  <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
              </Space>
            )
          }
        ]}
      />

      <Modal
        title={modalPMMode === "create" ? "Tambah Metode Pembayaran" : "Edit Metode Pembayaran"}
        open={isModalPMOpen}
        onCancel={() => setIsModalPMOpen(false)}
        footer={null}
        destroyOnHidden
      >
        <Form form={addPMForm} layout="vertical" onFinish={handleSavePM}>
          <Form.Item
            name="paymentMethodId"
            label="Pilih Metode Pembayaran"
            rules={[{ required: true, message: "Pilih metode pembayaran" }]}
          >
            <Select 
              placeholder="Pilih metode" 
              disabled={modalPMMode === "update"}
              loading={allPaymentMethods.length === 0}
            >
              {allPaymentMethods
                .filter(pm => {
                  if (modalPMMode === "update") {
                    return Number(pm.id) === Number(selectedBPM?.paymentMethodId);
                  }
                  return !branchPaymentMethods.find(bpm => Number(bpm.paymentMethodId) === Number(pm.id));
                })
                .map(pm => (
                  <Select.Option key={pm.id} value={pm.id}>
                    <Space>
                      {pm.imageUrl ? (
                        <img 
                          src={pm.imageUrl} 
                          alt={pm.name} 
                          className="w-5 h-5 object-contain" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const placeholder = document.createElement('div');
                              placeholder.className = "w-5 h-5 flex items-center justify-center text-slate-400";
                              placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>';
                              parent.prepend(placeholder);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center text-slate-400">
                          <CreditCard size={12} />
                        </div>
                      )}
                      {pm.name}
                    </Space>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="sortOrder" label="Urutan Sortir" initialValue={0}>
            <Input type="number" />
          </Form.Item>
          <Form.Item name="notes" label="Catatan Internal">
            <Input.TextArea placeholder="Contoh: Metode pembayaran utama..." />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalPMOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" className="bg-emerald-500 hover:bg-emerald-600 border-none">Simpan</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );

  const renderHeader = () => (
    <div className="flex items-center gap-3 p-2">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
        {props?.formType === "create" ? <Plus size={20} /> : <MapPin size={20} />}
      </div>
      <div className="flex flex-col text-left">
        <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
          {props?.formType === "create" ?
            "Tambah"
          : props?.formType === "detail" ?
            "Detail"
          : "Perbarui"}{" "}
          Cabang (Branch)
        </Typography>
        <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">Lengkapi informasi data cabang Anda</p>
      </div>
    </div>
  );

  const renderFormContent = () => (
    <Spin spinning={loading} size="small">
      <UseForm
        form={props?.forms}
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
                rows={2}
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

          <Col span={24}>
            <Typography.Text className="text-xs font-medium text-slate-500 mb-2 block text-left">Pilih Lokasi di Peta</Typography.Text>
            <MapPicker 
              key={`map-${props.formType}-${mapPosition?.lat}-${mapPosition?.lng}`}
              value={mapPosition || undefined}
              onChange={handleMapChange}
              disabled={props?.formType === "detail"}
            />
          </Col>

          <Col xs={24} lg={12}>
            <div className="mb-2">
              <label className="text-xs font-medium text-slate-500 block mb-1">Latitude</label>
              <UseFormItem
                name="latitude"
                label=""
                {...itemLayouts}
              >
                <Input
                  className="w-full h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500"
                  placeholder="Contoh: 3.5952"
                  disabled={props?.formType === "detail"}
                  onChange={handleLatitudeChange}
                />
              </UseFormItem>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="mb-2">
              <label className="text-xs font-medium text-slate-500 block mb-1">Longitude</label>
              <UseFormItem
                name="longitude"
                label=""
                {...itemLayouts}
              >
                <Input
                  className="w-full h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500"
                  placeholder="Contoh: 98.6722"
                  disabled={props?.formType === "detail"}
                  onChange={handleLongitudeChange}
                />
              </UseFormItem>
            </div>
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
                  {loading ? "Memproses..." : "Simpan Cabang"}
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
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            )}
          </Col>
        </Row>
      </UseForm>
    </Spin>
  );

  const tabsItems = [
    {
      key: "general",
      label: (
        <div className="flex items-center gap-2">
          <Info size={16} />
          Informasi Umum
        </div>
      ),
      children: <div className="max-w-[800px] mx-auto py-4">{renderFormContent()}</div>,
    },
    {
      key: "payment",
      label: (
        <div className="flex items-center gap-2">
          <ListChecks size={16} />
          Metode Pembayaran
        </div>
      ),
      children: <div className="max-w-[900px] mx-auto py-4">{renderPaymentMethods()}</div>,
    },
  ];

  return (
    <>
      <Card 
        className="border-0 shadow-sm rounded-2xl overflow-hidden mt-4"
        title={
          <div className="flex items-center justify-between">
            {renderHeader()}
            <Button 
              type="text" 
              icon={<ArrowLeft size={18} />} 
              onClick={props.onCancel}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600"
            >
              Kembali ke Daftar
            </Button>
          </div>
        }
      >
        {(props.formType === "detail" || props.formType === "update") ? (
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab} 
            items={tabsItems}
            className="premium-tabs"
          />
        ) : (
          <div className="max-w-[800px] mx-auto">
            {renderFormContent()}
          </div>
        )}
      </Card>
      <style jsx global>{`
        .premium-tabs .ant-tabs-nav {
          margin-bottom: 24px !important;
          padding: 0 16px;
        }
        .premium-tabs .ant-tabs-tab {
          padding: 12px 16px !important;
          font-weight: 600 !important;
          transition: all 0.3s !important;
        }
        .premium-tabs .ant-tabs-tab-active {
          color: #10b981 !important;
        }
        .premium-tabs .ant-tabs-ink-bar {
          background: #10b981 !important;
          height: 3px !important;
          border-radius: 3px 3px 0 0;
        }
        .premium-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          font-weight: 700 !important;
          letter-spacing: 0.05em !important;
          border-bottom: 1px solid #f1f5f9 !important;
        }
        .premium-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f8fafc !important;
          padding: 12px 16px !important;
        }
        .premium-table .ant-table-row:hover > td {
          background: #fdfdfd !important;
        }
      `}</style>
    </>
  );
}