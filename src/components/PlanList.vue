<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 标题区 -->
    <div class="flex justify-between items-center border-b border-[#E6E7E8] pb-4">
      <div>
        <p class="text-[#67657F] text-sm mt-1">记录过程，复盘结果</p>
      </div>
      <span class="text-xs text-[#9593A3] bg-white px-2 py-1 rounded border border-[#E6E7E8]">
        共 {{ plans.length }} 项
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12 text-[#67657F]">
      <div class="animate-spin text-4xl mb-2">⏳</div>
      正在加载数据...
    </div>

    <!-- 空状态 -->
    <div v-else-if="plans.length === 0" class="text-center py-12 bg-white rounded-lg border border-[#E6E7E8]">
      <p class="text-[#67657F]">暂时还没有计划哦 ~</p>
    </div>

    <!-- 列表展示 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white rounded-lg border border-[#E6E7E8] shadow-sm transition-all duration-200 relative flex flex-col group hover:shadow-md p-4"
      >
        <div :class="['absolute left-0 top-0 bottom-0 w-0.5 rounded-full', statusColor(plan.status)]"></div>

        <!-- 头部 -->
        <div class="flex justify-between items-start mb-3 pl-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#FAFAFC] text-[#67657F]">
            {{ plan.category || '未分类' }}
          </span>
          <!-- 只有登录才显示操作按钮 -->
          <div v-if="isLoggedIn" class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', plan)" class="text-xs text-[#67657F] hover:text-[#5E6AD2]">编辑</button>
            <button @click="deletePlan(plan.id)" class="text-xs text-[#67657F] hover:text-red-500">删除</button>
          </div>
        </div>

        <!-- 内容 -->
        <div class="pl-2 mb-3 flex-grow">
          <h3 class="font-semibold text-[#1D1D20] leading-tight">{{ plan.title }}</h3>
          <p class="text-[#67657F] text-sm mt-2 line-clamp-3">{{ plan.description }}</p>
        </div>

        <!-- 底部 -->
        <div class="pl-2 mt-auto pt-3 border-t border-[#E6E7E8] flex justify-between items-center text-xs text-[#9593A3]">
          <span class="flex items-center">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {{ formatDate(plan.due_date) }}
          </span>
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium" :class="statusBgColor(plan.status)">
            {{ formatStatus(plan.status) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import api from '../api';
import type { Plan } from '../types';

// 定义 Emits
const emit = defineEmits(['edit']);

const plans = ref<Plan[]>([]);
const loading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('token')); // 简单判断

const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await api.get<Plan[]>('/plans');
    plans.value = res.data;
    // 更新登录状态，防止 token 过期后这里状态不一致
    isLoggedIn.value = !!localStorage.getItem('token');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const deletePlan = async (id: number) => {
  if (!confirm('确定要删除这个计划吗？')) return;
  try {
    await api.delete(`/plans/${id}`);
    await fetchPlans(); // 删除后刷新
  } catch (err) {
    alert('删除失败');
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    default: return 'bg-[#9593A3]';
  }
};

const statusBgColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    case 'in_progress': return 'bg-amber-100 text-amber-800';
    default: return 'bg-[#FAFAFC] text-[#67657F]';
  }
};

const formatStatus = (s: string) => {
    const map: Record<string, string> = { pending: '待办', in_progress: '进行中', completed: '完成' };
    return map[s] || s;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '无截止日期';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

onMounted(fetchPlans);

// 暴露给父组件使用
defineExpose({ fetchPlans });
</script>