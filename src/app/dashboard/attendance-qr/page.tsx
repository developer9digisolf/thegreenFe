'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Spin, Button, InputNumber, App, Typography, Space, Badge, Select } from 'antd';
import QRCode from 'qrcode';
import { useAuth } from '@afx/contexts/AuthContext';
import { GenerateAttendanceQRService, IAttendanceQRResponse } from '@afx/services/master/attendance-qr.service';
import dayjs from 'dayjs';
import { ReloadOutlined, QrcodeOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function AttendanceQRPage() {
    const { message } = App.useApp();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [qrData, setQrData] = useState<IAttendanceQRResponse | null>(null);
    const [qrImageUrl, setQrImageUrl] = useState<string>("");
    const [expiration, setExpiration] = useState<number>(3);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Map branches from user profile
    const branches = (user?.branches || []).map((b: any) => ({
        id: b.id || b.branchId,
        name: b.name || b.branchName || "Unknown Branch"
    }));

    const activeBranch = branches.find(b => b.id === selectedBranchId) || branches[0];

    useEffect(() => {
        if (branches.length > 0 && !selectedBranchId) {
            setSelectedBranchId(branches[0].id);
        }
    }, [user, branches, selectedBranchId]);

    const generateQR = async (branchIdOverride?: number) => {
        const targetBranchId = branchIdOverride || selectedBranchId;
        
        if (!targetBranchId) {
            message.error("Pilih branch terlebih dahulu.");
            return;
        }

        setLoading(true);
        try {
            const res = await GenerateAttendanceQRService({
                branchId: Number(targetBranchId),
                ExpirationMinutes: expiration
            });

            if (res.meta.success) {
                setQrData(res.data);
                
                // Generate QR Image Data URL
                const url = await QRCode.toDataURL(res.data.token, {
                    width: 560,
                    margin: 2,
                    color: {
                        dark: '#0f172a',
                        light: '#ffffff'
                    }
                });
                setQrImageUrl(url);

                message.success("QR Code kehadiran berhasil diperbarui.");
                
                // Calculate time left in seconds
                const expiredAt = dayjs(res.data.expiredAt);
                const seconds = expiredAt.diff(dayjs(), 'second');
                setTimeLeft(seconds > 0 ? seconds : 0);
            } else {
                message.error(res.meta.message || "Gagal menghasilkan QR Code.");
            }
        } catch (error: any) {
            message.error(error.message || "Terjadi kesalahan saat menghubungi server.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedBranchId) {
            generateQR();
        }
    }, [selectedBranchId]);

    useEffect(() => {
        if (timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        if (timerRef.current) clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [timeLeft]);

    // Auto-refresh when QR expires
    useEffect(() => {
        if (timeLeft === 0 && qrData && !loading && selectedBranchId) {
            generateQR();
        }
    }, [timeLeft, qrData, loading, selectedBranchId]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="mb-10 text-center">
                <Title level={2} className="!mb-2 font-black tracking-tight text-slate-900">QR Code Kehadiran Terapist</Title>
                <Text className="text-slate-500">Generate QR Code dinamis untuk proses Check-in & Check-out kehadiran terapist.</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* QR Display Card */}
                <Card className="lg:col-span-7 rounded-[2.5rem] shadow-2xl border-none overflow-hidden relative group">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="p-8 md:p-12 flex flex-col items-center">
                        <div className="mb-8 w-full flex items-center justify-between px-4">
                            <Badge status={timeLeft > 0 ? "processing" : "default"} text={timeLeft > 0 ? "QR Code Aktif" : "QR Expired"} className="font-bold uppercase tracking-wider text-[10px]" />
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                <ClockCircleOutlined />
                                <span>BERAKHIR DALAM: <span className={timeLeft < 30 ? "text-red-500 animate-pulse" : "text-emerald-500"}>{formatTime(timeLeft)}</span></span>
                            </div>
                        </div>

                        <div className="relative p-6 bg-white rounded-[2rem] shadow-inner border-8 border-slate-50">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[1.5rem]">
                                    <Spin size="large" />
                                </div>
                            )}
                            
                            {!qrImageUrl ? (
                                <div className="w-[280px] h-[280px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                                    <QrcodeOutlined className="text-6xl text-slate-200" />
                                </div>
                            ) : (
                                <img 
                                    src={qrImageUrl} 
                                    alt="Attendance QR" 
                                    className="w-[280px] h-[280px] object-contain rounded-xl shadow-sm"
                                />
                            )}
                        </div>

                        <div className="mt-10 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-600 font-bold text-sm mb-4">
                                <EnvironmentOutlined />
                                <span>{activeBranch?.name || "Memuat branch..."}</span>
                            </div>
                            <p className="text-slate-400 text-xs px-10">Scan QR Code ini menggunakan aplikasi Portal Terapist untuk mencatat kehadiran Anda.</p>
                        </div>
                    </div>
                </Card>

                {/* Settings Card */}
                <Card className="lg:col-span-5 rounded-[2.5rem] shadow-xl border-slate-100 p-8">
                    <Title level={4} className="!mb-6 font-bold text-slate-800">Pengaturan QR</Title>
                    
                    <div className="flex flex-col gap-6">
                        <div>
                            <Text className="block font-bold text-slate-500 mb-2 uppercase text-[10px] tracking-widest">Pilih Branch / Outlet</Text>
                            <Select 
                                className="w-full h-12 rounded-xl"
                                placeholder="Pilih Branch"
                                value={selectedBranchId}
                                onChange={(val) => setSelectedBranchId(val)}
                                options={branches.map(b => ({ value: b.id, label: b.name }))}
                            />
                        </div>

                        <div>
                            <Text className="block font-bold text-slate-500 mb-2 uppercase text-[10px] tracking-widest">Durasi Masa Berlaku (Menit)</Text>
                            <InputNumber 
                                min={1} 
                                max={60} 
                                value={expiration} 
                                onChange={(val) => setExpiration(val || 3)}
                                className="w-full h-12 rounded-xl flex items-center text-lg font-bold"
                            />
                            <Text className="text-[11px] text-slate-400 mt-2 block italic">* QR Code akan otomatis tidak berlaku setelah durasi berakhir.</Text>
                        </div>

                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ReloadOutlined />} 
                            onClick={() => generateQR()}
                            loading={loading}
                            className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 font-bold text-base"
                            block
                        >
                            Generate QR Baru
                        </Button>

                        <div className="mt-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                            <h5 className="text-emerald-700 font-bold text-sm mb-2">Instruksi Penggunaan:</h5>
                            <ul className="text-emerald-600 text-xs pl-4 list-disc space-y-2 opacity-80">
                                <li>Pastikan Terapist berada di area Outlet.</li>
                                <li>Minta Terapist membuka menu "Attendance" di aplikasi mereka.</li>
                                <li>Terapist melakukan scan pada QR Code yang tampil di layar ini.</li>
                                <li>Berikan waktu 3-5 menit agar QR Code tetap aman namun memberi waktu cukup untuk scan.</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>

            <style jsx global>{`
                .ant-input-number-input {
                    height: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                }
                .ant-select-selector {
                    height: 48px !important;
                    border-radius: 12px !important;
                    display: flex !important;
                    align-items: center !important;
                }
            `}</style>
        </div>
    );
}
