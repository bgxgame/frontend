<!-- src/components/PlanModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="handleClose"></div>

    <div
      class="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E6E7E8] flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">

      <!-- 头部 -->
      <div class="px-6 py-4 border-b border-[#E6E7E8] flex justify-between items-center bg-[#FAFAFC]">
        <h2 class="text-[15px] font-bold text-[#1D1D20] flex items-center gap-2">
          <span v-if="isEditMode" class="w-2 h-2 rounded-full bg-[#5E6AD2]"></span>
          {{ isEditMode ? '编辑计划' : '新建计划' }}
        </h2>
        <!-- 修复：显式增加 type="button" 防止提交 -->
        <button type="button" @click="handleClose"
          class="text-[#9593A3] hover:text-[#1D1D20] transition-colors p-1 hover:bg-gray-100 rounded">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-5 overflow-y-auto">
        <div v-if="generalError"
          class="p-3 bg-red-50 border border-red-100 rounded-md flex items-start gap-2 text-red-600 text-sm animate-shake">
          <span>{{ generalError }}</span>
        </div>

        <!-- 标题 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">标题</label>
          <input v-model="form.title" type="text" placeholder="任务标题..." :class="[
            'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all text-sm',
            fieldErrors.title ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
          ]" />
          <p v-if="fieldErrors.title" class="text-[11px] text-red-500 mt-1 font-medium">{{ fieldErrors.title[0] }}</p>
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">详细描述</label>
          <textarea v-model="form.description" rows="4" placeholder="描述一下你的计划..." :class="[
            'w-full px-3 py-2 bg-white border rounded-md outline-none transition-all resize-none text-sm',
            fieldErrors.description ? 'border-red-500 ring-1 ring-red-100' : 'border-[#E6E7E8] focus:border-[#5E6AD2] focus:ring-4 focus:ring-[#5E6AD2]/10'
          ]"></textarea>
          <!-- 修复点：增加显示描述错误的提示 -->
          <p v-if="fieldErrors.description"
            class="text-[11px] text-red-500 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
            {{ fieldErrors.description[0] }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">分类</label>
            <select v-model="form.category"
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white">
              <option value="work">工作 (Work)</option>
              <option value="life">生活 (Life)</option>
              <option value="study">学习 (Study)</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">状态</label>
            <select v-model="form.status"
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white">
              <option value="pending">待办 (Backlog)</option>
              <option value="in_progress">进行中 (Started)</option>
              <option value="completed">已完成 (Done)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">优先级</label>
            <select v-model.number="form.priority"
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white">
              <option :value="0">无优先级</option>
              <option :value="1">P1 - 低</option>
              <option :value="2">P2 - 中</option>
              <option :value="3">P3 - 高</option>
            </select>
          </div>
          <div>
            <label class="block text-[11px] font-bold text-[#67657F] uppercase tracking-wider mb-1.5">截止日期</label>
            <input v-model="form.due_date" type="date"
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md text-sm outline-none bg-white" />
          </div>
        </div>

        <!-- 公开性 -->
        <div class="flex items-center justify-between py-2 border-t border-[#F0F0F2]">
          <span class="text-sm font-medium text-[#1D1D20]">公开此计划</span>
          <button type="button" @click="form.is_public = !form.is_public"
            :class="['relative inline-flex h-5 w-10 shrink-0 rounded-full transition-colors', form.is_public ? 'bg-[#5E6AD2]' : 'bg-gray-200']">
            <span
              :class="['inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 mt-0.5 ml-0.5', form.is_public ? 'translate-x-5' : 'translate-x-0']"></span>
          </button>
        </div>

        <!-- 底部 -->
        <div class="flex justify-end gap-3 pt-4 border-t border-[#E6E7E8] mt-4">
          <button type="button" @click="handleClose"
            class="px-4 py-1.5 text-sm font-medium text-[#67657F] bg-white border border-[#E6E7E8] rounded-md hover:bg-gray-50 transition-all">
            取消
          </button>
          <button type="submit" :disabled="loading"
            class="px-4 py-1.5 text-sm font-medium text-white bg-[#5E6AD2] rounded-md hover:bg-[#525BC2] transition-all flex items-center gap-2">
            <span v-if="loading"
              class="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
import { toastStore } from '../toast';

const props = defineProps<{
  isOpen: boolean;
  editData?: Plan | null;
}>();

const emit = defineEmits(['close', 'saved']);

const loading = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});
const generalError = ref('');

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

// 监听数据变化：如果有数据则填充，没数据则清空
watch(() => props.editData, (newVal) => {
  if (newVal) {
    form.value = {
      ...newVal,
      due_date: newVal.due_date ? (newVal.due_date as string).split('T')[0] : '',
      description: newVal.description || '',
    };
  } else {
    form.value = getInitialForm();
  }
  fieldErrors.value = {};
  generalError.value = '';
}, { immediate: true });

// 统一的关闭内部函数
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
    const payload = {
      ...form.value,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
      priority: Number(form.value.priority)
    };

    if (isEditMode.value && props.editData) {
      await api.patch(`/plans/${props.editData.id}`, payload);
      toastStore.show('计划更新成功'); // 替换 alert
    } else {
      await api.post('/plans', payload);
      toastStore.show('新计划已创建'); // 替换 alert
    }

    emit('saved'); // 通知父组件：保存成功
  }  catch (err: any) {
    const errorData = err.response?.data;
    if (errorData) {
      // 1. 设置字段级别的红框提示
      if (errorData.errors) {
        fieldErrors.value = errorData.errors; 
      }
      
      // 2. 设置通用的文字提示（虽然拦截器弹了 Toast，但表单顶部留一个提示更好看）
      // 如果有具体错误，我们就显示具体的第一个，否则显示通用的
      if (errorData.errors) {
        const firstKey = Object.keys(errorData.errors)[0];
        generalError.value = errorData.errors[firstKey][0];
      } else {
        generalError.value = errorData.message || '操作失败';
      }
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-4px);
  }

  75% {
    transform: translateX(4px);
  }
}

.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}

.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>