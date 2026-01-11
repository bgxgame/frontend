<!-- src/components/IssueModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" @click="handleCancel"></div>

    <!-- 详情面板主体 -->
    <div class="relative bg-white w-full max-w-[1200px] h-full md:h-[90vh] rounded-none md:rounded-xl shadow-2xl border border-[#E6E7E8] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- 1. 头部工具栏 -->
      <header class="h-12 border-b border-[#F0F0F2] flex items-center justify-between px-4 shrink-0 bg-white">
        <div class="flex items-center gap-3 text-[13px] text-[#67657F] min-w-0">
          <span class="hover:text-[#1D1D20] cursor-pointer shrink-0">Workspace</span>
          <span class="text-[#D1D1D6] shrink-0">/</span>
          <!-- 顶部显示 Issue 标题 -->
          <span class="font-medium text-[#1D1D20] truncate">
            {{ isEditMode ? (form.title || 'Untitled Issue') : 'New Issue' }}
          </span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <button @click="handleCancel" class="p-1.5 hover:bg-gray-100 rounded text-[#9593A3] transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </header>

      <div class="flex-1 flex overflow-hidden">
        <!-- 2. 左侧：主体内容区 -->
        <main class="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-white">
          <div class="max-w-[800px] mx-auto space-y-8">
            
            <!-- 标题编辑 (无滚动条，自动高度) -->
            <textarea 
              ref="titleRef"
              v-model="form.title" 
              placeholder="任务标题"
              rows="1"
              class="w-full text-3xl font-bold border-none outline-none resize-none placeholder:text-[#D1D1D6] focus:ring-0 p-0 overflow-hidden leading-tight text-[#1D1D20]"
              @input="autoGrow"
            ></textarea>

            <!-- 描述编辑 (Markdown 支持) -->
            <textarea 
              v-model="form.description" 
              placeholder="添加详细描述..."
              class="w-full min-h-[200px] text-[15px] border-none outline-none resize-none placeholder:text-[#D1D1D6] focus:ring-0 p-0 leading-relaxed text-[#1D1D20]"
            ></textarea>

            <!-- 活动与评论区 (仅编辑模式显示) -->
            <section v-if="isEditMode" class="pt-10 border-t border-[#F0F0F2] space-y-6">
              <h3 class="text-sm font-bold text-[#1D1D20]">Activity</h3>
              
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-[#5E6AD2] rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-sm">U</div>
                  <div class="text-[13px] text-[#67657F]">
                    <span class="font-bold text-[#1D1D20]">You</span> 
                    created this issue 
                    <span class="text-[#9593A3] ml-1">· {{ formatFullTime(form.created_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- 评论框 -->
              <div class="mt-8 relative border border-[#E6E7E8] rounded-lg focus-within:border-[#5E6AD2] focus-within:ring-4 focus-within:ring-[#5E6AD2]/5 transition-all overflow-hidden bg-white">
                <textarea 
                  v-model="commentText"
                  placeholder="留下一条评论..."
                  class="w-full p-4 text-[14px] border-none outline-none focus:ring-0 resize-none min-h-[100px]"
                ></textarea>
                <div class="flex justify-between items-center px-4 py-2 bg-[#FAFAFC] border-t border-[#F0F0F2]">
                  <button class="text-[#9593A3] hover:text-[#1D1D20] transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </button>
                  <button 
                    @click="handlePostComment"
                    :disabled="!commentText.trim()"
                    class="bg-[#5E6AD2] text-white px-3 py-1.5 rounded text-[12px] font-bold hover:bg-[#525BC2] disabled:opacity-50 transition-all"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

        <!-- 3. 右侧：属性侧边栏 -->
        <aside class="w-[280px] border-l border-[#F0F0F2] bg-[#FAFAFC]/50 overflow-y-auto p-6 hidden lg:block space-y-8">
          <div>
            <h4 class="text-[11px] font-bold text-[#9593A3] uppercase tracking-wider mb-4">Properties</h4>
            
            <div class="space-y-1">
              
              <!-- 自定义 Status 下拉菜单 -->
              <div class="relative menu-container">
                <div 
                  @click.stop="activeMenu = activeMenu === 'status' ? null : 'status'"
                  class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors cursor-pointer group"
                >
                  <span class="text-[13px] text-[#67657F]">Status</span>
                  <div class="flex items-center gap-2">
                    <span :class="['w-2 h-2 rounded-full', statusPointColor(form.status)]"></span>
                    <span class="text-[13px] font-semibold text-[#1D1D20] capitalize">{{ formatStatus(form.status) }}</span>
                  </div>
                </div>
                <!-- 下拉浮层 -->
                <div v-if="activeMenu === 'status'" class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E6E7E8] rounded-lg shadow-xl z-[110] py-1 animate-in fade-in zoom-in duration-100">
                  <div 
                    v-for="s in ['backlog', 'todo', 'in_progress', 'done', 'canceled']" :key="s"
                    @click="form.status = s; activeMenu = null"
                    class="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F4F4F5] cursor-pointer"
                  >
                    <span :class="['w-2 h-2 rounded-full', statusPointColor(s)]"></span>
                    <span class="text-[13px] text-[#1D1D20] capitalize">{{ formatStatus(s) }}</span>
                  </div>
                </div>
              </div>

              <!-- 自定义 Priority 下拉菜单 -->
              <div class="relative menu-container">
                <div 
                  @click.stop="activeMenu = activeMenu === 'priority' ? null : 'priority'"
                  class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors cursor-pointer group"
                >
                  <span class="text-[13px] text-[#67657F]">Priority</span>
                  <span class="text-[13px] font-semibold text-[#1D1D20]">{{ formatPriority(form.priority) }}</span>
                </div>
                <div v-if="activeMenu === 'priority'" class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E6E7E8] rounded-lg shadow-xl z-[110] py-1 animate-in fade-in zoom-in duration-100">
                  <div 
                    v-for="p in [0, 1, 2, 3, 4]" :key="p"
                    @click="form.priority = p; activeMenu = null"
                    class="px-3 py-1.5 hover:bg-[#F4F4F5] cursor-pointer text-[13px] text-[#1D1D20]"
                  >
                    {{ formatPriority(p) }}
                  </div>
                </div>
              </div>

              <!-- Due Date -->
              <div class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors">
                <span class="text-[13px] text-[#67657F]">Due Date</span>
                <input 
                  type="date" 
                  v-model="form.due_date"
                  class="bg-transparent border-none text-[12px] font-semibold p-0 focus:ring-0 cursor-pointer text-right w-32 text-[#1D1D20]"
                />
              </div>
            </div>
          </div>

          <!-- Project 信息 -->
          <div>
            <h4 class="text-[11px] font-bold text-[#9593A3] uppercase tracking-wider mb-3">Project</h4>
            <div class="flex items-center gap-2 px-3 py-2 bg-white border border-[#E6E7E8] rounded-lg shadow-sm">
               <div class="w-2 h-2 rounded-full bg-[#5E6AD2]"></div>
               <span class="text-[13px] font-semibold text-[#1D1D20] truncate">
                 {{ projectName || 'Unassigned' }}
               </span>
            </div>
          </div>
        </aside>
      </div>

      <!-- 4. 底部操作栏 -->
      <footer class="p-4 border-t border-[#F0F0F2] flex justify-end gap-3 bg-white shrink-0">
        <button @click="handleCancel" class="px-4 py-2 text-xs font-bold text-[#67657F] hover:bg-gray-100 rounded-md transition-all">取消</button>
        <button 
          @click="handleSubmit" 
          :disabled="loading || !form.title.trim()"
          class="px-5 py-2 text-xs font-bold text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
        >
          <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isEditMode ? '更新任务' : '创建任务' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import api from '../api';
import type { Issue } from '../types';
import { toastStore } from '../toast';

const props = defineProps<{
  isOpen: boolean;
  editData?: Issue | null;
  defaultProjectId?: number;
  projectName?: string;
}>();

const emit = defineEmits(['close', 'saved']);

const loading = ref(false);
const commentText = ref('');
const activeMenu = ref<string | null>(null);
const titleRef = ref<HTMLTextAreaElement | null>(null);

const getInitialForm = () => ({
  project_id: props.defaultProjectId || 0,
  title: '',
  description: '',
  status: 'todo',
  priority: 0,
  due_date: '',
  created_at: '',
});

const form = ref<any>(getInitialForm());
const isEditMode = computed(() => !!props.editData);

// 监听弹窗打开：数据初始化与高度计算
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    if (props.editData) {
      form.value = { 
        ...props.editData,
        due_date: props.editData.due_date ? String(props.editData.due_date).split('T')[0] : ''
      };
    } else {
      form.value = getInitialForm();
    }
    commentText.value = '';
    activeMenu.value = null;

    await nextTick();
    if (titleRef.value) autoGrow({ target: titleRef.value });
  }
});

