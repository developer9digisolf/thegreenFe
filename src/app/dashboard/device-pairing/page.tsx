'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Spin, Button, App, Typography, Space, Badge, Divider } from 'antd';
import QRCode from 'qrcode';
import { GenerateDevicePairingCodeService, IDevicePairingResponse } from '@afx/services/master/device-pairing.service';
import dayjs from 'dayjs';
import { ReloadOutlined, QrcodeOutlined, ClockCircleOutlined, TabletOutlined, MobileOutlined, LinkOutlined, SafetyCertificateOutlined, SoundOutlined } from '@ant-design/icons';
import { useSignalR } from "@/hooks/useSignalR";
import { useAuth } from "@/contexts/AuthContext";
import { TextToSpeechAndPlay, InitTTSAutoplayUnlock } from "@/services/text-to-speech.service";

const { Title, Text } = Typography;

export default function DevicePairingPage() {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [pairingData, setPairingData] = useState<IDevicePairingResponse | null>(null);
    const [qrImageUrl, setQrImageUrl] = useState<string>("");
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const { token } = useAuth();

    // Initialize SignalR connection for real-time updates
    const { on: signalROn, off: signalROff } = useSignalR({
        hubName: "hubs/notification",
        accessToken: token || undefined,
        autoConnect: true,
        onConnected: () => {
            console.log("[DevicePairing] SignalR connected - listening for DeviceRepaired");
        },
        onError: (error) => {
            console.error("[DevicePairing] SignalR error:", error);
        }
    });

    const generatePairingCode = async (silent = false) => {
        setLoading(true);
        try {
            const res = await GenerateDevicePairingCodeService({
                DeviceName: null,
                ExpirationMinutes: null
            });

            if (res.meta.success) {
                setPairingData(res.data);
                
                // Generate QR Image Data URL
                const url = await QRCode.toDataURL(res.data.qrToken, {
                    width: 560,
                    margin: 2,
                    color: {
                        dark: '#0f172a', // Slate 900
                        light: '#ffffff'
                    }
                });
                setQrImageUrl(url);

                if (!silent) {
                    message.success("Pairing code berhasil diperbarui.");
                }
                
                const expiredAt = dayjs(res.data.expiresAt);
                const seconds = expiredAt.diff(dayjs(), 'second');
                setTimeLeft(seconds > 0 ? seconds : 0);
            } else {
                message.error(res.meta.message || "Gagal menghasilkan Pairing Code.");
            }
        } catch (error: any) {
            message.error(error.message || "Terjadi kesalahan saat menghubungi server.");
        } finally {
            setLoading(false);
        }
    };

    const [audioNeedsUnlock, setAudioNeedsUnlock] = useState(true);

    useEffect(() => {
        const handleInteraction = () => {
            setAudioNeedsUnlock(false);
            InitTTSAutoplayUnlock();
        };

        // Listen for any interaction to unlock audio
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        window.addEventListener('keydown', handleInteraction);

        return () => {
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            window.removeEventListener('keydown', handleInteraction);
        };
    }, []);

    useEffect(() => {
        generatePairingCode(true); // Silent on initial load to avoid double toasts in dev/Strict Mode
        InitTTSAutoplayUnlock();
    }, []);

    // Listen for DeviceRepaired and DevicePaired events from backend via SignalR
    useEffect(() => {
        const handleDeviceRepaired = (data: any) => {
            console.log("[DevicePairing] DevicePaired/DeviceRepaired event received:", data);
            
            // Show success notification
            const successMsg = data?.message || "Perangkat berhasil dipasangkan!";
            message.success(successMsg);

            // Play voice notification (TTS)
            const speechText = data?.textToSpeech ?? data?.textToSpeach ?? "Perangkat berhasil dipasangkan";
            TextToSpeechAndPlay({ text: speechText, language: "id" }).catch(err => {
                console.error("[DevicePairing] TTS play failed:", err);
            });

            // Regenerate pairing code silently for the next device
            generatePairingCode(true);
        };

        signalROn("DeviceRepaired", handleDeviceRepaired);
        signalROn("DevicePaired", handleDeviceRepaired);

        return () => {
            signalROff("DeviceRepaired", handleDeviceRepaired);
            signalROff("DevicePaired", handleDeviceRepaired);
        };
    }, [signalROn, signalROff, message]);

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

    useEffect(() => {
        if (timeLeft === 0 && pairingData && !loading) {
            generatePairingCode(true); // Silent on timer expiration
        }
    }, [timeLeft, pairingData, loading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {audioNeedsUnlock && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <SoundOutlined className="text-amber-500 text-lg animate-bounce" />
                        <Text className="text-amber-700 text-xs font-semibold">
                            Klik di mana saja pada layar ini untuk mengaktifkan notifikasi suara pairing.
                        </Text>
                    </div>
                    <Button 
                        size="small" 
                        type="link" 
                        className="text-amber-600 hover:text-amber-800 font-bold text-xs"
                        onClick={() => setAudioNeedsUnlock(false)}
                    >
                        Aktifkan
                    </Button>
                </div>
            )}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-6 shadow-lg shadow-emerald-500/20">
                    <LinkOutlined className="text-3xl" />
                </div>
                <Title level={2} className="!mb-2 font-black tracking-tight text-slate-900">Device Pairing</Title>
                <Text className="text-slate-500 block">Hubungkan perangkat baru ke sistem <span className="text-emerald-600 font-bold">The Green</span> dengan aman.</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* QR Display Card */}
                <Card className="lg:col-span-7 rounded-[2.5rem] shadow-2xl border-none overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                    <div className="p-8 md:p-10 flex flex-col items-center">
                        <div className="mb-8 w-full flex items-center justify-between px-2">
                            <Badge status={timeLeft > 0 ? "processing" : "default"} text={timeLeft > 0 ? "Kode Aktif" : "Expired"} className="font-bold uppercase tracking-wider text-[10px] text-slate-400" />
                            <div className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                                <ClockCircleOutlined />
                                <span>EXPIRED: <span className={timeLeft < 30 ? "text-red-500 animate-pulse" : "text-emerald-500"}>{formatTime(timeLeft)}</span></span>
                            </div>
                        </div>

                        <div className="relative p-4 bg-white rounded-[2rem] shadow-inner border-8 border-slate-50 mb-8">
                            {loading && (
                                <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-[1.5rem]">
                                    <Spin size="large" />
                                </div>
                            )}
                            
                            {!qrImageUrl ? (
                                <div className="w-[240px] h-[240px] flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                                    <QrcodeOutlined className="text-6xl text-slate-200" />
                                </div>
                            ) : (
                                <img 
                                    src={qrImageUrl} 
                                    alt="Pairing QR" 
                                    className="w-[240px] h-[240px] object-contain rounded-xl"
                                />
                            )}
                        </div>

                        <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                            <Text className="block font-black text-slate-400 uppercase text-[10px] tracking-widest mb-4">Atau Masukkan Kode</Text>
                            <div className="flex gap-2 justify-center">
                                {pairingData?.pairingCode.split('').map((char, index) => (
                                    <div key={index} className="w-10 h-14 bg-white border-2 border-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-emerald-600 shadow-sm">
                                        {char}
                                    </div>
                                ))}
                                {!pairingData && Array(6).fill(0).map((_, i) => (
                                    <div key={i} className="w-10 h-14 bg-white/50 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-2xl font-black text-slate-200">-</div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Info Card */}
                <Card className="lg:col-span-5 rounded-[2.5rem] shadow-xl border-slate-100 p-8 flex flex-col justify-between">
                    <div>
                        <Title level={4} className="!mb-6 font-bold text-slate-800 flex items-center gap-2">
                            <SafetyCertificateOutlined className="text-emerald-500" />
                            Konfigurasi
                        </Title>
                        
                        <div className="space-y-6">
                            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                                <h5 className="text-emerald-700 font-bold text-sm mb-3">Langkah Pairing:</h5>
                                <ul className="text-emerald-600 text-xs pl-4 list-decimal space-y-3 opacity-90 font-medium">
                                    <li>Buka aplikasi <strong>The Green POS</strong> di tablet.</li>
                                    <li>Pilih menu <strong>"Pair Device"</strong>.</li>
                                    <li>Scan QR Code atau masukkan kode pairing 6 digit.</li>
                                    <li>Sistem akan melakukan otentikasi secara otomatis.</li>
                                </ul>
                            </div>

                            <p className="text-slate-400 text-[11px] italic leading-relaxed text-center px-4">
                                * Kode pairing bersifat temporer dan akan diperbarui otomatis demi keamanan perangkat Anda.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <Button 
                            type="primary" 
                            size="large" 
                            icon={<ReloadOutlined />} 
                            onClick={() => generatePairingCode()}
                            loading={loading}
                            className="h-14 rounded-2xl bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 font-bold text-base"
                            block
                        >
                            Refresh Code
                        </Button>
                        
                        <Button 
                            size="large" 
                            icon={<SoundOutlined />} 
                            onClick={() => {
                                console.log("[DevicePairing] Test Sound button clicked!");
                                TextToSpeechAndPlay({ text: "Tes koneksi suara berhasil diputar", language: "id" })
                                    .then(() => message.success("Suara berhasil dipicu!"))
                                    .catch(err => {
                                        console.error("[DevicePairing] Test TTS failed:", err);
                                        message.error("Gagal memutar suara, periksa konsol log!");
                                    });
                            }}
                            className="h-14 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 text-emerald-600 hover:text-emerald-700 font-bold text-base bg-white"
                            block
                        >
                            Test Sound
                        </Button>
                    </div>
                </Card>
            </div>

            <style jsx global>{`
                .ant-btn-primary {
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }
            `}</style>
        </div>
    );
}
