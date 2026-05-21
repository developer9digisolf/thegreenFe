"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Plus, MapPin, DollarSign } from "lucide-react";
import { UseForm, UseFormItem } from "@afx/components/form/form.layout";
import UseInput from "@afx/components/ui/input/input.layout";
import UseInputArea from "@afx/components/ui/input/input-area.layout";
import { IPropsFormBranch } from "@afx/interfaces/master/branch.iface";
import {
  IActionBranch,
  IStateBranch,
} from "@afx/models/dashboard/master/branches.model";
import { useStore } from "@afx/store/core";
import {
  Col,
  Modal,
  Row,
  Spin,
  Typography,
  Switch,
  Form,
  Card,
  Button,
  Input,
  InputNumber,
  Tabs,
  Tag,
  Space,
  Table,
  Popconfirm,
  Select,
  notification as antdNotification,
} from "antd";
import {
  ArrowLeft,
  Trash2,
  ListChecks,
  Info,
  CreditCard,
  Edit3,
  Image as ImageIcon,
  Upload,
} from "lucide-react";
import { Upload as AntUpload, Modal as AntModal } from "antd";
import {
  UploadImageService,
  UploadMultipleImageService,
} from "@afx/services/image.service";

import dynamic from "next/dynamic";
import {
  GetBranchPaymentMethodsService,
  CreateBranchPaymentMethodService,
  UpdateBranchPaymentMethodService,
  DeleteBranchPaymentMethodService,
  ToggleBranchPaymentMethodStatusService,
} from "@afx/services/master/branch-payment-method.service";
import {
  GetGroupedPaymentMethodsService,
  GetActivePaymentMethodsService,
} from "@afx/services/payment-method.service";
import { IBranchPaymentMethod } from "@afx/interfaces/master/branch-payment-method.iface";

