<!-- src/components/PlanList.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. 标题区 (保持不变) -->
    <div class="flex justify-between items-center border-b border-[#E6E7E8] pb-4">
      <div>
        <h2 class="text-lg font-semibold text-[#1D1D20]">我的计划</h2>
        <p class="text-[#67657F] text-sm mt-1">记录过程，复盘结果</p>
      </div>
      <span class="text-xs text-[#9593A3] bg-white px-2 py-1 rounded border border-[#E6E7E8] font-medium">
        共 {{ plans.length }} 项
      </span>
    </div>

    <!-- 2. 搜索、筛选与视图切换栏 (保持不变) -->
    <div class="flex flex-col lg:flex-row gap-4 items-center justify-between">
      <div class="relative w-full lg:w-72 group">
        <span class="absolute inset-y-0 left-3 flex items-center text-[#9593A3] group-focus-within:text-[#5E6AD2] transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </span>
        <input v-model="searchText" type="text" placeholder="搜索计划..." class="w-full pl-9 pr-3 py-1.5 text-sm bg-white border border-[#E6E7E8] rounded-md focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] outline-none transition-all" />
      </div>

      <div class="flex items-center gap-3">
        <div v-if="viewMode === 'list'" class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button v-for="s in [{id:'all',label:'全部'},{id:'pending',label:'待办'},{id:'in_progress',label:'进行中'},{id:'completed',label:'已完成'}]" :key="s.id" @click="setStatusFilter(s.id)" :class="['px-3 py-1.5 text-[11px] font-bold rounded-md transition-all uppercase', activeStatus === s.id ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']">{{s.label}}</button>
        </div>
        <div class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button @click="viewMode = 'list'" :class="['p-1.5 rounded-md transition-all', viewMode === 'list' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>
          <button @click="viewMode = 'kanban'" :class="['p-1.5 rounded-md transition-all', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 10V7"></path></svg></button>
        </div>
      </div>
    </div>

    <!-- 3. 内容展示区 -->
    <div v-if="loading" class="flex justify-center py-24"><div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin"></div></div>

    <div v-else>
      <!-- 列表视图 -->
      <div v-if="viewMode === 'list'" class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
        <div v-for="plan in plans" :key="plan.id" class="bg-white rounded-xl border border-[#E6E7E8] shadow-sm p-5 group relative">
          <div :class="['absolute left-0 top-0 bottom-0 w-1 rounded-full opacity-60', statusColor(plan.status)]"></div>
          <div class="flex justify-between mb-3">
             <div class="flex gap-2">
               <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#F4F4F5] text-[#67657F] border border-[#E6E7E8]">{{ plan.category }}</span>
               <span v-if="plan.priority > 0" :class="['text-[10px] px-2 py-0.5 rounded font-black border', priorityClass(plan.priority)]">P{{ plan.priority }}</span>
             </div>
             <div v-if="isLoggedIn" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button @click="$emit('edit', plan)" class="p-1 hover:bg-gray-100 rounded text-[#67657F]"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg></button>
               <button @click="deletePlan(plan.id)" class="p-1 hover:bg-red-50 rounded text-red-500"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
             </div>
          </div>
          <h3 class="font-bold text-[#1D1D20] text-[15px] mb-2">{{ plan.title }}</h3>
          <p class="text-[#67657F] text-[13px] line-clamp-2 leading-relaxed mb-4">{{ plan.description }}</p>
          <div class="pt-3 border-t border-[#F0F0F2] flex justify-between items-center text-[11px] text-[#9593A3]">
            <span>{{ formatDate(plan.due_date) }}</span>
            <span :class="['px-2 py-0.5 rounded font-bold uppercase border', statusBgColor(plan.status)]">{{ formatStatus(plan.status) }}</span>
          </div>
        </div>
      </div>

      <!-- 看板视图 (集成拖拽) -->
      <div v-else class="flex flex-row gap-6 overflow-x-auto pb-6 scrollbar-hide">
        <div v-for="col in kanbanColumns" :key="col.id" class="flex-shrink-0 w-80 flex flex-col gap-4">
          <div class="flex items-center gap-2 px-2">
            <span :class="['w-2 h-2 rounded-full', statusPointColor(col.id)]"></span>
            <span class="text-[11px] font-bold text-[#1D1D20] uppercase tracking-wider">{{ col.label }}</span>
            <span class="text-[10px] font-medium text-[#9593A3] bg-gray-100 px-1.5 py-0.5 rounded-full">{{ col.items.length }}</span>
          </div>

          <!-- 拖拽组件 -->
          <draggable 
            v-model="col.items" 
            group="plans" 
            item-key="id"
            class="flex flex-col gap-3 min-h-[500px] p-2 bg-[#F7F7F8]/50 rounded-xl border border-transparent hover:border-[#E6E7E8] transition-colors"
            ghost-class="opacity-50"
            drag-class="rotate-2"
            @change="(e: any) => handleDragChange(e, col.id)"
          >
            <template #item="{ element }">
              <div 
                @click="$emit('edit', element)"
                class="bg-white rounded-lg border border-[#E6E7E8] p-4 shadow-sm hover:shadow-md hover:border-[#D1D1D6] transition-all cursor-grab active:cursor-grabbing group"
              >
                <div class="flex justify-between items-start mb-2">
                  <span v-if="element.priority > 0" :class="['text-[9px] px-1.5 py-0.5 rounded font-black border', priorityClass(element.priority)]">P{{ element.priority }}</span>
                  <span class="text-[10px] font-medium text-[#9593A3]">{{ element.category }}</span>
                </div>
                <h4 class="text-[13px] font-bold text-[#1D1D20] leading-snug mb-2 group-hover:text-[#5E6AD2]">{{ element.title }}</h4>
                <div v-if="element.due_date" class="text-[10px] text-[#9593A3] flex items-center">
                   <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                   {{ formatDate(element.due_date) }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import draggable from 'vuedraggable'; // 引入拖拽组件
import api from '../api';
import type { Plan } from '../types';

const emit = defineEmits(['edit']);

const plans = ref<Plan[]>([]);
const loading = ref(true);
const isLoggedIn = ref(!!localStorage.getItem('token'));
const searchText = ref('');
const activeStatus = ref('all');
const viewMode = ref<'list' | 'kanban'>('list');

// 看板专用的响应式列数据
const kanbanColumns = reactive([
  { id: 'pending', label: '待办 (Backlog)', items: [] as Plan[] },
  { id: 'in_progress', label: '进行中 (Started)', items: [] as Plan[] },
  { id: 'completed', label: '已完成 (Done)', items: [] as Plan[] }
]);

// 获取数据并分发到看板列
const fetchPlans = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (searchText.value.trim()) params.q = searchText.value.trim();
    if (viewMode.value === 'list' && activeStatus.value !== 'all') params.status = activeStatus.value;

    const res = await api.get<Plan[]>('/plans', { params });
    plans.value = res.data;

    // 更新看板列数据
    kanbanColumns[0].items = plans.value.filter(p => p.status === 'pending');
    kanbanColumns[1].items = plans.value.filter(p => p.status === 'in_progress');
    kanbanColumns[2].items = plans.value.filter(p => p.status === 'completed');
  } catch (error) {
    console.error('Fetch error:', error);
  } finally {
    loading.value = false;
  }
};

