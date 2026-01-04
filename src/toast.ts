// src/toast.ts
import { reactive } from 'vue';

// 通知类型
export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

// 定义一个响应式存储
export const toastStore = reactive({
  toasts: [] as ToastItem[],
  
  // 显示通知的方法
  show(message: string, type: ToastType = 'success', duration = 3000) {
    const id = Date.now();
    this.toasts.push({ id, message, type });

    // 自动移除
    setTimeout(() => {
      this.remove(id);
    }, duration);
  },

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
});