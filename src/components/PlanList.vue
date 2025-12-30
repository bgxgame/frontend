<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 标题区 -->
    <div class="flex justify-between items-end border-b border-slate-200 pb-4">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">我的计划</h2>
        <p class="text-slate-500 text-sm mt-1">记录生活，追踪进度</p>
      </div>
      <span class="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
        共 {{ plans.length }} 项
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-12 text-slate-400">
      <div class="animate-spin text-4xl mb-2">⏳</div>
      正在加载数据...
    </div>

    <!-- 空状态 -->
    <div v-else-if="plans.length === 0" class="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
      <p class="text-slate-500">暂时还没有计划哦 ~</p>
    </div>

 <!-- 列表展示 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="group bg-white rounded-xl border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 relative flex flex-col"
      >
        <div :class="['absolute left-0 top-0 bottom-0 w-1', statusColor(plan.status)]"></div>

        <!-- 头部 -->
        <div class="flex justify-between items-start mb-3 pl-3">
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            {{ plan.category || '未分类' }}
          </span>
          <!-- 只有登录才显示操作按钮 -->
          <div v-if="isLoggedIn" class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', plan)" class="text-indigo-500 hover:text-indigo-700 text-xs">编辑</button>
            <button @click="deletePlan(plan.id)" class="text-red-400 hover:text-red-600 text-xs">删除</button>
          </div>
        </div>

        <!-- 内容 -->
        <div class="pl-3 mb-4 flex-grow">
          <h3 class="text-lg font-bold text-slate-800">{{ plan.title }}</h3>
          <p class="text-slate-500 text-sm mt-2 line-clamp-3">{{ plan.description }}</p>
        </div>

        <!-- 底部 -->
        <div class="pl-3 mt-auto pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
          <span>📅 {{ formatDate(plan.due_date) }}</span>
          <span :class="['px-2 py-0.5 rounded-full text-white', statusColor(plan.status)]">
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
    case 'in_progress': return 'bg-amber-500'; // 改成橙色区分明显点
    default: return 'bg-slate-400';
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