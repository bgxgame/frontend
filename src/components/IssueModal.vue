<!-- src/components/IssueModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="handleClose"></div>

    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E6E7E8] flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">

      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-[#E6E7E8] flex justify-between items-center bg-[#FAFAFC]">
        <h2 class="text-[15px] font-bold text-[#1D1D20] flex items-center gap-2">
          <span v-if="isEditMode" class="w-2 h-2 rounded-full bg-[#5E6AD2]"></span>
          {{ isEditMode ? '编辑任务' : '新建任务' }}
        </h2>
        <button type="button" @click="handleClose" class="text-[#9593A3] hover:text-[#1D1D20] transition-colors p-1 hover:bg-gray-100 rounded">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
        <!-- 错误提示 -->
        <div v-if="generalError" class="p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-600 text-sm animate-shake">
          <span>{{ generalError }}</span>
        </div>

        <!-- 标题 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Issue Title</label>
          <input v-model="form.title" type="text" placeholder="任务标题..." :class="[
            'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all text-sm',
            fieldErrors.title ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
          ]" />
          <p v-if="fieldErrors.title" class="text-[11px] text-red-500 mt-1 font-medium">{{ fieldErrors.title[0] }}</p>
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Description (Markdown)</label>
          <textarea v-model="form.description" rows="5" placeholder="添加详细描述..." :class="[
            'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all resize-none text-sm',
            fieldErrors.description ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
          ]"></textarea>
          <p v-if="fieldErrors.description" class="text-[11px] text-red-500 mt-1 font-medium">{{ fieldErrors.description[0] }}</p>
        </div>

        <!-- 属性选择 -->
        <div class="grid grid-cols-2 gap-4">
          <!-- 状态选择 -->
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Status</label>
            <select v-model="form.status" class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white cursor-pointer focus:border-[#5E6AD2]">
              <option value="backlog">积压 (Backlog)</option>
              <option value="todo">待办 (Todo)</option>
              <option value="in_progress">进行中 (Started)</option>
              <option value="done">已完成 (Done)</option>
              <option value="canceled">已取消 (Canceled)</option>
            </select>
          </div>
          <!-- 优先级选择 -->
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Priority</label>
            <select v-model.number="form.priority" class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white cursor-pointer focus:border-[#5E6AD2]">
              <option :value="0">无 (No Priority)</option>
              <option :value="1">低 (Low)</option>
              <option :value="2">中 (Medium)</option>
              <option :value="3">高 (High)</option>
              <option :value="4">紧急 (Urgent)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <!-- 截止日期 -->
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Due Date</label>
            <input v-model="form.due_date" type="date" class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none focus:border-[#5E6AD2]" />
          </div>
          <!-- 所属项目 (只读显示或禁用修改，通常在进入项目后再建) -->
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5 ml-1">Project ID</label>
            <input :value="form.project_id" type="text" disabled class="w-full px-3 py-2 bg-gray-50 border border-[#E6E7E8] rounded-md text-sm text-gray-400" />
          </div>
        </div>

        <!-- 底部 -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#E6E7E8] mt-4">
          <button type="button" @click="handleClose" class="px-4 py-1.5 text-xs font-bold text-[#67657F] bg-white border border-[#E6E7E8] rounded-md hover:bg-gray-50 transition-all">
            取消
          </button>
          <button type="submit" :disabled="loading" class="px-4 py-1.5 text-xs font-bold text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] transition-all flex items-center gap-2">
            <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isEditMode ? '保存更改' : '创建 Issue' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import api from '../api';
import type { Issue } from '../types';
import { toastStore } from '../toast';

const props = defineProps<{
  isOpen: boolean;
  editData?: Issue | null;
  defaultProjectId?: number; // 从外部传入当前所处的项目ID
}>();

const emit = defineEmits(['close', 'saved']);

const loading = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});
const generalError = ref('');

const getInitialForm = () => ({
  project_id: props.defaultProjectId || 0,
  title: '',
  description: '',
  status: 'todo',
  priority: 0,
  due_date: '',
});

const form = ref(getInitialForm());
const isEditMode = computed(() => !!props.editData);

// 监听数据变化
watch(() => props.isOpen, (val) => {
  if (val) {
    if (props.editData) {
      // 编辑模式
      form.value = {
        ...props.editData,
        due_date: props.editData.due_date ? String(props.editData.due_date).split('T')[0] : '',
        description: props.editData.description || '',
      };
    } else {
      // 新建模式：重置并应用当前项目ID
      form.value = getInitialForm();
    }
    fieldErrors.value = {};
    generalError.value = '';
  }
});

const handleClose = () => {
  if (loading.value) return;
  emit('close');
};

const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    fieldErrors.value = { title: ['标题是必填项'] };
    return;
  }

  loading.value = true;
  fieldErrors.value = {};
  generalError.value = '';

  try {
    // --- 1. 定义并处理日期 (修复找不到名称的问题) ---
    let formattedDate = null;
    if (form.value.due_date && form.value.due_date.trim() !== '') {
      const dateObj = new Date(form.value.due_date);
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString();
      }
    }

    // --- 2. 构造发送给后端的 Payload ---
    const payload = {
      title: form.value.title,
      // 如果描述被删光了，发送 "" 确保后端 SQL 执行更新
      description: form.value.description.trim() === '' ? "" : form.value.description,
      status: form.value.status,
      priority: Number(form.value.priority),
      due_date: formattedDate, // 现在这里不会报错了
    };

    if (isEditMode.value && props.editData) {
      // 更新逻辑
      await api.patch(`/issues/${props.editData.id}`, payload);
      toastStore.show('任务已成功更新');
    } else {
      // 创建逻辑：创建时额外需要 project_id
      const createPayload = {
        ...payload,
        project_id: form.value.project_id
      };
      await api.post('/issues', createPayload);
      toastStore.show('新任务已创建');
    }

    emit('saved');
    handleClose();
  } catch (err: any) {
    // 错误处理逻辑...
    const errorData = err.response?.data;
    if (errorData && errorData.errors) {
      fieldErrors.value = errorData.errors;
      const keys = Object.keys(errorData.errors);
      if (keys.length > 0) generalError.value = errorData.errors[keys[0]][0];
    } else {
      generalError.value = err.response?.data?.message || '操作失败';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
.animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
.animate-in { animation: animate-in 0.2s ease-out; }
@keyframes animate-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>