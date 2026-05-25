"use client";

import {
  Form,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  Upload,
  message,
  Button,
} from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useStore } from "@afx/store/core";
import request from "@afx/utils/request.utils";

interface EmployeeFormContentProps {
  form: any;
  formType: string;
  disabled?: boolean;
}

export const EmployeeFormContent = ({
  form,
  formType,
  disabled = false,
}: EmployeeFormContentProps) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const { state: employeeStore } = useStore<any, any>("employees");
  const { state: deptState }     = useStore<any, any>("departments");
  const { state: posState }      = useStore<any, any>("positions");

  useEffect(() => {
    if (formType === "update" || formType === "detail") {
      const data = employeeStore?.employee;
      if (data) {
        form.setFieldsValue({
          ...data,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          hireDate:    data.hireDate    ? dayjs(data.hireDate)    : null,
          // Pastikan enum dari BE (0/1/2) langsung dipakai
          employmentStatus: data.employmentStatus ?? 0,
        });
        setImageUrl(data.photoUrl || "");
      }
    } else if (formType === "create") {
      form.resetFields();
      // ✅ Default: Active = 0, sesuai enum BE
      form.setFieldsValue({
        employmentStatus: 0,
        gender: 1, // 1=Laki-laki (sesuai Select options di bawah)
      });
      setImageUrl("");
    }
  }, [formType, employeeStore?.employee, form]);

  const handleChange = (info: any) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      const response = info.file.response;
      const path = response?.data?.path || "";
      const url  = response?.data?.url  || "";
      setImageUrl(url);
      form.setFieldValue("photoUrl", path);
      setLoading(false);
      message.success("Foto berhasil diunggah");
    }
    if (info.file.status === "error") {
      setLoading(false);
      if (info.file.error) {
        message.error(`${info.file.name} file upload failed: ${info.file.error.message}`);
      }
    }
  };

  const customRequest = async ({ file, onSuccess, onError }: any) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      setLoading(true);
      const res = await request<any>({
        url: "images/upload",
        method: "POST",
        data: formData,
        bodyType: "formData",
      });
      if (res.success) {
        onSuccess(res);
      } else {
        onError(new Error(res.message));
        message.error(res.message);
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      onError(err);
      message.error(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Form
      form={form}
      layout="vertical"
      disabled={disabled || formType === "detail"}
    >
      <Divider titlePlacement="left">Informasi Utama</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="fullName"
            label="Nama Lengkap"
            rules={[{ required: true, message: "Nama lengkap wajib diisi" }]}
          >
            <Input placeholder="Masukkan nama lengkap" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="nickname" label="Nama Panggilan">
            <Input placeholder="Masukkan nama panggilan" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="employeeCode" hidden>
        <Input />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="gender"
            label="Jenis Kelamin"
            rules={[{ required: true, message: "Jenis kelamin wajib dipilih" }]}
          >
            <Select
              options={[
                { label: "Laki-laki", value: 1 },
                { label: "Perempuan", value: 0 },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          {/* 
            ✅ FIXED: Sesuai BE enum EmploymentStatus
              0 = Active
              1 = OnLeave
              2 = Terminated
            initialValue diubah dari 1 → 0 (Active)
          */}
          <Form.Item name="employmentStatus" label="Status Karyawan" initialValue="active">
            <Select options={[
                { label: "Aktif",      value: "active"     },
                { label: "Cuti",       value: "onleave"    },
                { label: "Terminated", value: "terminated" },
            ]} />
        </Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="left">Organisasi & Kontak</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="departmentId" label="Departemen">
            <Select
              placeholder="Pilih Departemen"
              options={deptState?.departments?.map((d: any) => ({
                label: d.name,
                value: d.id,
              }))}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="positionId" label="Jabatan">
            <Select
              placeholder="Pilih Jabatan"
              options={posState?.positions?.map((p: any) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="phone" label="Nomor Telepon">
            <Input placeholder="08xxxxxxxxxx" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="email" label="Email">
            <Input placeholder="email@example.com" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item name="address" label="Alamat">
        <Input.TextArea rows={2} placeholder="Alamat lengkap..." />
      </Form.Item>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="hireDate" label="Tanggal Bergabung">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="dateOfBirth" label="Tanggal Lahir">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="left">Informasi Bank</Divider>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item name="bankName" label="Nama Bank">
            <Input placeholder="contoh: BCA, Mandiri" />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name="bankAccountNumber" label="Nomor Rekening">
            <Input placeholder="contoh: 1234567890" />
          </Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="left">Kontak Darurat</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item name="emergencyContactName" label="Nama Kontak">
            <Input placeholder="Nama Lengkap" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="emergencyContactPhone" label="Telepon Kontak">
            <Input placeholder="08..." />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item name="emergencyContactRelationship" label="Hubungan">
            <Input placeholder="contoh: Istri, Orang Tua" />
          </Form.Item>
        </Col>
      </Row>

      <Divider titlePlacement="left">Informasi Lainnya</Divider>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item name="photoUrl" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="Foto Karyawan">
            <Upload
              name="file"
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              customRequest={customRequest}
              onChange={handleChange}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item name="notes" label="Catatan">
            <Input.TextArea rows={3} placeholder="Informasi tambahan..." />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};