"use client";

import { Modal, Form, Input, Select, DatePicker, Row, Col, Divider } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import { IPropsFormEmployee } from "@afx/interfaces/master/employee.iface";
import { useStore } from "@afx/store/core";

export const FormEmployee = ({
  formType,
  forms,
  open,
  onCancel,
  handleSubmit,
}: IPropsFormEmployee) => {
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
      }
    } else {
      forms.resetFields();
    }
  }, [formType, employeeStore?.employee]);

  return (
    <Modal
      title={formType === "create" ? "Add New Employee" : "Employee Details"}
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={800}
      okText={formType === "create" ? "Save" : "Update"}
      cancelText="Cancel"
      destroyOnHidden
    >
      <Form form={forms} layout="vertical" disabled={formType === "detail"}>
        <Divider orientation="left">Main Information</Divider>
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

        <Divider orientation="left">Organization & Contact</Divider>
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

        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={2} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
