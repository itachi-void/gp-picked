import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api/proxy",
});

// Interceptor لإضافة التوكن تلقائياً مع كل طلب
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
