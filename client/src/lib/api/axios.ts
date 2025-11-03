import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  withCredentials: true,
  allowAbsoluteUrls: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response?.status === 401) {
        console.warn("Unauthorized - maybe token expired");
      }
      console.error(
        `[ERROR] ${error.response.status}] ${error.response.config.url}:`,
        error.response.data
      );
    } else {
      console.error("[NETWORK ERROR]", error.message);
    }
    return Promise.reject(error);
  }
);

export function handleAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    console.error("Axios error:", error.response?.data || error.message);
  } else if (error instanceof Error) {
    console.error("Unexpected error:", error.message);
  } else {
    console.error("Unknown error:", error);
  }
}

export default api;
