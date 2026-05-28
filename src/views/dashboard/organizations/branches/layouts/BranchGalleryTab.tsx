import React, { useState, useEffect } from "react";
import { Typography, Upload as AntUpload, Modal as AntModal, FormInstance, notification as antdNotification } from "antd";
import { Plus, Image as ImageIcon, Info } from "lucide-react";
import { UploadMultipleImageService } from "@afx/services/image.service";

interface Props {
  branch: any;
  forms: FormInstance;
  formType: string;
  isOpen: boolean;
  handleUpdateGallery?: (values: any) => void;
}

export default function BranchGalleryTab({ branch, forms, formType, isOpen, handleUpdateGallery }: Props) {
  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (branch?.imageGaleries && formType !== "create") {
        setFileList(
          branch.imageGaleries.map((item: any, index: number) => {
            const urlStr = typeof item === "string" ? item : item?.imageUrl || "";
            return {
              uid: `-${index}`,
              name: typeof urlStr === "string" ? urlStr.split("/").pop() || `image-${index}` : `image-${index}`,
              status: "done",
              url: urlStr,
            };
          })
        );
      } else {
        setFileList([]);
      }
    }
  }, [branch?.imageGaleries, isOpen, formType]);

  const handlePreview = async (file: any) => {
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf("/") + 1));
  };

  const handleChangeUpload = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);

    const urls = newFileList
      .filter((f: any) => f.status === "done")
      .map((f: any) => f.url || f.response?.data?.[0]?.url)
      .filter((url: string) => !!url);

    forms.setFieldsValue({
      imageGaleries: urls,
      imageUrl: urls.length > 0 ? urls[0] : forms.getFieldValue("imageUrl"),
    });

    if (handleUpdateGallery && (formType === "detail" || formType === "update")) {
      const isAnyUploading = newFileList.some((f: any) => f.status === "uploading");
      if (!isAnyUploading && urls.length > 0) {
        handleUpdateGallery({
          imageGaleries: urls,
          imageUrl: urls.length > 0 ? urls[0] : forms.getFieldValue("imageUrl"),
        });
      }
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;
    try {
      onProgress({ percent: 50 });
      const res = await UploadMultipleImageService([file as File]);
      if (res.success) {
        onProgress({ percent: 100 });
        onSuccess(res);
      } else {
        onError(new Error(res.message || "Upload failed"));
        antdNotification.error({ message: res.message || "Gagal mengunggah gambar" });
      }
    } catch (err: any) {
      onError(err);
      antdNotification.error({ message: err?.message || "Terjadi kesalahan saat mengunggah" });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ImageIcon size={20} />
          </div>
          <div>
            <Typography.Title level={5} className="!m-0 text-slate-800">Galeri Foto Cabang</Typography.Title>
            <Typography.Text className="text-slate-500 text-xs font-medium">Unggah foto-foto interior, eksterior, atau fasilitas cabang</Typography.Text>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-100">
        <AntUpload
          listType="picture-card"
          fileList={fileList}
          onPreview={handlePreview}
          onChange={handleChangeUpload}
          customRequest={customRequest}
          multiple={true}
          className="branch-gallery-upload"
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Plus size={20} className="text-emerald-500" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unggah Foto</div>
          </div>
        </AntUpload>

        <AntModal open={previewOpen} title={previewTitle} footer={null} onCancel={() => setPreviewOpen(false)} centered className="preview-modal">
          <img alt="preview" style={{ width: "100%", borderRadius: "12px" }} src={previewImage} />
        </AntModal>

        {fileList.length === 0 && formType === "detail" && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <ImageIcon size={32} />
            </div>
            <Typography.Text className="text-slate-400 font-medium">Belum ada foto galeri untuk cabang ini</Typography.Text>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0"><Info size={16} className="text-blue-600" /></div>
        <div>
          <Typography.Text className="text-blue-800 font-bold block">Informasi</Typography.Text>
          <Typography.Text className="text-blue-700 text-xs">Format file yang didukung: JPG, PNG, WEBP. Maksimal ukuran file 5MB per gambar. Gambar yang diunggah akan otomatis tersimpan saat Anda menekan tombol "Simpan Cabang" atau "Simpan Perubahan".</Typography.Text>
        </div>
      </div>
    </div>
  );
}