import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqUser,
  IReqFormUser,
  IResUser,
  IResEmployee,
} from "@afx/interfaces/master/user.iface";
import {
  CreateUserService,
  DeleteUserService,
  GetUsersService,
  GetUserService,
  UpdateUserService,
  GetEmployeesService,
  GetUserCompaniesService,
  CreateUserCompanyService,
  DeleteUserCompanyService,
  GetUserBranchesService,
  CreateUserBranchService,
  DeleteUserBranchService,
} from "@afx/services/master/users.service";
import { GetCompaniesService } from "@afx/services/master/companies.service";
import { GetBranchesService } from "@afx/services/master/branches.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionUser = {
  getUsers: (param: IReqUser) => void;
  getUser: (id: number) => void;
  getEmployees: (param: any) => void;
  createUser: (
    param: IReqFormUser,
    callback: (code: number) => void,
  ) => void;
  updateUser: (
    id: number,
    param: IReqFormUser,
    callback: (code: number) => void,
  ) => void;
  deleteUser: (id: number, callback: (code: number) => void) => void;
  getUserCompanies: (userId: number) => void;
  updateUserCompanies: (userId: number, companyIds: number[], callback: (code: number) => void) => void;
  getUserBranches: (userId: number) => void;
  updateUserBranches: (userId: number, branchIds: number[], callback: (code: number) => void) => void;
  getAllCompanies: () => void;
  getAllBranches: () => void;
};

export type IStateUser = {
  users: IResUser[];
  user: IResUser;
  employees: IResEmployee[];
  pageInfo: IResPagination;
  userCompanies: any[];
  userBranches: any[];
  allCompanies: any[];
  allBranches: any[];
};

// Internal utility to flatten hierarchical company structures for the selection pool
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

const UsersModels: IModelDefinitions<IStateUser, IActionUser> = {
  name: "users",
  model: (put, getStates, getActions) => ({
    state: {
      users: [],
      user: {} as IResUser,
      employees: [],
      pageInfo: {} as IResPagination,
      userCompanies: [],
      userBranches: [],
      allCompanies: [],
      allBranches: [],
    },
    actions: {
      async getUsers(data) {
        try {
          const res = await GetUsersService(data);
          if (res?.meta.code === 20000) {
            put({ users: res?.data, pageInfo: res?.pagination });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_USERS",
          });
        }
      },
      async getUser(id) {
        try {
          const res = await GetUserService(id);
          if (res?.meta?.code === 20000) {
            put({ user: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_USERS",
          });
        }
      },
      async getEmployees(data) {
        try {
          const res = await GetEmployeesService(data);
          if (res?.meta.code === 20000) {
            put({ employees: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Failed to load employees",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_EMPLOYEES",
          });
        }
      },
      async createUser(data, callback) {
        try {
          const res = await CreateUserService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-CREATE_USERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to create user",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_USERS",
          });
        }
      },
      async updateUser(id, data, callback) {
        try {
          const res = await UpdateUserService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-UPDATE_USERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to update user",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_USERS",
          });
        }
      },
      async deleteUser(id, callback) {
        try {
          const res = await DeleteUserService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Success",
            description: res?.message,
            duration: 2,
            key: "FUNC-DELETE_USERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Failed to delete user",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_USERS",
          });
        }
      },
      async getUserCompanies(userId) {
        try {
          const res = await GetUserCompaniesService(userId);
          if (res?.meta?.code === 20000) {
            put({ userCompanies: Array.isArray(res?.data) ? res?.data : [] });
          }
        } catch (err: any) {
          console.error(err);
        }
      },
      async updateUserCompanies(userId, companyIds, callback) {
        const { userCompanies } = getStates("users", (s) => s);
        const currentCompanyIds = Array.isArray(userCompanies) ? userCompanies.map(c => Number(c.companyId)) : [];
        
        // Companies to add (in companyIds but not in currentCompanyIds)
        const toAdd = companyIds.filter(id => !currentCompanyIds.includes(Number(id)));
        
        // Companies to delete (in userCompanies but not in companyIds)
        const toDelete = userCompanies.filter(c => !companyIds.map(Number).includes(Number(c.companyId)));

        try {
          // Perform deletions
          for (const item of toDelete) {
            await DeleteUserCompanyService(item.id);
          }

          // Perform additions
          for (const companyId of toAdd) {
            await CreateUserCompanyService({ userId, companyId, isActive: true });
          }

          callback(20000);
          notification.success({
            title: "Success",
            description: "User access updated",
            duration: 2,
          });
          
          // Refresh data
          const res = await GetUserCompaniesService(userId);
          if (res?.meta?.code === 20000) {
            put({ userCompanies: res?.data });
          }
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Partial failure",
            description: "Some access changes might not have been applied",
            duration: 2,
          });
        }
      },
      async getUserBranches(userId) {
        try {
          const res = await GetUserBranchesService(userId);
          if (res?.meta?.code === 20000) {
            put({ userBranches: Array.isArray(res?.data) ? res?.data : [] });
          }
        } catch (err: any) {
          console.error(err);
        }
      },
      async updateUserBranches(userId, branchIds, callback) {
        const { userBranches } = getStates("users", (s) => s);
        const currentBranchIds = Array.isArray(userBranches) ? userBranches.map(b => Number(b.branchId)) : [];
        
        // Branches to add
        const toAdd = branchIds.filter(id => !currentBranchIds.includes(Number(id)));
        
        // Branches to delete
        const toDelete = userBranches.filter(b => !branchIds.map(Number).includes(Number(b.branchId)));

        try {
          // Perform deletions
          for (const item of toDelete) {
            await DeleteUserBranchService(item.id);
          }

          // Perform additions
          for (const branchId of toAdd) {
            await CreateUserBranchService({ userId, branchId, isActive: true });
          }

          callback(20000);
          notification.success({
            title: "Success",
            description: "User branch access updated",
            duration: 2,
          });
          
          // Refresh data
          const res = await GetUserBranchesService(userId);
          if (res?.meta?.code === 20000) {
            put({ userBranches: Array.isArray(res?.data) ? res?.data : [] });
          }
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Partial failure",
            description: "Some branch access changes might not have been applied",
            duration: 2,
          });
        }
      },
      async getAllCompanies() {
        try {
          const res = await GetCompaniesService({ page: 1, pageSize: 100, sortColumn: "id", sortDirection: "desc" });
          if (res?.meta?.code === 20000) {
            // Flexible data extraction to handle both paginated and flat responses
            const rawCompanies = res?.data?.pageData || (Array.isArray(res?.data) ? res?.data : []);
            const flattened = flattenCompanies(rawCompanies);
            put({ allCompanies: flattened });
          }
        } catch (err: any) {
          console.error("Authority: Global Company Sync Failed", err);
        }
      },
      async getAllBranches() {
        try {
          const res = await GetBranchesService({ page: 1, pageSize: 100, sortColumn: "id", sortDirection: "desc" });
          if (res?.meta?.code === 20000) {
            // Flexible data extraction to handle both paginated and flat responses
            const branches = res?.data?.pageData || (Array.isArray(res?.data) ? res?.data : []);
            put({ allBranches: branches });
          }
        } catch (err: any) {
          console.error("Authority: Site Pool Sync Failed", err);
        }
      },
    },
  }),
};

export default UsersModels;
