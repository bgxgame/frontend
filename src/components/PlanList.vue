<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. 标题区 -->
    <div class="flex justify-between items-center border-b border-[#E6E7E8] pb-4">
      <div>
        <!-- <h2 class="text-xl font-bold text-[#1D1D20] tracking-tight">我的计划</h2> -->
        <p class="text-[#67657F] text-sm mt-1">记录过程，复盘结果</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span
          class="text-xs text-[#9593A3] bg-white px-3 py-1.5 rounded-md border border-[#E6E7E8] font-semibold shadow-sm">
          共 {{ plans.length }} 项任务
        </span>
      </div>
    </div>

    <!-- 2. 搜索、筛选与视图切换栏 -->
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
      <!-- 搜索框 -->
      <div class="relative w-full lg:w-96 group">
        <span
          class="absolute inset-y-0 left-3 flex items-center text-[#9593A3] group-focus-within:text-[#5E6AD2] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </span>
        <input v-model="searchText" type="text" placeholder="快速搜索任务..."
          class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#E6E7E8] rounded-md focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] outline-none transition-all placeholder:text-gray-300" />
      </div>

      <div class="flex flex-wrap items-center gap-3 w-full lg:w-auto">
        <!-- 状态过滤器 (列表模式专用) -->
        <div v-if="viewMode === 'list'" class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button
            v-for="s in [{ id: 'all', label: '全部' }, { id: 'pending', label: '待办' }, { id: 'in_progress', label: '进行中' }, { id: 'completed', label: '已完成' }]"
            :key="s.id" @click="setStatusFilter(s.id)"
            :class="['px-4 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase tracking-tight', activeStatus === s.id ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F] hover:text-[#1D1D20]']">
            {{ s.label }}
          </button>
        </div>

        <!-- 视图切换器 -->
        <div class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button @click="viewMode = 'list'"
            :class="['p-2 rounded-md transition-all', viewMode === 'list' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"
            title="列表视图">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <button @click="viewMode = 'kanban'"
            :class="['p-2 rounded-md transition-all', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"
            title="看板视图">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 10V7">
              </path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 3. 内容展示区 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32">
      <div class="w-10 h-10 border-2 border-[#5E6AD2] border-t-white/20 border-t-transparent rounded-full animate-spin">
      </div>
    </div>

    <div v-else-if="plans.length === 0"
      class="text-center py-32 bg-white rounded-xl border border-dashed border-[#E6E7E8]">
      <div class="mb-4 text-[#D1D1D6]">
        <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2">
          </path>
        </svg>
      </div>
      <p class="text-[#67657F] text-sm font-medium">没有找到符合条件的计划</p>
      <button @click="resetFilters" class="mt-4 text-[#5E6AD2] text-xs font-bold hover:underline">显示所有任务</button>
    </div>

    <!-- 3a. 列表模式 -->
    <div v-else-if="viewMode === 'list'"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in duration-300">
      <div v-for="plan in plans" :key="plan.id"
        class="bg-white rounded-xl border border-[#E6E7E8] shadow-sm transition-all hover:shadow-md hover:border-[#D1D1D6] p-6 group relative">
        <div :class="['absolute left-0 top-0 bottom-0 w-1.5 rounded-full opacity-40', statusColor(plan.status)]"></div>
        <div class="flex justify-between items-start mb-4">
          <div class="flex gap-2">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F4F4F5] text-[#67657F] border border-[#E6E7E8]">{{
                plan.category || '未分类' }}</span>
            <span v-if="plan.priority > 0"
              :class="['text-[10px] px-2 py-0.5 rounded font-black border', priorityClass(plan.priority)]">P{{
                plan.priority }}</span>
          </div>
          <div v-if="isLoggedIn" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="$emit('edit', plan)"
              class="p-1.5 hover:bg-gray-100 rounded-md text-[#67657F] hover:text-[#5E6AD2] transition-colors"><svg
                class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z">
                </path>
              </svg></button>
            <button @click="deletePlan(plan.id)"
              class="p-1.5 hover:bg-red-50 rounded-md text-red-500 transition-colors"><svg class="w-4 h-4" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                </path>
              </svg></button>
          </div>
        </div>
        <h3 class="font-bold text-[#1D1D20] text-[16px] mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-1">
          {{ plan.title }}</h3>

        <!-- Markdown 渲染区域 (列表模式) -->
        <div
          class="text-[#67657F] text-[13px] mt-2 line-clamp-2 leading-relaxed mb-6 h-10 prose prose-sm prose-slate max-w-none overflow-hidden"
          v-html="renderMarkdown(plan.description)"></div>

        <div class="pt-4 border-t border-[#F0F0F2] flex justify-between items-center text-[11px] text-[#9593A3]">
          <span class="flex items-center"><svg class="w-3.5 h-3.5 mr-1.5 text-[#D1D1D6]" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>{{ formatDate(plan.due_date) }}</span>
          <span
            :class="['px-2.5 py-1 rounded-md font-bold uppercase tracking-widest border text-[10px]', statusBgColor(plan.status)]">{{
              formatStatus(plan.status) }}</span>
        </div>
      </div>
    </div>

    <!-- 3b. 看板模式 -->
    <div v-else class="overflow-x-auto pb-8 px-8 -mx-8 scrollbar-hide animate-in slide-in-from-right-4 duration-300">
      <div class="flex flex-row gap-6 w-fit mx-auto min-w-full lg:min-w-0 md:justify-center">
        <div v-for="col in kanbanColumns" :key="col.id" class="flex-shrink-0 w-80 lg:w-[350px] flex flex-col gap-4">
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-2">
              <span :class="['w-2.5 h-2.5 rounded-full', statusPointColor(col.id)]"></span>
              <span class="text-[11px] font-black text-[#1D1D20] uppercase tracking-widest">{{ col.label }}</span>
              <span class="text-[10px] font-bold text-[#9593A3] bg-gray-100 px-2.5 py-0.5 rounded-full shadow-sm">{{
                col.items.length }}</span>
            </div>
          </div>

          <draggable v-model="col.items" group="plans" item-key="id"
            class="flex flex-col gap-3 min-h-[600px] p-3 bg-[#F7F7F8]/70 rounded-2xl border border-transparent hover:border-[#E6E7E8] transition-colors"
            ghost-class="opacity-40" drag-class="rotate-1" @change="(e: any) => handleDragChange(e, col.id)">
            <template #item="{ element }">
              <div @click="$emit('edit', element)"
                class="bg-white rounded-xl border border-[#E6E7E8] p-5 shadow-sm hover:shadow-md hover:border-[#D1D1D6] transition-all cursor-grab active:cursor-grabbing group select-none">
                <div class="flex justify-between items-start mb-3">
                  <span v-if="element.priority > 0"
                    :class="['text-[9px] px-1.5 py-0.5 rounded font-black border', priorityClass(element.priority)]">P{{
                    element.priority }}</span>
                  <span class="text-[10px] font-medium text-[#9593A3] tracking-tight uppercase">{{ element.category ||
                    '未分类' }}</span>
                </div>
                <h4
                  class="text-[14px] font-bold text-[#1D1D20] leading-snug mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-1">
                  {{ element.title }}</h4>

                <!-- Markdown 渲染预览 (看板模式) -->
                <div
                  class="text-[12px] text-[#67657F] leading-snug mb-3 line-clamp-2 prose prose-xs max-w-none overflow-hidden"
                  v-html="renderMarkdown(element.description)"></div>

                <div v-if="element.due_date" class="flex items-center text-[10px] text-[#9593A3] font-semibold">
                  <svg class="w-3.5 h-3.5 mr-1.5 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  {{ formatDate(element.due_date) }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
        <div class="flex-shrink-0 w-6 h-full"></div>
      </div>
    </div>

      <!-- 在模板底部添加 ConfirmModal -->
    <ConfirmModal 
      :isOpen="isConfirmOpen"
      title="删除计划"
      message="你确定要删除这个计划吗？此操作将永久移除数据，无法撤销。"
      @confirm="executeDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
    
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import draggable from 'vuedraggable';
import { marked } from 'marked'; // 1. 引入 marked
import api from '../api';
import ConfirmModal from './ConfirmModal.vue'; 
import type { Plan } from '../types';
import { toastStore } from '../toast';
const emit = defineEmits(['edit']);

