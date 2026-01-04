<!-- src/components/ConfirmModal.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <!-- 遮罩 -->
    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" @click="$emit('cancel')"></div>
    
    <!-- 内容框 -->
    <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-[#E6E7E8] animate-in fade-in zoom-in duration-200">
      <div class="p-6">
        <div class="flex items-center gap-3 mb-3 text-red-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-[15px] font-bold text-[#1D1D20]">{{ title }}</h3>
        </div>
        
        <p class="text-sm text-[#67657F] leading-relaxed">
          {{ message }}
        </p>

        <div class="flex justify-end gap-3 mt-6">
          <button 
            type="button"
            @click="$emit('cancel')" 
            class="px-4 py-1.5 text-xs font-bold text-[#67657F] bg-white border border-[#E6E7E8] rounded-md hover:bg-gray-50 transition-all"
          >
            取消
          </button>
          <button 
            type="button"
            @click="$emit('confirm')" 
            class="px-4 py-1.5 text-xs font-bold text-white bg-red-500 rounded-md hover:bg-red-600 shadow-sm shadow-red-100 transition-all"
          >
            确认删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isOpen: boolean;
  title: string;
  message: string;
}>();

defineEmits(['confirm', 'cancel']);
</script>