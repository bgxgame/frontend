<!-- src/components/IssueList.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. 顶部控制栏：返回 + 项目名 + 视图切换 -->
    <div class="flex items-center justify-between border-b border-[#E6E7E8] pb-4">
      <div class="flex items-center gap-4">
        <button 
          @click="$emit('back')" 
          class="p-1.5 hover:bg-gray-100 rounded-md text-[#9593A3] hover:text-[#1D1D20] transition-colors"
          title="返回项目列表"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="flex flex-col">
          <h2 class="text-lg font-bold text-[#1D1D20] tracking-tight">{{ projectName }}</h2>
          <p class="text-[11px] text-[#9593A3] font-medium uppercase tracking-widest">Project Issues</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- 视图切换器 -->
        <div class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button @click="viewMode = 'list'" 
            :class="['p-1.5 rounded-md transition-all', viewMode === 'list' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"
            title="列表视图">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button @click="viewMode = 'kanban'" 
            :class="['p-1.5 rounded-md transition-all', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']"
            title="看板视图">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2m0 10V7" /></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 2. 内容区 -->
    <div v-if="loading" class="flex justify-center py-32">
      <div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="issues.length === 0" class="text-center py-32 bg-white rounded-xl border border-dashed border-[#E6E7E8]">
      <p class="text-[#67657F] text-sm font-medium">该项目下暂无任务，快去创建一个吧</p>
    </div>

    <!-- 2a. 列表模式 (Table/List Style) -->
    <div v-else-if="viewMode === 'list'" class="bg-white rounded-xl border border-[#E6E7E8] overflow-hidden animate-in fade-in duration-300">
      <!-- 表头 -->
      <div class="flex items-center px-4 py-2 border-b border-[#E6E7E8] text-[10px] font-bold text-[#9593A3] uppercase tracking-widest bg-[#FAFAFC]">
        <div class="flex-1">任务名称</div>
        <div class="w-32">状态</div>
        <div class="w-24 text-center">优先级</div>
        <div class="w-32 text-right">截止日期</div>
        <div class="w-10"></div>
      </div>

      <!-- 数据行 -->
      <div class="divide-y divide-[#F0F0F2]">
        <div v-for="issue in issues" :key="issue.id"
          @click="$emit('edit', issue)"
          class="group flex items-center px-4 py-2.5 hover:bg-[#F4F4F5] transition-colors cursor-pointer text-[13px]"
        >
          <!-- 1. 名称列 -->
          <div class="flex-1 flex items-center gap-3 min-w-0">
            <span :class="['shrink-0 w-2 h-2 rounded-full shadow-sm', statusPointColor(issue.status)]"></span>
            <span class="font-semibold text-[#1D1D20] truncate group-hover:text-[#5E6AD2] transition-colors">
              {{ issue.title }}
            </span>
          </div>

          <!-- 2. 状态列 (Pill 标签) -->
          <div class="w-32 flex items-center">
            <span :class="['px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-tighter', statusTagClass(issue.status)]">
              {{ formatStatus(issue.status) }}
            </span>
          </div>

          <!-- 3. 优先级列 -->
          <div class="w-24 flex justify-center">
            <span v-if="issue.priority > 0" 
              :class="['text-[10px] px-1.5 py-0.5 rounded font-black border shadow-sm', priorityClass(issue.priority)]">
              P{{ issue.priority }}
            </span>
            <span v-else class="text-[#D1D1D6]">—</span>
          </div>

          <!-- 4. 截止日期列 -->
          <div class="w-32 text-right text-[#67657F] font-medium text-[12px]">
            {{ issue.due_date ? formatDate(issue.due_date) : '—' }}
          </div>

          <!-- 5. 悬浮操作 -->
          <div class="w-10 flex justify-end">
            <button @click.stop="confirmDelete(issue.id)" 
              class="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded text-red-500 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 2b. 看板模式 (居中布局) -->
    <div v-else class="overflow-x-auto pb-8 px-4 -mx-4 scrollbar-hide">
      <!-- 容器居中关键类: w-fit mx-auto justify-center -->
      <div class="flex flex-row gap-6 w-fit mx-auto min-w-full justify-center">
        <div v-for="col in kanbanColumns" :key="col.id" class="flex-shrink-0 w-80 flex flex-col gap-4">
          <!-- 列头部 -->
          <div class="flex items-center gap-2 px-2">
            <span :class="['w-2.5 h-2.5 rounded-full shadow-sm', statusPointColor(col.id)]"></span>
            <span class="text-[11px] font-black text-[#1D1D20] uppercase tracking-widest">{{ col.label }}</span>
            <span class="text-[10px] font-bold text-[#9593A3] bg-gray-100 px-2 py-0.5 rounded-full shadow-inner">{{ col.items.length }}</span>
          </div>

          <!-- 拖拽区域 -->
          <draggable 
            v-model="col.items" 
            group="issues" 
            item-key="id"
            class="flex flex-col gap-3 min-h-[500px] p-3 bg-[#F7F7F8]/70 rounded-2xl border border-transparent hover:border-[#E6E7E8] transition-colors"
            ghost-class="opacity-40"
            @change="(e: any) => handleDragChange(e, col.id)"
          >
            <template #item="{ element }">
              <div @click="$emit('edit', element)" class="bg-white rounded-xl border border-[#E6E7E8] p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                <div class="flex justify-between items-start mb-2">
                  <span v-if="element.priority > 0" :class="['text-[9px] px-1.5 py-0.5 rounded font-black border', priorityClass(element.priority)]">P{{ element.priority }}</span>
                </div>
                <h4 class="text-[14px] font-bold text-[#1D1D20] leading-snug mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-2 text-left">
                  {{ element.title }}
                </h4>
                <div v-if="element.due_date" class="text-[10px] text-[#9593A3] font-semibold flex items-center">
                  <svg class="w-3 h-3 mr-1 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  {{ formatDate(element.due_date) }}
                </div>
              </div>
            </template>
          </draggable>
        </div>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <ConfirmModal 
      :isOpen="isConfirmOpen"
      title="删除任务"
      message="确定要永久删除此任务吗？此操作不可撤销。"
      @confirm="executeDelete"
      @cancel="isConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, reactive } from 'vue';
