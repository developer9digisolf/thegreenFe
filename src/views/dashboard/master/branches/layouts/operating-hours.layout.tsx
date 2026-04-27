'use client';

import React, { useEffect, useState } from "react";
import { Clock, Save, XCircle } from "lucide-react";
import { 
  Modal, 
  Spin, 
  Typography, 
  Switch, 
  TimePicker, 
  Row, 
  Col, 
  Button, 
  Card, 
  Divider,
  Empty
} from "antd";
import { useStore } from "@afx/store/core";
import { 
  IActionBranchOperatingHour, 
  IStateBranchOperatingHour 
} from "@afx/models/dashboard/master/branch-operating-hours.model";
import { IResBranchOperatingHour } from "@afx/interfaces/master/branch-operating-hours.iface";
import dayjs from "dayjs";

const { Text, Title } = Typography;

interface IProps {
  branchId: number;
  branchName: string;
  open: boolean;
  onClose: () => void;
}

export function BranchOperatingHoursModal({ branchId, branchName, open, onClose }: IProps) {
  const {
    useActions,
    state: { operatingHours },
    isLoading,
  } = useStore<IStateBranchOperatingHour, IActionBranchOperatingHour>("branchOperatingHours");

  const [localHours, setLocalHours] = useState<IResBranchOperatingHour[]>([]);

  useEffect(() => {
    if (open && branchId) {
      useActions<"getOperatingHours">("getOperatingHours", [branchId], true);
    }
  }, [open, branchId]);

  useEffect(() => {
    if (operatingHours) {
      // Sort by dayOfWeek (0 = Sunday, 1 = Monday, etc.)
      const sorted = [...operatingHours].sort((a, b) => {
        // Adjust Sunday to be last if preferred, but usually 0 is Sunday
        return a.dayOfWeek - b.dayOfWeek;
      });
      setLocalHours(sorted);
    }
  }, [operatingHours]);

  const handleUpdate = (item: IResBranchOperatingHour, updates: Partial<IResBranchOperatingHour>) => {
    const payload = {
      branchId: item.branchId,
      dayOfWeek: item.dayOfWeek,
      openTime: updates.openTime || item.openTime,
      closeTime: updates.closeTime || item.closeTime,
      isOpen: updates.isOpen !== undefined ? updates.isOpen : item.isOpen,
      breakStartTime: updates.breakStartTime !== undefined ? updates.breakStartTime : item.breakStartTime,
      breakEndTime: updates.breakEndTime !== undefined ? updates.breakEndTime : item.breakEndTime,
    };

    useActions<"updateOperatingHour">("updateOperatingHour", [item.id, payload, (code: any) => {
      if (String(code).startsWith('2')) {
        useActions<"getOperatingHours">("getOperatingHours", [branchId], true);
      }
    }], true);
  };

  const handleInitialize = async () => {
    const days = [
      { day: 0, name: "Sunday" },
      { day: 1, name: "Monday" },
      { day: 2, name: "Tuesday" },
      { day: 3, name: "Wednesday" },
      { day: 4, name: "Thursday" },
      { day: 5, name: "Friday" },
      { day: 6, name: "Saturday" },
    ];

    for (const day of days) {
      const payload = {
        branchId,
        dayOfWeek: day.day,
        openTime: "09:00",
        closeTime: "21:00",
        isOpen: true,
        breakStartTime: "12:00",
        breakEndTime: "13:00",
      };
      
      // We use a promise wrapper to handle the callback pattern in a loop
      await new Promise((resolve) => {
        useActions<"createOperatingHour">("createOperatingHour", [payload, (code: any) => {
          resolve(code);
        }], false); // useLoading false to avoid flickering
      });
    }
    
    // Refresh after all created
    useActions<"getOperatingHours">("getOperatingHours", [branchId], true);
  };

  const renderDayRow = (item: IResBranchOperatingHour) => {
    const isEditing = isLoading("updateOperatingHour");

    return (
      <div key={item.id} className={`p-4 rounded-2xl mb-3 border-2 transition-all ${item.isOpen ? 'border-emerald-50 bg-white shadow-sm' : 'border-gray-50 bg-gray-50/50 grayscale opacity-70'}`}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={4}>
            <div className="flex flex-col">
              <Text className="text-base font-bold text-slate-800">{item.dayName}</Text>
              <Text className="text-xs text-slate-400">Day {item.dayOfWeek}</Text>
            </div>
          </Col>
          
          <Col xs={12} md={3}>
            <div className="flex flex-col items-center gap-1">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Status</Text>
              <Switch 
                checked={item.isOpen} 
                onChange={(checked) => handleUpdate(item, { isOpen: checked })}
                size="small"
                className={item.isOpen ? 'bg-emerald-500' : ''}
              />
            </div>
          </Col>

          <Col xs={12} md={8}>
            <div className="flex flex-col gap-1">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Jam Operasional</Text>
              <div className="flex items-center gap-2">
                <TimePicker 
                  value={item.openTime ? dayjs(item.openTime, "HH:mm") : null} 
                  format="HH:mm"
                  onChange={(time) => handleUpdate(item, { openTime: time ? time.format("HH:mm") : "00:00" })}
                  disabled={!item.isOpen}
                  allowClear={false}
                  className="rounded-lg border-gray-200"
                />
                <Text className="text-slate-300">-</Text>
                <TimePicker 
                  value={item.closeTime ? dayjs(item.closeTime, "HH:mm") : null} 
                  format="HH:mm"
                  onChange={(time) => handleUpdate(item, { closeTime: time ? time.format("HH:mm") : "00:00" })}
                  disabled={!item.isOpen}
                  allowClear={false}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>
          </Col>

          <Col xs={24} md={9}>
            <div className="flex flex-col gap-1">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Jam Istirahat (Opsional)</Text>
              <div className="flex items-center gap-2">
                <TimePicker 
                  value={item.breakStartTime ? dayjs(item.breakStartTime, "HH:mm") : null} 
                  format="HH:mm"
                  placeholder="Mulai"
                  onChange={(time) => handleUpdate(item, { breakStartTime: time ? time.format("HH:mm") : null })}
                  disabled={!item.isOpen}
                  className="rounded-lg border-gray-200"
                />
                <Text className="text-slate-300">-</Text>
                <TimePicker 
                  value={item.breakEndTime ? dayjs(item.breakEndTime, "HH:mm") : null} 
                  format="HH:mm"
                  placeholder="Selesai"
                  onChange={(time) => handleUpdate(item, { breakEndTime: time ? time.format("HH:mm") : null })}
                  disabled={!item.isOpen}
                  className="rounded-lg border-gray-200"
                />
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-500/20">
            <Clock size={20} />
          </div>
          <div className="flex flex-col text-left">
            <Title level={4} className="!m-0 !leading-tight text-slate-800">Jam Operasional</Title>
            <Text className="text-xs text-slate-400 font-medium">Cabang: <span className="text-emerald-600 font-bold">{branchName}</span></Text>
          </div>
        </div>
      }
      className="custom-modal"
      destroyOnClose
    >
      <div className="py-4 max-h-[70vh] overflow-y-auto px-1">
        <Spin spinning={isLoading("getOperatingHours")}>
          {localHours.length > 0 ? (
            localHours.map(renderDayRow)
          ) : (
            <div className="py-12 flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <Empty 
                description={
                  <div className="flex flex-col items-center gap-2">
                    <Text className="text-slate-500 font-medium">Data jam operasional belum tersedia</Text>
                    <Text className="text-xs text-slate-400">Klik tombol di bawah untuk membuat data default untuk 7 hari</Text>
                  </div>
                } 
              />
              <Button 
                type="primary" 
                ghost
                icon={<Clock size={16} />}
                loading={isLoading("createOperatingHour")}
                onClick={handleInitialize}
                className="mt-4 h-10 px-6 rounded-xl border-emerald-500 text-emerald-600 hover:text-emerald-700 hover:border-emerald-600 font-bold"
              >
                Inisialisasi Jam Operasional
              </Button>
            </div>
          )}
        </Spin>
      </div>
      
      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button 
          type="primary" 
          onClick={onClose}
          className="bg-emerald-500 hover:bg-emerald-600 h-11 px-8 rounded-xl font-bold shadow-lg shadow-emerald-500/20 border-none"
        >
          Selesai
        </Button>
      </div>
    </Modal>
  );
}
