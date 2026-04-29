"use client";

import { Modal, Form, Input, Select, DatePicker, Row, Col, Divider, Upload, message, Button } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, LoadingOutlined, SyncOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { IPropsFormEmployee } from "@afx/interfaces/master/employee.iface";
import { useStore } from "@afx/store/core";

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
  const {
    state: employeeStore,
  } = useStore<any, any>("employees");

  const {
    state: deptState,
  } = useStore<any, any>("departments");

  const {
    state: posState,
  } = useStore<any, any>("positions");

  useEffect(() => {
    if (formType === "update" || formType === "detail") {
      const data = employeeStore?.employee;
      if (data) {
        forms.setFieldsValue({
          ...data,
          dateOfBirth: data.dateOfBirth ? dayjs(data.dateOfBirth) : null,
          hireDate: data.hireDate ? dayjs(data.hireDate) : null,
        });
        setImageUrl(data.photoUrl || "");
      }
    } else {
      forms.resetFields();
      setImageUrl("");
    }
  }, [formType, employeeStore?.employee, open]);

  const handleChange = (info: any) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // In a real app, you'd get the URL from the server response
      const url = info.file.response?.data?.url || info.file.url || "";
      setImageUrl(url);
      forms.setFieldValue("photoUrl", url);
      setLoading(false);
    }
    if (info.file.status === 'error') {
      setLoading(false);
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const customRequest = ({ file, onSuccess }: any) => {
    // Dummy upload simulation
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

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const isDetail = formType === "detail";
  const isUpdate = formType === "update";
  const isCreate = formType === "create";

  return (
    <Modal
      title={
        isCreate ? "Add New Employee" 
        : isUpdate ? "Edit Employee" 
        : "Employee Details"
      }
      open={open}
      onCancel={onCancel}
      onOk={isDetail ? () => setFormType("update") : handleSubmit}
      width={800}
      okText={
        isCreate ? "Save Employee" 
        : isUpdate ? "Save Changes" 
        : "Edit Information"
      }
      okButtonProps={{
        style: { 
          background: isDetail ? '#3b82f6' : '#10b981',
          borderColor: isDetail ? '#3b82f6' : '#10b981'
        }
      }}
      cancelText="Close"
      destroyOnHidden
      footer={[
        <div key="footer-container" className="flex items-center justify-between w-full px-1">
          <div>
            {isDetail && (
              <Button 
                className="rounded-xl border-emerald-200 text-emerald-600 hover:text-emerald-700 hover:border-emerald-400 font-bold"
                icon={<SyncOutlined />} 
                onClick={() => {
                  router.push(`/dashboard/organizations/employees/recurring-shifts?employeeId=${employeeStore?.employee?.id}`);
                }}
              >
                Manage Recurring Shifts
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button className="rounded-xl font-bold h-10 px-6" onClick={onCancel}>Close</Button>
            <Button 
              type="primary" 
              className="rounded-xl font-bold h-10 px-6 border-none" 
              style={{ background: isDetail ? '#3b82f6' : '#10b981' }}
              onClick={isDetail ? () => setFormType("update") : handleSubmit}
            >
              {isCreate ? "Save Employee" : isUpdate ? "Save Changes" : "Edit Information"}
            </Button>
          </div>
        </div>
      ]}
    >
      <Form form={forms} layout="vertical" disabled={formType === "detail"}>
        <Divider titlePlacement="left">Main Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="fullName"
              label="Full Name"
              rules={[{ required: true, message: "Full name is required" }]}
            >
              <Input placeholder="Enter full name" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="nickname" label="Nickname">
              <Input placeholder="Enter nickname" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="employeeCode"
              label="Employee Code"
              rules={[{ required: true, message: "Employee code is required" }]}
            >
              <Input placeholder="EMP-001" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true }]}
            >
              <Select
                options={[
                  { label: "Male", value: 1 },
                  { label: "Female", value: 0 },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="employmentStatus" label="Status" initialValue={1}>
              <Select
                options={[
                  { label: "Active", value: 1 },
                  { label: "Inactive", value: 0 },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Organization & Contact</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="departmentId" label="Department">
              <Select
                placeholder="Select Department"
                options={deptState?.departments?.map((d: any) => ({ label: d.name, value: d.id }))}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="positionId" label="Position">
              <Select
                placeholder="Select Position"
                options={posState?.positions?.map((p: any) => ({ label: p.name, value: p.id }))}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="phone" label="Phone Number">
              <Input placeholder="08xxxxxxxxxx" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input placeholder="email@example.com" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="address" label="Address">
          <Input.TextArea rows={2} placeholder="Full address..." />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="hireDate" label="Join Date">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="dateOfBirth" label="Date of Birth">
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Bank Information</Divider>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="bankName" label="Bank Name">
              <Input placeholder="e.g. BCA, Mandiri" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="bankAccountNumber" label="Account Number">
              <Input placeholder="e.g. 1234567890" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Emergency Contact</Divider>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="emergencyContactName" label="Contact Name">
              <Input placeholder="Full Name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="emergencyContactPhone" label="Contact Phone">
              <Input placeholder="08..." />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="emergencyContactRelationship" label="Relationship">
              <Input placeholder="e.g. Spouse, Parent" />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">Other Information</Divider>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="photoUrl" hidden>
              <Input />
            </Form.Item>
            <Form.Item label="Employee Photo">
              <Upload
                name="file"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={customRequest}
                onChange={handleChange}
              >
                {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
              </Upload>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={3} placeholder="Additional information..." />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
