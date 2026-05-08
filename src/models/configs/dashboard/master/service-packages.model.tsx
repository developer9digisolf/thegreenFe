import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqServicePackage,
  IServicePackage,
  ICreateServicePackageRequest,
  IUpdateServicePackageRequest,
} from "@afx/interfaces/service-package.iface";
import {
  GetServicePackagesService,
  GetServicePackageService,
  CreateServicePackageService,
  UpdateServicePackageService,
  DeleteServicePackageService,
} from "@afx/services/master/service-packages.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionServicePackage = {
  getServicePackages: (param: IReqServicePackage) => void;
  getServicePackage: (id: number) => void;
  createServicePackage: (
    param: ICreateServicePackageRequest,
    callback: (code: number) => void,
  ) => void;
  updateServicePackage: (
    id: number,
    param: IUpdateServicePackageRequest,
    callback: (code: number) => void,
  ) => void;
  deleteServicePackage: (id: number, callback: (code: number) => void) => void;
};

export type IStateServicePackage = {
  servicePackages: IServicePackage[];
  servicePackage: IServicePackage;
  pageInfo: IResPagination;
};

const ServicePackagesModels: IModelDefinitions<IStateServicePackage, IActionServicePackage> = {
  name: "servicePackages",
  model: (put, getStates, getActions) => ({
    state: {
      servicePackages: [],
      servicePackage: {} as IServicePackage,
      pageInfo: {} as IResPagination,
    },
    actions: {
      async getServicePackages(data) {
        try {
          const res = await GetServicePackagesService(data);
          if (res?.meta.code === 20000) {
            put({
              servicePackages: res?.data || [],
              pageInfo: res?.pagination || {},
            });
          }
        } catch (err: any) {
          notification.warning({
            title: "Gagal memuat data",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_SERVICE_PACKAGES",
          });
        }
      },
      async getServicePackage(id) {
        try {
          const res = await GetServicePackageService(id);
          if (res?.meta?.code === 20000) {
            put({ servicePackage: res?.data });
          }
        } catch (err: any) {
          notification.warning({
            title: "Gagal memuat detail",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_SERVICE_PACKAGES",
          });
        }
      },
      async createServicePackage(data, callback) {
        try {
          const res = await CreateServicePackageService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Paket voucher berhasil didaftarkan",
            duration: 2,
            key: "FUNC-CREATE_SERVICE_PACKAGES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal menyimpan",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_SERVICE_PACKAGES",
          });
        }
      },
      async updateServicePackage(id, data, callback) {
        try {
          const res = await UpdateServicePackageService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Paket voucher berhasil diperbarui",
            duration: 2,
            key: "FUNC-UPDATE_SERVICE_PACKAGES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal memperbarui",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_SERVICE_PACKAGES",
          });
        }
      },
      async deleteServicePackage(id, callback) {
        try {
          const res = await DeleteServicePackageService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Paket voucher berhasil dihapus",
            duration: 2,
            key: "FUNC-DELETE_SERVICE_PACKAGES",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal menghapus",
            description: err?.message || err?.meta?.message || "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_SERVICE_PACKAGES",
          });
        }
      },
    },
  }),
};

export default ServicePackagesModels;
