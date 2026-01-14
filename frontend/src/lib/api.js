import axios from "axios";

export const baseApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
baseApi.interceptors.request.use(
  (config) => {
    // Check if this is an admin route
    const isAdminRoute = config.url?.includes("/admin/");

    if (isAdminRoute) {
      // Use admin token for admin routes
      const adminToken = localStorage.getItem("adminToken");
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Use user token for regular routes
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Remove Content-Type for FormData to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and extract proper error messages
baseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract error message from response
    let errorMessage = "An error occurred";

    if (error.response) {
      // Server responded with error status
      const { data } = error.response;
      
      if (data?.message) {
        errorMessage = data.message;
      } else if (data?.error) {
        errorMessage = data.error;
      } else if (data?.errors && Array.isArray(data.errors)) {
        // Handle validation errors
        errorMessage = data.errors.map(err => err.msg || err.message).join(", ");
      } else if (error.response.status === 401) {
        errorMessage = "Unauthorized. Please login again.";
      } else if (error.response.status === 403) {
        errorMessage = "Access forbidden";
      } else if (error.response.status === 404) {
        errorMessage = "Resource not found";
      } else if (error.response.status === 409) {
        errorMessage = "Conflict. This resource already exists.";
      } else if (error.response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = "Network error. Please check your connection.";
    } else {
      // Something else happened
      errorMessage = error.message || "An unexpected error occurred";
    }

    // Create a new error with the extracted message
    const customError = new Error(errorMessage);
    customError.response = error.response;
    customError.request = error.request;
    customError.status = error.response?.status;

    return Promise.reject(customError);
  }
);