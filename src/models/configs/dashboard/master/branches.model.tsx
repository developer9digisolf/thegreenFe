import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqBranch,
  IReqFormBranch,
  IResBranch,
} from "@afx/interfaces/master/branch.iface";
import {
  CreateBranchService,
  DeleteBranchService,
  GetBranchesService,
  GetBranchService,
  UpdateBranchService,
} from "@afx/services/master/branches.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionBranch = {
  getBranches: (param: IReqBranch) => void;
  getBranch: (id: number) => void;
  createBranch: (
    param: IReqFormBranch,
    callback: (code: number) => void,
  ) => void;
  updateBranch: (
    id: number,
    param: IReqFormBranch,
    callback: (code: number) => void,
  ) => void;
  deleteBranch: (id: number, callback: (code: number) => void) => void;
};

export type IStateBranch = {
  branches: IResBranch[];
  branch: IResBranch;
  pageInfo: IResPagination;
};

const BranchesModels: IModelDefinitions<IStateBranch, IActionBranch> = {
  name: "branches",
  model: (put, getStates, getActions) => ({
    state: {
      branches: [],
      branch: {} as IResBranch,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getBranches(data) {
        try {
          const res = await GetBranchesService(data);
          if (res?.meta.code === 20000) {
            put({ branches: res?.data, pageInfo: res?.pagination });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_BRANCHES",
          });
        }
      },
      async getBranch(id) {
        try {
          const res = await GetBranchService(id);
          if (res?.meta?.code === 20000) {
            put({ branch: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_BRANCHES",
          });
        }
      },
      async createBranch(data, callback) {
        try {
          const res = await CreateBranchService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_BRANCHES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create branch",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_BRANCHES",
          });
        }
      },
      async updateBranch(id, data, callback) {
        try {
          const res = await UpdateBranchService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_BRANCHES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update branch",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_BRANCHES",
          });
        }
      },
      async deleteBranch(id, callback) {
        try {
          const res = await DeleteBranchService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_BRANCHES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to delete branch",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_BRANCHES",
          });
        }
      },
    },
  }),
};

export default BranchesModels;