const plans = ref<Plan[]>([]);
const loading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('token'));

const searchText = ref('');
const activeStatus = ref('all');
const viewMode = ref<'list' | 'kanban'>('list');

const isConfirmOpen = ref(false);
const planIdToDelete = ref<number | null>(null);

const kanbanColumns = reactive([
  { id: 'pending', label: '待办 (Backlog)', items: [] as Plan[] },
  { id: 'in_progress', label: '进行中 (Started)', items: [] as Plan[] },
  { id: 'completed', label: '已完成 (Done)', items: [] as Plan[] }
]);

// 2. 配置 Marked (启用 GFM 和 换行符支持)
marked.setOptions({
  breaks: true,
  gfm: true
});

const renderMarkdown = (content?: string) => {
  if (!content) return '';
  // 渲染 Markdown
  return marked.parse(content);
};

const fetchPlans = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (searchText.value.trim()) params.q = searchText.value.trim();
    if (viewMode.value === 'list' && activeStatus.value !== 'all') params.status = activeStatus.value;

    const res = await api.get<Plan[]>('/plans', { params });
    plans.value = res.data;

    kanbanColumns[0].items = plans.value.filter(p => p.status === 'pending');
    kanbanColumns[1].items = plans.value.filter(p => p.status === 'in_progress');
    kanbanColumns[2].items = plans.value.filter(p => p.status === 'completed');
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    loading.value = false;
  }
};