// --- 工具函数 ---

const autoGrow = (e: any) => {
  const el = e.target;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};

const formatFullTime = (dateStr?: string) => {
  if (!dateStr) return 'Just now';
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatStatus = (s: string) => {
  const map: any = { backlog: 'Backlog', todo: 'Todo', in_progress: 'In Progress', done: 'Done', canceled: 'Canceled' };
  return map[s] || s;
};

const statusPointColor = (s: string) => {
  switch (s) {
    case 'done': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    case 'todo': return 'bg-blue-500';
    case 'backlog': return 'bg-gray-400';
    case 'canceled': return 'bg-red-500';
    default: return 'bg-gray-300';
  }
};

const formatPriority = (p: number) => {
  const map: any = { 0: 'No priority', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' };
  return map[p] || 'No priority';
};

const handleCancel = () => {
  if (loading.value) return;
  emit('close');
};

const handleSubmit = async () => {
  if (!form.value.title.trim()) return;
  loading.value = true;
  try {
    let formattedDate = null;
    if (form.value.due_date) formattedDate = new Date(form.value.due_date).toISOString();
    
    const payload = { ...form.value, due_date: formattedDate };

    if (isEditMode.value) {
      await api.patch(`/issues/${form.value.id}`, payload);
      toastStore.show('任务已成功更新');
    } else {
      await api.post('/issues', payload);
      toastStore.show('新任务已创建');
    }
    emit('saved');
    emit('close');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handlePostComment = () => {
  if (!commentText.value.trim()) return;
  toastStore.show('评论已提交 (演示模式)', 'info');
  commentText.value = '';
};

// 点击外部关闭下拉菜单
const handleOutsideClick = (e: MouseEvent) => {
  if (!(e.target as HTMLElement).closest('.menu-container')) {
    activeMenu.value = null;
  }
};

onMounted(() => window.addEventListener('click', handleOutsideClick));
onUnmounted(() => window.removeEventListener('click', handleOutsideClick));
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E6E7E8; border-radius: 10px; }

/* 深度隐藏标题区域可能的原生滚动条 */
textarea {
  scrollbar-width: none;
}
textarea::-webkit-scrollbar {
  display: none;
}
textarea::placeholder { color: #D1D1D6; }
</style>