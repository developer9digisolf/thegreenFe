import request from "@afx/utils/request.utils";
import { rest } from "@afx/utils/config.rest";

export interface IDevicePairingRequest {
    DeviceName: string | null;
    ExpirationMinutes: number | null;
}

export interface IDevicePairingResponse {
    id: number;
    pairingCode: string;
    qrToken: string;
    deviceName: string | null;
    expiresAt: string;
    usedAt: string | null;
    deviceId: number | null;
    device: any | null;
    createdBy: number;
    createdByUser: any | null;
    createdAt: string;
    isValid: boolean;
    isExpired: boolean;
    isUsed: boolean;
}

export const GenerateDevicePairingCodeService = async (data: IDevicePairingRequest) => {
    return await request<IDevicePairingResponse>({
        url: rest.master.devicePairingCodesGenerate,
        method: "POST",
        data: data
    });
};
