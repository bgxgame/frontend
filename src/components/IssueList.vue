<!-- src/components/IssueList.vue -->
<template>
  <div class="space-y-6">
    <!-- 1. 顶部控制栏：返回 + 项目名 + 视图切换 -->
    <div class="flex items-center justify-between border-b border-[#E6E7E8] pb-4">
      <div class="flex items-center gap-3">
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
        <!-- 状态过滤器 (列表模式专用) -->
        <div v-if="viewMode === 'list'" class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button
            v-for="s in [{ id: 'all', label: '全部' }, { id: 'todo', label: '待办' }, { id: 'in_progress', label: '进行中' }, { id: 'done', label: '已完成' }]"
            :key="s.id" @click="setStatusFilter(s.id)"
            :class="['px-3 py-1 text-[11px] font-bold rounded-md transition-all uppercase', activeStatus === s.id ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F] hover:text-[#1D1D20]']">
            {{ s.label }}
          </button>
        </div>

        <!-- 视图切换器 -->
        <div class="flex p-1 bg-[#F0F0F2] rounded-lg border border-[#E6E7E8]">
          <button @click="viewMode = 'list'" :class="['p-1.5 rounded-md transition-all', viewMode === 'list' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <button @click="viewMode = 'kanban'" :class="['p-1.5 rounded-md transition-all', viewMode === 'kanban' ? 'bg-white shadow-sm text-[#5E6AD2]' : 'text-[#67657F]']">
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

    <!-- 2a. 列表模式 -->
    <div v-else-if="viewMode === 'list'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 animate-in fade-in duration-300">
      <div v-for="issue in issues" :key="issue.id"
        class="bg-white rounded-xl border border-[#E6E7E8] shadow-sm transition-all hover:shadow-md hover:border-[#D1D1D6] p-6 group relative cursor-pointer"
        @click="$emit('edit', issue)">
        <div :class="['absolute left-0 top-0 bottom-0 w-1.5 rounded-full opacity-40', statusColor(issue.status)]"></div>
        <div class="flex justify-between items-start mb-4">
          <span v-if="issue.priority > 0" :class="['text-[10px] px-2 py-0.5 rounded font-black border', priorityClass(issue.priority)]">P{{ issue.priority }}</span>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click.stop="confirmDelete(issue.id)" class="p-1 hover:bg-red-50 rounded text-red-500">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
        <h3 class="font-bold text-[#1D1D20] text-base mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-1">{{ issue.title }}</h3>
        <div class="text-[#67657F] text-[13px] line-clamp-2 leading-relaxed h-10 prose prose-sm" v-html="renderMarkdown(issue.description)"></div>
      </div>
    </div>

    <!-- 2b. 看板模式 -->
    <div v-else class="overflow-x-auto pb-8 px-8 -mx-8 scrollbar-hide">
      <div class="flex flex-row gap-6 w-fit mx-auto min-w-full lg:min-w-0 md:justify-center">
        <div v-for="col in kanbanColumns" :key="col.id" class="flex-shrink-0 w-80 lg:w-[350px] flex flex-col gap-4">
          <div class="flex items-center gap-2 px-2">
            <span :class="['w-2.5 h-2.5 rounded-full', statusPointColor(col.id)]"></span>
            <span class="text-[11px] font-black text-[#1D1D20] uppercase tracking-widest">{{ col.label }}</span>
            <span class="text-[10px] font-bold text-[#9593A3] bg-gray-100 px-2 py-0.5 rounded-full">{{ col.items.length }}</span>
          </div>

          <draggable 
            v-model="col.items" 
            group="issues" 
            item-key="id"
            class="flex flex-col gap-3 min-h-[600px] p-3 bg-[#F7F7F8]/70 rounded-2xl border border-transparent hover:border-[#E6E7E8] transition-colors"
            ghost-class="opacity-40"
            @change="(e: any) => handleDragChange(e, col.id)"
          >
            <template #item="{ element }">
              <div @click="$emit('edit', element)" class="bg-white rounded-xl border border-[#E6E7E8] p-5 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
                <div class="flex justify-between items-start mb-3">
                  <span v-if="element.priority > 0" :class="['text-[9px] px-1.5 py-0.5 rounded font-black border', priorityClass(element.priority)]">P{{ element.priority }}</span>
                </div>
                <h4 class="text-[14px] font-bold text-[#1D1D20] leading-snug mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-2 h-10">{{ element.title }}</h4>
                <div v-if="element.due_date" class="text-[10px] text-[#9593A3] font-semibold flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
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
import { marked } from 'marked';
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
const activeStatus = ref('all');
const viewMode = ref<'list' | 'kanban'>('list');
const isConfirmOpen = ref(false);
const issueIdToDelete = ref<number | null>(null);

const kanbanColumns = reactive([
  { id: 'todo', label: '待办 (Todo)', items: [] as Issue[] },
  { id: 'in_progress', label: '进行中 (Started)', items: [] as Issue[] },
  { id: 'done', label: '已完成 (Done)', items: [] as Issue[] }
]);

marked.setOptions({ breaks: true, gfm: true });
const renderMarkdown = (content?: string) => content ? marked.parse(content) : '';

const fetchIssues = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (viewMode.value === 'list' && activeStatus.value !== 'all') params.status = activeStatus.value;
    
    const res = await api.get<Issue[]>(`/projects/${props.projectId}/issues`, { params });
    issues.value = res.data;

    // 分发看板
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
      toastStore.show(`已更新为 ${newStatus}`, 'info', 1000);
    } catch (err) {
      fetchIssues();
    }
  }
};

const setStatusFilter = (s: string) => { activeStatus.value = s; fetchIssues(); };
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

const statusColor = (s: string) => s === 'done' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300';
const statusPointColor = (s: string) => s === 'done' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-400';
const priorityClass = (p: number) => p >= 3 ? 'bg-red-50 text-red-600 border-red-100' : p === 2 ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100';
const formatDate = (d: string) => new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });

watch(() => props.projectId, fetchIssues);
watch(viewMode, fetchIssues);
onMounted(fetchIssues);

defineExpose({ fetchIssues });
</script>