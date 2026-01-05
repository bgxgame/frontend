<!-- src/components/SearchPalette.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
    <!-- 遮罩层 -->
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" @click="$emit('close')"></div>

    <!-- 面板主体 -->
    <div class="relative bg-white w-full max-w-xl rounded-xl shadow-2xl border border-[#E6E7E8] overflow-hidden animate-in fade-in zoom-in duration-200">
      <!-- 输入框区域 -->
      <div class="flex items-center px-4 border-b border-[#F0F0F2]">
        <svg class="w-5 h-5 text-[#9593A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          ref="inputRef"
          v-model="query"
          type="text" 
          placeholder="搜索计划或输入指令..."
          class="w-full px-3 py-4 text-[15px] outline-none placeholder:text-[#D1D1D6]"
          @keydown.esc="$emit('close')"
        />
        <div class="px-1.5 py-0.5 border border-[#E6E7E8] rounded text-[10px] font-bold text-[#9593A3] bg-[#FAFAFC]">ESC</div>
      </div>

      <!-- 搜索结果列表 -->
      <div class="max-h-[60vh] overflow-y-auto p-2">
        <div v-if="filteredPlans.length > 0">
          <div 
            v-for="plan in filteredPlans" 
            :key="plan.id"
            @click="handleSelect(plan)"
            class="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F1F2] rounded-lg cursor-pointer group transition-colors"
          >
            <div :class="['w-2 h-2 rounded-full', statusColor(plan.status)]"></div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-[#1D1D20] truncate">{{ plan.title }}</div>
              <div class="text-[11px] text-[#9593A3] mt-0.5 uppercase tracking-tight">{{ plan.category }}</div>
            </div>
            <div class="text-[10px] text-[#D1D1D6] opacity-0 group-hover:opacity-100 transition-opacity">跳转至</div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="query" class="py-12 text-center">
          <p class="text-sm text-[#9593A3]">未找到相关计划</p>
        </div>
        <div v-else class="py-4 px-3">
          <span class="text-[11px] font-bold text-[#9593A3] uppercase tracking-widest">最近建议</span>
          <div class="mt-2 text-sm text-[#67657F]">输入关键词开始搜索...</div>
        </div>
      </div>

      <!-- 底部提示 -->
      <div class="px-4 py-2 bg-[#FAFAFC] border-t border-[#F0F0F2] flex items-center gap-4 text-[11px] text-[#9593A3]">
        <span class="flex items-center gap-1"><span class="font-bold text-[#67657F]">↑↓</span> 选择</span>
        <span class="flex items-center gap-1"><span class="font-bold text-[#67657F]">Enter</span> 确认</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import type { Plan } from '../types';

const props = defineProps<{
  isOpen: boolean;
  plans: Plan[];
}>();

const emit = defineEmits(['close', 'select']);

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// 过滤逻辑
const filteredPlans = computed(() => {
  if (!query.value) return [];
  return props.plans.filter(p => 
    p.title.toLowerCase().includes(query.value.toLowerCase())
  ).slice(0, 8); // 最多显示8条
});

// 自动聚焦
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = '';
    nextTick(() => inputRef.value?.focus());
  }
});

const handleSelect = (plan: Plan) => {
  emit('select', plan);
  emit('close');
};

const statusColor = (s: string) => s === 'completed' ? 'bg-emerald-500' : s === 'in_progress' ? 'bg-amber-500' : 'bg-gray-300';
</script>