// src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 5000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理统一报错
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // 1. 如果 Token 过期
      if (status === 401) {
        localStorage.removeItem('token');
        // 可以触发全局事件让页面跳转到登录或刷新
        if (!window.location.pathname.includes('/login')) {
           // window.location.reload(); 
        }
      }

      // 2. 格式化错误信息供组件使用
      // 即使是报错，我们也把后端返回的 message 抛出去
      return Promise.reject(error);
    }
    return Promise.reject(new Error('网络连接异常'));
  }
);

export default api;