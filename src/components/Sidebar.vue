<!-- src/components/Sidebar.vue (精简版) -->
<template>
  <aside class="w-60 h-screen bg-[#FAFAFC] border-r border-[#E6E7E8] flex flex-col shrink-0 select-none">
    <!-- 1. 用户区域 -->
    <div class="p-3 mb-2">
      <div class="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md cursor-pointer transition-colors group">
        <div class="w-5 h-5 bg-[#5E6AD2] rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200">
          {{ username ? username.charAt(0).toUpperCase() : 'U' }}
        </div>
        <span class="text-sm font-semibold text-[#1D1D20] truncate flex-1">{{ username || 'User' }}</span>
        <svg class="w-3.5 h-3.5 text-[#9593A3] group-hover:text-[#1D1D20] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- 2. 导航菜单：删除了 Search 选项 -->
    <nav class="flex-1 px-3 space-y-0.5">
      <!-- My Issues -->
      <div 
        @click="$emit('changeTab', 'issues')"
        class="flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-medium rounded-md cursor-pointer transition-all"
        :class="activeTab === 'issues' ? 'bg-[#EBECEF] text-[#1D1D20]' : 'text-[#67657F] hover:bg-[#F0F1F2] hover:text-[#1D1D20]'"
      >
        <svg class="w-4 h-4" :class="activeTab === 'issues' ? 'text-[#5E6AD2]' : 'text-[#67657F]'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        My Issues
      </div>

      <!-- Projects -->
      <div 
        @click="$emit('changeTab', 'projects')"
        class="flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-medium rounded-md cursor-pointer transition-all"
        :class="activeTab === 'projects' ? 'bg-[#EBECEF] text-[#1D1D20]' : 'text-[#67657F] hover:bg-[#F0F1F2] hover:text-[#1D1D20]'"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        Projects
      </div>
    </nav>

    <!-- 3. 底部操作区 -->
    <div class="p-3 border-t border-[#F0F0F2] space-y-1">
      <button @click="$emit('openCreate')" class="w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-bold text-[#5E6AD2] hover:bg-[#F0F1F2] rounded-md transition-all active:scale-[0.98]">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
        </svg>
        New Plan
      </button>
      
      <button @click="$emit('logout')" class="w-full flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-medium text-[#9593A3] hover:text-red-500 hover:bg-red-50 rounded-md transition-all">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ username: string; activeTab: string; }>();
defineEmits(['logout', 'openCreate', 'changeTab']);
</script>