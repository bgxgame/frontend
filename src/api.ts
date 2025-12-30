// src/api.ts
import axios from 'axios';

// 创建 axios 实例
const api = axios.create({
  // 指向你的 Rust 后端地址
  baseURL: 'http://127.0.0.1:3000/api', 
  timeout: 5000,
});

// 请求拦截器：自动携带 Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;