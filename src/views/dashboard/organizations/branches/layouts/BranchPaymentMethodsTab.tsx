import React, { useState, useEffect, useCallback } from "react";
import { Typography, Button, Table, Space, Switch, Popconfirm, Modal, Form, Select, Input, notification as antdNotification } from "antd";
import { Plus, CreditCard, Edit3, Trash2 } from "lucide-react";
import { IBranchPaymentMethod } from "@afx/interfaces/master/branch-payment-method.iface";
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

interface Props {
  branchId?: number;
  isOpen: boolean;
}

export default function BranchPaymentMethodsTab({ branchId, isOpen }: Props) {
  const [branchPaymentMethods, setBranchPaymentMethods] = useState<IBranchPaymentMethod[]>([]);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState<boolean>(false);
  const [allPaymentMethods, setAllPaymentMethods] = useState<any[]>([]);
  const [isModalPMOpen, setIsModalPMOpen] = useState<boolean>(false);
  const [modalPMMode, setModalPMMode] = useState<"create" | "update">("create");
  const [selectedBPM, setSelectedBPM] = useState<IBranchPaymentMethod | null>(null);
  const [addPMForm] = Form.useForm();

  const fetchBranchPaymentMethods = useCallback(async () => {
    if (branchId) {
      setLoadingPaymentMethods(true);
      try {
        const res = await GetBranchPaymentMethodsService(branchId);
        if (res.success) setBranchPaymentMethods(res.data);
      } catch (err) {
        console.error("Failed to fetch branch payment methods", err);
      } finally {
        setLoadingPaymentMethods(false);
      }
    }
  }, [branchId]);

  const fetchAllPaymentMethods = useCallback(async () => {
    try {
      const res = await GetGroupedPaymentMethodsService();
      let groups = res?.groups ?? (Array.isArray(res) ? res : []);
      if (groups.length > 0) {
        setAllPaymentMethods(groups.flatMap((group: any) => group.paymentMethods || []));
      } else {
        const activeRes = await GetActivePaymentMethodsService();
        setAllPaymentMethods(Array.isArray(activeRes) ? activeRes : (activeRes?.data ?? []));
      }
    } catch (err) {
      console.error("Failed to fetch all payment methods", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && branchId) {
      fetchBranchPaymentMethods();
      fetchAllPaymentMethods();
    }
  }, [isOpen, branchId, fetchBranchPaymentMethods, fetchAllPaymentMethods]);

  const handleSavePM = async (values: any) => {
    try {
      if (modalPMMode === "create") {
        const res = await CreateBranchPaymentMethodService({
          branchId: branchId!,
          paymentMethodId: values.paymentMethodId,
          sortOrder: values.sortOrder || 0,
          notes: values.notes || null,
        });
        if (res.success) antdNotification.success({ message: "Berhasil menambahkan metode pembayaran" });
      } else if (selectedBPM) {
        const res = await UpdateBranchPaymentMethodService(selectedBPM.id, {
          sortOrder: values.sortOrder,
          notes: values.notes,
        });
        if (res.success) antdNotification.success({ message: "Berhasil memperbarui metode pembayaran" });
      }
      setIsModalPMOpen(false);
      addPMForm.resetFields();
      fetchBranchPaymentMethods();
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menyimpan metode pembayaran" });
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
        antdNotification.success({ message: "Berhasil menghapus metode pembayaran" });
        fetchBranchPaymentMethods();
      }
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menghapus metode pembayaran" });
    }
  };

  const handleTogglePM = async (id: number) => {
    try {
      const res = await ToggleBranchPaymentMethodStatusService(id);
      if (res.success) fetchBranchPaymentMethods();
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal mengubah status" });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Typography.Title level={5} className="m-0">Metode Pembayaran Cabang</Typography.Title>
          <Typography.Text className="text-slate-500 text-xs">Kelola metode pembayaran yang tersedia untuk cabang ini</Typography.Text>
        </div>
        <Button type="primary" icon={<Plus size={16} />} onClick={() => { setModalPMMode("create"); setSelectedBPM(null); addPMForm.resetFields(); setIsModalPMOpen(true); }} className="bg-emerald-500 hover:bg-emerald-600 border-none rounded-lg">
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
                  <img src={record.imageUrl} alt={text} className="w-8 h-8 object-contain rounded border border-slate-100" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-slate-400"><CreditCard size={16} /></div>
                )}
                <Typography.Text strong>{text}</Typography.Text>
              </Space>
            ),
          },
          {
            title: "Catatan",
            dataIndex: "notes",
            key: "notes",
            render: (text) => <Typography.Text className="text-xs text-slate-500">{text || "-"}</Typography.Text>,
          },
          { title: "Urutan", dataIndex: "sortOrder", key: "sortOrder", width: 80, align: "center" },
          {
            title: "Status",
            dataIndex: "isActive",
            key: "isActive",
            render: (active, record) => <Switch size="small" checked={active} onChange={() => handleTogglePM(record.id)} />,
          },
          {
            title: "Aksi",
            key: "action",
            width: 100,
            render: (_, record) => (
              <Space>
                <Button type="text" icon={<Edit3 size={16} className="text-blue-500" />} onClick={() => handleEditPM(record)} />
                <Popconfirm title="Hapus metode pembayaran?" description="Aksi ini tidak dapat dibatalkan." onConfirm={() => handleDeletePM(record.id)} okText="Ya, Hapus" cancelText="Batal">
                  <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal title={modalPMMode === "create" ? "Tambah Metode Pembayaran" : "Edit Metode Pembayaran"} open={isModalPMOpen} onCancel={() => setIsModalPMOpen(false)} footer={null} destroyOnHidden>
        <Form form={addPMForm} layout="vertical" onFinish={handleSavePM}>
          <Form.Item name="paymentMethodId" label="Pilih Metode Pembayaran" rules={[{ required: true, message: "Pilih metode pembayaran" }]}>
            <Select placeholder="Pilih metode" disabled={modalPMMode === "update"} loading={allPaymentMethods.length === 0}>
              {allPaymentMethods
                .filter((pm) => {
                  if (modalPMMode === "update") return Number(pm.id) === Number(selectedBPM?.paymentMethodId);
                  return !branchPaymentMethods.find((bpm) => Number(bpm.paymentMethodId) === Number(pm.id));
                })
                .map((pm) => (
                  <Select.Option key={pm.id} value={pm.id}>
                    <Space>
                      {pm.imageUrl ? (
                        <img src={pm.imageUrl} alt={pm.name} className="w-5 h-5 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center text-slate-400"><CreditCard size={12} /></div>
                      )}
                      {pm.name}
                    </Space>
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item name="sortOrder" label="Urutan Sortir" initialValue={0}><Input type="number" /></Form.Item>
          <Form.Item name="notes" label="Catatan Internal"><Input.TextArea placeholder="Contoh: Metode pembayaran utama..." /></Form.Item>
          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={() => setIsModalPMOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" className="bg-emerald-500 hover:bg-emerald-600 border-none">Simpan</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}