import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IResBranchOperatingHour,
  IReqFormBranchOperatingHour,
} from "@afx/interfaces/master/branch-operating-hours.iface";
import {
  GetBranchOperatingHoursService,
  CreateBranchOperatingHourService,
  UpdateBranchOperatingHourService,
} from "@afx/services/master/branch-operating-hours.service";

export type IActionBranchOperatingHour = {
  getOperatingHours: (branchId: number) => void;
  createOperatingHour: (
    param: IReqFormBranchOperatingHour,
    callback: (code: number) => void,
  ) => void;
  updateOperatingHour: (
    id: number,
    param: IReqFormBranchOperatingHour,
    callback: (code: number) => void,
  ) => void;
};

export type IStateBranchOperatingHour = {
  operatingHours: IResBranchOperatingHour[];
};

const BranchOperatingHourModels: IModelDefinitions<IStateBranchOperatingHour, IActionBranchOperatingHour> = {
  name: "branchOperatingHours",
  model: (put, getStates, getActions) => ({
    state: {
      operatingHours: [],
    },
    actions: {
      async getOperatingHours(branchId) {
        try {
          const res = await GetBranchOperatingHoursService(branchId);
          if (res?.meta.code === 20000) {
            put({ operatingHours: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load operating hours",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_OPERATING_HOURS",
          });
        }
      },
      async createOperatingHour(data, callback) {
        try {
          const res = await CreateBranchOperatingHourService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_OPERATING_HOUR",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create operating hour",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_OPERATING_HOUR",
          });
        }
      },
      async updateOperatingHour(id, data, callback) {
        try {
          const res = await UpdateBranchOperatingHourService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_OPERATING_HOUR",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update operating hour",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_OPERATING_HOUR",
          });
        }
      },
    },
  }),
};

export default BranchOperatingHourModels;