// 处理拖拽改变状态
const handleDragChange = async (event: any, newStatus: string) => {
  // 我们只关心 "added" 事件（即某个卡片被拖入当前列）
  if (event.added) {
    const plan = event.added.element;
    try {
      // 乐观更新：本地状态可能已经改变，发送 PATCH 给后端
      await api.patch(`/plans/${plan.id}`, { status: newStatus });
      console.log(`已更新计划 ${plan.id} 状态为 ${newStatus}`);
    } catch (err) {
      alert('同步状态失败，请重试');
      fetchPlans(); // 失败时回滚数据
    }
  }
};

// 监听与工具函数 (保持不变)
const setStatusFilter = (id: string) => { activeStatus.value = id; fetchPlans(); };
const resetFilters = () => { searchText.value = ''; activeStatus.value = 'all'; fetchPlans(); };
watch(viewMode, () => fetchPlans());
let timer: any = null;
watch(searchText, () => { clearTimeout(timer); timer = setTimeout(() => fetchPlans(), 350); });

const deletePlan = async (id: number) => {
  if (!confirm('确定删除？')) return;
  await api.delete(`/plans/${id}`);
  fetchPlans();
};

const statusColor = (s: string) => s === 'completed' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300';
const statusBgColor = (s: string) => s === 'completed' ? 'bg-emerald-50 text-emerald-700' : s === 'in_progress' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500';
const statusPointColor = (s: string) => s === 'completed' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-400';
const priorityClass = (p: number) => p === 3 ? 'bg-red-50 text-red-600' : p === 2 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600';
const formatStatus = (s: string) => ({ pending: '待办', in_progress: '进行中', completed: '已完成' }[s] || s);
const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : '无日期';

onMounted(fetchPlans);
defineExpose({ fetchPlans });
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
/* 拖拽时的旋转效果 */
.rotate-2 { transform: rotate(2deg); }
</style>