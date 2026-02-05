<!-- src/components/ProjectList.vue -->
<template>
  <div class="max-w-[1200px] mx-auto space-y-8 py-4">
    <!-- 顶部标题与操作栏 -->
    <div class="flex justify-between items-end px-2">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <h2 class="text-2xl font-bold text-[#1D1D20] tracking-tight">所有项目</h2>
          <span class="text-[11px] font-bold text-[#9593A3] bg-[#F0F0F2] px-2 py-0.5 rounded-full border border-[#E6E7E8]">
            {{ projects.length }}
          </span>
        </div>
        <p class="text-[13px] text-[#9593A3]">管理并追踪你的长期目标与协作空间</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2 bg-[#5E6AD2] text-white text-[13px] font-bold rounded-lg hover:bg-[#525BC2] transition-all shadow-md shadow-indigo-100 active:scale-[0.98]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        新建项目
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex justify-center py-40">
      <div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="projects.length === 0" class="text-center py-40 bg-white rounded-2xl border border-dashed border-[#E6E7E8]">
      <p class="text-[#67657F] text-sm font-medium">暂无活跃项目，开启你的第一个计划吧</p>
      <button @click="showCreateModal = true" class="mt-4 text-[#5E6AD2] text-xs font-bold hover:underline">点击创建</button>
    </div>

    <!-- 项目列表模式 -->
    <div v-else class="bg-white rounded-2xl border border-[#E6E7E8] shadow-sm overflow-hidden animate-in fade-in duration-500">
      <!-- 表头 (更淡、间距更大) -->
      <div class="flex items-center px-8 py-3 border-b border-[#F0F0F2] text-[11px] font-bold text-[#9593A3] uppercase tracking-[0.1em] bg-[#FAFAFC]">
        <div class="flex-1">项目详情</div>
        <div class="w-32">当前状态</div>
        <div class="w-40 hidden md:block">更新于</div>
        <div class="w-12"></div>
      </div>

      <!-- 数据行 -->
      <div class="divide-y divide-[#F0F0F2]">
        <div 
          v-for="project in projects" 
          :key="project.id"
          @click="$emit('select', project)"
          class="group flex items-center px-8 py-6 hover:bg-[#F8F9FF] transition-all cursor-pointer relative"
        >
          <!-- 极细的左侧颜色指示 -->
          <div 
            class="absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity" 
            :style="{ backgroundColor: project.color || '#5E6AD2' }"
          ></div>

          <!-- 1. 名称与描述 (加大间距和字体对比) -->
          <div class="flex-1 flex flex-col min-w-0 pr-10">
            <span class="font-bold text-[#1D1D20] text-[15px] tracking-tight group-hover:text-[#5E6AD2] transition-colors">
              {{ project.name }}
            </span>
            <span class="text-[13px] text-[#9593A3] truncate mt-1.5 font-normal leading-relaxed">
              {{ project.description || '暂无项目详细描述，点击添加。' }}
            </span>
          </div>

          <!-- 2. 状态标签 (改为圆点风格，减少视觉色块) -->
          <div class="w-32 flex items-center shrink-0">
            <div class="flex items-center gap-2 px-2.5 py-1 rounded-full border border-[#E6E7E8] bg-white shadow-sm">
              <span class="w-1.5 h-1.5 rounded-full" :class="statusDotColor(project.status)"></span>
              <span class="text-[11px] font-black text-[#1D1D20] uppercase tracking-tight">{{ project.status }}</span>
            </div>
          </div>

          <!-- 3. 时间列 (更淡的字体) -->
          <div class="w-40 hidden md:flex items-center text-[#9593A3] text-[12px] font-medium shrink-0">
            {{ formatDate(project.updated_at) }}
          </div>

          <!-- 4. 操作列 -->
          <div class="w-12 flex justify-end shrink-0">
            <button 
              @click.stop="confirmDelete(project)"
              class="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg text-[#9593A3] hover:text-red-500 transition-all"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建项目的 Modal (逻辑保持不变) -->
    <!-- ... (这部分代码与原来相同，可以略过或直接保留) ... -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E6E7E8] animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-[#F0F0F2] bg-[#FAFAFC]">
          <h2 class="text-sm font-bold text-[#1D1D20]">新建项目</h2>
        </div>
        <form @submit.prevent="handleCreate" class="p-6 space-y-5">
          <div>
            <label class="block text-[10px] font-bold text-[#67657F] uppercase tracking-widest mb-1.5 ml-1">项目名称</label>
            <input v-model="newProject.name" type="text" required autofocus class="w-full px-3 py-2 bg-[#FAFAFC] border border-[#E6E7E8] rounded-lg text-sm outline-none focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] transition-all" />
          </div>
          <div>
            <label class="block text-[10px] font-bold text-[#67657F] uppercase tracking-widest mb-1.5 ml-1">描述</label>
            <textarea v-model="newProject.description" rows="3" class="w-full px-3 py-2 bg-[#FAFAFC] border border-[#E6E7E8] rounded-lg text-sm outline-none focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] transition-all resize-none"></textarea>
          </div>
          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 text-xs font-bold text-[#67657F] hover:bg-gray-100 rounded-md transition-colors">取消</button>
            <button type="submit" :disabled="creating || !newProject.name.trim()" class="px-4 py-2 text-xs font-bold text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] transition-all">确定创建</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 二次确认删除组件 -->
    <ConfirmModal 
      :isOpen="isDeleteConfirmOpen"
      title="确认删除项目"
      :message="`确定要永久删除项目「${projectToDelete?.name}」吗？这将删除该项目下的所有任务，且无法恢复。`"
      @confirm="executeDelete"
      @cancel="isDeleteConfirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import api from '../api';
import type { Project } from '../types';
import { toastStore } from '../toast';
import ConfirmModal from './ConfirmModal.vue';

defineEmits(['select']);

const projects = ref<Project[]>([]);
const loading = ref(true);
const showCreateModal = ref(false);
const creating = ref(false);
const newProject = reactive({ name: '', description: '', color: '#5E6AD2' });
const isDeleteConfirmOpen = ref(false);
const projectToDelete = ref<Project | null>(null);

const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await api.get<Project[]>('/projects');
    projects.value = res.data;
  } finally { loading.value = false; }
};

const handleCreate = async () => {
  if (!newProject.name.trim()) return;
  creating.value = true;
  try {
    await api.post('/projects', newProject);
    toastStore.show('项目已创建');
    showCreateModal.value = false;
    newProject.name = ''; newProject.description = '';
    fetchProjects();
  } finally { creating.value = false; }
};

const confirmDelete = (project: Project) => {
  projectToDelete.value = project;
  isDeleteConfirmOpen.value = true;
};

const executeDelete = async () => {
  if (!projectToDelete.value) return;
  try {
    await api.delete(`/projects/${projectToDelete.value.id}`);
    toastStore.show('项目已删除', 'success');
    fetchProjects();
  } finally {
    isDeleteConfirmOpen.value = false;
    projectToDelete.value = null;
  }
};

const statusDotColor = (s: string) => {
  if (s === 'active') return 'bg-emerald-500';
  if (s === 'completed') return 'bg-blue-500';
  return 'bg-gray-400';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

onMounted(fetchProjects);
</script>