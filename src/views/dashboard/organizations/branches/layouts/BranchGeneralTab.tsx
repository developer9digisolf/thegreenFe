import React, { useState, useEffect, useCallback, useRef } from "react";
import { Row, Col, Card, Typography, Switch, Form, Input, InputNumber, Select, FormInstance, Upload as AntUpload, Modal as AntModal, notification as antdNotification } from "antd";
import { Info, MapPin, DollarSign, Image as ImageIcon, Plus } from "lucide-react";
import { UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import dynamic from "next/dynamic";
import { UploadImageService } from "@afx/services/image.service";

const MapPicker = dynamic(() => import("@afx/components/ui/maps/MapPicker"), {
  ssr: false,
  loading: () => <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">Memuat Peta...</div>,
});

const itemLayouts = {
  wrapperCol: { span: 24 },
  labelCol: { span: 24 },
};

interface Props {
  forms: FormInstance;
  formType: string;
  isOpen: boolean;
  onThumbnailChange?: (imageUrl: string | null) => void;
}

export default function BranchGeneralTab({ forms, formType, isOpen, onThumbnailChange }: Props) {
  const [mapPosition, setMapPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapKey = `map-${formType}-${isOpen ? "open" : "closed"}`;
  
  const formLat = Form.useWatch("latitude", forms);
  const formLng = Form.useWatch("longitude", forms);
  const lastMapCoords = useRef<{ lat: number; lng: number } | null>(null);

  // Thumbnail state
  const [thumbnailFileList, setThumbnailFileList] = useState<any[]>([]);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");

  const imageUrlValue = Form.useWatch("imageUrl", forms);

  // Sync imageUrl from form into thumbnail preview
  useEffect(() => {
    if (imageUrlValue) {
      setThumbnailFileList([{
        uid: "-1",
        name: typeof imageUrlValue === "string" ? (imageUrlValue.split("/").pop() || "thumbnail") : "thumbnail",
        status: "done",
        url: imageUrlValue,
      }]);
    } else {
      setThumbnailFileList([]);
    }
  }, [imageUrlValue]);

  const handleThumbnailUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setThumbnailUploading(true);
    try {
      const res = await UploadImageService(file as File);
      if (res.success && res.data) {
        const url = typeof res.data === "string"
          ? res.data
          : res.data.url || res.data.imageUrl || res.data.fileUrl || "";
        if (url) {
          forms.setFieldsValue({ imageUrl: url });
          onThumbnailChange?.(url);
          onSuccess({ ...res, url });
        } else {
          onError(new Error("URL tidak ditemukan dalam respons upload"));
          antdNotification.error({ message: "URL thumbnail tidak ditemukan" });
        }
      } else {
        onError(new Error(res.message || "Upload gagal"));
        antdNotification.error({ message: res.message || "Gagal mengunggah thumbnail" });
      }
    } catch (err: any) {
      onError(err);
      antdNotification.error({ message: err?.message || "Terjadi kesalahan saat mengunggah thumbnail" });
    } finally {
      setThumbnailUploading(false);
    }
  };

  const handleThumbnailChange = ({ fileList }: any) => {
    // Only keep the latest file, and extract url from response if upload just completed
    const updated = fileList.slice(-1).map((f: any) => {
      if (f.status === "done" && f.response?.url && !f.url) {
        return { ...f, url: f.response.url };
      }
      return f;
    });
    setThumbnailFileList(updated);
    if (updated.length === 0) {
      forms.setFieldsValue({ imageUrl: null });
      onThumbnailChange?.(null);
    }
  };

  // Sync Form values to Map Position
  useEffect(() => {
    if (!formLat || !formLng) return;
    const lat = typeof formLat === "string" ? parseFloat(formLat) : formLat;
    const lng = typeof formLng === "string" ? parseFloat(formLng) : formLng;
    if (isNaN(lat) || isNaN(lng)) return;

    if (lastMapCoords.current && Math.abs(lastMapCoords.current.lat - lat) < 0.00000001 && Math.abs(lastMapCoords.current.lng - lng) < 0.00000001) {
      return;
    }

    if (!mapPosition || Math.abs(mapPosition.lat - lat) > 0.00000001 || Math.abs(mapPosition.lng - lng) > 0.00000001) {
      setMapPosition({ lat, lng });
    }
  }, [formLat, formLng]);

  const handleMapChangeWithRef = useCallback((coords: { lat: number; lng: number }) => {
    lastMapCoords.current = coords;
    forms.setFieldsValue({
      latitude: coords.lat.toFixed(8),
      longitude: coords.lng.toFixed(8),
    });
    setMapPosition(coords);
  }, [forms]);

  const handleLatitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lat = parseFloat(value);
    const lng = typeof formLng === "string" ? parseFloat(formLng) : (formLng ?? 0);
    if (!isNaN(lat) && !isNaN(lng)) forms.setFieldsValue({ latitude: value });
  }, [formLng, forms]);

  const handleLongitudeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lat = typeof formLat === "string" ? parseFloat(formLat) : (formLat ?? 0);
    const lng = parseFloat(value);
    if (!isNaN(lat) && !isNaN(lng)) forms.setFieldsValue({ longitude: value });
  }, [formLat, forms]);

  // Reset Map Position when creating a new branch
  useEffect(() => {
    if (isOpen && formType === "create") {
      setMapPosition(null);
    }
  }, [isOpen, formType]);

  return (
    <Row gutter={[24, 24]}>
      {/* Kolom Kiri */}
      <Col xs={24} lg={12}>
        <Card className="mb-4 border-0 shadow-sm rounded-2xl" title={<div className="flex items-center gap-2"><Info size={16} className="text-emerald-500" /><span className="font-semibold text-slate-700">Informasi Dasar</span></div>}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <UseFormItem name="code" label="Kode Cabang" {...itemLayouts} rules={[{ required: true, message: "Field kode wajib diisi" }]}>
                <UseInput standart={false} placeholder="BR001" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={6}>
              <UseFormItem name="isMainBranch" label="Cabang Pusat" {...itemLayouts} valuePropName="checked">
                <Switch disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={6}>
              <UseFormItem name="isActive" label="Status Aktif" {...itemLayouts} valuePropName="checked">
                <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={24}>
              <UseFormItem name="name" label="Nama Cabang" {...itemLayouts} rules={[{ required: true, message: "Field nama wajib diisi" }]}>
                <UseInput standart={false} placeholder="Masukkan nama cabang" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={24}>
              <UseFormItem name="address" label="Alamat" {...itemLayouts} rules={[{ required: true, message: "Field alamat wajib diisi" }]}>
                <UseInputArea standart={false} disabled={formType === "detail"} placeholder="Masukkan alamat cabang..." rows={2} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="city" label="Kota" {...itemLayouts} rules={[{ required: true, message: "Wajib diisi" }]}>
                <UseInput standart={false} placeholder="Kota" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="province" label="Provinsi" {...itemLayouts} rules={[{ required: true, message: "Wajib diisi" }]}>
                <UseInput standart={false} placeholder="Provinsi" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="postalCode" label="Kode Pos" {...itemLayouts}>
                <UseInput standart={false} placeholder="Kode Pos" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
          </Row>
        </Card>

        <Card className="mb-4 border-0 shadow-sm rounded-2xl" title={<div className="flex items-center gap-2"><MapPin size={16} className="text-emerald-500" /><span className="font-semibold text-slate-700">Kontak</span></div>}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <UseFormItem name="email" label="Email" {...itemLayouts} rules={[{ required: true, message: "Field email wajib diisi" }, { type: "email", message: "Format email tidak valid" }]}>
                <UseInput standart={false} placeholder="email@cabang.com" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="phone" label="Telepon" {...itemLayouts} rules={[{ required: true, message: "Field telepon wajib diisi" }]}>
                <UseInput standart={false} placeholder="08xxxxxxxx" disabled={formType === "detail"} />
              </UseFormItem>
            </Col>
          </Row>
        </Card>

        <Card className="mb-4 border-0 shadow-sm rounded-2xl" title={<div className="flex items-center gap-2"><Info size={16} className="text-emerald-500" /><span className="font-semibold text-slate-700">Informasi Tambahan</span></div>}>
          <UseFormItem name="description" label="Deskripsi" {...itemLayouts}>
            <UseInputArea standart={false} disabled={formType === "detail"} placeholder="Deskripsi singkat cabang..." rows={3} />
          </UseFormItem>

          {/* Thumbnail */}
          <div className="mt-4">
            {/* Hidden form field agar imageUrl terdaftar di form dan Form.useWatch bisa bekerja */}
            <Form.Item name="imageUrl" noStyle><Input type="hidden" /></Form.Item>

            <Typography.Text className="text-sm font-medium text-slate-600 block mb-2">Foto Thumbnail Cabang</Typography.Text>

            <div className="flex items-start gap-4">
              {/* Preview thumbnail yang sudah ada */}
              {thumbnailFileList.length > 0 && thumbnailFileList[0].url && (
                <div className="relative group w-[104px] h-[104px] rounded-xl overflow-hidden border-2 border-slate-100 flex-shrink-0">
                  <img
                    src={thumbnailFileList[0].url}
                    alt="thumbnail"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => { setPreviewImage(thumbnailFileList[0].url); setPreviewOpen(true); }}
                  />
                  {/* {formType !== "detail" && (
                    <div
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        forms.setFieldsValue({ imageUrl: null });
                        setThumbnailFileList([]);
                        onThumbnailChange?.(null);
                      }}
                    >
                      <span className="text-white text-xs font-bold">Hapus</span>
                    </div>
                  )} */}
                </div>
              )}

              {/* Tombol upload — selalu tampil saat bukan detail, atau saat belum ada thumbnail */}
              {formType !== "detail" && (
                <AntUpload
                  listType="picture-card"
                  fileList={[]}
                  showUploadList={false}
                  customRequest={handleThumbnailUpload}
                  onChange={handleThumbnailChange}
                  maxCount={1}
                  accept="image/jpeg,image/png,image/webp"
                  disabled={thumbnailUploading}
                  className="thumbnail-uploader"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Plus size={18} className="text-emerald-500" />
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {thumbnailUploading ? "Mengunggah..." : thumbnailFileList.length > 0 ? "Ganti Foto" : "Unggah"}
                    </div>
                  </div>
                </AntUpload>
              )}
            </div>

            <Typography.Text className="text-xs text-slate-400 block mt-2">JPG, PNG, WEBP. Maks. 5MB. Foto ini tampil sebagai thumbnail utama cabang.</Typography.Text>
          </div>

          <AntModal open={previewOpen} footer={null} onCancel={() => setPreviewOpen(false)} centered>
            <img alt="preview thumbnail" style={{ width: "100%", borderRadius: "12px", marginTop: 16 }} src={previewImage} />
          </AntModal>
        </Card>
      </Col>

      {/* Kolom Kanan */}
      <Col xs={24} lg={12}>
        <Card className="mb-4 border-0 shadow-sm rounded-2xl overflow-visible" title={<div className="flex items-center gap-2"><MapPin size={16} className="text-emerald-500" /><span className="font-semibold text-slate-700">Lokasi</span></div>}>
          <Row gutter={[16, 8]}>
            <Col span={24} className="relative">
              <Typography.Text className="text-xs font-medium text-slate-500 mb-2 block text-left">Pilih Lokasi di Peta</Typography.Text>
              <div className="relative w-full">
                <MapPicker key={mapKey} value={mapPosition || undefined} onChange={handleMapChangeWithRef} disabled={formType === "detail"} />
              </div>
            </Col>
            <Col span={12}>
              <UseFormItem name="latitude" label="Latitude" {...itemLayouts}>
                <Input className="h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500" placeholder="Contoh: 3.5952" disabled={formType === "detail"} onChange={handleLatitudeChange} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="longitude" label="Longitude" {...itemLayouts}>
                <Input className="h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500" placeholder="Contoh: 98.6722" disabled={formType === "detail"} onChange={handleLongitudeChange} />
              </UseFormItem>
            </Col>
          </Row>
        </Card>

        <Card className="mb-4 border-0 shadow-sm rounded-2xl" title={<div className="flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /><span className="font-semibold text-slate-700">Pengaturan Komisi</span></div>}>
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <UseFormItem name="commissionType" label="Tipe Komisi" {...itemLayouts} initialValue="percentage">
                <Select placeholder="Tipe komisi" disabled={formType === "detail"} className="h-[46px]">
                  <Select.Option value="percentage">Persentase (%)</Select.Option>
                  <Select.Option value="fixed">Nominal Tetap</Select.Option>
                </Select>
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="commissionAmount" label="Jumlah Komisi" {...itemLayouts} initialValue={25} rules={[{ required: true, message: "Wajib diisi" }]}>
                <InputNumber placeholder="Jumlah komisi" disabled={formType === "detail"} className="w-full h-[46px]" min={0} precision={2} />
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="commissionBonusType" label="Tipe Bonus" {...itemLayouts} initialValue="percentage">
                <Select placeholder="Tipe bonus" disabled={formType === "detail"} className="h-[46px]">
                  <Select.Option value="percentage">Persentase (%)</Select.Option>
                  <Select.Option value="fixed">Nominal Tetap</Select.Option>
                </Select>
              </UseFormItem>
            </Col>
            <Col span={12}>
              <UseFormItem name="commissionBonusAmount" label="Jumlah Bonus" {...itemLayouts} initialValue={5} rules={[{ required: true, message: "Wajib diisi" }]}>
                <InputNumber placeholder="Jumlah bonus" disabled={formType === "detail"} className="w-full h-[46px]" min={0} precision={2} />
              </UseFormItem>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}