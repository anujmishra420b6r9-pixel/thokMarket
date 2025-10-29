import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_BACKEND_URL  // .env से लेगा
    : import.meta.env.VITE_BACKEND_URL || "/api"; // fallback

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
