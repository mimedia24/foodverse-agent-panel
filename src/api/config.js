import axios from "axios";

const fallbackBaseUrl = "https://api.foodversedelivery.com/api/v3";
const envBaseUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_PATH;

const api = axios.create({
  baseURL: envBaseUrl || fallbackBaseUrl,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("AccessToken");

    if (token) {
      config.headers.AccessToken = token;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("AccessToken");
      localStorage.removeItem("userId");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;