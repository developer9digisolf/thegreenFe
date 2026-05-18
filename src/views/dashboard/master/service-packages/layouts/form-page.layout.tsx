"use client";

import { Form, Input, Select, Row, Col, InputNumber, Button, Tag, Divider, Spin, Popover, Tooltip as AntTooltip, Space, notification } from "antd";
import { useEffect, useState } from "react";
import { 
    TagOutlined, 
    ShoppingOutlined, 
    ClockCircleOutlined, 
    SettingOutlined,
    EnvironmentOutlined,
    InfoCircleOutlined,
    SmileOutlined,
    ArrowLeftOutlined,
    SaveOutlined,
    UnorderedListOutlined
} from "@ant-design/icons";
import { useStore } from "@afx/store/core";
import { useAuth } from "@afx/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { ServiceCategoryGetActiveService } from "@afx/services/service-category.service";
import { ServiceGetActiveService, VariantGetAllActiveService } from "@afx/services/service.service";
import { GetBranchesService } from "@afx/services/master/branches.service";
import { IStateServicePackage, IActionServicePackage } from "@afx/models/dashboard/master/service-packages.model";
import { UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";

const COMMON_ICONS = [
  "fa-spa", "fa-hand-sparkles", "fa-leaf", "fa-hot-tub-person", 
  "fa-shower", "fa-soap", "fa-face-smile-beam", "fa-heart", 
  "fa-scissors", "fa-spray-can-sparkles", "fa-wind", "fa-water", 
  "fa-gem", "fa-sun", "fa-moon", "fa-hand-holding-heart",
  "fa-gift", "fa-ticket", "fa-star", "fa-crown", "fa-gem"
];

export const FormServicePackagePage = ({ formType, id }: { formType: "create" | "update" | "detail", id?: number | null }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [allVariants, setAllVariants] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [forms] = Form.useForm();
  
  const router = useRouter();
  const { state: packageState, useActions: usePackageActions, isLoading: modelLoading } = useStore<IStateServicePackage, IActionServicePackage>("servicePackages");
  const { user } = useAuth();

  // Watch fields for reactive UI updates
  const currentIcon = Form.useWatch("icon", forms);
  const currentColor = Form.useWatch("color", forms);
  const selectedServiceId = Form.useWatch("serviceId", forms);

  const filteredVariants = allVariants.filter(v => v.serviceId === selectedServiceId);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, svcRes, branchRes, variantRes] = await Promise.all([
        ServiceCategoryGetActiveService(),
        ServiceGetActiveService(),
        GetBranchesService({ Page: 1, PageSize: 100 }),
        VariantGetAllActiveService()
      ]);

      if (catRes.success) setCategories(catRes.data);
      if (svcRes.success) setServices(svcRes.data);
      if (branchRes.success) {
        const branchData = branchRes.data?.pageData || branchRes.data || [];
        setBranches(branchData.map((b: any) => ({
          id: b.id,
          name: b.name
        })));
      }
      if (variantRes.success) setAllVariants(variantRes.data);
      
      if (formType === "update" && id) {
        usePackageActions<"getServicePackage">("getServicePackage", [id], true);
      }
    } catch (err) {
      console.error("Failed to fetch form data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, user]);

  useEffect(() => {
    if (selectedServiceId && allVariants.length > 0) {
      const filtered = allVariants.filter(v => v.serviceId === selectedServiceId);
      if (filtered.length > 0) {
        const currentVariantId = forms.getFieldValue("serviceVariantId");
        if (!currentVariantId || !filtered.some(v => v.id === currentVariantId)) {
          forms.setFieldValue("serviceVariantId", filtered[0].id);
        }
      } else {
        forms.setFieldValue("serviceVariantId", undefined);
      }
    } else {
      forms.setFieldValue("serviceVariantId", undefined);
    }
  }, [selectedServiceId, allVariants]);

  useEffect(() => {
    if (formType === "update" && packageState?.servicePackage && id) {
      const data = packageState.servicePackage;
      forms.setFieldsValue({
        ...data,
        branchIds: data.servicePackageRules?.filter(r => r.entityType === "Branch").map(r => r.entityId)
      });
    } else if (formType === "create") {
      forms.resetFields();
      forms.setFieldsValue({
        codePrefix: "PKG",
        sortOrder: 1,
        duration: "day",
        durationExpired: 90,
        quantity: 1,
        color: "#8b5cf6"
      });
    }
  }, [formType, packageState?.servicePackage, id]);

  const handleSubmit = async () => {
    try {
      const values = await forms.validateFields();
      setSaving(true);
      
      const branchIds = values.branchIds || [];
      const rules = branchIds.map((bid: number) => {
        const branch = branches.find(b => b.id === bid);
        return {
          entityType: "Branch",
          entityId: bid,
          name: branch?.name || ""
        };
      });

      // Clean up payload
      const { branchIds: _, ...payload } = values;
      const finalPayload = { 
        ...payload, 
        servicePackageRules: rules,
        maxUsage: payload.maxUsage !== undefined && payload.maxUsage !== "" ? payload.maxUsage : null,
        maxUsagePerUser: payload.maxUsagePerUser !== undefined && payload.maxUsagePerUser !== "" ? payload.maxUsagePerUser : null,
      };

      const callback = (code: any) => {
        setSaving(false);
        const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
        if (isSuccess) {
          router.push("/dashboard/master/service-packages");
        }
      };

      if (formType === "create") {
        usePackageActions<"createServicePackage">("createServicePackage", [finalPayload, callback], true);
      } else if (id) {
        usePackageActions<"updateServicePackage">("updateServicePackage", [id, finalPayload, callback], true);
      }
    } catch (err: any) {
      setSaving(false);
      if (err?.errorFields) {
        notification.warning({
          message: "Validasi Gagal",
          description: "Mohon lengkapi seluruh field yang wajib diisi",
        });
      }
    }
  };

  const isUpdate = formType === "update";
  const isCreate = formType === "create";

  return (
    <div className="p-4 lg:p-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Button 
                icon={<ArrowLeftOutlined />} 
                className="h-12 w-12 rounded-2xl flex items-center justify-center border-none bg-white shadow-sm hover:bg-slate-50"
                onClick={() => router.push("/dashboard/master/service-packages")}
            />
            <div>
                <h2 className="text-2xl font-extrabold text-slate-800 m-0 tracking-tight">
                    {isCreate ? "Daftarkan Paket Baru" : "Perbarui Paket Voucher"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                    <Tag color="blue" className="rounded-full px-3 m-0 font-bold border-none bg-blue-50 text-blue-500 uppercase text-[10px]">Master Data</Tag>
                    <span className="text-slate-400 text-xs font-medium">Lengkapi detail informasi untuk mengelola paket layanan</span>
                </div>
            </div>
        </div>
        <div className="flex gap-3">
            <Button 
                size="large" 
                className="h-12 px-8 rounded-2xl font-bold border-none bg-white text-slate-500 hover:bg-slate-50 shadow-sm"
                onClick={() => router.push("/dashboard/master/service-packages")}
            >
                Batal
            </Button>
            <Button 
                type="primary" 
                size="large" 
                icon={<SaveOutlined />}
                loading={saving}
                className={`h-12 px-10 rounded-2xl font-bold border-none shadow-lg transition-all active:scale-95 ${isCreate ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}
                onClick={handleSubmit}
            >
                {isCreate ? "Simpan Paket" : "Update Paket"}
            </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        <Form form={forms} layout="vertical" className="mb-20">
          <Row gutter={32}>
            {/* Left Column */}
            <Col span={15}>
              {/* Product Identity Section */}
              <div className="premium-page-section mb-8">
                <div className="section-header mb-8">
                    <div className="icon-badge bg-emerald-500">
                        <TagOutlined className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold m-0 text-base tracking-tight">Identitas & Klasifikasi</h4>
                        <p className="text-[11px] text-slate-400 font-medium m-0">Informasi utama mengenai penamaan dan kategori voucher</p>
                    </div>
                </div>
                
                <Row gutter={20}>
                  <Col span={24}>
                    <UseFormItem name="name" label="Nama Paket Voucher" rules={[{ required: true, message: 'Nama wajib diisi' }]}>
                      <UseInput placeholder="Contoh: Paket 10x Relaxing Massage" />
                    </UseFormItem>
                  </Col>
                  <Col span={14}>
                    <UseFormItem name="code" label="Kode Paket (Unique ID)" rules={[{ required: true, message: 'Kode wajib diisi' }]}>
                      <UseInput placeholder="Contoh: PKG-001" />
                    </UseFormItem>
                  </Col>
                  <Col span={10}>
                    <UseFormItem name="codePrefix" label="Prefix">
                      <UseInput placeholder="Contoh: PKG" />
                    </UseFormItem>
                  </Col>
                  <Col span={8}>
                    <UseFormItem name="categoryId" label="Kategori Master" rules={[{ required: true, message: 'Pilih kategori' }]}>
                      <Select 
                        placeholder="Pilih Kategori" 
                        className="h-11 rounded-xl w-full custom-page-select" 
                        options={categories.map(c => ({ label: c.name, value: c.id }))} 
                      />
                    </UseFormItem>
                  </Col>
                  <Col span={8}>
                    <UseFormItem name="serviceId" label="Layanan Terkait" rules={[{ required: true, message: 'Pilih layanan' }]}>
                      <Select 
                        placeholder="Pilih Layanan" 
                        className="h-11 rounded-xl w-full custom-page-select" 
                        options={services.map(s => ({ label: s.name, value: s.id }))} 
                      />
                    </UseFormItem>
                  </Col>
                  <Col span={8}>
                    <UseFormItem name="serviceVariantId" label="Variasi Layanan" rules={[{ required: true, message: 'Pilih variasi' }]}>
                      <Select 
                        placeholder="Pilih Variasi" 
                        className="h-11 rounded-xl w-full custom-page-select" 
                        disabled={!selectedServiceId}
                        options={filteredVariants.map(v => ({ 
                          label: v.label ? `${v.label} (${v.duration}m - Rp ${v.price.toLocaleString('id-ID')})` : `${v.duration}m - Rp ${v.price.toLocaleString('id-ID')}`, 
                          value: v.id 
                        }))} 
                      />
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="icon" label="Pilih Icon">
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
                             placeholder="Klik untuk memilih ikon..." 
                             prefix={currentIcon ? <i className={`fa-solid ${currentIcon} text-emerald-500`} /> : <SmileOutlined />}
                             readOnly
                           />
                        </div>
                      </Popover>
                    </UseFormItem>
                  </Col>
                  <Col span={12}>
                    <UseFormItem name="color" label="Warna Branding">
                      <div className="flex gap-3">
                         <div className="relative shrink-0">
                           <input 
                             type="color" 
                             className="w-14 h-11 rounded-2xl border-2 border-slate-100 p-1 cursor-pointer bg-white transition-all hover:border-blue-400" 
                             value={currentColor || "#8b5cf6"}
                             onChange={(e) => forms.setFieldValue("color", e.target.value)} 
                           />
                         </div>
                         <div className="flex-1">
                            <UseFormItem name="color" noStyle>
                               <UseInput placeholder="#HexCode" value={currentColor} onChange={(e) => forms.setFieldValue("color", e.target.value)} />
                            </UseFormItem>
                         </div>
                      </div>
                    </UseFormItem>
                  </Col>
                  <Col span={24}>
                    <UseFormItem name="description" label="Deskripsi Paket">
                      <Input.TextArea 
                        placeholder="Berikan deskripsi lengkap mengenai paket voucher ini..." 
                        rows={4} 
                        className="rounded-2xl border border-slate-200 bg-slate-50/30 p-4 hover:border-blue-500 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </UseFormItem>
                  </Col>
                </Row>
              </div>

              {/* Location Section */}
              <div className="premium-page-section">
                <div className="section-header mb-8">
                    <div className="icon-badge bg-blue-600">
                        <EnvironmentOutlined className="text-white" />
                    </div>
                    <div>
                        <h4 className="text-slate-800 font-bold m-0 text-base tracking-tight">Ketersediaan Cabang</h4>
                        <p className="text-[11px] text-slate-400 font-medium m-0">Tentukan di lokasi mana saja voucher ini dapat digunakan</p>
                    </div>
                </div>
                
                <UseFormItem name="branchIds" label="Cabang Terdaftar">
                  <Select 
                    mode="multiple" 
                    placeholder="Pilih satu atau lebih cabang (Kosongkan jika berlaku Nasional)" 
                    className="rounded-xl min-h-[44px] w-full custom-page-multi-select"
                    maxTagCount="responsive"
                    options={branches.map(b => ({ label: b.name, value: b.id }))}
                  />
                </UseFormItem>
                
                <div className="mt-4 p-5 bg-blue-50/40 rounded-3xl border border-blue-100/50 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <InfoCircleOutlined className="text-blue-600 text-lg" />
                    </div>
                    <div>
                        <h5 className="text-blue-900 font-bold text-xs m-0 mb-1">Informasi Distribusi</h5>
                        <p className="text-[11px] text-blue-700/70 m-0 leading-relaxed font-medium">
                            Jika Anda tidak memilih cabang spesifik, sistem akan menganggap voucher ini bersifat **Global (Nasional)** dan dapat diklaim di seluruh cabang aktif.
                        </p>
                    </div>
                </div>
              </div>
            </Col>

            {/* Right Column */}
            <Col span={9}>
              {/* Commercials Section */}
              <div className="premium-page-section bg-slate-50/50 border-slate-200 mb-8 !p-6">
                <div className="section-header mb-8">
                    <div className="icon-badge bg-amber-500">
                        <SettingOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-base tracking-tight">Pengaturan Komersial</span>
                </div>
                
                <UseFormItem label="Jumlah Sesi Voucher">
                  <Space.Compact className="w-full">
                    <div className="bg-slate-200/50 border border-slate-200 px-4 flex items-center justify-center text-xs font-bold text-slate-500 rounded-l-2xl border-r-0">
                        SESI
                    </div>
                    <Form.Item name="quantity" noStyle rules={[{ required: true, message: "Jumlah sesi wajib diisi" }]}>
                      <InputNumber 
                          min={1} 
                          className="flex-1 h-11 rounded-r-2xl border-slate-200 font-bold" 
                          placeholder="1"
                      />
                    </Form.Item>
                  </Space.Compact>
                </UseFormItem>

                <Divider className="my-6 border-slate-200 border-dashed" />

                <UseFormItem name="basicPrice" label="Harga Normal (Market Price)">
                  <InputNumber 
                    className="w-full h-11 rounded-xl border-slate-200 bg-white" 
                    placeholder="Rp 0"
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={v => v!.replace(/Rp\s?|(\.*)/g, '') as any}
                  />
                </UseFormItem>

                <UseFormItem name="price" label="Harga Penjualan (Paket)" rules={[{ required: true }]}>
                  <InputNumber 
                    className="w-full h-12 rounded-xl border-emerald-300 bg-emerald-50/50 font-extrabold text-emerald-700 text-lg shadow-sm" 
                    placeholder="Rp 0"
                    formatter={v => `Rp ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                    parser={v => v!.replace(/Rp\s?|(\.*)/g, '') as any}
                  />
                </UseFormItem>

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <UseFormItem label="Urutan Tampil (Priority)">
                        <Space.Compact className="w-full">
                            <div className="bg-slate-50 border border-slate-200 px-3 flex items-center justify-center text-slate-400 rounded-l-2xl border-r-0">
                                <UnorderedListOutlined />
                            </div>
                            <Form.Item name="sortOrder" noStyle>
                                <InputNumber 
                                    min={0} 
                                    className="flex-1 h-11 rounded-r-2xl border-slate-200" 
                                    placeholder="0"
                                />
                            </Form.Item>
                        </Space.Compact>
                    </UseFormItem>
                    <p className="text-[10px] text-slate-400 font-medium m-0 mt-1 italic leading-relaxed">
                        * Angka lebih kecil akan muncul lebih awal di daftar menu.
                    </p>
                </div>
              </div>

              {/* Batasan Penggunaan Section */}
              <div className="premium-page-section bg-slate-50/50 border-slate-200 mb-8 !p-6">
                <div className="section-header mb-8">
                    <div className="icon-badge bg-rose-500">
                        <ShoppingOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-base tracking-tight">Batasan Penggunaan</span>
                </div>
                
                <UseFormItem name="maxUsage" label="Maksimal Penggunaan Global">
                  <InputNumber 
                    min={1} 
                    className="w-full h-11 rounded-xl border-slate-200 bg-white" 
                    placeholder="Contoh: 100 (Kosongkan jika tidak terbatas)" 
                  />
                </UseFormItem>

                <UseFormItem name="maxUsagePerUser" label="Maksimal Penggunaan per User">
                  <InputNumber 
                    min={1} 
                    className="w-full h-11 rounded-xl border-slate-200 bg-white" 
                    placeholder="Contoh: 1 (Kosongkan jika tidak terbatas)" 
                  />
                </UseFormItem>
              </div>

              {/* Validity Section */}
              <div className="premium-page-section bg-slate-50/50 border-slate-200 mb-8 !p-6">
                <div className="section-header mb-8">
                    <div className="icon-badge bg-orange-500">
                        <ClockCircleOutlined className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800 text-base tracking-tight">Masa Berlaku</span>
                </div>

                <Row gutter={12}>
                    <Col span={10}>
                        <UseFormItem name="durationExpired" label="Lama" rules={[{ required: true }]}>
                            <InputNumber min={1} className="w-full h-11 rounded-xl border-slate-200 font-bold" />
                        </UseFormItem>
                    </Col>
                    <Col span={14}>
                        <UseFormItem name="duration" label="Satuan Waktu">
                            <Select className="h-11 rounded-xl w-full custom-page-select" options={[
                                { label: 'Hari', value: 'day' },
                                { label: 'Minggu', value: 'week' },
                                { label: 'Bulan', value: 'month' },
                                { label: 'Tahun', value: 'year' },
                            ]} />
                        </UseFormItem>
                    </Col>
                </Row>
                
                <div className="mt-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100 flex gap-3">
                    <ClockCircleOutlined className="text-orange-500 mt-0.5" />
                    <p className="text-[10px] text-orange-700 m-0 font-medium leading-relaxed italic">
                        Voucher akan hangus secara otomatis jika tidak digunakan melewati durasi yang ditentukan.
                    </p>
                </div>
              </div>
            </Col>
          </Row>
        </Form>
      </Spin>

      <style jsx global>{`
        .premium-page-section { background: white; border: 1px solid #f1f5f9; border-radius: 2.5rem; padding: 2rem; box-shadow: 0 10px 40px -10px rgba(0,0,0,0.02); }
        .section-header { display: flex; align-items: center; gap: 16px; }
        .icon-badge { width: 42px; height: 42px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 8px 20px -5px rgba(0,0,0,0.1); }
        .icon-badge span { font-size: 18px; color: white !important; }
        
        .custom-page-select .ant-select-selector, .custom-page-multi-select .ant-select-selector { border-radius: 12px !important; border: 1.5px solid #f1f5f9 !important; background-color: #fafafa !important; padding: 0 12px !important; transition: all 0.2s; }
        .custom-page-select .ant-select-selector:hover, .custom-page-multi-select .ant-select-selector:hover { border-color: #cbd5e1 !important; background-color: #f8fafc !important; }
        
        .ant-form-item-label label { font-weight: 800 !important; color: #64748b !important; font-size: 11px !important; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 4px !important; }
        .ant-input-number-input { height: 44px !important; }
        .ant-input-number-group-addon { border-radius: 16px 0 0 16px !important; border-color: #e2e8f0 !important; background: #f1f5f9 !important; }
      `}</style>
    </div>
  );
};
