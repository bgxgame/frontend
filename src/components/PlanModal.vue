<!-- src/components/PlanModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 背景遮罩 -->
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      @click="handleClose"
    ></div>
    
    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E6E7E8] flex flex-col max-h-[95vh]">
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-[#E6E7E8] flex justify-between items-center bg-[#FAFAFC]">
        <h2 class="text-[16px] font-semibold text-[#1D1D20]">
          {{ isEditMode ? '编辑计划' : '新建计划' }}
        </h2>
        <button @click="handleClose" class="text-[#9593A3] hover:text-[#1D1D20] transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
        <!-- 标题 -->
        <div>
          <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="做什么？"
            required 
            class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition-all placeholder:text-gray-300" 
          />
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">详细描述</label>
          <textarea 
            v-model="form.description" 
            rows="3" 
            placeholder="添加一些说明..."
            class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition-all resize-none placeholder:text-gray-300"
          ></textarea>
        </div>

        <!-- 第一行：分类与状态 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">分类</label>
            <select 
              v-model="form.category" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] cursor-pointer"
            >
              <option value="work">工作 (Work)</option>
              <option value="life">生活 (Life)</option>
              <option value="study">学习 (Study)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">状态</label>
            <select 
              v-model="form.status" 
              :disabled="!isEditMode"
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer"
            >
              <option value="pending">待办 (Backlog)</option>
              <option value="in_progress">进行中 (In Progress)</option>
              <option value="completed">已完成 (Done)</option>
            </select>
          </div>
        </div>

        <!-- 第二行：优先级与截止日期 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">优先级</label>
            <select 
              v-model.number="form.priority" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] cursor-pointer"
            >
              <option :value="0">无优先级</option>
              <option :value="1">低 (P1 - Low)</option>
              <option :value="2">中 (P2 - Medium)</option>
              <option :value="3">高 (P3 - High)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-[#67657F] uppercase tracking-wider mb-1.5">截止日期</label>
            <input 
              v-model="form.due_date" 
              type="date" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] cursor-pointer" 
            />
          </div>
        </div>

        <!-- 选项：可见性 -->
        <div class="pt-2">
          <label class="flex items-center cursor-pointer group">
            <div class="relative">
              <input 
                v-model="form.is_public" 
                type="checkbox" 
                class="sr-only"
              >
              <div :class="['w-10 h-5 rounded-full transition-colors', form.is_public ? 'bg-[#5E6AD2]' : 'bg-gray-200']"></div>
              <div :class="['absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform', form.is_public ? 'translate-x-5' : '']"></div>
            </div>
            <span class="ml-3 text-sm text-[#67657F] group-hover:text-[#1D1D20] transition-colors">
              公开此计划 (所有人可见)
            </span>
          </label>
        </div>

        <!-- 底部按钮 -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#E6E7E8] mt-6">
          <button 
            type="button" 
            @click="handleClose" 
            class="px-4 py-2 text-sm font-medium text-[#67657F] bg-white border border-[#E6E7E8] rounded-md hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="px-4 py-2 text-sm font-medium text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] shadow-sm shadow-blue-200 transition-all flex items-center gap-2"
          >
            <span>{{ isEditMode ? '保存更改' : '创建计划' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import api from '../api';
import type { Plan } from '../types';

const props = defineProps<{
  isOpen: boolean;
  editData?: Plan | null;
}>();

const emit = defineEmits(['close', 'saved']);

// 初始表单状态
const getInitialForm = () => ({
  title: '',
  description: '',
  category: 'work',
  status: 'pending',
  priority: 0,
  due_date: '',
  is_public: true,
});

const form = ref(getInitialForm());

const isEditMode = computed(() => !!props.editData);

// 监听编辑数据的变化，填充表单
watch(() => props.editData, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      // 这里的处理是为了适配 HTML5 date input 的格式 (YYYY-MM-DD)
      due_date: newVal.due_date ? newVal.due_date.split('T')[0] : '',
      description: newVal.description || '',
    };
  } else {
    form.value = getInitialForm();
  }
}, { immediate: true });

const handleClose = () => {
  form.value = getInitialForm();
  emit('close');
};

const handleSubmit = async () => {
  if (!form.value.title.trim()) return;

  try {
    // 构造发送给后端的数据
    const payload = {
      ...form.value,
      // 如果日期不为空，转换为 ISO 字符串 (2025-12-30T00:00:00.000Z)
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      priority: Number(form.value.priority) // 确保是数字
    };

    if (isEditMode.value && props.editData) {
      // 执行更新 (PATCH)
      await api.patch(`/plans/${props.editData.id}`, payload);
    } else {
      // 执行新建 (POST)
      await api.post('/plans', payload);
    }
    
    emit('saved'); 
    handleClose();
  } catch (err: any) {
    console.error('提交失败:', err);
    alert(err.response?.data?.message || '操作失败，请重试');
  }
};
</script>

<style scoped>
/* 隐藏原生 Checkbox 但保留辅助功能 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>