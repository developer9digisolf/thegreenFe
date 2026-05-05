import request from "@afx/utils/request.utils";
import { rest } from "@afx/utils/config.rest";

export interface IAttendanceQRRequest {
    branchId: number;
    ExpirationMinutes: number;
}

export interface IAttendanceQRResponse {
    id: number;
    token: string;
    branchId: number;
    expiredAt: string;
    createdAt: string;
    isActive: boolean;
}

export const GenerateAttendanceQRService = async (data: IAttendanceQRRequest) => {
    return await request<IAttendanceQRResponse>({
        url: rest.master.attendanceQRSessions,
        method: "POST",
        data: data
    });
};
