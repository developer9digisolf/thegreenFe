"use client";

import { Modal, Form, Input, Select, Row, Col, InputNumber, Button, Tag, Divider, Spin, Popover, Tooltip as AntTooltip, Space } from "antd";
import { useEffect, useState } from "react";
import { 
    TagOutlined, 
    ShoppingOutlined, 
    ClockCircleOutlined, 
    SettingOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    SmileOutlined
} from "@ant-design/icons";
import { useStore } from "@afx/store/core";
import { useAuth } from "@afx/contexts/AuthContext";
import { ServiceCategoryGetActiveService } from "@afx/services/service-category.service";
import { ServiceGetActiveService } from "@afx/services/service.service";
import { IStateServicePackage, IActionServicePackage } from "@afx/models/dashboard/master/service-packages.model";
import { UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";

const COMMON_ICONS = [
  "fa-spa", "fa-hand-sparkles", "fa-leaf", "fa-hot-tub-person", 
  "fa-shower", "fa-soap", "fa-face-smile-beam", "fa-heart", 
  "fa-scissors", "fa-spray-can-sparkles", "fa-wind", "fa-water", 
  "fa-gem", "fa-sun", "fa-moon", "fa-hand-holding-heart",
  "fa-gift", "fa-ticket", "fa-star", "fa-crown", "fa-gem"
];

export const FormServicePackage = ({
  formType,
  forms,
  open,
  onCancel,
  handleSubmit,
}: any) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const { state: packageState } = useStore<IStateServicePackage, IActionServicePackage>("servicePackages");
  const { user } = useAuth();

  // Watch fields for reactive UI updates
  const currentIcon = Form.useWatch("icon", forms);
  const currentColor = Form.useWatch("color", forms);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, svcRes] = await Promise.all([
        ServiceCategoryGetActiveService(),
        ServiceGetActiveService(),
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (svcRes.success) setServices(svcRes.data);
      
      // Get branches from user session
      if (user) {
        const userBranches = (user as any).branches || [];
        setBranches(userBranches.map((b: any) => ({
          id: b.branchId,
          name: b.branchName
        })));
      }
    } catch (err) {
      console.error("Failed to fetch form data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, user]);

  useEffect(() => {
    if (open && (formType === "update" || formType === "detail")) {
      const data = packageState?.servicePackage;
      if (data) {
        forms.setFieldsValue({
          ...data,
          branchIds: data.servicePackageRules?.filter(r => r.entityType === "Branch").map(r => r.entityId)
        });
      }
    } else if (open && formType === "create") {
      forms.resetFields();
      forms.setFieldsValue({
        codePrefix: "PKG",
        sortOrder: 1,
        duration: "day",
        durationExpired: 90,
        quantity: 1
      });
    }
  }, [formType, packageState?.servicePackage, open]);

  const isDetail = formType === "detail";
  const isUpdate = formType === "update";
  const isCreate = formType === "create";

  const onInternalSubmit = () => {
    const values = forms.getFieldsValue();
    const branchIds = values.branchIds || [];
    const rules = branchIds.map((id: number) => {
      const branch = branches.find(b => b.id === id);
      return {
        entityType: "Branch",
        entityId: id,
        name: branch?.name || ""
      };
    });

    const { branchIds: _, ...payload } = values;
    const finalPayload = { 
      ...payload, 
      servicePackageRules: rules,
      maxUsage: payload.maxUsage !== undefined && payload.maxUsage !== "" ? payload.maxUsage : null,
      maxUsagePerUser: payload.maxUsagePerUser !== undefined && payload.maxUsagePerUser !== "" ? payload.maxUsagePerUser : null,
    };

    forms.setFieldsValue(finalPayload);
    handleSubmit();
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isCreate ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
            <ShoppingOutlined style={{ fontSize: 20 }} />
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800 leading-tight">
              {isCreate ? "Tambah Paket Voucher" : isUpdate ? "Ubah Paket Voucher" : "Detail Paket Voucher"}
            </div>
            <div className="text-xs text-slate-400 font-medium">Kelola informasi paket layanan spa</div>
          </div>
        </div>
      }
      open={open}
      onCancel={onCancel}
      width={850}
      centered
      className="premium-modal"
      footer={[
        <div key="footer" className="flex justify-end gap-3 px-1 pb-1">
          <Button className="rounded-xl font-bold h-11 px-8 border-slate-200 text-slate-500 hover:bg-slate-50" onClick={onCancel}>
            Batal
          </Button>
          {!isDetail && (
            <Button 
              type="primary" 
              className={`rounded-xl font-bold h-11 px-10 border-none shadow-lg transition-all active:scale-95 ${isCreate ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20'}`}
              onClick={onInternalSubmit}
            >
              {isCreate ? "Daftarkan Paket" : "Simpan Perubahan"}
            </Button>
          )}
          {isDetail && (
             <Button 
                type="primary" 
                className="rounded-xl font-bold h-11 px-10 border-none bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                onClick={() => forms.submit()}
             >
                Ubah Data
             </Button>
          )}
        </div>
      ]}
    >
      <Spin spinning={loading}>
        <Form form={forms} layout="vertical" disabled={isDetail} className="mt-2">
          <Row gutter={32}>
            {/* Left Column: Product Identity & Rules */}
            <Col span={15}>
              {/* Product Identity Section */}
              <div className="premium-section mb-6">
                <div className="section-header mb-6">
                    <div className="icon-box bg-emerald-500 shadow-lg shadow-emerald-500/20">
                        <TagOutlined className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold m-0 tracking-tight">Identitas Paket</h4>
                        <p className="text-[11px] text-slate-400 font-medium m-0">Konfigurasi nama dan kategori voucher</p>
                    </div>
                </div>
                
                <Row gutter={16}>
                  <Col span={24}>
                    <UseFormItem name="name" label="Nama Paket" rules={[{ required: true, message: 'Nama paket wajib diisi' }]}>
                      <UseInput placeholder="Contoh: 10 Hair Treatment Voucher Pack" />
                    </UseFormItem>
                  </Col>
                  <Col span={14}>
                    <UseFormItem name="code" label="Kode Paket (Unik)" rules={[{ required: true, message: 'Kode wajib diisi' }]}>
                      <UseInput placeholder="Contoh: PKG-HAIR-001" />
                    </UseFormItem>
                  </Col>
                  <Col span={10}>
                    <UseFormItem name="codePrefix" label="Prefix">
                      <UseInput placeholder="Contoh: PKG" />
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="categoryId" label="Kategori" rules={[{ required: true, message: 'Kategori wajib dipilih' }]}>
                      <Select 
                        placeholder="Pilih Kategori" 
                        className="h-11 rounded-xl w-full" 
                        options={categories.map(c => ({ label: c.name, value: c.id }))} 
                      />
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="serviceId" label="Layanan Utama" rules={[{ required: true, message: 'Layanan wajib dipilih' }]}>
                      <Select 
                        placeholder="Pilih Layanan" 
                        className="h-11 rounded-xl w-full" 
                        options={services.map(s => ({ label: s.name, value: s.id }))} 
                      />
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="icon" label="Icon Paket">
                      <Popover
                        trigger="click"
                        placement="bottomLeft"
                        content={
                          <div className="grid grid-cols-5 gap-2 p-2 max-w-[250px]">
                            {COMMON_ICONS.map(icon => (
                              <div 
                                key={icon}
                                onClick={() => forms.setFieldValue("icon", icon)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer hover:bg-emerald-50 hover:text-emerald-500 transition-all border ${currentIcon === icon ? 'border-emerald-500 bg-emerald-50 text-emerald-500 font-bold shadow-sm' : 'border-slate-100 text-slate-400'}`}
                              >
                                <i className={`fa-solid ${icon}`} />
                              </div>
                            ))}
                          </div>
                        }
                      >
                        <div className="cursor-pointer group">
                           <UseInput 
                             placeholder="Pilih Ikon..." 
                             prefix={currentIcon ? <i className={`fa-solid ${currentIcon} text-emerald-500`} /> : <SmileOutlined />}
                             readOnly
                           />
                        </div>
                      </Popover>
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="color" label="Warna Tema (Hex)">
                      <div className="flex gap-2">
                         <div className="relative shrink-0">
                           <input 
                             type="color" 
                             className="w-14 h-11 rounded-xl border border-slate-200 p-1 cursor-pointer bg-white" 
                             value={currentColor || "#8b5cf6"}
                             onChange={(e) => forms.setFieldValue("color", e.target.value)} 
                           />
                         </div>
                         <div className="flex-1">
                            <UseFormItem name="color" noStyle>
                               <UseInput placeholder="#8b5cf6" value={currentColor} onChange={(e) => forms.setFieldValue("color", e.target.value)} />
                            </UseFormItem>
                         </div>
                      </div>
                    </UseFormItem>
                  </Col>
                  <Col span={24}>
                    <UseFormItem name="description" label="Deskripsi (Opsional)">
                      <Input.TextArea 
                        placeholder="Jelaskan detail paket voucher ini kepada pelanggan..." 
                        rows={3} 
                        className="rounded-2xl border border-slate-200 bg-slate-50/30 p-4 hover:border-emerald-500 focus:border-emerald-500 transition-all text-slate-700"
                      />
                    </UseFormItem>
                  </Col>
                </Row>
              </div>

              {/* Rules & Location Section */}
              <div className="premium-section">
                <div className="section-header mb-6">
                    <div className="icon-box bg-blue-500 shadow-lg shadow-blue-500/20 flex items-center justify-center">
                        <EnvironmentOutlined className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold m-0 tracking-tight">Aturan & Lokasi</h4>
                        <p className="text-[11px] text-slate-400 font-medium m-0">Tentukan di mana voucher ini berlaku</p>
                    </div>
                </div>
                
                <UseFormItem name="branchIds" label="Berlaku di Cabang">
                  <Select 
                    mode="multiple" 
                    placeholder="Semua Cabang (Biarkan kosong jika berlaku di semua lokasi)" 
                    className="rounded-xl min-h-[44px] w-full custom-multi-select"
                    maxTagCount="responsive"
                    options={branches.map(b => ({ label: b.name, value: b.id }))}
                  />
                </UseFormItem>
                
                <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mt-4">
                    <InfoCircleOutlined className="text-blue-500 mt-0.5 text-lg" />
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-blue-800">Catatan Lokasi</span>
                        <span className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
                            Jika tidak ada cabang yang dipilih, maka voucher ini secara otomatis akan dapat digunakan di seluruh cabang yang aktif di sistem.
                        </span>
                    </div>
                </div>
              </div>
            </Col>

            {/* Right Column: Pricing & Commercials */}
            <Col span={9}>
              {/* Pricing Section */}
              <div className="premium-section bg-slate-50/50 border-slate-200 mb-6 !p-5">
                <div className="section-header mb-6">
                    <div className="icon-box bg-amber-500 shadow-lg shadow-amber-500/20 flex items-center justify-center">
                        <SettingOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800">Komersial</span>
                </div>
                
                <UseFormItem label="Jumlah Sesi / Item">
                  <Space.Compact className="w-full">
                    <div className="bg-slate-100 border border-slate-200 px-3 flex items-center justify-center text-[10px] font-bold text-slate-500 rounded-l-xl border-r-0">
                        QTY
                    </div>
                    <Form.Item name="quantity" noStyle rules={[{ required: true, message: "Jumlah sesi/item wajib diisi" }]}>
                      <InputNumber 
                          min={1} 
                          className="flex-1 h-11 rounded-r-xl border-slate-200" 
                          placeholder="Contoh: 10"
                      />
                    </Form.Item>
                  </Space.Compact>
                </UseFormItem>

                <div className="my-4 border-t border-dashed border-slate-200" />

                <UseFormItem name="basicPrice" label="Harga Normal (Market Price)">
                  <InputNumber 
                    className="w-full h-11 rounded-xl flex items-center border-slate-200 bg-white" 
                    placeholder="0"
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={v => v!.replace(/Rp\s?|(\.*)/g, '') as any}
                  />
                </UseFormItem>

                <UseFormItem name="price" label="Harga Jual Paket" rules={[{ required: true }]}>
                  <InputNumber 
                    className="w-full h-11 rounded-xl flex items-center border-emerald-200 bg-emerald-50/30 font-bold text-emerald-600 shadow-sm" 
                    placeholder="0"
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={v => v!.replace(/Rp\s?|(\.*)/g, '') as any}
                  />
                </UseFormItem>
              </div>

              {/* Batasan Penggunaan Section */}
              <div className="premium-section bg-slate-50/50 border-slate-200 mb-6 !p-5">
                <div className="section-header mb-6">
                    <div className="icon-box bg-rose-500 shadow-lg shadow-rose-500/20 flex items-center justify-center">
                        <ShoppingOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800">Batasan Penggunaan</span>
                </div>
                
                <UseFormItem name="maxUsage" label="Maksimal Penggunaan Global">
                  <InputNumber 
                    min={1} 
                    className="w-full h-11 rounded-xl flex items-center border-slate-200 bg-white" 
                    placeholder="Contoh: 100" 
                  />
                </UseFormItem>

                <UseFormItem name="maxUsagePerUser" label="Maksimal Penggunaan per User">
                  <InputNumber 
                    min={1} 
                    className="w-full h-11 rounded-xl flex items-center border-slate-200 bg-white" 
                    placeholder="Contoh: 1" 
                  />
                </UseFormItem>
              </div>

              {/* Validity Section */}
              <div className="premium-section bg-slate-50/50 border-slate-200 mb-6 !p-5">
                <div className="section-header mb-6">
                    <div className="icon-box bg-orange-500 shadow-lg shadow-orange-500/20 flex items-center justify-center">
                        <ClockCircleOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800">Masa Berlaku</span>
                </div>

                <Row gutter={12}>
                    <Col span={10}>
                        <UseFormItem name="durationExpired" label="Durasi" rules={[{ required: true }]}>
                            <InputNumber min={1} className="w-full h-11 rounded-xl flex items-center border-slate-200" />
                        </UseFormItem>
                    </Col>
                    <Col span={14}>
                        <UseFormItem name="duration" label="Satuan">
                            <Select className="h-11 rounded-xl w-full" options={[
                                { label: 'Hari', value: 'day' },
                                { label: 'Minggu', value: 'week' },
                                { label: 'Bulan', value: 'month' },
                                { label: 'Tahun', value: 'year' },
                            ]} />
                        </UseFormItem>
                    </Col>
                </Row>
                
                <p className="text-[10px] text-slate-400 font-medium mt-1 italic">
                    * Voucher akan otomatis hangus setelah durasi di atas terlampaui sejak tanggal pembelian.
                </p>
              </div>

              {/* Display Config */}
              <div className="px-5">
                <UseFormItem name="sortOrder" label="Urutan Tampil">
                  <InputNumber min={0} className="w-full h-11 rounded-xl flex items-center border-slate-100" />
                </UseFormItem>
              </div>
            </Col>
          </Row>
          
          <Form.Item name="servicePackageRules" hidden>
            <Input />
          </Form.Item>
        </Form>
      </Spin>

      <style jsx global>{`
        .premium-modal .ant-modal-content { border-radius: 2.5rem !important; padding: 2rem !important; overflow: hidden; }
        .premium-section { background: white; border: 1px solid #f1f5f9; border-radius: 2rem; padding: 1.5rem; }
        .section-header { display: flex; align-items: center; gap: 12px; }
        .icon-box { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .icon-box span { font-size: 16px; color: white !important; }
        
        .custom-multi-select .ant-select-selector { border-radius: 12px !important; border-color: #f1f5f9 !important; background-color: #fafafa !important; padding: 4px 12px !important; }
        .ant-input-number-group-addon { border-radius: 12px 0 0 12px !important; border-color: #f1f5f9 !important; background: #f8fafc !important; }
        
        .ant-form-item-label label { font-weight: 700 !important; color: #475569 !important; font-size: 11px !important; text-transform: uppercase; letter-spacing: 0.5px; }
        .ant-select-selector { border-radius: 12px !important; border: 1px solid #f1f5f9 !important; }
        .ant-input-number-input { height: 44px !important; }
      `}</style>
    </Modal>
  );
};
