import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import { ExamplePostService } from "@afx/services/example.service";
import {
  IReqCompany,
  IReqFormCompany,
  IResCompany,
} from "@afx/interfaces/master/company.iface";
import {
  CreateCompanyService,
  DeleteCompanyService,
  GetCompaniesService,
  GetCompanyService,
  UpdateCompanyService,
} from "@afx/services/master/companies.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionCompany = {
  getCompanies: (param: IReqCompany) => void;
  getCompany: (id: number) => void;
  createCompany: (
    param: IReqFormCompany,
    callback: (code: number) => void,
  ) => void;
  updateCompany: (
    id: number,
    param: IReqFormCompany,
    callback: (code: number) => void,
  ) => void;
  deleteCompany: (id: number, callback: (code: number) => void) => void;
};

export type IStateCompany = {
  companies: IResCompany[];
  company: IResCompany;
  pageInfo: IResPagination;
};

const CompaniesModels: IModelDefinitions<IStateCompany, IActionCompany> = {
  name: "companies",
  model: (put, getStates, getActions) => ({
    state: {
      companies: [],
      company: {} as IResCompany,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getCompanies(data) {
        try {
          const res = await GetCompaniesService(data);
          if (res?.meta.code === 20000) {
            put({ companies: res?.data, pageInfo: res?.pagination });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_COMPANIES",
          });
        }
      },
      async getCompany(id) {
        try {
          const res = await GetCompanyService(id);
          if (res?.meta?.code === 20000) {
            put({ company: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_COMPANIES",
          });
        }
      },
      async createCompany(data, callback) {
        try {
          const res = await CreateCompanyService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_COMPANIES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_COMPANIES",
          });
        }
      },
      async updateCompany(id, data, callback) {
        try {
          const res = await UpdateCompanyService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_COMPANIES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_COMPANIES",
          });
        }
      },
      async deleteCompany(id, callback) {
        try {
          const res = await DeleteCompanyService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_COMPANIES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_COMPANIES",
          });
        }
      },
    },
  }),
};

export default CompaniesModels;
