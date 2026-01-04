<!-- src/components/LoginModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <!-- 内容框 -->
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-sm p-6 overflow-hidden border border-[#E6E7E8]">
      <h2 class="text-lg font-semibold text-center mb-4 text-[#1D1D20]">管理员登录</h2>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#67657F] mb-1">用户名</label>
          <input 
            v-model="form.username" 
            type="text" 
            class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition"
            required
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-[#67657F] mb-1">密码</label>
          <input 
            v-model="form.password" 
            type="password" 
            class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition"
            required
          />
        </div>

        <div v-if="errorMsg" class="text-xs text-red-500 text-center bg-red-50 p-2 rounded">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full px-3 py-1.5 rounded-md font-medium transition-all duration-200 border border-transparent bg-[#5E6AD2] text-white hover:bg-[#525BC2]"
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