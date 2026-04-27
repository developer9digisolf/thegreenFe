import { IReqPagination } from "../common.iface";

export interface IReqShift extends IReqPagination {}

export interface IResShift {
    id: number;
    companyId: number;
    code: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    employeeCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface IReqFormShift {
    code: string;
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    breakMinutes: number;
}
