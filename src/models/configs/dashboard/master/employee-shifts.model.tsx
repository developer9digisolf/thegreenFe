import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqEmployeeOneTimeShift,
  IReqFormEmployeeOneTimeShift,
  IResEmployeeOneTimeShift,
  IResEmployeeRecurringShift,
  IReqFormEmployeeRecurringShift,
} from "@afx/interfaces/master/employee-shift.iface";
import {
  GetEmployeeOneTimeShiftsService,
  CreateEmployeeOneTimeShiftService,
  UpdateEmployeeOneTimeShiftService,
  DeleteEmployeeOneTimeShiftService,
  ImportEmployeeOneTimeShiftsService,
  GetEmployeeRecurringShiftsService,
  CreateEmployeeRecurringShiftService,
} from "@afx/services/master/employee-shifts.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionEmployeeShift = {
  getOneTimeShifts: (param: IReqEmployeeOneTimeShift) => void;
  createOneTimeShift: (
    param: IReqFormEmployeeOneTimeShift,
    callback: (code: number) => void,
  ) => void;
  updateOneTimeShift: (
    id: number,
    param: IReqFormEmployeeOneTimeShift,
    callback: (code: number) => void,
  ) => void;
  deleteOneTimeShift: (id: number, callback: (code: number) => void) => void;
  importOneTimeShifts: (data: FormData, callback: (res: any) => void) => void;
  
  getRecurringShifts: (employeeId: number) => void;
  createRecurringShift: (
    param: IReqFormEmployeeRecurringShift,
    callback: (code: number) => void,
  ) => void;
};

export type IStateEmployeeShift = {
  oneTimeShifts: IResEmployeeOneTimeShift[];
  recurringShifts: IResEmployeeRecurringShift[];
  pageInfoOneTime: IResPagination;
};

const EmployeeShiftsModels: IModelDefinitions<IStateEmployeeShift, IActionEmployeeShift> = {
  name: "employeeShifts",
  model: (put, getStates, getActions) => ({
    state: {
      oneTimeShifts: [],
      recurringShifts: [],
      pageInfoOneTime: {} as IResPagination,
    },
    actions: {
      async getOneTimeShifts(data) {
        try {
          const res = await GetEmployeeOneTimeShiftsService(data);
          if (res?.meta?.code === 20000) {
            put({ 
              oneTimeShifts: res?.data || [], 
              pageInfoOneTime: res?.pagination || {}
            });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load one-time shifts",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async createOneTimeShift(data, callback) {
        try {
          const res = await CreateEmployeeOneTimeShiftService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "One-time shift created successfully",
            duration: 2,
          });
        } catch (err: any) {
          callback(400);
          notification.warning({
            title: "Failed to create shift",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async updateOneTimeShift(id, data, callback) {
        try {
          const res = await UpdateEmployeeOneTimeShiftService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "One-time shift updated successfully",
            duration: 2,
          });
        } catch (err: any) {
          callback(400);
          notification.warning({
            title: "Failed to update shift",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async deleteOneTimeShift(id, callback) {
        try {
          const res = await DeleteEmployeeOneTimeShiftService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "Shift deleted successfully",
            duration: 2,
          });
        } catch (err: any) {
          callback(400);
          notification.warning({
            title: "Failed to delete shift",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async importOneTimeShifts(data, callback) {
        try {
          const res = await ImportEmployeeOneTimeShiftsService(data);
          callback(res);
          if (res?.meta?.code === 20000) {
            notification.success({
              title: "Import Status",
              description: res?.meta?.message || "Shifts imported successfully",
              duration: 4,
            });
          }
        } catch (err: any) {
          callback({ meta: { code: 400, message: err?.message } });
          notification.warning({
            title: "Failed to import shifts",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async getRecurringShifts(employeeId) {
        try {
          const res = await GetEmployeeRecurringShiftsService(employeeId);
          if (res?.meta.code === 20000) {
            put({ recurringShifts: res?.data || [] });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load recurring shifts",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async createRecurringShift(data, callback) {
        try {
          const res = await CreateEmployeeRecurringShiftService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "Recurring shift updated successfully",
            duration: 2,
          });
        } catch (err: any) {
          callback(400);
          notification.warning({
            title: "Failed to update recurring shift",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
    },
  }),
};

export default EmployeeShiftsModels;
