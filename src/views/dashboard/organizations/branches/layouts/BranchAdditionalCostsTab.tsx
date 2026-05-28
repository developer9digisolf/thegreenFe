import React, { useState, useEffect, useCallback } from "react";
import { Typography, Button, Table, Space, Switch, Popconfirm, Modal, Form, Select, InputNumber, Tag, notification as antdNotification } from "antd";
import { Plus, Edit3, Trash2, Receipt } from "lucide-react";
import { IBranchAdditionalCost } from "@afx/interfaces/master/branch-additional-cost.iface";
import {
  GetBranchAdditionalCostsService,
  CreateBranchAdditionalCostService,
  UpdateBranchAdditionalCostService,
  DeleteBranchAdditionalCostService,
  GetMasterAdditionalCostsService
} from "@afx/services/master/branch-additional-cost.service";

interface Props {
  branchId?: number;
  isOpen: boolean;
}

export default function BranchAdditionalCostsTab({ branchId, isOpen }: Props) {
  const [data, setData] = useState<IBranchAdditionalCost[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [masterCosts, setMasterCosts] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedItem, setSelectedItem] = useState<IBranchAdditionalCost | null>(null);
  const [form] = Form.useForm();

  // Memuat data tabel Additional Cost untuk cabang ini
  const fetchData = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    try {
      const res = await GetBranchAdditionalCostsService(branchId);
      if (res.success || res.meta?.success) {
        setData(res.data?.pageData ?? res.data ?? []);
      }
    } catch (err) {
      console.error("Gagal memuat data", err);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // Memuat data master tambahan biaya (untuk dropdown pilihan)
  const fetchMasterCosts = useCallback(async () => {
    try {
      const res = await GetMasterAdditionalCostsService();
      setMasterCosts(res.data?.pageData ?? res.data ?? []);
    } catch (err) {
      console.error("Gagal memuat master additional cost", err);
    }
  }, []);

  useEffect(() => {
    if (isOpen && branchId) {
      fetchData();
      fetchMasterCosts();
    }
  }, [isOpen, branchId, fetchData, fetchMasterCosts]);

  // Handle Simpan (POST / PUT)
  const handleSave = async (values: any) => {
    try {
      const payload = {
        additionalCostId: values.additionalCostId,
        price: values.price,
        isMandatory: values.isMandatory ?? true,
        isApplicableToServices: values.isApplicableToServices ?? true,
        isApplicableToProducts: values.isApplicableToProducts ?? false,
        minimumTransactionAmount: values.minimumTransactionAmount || 0,
        maximumTransactionAmount: values.maximumTransactionAmount || null,
      };

      if (modalMode === "create") {
        const res = await CreateBranchAdditionalCostService(branchId!, payload);
        if (res.success || res.meta?.success) antdNotification.success({ message: "Biaya tambahan berhasil ditambahkan" });
      } else if (selectedItem) {
        const res = await UpdateBranchAdditionalCostService(selectedItem.id, branchId!, payload);
        if (res.success || res.meta?.success) antdNotification.success({ message: "Biaya tambahan berhasil diperbarui" });
      }
      
      setIsModalOpen(false);
      form.resetFields();
      fetchData();
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menyimpan data" });
    }
  };

  // Handle Edit (Buka Modal dengan Data yang ada)
  const handleEdit = (record: IBranchAdditionalCost) => {
    setSelectedItem(record);
    setModalMode("update");
    form.setFieldsValue({
      additionalCostId: record.additionalCostId,
      price: record.price,
      isMandatory: record.isMandatory,
      isApplicableToServices: record.isApplicableToServices,
      isApplicableToProducts: record.isApplicableToProducts,
      minimumTransactionAmount: record.minimumTransactionAmount,
      maximumTransactionAmount: record.maximumTransactionAmount,
    });
    setIsModalOpen(true);
  };

  // Handle Hapus
  const handleDelete = async (id: number) => {
    try {
      const res = await DeleteBranchAdditionalCostService(id, branchId!);
      if (res.success || res.meta?.success) {
        antdNotification.success({ message: "Berhasil menghapus biaya tambahan" });
        fetchData();
      }
    } catch (err: any) {
      antdNotification.error({ message: err?.message || "Gagal menghapus data" });
    }
  };

  // Saat user memilih Master Biaya di dropdown, otomatis isi harga defaultnya
  const handleMasterCostChange = (id: number) => {
    const selectedMaster = masterCosts.find(c => c.id === id);
    if (selectedMaster) {
      form.setFieldsValue({ price: selectedMaster.defaultPrice });
    }
  };

  const formatUang = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-2">
        <div>
          <Typography.Title level={5} className="m-0">Biaya Tambahan Cabang</Typography.Title>
          <Typography.Text className="text-slate-500 text-xs">Kelola pajak, layanan, atau biaya admin khusus cabang ini</Typography.Text>
        </div>
        <Button 
          type="primary" 
          icon={<Plus size={16} />} 
          onClick={() => { setModalMode("create"); setSelectedItem(null); form.resetFields(); setIsModalOpen(true); }} 
          className="bg-emerald-500 hover:bg-emerald-600 border-none rounded-lg"
        >
          Tambah Biaya
        </Button>
      </div>

      <Table
        dataSource={data}
        loading={loading}
        rowKey="id"
        pagination={false}
        className="premium-table"
        columns={[
          {
            title: "Nama Biaya",
            key: "name",
            render: (_, record) => (
              <Space direction="vertical" size={0}>
                <Typography.Text strong>{record.additionalCost?.name}</Typography.Text>
                <Typography.Text className="text-xs text-slate-500">{record.additionalCost?.code}</Typography.Text>
              </Space>
            ),
          },
          {
            title: "Nilai",
            key: "price",
            render: (_, record) => (
              <span className="font-bold text-emerald-600">
                {record.additionalCost?.isPercentage ? `${record.price}%` : formatUang(record.price)}
              </span>
            ),
          },
          {
            title: "Tipe",
            key: "isMandatory",
            render: (_, record) => (
              record.isMandatory 
                ? <Tag color="red">Wajib (Mandatory)</Tag>
                : <Tag color="blue">Opsional</Tag>
            ),
          },
          {
            title: "Berlaku Untuk",
            key: "applicable",
            render: (_, record) => (
              <Space>
                {record.isApplicableToServices && <Tag color="purple">Layanan</Tag>}
                {record.isApplicableToProducts && <Tag color="cyan">Produk</Tag>}
              </Space>
            ),
          },
          {
            title: "Aksi",
            key: "action",
            width: 100,
            render: (_, record) => (
              <Space>
                <Button type="text" icon={<Edit3 size={16} className="text-blue-500" />} onClick={() => handleEdit(record)} />
                <Popconfirm title="Hapus biaya ini?" onConfirm={() => handleDelete(record.id)} okText="Ya, Hapus" cancelText="Batal">
                  <Button type="text" danger icon={<Trash2 size={16} />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]}
      />

      <Modal 
        title={modalMode === "create" ? "Tambah Biaya" : "Edit Biaya"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        destroyOnHidden
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} initialValues={{ isMandatory: true, isApplicableToServices: true, isApplicableToProducts: false, minimumTransactionAmount: 0 }}>
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item 
              className="col-span-2" 
              name="additionalCostId" 
              label="Pilih Master Biaya" 
              rules={[{ required: true, message: "Pilih master biaya" }]}
            >
              <Select 
                placeholder="Pilih master biaya..." 
                disabled={modalMode === "update"} // Opsional: Boleh dihapus jika ingin bisa diedit
                onChange={handleMasterCostChange} 
                className="h-10"
              >
                {masterCosts
                  .filter(c => {
                    // Jika sedang Edit, biarkan Master Biaya miliknya tetap muncul
                    if (modalMode === "update") return true; 
                    
                    // JIKA CREATE: Sembunyikan Master Biaya yang sudah ada di tabel cabang
                    return !data.some(existingItem => existingItem.additionalCostId === c.id);
                  })
                  .map((c) => (
                    <Select.Option key={c.id} value={c.id}>
                      {c.name} ({c.isPercentage ? 'Persen %' : 'Nominal Rp'})
                    </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="price" label="Nilai (Harga / Persen)" rules={[{ required: true, message: "Wajib diisi" }]}>
              <InputNumber className="w-full h-10" min={0} />
            </Form.Item>

            <Form.Item name="minimumTransactionAmount" label="Min. Transaksi (Rp)">
              <InputNumber className="w-full h-10" min={0} />
            </Form.Item>

            <Form.Item name="maximumTransactionAmount" label="Maks. Transaksi (Rp) - Opsional">
              <InputNumber className="w-full h-10" min={0} />
            </Form.Item>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 grid grid-cols-2 gap-4">
             <Form.Item name="isMandatory" valuePropName="checked" label="Wajib Dikenakan?" className="mb-0">
              <Switch />
            </Form.Item>
            <Form.Item name="isApplicableToServices" valuePropName="checked" label="Berlaku u/ Layanan?" className="mb-0">
              <Switch />
            </Form.Item>
            <Form.Item name="isApplicableToProducts" valuePropName="checked" label="Berlaku u/ Produk?" className="mb-0">
              <Switch />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button type="primary" htmlType="submit" className="bg-emerald-500 hover:bg-emerald-600 border-none">Simpan Data</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}