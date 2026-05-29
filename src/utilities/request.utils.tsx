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
  rawData?: any;
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
      data: data,
    };
  }

  return new Promise((resolve, reject) => {
    // Validate url parameter
    if (!url) {
      const errorMessage = `[API Error] URL is undefined. Please check your API configuration.`;
      if (process.env.NODE_ENV === "development") {
        console.error(errorMessage);
      }
      return reject({
        success: false,
        message: "Invalid API endpoint configuration",
        data: null,
      });
    }

    axios
      .request({
        url: `${baseUrl.replace(/\/$/, "")}/${url.replace(/^\//, "")}`,
        headers: {
          ...(bodyType !== "formData"
            ? { "Content-Type": "application/json;charset=UTF-8" }
            : {}),
          "ngrok-skip-browser-warning": "true",
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        method,
        responseType,
        ...extendedItems,
      })
      .then((response) => {
        // Axios might have failed to parse if the body was empty but content-type was JSON
        const payload = response.data;

        // Debug: Log the full payload structure
        if (process.env.NODE_ENV === "development") {
          console.log(`[API Response] ${method} ${url}`, {
            payload,
            hasMeta: !!payload?.meta,
            hasData: !!payload?.data,
          });
        }

        // Ensure we have a valid payload object
        if (payload && typeof payload === "object" && payload.meta) {
          const { meta, data } = payload;
          const result: any = {
            success: meta.success,
            message: meta.message,
            meta,
          };

          // Handle Paginated Data
          if (data && data.pageInfo && Array.isArray(data.pageData)) {
            // For paginated responses, extract the array for data prop
            // Store full structure separately for components that need it
            result.data = data.pageData;
            result.pagination = data.pageInfo;
            // Preserve full structure for custom implementations
            result.rawData = data;
          } else {
            // Non-paginated response: data is already the array
            result.data = data;
          }

          resolve(result);
        } else {
          // Fallback for direct responses or empty bodies
          // If payload is empty string, return a structured empty success response
          if (payload === "" || payload === null || payload === undefined) {
            resolve({
              success: true,
              message: "Success",
              data: null as any,
              meta: { code: response.status === 204 ? 20000 : response.status },
            });
          } else {
            resolve(payload);
          }
        }
      })
      .catch((error) => {
        const status = error?.response?.status;
        const errPayload = error?.response?.data;

        // Debugging for development
        if (process.env.NODE_ENV === "development") {
          console.error(`[API Error] ${method} ${url}`, {
            status,
            error: errPayload || error.message,
            fullError: error,
          });
        }

        // Handle 401 Unauthorized - redirect to login
        if (status === 401) {
          // In development, we skip auto-logout redirect for debugging purposes
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[Auth] 401 Unauthorized detected. Skipping auto-logout redirect for debugging.",
            );
          } else {
            // Clear auth data
            if (typeof window !== "undefined") {
              localStorage.removeItem("THEGREEN@TOKEN");
              localStorage.removeItem("THEGREEN@USER");

              // Only redirect if not already on login page
              if (!window.location.pathname.includes("/auth/login")) {
                window.location.href = "/auth/login";
              }
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

        // Handle other errors with meta structure
        if (errPayload && errPayload.meta) {
          return reject({
            success: errPayload.meta.success,
            message: errPayload.meta.message || error.message,
            data: errPayload.data,
          });
        }

        // Default error handler
        return reject({
          success: false,
          message:
            errPayload?.message ||
            error.message ||
            "Terjadi kesalahan pada server",
          data: null,
        });
      });
  });
}
