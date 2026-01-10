<!-- src/components/AuthPage.vue -->
<template>
  <div class="w-full max-w-[360px] animate-in fade-in zoom-in duration-500">
    <!-- Logo 区域 -->
    <div class="flex justify-center mb-8">
      <div class="w-10 h-10 bg-[#5E6AD2] rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>

    <div class="text-center mb-8">
      <h1 class="text-xl font-bold text-[#1D1D20] tracking-tight">
        {{ isLogin ? '登录到 LifePlan' : '创建新账号' }}
      </h1>
      <p class="text-[#67657F] text-sm mt-1.5 font-medium">
        {{ isLogin ? '继续管理你的高效生活' : '开始记录你的成长过程' }}
      </p>
    </div>

    <div class="bg-white p-6 rounded-xl border border-[#E6E7E8] shadow-sm">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-[10px] font-bold text-[#9593A3] uppercase tracking-widest mb-1.5 ml-1">Username</label>
          <input 
            v-model="form.username" 
            type="text" 
            required
            class="w-full px-3 py-2 text-sm bg-[#FAFAFC] border border-[#E6E7E8] rounded-md focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] outline-none transition-all"
            placeholder="用户名"
          />
        </div>

        <div>
          <label class="block text-[10px] font-bold text-[#9593A3] uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input 
            v-model="form.password" 
            type="password" 
            required
            class="w-full px-3 py-2 text-sm bg-[#FAFAFC] border border-[#E6E7E8] rounded-md focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] outline-none transition-all"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full py-2 bg-[#5E6AD2] text-white rounded-md text-sm font-bold hover:bg-[#525BC2] active:scale-[0.98] transition-all disabled:opacity-50 shadow-md shadow-indigo-100 mt-2"
        >
          <span v-if="loading" class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></span>
          {{ isLogin ? '立即登录' : '注册账号' }}
        </button>
      </form>

      <div class="mt-6 pt-4 border-t border-[#F0F0F2] text-center">
        <button @click="isLogin = !isLogin" class="text-[13px] text-[#5E6AD2] font-semibold hover:underline">
          {{ isLogin ? '还没有账号？去注册' : '已有账号？返回登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import api from '../api';
import { toastStore } from '../toast';

const emit = defineEmits(['login-success']);

const isLogin = ref(true);
const loading = ref(false);
const form = reactive({ username: '', password: '' });

const handleSubmit = async () => {
  loading.value = true;
  const endpoint = isLogin.value ? '/login' : '/register';
  try {
    const res = await api.post(endpoint, form);
    if (isLogin.value) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      localStorage.setItem('username', res.data.username);
      toastStore.show(`欢迎回来, ${res.data.username}`);
      emit('login-success');
    } else {
      toastStore.show('注册成功，请登录');
      isLogin.value = true;
      form.password = '';
    }
  } catch (err: any) {
    // 错误由 api.ts 拦截并 Toast
  } finally {
    loading.value = false;
  }
};
</script>