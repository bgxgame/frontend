<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 标题区 -->
    <div class="flex justify-between items-center border-b border-[#E6E7E8] pb-4">
      <div>
        <h2 class="text-lg font-semibold text-[#1D1D20]">我的计划</h2>
        <p class="text-[#67657F] text-sm mt-1">记录过程，复盘结果</p>
      </div>
      <span class="text-xs text-[#9593A3] bg-white px-2 py-1 rounded border border-[#E6E7E8] font-medium">
        共 {{ plans.length }} 项
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 text-[#67657F]">
      <div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm">正在加载数据...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="plans.length === 0" class="text-center py-20 bg-white rounded-lg border border-dashed border-[#E6E7E8]">
      <div class="text-[#9593A3] mb-2 text-3xl text-gray-300">empty</div>
      <p class="text-[#67657F] text-sm">暂时还没有计划哦 ~</p>
    </div>

    <!-- 列表展示 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white rounded-lg border border-[#E6E7E8] shadow-sm transition-all duration-200 relative flex flex-col group hover:shadow-md hover:border-[#D1D1D6] p-4"
      >
        <!-- 侧边状态指示条 -->
        <div :class="['absolute left-0 top-0 bottom-0 w-0.5 rounded-full', statusColor(plan.status)]"></div>

        <!-- 头部：分类、优先级与操作 -->
        <div class="flex justify-between items-start mb-3 pl-2">
          <div class="flex gap-2 items-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAFAFC] text-[#67657F] border border-[#E6E7E8]">
              {{ plan.category || '未分类' }}
            </span>
            
            <!-- 优先级标签 -->
            <span 
              v-if="plan.priority && plan.priority > 0" 
              :class="['text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider', priorityClass(plan.priority)]"
            >
              P{{ plan.priority }}
            </span>
          </div>

          <!-- 只有登录才显示操作按钮 -->
          <div v-if="isLoggedIn" class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="$emit('edit', plan)" 
              class="p-1 hover:bg-[#F0F1F2] rounded text-[#67657F] hover:text-[#5E6AD2] transition-colors"
              title="编辑"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button 
              @click="deletePlan(plan.id)" 
              class="p-1 hover:bg-red-50 rounded text-[#67657F] hover:text-red-500 transition-colors"
              title="删除"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <!-- 内容 -->
        <div class="pl-2 mb-4 flex-grow">
          <h3 class="font-semibold text-[#1D1D20] text-[15px] leading-tight group-hover:text-[#5E6AD2] transition-colors">
            {{ plan.title }}
          </h3>
          <p class="text-[#67657F] text-sm mt-2 line-clamp-2 leading-relaxed">
            {{ plan.description || '无详细描述' }}
          </p>
        </div>

        <!-- 底部信息 -->
        <div class="pl-2 mt-auto pt-3 border-t border-[#E6E7E8] flex justify-between items-center">
          <span class="flex items-center text-[11px] text-[#9593A3]">
            <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {{ formatDate(plan.due_date) }}
          </span>
          
          <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide" :class="statusBgColor(plan.status)">
            <span class="w-1 h-1 rounded-full mr-1.5" :class="statusPointColor(plan.status)"></span>
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

// 定义 Emits，用于向父组件传递编辑事件
const emit = defineEmits(['edit']);

const plans = ref<Plan[]>([]);
const loading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('token'));

// 获取列表数据
const fetchPlans = async () => {
  loading.value = true;
  try {
    const res = await api.get<Plan[]>('/plans');
    plans.value = res.data;
    isLoggedIn.value = !!localStorage.getItem('token');
  } catch (error) {
    console.error('获取计划列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 删除计划
const deletePlan = async (id: number) => {
  if (!confirm('确定要删除这个计划吗？该操作不可撤销。')) return;
  try {
    await api.delete(`/plans/${id}`);
    await fetchPlans();
  } catch (err) {
    alert('删除失败，可能您没有操作权限。');
  }
};

// 样式辅助：侧边条颜色
const statusColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    default: return 'bg-[#D1D1D6]';
  }
};

// 样式辅助：状态标签背景
const statusBgColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    case 'in_progress': return 'bg-amber-50 text-amber-700 border border-amber-100';
    default: return 'bg-[#F4F4F5] text-[#67657F] border border-[#E6E7E8]';
  }
};

// 样式辅助：状态圆点颜色
const statusPointColor = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    default: return 'bg-[#9593A3]';
  }
};

// 样式辅助：优先级样式
const priorityClass = (p: number) => {
  switch (p) {
    case 3: return 'bg-red-50 text-red-600 border border-red-100'; // High
    case 2: return 'bg-amber-50 text-amber-600 border border-amber-100'; // Medium
    case 1: return 'bg-blue-50 text-blue-600 border border-blue-100'; // Low
    default: return 'bg-gray-50 text-gray-500 border border-gray-100';
  }
};

// 格式化文本
const formatStatus = (s: string) => {
    const map: Record<string, string> = { pending: '待办', in_progress: '进行中', completed: '已完成' };
    return map[s] || s;
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '无截止日期';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  } catch (e) {
    return '日期无效';
  }
};

onMounted(fetchPlans);

// 暴露给父组件 App.vue，以便点击“保存”或“新建”后刷新列表
defineExpose({ fetchPlans });
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>