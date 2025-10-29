import axios from "axios";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? import.meta.env.VITE_BACKEND_URL  // .env से लेगा
    : import.meta.env.VITE_BACKEND_URL || "/api"; // fallback


const BASE_URL1 = import.meta.env.MODE === "devlopment" ? BASE_URL : "/api"

const api = axios.create({
  baseURL: BASE_URL1,
  withCredentials: true,
});

export default api;
