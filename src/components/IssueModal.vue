<!-- src/components/IssueModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" @click="handleCancel"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white w-full max-w-[1200px] h-full md:h-[92vh] rounded-none md:rounded-xl shadow-2xl border border-[#E6E7E8] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
      
      <!-- 顶部 Header -->
      <header class="h-12 border-b border-[#F0F0F2] flex items-center justify-between px-4 shrink-0 bg-white">
        <div class="flex items-center gap-3 text-[13px] text-[#67657F] min-w-0">
          <span class="hover:text-[#1D1D20] cursor-pointer shrink-0">Workspace</span>
          <span class="text-[#D1D1D6] shrink-0">/</span>
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

      <!-- 中间内容区 -->
      <div class="flex-1 flex overflow-hidden">
        <!-- 左侧：主要编辑器 -->
        <main class="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-white">
          <div class="max-w-[850px] mx-auto space-y-8">
            
            <!-- 标题编辑器 (自动增高) -->
            <textarea 
              ref="titleRef"
              v-model="form.title" 
              placeholder="任务标题"
              rows="1"
              class="w-full text-3xl font-bold border-none outline-none resize-none placeholder:text-[#D1D1D6] focus:ring-0 p-0 overflow-hidden leading-tight text-[#1D1D20]"
              @input="autoGrow"
            ></textarea>

            <!-- 描述/Markdown 编辑器区域 -->
            <div class="min-h-[450px] group relative">
              <!-- 编辑模式 (输入框) -->
              <textarea 
                v-if="isEditingDesc || !form.description"
                ref="descRef"
                v-model="form.description" 
                placeholder="添加详细描述（支持 Markdown，如：# 标题, ``` 代码块）..."
                class="w-full min-h-[450px] text-[15px] border-none outline-none resize-none placeholder:text-[#D1D1D6] focus:ring-0 p-0 leading-relaxed text-[#1D1D20] bg-transparent"
                @blur="isEditingDesc = false"
                @input="autoGrow"
              ></textarea>

              <!-- 预览模式 (Marked 渲染 HTML) -->
              <div 
                v-else
                @click="focusDesc"
                class="prose prose-slate max-w-none text-[15px] leading-relaxed text-[#1D1D20] cursor-text min-h-[450px]"
                v-html="parsedMarkdown"
              ></div>
              
              <!-- 悬浮编辑提示 -->
              <div v-if="!isEditingDesc && form.description" class="absolute top-0 -right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[10px] font-black text-[#9593A3] bg-[#FAFAFC] px-1.5 py-0.5 border rounded uppercase tracking-tighter">Edit</span>
              </div>
            </div>

            <!-- Activity 动态与评论区 -->
            <section v-if="isEditMode" class="pt-10 border-t border-[#F0F0F2] space-y-8">
              <h3 class="text-sm font-bold text-[#1D1D20] tracking-tight">Activity</h3>
              
              <div class="space-y-6">
                <div class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-[#5E6AD2] rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">U</div>
                  <div class="text-[13px] text-[#67657F] mt-0.5">
                    <span class="font-bold text-[#1D1D20]">You</span> created this issue 
                    <span class="text-[#9593A3] ml-1">· {{ formatFullTime(form.created_at) }}</span>
                  </div>
                </div>

                <div v-for="comment in comments" :key="comment.id" class="flex items-start gap-3">
                  <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-[#67657F] font-bold shrink-0">
                    {{ comment.username.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 space-y-1.5 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="text-[13px] font-bold text-[#1D1D20]">{{ comment.username }}</span>
                      <span class="text-[11px] text-[#9593A3]">{{ formatFullTime(comment.created_at) }}</span>
                    </div>
                    <div class="text-[14px] text-[#1D1D20] leading-relaxed whitespace-pre-wrap bg-[#FAFAFC] p-3 rounded-lg border border-[#F0F0F2]">
                      {{ comment.content }}
                    </div>
                  </div>
                </div>

                <div v-if="commentLoading" class="flex justify-center py-4">
                  <div class="w-4 h-4 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>

              <!-- 评论框 -->
              <div class="mt-8 border border-[#E6E7E8] rounded-xl focus-within:border-[#5E6AD2] focus-within:ring-4 focus-within:ring-[#5E6AD2]/5 transition-all overflow-hidden bg-white shadow-sm">
                <textarea 
                  v-model="commentText"
                  placeholder="留下一条记录 ..."
                  class="w-full p-4 text-[14px] border-none outline-none focus:ring-0 resize-none min-h-[100px]"
                ></textarea>
                <div class="flex justify-end px-4 py-2 bg-[#FAFAFC] border-t border-[#F0F0F2]">
                  <button 
                    @click="handlePostComment"
                    :disabled="!commentText.trim() || postingComment"
                    class="bg-[#5E6AD2] text-white px-4 py-1.5 rounded-md text-[12px] font-bold hover:bg-[#525BC2] disabled:opacity-40 transition-all"
                  >
                    Comment
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>

        <!-- 右侧：属性面板 -->
        <aside class="w-[280px] border-l border-[#F0F0F2] bg-[#FAFAFC]/50 overflow-y-auto p-6 hidden lg:block space-y-8">
          <div>
            <h4 class="text-[11px] font-bold text-[#9593A3] uppercase tracking-wider mb-4">Properties</h4>
            <div class="space-y-1">
              <!-- 状态 -->
              <div class="relative menu-container">
                <div @click.stop="activeMenu = activeMenu === 'status' ? null : 'status'"
                  class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors cursor-pointer group">
                  <span class="text-[13px] text-[#67657F]">Status</span>
                  <div class="flex items-center gap-2">
                    <span :class="['w-2 h-2 rounded-full', statusPointColor(form.status)]"></span>
                    <span class="text-[13px] font-semibold text-[#1D1D20] capitalize">{{ formatStatus(form.status) }}</span>
                  </div>
                </div>
                <div v-if="activeMenu === 'status'" class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E6E7E8] rounded-lg shadow-xl z-[110] py-1">
                  <div v-for="s in ['backlog', 'todo', 'in_progress', 'done', 'canceled']" :key="s"
                    @click="form.status = s; activeMenu = null" class="flex items-center gap-2 px-3 py-1.5 hover:bg-[#F4F4F5] cursor-pointer text-[13px]">
                    <span :class="['w-2 h-2 rounded-full', statusPointColor(s)]"></span>
                    {{ formatStatus(s) }}
                  </div>
                </div>
              </div>

              <!-- 优先级 -->
              <div class="relative menu-container">
                <div @click.stop="activeMenu = activeMenu === 'priority' ? null : 'priority'"
                  class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors cursor-pointer group">
                  <span class="text-[13px] text-[#67657F]">Priority</span>
                  <span class="text-[13px] font-semibold text-[#1D1D20]">{{ formatPriority(form.priority) }}</span>
                </div>
                <div v-if="activeMenu === 'priority'" class="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E6E7E8] rounded-lg shadow-xl z-[110] py-1">
                  <div v-for="p in [0, 1, 2, 3, 4]" :key="p" @click="form.priority = p; activeMenu = null"
                    class="px-3 py-1.5 hover:bg-[#F4F4F5] cursor-pointer text-[13px]">
                    {{ formatPriority(p) }}
                  </div>
                </div>
              </div>

              <!-- 截止日期 -->
              <div class="flex items-center justify-between px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md transition-colors">
                <span class="text-[13px] text-[#67657F]">Due Date</span>
                <input type="date" v-model="form.due_date" class="bg-transparent border-none text-[12px] font-semibold p-0 focus:ring-0 text-right w-32 text-[#1D1D20] cursor-pointer" />
              </div>
            </div>
          </div>

          <div>
            <h4 class="text-[11px] font-bold text-[#9593A3] uppercase tracking-wider mb-3">Project</h4>
            <div class="flex items-center gap-2 px-3 py-2 bg-white border border-[#E6E7E8] rounded-lg shadow-sm">
               <div class="w-2 h-2 rounded-full bg-[#5E6AD2]"></div>
               <span class="text-[13px] font-semibold text-[#1D1D20] truncate">{{ projectName || 'Unassigned' }}</span>
            </div>
          </div>
        </aside>
      </div>

      <!-- 底部操作栏 -->
      <footer class="p-4 border-t border-[#F0F0F2] flex justify-end gap-3 bg-white shrink-0">
        <button @click="handleCancel" class="px-4 py-2 text-xs font-bold text-[#67657F] hover:bg-gray-100 rounded-md transition-all">取消</button>
        <button @click="handleSubmit" :disabled="loading || !form.title.trim()"
          class="px-5 py-2 text-xs font-bold text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] shadow-md transition-all">
          {{ isEditMode ? '保存修改' : '创建任务' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 引入语法高亮 CSS

import api from '../api';
import type { Issue, Comment } from '../types';
import { toastStore } from '../toast';

const props = defineProps<{
  isOpen: boolean;
  editData?: Issue | null;
  defaultProjectId?: number;
  projectName?: string; 
}>();

const emit = defineEmits(['close', 'saved']);

// 状态
const loading = ref(false);
const commentLoading = ref(false);
const postingComment = ref(false);
const commentText = ref('');
const comments = ref<Comment[]>([]);
const activeMenu = ref<string | null>(null);
const isEditingDesc = ref(false);

// 元素引用
const titleRef = ref<HTMLTextAreaElement | null>(null);
const descRef = ref<HTMLTextAreaElement | null>(null);

// ------------------------------------------------------------------
// 配置 Marked 解析器 (兼容 v12+)
// ------------------------------------------------------------------
marked.use({
  renderer: {
    // 新版 renderer.code 只接收一个包含所有属性的对象参数
    code(token: any) {
      const codeText = token.text || '';
      const lang = token.lang || 'plaintext';
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(codeText, { language }).value;
      return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
    }
  }
});

const parsedMarkdown = computed(() => marked.parse(form.value.description || ''));

// ------------------------------------------------------------------
// 核心逻辑
// ------------------------------------------------------------------

const form = ref<any>({ project_id: 0, title: '', description: '', status: 'todo', priority: 0, due_date: '' });
const isEditMode = computed(() => !!props.editData);

const focusDesc = async () => {
  isEditingDesc.value = true;
  await nextTick();
  descRef.value?.focus();
  if (descRef.value) autoGrow({ target: descRef.value });
};

const autoGrow = (e: any) => {
  const el = e.target;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
};

const fetchComments = async (issueId: number) => {
  commentLoading.value = true;
  try {
    const res = await api.get<Comment[]>(`/issues/${issueId}/comments`);
    comments.value = res.data;
  } finally { commentLoading.value = false; }
};

const handlePostComment = async () => {
  if (!commentText.value.trim() || !props.editData) return;
  postingComment.value = true;
  try {
    const res = await api.post<Comment>(`/issues/${props.editData.id}/comments`, { content: commentText.value });
    comments.value.push(res.data);
    commentText.value = '';
    toastStore.show('评论已发表');
  } finally { postingComment.value = false; }
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    if (props.editData) {
      form.value = { ...props.editData, due_date: props.editData.due_date ? String(props.editData.due_date).split('T')[0] : '' };
      fetchComments(props.editData.id);
    } else {
      form.value = { project_id: props.defaultProjectId || 0, title: '', description: '', status: 'todo', priority: 0, due_date: '' };
      comments.value = [];
    }
    isEditingDesc.value = false;
    await nextTick();
    if (titleRef.value) autoGrow({ target: titleRef.value });
    if (descRef.value) autoGrow({ target: descRef.value });
  }
});

const formatFullTime = (d?: string) => d ? new Date(d).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';
const formatStatus = (s: string) => ({ backlog: 'Backlog', todo: 'Todo', in_progress: 'Started', done: 'Done', canceled: 'Canceled' }[s] || s);
const statusPointColor = (s: string) => ({ done: 'bg-emerald-500', in_progress: 'bg-amber-500', todo: 'bg-blue-500', backlog: 'bg-gray-400', canceled: 'bg-red-500' }[s] || 'bg-gray-300');
const formatPriority = (p: number) => ({ 0: 'No priority', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Urgent' }[p] || 'No priority');
const handleCancel = () => emit('close');

const handleSubmit = async () => {
  if (!form.value.title.trim()) return;
  loading.value = true;
  try {
    const payload = { ...form.value, due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null };
    if (isEditMode.value) await api.patch(`/issues/${form.value.id}`, payload);
    else await api.post('/issues', payload);
    emit('saved');
    emit('close');
  } finally { loading.value = false; }
};

const handleOutsideClick = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.menu-container')) activeMenu.value = null; };
onMounted(() => window.addEventListener('click', handleOutsideClick));
onUnmounted(() => window.removeEventListener('click', handleOutsideClick));
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E6E7E8; border-radius: 10px; }
textarea { scrollbar-width: none; }
textarea::-webkit-scrollbar { display: none; }
</style>