const MapPicker = dynamic(() => import("@afx/components/ui/maps/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center">
      Memuat Peta...
    </div>
  ),
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
  const [mapPosition, setMapPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Watch form values
  const formLat = Form.useWatch("latitude", props.forms);
  const formLng = Form.useWatch("longitude", props.forms);

  // SET FORM VALUES WHEN BRANCH DATA IS AVAILABLE
  useEffect(() => {
    console.log("FormBranch useEffect - props.open:", props?.open);
    console.log("FormBranch useEffect - formType:", props?.formType);
    console.log("FormBranch useEffect - branch:", branch);

    if (props?.open) {
      if (props?.formType === "create") {
        // Reset untuk create
        props.forms.resetFields();
        props.forms.setFieldsValue({
          imageGaleries: [],
          imageUrl: null,
          commissionType: "percentage",
          commissionAmount: 25,
          commissionBonusType: "percentage",
          commissionBonusAmount: 5,
        });
        setMapPosition(null);
        setFileList([]);
      } else if (props?.formType === "update" || props?.formType === "detail") {
        // Set data branch ke form
        if (branch && branch.id) {
          console.log("Setting branch data to form:", branch);

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
            imageUrl: branch.imageUrl,
            imageGaleries: branch.imageGaleries || [],
            commissionType: branch.commissionType || "percentage",
            commissionAmount: branch.commissionAmount || 25,
            commissionBonusType: branch.commissionBonusType || "percentage",
            commissionBonusAmount: branch.commissionBonusAmount || 5,
          });

          // Set map position
          if (branch.latitude && branch.longitude) {
            const lat =
              typeof branch.latitude === "string"
                ? parseFloat(branch.latitude)
                : branch.latitude;
            const lng =
              typeof branch.longitude === "string"
                ? parseFloat(branch.longitude)
                : branch.longitude;

            if (!isNaN(lat) && !isNaN(lng)) {
              console.log("Setting map position:", { lat, lng });
              setMapPosition({ lat, lng });
            }
          }
        } else {
          console.warn("No branch data available for update/detail");
        }
      }
    }
  }, [props?.open, props?.formType, branch, props.forms]);

  // Update map position when form latitude/longitude changes (from manual input)
  useEffect(() => {
    if (formLat && formLng) {
      const lat = typeof formLat === "string" ? parseFloat(formLat) : formLat;
      const lng = typeof formLng === "string" ? parseFloat(formLng) : formLng;

      if (!isNaN(lat) && !isNaN(lng)) {
        console.log("Form changed, updating map position:", { lat, lng });
        setMapPosition({ lat, lng });
      }
    }
  }, [formLat, formLng]);

  // Handle map change
  const handleMapChange = useCallback(
    (coords: { lat: number; lng: number }) => {
      console.log("Map changed, updating form:", coords);

      // Update form values
      props.forms.setFieldsValue({
        latitude: coords.lat.toFixed(8),
        longitude: coords.lng.toFixed(8),
      });

      // Update map position state
      setMapPosition(coords);
    },
    [props.forms],
  );

  // Handle manual input changes
  const handleLatitudeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value && formLng) {
        const lat = parseFloat(value);
        const lng = typeof formLng === "string" ? parseFloat(formLng) : formLng;

        if (!isNaN(lat) && !isNaN(lng)) {
          props.forms.setFieldsValue({
            latitude: lat.toFixed(8),
          });
          setMapPosition({ lat, lng });
        }
      }
    },
    [formLng, props.forms],
  );

  const handleLongitudeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (value && formLat) {
        const lat = typeof formLat === "string" ? parseFloat(formLat) : formLat;
        const lng = parseFloat(value);

        if (!isNaN(lat) && !isNaN(lng)) {
          props.forms.setFieldsValue({
            longitude: lng.toFixed(8),
          });
          setMapPosition({ lat, lng });
        }
      }
    },
    [formLat, props.forms],
  );

  const [activeTab, setActiveTab] = useState<string>("general");
  const [branchPaymentMethods, setBranchPaymentMethods] = useState<
    IBranchPaymentMethod[]
  >([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] =
    useState<boolean>(false);
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  const [isModalPMOpen, setIsModalPMOpen] = useState<boolean>(false);
  const [modalPMMode, setModalPMMode] = useState<"create" | "update">("create");
  const [selectedBPM, setSelectedBPM] = useState<IBranchPaymentMethod | null>(
    null,
  );
  const [addPMForm] = Form.useForm();

  const [fileList, setFileList] = useState<any[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

  useEffect(() => {
    if (branch?.imageGaleries) {
      setFileList(
        branch.imageGaleries.map((item: any, index: number) => {
          const urlStr = typeof item === "string" ? item : item?.imageUrl || "";
          return {
            uid: `-${index}`,
            name:
              typeof urlStr === "string"
                ? urlStr.split("/").pop() || `image-${index}`
                : `image-${index}`,
            status: "done",
            url: urlStr,
          };
        }),
      );
    } else {
      setFileList([]);
    }
  }, [branch?.imageGaleries, props.open]);

  const handlePreview = async (file: any) => {
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1),
    );
  };

  const handleChangeUpload = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);

    // Update form values with successful uploads
    const urls = newFileList
      .filter((f: any) => f.status === "done")
      .map((f: any) => f.url || f.response?.data?.[0]?.url)
      .filter((url: string) => !!url);

    props.forms.setFieldsValue({
      imageGaleries: urls,
      imageUrl:
        urls.length > 0 ? urls[0] : props.forms.getFieldValue("imageUrl"),
    });

    // Auto-update if in detail/update mode and a new file just finished uploading
    if (
      props.handleUpdateGallery &&
      (props.formType === "detail" || props.formType === "update")
    ) {
      const isAnyUploading = newFileList.some(
        (f: any) => f.status === "uploading",
      );
      if (!isAnyUploading && urls.length > 0) {
        props.handleUpdateGallery({
          imageGaleries: urls,
          imageUrl:
            urls.length > 0 ? urls[0] : props.forms.getFieldValue("imageUrl"),
        });
      }
    }
  };

  const customRequest = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options;

    try {
      // Create a fake progress
      onProgress({ percent: 50 });

      const res = await UploadMultipleImageService([file as File]);
      if (res.success) {
        onProgress({ percent: 100 });
        onSuccess(res);

        // We don't update form here because handleChangeUpload will catch it when status is 'done'
      } else {
        onError(new Error(res.message || "Upload failed"));
        antdNotification.error({
          message: res.message || "Gagal mengunggah gambar",
        });
      }
    } catch (err: any) {
      onError(err);
      antdNotification.error({
        message: err?.message || "Terjadi kesalahan saat mengunggah",
      });
    }
  };

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
        const flatList = groups.flatMap(
          (group: any) => group.paymentMethods || [],
        );
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
    if (
      props.open &&
      (props.formType === "detail" || props.formType === "update") &&
      branch?.id
    ) {
      fetchBranchPaymentMethods();
      fetchAllPaymentMethods();
    }
  }, [
    props.open,
    props.formType,
    branch?.id,
    fetchBranchPaymentMethods,
    fetchAllPaymentMethods,
  ]);

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
          antdNotification.success({
            message: "Berhasil menambahkan metode pembayaran",
          });
        }
      } else if (selectedBPM) {
        const res = await UpdateBranchPaymentMethodService(selectedBPM.id, {
          sortOrder: values.sortOrder,
          notes: values.notes,
        });
        if (res.success) {
          antdNotification.success({
            message: "Berhasil memperbarui metode pembayaran",
          });
        }
      }

      setIsModalPMOpen(false);
      addPMForm.resetFields();
      fetchBranchPaymentMethods();
    } catch (err: any) {
      antdNotification.error({
        message: err?.message || "Gagal menyimpan metode pembayaran",
      });
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
        antdNotification.success({
          message: "Berhasil menghapus metode pembayaran",
        });
        fetchBranchPaymentMethods();
      }
    } catch (err: any) {
      antdNotification.error({
        message: err?.message || "Gagal menghapus metode pembayaran",
      });
    }
  };

  const handleTogglePM = async (id: number) => {
    try {
      const res = await ToggleBranchPaymentMethodStatusService(id);
      if (res.success) {
        fetchBranchPaymentMethods();
      }
    } catch (err: any) {
      antdNotification.error({
        message: err?.message || "Gagal mengubah status",
      });
    }
  };

  const renderPaymentMethods = () => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Typography.Title level={5} className="m-0">
            Metode Pembayaran Cabang
          </Typography.Title>
          <Typography.Text className="text-slate-500 text-xs">
            Kelola metode pembayaran yang tersedia untuk cabang ini
          </Typography.Text>
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
                      (e.target as HTMLImageElement).style.display = "none";
                      const parent = (e.target as HTMLImageElement)
                        .parentElement;
                      if (parent) {
                        const placeholder = document.createElement("div");
                        placeholder.className =
                          "w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400";
                        placeholder.innerHTML =
                          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>';
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
            ),
          },
          {
            title: "Catatan",
            dataIndex: "notes",
            key: "notes",
            render: (text) => (
              <Typography.Text className="text-xs text-slate-500">
                {text || "-"}
              </Typography.Text>
            ),
          },
          {
            title: "Urutan",
            dataIndex: "sortOrder",
            key: "sortOrder",
            width: 80,
            align: "center",
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
            ),
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
            ),
          },
        ]}
      />

      <Modal
        title={
          modalPMMode === "create"
            ? "Tambah Metode Pembayaran"
            : "Edit Metode Pembayaran"
        }
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
                .filter((pm) => {
                  if (modalPMMode === "update") {
                    return (
                      Number(pm.id) === Number(selectedBPM?.paymentMethodId)
                    );
                  }
                  return !branchPaymentMethods.find(
                    (bpm) => Number(bpm.paymentMethodId) === Number(pm.id),
                  );
                })
                .map((pm) => (
                  <Select.Option key={pm.id} value={pm.id}>
                    <Space>
                      {pm.imageUrl ? (
                        <img
                          src={pm.imageUrl}
                          alt={pm.name}
                          className="w-5 h-5 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                            const parent = (e.target as HTMLImageElement)
                              .parentElement;
                            if (parent) {
                              const placeholder = document.createElement("div");
                              placeholder.className =
                                "w-5 h-5 flex items-center justify-center text-slate-400";
                              placeholder.innerHTML =
                                '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-credit-card"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>';
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
            <Button
              type="primary"
              htmlType="submit"
              className="bg-emerald-500 hover:bg-emerald-600 border-none"
            >
              Simpan
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );

  const renderGallery = () => (
    <div className="flex flex-col gap-6">
      <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <ImageIcon size={20} />
          </div>
          <div>
            <Typography.Title level={5} className="!m-0 text-slate-800">
              Galeri Foto Cabang
            </Typography.Title>
            <Typography.Text className="text-slate-500 text-xs font-medium">
              Unggah foto-foto interior, eksterior, atau fasilitas cabang
            </Typography.Text>
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
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Unggah Foto
            </div>
          </div>
        </AntUpload>

        <AntModal
          open={previewOpen}
          title={previewTitle}
          footer={null}
          onCancel={() => setPreviewOpen(false)}
          centered
          className="preview-modal"
        >
          <img
            alt="preview"
            style={{ width: "100%", borderRadius: "12px" }}
            src={previewImage}
          />
        </AntModal>

        {fileList.length === 0 && props.formType === "detail" && (
          <div className="py-12 flex flex-col items-center justify-center gap-3 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
              <ImageIcon size={32} />
            </div>
            <Typography.Text className="text-slate-400 font-medium">
              Belum ada foto galeri untuk cabang ini
            </Typography.Text>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
          <Info size={16} className="text-blue-600" />
        </div>
        <div>
          <Typography.Text className="text-blue-800 font-bold block">
            Informasi
          </Typography.Text>
          <Typography.Text className="text-blue-700 text-xs">
            Format file yang didukung: JPG, PNG, WEBP. Maksimal ukuran file 5MB
            per gambar. Gambar yang diunggah akan otomatis tersimpan saat Anda
            menekan tombol "Simpan Cabang" atau "Simpan Perubahan".
          </Typography.Text>
        </div>
      </div>
    </div>
  );

  const renderHeader = () => (
    <div className="flex items-center gap-3 p-2">
      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
        {props?.formType === "create" ? (
          <Plus size={20} />
        ) : (
          <MapPin size={20} />
        )}
      </div>
      <div className="flex flex-col text-left">
        <Typography className="text-xl font-bold text-slate-800 m-0 leading-tight">
          {props?.formType === "create"
            ? "Tambah"
            : props?.formType === "detail"
              ? "Detail"
              : "Perbarui"}{" "}
          Cabang (Branch)
        </Typography>
        <p className="text-xs text-slate-400 font-medium m-0 mt-0.5">
          Lengkapi informasi data cabang Anda
        </p>
      </div>
    </div>
  );

  const renderFormContent = () => (
    <Spin spinning={loading} size="small">
      <UseForm form={props?.forms} onFinish={props.handleSubmit}>
        <Form.Item name="imageUrl" noStyle>
          <Input type="hidden" />
        </Form.Item>
        <Form.Item name="imageGaleries" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Row gutter={[24, 24]}>
          {/* Kolom Kiri */}
          <Col xs={24} lg={12}>
            {/* Card 1: Informasi Dasar */}
            <Card
              className="mb-4 border-0 shadow-sm rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">
                    Informasi Dasar
                  </span>
                </div>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <UseFormItem
                    name="code"
                    label="Kode Cabang"
                    {...itemLayouts}
                    rules={[
                      { required: true, message: "Field kode wajib diisi" },
                    ]}
                  >
                    <UseInput
                      standart={false}
                      placeholder="BR001"
                      disabled={props?.formType === "detail"}
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="isMainBranch"
                    label="Cabang Pusat"
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
                    rules={[
                      { required: true, message: "Field nama wajib diisi" },
                    ]}
                  >
                    <UseInput
                      standart={false}
                      placeholder="Masukkan nama cabang"
                      disabled={props?.formType === "detail"}
                    />
                  </UseFormItem>
                </Col>
                <Col span={24}>
                  <UseFormItem
                    name="address"
                    label="Alamat"
                    {...itemLayouts}
                    rules={[
                      { required: true, message: "Field alamat wajib diisi" },
                    ]}
                  >
                    <UseInputArea
                      standart={false}
                      disabled={props?.formType === "detail"}
                      placeholder="Masukkan alamat cabang..."
                      rows={2}
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
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
                <Col span={12}>
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
                <Col span={12}>
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
              </Row>
            </Card>

            {/* Card 2: Kontak */}
            <Card
              className="mb-4 border-0 shadow-sm rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">Kontak</span>
                </div>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
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
                      placeholder="email@cabang.com"
                      disabled={props?.formType === "detail"}
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
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
                      placeholder="08xxxxxxxx"
                      disabled={props?.formType === "detail"}
                    />
                  </UseFormItem>
                </Col>
              </Row>
            </Card>

            {/* Card 3: Deskripsi */}
            <Card
              className="mb-4 border-0 shadow-sm rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">
                    Informasi Tambahan
                  </span>
                </div>
              }
            >
              <UseFormItem
                name="description"
                label="Deskripsi"
                {...itemLayouts}
              >
                <UseInputArea
                  standart={false}
                  disabled={props?.formType === "detail"}
                  placeholder="Deskripsi singkat cabang..."
                  rows={3}
                />
              </UseFormItem>
            </Card>
          </Col>

          {/* Kolom Kanan */}
          <Col xs={24} lg={12}>
            {/* Card 4: Lokasi */}
            <Card
              className="mb-4 border-0 shadow-sm rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">Lokasi</span>
                </div>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={24}>
                  <Typography.Text className="text-xs font-medium text-slate-500 mb-2 block text-left">
                    Pilih Lokasi di Peta
                  </Typography.Text>
                  <MapPicker
                    key={`map-${props.formType}-${mapPosition?.lat}-${mapPosition?.lng}`}
                    value={mapPosition || undefined}
                    onChange={handleMapChange}
                    disabled={props?.formType === "detail"}
                  />
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="latitude"
                    label="Latitude"
                    {...itemLayouts}
                  >
                    <Input
                      className="h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500"
                      placeholder="Contoh: 3.5952"
                      disabled={props?.formType === "detail"}
                      onChange={handleLatitudeChange}
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="longitude"
                    label="Longitude"
                    {...itemLayouts}
                  >
                    <Input
                      className="h-[46px] px-3 !rounded-xl !border-2 !border-gray-100 hover:border-emerald-400 focus:border-emerald-500"
                      placeholder="Contoh: 98.6722"
                      disabled={props?.formType === "detail"}
                      onChange={handleLongitudeChange}
                    />
                  </UseFormItem>
                </Col>
              </Row>
            </Card>

            {/* Card 5: Komisi */}
            <Card
              className="mb-4 border-0 shadow-sm rounded-2xl"
              title={
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-emerald-500" />
                  <span className="font-semibold text-slate-700">
                    Pengaturan Komisi
                  </span>
                </div>
              }
            >
              <Row gutter={[16, 8]}>
                <Col span={12}>
                  <UseFormItem
                    name="commissionType"
                    label="Tipe Komisi"
                    {...itemLayouts}
                    initialValue="percentage"
                  >
                    <Select
                      placeholder="Tipe komisi"
                      disabled={props?.formType === "detail"}
                      className="h-[46px]"
                    >
                      <Select.Option value="percentage">
                        Persentase (%)
                      </Select.Option>
                      <Select.Option value="fixed">Nominal Tetap</Select.Option>
                    </Select>
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="commissionAmount"
                    label="Jumlah Komisi"
                    {...itemLayouts}
                    initialValue={25}
                    rules={[{ required: true, message: "Wajib diisi" }]}
                  >
                    <InputNumber
                      placeholder="Jumlah komisi"
                      disabled={props?.formType === "detail"}
                      className="w-full h-[46px]"
                      min={0}
                      precision={2}
                    />
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="commissionBonusType"
                    label="Tipe Bonus"
                    {...itemLayouts}
                    initialValue="percentage"
                  >
                    <Select
                      placeholder="Tipe bonus"
                      disabled={props?.formType === "detail"}
                      className="h-[46px]"
                    >
                      <Select.Option value="percentage">
                        Persentase (%)
                      </Select.Option>
                      <Select.Option value="fixed">Nominal Tetap</Select.Option>
                    </Select>
                  </UseFormItem>
                </Col>
                <Col span={12}>
                  <UseFormItem
                    name="commissionBonusAmount"
                    label="Jumlah Bonus"
                    {...itemLayouts}
                    initialValue={5}
                    rules={[{ required: true, message: "Wajib diisi" }]}
                  >
                    <InputNumber
                      placeholder="Jumlah bonus"
                      disabled={props?.formType === "detail"}
                      className="w-full h-[46px]"
                      min={0}
                      precision={2}
                    />
                  </UseFormItem>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {props.formType === "detail" && fileList.length > 0 && (
          <Card
            className="mb-4 border-0 shadow-sm rounded-2xl"
            title={
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-emerald-500" />
                <span className="font-semibold text-slate-700">
                  Pratinjau Galeri Cabang
                </span>
              </div>
            }
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {fileList.map((file, idx) => (
                <div
                  key={idx}
                  className="aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => handlePreview(file)}
                >
                  <img
                    src={file.url}
                    alt={`gallery-${idx}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </Card>
        )}

        <Col span={24}>
          {props?.formType === "create" && (
            <div className="flex justify-end mt-6 border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full lg:w-[200px] px-6 py-3 rounded-xl font-bold text-base text-white transition-all shadow-md hover:shadow-emerald-500/20 active:scale-95 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
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
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
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
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                }`}
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          )}
        </Col>
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
      children: (
        <div className="max-w-[100%] mx-auto py-4">{renderFormContent()}</div>
      ),
    },
    {
      key: "payment",
      label: (
        <div className="flex items-center gap-2">
          <ListChecks size={16} />
          Metode Pembayaran
        </div>
      ),
      children: (
        <div className="max-w-[900px] mx-auto py-4">
          {renderPaymentMethods()}
        </div>
      ),
    },
    {
      key: "gallery",
      label: (
        <div className="flex items-center gap-2">
          <ImageIcon size={16} />
          Galeri Foto
        </div>
      ),
      children: (
        <div className="max-w-[900px] mx-auto py-4">{renderGallery()}</div>
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
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabsItems.filter((item) => {
            if (props.formType === "create" && item.key === "payment")
              return false;
            return true;
          })}
          className="premium-tabs"
        />
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
