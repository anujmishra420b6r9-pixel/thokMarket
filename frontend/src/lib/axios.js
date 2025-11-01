import axios from "axios";

// 🔹 Direct backend URL define कर दो
const BASE_URL = "https://thokmarket.onrender.com/api";

// 🔹 Axios instance बनाओ
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;
