<!-- src/components/ProjectList.vue -->
<template>
  <div class="space-y-6">
    <!-- 顶部标题与操作栏 -->
    <div class="flex justify-between items-center">
      <div class="flex items-center gap-2">
        <h2 class="text-lg font-bold text-[#1D1D20] tracking-tight">所有项目</h2>
        <span class="text-xs text-[#9593A3] bg-[#F4F4F5] px-2 py-0.5 rounded-full font-bold border border-[#E6E7E8]">
          {{ projects.length }}
        </span>
      </div>
      <button 
        @click="showCreateModal = true"
        class="flex items-center gap-2 px-3 py-1.5 bg-[#5E6AD2] text-white text-xs font-bold rounded-md hover:bg-[#525BC2] transition-all shadow-sm shadow-indigo-100 active:scale-[0.98]"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        新建项目
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-32 text-[#67657F]">
      <div class="w-8 h-8 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="text-sm font-medium uppercase tracking-widest text-[10px]">正在同步项目...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="projects.length === 0" class="text-center py-32 bg-white rounded-2xl border border-dashed border-[#E6E7E8]">
      <div class="w-16 h-16 bg-[#FAFAFC] rounded-3xl flex items-center justify-center mx-auto mb-4 border border-[#F0F0F2]">
        <svg class="w-8 h-8 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-sm font-bold text-[#1D1D20]">暂无活跃项目</h3>
      <p class="text-[#67657F] text-xs mt-1">创建一个项目来开始组织你的任务流</p>
      <button @click="showCreateModal = true" class="mt-6 text-xs font-bold text-[#5E6AD2] hover:underline">立即创建第一个项目</button>
    </div>

    <!-- 项目网格 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      <div 
        v-for="project in projects" 
        :key="project.id"
        @click="$emit('select', project)"
        class="bg-white border border-[#E6E7E8] rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-[#D1D1D6] transition-all cursor-pointer group flex flex-col relative overflow-hidden"
      >
        <!-- 侧边颜色条装饰 -->
        <div 
          class="absolute left-0 top-0 bottom-0 w-1 opacity-60" 
          :style="{ backgroundColor: project.color || '#5E6AD2' }"
        ></div>

        <div class="flex justify-between items-start mb-4">
          <div 
            class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border"
            :style="{ color: project.color || '#5E6AD2', borderColor: (project.color || '#5E6AD2') + '33', backgroundColor: (project.color || '#5E6AD2') + '11' }"
          >
            {{ project.status }}
          </div>
          <!-- 删除项目 -->
          <button 
            @click.stop="confirmDelete(project)"
            class="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded-md text-[#9593A3] hover:text-red-500 transition-all"
            title="删除项目"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <h3 class="font-bold text-[#1D1D20] text-base mb-2 group-hover:text-[#5E6AD2] transition-colors line-clamp-1">
          {{ project.name }}
        </h3>
        
        <p class="text-[#67657F] text-[13px] line-clamp-2 mb-6 leading-relaxed flex-1">
          {{ project.description || '此项目尚无详细描述。' }}
        </p>

        <div class="pt-4 border-t border-[#F0F0F2] flex justify-between items-center">
          <div class="flex items-center text-[11px] font-bold text-[#9593A3] uppercase tracking-tighter">
            Updated {{ formatDate(project.updated_at) }}
          </div>
          <span class="text-[11px] font-bold text-[#D1D1D6] group-hover:text-[#5E6AD2] transition-colors">
            查看任务 →
          </span>
        </div>
      </div>
    </div>

    <!-- 新建项目的 Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="showCreateModal = false"></div>
      
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E6E7E8] animate-in fade-in zoom-in duration-200">
        <div class="px-6 py-4 border-b border-[#F0F0F2] bg-[#FAFAFC]">
          <h2 class="text-sm font-bold text-[#1D1D20]">新建项目</h2>
        </div>

        <form @submit.prevent="handleCreate" class="p-6 space-y-5">
          <div>
            <label class="block text-[10px] font-bold text-[#67657F] uppercase tracking-widest mb-1.5 ml-1">项目名称</label>
            <input 
              v-model="newProject.name" 
              type="text" 
              required 
              autofocus
              class="w-full px-3 py-2 bg-[#FAFAFC] border border-[#E6E7E8] rounded-lg text-sm outline-none focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] transition-all" 
              placeholder="例如：生活计划 2026" 
            />
          </div>

          <div>
            <label class="block text-[10px] font-bold text-[#67657F] uppercase tracking-widest mb-1.5 ml-1">简短描述</label>
            <textarea 
              v-model="newProject.description" 
              rows="3" 
              class="w-full px-3 py-2 bg-[#FAFAFC] border border-[#E6E7E8] rounded-lg text-sm outline-none focus:ring-4 focus:ring-[#5E6AD2]/10 focus:border-[#5E6AD2] transition-all resize-none" 
              placeholder="这个项目是关于什么的？"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-2">
            <button 
              type="button" 
              @click="showCreateModal = false" 
              class="px-4 py-2 text-xs font-bold text-[#67657F] hover:bg-gray-100 rounded-md transition-colors"
            >
              取消
            </button>
            <button 
              type="submit" 
              :disabled="creating || !newProject.name.trim()" 
              class="px-4 py-2 text-xs font-bold text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] disabled:opacity-50 shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
            >
              <span v-if="creating" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              确定创建
            </button>
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

// 定义事件
defineEmits(['select']);

const projects = ref<Project[]>([]);
const loading = ref(true);

// 新建项目状态
const showCreateModal = ref(false);
const creating = ref(false);
const newProject = reactive({
  name: '',
  description: '',
  color: '#5E6AD2' // 默认颜色
});

// 删除项目状态
const isDeleteConfirmOpen = ref(false);
const projectToDelete = ref<Project | null>(null);

// 1. 获取项目列表
const fetchProjects = async () => {
  loading.value = true;
  try {
    const res = await api.get<Project[]>('/projects');
    projects.value = res.data;
  } catch (err) {
    console.error("加载项目失败", err);
  } finally {
    loading.value = false;
  }
};

// 2. 创建新项目
const handleCreate = async () => {
  if (!newProject.name.trim()) return;
  
  creating.value = true;
  try {
    await api.post('/projects', newProject);
    toastStore.show('项目已创建');
    showCreateModal.value = false;
    // 重置表单
    newProject.name = '';
    newProject.description = '';
    // 重新获取列表
    await fetchProjects();
  } catch (err) {
    // 拦截器会自动弹出错误 Toast
  } finally {
    creating.value = false;
  }
};

// 3. 删除逻辑
const confirmDelete = (project: Project) => {
  projectToDelete.value = project;
  isDeleteConfirmOpen.value = true;
};

const executeDelete = async () => {
  if (!projectToDelete.value) return;
  
  try {
    await api.delete(`/projects/${projectToDelete.value.id}`);
    toastStore.show('项目及其关联任务已删除', 'success');
    await fetchProjects();
  } finally {
    isDeleteConfirmOpen.value = false;
    projectToDelete.value = null;
  }
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Recently';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
};

onMounted(fetchProjects);
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}
.animate-in {
  animation-duration: 0.2s;
  animation-fill-mode: both;
}
@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.zoom-in { animation-name: zoom-in; }
</style>