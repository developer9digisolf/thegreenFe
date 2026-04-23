import axios, { ResponseType } from "axios";

interface IRequestPayloads<T = any> {
  url: string;
  method: "GET" | "PUT" | "DELETE" | "PATCH" | "POST";
  headers?: any;
  data?: T;
  bodyType?: "raw" | "formData";
  responseType?: ResponseType;
}

interface IResponsePayloads<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: any;
  meta?: any;
}

// Get token directly from localStorage
function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("THEGREEN@TOKEN");
  }
  return null;
}

export default async function request<T = any, R = any>({
  url,
  method = "GET",
  headers = {},
  bodyType = "raw",
  responseType = "json",
  data,
}: IRequestPayloads<R>): Promise<IResponsePayloads<T>> {
  const token = getToken();
  const baseUrl =
    process.env.NEXT_PUBLIC_BASEURL || "http://localhost:5100/api/";

  let extendedItems: any = {};

  if (method === "GET") {
    extendedItems = {
      params: data,
    };
  } else {
    extendedItems = {
      data: bodyType === "formData" ? data : JSON.stringify({ ...data }),
    };
  }

  return new Promise((resolve, reject) =>
    axios
      .request({
        url: `${baseUrl}${url}`,
        headers: {
          "Content-Type":
            bodyType === "formData" ?
              "multipart/form-data"
            : "application/json;charset=UTF-8",
          "Access-Control-Allow-Origin": "*",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        method,
        responseType,
        ...extendedItems,
      })
      .then((response) => {
        const payload = response.data;

        // Check if it follows the TheGreenApi structure containing 'meta'
        if (payload && payload.meta) {
          const { meta, data } = payload;
          const result: any = {
            success: meta.success,
            message: meta.message,
            data: data,
            meta,
          };

          // Handle Paginated Data
          if (data && data.pageInfo && Array.isArray(data.pageData)) {
            result.data = data.pageData;
            result.pagination = data.pageInfo;
          }

          resolve(result);
        } else {
          // Fallback for direct responses
          resolve(payload);
        }
      })
      .catch((error) => {
        const status = error?.response?.status;
        const errPayload = error?.response?.data;

        // Handle 401 Unauthorized - redirect to login
        if (status === 401) {
          // Clear auth data
          if (typeof window !== "undefined") {
            localStorage.removeItem("THEGREEN@TOKEN");
            localStorage.removeItem("THEGREEN@USER");

            // Only redirect if not already on login page
            if (!window.location.pathname.includes("/auth/login")) {
              window.location.href = "/auth/login";
            }
          }

          return reject({
            success: false,
            message:
              errPayload?.meta?.message ||
              "Sesi Anda telah berakhir. Silakan login kembali.",
            data: null,
          });
        }

        // Handle 403 Forbidden
        if (status === 403) {
          return reject({
            success: false,
            message:
              errPayload?.meta?.message ||
              "Anda tidak memiliki akses ke resource ini.",
            data: null,
          });
        }

        // Handle other errors
        if (errPayload && errPayload.meta) {
          return reject({
            success: errPayload.meta.success,
            message: errPayload.meta.message || error.message,
            data: errPayload.data,
          });
        }

        return reject({
          success: false,
          message:
            errPayload?.message ||
            error.message ||
            "Terjadi kesalahan pada server",
          data: null,
        });
      }),
  );
}
