import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqDepartment,
  IReqFormDepartment,
  IResDepartment,
} from "@afx/interfaces/master/department.iface";
import {
  CreateDepartmentService,
  DeleteDepartmentService,
  GetDepartmentsService,
  GetDepartmentService,
  UpdateDepartmentService,
} from "@afx/services/master/departments.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionDepartment = {
  getDepartments: (param: IReqDepartment) => void;
  getDepartment: (id: number) => void;
  createDepartment: (
    param: IReqFormDepartment,
    callback: (code: number) => void,
  ) => void;
  updateDepartment: (
    id: number,
    param: IReqFormDepartment,
    callback: (code: number) => void,
  ) => void;
  deleteDepartment: (id: number, callback: (code: number) => void) => void;
};

export type IStateDepartment = {
  departments: IResDepartment[];
  department: IResDepartment;
  pageInfo: IResPagination;
};

const DepartmentsModels: IModelDefinitions<IStateDepartment, IActionDepartment> = {
  name: "departments",
  model: (put, getStates, getActions) => ({
    state: {
      departments: [],
      department: {} as IResDepartment,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getDepartments(data) {
        try {
          const res = await GetDepartmentsService(data);
          if (res?.meta.code === 20000) {
            put({ departments: res?.data, pageInfo: res?.pagination });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DEPARTMENTS",
          });
        }
      },
      async getDepartment(id) {
        try {
          const res = await GetDepartmentService(id);
          if (res?.meta?.code === 20000) {
            put({ department: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_DEPARTMENTS",
          });
        }
      },
      async createDepartment(data, callback) {
        try {
          const res = await CreateDepartmentService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_DEPARTMENTS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create department",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_DEPARTMENTS",
          });
        }
      },
      async updateDepartment(id, data, callback) {
        try {
          const res = await UpdateDepartmentService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_DEPARTMENTS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update department",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_DEPARTMENTS",
          });
        }
      },
      async deleteDepartment(id, callback) {
        try {
          const res = await DeleteDepartmentService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_DEPARTMENTS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to delete department",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_DEPARTMENTS",
          });
        }
      },
    },
  }),
};

export default DepartmentsModels;
