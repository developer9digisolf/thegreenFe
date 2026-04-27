import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqPosition,
  IReqFormPosition,
  IResPosition,
} from "@afx/interfaces/master/position.iface";
import {
  CreatePositionService,
  DeletePositionService,
  GetPositionsService,
  GetPositionService,
  UpdatePositionService,
} from "@afx/services/master/positions.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionPosition = {
  getPositions: (param: IReqPosition) => void;
  getPosition: (id: number) => void;
  createPosition: (
    param: IReqFormPosition,
    callback: (code: number) => void,
  ) => void;
  updatePosition: (
    id: number,
    param: IReqFormPosition,
    callback: (code: number) => void,
  ) => void;
  deletePosition: (id: number, callback: (code: number) => void) => void;
};

export type IStatePosition = {
  positions: IResPosition[];
  position: IResPosition;
  pageInfo: IResPagination;
};

const PositionsModels: IModelDefinitions<IStatePosition, IActionPosition> = {
  name: "positions",
  model: (put, getStates, getActions) => ({
    state: {
      positions: [],
      position: {} as IResPosition,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getPositions(data) {
        try {
          const res = await GetPositionsService(data);
          if (res?.meta.code === 20000) {
            put({ positions: res?.data, pageInfo: res?.pagination });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_POSITIONS",
          });
        }
      },
      async getPosition(id) {
        try {
          const res = await GetPositionService(id);
          if (res?.meta?.code === 20000) {
            put({ position: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_POSITIONS",
          });
        }
      },
      async createPosition(data, callback) {
        try {
          const res = await CreatePositionService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_POSITIONS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create position",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_POSITIONS",
          });
        }
      },
      async updatePosition(id, data, callback) {
        try {
          const res = await UpdatePositionService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_POSITIONS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update position",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_POSITIONS",
          });
        }
      },
      async deletePosition(id, callback) {
        try {
          const res = await DeletePositionService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_POSITIONS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to delete position",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_POSITIONS",
          });
        }
      },
    },
  }),
};

export default PositionsModels;
