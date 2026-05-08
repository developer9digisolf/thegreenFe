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
import { Col, Modal, Row, Spin, Typography, Switch, Form, Card, Button, Input } from "antd";
import { ArrowLeft } from "lucide-react";

import dynamic from "next/dynamic";

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

  if (props?.formType === "detail") {
    return (
      <Modal
        width={800}
        title={renderHeader()}
        open={props?.open}
        onCancel={() => {
          !loading && props?.onCancel();
        }}
        destroyOnHidden={true}
        footer={[]}
      >
        {renderFormContent()}
      </Modal>
    );
  }

  return (
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
      <div className="max-w-[800px] mx-auto">
        {renderFormContent()}
      </div>
    </Card>
  );
}