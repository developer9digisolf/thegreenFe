import { IModelDefinitions } from "@afx/interfaces/global.iface";
import { notification } from "@afx/utils/antd-global";
import {
  IReqPromoBanner,
  PromoBanner,
  CreatePromoBannerRequest,
  UpdatePromoBannerRequest,
} from "@afx/interfaces/promo-banner.iface";
import { IServicePackage } from "@afx/interfaces/service-package.iface";
import { ICreditPackage } from "@afx/interfaces/credit-package.iface";
import {
  GetPromoBannersService,
  GetPromoBannerService,
  CreatePromoBannerService,
  UpdatePromoBannerService,
  DeletePromoBannerService,
  GetActivePackagesService,
  GetActiveCreditPackagesService,
} from "@afx/services/master/promo-banner.service";
import { IResPagination } from "@afx/interfaces/common.iface";

export type IActionPromoBanner = {
  getPromoBanners: (param: IReqPromoBanner) => void;
  getPromoBanner: (id: number, callback: (data: PromoBanner) => void) => void;
  createPromoBanner: (
    param: CreatePromoBannerRequest,
    callback: (code: number) => void,
  ) => void;
  updatePromoBanner: (
    id: number,
    param: UpdatePromoBannerRequest,
    callback: (code: number) => void,
  ) => void;
  deletePromoBanner: (id: number, callback: (code: number) => void) => void;
  getActivePackages: (params?: any) => void;
  getActiveCreditPackages: () => void;
};

export type IStatePromoBanner = {
  promoBanners: PromoBanner[];
  promoBanner: PromoBanner;
  pageInfo: IResPagination;
  packages: IServicePackage[];
  creditPackages: ICreditPackage[];
};

const PromoBannersModels: IModelDefinitions<
  IStatePromoBanner,
  IActionPromoBanner
> = {
  name: "promoBanners",
  model: (put, getStates, getActions) => ({
    state: {
      promoBanners: [],
      promoBanner: {} as PromoBanner,
      pageInfo: {} as IResPagination,
      packages: [],
      creditPackages: [],
    },
    actions: {
      async getActivePackages(params?: any) {
        try {
          const res = await GetActivePackagesService(params);
          if (res?.meta?.code === 20000) {
            put({ packages: res?.data || [] });
          }
        } catch (err: any) {
          console.error("Failed to fetch packages:", err);
        }
      },
      async getActiveCreditPackages() {
        try {
          const res = await GetActiveCreditPackagesService();
          if (res?.meta?.code === 20000) {
            put({ creditPackages: res?.data || [] });
          }
        } catch (err: any) {
          console.error("Failed to fetch credit packages:", err);
        }
      },
      async getPromoBanners(data) {
        try {
          const res = await GetPromoBannersService(data);
          if (res?.meta.code === 20000) {
            // API returns data directly as array and pagination separately
            const pageData = Array.isArray(res?.data) ? res?.data : [];
            const resAny = res as any;
            const pageInfo = resAny?.pagination || resAny?.pageInfo || {};
            put({
              promoBanners: pageData,
              pageInfo: pageInfo,
            });
          }
        } catch (err: any) {
          notification.warning({
            title: "Gagal memuat data",
            description:
              err?.message ||
              err?.meta?.message ||
              "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_PROMO_BANNERS",
          });
        }
      },
      async getPromoBanner(id, callback) {
        try {
          const res = await GetPromoBannerService(id);
          if (res?.meta?.code === 20000) {
            put({ promoBanner: res?.data });
            callback?.(res?.data);
          }
        } catch (err: any) {
          notification.warning({
            title: "Gagal memuat detail",
            description:
              err?.message ||
              err?.meta?.message ||
              "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-GET_DETAIL_PROMO_BANNERS",
          });
        }
      },
      async createPromoBanner(data, callback) {
        try {
          const res = await CreatePromoBannerService(data);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Promo banner berhasil didaftarkan",
            duration: 2,
            key: "FUNC-CREATE_PROMO_BANNERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal menyimpan",
            description:
              err?.message ||
              err?.meta?.message ||
              "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-CREATE_PROMO_BANNERS",
          });
        }
      },
      async updatePromoBanner(id, data, callback) {
        try {
          const res = await UpdatePromoBannerService(id, data);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Promo banner berhasil diperbarui",
            duration: 2,
            key: "FUNC-UPDATE_PROMO_BANNERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal memperbarui",
            description:
              err?.message ||
              err?.meta?.message ||
              "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-UPDATE_PROMO_BANNERS",
          });
        }
      },
      async deletePromoBanner(id, callback) {
        try {
          const res = await DeletePromoBannerService(id);
          callback(res?.meta?.code);
          notification.success({
            title: "Berhasil",
            description: "Promo banner berhasil dihapus",
            duration: 2,
            key: "FUNC-DELETE_PROMO_BANNERS",
          });
        } catch (err: any) {
          callback(402);
          notification.warning({
            title: "Gagal menghapus",
            description:
              err?.message ||
              err?.meta?.message ||
              "Terjadi kesalahan pada server",
            duration: 2,
            key: "FUNC-DELETE_PROMO_BANNERS",
          });
        }
      },
    },
  }),
};

export default PromoBannersModels;
