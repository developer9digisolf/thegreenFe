import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "antd";
import { ExamplePostService } from "@afx/services/example.service";
import {
  IReqCompany,
  IReqFormCompany,
  IResCompany,
} from "@afx/interfaces/master/company.iface";
import {
  CreateCompanyServie,
  DeleteCompanyServie,
  GetCompaniesServie,
  GetCompanyServie,
  UpdateCompanyServie,
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
          const res = await GetCompaniesServie(data);
          console.log({ res });

          notification.success({
            message: "Success",
            description: "success",
            duration: 2,
            key: "FUNC-GET_COMPANIES",
          });
        } catch (err: any) {
          notification.warning({
            message: "Failed to load data",
            description: err?.meta?.message,
            duration: 2,
            key: "FUNC-GET_COMPANIES",
          });
        }
      },
      async getCompany(id) {
        try {
          const res = await GetCompanyServie(id);
          notification.success({
            message: "Success",
            description: "success",
            duration: 2,
            key: "FUNC-GET_DETAIL_COMPANIES",
          });
        } catch (err: any) {
          notification.warning({
            message: "Failed to load data",
            description: err?.meta?.message,
            duration: 2,
            key: "FUNC-GET_DETAIL_COMPANIES",
          });
        }
      },
      async createCompany(data, callback) {
        try {
          const res = await CreateCompanyServie(data);
          notification.success({
            message: "Success",
            description: "success",
            duration: 2,
            key: "FUNC-CREATE_COMPANIES",
          });
        } catch (err: any) {
          notification.warning({
            message: "Failed to load data",
            description: err?.meta?.message,
            duration: 2,
            key: "FUNC-CREATE_COMPANIES",
          });
        }
      },
      async updateCompany(id, data, callback) {
        try {
          const res = await UpdateCompanyServie(id, data);
          notification.success({
            message: "Success",
            description: "success",
            duration: 2,
            key: "FUNC-UPDATE_COMPANIES",
          });
        } catch (err: any) {
          notification.warning({
            message: "Failed to load data",
            description: err?.meta?.message,
            duration: 2,
            key: "FUNC-UPDATE_COMPANIES",
          });
        }
      },
      async deleteCompany(id, callback) {
        try {
          const res = await DeleteCompanyServie(id);
          notification.success({
            message: "Success",
            description: "success",
            duration: 2,
            key: "FUNC-DELETE_COMPANIES",
          });
        } catch (err: any) {
          notification.warning({
            message: "Failed to load data",
            description: err?.meta?.message,
            duration: 2,
            key: "FUNC-DELETE_COMPANIES",
          });
        }
      },
    },
  }),
};

export default CompaniesModels;
