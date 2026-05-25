"use client";

import { Modal, Form, Input, Select, DatePicker, Row, Col, Divider, Upload, message, Button } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined, SyncOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { IPropsFormEmployee } from "@afx/interfaces/master/employee.iface";
import { useStore } from "@afx/store/core";
import { EmployeeFormContent } from "./form-content.layout";

export const FormEmployee = ({
  formType,
  forms,
  open,
  onCancel,
  setFormType,
  handleSubmit,
}: IPropsFormEmployee) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const { state: employeeStore } = useStore<any, any>("employees");
  const { state: deptState }     = useStore<any, any>("departments");
  const { state: posState }      = useStore<any, any>("positions");

  useEffect(() => {
    if (formType === "update" || formType === "detail") {
      const data = employeeStore?.employee;
      if (data) {
        forms.setFieldsValue({
          ...data,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          hireDate:    data.hireDate    ? dayjs(data.hireDate)    : null,
          // Pastikan nilai enum dari BE (0/1/2) langsung dipakai tanpa transformasi
          employmentStatus: data.employmentStatus ?? 0,
        });
        setImageUrl(data.photoUrl || "");
      }
    } else {
      // CREATE — reset dan set default employmentStatus = 0 (Active)
      forms.resetFields();
      forms.setFieldsValue({
          employmentStatus: "active",
          gender: 1,
      });
      setImageUrl("");
    }
  }, [formType, employeeStore?.employee, open]);

  const handleChange = (info: any) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      const url = info.file.response?.data?.url || info.file.url || "";
      setImageUrl(url);
      forms.setFieldValue("photoUrl", url);
      setLoading(false);
    }
    if (info.file.status === "error") {
      setLoading(false);
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const customRequest = ({ file, onSuccess }: any) => {
    setLoading(true);
    setTimeout(() => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setLoading(false);
        onSuccess({ data: { url: reader.result } });
      };
    }, 1000);
  };

  const isDetail = formType === "detail";
  const isUpdate = formType === "update";
  const isCreate = formType === "create";

  return (
    <Modal
      title={
        isCreate ? "Tambah Karyawan Baru"
        : isUpdate ? "Ubah Karyawan"
        : "Detail Karyawan"
      }
      open={open}
      onCancel={onCancel}
      onOk={isDetail ? () => setFormType("update") : handleSubmit}
      width={800}
      okText={
        isCreate ? "Simpan Karyawan"
        : isUpdate ? "Simpan Perubahan"
        : "Ubah Informasi"
      }
      okButtonProps={{
        style: {
          background:   isDetail ? "#3b82f6" : "#10b981",
          borderColor:  isDetail ? "#3b82f6" : "#10b981",
        },
      }}
      cancelText="Tutup"
      destroyOnHidden
      footer={[
        <div
          key="footer-container"
          className="flex items-center justify-between w-full px-1"
        >
          <div>
            {isDetail && (
              <Button
                className="rounded-xl border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-400 font-bold"
                icon={<SyncOutlined />}
                onClick={() => {
                  router.push(
                    `/dashboard/organizations/employees/recurring-shifts?employeeId=${employeeStore?.employee?.id}`,
                  );
                }}
              >
                Kelola Jadwal Rutin
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              className="rounded-xl font-bold h-10 px-6"
              onClick={onCancel}
            >
              Tutup
            </Button>
            <Button
              type="primary"
              className="rounded-xl font-bold h-10 px-6 border-none"
              style={{ background: isDetail ? "#3b82f6" : "#10b981" }}
              onClick={isDetail ? () => setFormType("update") : handleSubmit}
            >
              {isCreate
                ? "Simpan Karyawan"
                : isUpdate
                  ? "Simpan Perubahan"
                  : "Ubah Informasi"}
            </Button>
          </div>
        </div>,
      ]}
    >
      <EmployeeFormContent form={forms} formType={formType} />
    </Modal>
  );
};