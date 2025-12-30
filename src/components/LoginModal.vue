<!-- src/components/LoginModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- 内容框 -->
    <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 overflow-hidden">
      <h2 class="text-2xl font-bold text-center mb-6 text-slate-800">管理员登录</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">用户名</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            required
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? '登录中...' : '立即登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import api from '../api';

defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'login-success']);

const loading = ref(false);
const errorMsg = ref('');
const form = reactive({ username: '', password: '' });

const handleLogin = async () => {
  loading.value = true;
  errorMsg.value = '';
  
  try {
    const res = await api.post('/login', form);
    // 保存 Token 和 用户名
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    
    // 通知父组件登录成功
    emit('login-success');
    emit('close');
  } catch (err: any) {
    console.error(err);
    errorMsg.value = err.response?.status === 401 
      ? '用户名或密码错误' 
      : '登录失败，请检查网络';
  } finally {
    loading.value = false;
  }
};
</script>