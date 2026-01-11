<!-- src/components/SearchPalette.vue -->
<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4" @keydown="handleKeyDown">
    <div class="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" @click="$emit('close')"></div>

    <div class="relative bg-white w-full max-w-xl rounded-xl shadow-2xl border border-[#E6E7E8] overflow-hidden animate-in fade-in zoom-in duration-200">
      <!-- 搜索输入框 -->
      <div class="flex items-center px-4 border-b border-[#F0F0F2]">
        <div class="shrink-0">
          <span v-if="loading" class="w-5 h-5 border-2 border-[#5E6AD2] border-t-transparent rounded-full animate-spin block"></span>
          <svg v-else class="w-5 h-5 text-[#9593A3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <input 
          ref="inputRef"
          v-model="query"
          type="text" 
          placeholder="搜索项目、任务内容..."
          class="w-full px-3 py-4 text-[15px] outline-none font-medium placeholder:text-[#D1D1D6]"
        />
        <div class="px-1.5 py-0.5 border border-[#E6E7E8] rounded text-[10px] font-bold text-[#9593A3] bg-[#FAFAFC]">ESC</div>
      </div>

      <!-- 搜索结果列表 -->
      <div class="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar bg-[#FAFAFC]/30">
        <div v-if="results.length > 0">
          <div 
            v-for="(item, index) in results" 
            :key="item.type + item.id"
            @mouseenter="selectedIndex = index"
            @click="handleSelect(item)"
            :class="[
              'flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-75',
              selectedIndex === index ? 'bg-[#5E6AD2] text-white shadow-md' : 'hover:bg-[#F0F1F2]'
            ]"
          >
            <!-- 左侧图标 -->
            <div class="shrink-0 flex items-center justify-center w-6">
              <div v-if="item.type === 'project'" 
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: selectedIndex === index ? '#fff' : (item.color || '#5E6AD2') }"
              ></div>
              <div v-else 
                class="w-2 h-2 rounded-full shadow-inner"
                :class="selectedIndex === index ? 'bg-white' : statusPointColor(item.status)"
              ></div>
            </div>

            <!-- 文字内容 -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-[14px] font-semibold truncate">{{ item.title }}</span>
                <span :class="['text-[9px] px-1.5 py-0.5 border rounded uppercase font-black tracking-tighter', selectedIndex === index ? 'border-white/30 bg-white/20 text-white' : 'border-[#E6E7E8] bg-[#FAFAFC] text-[#9593A3]']">
                  {{ item.type }}
                </span>
              </div>
              <div :class="['text-[11px] truncate font-medium mt-0.5', selectedIndex === index ? 'text-white/70' : 'text-[#9593A3]']">
                {{ item.description || '暂无详细描述' }}
              </div>
            </div>

            <div v-if="selectedIndex === index" class="text-[10px] font-bold opacity-80 pr-2">ENTER</div>
          </div>
        </div>
        
        <!-- 空状态/引导 -->
        <div v-else-if="query && !loading" class="py-12 text-center text-sm text-[#9593A3]">
          未找到与 "{{ query }}" 相关的结果
        </div>
        <div v-else-if="!query" class="py-12 text-center">
          <p class="text-xs font-bold text-[#9593A3] uppercase tracking-[0.2em] mb-2">Global Search</p>
          <p class="text-sm text-[#D1D1D6]">输入关键词搜索您的工作空间...</p>
        </div>
      </div>

      <!-- 底部帮助栏 -->
      <div class="px-4 py-2.5 bg-[#FAFAFC] border-t border-[#F0F0F2] flex items-center gap-5 text-[10px] font-bold text-[#9593A3] uppercase tracking-wider">
        <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 bg-white border border-[#E6E7E8] rounded text-[#67657F]">↑↓</span> 选择</span>
        <span class="flex items-center gap-1.5"><span class="px-1 py-0.5 bg-white border border-[#E6E7E8] rounded text-[#67657F]">Enter</span> 确认</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import api from '../api';

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits(['close', 'select']);

const query = ref('');
const results = ref<any[]>([]);
const loading = ref(false);
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

let debounceTimer: any = null;

// 核心搜索逻辑：调用后端接口
const performSearch = async () => {
  if (!query.value.trim()) {
    results.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await api.get('/search', { params: { q: query.value } });
    // 接口返回的数据结构已经由后端对齐
    results.value = res.data;
    selectedIndex.value = 0;
  } catch (err) {
    console.error("搜索失败", err);
  } finally {
    loading.value = false;
  }
};

// 监听输入并执行防抖
watch(query, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    performSearch();
  }, 300); // 300ms 防抖
});

// 键盘导航
const handleKeyDown = (e: KeyboardEvent) => {
  if (results.value.length === 0) return;
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length;
  } else if (e.key === 'Enter') {
    const selected = results.value[selectedIndex.value];
    if (selected) handleSelect(selected);
  }
};

const handleSelect = (item: any) => {
  // 注意：这里的 item 结构现在是后端返回的统一格式
  // 需要将其包装成 App.vue 期望的 { type, data } 格式，或者修改 App.vue 的 handleSearchSelect
  emit('select', { type: item.type, data: item });
  emit('close');
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    query.value = '';
    results.value = [];
    nextTick(() => inputRef.value?.focus());
  }
});

const statusPointColor = (s: string) => {
  switch (s) {
    case 'done': return 'bg-emerald-500';
    case 'in_progress': return 'bg-amber-500';
    default: return 'bg-gray-400';
  }
};
</script>