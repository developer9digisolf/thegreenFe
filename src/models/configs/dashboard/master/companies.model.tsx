import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
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
  allCompaniesFlat: IResCompany[]; // All companies flattened for selection
  company: IResCompany;
  pageInfo: IResPagination;
};

// Recursive helper to flatten the company tree
const flattenCompanies = (list: any[]): any[] => {
  if (!Array.isArray(list)) return [];
  let result: any[] = [];
  list.forEach(item => {
    if (!item) return;
    const { childCompanies, ...rest } = item;
    result.push(rest);
    if (Array.isArray(childCompanies) && childCompanies.length > 0) {
      result = result.concat(flattenCompanies(childCompanies));
    }
  });
  return result;
};

// Recursive helper to map childCompanies to children for AntD Table compatibility
const mapHierarchy = (list: any[]): any[] => {
  if (!Array.isArray(list)) return [];
  return list.map(item => ({
    ...item,
    key: item.id,
    children: Array.isArray(item.childCompanies) && item.childCompanies.length > 0 
      ? mapHierarchy(item.childCompanies) 
      : undefined
  }));
};

const CompaniesModels: IModelDefinitions<IStateCompany, IActionCompany> = {
  name: "companies",
  model: (put, getStates, getActions) => ({
    state: {
      companies: [],
      allCompaniesFlat: [],
      company: {} as IResCompany,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getCompanies(data) {
        try {
          const res = await GetCompaniesService(data);
          if (res?.meta.code === 20000) {
            const rawData = res?.data?.pageData || (Array.isArray(res?.data) ? res?.data : []);
            const pageInfo = res?.data?.pageInfo || res?.pagination || {};
            
            // Map the hierarchy for the tree table
            const hierarchy = mapHierarchy(rawData);
            // Flatten for selects
            const flatList = flattenCompanies(rawData);
            
            put({ 
              companies: hierarchy, 
              allCompaniesFlat: flatList,
              pageInfo: pageInfo 
            });
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