import draggable from 'vuedraggable';
import api from '../api';
import type { Issue } from '../types';
import { toastStore } from '../toast';
import ConfirmModal from './ConfirmModal.vue';

const props = defineProps<{
  projectId: number;
  projectName: string;
}>();

const emit = defineEmits(['back', 'edit']);

const issues = ref<Issue[]>([]);
const loading = ref(true);
const viewMode = ref<'list' | 'kanban'>('list');
const isConfirmOpen = ref(false);
const issueIdToDelete = ref<number | null>(null);

const kanbanColumns = reactive([
  { id: 'todo', label: '待办 (Todo)', items: [] as Issue[] },
  { id: 'in_progress', label: '进行中 (Started)', items: [] as Issue[] },
  { id: 'done', label: '已完成 (Done)', items: [] as Issue[] }
]);

const fetchIssues = async () => {
  loading.value = true;
  try {
    const res = await api.get<Issue[]>(`/projects/${props.projectId}/issues`);
    issues.value = res.data;

    // 重新分发数据到看板列
    kanbanColumns[0].items = issues.value.filter(i => i.status === 'todo' || i.status === 'backlog');
    kanbanColumns[1].items = issues.value.filter(i => i.status === 'in_progress');
    kanbanColumns[2].items = issues.value.filter(i => i.status === 'done');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleDragChange = async (event: any, newStatus: string) => {
  if (event.added) {
    const issue = event.added.element;
    try {
      await api.patch(`/issues/${issue.id}`, { status: newStatus });
      toastStore.show(`已更新为 ${formatStatus(newStatus)}`, 'info', 1000);
    } catch (err) {
      fetchIssues(); // 失败则回滚界面
    }
  }
};

const confirmDelete = (id: number) => { issueIdToDelete.value = id; isConfirmOpen.value = true; };
const executeDelete = async () => {
  if (!issueIdToDelete.value) return;
  try {
    await api.delete(`/issues/${issueIdToDelete.value}`);
    toastStore.show('任务已删除');
    fetchIssues();
  } finally {
    isConfirmOpen.value = false;
    issueIdToDelete.value = null;
  }
};

// --- 辅助工具函数 ---

const formatStatus = (s: string) => {
  const map: Record<string, string> = {
    'todo': 'Todo', 'in_progress': 'In Progress', 'done': 'Done', 
    'backlog': 'Backlog', 'canceled': 'Canceled'
  };
  return map[s] || s;
};

const statusPointColor = (s: string) => {
  if (s === 'done') return 'bg-emerald-500';
  if (s === 'in_progress') return 'bg-amber-500';
  if (s === 'todo') return 'bg-blue-500';
  return 'bg-gray-400';
};

const statusTagClass = (s: string) => {
  if (s === 'done') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (s === 'in_progress') return 'bg-amber-50 text-amber-600 border-amber-100';
  if (s === 'todo') return 'bg-blue-50 text-blue-600 border-blue-100';
  return 'bg-gray-50 text-gray-500 border-gray-100';
};

const priorityClass = (p: number) => {
  if (p >= 3) return 'bg-red-50 text-red-600 border-red-100';
  if (p === 2) return 'bg-amber-50 text-amber-600 border-amber-100';
  return 'bg-blue-50 text-blue-600 border-blue-100';
};

const formatDate = (d: string) => {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

// 监听项目ID变化
watch(() => props.projectId, fetchIssues);

onMounted(fetchIssues);

defineExpose({ fetchIssues });
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }

/* 进场动画 */
.animate-in { animation: fade-in 0.3s ease-out; }
@keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>