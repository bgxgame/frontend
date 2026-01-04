<!-- src/components/PlanModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- 背景遮罩 -->
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      @click="handleClose"
    ></div>
    
    <!-- 弹窗主体 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E6E7E8] flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
      
      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-[#E6E7E8] flex justify-between items-center bg-[#FAFAFC]">
        <h2 class="text-[15px] font-bold text-[#1D1D20] flex items-center gap-2">
          <span v-if="isEditMode" class="w-2 h-2 rounded-full bg-[#5E6AD2]"></span>
          {{ isEditMode ? '编辑计划' : '新建计划' }}
        </h2>
        <button @click="handleClose" class="text-[#9593A3] hover:text-[#1D1D20] transition-colors p-1 hover:bg-gray-100 rounded">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- 表单内容 -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
        
        <!-- 通用错误提示信息 -->
        <div v-if="generalError" class="p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-600 text-sm animate-shake">
          <svg class="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
          <span>{{ generalError }}</span>
        </div>

        <!-- 标题 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            placeholder="任务标题..."
            :class="[
              'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all placeholder:text-gray-300 text-sm',
              fieldErrors.title ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
            ]" 
          />
          <p v-if="fieldErrors.title" class="text-[11px] text-red-500 mt-1 font-medium">{{ fieldErrors.title[0] }}</p>
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">详细描述</label>
          <textarea 
            v-model="form.description" 
            rows="3" 
            placeholder="添加详细说明（可选）..."
            :class="[
              'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all resize-none placeholder:text-gray-300 text-sm',
              fieldErrors.description ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
            ]"
          ></textarea>
          <p v-if="fieldErrors.description" class="text-[11px] text-red-500 mt-1 font-medium">{{ fieldErrors.description[0] }}</p>
        </div>

        <!-- 分类与状态 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">分类</label>
            <select 
              v-model="form.category" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:border-[#5E6AD2] text-sm cursor-pointer"
            >
              <option value="work">工作 (Work)</option>
              <option value="life">生活 (Life)</option>
              <option value="study">学习 (Study)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">状态</label>
            <select 
              v-model="form.status" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:border-[#5E6AD2] text-sm disabled:bg-gray-50 disabled:text-gray-400 cursor-pointer"
            >
              <option value="pending">待办 (Backlog)</option>
              <option value="in_progress">进行中 (In Progress)</option>
              <option value="completed">已完成 (Done)</option>
            </select>
          </div>
        </div>

        <!-- 优先级与截止日期 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">优先级</label>
            <select 
              v-model.number="form.priority" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:border-[#5E6AD2] text-sm cursor-pointer"
            >
              <option :value="0">无优先级</option>
              <option :value="1">P1 - 低 (Low)</option>
              <option :value="2">P2 - 中 (Medium)</option>
              <option :value="3">P3 - 高 (High)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">截止日期</label>
            <input 
              v-model="form.due_date" 
              type="date" 
              class="w-full px-3 py-2 bg-white border border-[#E6E7E8] rounded-md outline-none focus:border-[#5E6AD2] text-sm cursor-pointer" 
            />
          </div>
        </div>

        <!-- 公开性开关 -->
        <div class="flex items-center justify-between py-2 border-t border-[#F0F0F2]">
          <div class="flex flex-col">
            <span class="text-sm font-medium text-[#1D1D20]">公开此计划</span>
            <span class="text-[11px] text-[#9593A3]">启用后，其他访客也能看到此计划</span>
          </div>
          <button 
            type="button"
            @click="form.is_public = !form.is_public"
            :class="['relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 outline-none', form.is_public ? 'bg-[#5E6AD2]' : 'bg-gray-200']"
          >
            <span :class="['pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out', form.is_public ? 'translate-x-5' : 'translate-x-0']"></span>
          </button>
        </div>

        <!-- 底部操作按钮 -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#E6E7E8] mt-4">
          <button 
            type="button" 
            @click="handleClose" 
            class="px-4 py-1.5 text-sm font-medium text-[#67657F] bg-white border border-[#E6E7E8] rounded-md hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            type="submit" 
            :disabled="loading"
            class="px-4 py-1.5 text-sm font-medium text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span v-if="loading" class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isEditMode ? '保存更改' : '创建计划' }}
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

const loading = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});
const generalError = ref('');

// 默认空表单
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

// 监听 editData 填充表单
watch(() => props.editData, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      due_date: newVal.due_date ? newVal.due_date.split('T')[0] : '',
      description: newVal.description || '',
    };
  } else {
    form.value = getInitialForm();
  }
  // 重置错误
  fieldErrors.value = {};
  generalError.value = '';
}, { immediate: true });


const handleSubmit = async () => {
  if (!form.value.title.trim()) {
    fieldErrors.value = { title: ['标题是必填项'] };
    return;
  }

  loading.value = true;
  fieldErrors.value = {};
  generalError.value = '';

  try {
    const payload = {
      ...form.value,
      // 日期处理：转为后端接受的 ISOString 格式
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      priority: Number(form.value.priority)
    };

    if (isEditMode.value && props.editData) {
      await api.patch(`/plans/${props.editData.id}`, payload);
    } else {
      await api.post('/plans', payload);
    }
    
    emit('saved'); 
    emit('close'); // 显式触发关闭

    // 重置表单，防止下次打开还有旧数据
    form.value = getInitialForm(); 
  } catch (err: any) {
    const errorData = err.response?.data;
    
    if (errorData) {
      // 处理后端返回的结构化错误 (来自 AppError::ValidationError)
      if (errorData.errors) {
        fieldErrors.value = errorData.errors;
      }
      generalError.value = errorData.message || '操作失败';
    } else {
      generalError.value = '无法连接到服务器，请检查网络设置';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}

/* 简单的进入动画 */
.animate-in {
  animation: animate-in 0.2s ease-out;
}
@keyframes animate-in {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>