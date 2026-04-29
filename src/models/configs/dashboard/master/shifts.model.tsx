import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqShift,
  IReqFormShift,
  IResShift,
} from "@afx/interfaces/master/shift.iface";
import {
  GetShiftsService,
  GetShiftService,
  CreateShiftService,
  UpdateShiftService,
  DeleteShiftService,
} from "@afx/services/master/shift.service";

export type IActionShift = {
  getShifts: (param: IReqShift) => void;
  getShift: (id: number) => void;
  createShift: (
    param: IReqFormShift,
    callback: (code: number) => void,
  ) => void;
  updateShift: (
    id: number,
    param: IReqFormShift,
    callback: (code: number) => void,
  ) => void;
  deleteShift: (id: number, callback: (code: number) => void) => void;
};

export type IStateShift = {
  shifts: IResShift[];
  shift: IResShift;
};

const ShiftsModels: IModelDefinitions<IStateShift, IActionShift> = {
  name: "shifts",
  model: (put, getStates, getActions) => ({
    state: {
      shifts: [],
      shift: {} as IResShift,
    },
    actions: {
      async getShifts(data) {
        try {
          const res = await GetShiftsService(data);
          if (res?.meta.code === 20000) {
            put({ shifts: res?.data || [] });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load shifts",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async getShift(id) {
        try {
          const res = await GetShiftService(id);
          if (res?.meta?.code === 20000) {
            put({ shift: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load shift detail",
            description: err?.message || "Terjadi kesalahan pada server",
            duration: 2,
          });
        }
      },
      async createShift(data, callback) {
        try {
          const res = await CreateShiftService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "Shift created successfully",
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
      async updateShift(id, data, callback) {
        try {
          const res = await UpdateShiftService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: "Shift updated successfully",
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
      async deleteShift(id, callback) {
        try {
          const res = await DeleteShiftService(id);
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
    },
  }),
};

export default ShiftsModels;
