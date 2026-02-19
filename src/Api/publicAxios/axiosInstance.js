import axios from "axios";

const axiosInstance = axios.create({
  // Use your local backend URL
  // baseURL: "https://ecom-clothing-site.onrender.com/",
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Request Interceptor
 * Useful for automatically adding Auth Tokens (JWT) to every request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // Assuming you store JWT in localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Useful for handling global errors (like 401 Unauthorized) in one place
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: If the token expires (401), you could log the user out automatically
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      // localStorage.removeItem("token");
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;