// src/api.ts
import axios from 'axios';
import { toastStore } from './toast';

// 创建 Axios 实例
const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 8000,
});

// --- 无感刷新相关状态变量 ---
let isRefreshing = false; // 标记是否正在执行刷新 Token 的请求
let requestsQueue: any[] = []; // 存储因 401 被挂起的请求

/**
 * 处理挂起队列
 * @param error 刷新失败时的错误对象
 * @param token 刷新成功后的新 Access Token
 */
const processQueue = (error: any, token: string | null = null) => {
  requestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  requestsQueue = [];
};

// --- 1. 请求拦截器：注入 Access Token ---
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // 确保使用标准的 Bearer 格式
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- 2. 响应拦截器：核心无感刷新逻辑 ---
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // 如果返回 401 (Unauthorized) 且该请求没有被标记为“已重试过”
    if (response?.status === 401 && !originalRequest._retry) {
      
      // 如果当前已经在刷新 Token 中，则将此请求包装成 Promise 放入队列
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          requestsQueue.push({ resolve, reject });
        })
          .then((token) => {
            // 刷新成功后，更新 Header 并重新发起请求
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api.request(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // 标记该请求正在尝试重试，避免 401 循环
      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');

      // 连 Refresh Token 都没有，直接判死刑，跳回登录
      if (!refreshToken) {
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // 【关键】使用原生 axios 发起刷新请求，不要用上面定义的 api 实例，防止触发拦截器死循环
        const res = await axios.post('http://127.0.0.1:3000/api/refresh', {
          refresh_token: refreshToken
        });

        const { token: newAccessToken, refresh_token: newRefreshToken } = res.data;

        // 更新本地存储的令牌对
        localStorage.setItem('token', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refresh_token', newRefreshToken);
        }

        // 释放队列：通知所有挂起的请求可以继续了，并传递新 Token
        processQueue(null, newAccessToken);

        // 重置原始请求的 Header 为新 Token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        
        // 重新发起原始请求并返回其结果（用户感知不到这一步）
        return api.request(originalRequest);

      } catch (refreshError: any) {
        // 如果刷新接口也报错（比如 Refresh Token 过期了），则彻底清理并退出
        processQueue(refreshError, null);
        handleLogout();
        
        // 只有当不是因为取消请求导致报错时，才弹窗
        if (!axios.isCancel(refreshError)) {
          toastStore.show("登录会话已过期，请重新登录", "error");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // --- 3. 统一错误处理 (非 401 情况) ---
    if (response?.status !== 401) {
      const displayMessage = response?.data?.message || '网络请求失败';
      
      // 针对后端验证失败 (Validation) 的错误详情展示
      const errors = response?.data?.errors;
      if (errors && typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        if (firstKey && errors[firstKey][0]) {
          toastStore.show(errors[firstKey][0], 'error');
        } else {
          toastStore.show(displayMessage, 'error');
        }
      } else {
        // 如果没有特定错误详情，显示通用 message
        toastStore.show(displayMessage, 'error');
      }
    }

    return Promise.reject(error);
  }
);

/**
 * 彻底退出登录的清理逻辑
 */
function handleLogout() {
  localStorage.clear(); // 清理所有用户信息和 Token
  
  // 如果不在登录页，则强制回到首页（即触发 AuthPage 显示）
  if (!window.location.pathname.includes('/login')) {
    // 强制跳转/刷新是重置 Vue 响应式状态最简单稳妥的方法
    window.location.href = '/'; 
  }
}

export default api;