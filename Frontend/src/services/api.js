import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3955/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || "";
    if ((status === 401 || status === 403) && !url.includes("/auth/")) {
      const role = localStorage.getItem("role");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = role === "ADMIN" ? "/admin/login" : "/login";
    }
    return Promise.reject(err);
  }
);

export default API;