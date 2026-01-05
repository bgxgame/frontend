// src/api.ts
import axios from 'axios';
import { toastStore } from './toast';
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

      // 1. 【关键修复】将这里从 const 改为 let
      let displayMessage = data.message || '网络请求失败';

      // 2. 如果后端返回了具体的 errors 对象（校验失败）
      if (data.errors && typeof data.errors === 'object') {
        try {
          const firstField = Object.keys(data.errors)[0];
          // 添加检查确保 firstField 存在
          if (firstField && data.errors[firstField] && Array.isArray(data.errors[firstField]) && data.errors[firstField].length > 0) {
            const firstError = data.errors[firstField][0];
            if (firstError) {
              displayMessage = firstError; // 只有 let 声明的变量才能被这样重新赋值
            }
          }
        } catch (e) {
          console.error("解析错误详情失败", e);
        }
      }

      // 只有在不是 401 的时候才弹 Toast
      // 401 通常代表未登录或过期，可能会有专门的逻辑（如跳转登录），不一定需要红色报错
      if (status !== 401) {
        toastStore.show(displayMessage, 'error');
      }
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