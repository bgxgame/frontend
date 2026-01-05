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
          placeholder="搜索项目、任务或输入指令..."
          class="w-full px-3 py-4 text-[15px] outline-none placeholder:text-[#D1D1D6] font-medium"
          @keydown.esc="$emit('close')"
        />
        <div class="px-1.5 py-0.5 border border-[#E6E7E8] rounded text-[10px] font-bold text-[#9593A3] bg-[#FAFAFC]">ESC</div>
      </div>

      <!-- 搜索结果列表 -->
      <div class="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
        <div v-if="filteredItems.length > 0">
          <div 
            v-for="item in filteredItems" 
            :key="item.type + item.data.id"
            @click="handleSelect(item)"
            class="flex items-center gap-3 px-3 py-2.5 hover:bg-[#F0F1F2] rounded-lg cursor-pointer group transition-all"
          >
            <!-- 左侧图标展示 -->
            <div class="shrink-0 flex items-center justify-center w-6">
              <!-- 项目：实心圆点 -->
              <div v-if="item.type === 'project'" 
                class="w-2.5 h-2.5 rounded-full shadow-sm"
                :style="{ backgroundColor: item.data.color || '#5E6AD2' }"
              ></div>
              <!-- 任务：状态色小圆点 -->
              <div v-else 
                class="w-2 h-2 rounded-full shadow-inner"
                :class="statusPointColor(item.data.status)"
              ></div>
            </div>

            <!-- 文字内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[14px] font-semibold text-[#1D1D20] truncate">
                  {{ item.type === 'project' ? item.data.name : item.data.title }}
                </span>
                <!-- 类型标签 -->
                <span class="text-[9px] px-1.5 py-0.5 border border-[#E6E7E8] rounded bg-[#FAFAFC] text-[#9593A3] uppercase font-black tracking-tighter">
                  {{ item.type }}
                </span>
              </div>
              <div class="text-[11px] text-[#9593A3] mt-0.5 truncate font-medium uppercase tracking-tight">
                {{ item.type === 'project' ? 'Workspace Project' : 'Issue in project' }}
              </div>
            </div>

            <div class="text-[10px] font-bold text-[#5E6AD2] opacity-0 group-hover:opacity-100 transition-opacity pr-2">
              OPEN
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="query" class="py-12 text-center">
          <p class="text-sm text-[#9593A3] font-medium">未找到匹配的 "{{ query }}"</p>
        </div>
        <div v-else class="py-8 px-4 text-center">
          <div class="text-[11px] font-bold text-[#9593A3] uppercase tracking-[0.2em] mb-2">最近记录与建议</div>
          <p class="text-sm text-[#D1D1D6]">开始输入以搜索您的工作空间...</p>
        </div>
      </div>

      <!-- 底部操作提示 -->
      <div class="px-4 py-2.5 bg-[#FAFAFC] border-t border-[#F0F0F2] flex items-center gap-5 text-[10px] font-bold text-[#9593A3] uppercase tracking-wider">
        <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 bg-white border border-[#E6E7E8] rounded text-[#67657F]">↑↓</span> Navigate</span>
        <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 bg-white border border-[#E6E7E8] rounded text-[#67657F]">Enter</span> Select</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';

// 接收来自 App.vue 的混合 SearchItem
const props = defineProps<{
  isOpen: boolean;
  items: any[]; 
}>();

const emit = defineEmits(['close', 'select']);

const query = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// 核心搜索逻辑：跨类型匹配
const filteredItems = computed(() => {
  if (!query.value.trim()) return [];
  const s = query.value.toLowerCase();
  
  return props.items.filter(item => {
    // 项目搜 name，任务搜 title
    const matchText = item.type === 'project' ? item.data.name : item.data.title;
    return matchText.toLowerCase().includes(s);
  }).slice(0, 10);
});

// 自动聚焦
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = '';
    nextTick(() => inputRef.value?.focus());
  }
});

const handleSelect = (item: any) => {
  emit('select', item);
  emit('close');
};

const statusPointColor = (s: string) => {
  switch (s) {
    case 'done': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    default: return 'bg-gray-400';
  }
};
</script>

<style scoped>
.animate-in { animation-duration: 0.15s; }
@keyframes zoom-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
.zoom-in { animation-name: zoom-in; }

/* 隐藏结果列表的粗糙滚动条 */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E6E7E8; border-radius: 10px; }
</style>