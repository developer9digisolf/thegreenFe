"use client";

import { useStore } from "@afx/store/core";
import { useState, useEffect } from "react";
import { 
  Typography, 
  Button, 
  Calendar, 
  Badge, 
  Card, 
  Tag, 
  Select, 
  Avatar, 
  Space,
  Row,
  Col,
  Tooltip,
  Modal,
  Form,
  Input,
  InputNumber,
  TimePicker,
  Spin,
  Table,
  DatePicker,
  Upload,
  message
} from "antd";
import { 
  PlusOutlined, 
  CalendarOutlined, 
  UserOutlined, 
  FilterOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  ImportOutlined,
  InboxOutlined,
  DownloadOutlined,
  SyncOutlined,
  GlobalOutlined,
  EditOutlined,
  DeleteOutlined,
  WarningOutlined
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { useSearchParams } from "next/navigation";
import { IActionEmployeeShift, IStateEmployeeShift } from "@afx/models/dashboard/master/employee-shifts.model";
import { IActionEmployee, IStateEmployee } from "@afx/models/dashboard/master/employees.model";

const { Title, Text } = Typography;

export default function OneTimeShiftsView() {
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

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [importErrors, setImportErrors] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  
  const searchParams = useSearchParams();
  const employeeIdParam = searchParams.get("employeeId");

  useEffect(() => {
    useEmployeeActions<"getEmployees">("getEmployees", [{ page: 1, pageSize: 100 }], true);
    if (employeeIdParam) {
      setSelectedEmployeeId(Number(employeeIdParam));
    }
  }, [employeeIdParam]);

  useEffect(() => {
    getShifts();
  }, [selectedEmployeeId]);

  const getShifts = () => {
    const params: any = {
      page: 1,
      pageSize: 50,
      sortColumn: "createdat",
      sortDirection: "desc"
    };
    if (selectedEmployeeId) {
      params.EmployeeId = selectedEmployeeId;
    }
    useShiftActions<"getOneTimeShifts">("getOneTimeShifts", [params], true);
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = shiftState.oneTimeShifts.filter(item => dayjs(item.date).format('YYYY-MM-DD') === value.format('YYYY-MM-DD'));
    return (
      <ul className="list-none p-0 m-0 overflow-hidden">
        {listData.map((item: any) => (
          <li key={item.id} className="mb-1">
            <Badge 
              status="success" 
              text={<span className="text-[10px] text-slate-500">Emp #{item.employeeId}</span>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  const currentShifts = shiftState.oneTimeShifts.filter(item => dayjs(item.date).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD'));

  const handleCreate = (values: any) => {
    const payload = {
      employeeId: values.employeeId,
      date: values.date ? dayjs(values.date).format('YYYY-MM-DD') : selectedDate.format('YYYY-MM-DD'),
      startTime: values.startTime ? dayjs(values.startTime).format("HH:mm") : "08:00",
      endTime: values.endTime ? dayjs(values.endTime).format("HH:mm") : "17:00",
      breakMinutes: values.breakMinutes || 0
    };

    if (editingId) {
      useShiftActions<"updateOneTimeShift">("updateOneTimeShift", [editingId, payload, (code) => {
        const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
        if (isSuccess) {
          setIsModalOpen(false);
          setEditingId(null);
          form.resetFields();
          getShifts();
        }
      }], true);
    } else {
      useShiftActions<"createOneTimeShift">("createOneTimeShift", [payload, (code) => {
        const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
        if (isSuccess) {
          setIsModalOpen(false);
          form.resetFields();
          getShifts();
        }
      }], true);
    }
  };

  const handleDelete = (id: number) => {
    useShiftActions<"deleteOneTimeShift">("deleteOneTimeShift", [id, (code) => {
      const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
      if (isSuccess) {
        getShifts();
      }
    }], true);
  };

  const handleImport = (file: File) => {
    const formData = new FormData();
    formData.append("File", file);

    useShiftActions<"importOneTimeShifts">("importOneTimeShifts", [formData, (res) => {
      const isSuccess = res?.meta?.code === 20000;
      if (isSuccess) {
        if (res?.data?.errors && res.data.errors.length > 0) {
          setImportErrors(res.data.errors);
          setIsErrorModalOpen(true);
        }
        setIsImportModalOpen(false);
        getShifts();
      }
    }], true);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => <Text className="font-bold">{dayjs(date).format('DD MMM YYYY')}</Text>
    },
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (id: number) => {
        const emp = employeeState.employees.find(e => e.id === id);
        return (
          <Space>
            <Avatar size="small" icon={<UserOutlined />} className="bg-emerald-500" />
            <Text className="font-medium text-slate-700">{emp?.fullName || `Employee #${id}`}</Text>
          </Space>
        );
      }
    },
    {
      title: "Shift Time",
      key: "time",
      render: (_: any, record: any) => (
        <Tag className="rounded-xl border-emerald-100 bg-emerald-50 text-emerald-700 font-bold px-3">
          {record.startTime} - {record.endTime}
        </Tag>
      )
    },
    {
      title: "Break",
      dataIndex: "breakMinutes",
      key: "breakMinutes",
      render: (min: number) => <Text className="text-slate-500 font-medium">{min} mins</Text>
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      align: 'center' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined className="text-emerald-600" />} 
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date),
                startTime: dayjs(`2024-01-01 ${record.startTime}`),
                endTime: dayjs(`2024-01-01 ${record.endTime}`)
              });
              setIsModalOpen(true);
            }}
            className="hover:bg-emerald-50 rounded-lg"
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
            className="hover:bg-red-50 rounded-lg"
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
            One-Time Shifts
          </Title>
          <Text className="text-slate-400 font-medium italic">
            Assign specific shifts for individual dates to employees
          </Text>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Select Employee to Filter</Text>
            <Select 
              placeholder="Choose employee..." 
              allowClear
              className="w-64 premium-select-header"
              onChange={setSelectedEmployeeId}
              value={selectedEmployeeId}
              loading={isLoadingEmployee("getEmployees")}
              options={employeeState.employees.map(emp => ({
                value: emp.id,
                label: emp.fullName || emp.nickname || `Employee #${emp.id}`
              }))}
            />
          </div>
          <div className="flex gap-3 pt-5">
            <Button 
              icon={<SyncOutlined />} 
              onClick={getShifts}
              className="flex items-center gap-2 h-11 px-5 rounded-xl border-slate-200 hover:border-emerald-400 hover:text-emerald-500 font-semibold"
            >
              Refresh
            </Button>
            <Button 
              icon={<ImportOutlined />} 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 h-11 px-5 rounded-xl border-slate-200 hover:border-emerald-400 hover:text-emerald-500 font-semibold"
            >
              Import
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              className="flex items-center gap-2 h-11 px-6 rounded-xl bg-emerald-600 border-none font-bold shadow-lg shadow-emerald-200"
              onClick={() => {
                setEditingId(null);
                form.setFieldsValue({ employeeId: selectedEmployeeId, date: dayjs() });
                setIsModalOpen(true);
              }}
            >
              Assign Shift
            </Button>
          </div>
        </div>
      </div>

      <Card 
        className="rounded-[2rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden bg-white/80 backdrop-blur-sm"
        styles={{ body: { padding: 0 } }}
      >
        <Spin spinning={isLoadingShift("getOneTimeShifts")}>
          <Table 
            columns={columns} 
            dataSource={shiftState.oneTimeShifts} 
            pagination={{
              pageSize: 10,
              className: "p-4"
            }}
            className="premium-table"
            rowKey="id"
          />
        </Spin>
      </Card>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <ImportOutlined />
            </div>
            <span className="font-bold">Import One-Time Shifts</span>
          </div>
        }
        open={isImportModalOpen}
        onCancel={() => setIsImportModalOpen(false)}
        footer={null}
        width={540}
        centered
        className="premium-modal"
      >
        <div className="mt-6">
          <Upload.Dragger
            name="File"
            multiple={false}
            showUploadList={true}
            beforeUpload={(file) => {
              handleImport(file);
              return false;
            }}
            className="p-6 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 text-center mb-6 group hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <InboxOutlined className="text-3xl text-slate-300 group-hover:text-emerald-500" />
            </div>
            <Title level={5} className="mb-1">Click or drag file to this area to upload</Title>
            <Text className="text-slate-400 text-xs">Support for .xlsx, .xls or .csv files (Max. 5MB)</Text>
          </Upload.Dragger>

          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mb-6">
            <div className="flex gap-3">
              <InfoCircleOutlined className="text-amber-500 mt-1" />
              <div>
                <Text className="block font-bold text-amber-800 text-sm">Download Template</Text>
                <Text className="text-amber-700/70 text-xs">Please use our standard template to ensure data compatibility.</Text>
                <Button 
                  type="link" 
                  icon={<DownloadOutlined />} 
                  className="p-0 h-auto text-amber-600 font-bold text-xs mt-2 hover:text-amber-700"
                >
                  Download Template.xlsx
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button size="large" className="rounded-xl px-6 border-slate-200 font-bold h-12" onClick={() => setIsImportModalOpen(false)}>Cancel</Button>
            <Button size="large" type="primary" className="rounded-xl px-8 bg-emerald-600 border-none font-bold h-12 shadow-lg shadow-emerald-200">Start Import</Button>
          </div>
        </div>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <PlusOutlined />
            </div>
            <span className="font-bold">{editingId ? 'Edit One-Time Shift' : 'Assign One-Time Shift'}</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingId(null);
          form.resetFields();
        }}
        footer={null}
        width={500}
        centered
        className="premium-modal"
      >
        <Form layout="vertical" form={form} onFinish={handleCreate} className="mt-6">
          <Form.Item name="employeeId" label="Select Employee" required rules={[{ required: true }]}>
            <Select 
              placeholder="Search employee..." 
              showSearch 
              className="premium-select"
              loading={isLoadingEmployee("getEmployees")}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={employeeState.employees.map(emp => ({
                value: emp.id,
                label: emp.fullName || emp.nickname || `Employee #${emp.id}`
              }))}
            />
          </Form.Item>
          
          <Form.Item name="date" label="Select Date" required rules={[{ required: true }]}>
            <DatePicker className="w-full premium-datepicker" format="DD MMMM YYYY" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startTime" label="Start Time" required rules={[{ required: true }]}>
                <TimePicker format="HH:mm" className="w-full premium-timepicker" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endTime" label="End Time" required rules={[{ required: true }]}>
                <TimePicker format="HH:mm" className="w-full premium-timepicker" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item name="breakMinutes" label="Break Minutes" initialValue={60}>
            <InputNumber min={0} className="w-full premium-input-number" />
          </Form.Item>

          <div className="flex justify-end gap-3 pt-4">
            <Button size="large" className="rounded-xl px-6 border-slate-200 font-bold h-12" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button size="large" type="primary" htmlType="submit" loading={isLoadingShift("createOneTimeShift")} className="rounded-xl px-8 bg-emerald-600 border-none font-bold h-12 shadow-lg shadow-emerald-200">Assign Shift</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
              <InfoCircleOutlined />
            </div>
            <span className="font-bold text-red-600">Import Issues Detected</span>
          </div>
        }
        open={isErrorModalOpen}
        onCancel={() => setIsErrorModalOpen(false)}
        footer={[
          <Button key="close" type="primary" className="bg-slate-800 border-none rounded-xl px-8 h-11 font-bold" onClick={() => setIsErrorModalOpen(false)}>
            Got it
          </Button>
        ]}
        width={600}
        centered
        className="premium-modal"
      >
        <div className="mt-4">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 flex gap-3">
             <WarningOutlined className="text-red-500 mt-1" />
             <Text className="text-red-800 text-sm font-medium">
               Some records could not be imported. Please review the errors below and fix them in your file.
             </Text>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {importErrors.map((err, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-red-200 transition-all duration-300">
                <div className="flex items-start justify-between mb-2">
                  <Tag className="bg-slate-200 border-none text-slate-600 font-bold rounded-lg px-2">
                    Row #{err.rowNumber}
                  </Tag>
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{err.employeeCode}</Text>
                </div>
                <Text className="text-red-600 font-bold block leading-relaxed">{err.errorMessage}</Text>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .custom-calendar-modern .ant-picker-calendar-header {
          padding: 0 0 16px 0;
        }
        .custom-calendar-modern .ant-picker-cell-inner {
          border-radius: 12px !important;
          transition: all 0.3s ease;
        }
        .custom-calendar-modern .ant-picker-calendar-date-value {
          font-weight: 800;
          color: #64748b;
        }
        .custom-calendar-modern .ant-picker-cell-selected .ant-picker-cell-inner {
          background: #10b981 !important;
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        }
        .custom-calendar-modern .ant-picker-cell-selected .ant-picker-calendar-date-value {
          color: white !important;
        }
        .premium-select .ant-select-selector, .premium-textarea, .premium-datepicker {
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          padding: 4px 8px !important;
          transition: all 0.3s ease !important;
        }
        .premium-select .ant-select-selector:hover, .premium-textarea:hover, .premium-datepicker:hover {
          border-color: #e2e8f0 !important;
        }
        .premium-select.ant-select-focused .ant-select-selector, .premium-textarea:focus, .premium-timepicker:focus, .premium-input-number:focus, .premium-datepicker:focus {
          border-color: #10b981 !important;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1) !important;
        }
        .premium-timepicker, .premium-input-number {
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          padding: 4px 8px !important;
        }
        .premium-select-header .ant-select-selector {
          border-radius: 12px !important;
          border: 2px solid #f1f5f9 !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
        }
        .premium-table .ant-table-thead > tr > th {
          background: #f8fafc !important;
          color: #64748b !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          font-size: 10px !important;
          letter-spacing: 0.1em !important;
          border-bottom: 2px solid #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
}
