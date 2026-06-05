"use client";

import { useStore } from "@afx/store/core";
import {
  Modal,
  Form,
  DatePicker,
  Select,
  Input,
  InputNumber,
  Upload,
  Button,
  Row,
  Col,
  App,
} from "antd";
import { useEffect, useState, useRef } from "react";
import { UploadPromoBannerImageService } from "@afx/services/master/promo-banner.service";
import { BrowsePromoBanner } from "./layouts/browse.layout";
import {
  ConfirmActionModal,
  ActionPresets,
} from "@afx/components/modals/ConfirmActionModal.layout";
import {
  IActionPromoBanner,
  IStatePromoBanner,
} from "@afx/models/dashboard/master/promo-banners.model";
import {
  PromoBanner,
  CreatePromoBannerRequest,
  UpdatePromoBannerRequest,
} from "@afx/interfaces/promo-banner.iface";
import { IServicePackage } from "@afx/interfaces/service-package.iface";
import { ICreditPackage } from "@afx/interfaces/credit-package.iface";
import { InboxOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Dragger } = Upload;

export default function PromoBannerView() {
  const {
    useActions: usePromoBannerActions,
    state: promoBannerState,
    isLoading,
  } = useStore<IStatePromoBanner, IActionPromoBanner>("promoBanners");

  const { message } = App.useApp();

  const { packages, creditPackages } = promoBannerState;

  const [keyword, setKeywords] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [tempSearch, setTempSearch] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    id: number;
    name: string;
  }>({
    open: false,
    id: 0,
    name: "",
  });

  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: "create" | "edit";
    data: PromoBanner | null;
  }>({
    open: false,
    mode: "create",
    data: null,
  });

  const [form] = Form.useForm();

  // Search states for dropdowns
  const [packageSearch, setPackageSearch] = useState<string>("");
  const [creditPackageSearch, setCreditPackageSearch] = useState<string>("");

  // Debounce timers
  const packageSearchTimer = useRef<NodeJS.Timeout | null>(null);
  const creditPackageSearchTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = () => {
    setKeywords(tempSearch);
    setPage(1);
  };

  // Debounced search for packages
  const handlePackageSearch = (value: string) => {
    setPackageSearch(value);

    if (packageSearchTimer.current) {
      clearTimeout(packageSearchTimer.current);
    }

    packageSearchTimer.current = setTimeout(() => {
      const params: any = {
        Page: 1,
        PageSize: 100,
        Search: value,
      };
      usePromoBannerActions<"getActivePackages">(
        "getActivePackages",
        [params],
        true,
      );
    }, 1500);
  };

  // Debounced search for credit packages
  const handleCreditPackageSearch = (value: string) => {
    setCreditPackageSearch(value);

    if (creditPackageSearchTimer.current) {
      clearTimeout(creditPackageSearchTimer.current);
    }

    creditPackageSearchTimer.current = setTimeout(() => {
      // CreditPackageGetAllService doesn't accept params, so we'll need to handle it differently
      // For now, we'll just fetch all and filter on the client side
      usePromoBannerActions<"getActiveCreditPackages">(
        "getActiveCreditPackages",
        [],
        true,
      );
    }, 1500);
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (packageSearchTimer.current) {
        clearTimeout(packageSearchTimer.current);
      }
      if (creditPackageSearchTimer.current) {
        clearTimeout(creditPackageSearchTimer.current);
      }
    };
  }, []);

  const getPromoBanners = () => {
    const params = {
      Search: keyword,
      Page: page,
      PageSize: pageSize,
      SortColumn: "createdat",
      SortDirection: "desc",
    };
    usePromoBannerActions<"getPromoBanners">("getPromoBanners", [params], true);
  };

  useEffect(() => {
    getPromoBanners();
    // Fetch master data for dropdowns
    usePromoBannerActions<"getActivePackages">("getActivePackages", [], true);
    usePromoBannerActions<"getActiveCreditPackages">(
      "getActiveCreditPackages",
      [],
      true,
    );
  }, [page, pageSize, keyword]);

  const handleDelete = (id: number) => {
    usePromoBannerActions<"deletePromoBanner">(
      "deletePromoBanner",
      [
        id,
        (code: any) => {
          const isSuccess =
            !code || String(code) === "20000" || String(code).startsWith("2");
          if (isSuccess) {
            setDeleteConfirm({ open: false, id: 0, name: "" });
            getPromoBanners();
          }
        },
      ],
      true,
    );
  };

  const handleOpenCreate = () => {
    setFormModal({ open: true, mode: "create", data: null });
    form.resetFields();
  };

  const handleOpenEdit = async (id: number) => {
    usePromoBannerActions<"getPromoBanner">("getPromoBanner", [
      id,
      (promoBanner: PromoBanner) => {
        setFormModal({ open: true, mode: "edit", data: promoBanner });
        form.setFieldsValue({
          title: promoBanner.title,
          description: promoBanner.description,
          imageUrl: promoBanner.imageUrl,
          actionType: promoBanner.actionType,
          actionValue: promoBanner.actionValue,
          startDate: promoBanner.startDate
            ? dayjs(promoBanner.startDate)
            : null,
          endDate: promoBanner.endDate ? dayjs(promoBanner.endDate) : null,
          sortOrder: promoBanner.sortOrder,
        });
      },
    ]);
  };

  const handleFormSubmit = async (values: any) => {
    const formData: CreatePromoBannerRequest | UpdatePromoBannerRequest = {
      title: values.title,
      description: values.description,
      imageUrl: values.imageUrl,
      actionType: values.actionType,
      actionValue: values.actionValue,
      startDate: values.startDate ? dayjs(values.startDate).toISOString() : "",
      endDate: values.endDate ? dayjs(values.endDate).toISOString() : "",
      sortOrder: values.sortOrder,
    };

    if (formModal.mode === "create") {
      usePromoBannerActions<"createPromoBanner">(
        "createPromoBanner",
        [
          formData,
          (code: any) => {
            const isSuccess =
              !code || String(code) === "20000" || String(code).startsWith("2");
            if (isSuccess) {
              setFormModal({ open: false, mode: "create", data: null });
              form.resetFields();
              getPromoBanners();
            }
          },
        ],
        true,
      );
    } else if (formModal.mode === "edit" && formModal.data) {
      usePromoBannerActions<"updatePromoBanner">(
        "updatePromoBanner",
        [
          formModal.data.id,
          formData,
          (code: any) => {
            const isSuccess =
              !code || String(code) === "20000" || String(code).startsWith("2");
            if (isSuccess) {
              setFormModal({ open: false, mode: "create", data: null });
              form.resetFields();
              getPromoBanners();
            }
          },
        ],
        true,
      );
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const res = await UploadPromoBannerImageService(file);
      if (res?.meta?.code === 20000) {
        const imageUrl = res?.data?.url || res?.data?.imageUrl || res?.data;
        form.setFieldValue("imageUrl", imageUrl);
        message.success("Gambar berhasil diupload");
        return false;
      } else {
        message.error("Gagal mengupload gambar");
        return false;
      }
    } catch (error) {
      message.error("Gagal mengupload gambar");
      return false;
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: "image/*",
    beforeUpload: handleImageUpload,
    showUploadList: false,
  };

  return (
    <>
      <BrowsePromoBanner
        {...{ page, pageSize, setPage, setPageSize }}
        onSearch={handleSearch}
        searchText={tempSearch}
        setSearchText={setTempSearch}
        setOpenFormCreate={handleOpenCreate}
        handleEdit={handleOpenEdit}
        handleDelete={(id: number, name: string) =>
          setDeleteConfirm({ open: true, id, name })
        }
        packages={packages}
        creditPackages={creditPackages}
      />

      {deleteConfirm.open && (
        <ConfirmActionModal
          config={ActionPresets.delete(deleteConfirm.name)}
          onConfirm={() => handleDelete(deleteConfirm.id)}
          onClose={() => setDeleteConfirm({ open: false, id: 0, name: "" })}
          loading={isLoading("deletePromoBanner")}
        />
      )}

      {formModal.open && (
        <Modal
          title={
            formModal.mode === "create"
              ? "Tambah Promo Banner"
              : "Edit Promo Banner"
          }
          open={formModal.open}
          onCancel={() => {
            setFormModal({ open: false, mode: "create", data: null });
            form.resetFields();
          }}
          footer={null}
          width={700}
        >
          <Form form={form} layout="vertical" onFinish={handleFormSubmit}>
            {/* Row 1: Judul & Urutan */}
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item
                  name="title"
                  label="Judul"
                  rules={[{ required: true, message: "Judul wajib diisi" }]}
                >
                  <Input placeholder="Masukkan judul banner" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  name="sortOrder"
                  label="Urutan"
                  rules={[{ required: true, message: "Urutan wajib diisi" }]}
                  initialValue={0}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    placeholder="Masukkan urutan"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 2: Deskripsi (full width) */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Deskripsi"
                  rules={[{ required: true, message: "Deskripsi wajib diisi" }]}
                >
                  <TextArea rows={3} placeholder="Masukkan deskripsi banner" />
                </Form.Item>
              </Col>
            </Row>

            {/* Row 3: Gambar (full width) */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item noStyle shouldUpdate>
                  {() => (
                    <>
                      <Form.Item
                        name="imageUrl"
                        label="Gambar"
                        rules={[
                          { required: true, message: "Gambar wajib diupload" },
                        ]}
                      >
                        <Input hidden />
                      </Form.Item>
                      <div className="space-y-2">
                        <Dragger {...uploadProps}>
                          <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                          </p>
                          <p className="ant-upload-text">
                            Klik atau drag file ke area ini untuk upload
                          </p>
                          <p className="ant-upload-hint">
                            Mendukung upload satu gambar. Ukuran maksimal 5MB.
                          </p>
                        </Dragger>
                        {form.getFieldValue("imageUrl") && (
                          <div className="mt-2">
                            <img
                              src={form.getFieldValue("imageUrl")}
                              alt="Preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: 200,
                                borderRadius: 8,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </Form.Item>
              </Col>
            </Row>

            {/* Row 4: Tipe Aksi */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="actionType"
                  label="Tipe Aksi"
                  rules={[
                    { required: true, message: "Tipe aksi wajib dipilih" },
                  ]}
                >
                  <Select
                    placeholder="Pilih tipe aksi"
                    onChange={() =>
                      form.setFieldValue("actionValue", undefined)
                    }
                  >
                    <Select.Option value="voucher_pack">
                      Voucher Pack
                    </Select.Option>
                    <Select.Option value="amount_credit">
                      Amount Credit
                    </Select.Option>
                    <Select.Option value="external_url">
                      External URL
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Row 5: Nilai Aksi (Dynamic based on Action Type) */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.actionType !== currentValues.actionType
                  }
                >
                  {({ getFieldValue }) => {
                    const actionType = getFieldValue("actionType");

                    if (actionType === "voucher_pack") {
                      return (
                        <Form.Item
                          name="actionValue"
                          label="Voucher Pack"
                          rules={[
                            {
                              required: true,
                              message: "Voucher pack wajib dipilih",
                            },
                          ]}
                        >
                          <Select
                            placeholder="Pilih voucher pack"
                            showSearch
                            filterOption={false}
                            onSearch={handlePackageSearch}
                            loading={isLoading("getActivePackages")}
                            notFoundContent={
                              isLoading("getActivePackages")
                                ? "Memuat..."
                                : "Data tidak ditemukan"
                            }
                          >
                            {packages?.map((pkg) => (
                              <Select.Option
                                key={pkg.id}
                                value={String(pkg.id)}
                              >
                                {pkg.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }

                    if (actionType === "amount_credit") {
                      // Filter credit packages client-side based on search
                      const filteredCreditPackages = creditPackages?.filter(
                        (cp) =>
                          !creditPackageSearch ||
                          cp.name
                            .toLowerCase()
                            .includes(creditPackageSearch.toLowerCase()) ||
                          cp.creditAmount
                            .toString()
                            .includes(creditPackageSearch),
                      );

                      return (
                        <Form.Item
                          name="actionValue"
                          label="Amount Credit"
                          rules={[
                            { required: true, message: "Credit wajib dipilih" },
                          ]}
                        >
                          <Select
                            placeholder="Pilih credit"
                            showSearch
                            filterOption={false}
                            onSearch={handleCreditPackageSearch}
                            loading={isLoading("getActiveCreditPackages")}
                            notFoundContent={
                              isLoading("getActiveCreditPackages")
                                ? "Memuat..."
                                : "Data tidak ditemukan"
                            }
                          >
                            {filteredCreditPackages?.map((cp) => (
                              <Select.Option key={cp.id} value={String(cp.id)}>
                                {cp.name} - Rp{" "}
                                {cp.creditAmount.toLocaleString("id-ID")}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      );
                    }

                    if (actionType === "external_url") {
                      return (
                        <Form.Item
                          name="actionValue"
                          label="External URL"
                          rules={[
                            { required: true, message: "URL wajib diisi" },
                            {
                              type: "url",
                              message: "Format URL tidak valid",
                            },
                          ]}
                        >
                          <Input placeholder="https://thegreenspa.co.id/promo" />
                        </Form.Item>
                      );
                    }

                    return null;
                  }}
                </Form.Item>
              </Col>
            </Row>

            {/* Row 6: Tanggal Mulai & Tanggal Berakhir */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="startDate"
                  label="Tanggal Mulai"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal mulai wajib dipilih",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal mulai"
                    format="DD/MM/YYYY HH:mm"
                    showTime
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="endDate"
                  label="Tanggal Berakhir"
                  rules={[
                    {
                      required: true,
                      message: "Tanggal berakhir wajib dipilih",
                    },
                  ]}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    placeholder="Pilih tanggal berakhir"
                    format="DD/MM/YYYY HH:mm"
                    showTime
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Footer Buttons */}
            <Form.Item className="mb-0">
              <div className="flex justify-end gap-2">
                <Button
                  onClick={() => {
                    setFormModal({ open: false, mode: "create", data: null });
                    form.resetFields();
                  }}
                >
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={
                    isLoading("createPromoBanner") ||
                    isLoading("updatePromoBanner")
                  }
                >
                  {formModal.mode === "create" ? "Simpan" : "Update"}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
}
