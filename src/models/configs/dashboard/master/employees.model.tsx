import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqEmployee,
  IReqFormEmployee,
  IResEmployee,
} from "@afx/interfaces/master/employee.iface";
import {
  CreateEmployeeService,
  DeleteEmployeeService,
  GetEmployeesService,
  GetEmployeeService,
  UpdateEmployeeService,
} from "@afx/services/master/employees.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionEmployee = {
  getEmployees: (param: IReqEmployee) => void;
  getEmployee: (id: number) => void;
  createEmployee: (
    param: IReqFormEmployee,
    callback: (code: number) => void,
  ) => void;
  updateEmployee: (
    id: number,
    param: IReqFormEmployee,
    callback: (code: number) => void,
  ) => void;
  deleteEmployee: (id: number, callback: (code: number) => void) => void;
};

export type IStateEmployee = {
  employees: IResEmployee[];
  employee: IResEmployee;
  pageInfo: IResPagination;
};

const EmployeesModels: IModelDefinitions<IStateEmployee, IActionEmployee> = {
  name: "employees",
  model: (put, getStates, getActions) => ({
    state: {
      employees: [],
      employee: {} as IResEmployee,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getEmployees(data) {
        try {
          const res = await GetEmployeesService(data);
          if (res?.meta.code === 20000) {
            const pageData = res?.data?.pageData || (Array.isArray(res?.data) ? res?.data : []);
            const pageInfo = res?.data?.pageInfo || res?.pagination || { total: pageData.length };
            
            put({ 
              employees: pageData, 
              pageInfo: pageInfo
            });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_EMPLOYEES",
          });
        }
      },
      async getEmployee(id) {
        try {
          const res = await GetEmployeeService(id);
          if (res?.meta?.code === 20000) {
            put({ employee: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_EMPLOYEES",
          });
        }
      },
      async createEmployee(data, callback) {
        try {
          const res = await CreateEmployeeService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_EMPLOYEES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create employee",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_EMPLOYEES",
          });
        }
      },
      async updateEmployee(id, data, callback) {
        try {
          const res = await UpdateEmployeeService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_EMPLOYEES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update employee",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_EMPLOYEES",
          });
        }
      },
      async deleteEmployee(id, callback) {
        try {
          const res = await DeleteEmployeeService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_EMPLOYEES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to delete employee",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_EMPLOYEES",
          });
        }
      },
    },
  }),
};

export default EmployeesModels;
