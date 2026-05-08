"use client";

import { useStore } from "@afx/store/core";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Typography, 
  Button, 
  Card, 
  Table, 
  Tag, 
  Avatar, 
  Space,
  Select,
  Row,
  Col,
  Tooltip,
  Modal,
  Form,
  Switch,
  TimePicker,
  Input,
  Spin
} from "antd";
import { 
  PlusOutlined, 
  SyncOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  CalendarOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { IActionEmployeeShift, IStateEmployeeShift } from "@afx/models/dashboard/master/employee-shifts.model";
import { IActionEmployee, IStateEmployee } from "@afx/models/dashboard/master/employees.model";
import { IActionShift, IStateShift } from "@afx/models/dashboard/master/shifts.model";

const { Title, Text } = Typography;

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

interface RecurringShiftsViewProps {
  employeeId?: number;
}

export default function RecurringShiftsView({ employeeId }: RecurringShiftsViewProps) {
  const {
    useActions: useShiftActions,
    state: shiftState,
    isLoading: isLoadingShift
  } = useStore<IStateEmployeeShift, IActionEmployeeShift>("employeeShifts");

  const {
    useActions: useEmployeeActions,
    state: employeeState,
    isLoading: isLoadingEmployee
  } = useStore<IStateEmployee, IActionEmployee>("employees");

  const {
    useActions: useMasterShiftActions,
    state: masterShiftState,
    isLoading: isLoadingMasterShift
  } = useStore<IStateShift, IActionShift>("shifts");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(employeeId || null);
  const [form] = Form.useForm();
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams.get("employeeId");

  useEffect(() => {
    useEmployeeActions<"getEmployees">("getEmployees", [{ page: 1, pageSize: 100 }], true);
    useMasterShiftActions<"getShifts">("getShifts", [{ page: 1, pageSize: 100 }], true);
    
    if (employeeId) {
      setSelectedEmployeeId(employeeId);
    } else if (employeeIdParam) {
      setSelectedEmployeeId(Number(employeeIdParam));
    }
  }, [employeeId, employeeIdParam]);

  useEffect(() => {
    if (selectedEmployeeId) {
      useShiftActions<"getRecurringShifts">("getRecurringShifts", [selectedEmployeeId], true);
    }
  }, [selectedEmployeeId]);

  const handleCreate = (values: any) => {
    useShiftActions<"createRecurringShift">("createRecurringShift", [values, (code) => {
      const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
      if (isSuccess) {
        setIsModalOpen(false);
        form.resetFields();
        if (selectedEmployeeId) {
          useShiftActions<"getRecurringShifts">("getRecurringShifts", [selectedEmployeeId], true);
        }
      }
    }], true);
  };

  const columns = [
    {
      title: "Hari",
      dataIndex: "dayOfWeek",
      key: "dayOfWeek",
      render: (day: number) => <Text className="font-bold">{days[day]}</Text>
    },
    {
      title: "Shift",
      dataIndex: "shift",
      key: "shift",
      render: (shift: any) => shift ? (
        <Tag color="emerald" className="border-none font-bold rounded-lg px-3 py-0.5">
          {shift.name} ({shift.startTime} - {shift.endTime})
        </Tag>
      ) : (
        <Tag className="border-none font-bold rounded-lg px-3 py-0.5 bg-slate-100 text-slate-400">
          LIBUR
        </Tag>
      )
    },
    {
      title: "Catatan",
      dataIndex: "notes",
      key: "notes",
      render: (notes: string) => <Text className="text-slate-400 italic text-xs">{notes || "-"}</Text>
    },
    {
      title: "Aksi",
      key: "actions",
      width: 100,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined className="text-emerald-600" />} 
            onClick={() => {
              setEditingId(record.id);
              setIsModalOpen(true);
            }}
            className="hover:bg-emerald-50 rounded-lg"
          />
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 lg:p-8 animate-in slide-in-from-bottom-4 duration-700">

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div>
          <Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">
            Jadwal Rutin
          </Title>
          <Text className="text-slate-400 font-medium italic">
            Kelola pola shift mingguan permanen untuk staf Anda
          </Text>
        </div>
        <div className="flex items-center gap-4">
          {!employeeId && (
            <div className="flex flex-col">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Karyawan untuk Dilihat</Text>
              <Select 
                placeholder="Pilih karyawan..." 
                className="w-64 premium-select-header"
                onChange={setSelectedEmployeeId}
                value={selectedEmployeeId}
                loading={isLoadingEmployee("getEmployees")}
                options={employeeState.employees.map(emp => ({
                  value: emp.id,
                  label: emp.fullName || emp.nickname || `Karyawan #${emp.id}`
                }))}
              />
            </div>
          )}
          <div className={`flex gap-3 ${!employeeId ? 'pt-5' : ''}`}>
            <Button 
              icon={<SyncOutlined />} 
              disabled={!selectedEmployeeId}
              onClick={() => selectedEmployeeId && useShiftActions<"getRecurringShifts">("getRecurringShifts", [selectedEmployeeId], true)}
              className="flex items-center gap-2 h-11 px-5 rounded-xl border-slate-200 hover:border-emerald-400 hover:text-emerald-500 font-semibold"
            >
              Perbarui
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 border-none font-bold shadow-lg shadow-emerald-200"
              onClick={() => {
                setEditingId(null);
                form.setFieldsValue({ employeeId: selectedEmployeeId });
                setIsModalOpen(true);
              }}
            >
              Buat Pola
            </Button>
          </div>
        </div>
      </div>



      <Card 
        className="rounded-[2rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden bg-white/80 backdrop-blur-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={isLoadingShift("getRecurringShifts")}>
          <Table 
            columns={columns} 
            dataSource={shiftState.recurringShifts} 
            pagination={false}
            className="premium-table"
            rowKey="id"
          />
        </Spin>
      </Card>



      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <SyncOutlined />
            </div>
            <span className="font-bold">{editingId ? 'Ubah Pola' : 'Pola Rutin Baru'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={500}
        centered
        className="premium-modal"
      >
        <Form layout="vertical" form={form} onFinish={handleCreate} className="mt-6">
          {employeeId ? (
            <Form.Item name="employeeId" hidden initialValue={employeeId}>
              <Input />
            </Form.Item>
          ) : (
            <Form.Item name="employeeId" label="Pilih Karyawan" required rules={[{ required: true }]}>
              <Select 
                placeholder="Cari karyawan..." 
                showSearch 
                className="premium-select"
                loading={isLoadingEmployee("getEmployees")}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={employeeState.employees.map(emp => ({
                  value: emp.id,
                  label: emp.fullName || emp.nickname || `Karyawan #${emp.id}`
                }))}
              />
            </Form.Item>
          )}
          
          <Form.Item name="dayOfWeek" label="Hari dalam Seminggu" required rules={[{ required: true }]}>
            <Select placeholder="Pilih hari..." className="premium-select">
                {days.map((day, index) => (
                    <Select.Option key={index} value={index}>{day}</Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item name="shiftId" label="Shift" required rules={[{ required: true }]}>
            <Select 
              placeholder="Pilih shift..." 
              className="premium-select"
              loading={isLoadingMasterShift("getShifts")}
              options={masterShiftState.shifts.map(s => ({
                value: s.id,
                label: `${s.name} (${s.startTime} - ${s.endTime})`
              }))}
            />
          </Form.Item>



          <div className="flex justify-end gap-3">
            <Button size="large" className="rounded-xl px-6 border-slate-200 font-bold h-12" onClick={() => setIsModalOpen(false)}>Batal</Button>
            <Button size="large" type="primary" htmlType="submit" loading={isLoadingShift("createRecurringShift")} className="rounded-xl px-8 bg-emerald-600 border-none font-bold h-12 shadow-lg shadow-emerald-200">Simpan Pola</Button>
          </div>
        </Form>
      </Modal>

      <style jsx global>{`
        .premium-select-header .ant-select-selector {
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
      `}</style>
    </div>
  );
}