const handleDragChange = async (event: any, newStatus: string) => {
  if (event.added) {
    try {
      await api.patch(`/plans/${event.added.element.id}`, { status: newStatus });
      toastStore.show(`已移动到 ${formatStatus(newStatus)}`, 'info', 2000);
    } catch (err) {
      fetchPlans();
    }
  }
};

const resetFilters = () => { searchText.value = ''; activeStatus.value = 'all'; fetchPlans(); };
const setStatusFilter = (id: string) => { activeStatus.value = id; fetchPlans(); };

watch(viewMode, () => fetchPlans());
let debounce: any = null;
watch(searchText, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => fetchPlans(), 350);
});

const deletePlan = async (id: number) => {
  // 不再调用原生 confirm，而是保存 ID 并打开自定义 Modal
  planIdToDelete.value = id;
  isConfirmOpen.value = true;
};
// 真正执行删除的函数 (由 Modal 的 @confirm 触发)
const executeDelete = async () => {
  if (planIdToDelete.value === null) return;
  
  try {
    await api.delete(`/plans/${planIdToDelete.value}`);
    toastStore.show('计划已成功删除');
    await fetchPlans();
  } catch (err) {
    // api.ts 拦截器会自动处理报错 Toast
  } finally {
    isConfirmOpen.value = false;
    planIdToDelete.value = null;
  }
}; 

const statusColor = (s: string) => s === 'completed' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300';
const statusBgColor = (s: string) => s === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : s === 'in_progress' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-gray-50 text-gray-500 border-gray-100';
const statusPointColor = (s: string) => s === 'completed' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-400';
const priorityClass = (p: number) => {
  if (p === 3) return 'bg-red-50 text-red-600 border-red-100';
  if (p === 2) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (p === 1) return 'bg-blue-50 text-blue-600 border-blue-100';
  return 'bg-gray-50 text-gray-400 border-gray-100';
};
const formatStatus = (s: string) => ({ pending: '待办', in_progress: '进行中', completed: '已完成' }[s] || s);
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '无截止日期';
  return new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

onMounted(fetchPlans);
defineExpose({ fetchPlans });
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

@keyframes slide-in-right {
  from {
    transform: translateX(20px);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-from-right-4 {
  animation: slide-in-right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.rotate-1 {
  transform: rotate(1.5deg);
}

/* --- Markdown 内容样式补丁 --- */
:deep(.prose) {
  color: inherit;
  font-size: inherit;
}

:deep(.prose p) {
  margin-bottom: 0.25rem;
}

:deep(.prose strong) {
  font-weight: 700;
  color: #1d1d20;
}

:deep(.prose ul) {
  list-style-type: disc;
  padding-left: 1rem;
}

:deep(.prose ol) {
  list-style-type: decimal;
  padding-left: 1rem;
}
</style>