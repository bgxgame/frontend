<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. 标题区 -->
    <div class="flex justify-between items-center border-b border-[#E6E7E8] pb-4">
      <div>
        <h2 class="text-lg font-semibold text-[#1D1D20]">我的计划</h2>
        <p class="text-[#67657F] text-sm mt-1">记录过程，复盘结果</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span class="text-xs text-[#9593A3] bg-white px-2 py-1 rounded border border-[#E6E7E8] font-medium">
          共 {{ plans.length }} 项
        </span>
      </div>
    </div>

    <!-- 2. 搜索与筛选控制栏 (Linear 风格) -->
    <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
      <!-- 搜索框 -->
      <div class="relative w-full md:w-80 group">
        <span class="absolute inset-y-0 left-3 flex items-center text-[#9593A3] group-focus-within:text-[#5E6AD2] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input 
          v-model="searchText"
          type="text" 
          placeholder="搜索标题或描述..."
          class="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-[#E6E7E8] rounded-md focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] outline-none transition-all placeholder:text-gray-300"
        />
      </div>

      <!-- 状态分段控制器 (Segmented Control) -->
      <div class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8] w-full md:w-auto">
        <button 
          v-for="s in [
            { id: 'all', label: '全部' }, 
            { id: 'pending', label: '待办' }, 
            { id: 'in_progress', label: '进行中' }, 
            { id: 'completed', label: '已完成' }
          ]"
          :key="s.id"
          @click="setStatusFilter(s.id)"
          :class="[
            'flex-1 md:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all duration-200 uppercase tracking-tight',
            activeStatus === s.id 
              ? 'bg-white shadow-sm text-[#5E6AD2] ring-1 ring-black/5' 
              : 'text-[#67657F] hover:text-[#1D1D20]'
          ]"
        >
          {{ s.label }}
        </button>
      </div>
    </div>

    <!-- 3. 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-[#67657F]">
      <div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm font-medium">正在同步数据...</p>
    </div>

    <!-- 4. 空状态 -->
    <div v-else-if="plans.length === 0" class="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-[#E6E7E8]">
      <div class="w-12 h-12 bg-[#FAFAFC] rounded-full flex items-center justify-center mb-4 border border-[#F0F0F2]">
        <svg class="w-6 h-6 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <p class="text-[#67657F] text-sm">没有找到符合条件的计划</p>
      <button v-if="searchText || activeStatus !== 'all'" @click="resetFilters" class="mt-4 text-[#5E6AD2] text-xs font-bold hover:underline">
        重置所有筛选条件
      </button>
    </div>

    <!-- 5. 列表展示 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="plan in plans" 
        :key="plan.id" 
        class="bg-white rounded-xl border border-[#E6E7E8] shadow-sm transition-all duration-300 relative flex flex-col group hover:shadow-lg hover:border-[#D1D1D6] hover:-translate-y-0.5 p-5"
      >
        <div :class="['absolute left-0 top-0 bottom-0 w-1 rounded-full opacity-60', statusColor(plan.status)]"></div>

        <!-- 头部 -->
        <div class="flex justify-between items-start mb-4">
          <div class="flex gap-2 items-center">
            <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#F4F4F5] text-[#67657F] border border-[#E6E7E8]">
              {{ plan.category || '未分类' }}
            </span>
            <span 
              v-if="plan.priority > 0" 
              :class="['text-[10px] px-2 py-0.5 rounded font-black uppercase tracking-tighter border', priorityClass(plan.priority)]"
            >
              P{{ plan.priority }}
            </span>
          </div>

          <div v-if="isLoggedIn" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', plan)" class="p-1.5 hover:bg-[#F0F1F2] rounded-md text-[#67657F] hover:text-[#5E6AD2] transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
            <button @click="deletePlan(plan.id)" class="p-1.5 hover:bg-red-50 rounded-md text-[#67657F] hover:text-red-500 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>

        <!-- 内容 -->
        <div class="mb-5 flex-grow">
          <h3 class="font-bold text-[#1D1D20] text-[15px] leading-snug group-hover:text-[#5E6AD2] transition-colors">
            {{ plan.title }}
          </h3>
          <p class="text-[#67657F] text-[13px] mt-2 line-clamp-2 leading-relaxed">
            {{ plan.description || 'No additional description provided.' }}
          </p>
        </div>

        <!-- 底部 -->
        <div class="mt-auto pt-4 border-t border-[#F0F0F2] flex justify-between items-center">
          <div class="flex items-center text-[11px] font-medium text-[#9593A3]">
            <svg class="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            {{ formatDate(plan.due_date) }}
          </div>
          
          <div class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border" :class="statusBgColor(plan.status)">
            <span class="w-1.5 h-1.5 rounded-full mr-2" :class="statusPointColor(plan.status)"></span>
            {{ formatStatus(plan.status) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../api';
import type { Plan } from '../types';

const emit = defineEmits(['edit']);

const plans = ref<Plan[]>([]);
const loading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('token'));

// 搜索与过滤状态
const searchText = ref('');
const activeStatus = ref('all');

// 获取列表数据 (带参数)
const fetchPlans = async () => {
  loading.value = true;
  try {
    const params: Record<string, string> = {};
    if (searchText.value.trim()) params.q = searchText.value.trim();
    if (activeStatus.value !== 'all') params.status = activeStatus.value;

    const res = await api.get<Plan[]>('/plans', { params });
    plans.value = res.data;
    isLoggedIn.value = !!localStorage.getItem('token');
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    loading.value = false;
  }
};

// 重置过滤器
const resetFilters = () => {
  searchText.value = '';
  activeStatus.value = 'all';
  fetchPlans();
};

// 状态过滤切换
const setStatusFilter = (id: string) => {
  activeStatus.value = id;
  fetchPlans();
};

// 搜索防抖
let debounceTimer: any = null;
watch(searchText, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchPlans();
  }, 350);
});

const deletePlan = async (id: number) => {
  if (!confirm('确定要永久删除此计划吗？')) return;
  try {
    await api.delete(`/plans/${id}`);
    await fetchPlans();
  } catch (err) {
    alert('删除失败');
  }
};

// 辅助样式函数
const statusColor = (s: string) => {
  if (s === 'completed') return 'bg-emerald-500';
  if (s === 'in_progress') return 'bg-amber-500';
  return 'bg-gray-300';
};

const statusBgColor = (s: string) => {
  if (s === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s === 'in_progress') return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const statusPointColor = (s: string) => {
  if (s === 'completed') return 'bg-emerald-500';
  if (s === 'in_progress') return 'bg-amber-500';
  return 'bg-gray-400';
};

const priorityClass = (p: number) => {
  if (p === 3) return 'bg-red-50 text-red-600 border-red-100';
  if (p === 2) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (p === 1) return 'bg-blue-50 text-blue-600 border-blue-100';
  return 'bg-gray-50 text-gray-400 border-gray-100';
};

const formatStatus = (s: string) => {
  const map: any = { pending: '待办', in_progress: '进行中', completed: '已完成' };
  return map[s] || s;
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '无截止日期';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

onMounted(fetchPlans);

defineExpose({ fetchPlans });
</script>

<style scoped>
/* 限制描述文本行数 */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
</style>