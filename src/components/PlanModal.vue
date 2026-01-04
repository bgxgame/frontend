<!-- src/components/PlanModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="$emit('close')"></div>
    
    <div class="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto border border-[#E6E7E8]">
      <h2 class="text-lg font-semibold mb-4 text-[#1D1D20]">
        {{ isEditMode ? '编辑计划' : '新建计划' }}
      </h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 标题 -->
        <div>
          <label class="block text-sm font-medium text-[#67657F] mb-1">标题</label>
          <input 
            v-model="form.title" 
            type="text" 
            required 
            class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition" 
          />
        </div>

        <!-- 描述 -->
        <div>
          <label class="block text-sm font-medium text-[#67657F] mb-1">描述</label>
          <textarea 
            v-model="form.description" 
            rows="3" 
            class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2] outline-none transition"
          ></textarea>
        </div>

        <!-- 分类与状态 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#67657F] mb-1">分类</label>
            <select 
              v-model="form.category" 
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md outline-none bg-white focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2]"
            >
              <option value="work">工作</option>
              <option value="life">生活</option>
              <option value="study">学习</option>
            </select>
          </div>
          <div v-if="isEditMode">
            <label class="block text-sm font-medium text-[#67657F] mb-1">状态</label>
            <select 
              v-model="form.status" 
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md outline-none bg-white focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2]"
            >
              <option value="pending">待办</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <!-- 日期与可见性 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-[#67657F] mb-1">截止日期</label>
            <input 
              v-model="form.due_date" 
              type="date" 
              class="w-full px-3 py-2 border border-[#E6E7E8] rounded-md outline-none focus:ring-1 focus:ring-[#5E6AD2] focus:border-[#5E6AD2]" 
            />
          </div>
          <div class="flex items-center mt-6">
            <input 
              v-model="form.is_public" 
              type="checkbox" 
              id="public" 
              class="w-4 h-4 text-[#5E6AD2] rounded border-[#E6E7E8] focus:ring-[#5E6AD2]"
            >
            <label for="public" class="ml-2 text-sm text-[#67657F]">公开可见</label>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="flex justify-end gap-2 pt-4 border-t border-[#E6E7E8] mt-2">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-3 py-1.5 rounded-md font-medium transition-all duration-200 border border-transparent bg-transparent border border-[#E6E7E8] text-[#67657F] hover:bg-white"
          >
            取消
          </button>
          <button 
            type="submit" 
            class="px-3 py-1.5 rounded-md font-medium transition-all duration-200 border border-transparent bg-[#5E6AD2] text-white hover:bg-[#525BC2]"
          >
            {{ isEditMode ? '保存修改' : '立即创建' }}
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
  editData?: Plan | null; // 如果有值，就是编辑模式
}>();

const emit = defineEmits(['close', 'saved']);

// 初始表单数据
const initialForm = {
  title: '',
  description: '',
  category: 'life',
  status: 'pending',
  due_date: '',
  is_public: true,
};

const form = ref({ ...initialForm });

// 判断是否是编辑模式
const isEditMode = computed(() => !!props.editData);

// 当打开窗口或 editData 变化时，重置表单
watch(() => props.editData, (newVal) => {
  if (newVal) {
    // 编辑模式：填充数据
    form.value = {
      ...newVal,
      // 格式化日期以适配 input type="date"
      due_date: newVal.due_date ? newVal.due_date.split('T')[0] : '',
    };
  } else {
    // 新建模式：清空
    form.value = { ...initialForm };
  }
}, { immediate: true });

const handleSubmit = async () => {
  try {
    // 构造发送给后端的数据 (处理日期格式)
    const payload = {
      ...form.value,
      due_date: form.value.due_date ? new Date(form.value.due_date).toISOString() : null,
    };

    if (isEditMode.value && props.editData) {
      // 编辑：PATCH
      await api.patch(`/plans/${props.editData.id}`, payload);
    } else {
      // 新建：POST
      await api.post('/plans', payload);
    }
    
    emit('saved'); // 通知父组件刷新列表
    emit('close');
  } catch (err) {
    alert('操作失败');
    console.error(err);
  }
};
</script>