"use client";

import { useStore } from "@afx/store/core";
import { Tabs, Card, Typography, Button, Space, Breadcrumb, Form, notification, Spin } from "antd";
import { useEffect, useState } from "react";
import { 
    ArrowLeftOutlined, 
    UserOutlined, 
    CalendarOutlined, 
    SyncOutlined,
    SaveOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { EmployeeFormContent } from "./layouts/form-content.layout";
import OneTimeShiftsView from "./one-time-shifts/main.layout";
import RecurringShiftsView from "./recurring-shifts/main.layout";
import { IStateEmployee, IActionEmployee } from "@afx/models/dashboard/master/employees.model";

const { Title, Text } = Typography;

interface EmployeeDetailViewProps {
    id: number;
}

export default function EmployeeDetailView({ id }: EmployeeDetailViewProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("profile");
    const [form] = Form.useForm();
    const [isSaving, setIsSaving] = useState(false);

    const {
        state: employeeState,
        useActions: useEmployeeActions,
        isLoading: isEmployeeLoading
    } = useStore<IStateEmployee, IActionEmployee>("employees");

    const { useActions: useDeptActions } = useStore<any, any>("departments");
    const { useActions: usePosActions } = useStore<any, any>("positions");

    useEffect(() => {
        if (id) {
            useEmployeeActions<"getEmployee">("getEmployee", [id], true);
            useDeptActions<any>("getDepartments", [{}], true);
            usePosActions<any>("getPositions", [{}], true);
        }
    }, [id]);

    const getPathFromUrl = (url: string) => {
        const cdnBase = "https://sin1.contabostorage.com/30e3a2fafcfd4aa0a6af34e9ca6f9492:thegreen-cdn/";
        if (url && typeof url === 'string' && url.startsWith(cdnBase)) {
            return url.replace(cdnBase, "");
        }
        return url;
    };

    const handleSaveProfile = async () => {
        try {
            const values = await form.validateFields();
            setIsSaving(true);
            
            const payload = {
                ...values,
                photoUrl: values.photoUrl ? getPathFromUrl(values.photoUrl) : values.photoUrl,
                dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
                hireDate: values.hireDate ? values.hireDate.format("YYYY-MM-DD") : null,
            };

            useEmployeeActions<"updateEmployee">("updateEmployee", [id, payload, (code: any) => {
                const isSuccess = !code || String(code) === '20000' || String(code).startsWith('2');
                if (isSuccess) {
                    useEmployeeActions<"getEmployee">("getEmployee", [id], true);
                }
                setIsSaving(false);
            }], true);
        } catch (err) {
            console.error(err);
        }
    };

    const employee = employeeState?.employee;

    const items = [
        {
            key: "profile",
            label: (
                <span className="flex items-center gap-2">
                    <UserOutlined /> Profil
                </span>
            ),
            children: (
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <Title level={4} className="!m-0">Informasi Pribadi</Title>
                        <Button 
                            type="primary" 
                            icon={<SaveOutlined />} 
                            onClick={handleSaveProfile}
                            loading={isSaving}
                            className="bg-emerald-600 border-none rounded-xl font-bold h-10 px-6"
                        >
                            Simpan Perubahan
                        </Button>
                    </div>
                    <EmployeeFormContent form={form} formType="update" />
                </div>
            )
        },
        {
            key: "one-time",
            label: (
                <span className="flex items-center gap-2">
                    <CalendarOutlined /> Shift Sekali
                </span>
            ),
            children: <OneTimeShiftsView employeeId={id} />
        },
        {
            key: "recurring",
            label: (
                <span className="flex items-center gap-2">
                    <SyncOutlined /> Jadwal Rutin
                </span>
            ),
            children: <RecurringShiftsView employeeId={id} />
        }
    ];

    return (
        <div className="p-6 lg:p-8 min-h-screen bg-slate-50/50">
            <div className="mb-8">
                <Breadcrumb 
                    className="mb-4"
                    items={[
                        { 
                            title: 'Karyawan', 
                            className: 'cursor-pointer',
                            onClick: () => router.push("/dashboard/organizations/employees") 
                        },
                        { title: 'Detail Karyawan' }
                    ]}
                />
                
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => router.push("/dashboard/organizations/employees")}
                            className="rounded-xl h-12 w-12 flex items-center justify-center border-none shadow-sm"
                        />
                        <div>
                            <Title level={2} className="!m-0 text-slate-800 font-extrabold tracking-tight">
                                {employee?.fullName || "Memuat..."}
                            </Title>
                            <Text className="text-slate-400 font-medium uppercase tracking-widest text-[10px]">
                                {employee?.employeeCode || "---"} • {employee?.nickname || "Tanpa Nama Panggilan"}
                            </Text>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] overflow-hidden">
                <Spin spinning={isEmployeeLoading("getEmployee")}>
                    <Tabs 
                        activeKey={activeTab} 
                        onChange={setActiveTab}
                        items={items}
                        className="custom-tabs"
                        size="large"
                        tabBarStyle={{ padding: '0 24px', marginBottom: 0 }}
                    />
                </Spin>
            </Card>

            <style jsx global>{`
                .custom-tabs .ant-tabs-nav::before {
                    border-bottom: 1px solid #f1f5f9;
                }
                .custom-tabs .ant-tabs-tab {
                    padding: 16px 8px !important;
                    font-weight: 600 !important;
                    color: #94a3b8 !important;
                }
                .custom-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
                    color: #10b981 !important;
                }
                .custom-tabs .ant-tabs-ink-bar {
                    background: #10b981 !important;
                    height: 3px !important;
                }
            `}</style>
        </div>
    );
}
