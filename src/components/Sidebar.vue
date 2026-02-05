<!-- src/components/Sidebar.vue -->
<template>
  <aside class="h-screen bg-[#FAFAFC] border-r border-[#E6E7E8] flex flex-col shrink-0 select-none shadow-2xl lg:shadow-none overflow-hidden">
    
    <!-- 用户信息区域 -->
    <div class="relative px-3 py-4 mb-2 user-menu-container whitespace-nowrap">
      <div 
        @click="isMenuOpen = !isMenuOpen"
        class="flex items-center gap-2 px-2 py-1.5 hover:bg-[#F0F1F2] rounded-md cursor-pointer transition-colors group"
        :class="{ 'bg-[#F0F1F2]': isMenuOpen }"
      >
        <div class="w-5 h-5 bg-[#5E6AD2] rounded text-[10px] font-bold text-white flex items-center justify-center shrink-0 shadow-sm">
          {{ username ? username.charAt(0).toUpperCase() : 'U' }}
        </div>
        <span class="text-sm font-semibold text-[#1D1D20] truncate flex-1">{{ username || 'User' }}</span>
        <svg 
          class="w-3.5 h-3.5 text-[#9593A3] group-hover:text-[#1D1D20] transition-transform duration-200" 
          :class="{ 'rotate-180': isMenuOpen }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      <!-- 用户下拉菜单 -->
      <transition name="menu">
        <div v-if="isMenuOpen" class="absolute left-3 right-3 top-[calc(100%-8px)] mt-1 bg-white border border-[#E6E7E8] rounded-lg shadow-xl z-[60] py-1">
          <div class="px-3 py-2 border-b border-[#F0F0F2] mb-1">
            <p class="text-[10px] font-bold text-[#9593A3] uppercase tracking-wider">Account</p>
            <p class="text-[12px] text-[#1D1D20] font-medium truncate">{{ username }}</p>
          </div>
          <button 
            @click="handleLogout" 
            class="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-medium text-[#67657F] hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            Logout
          </button>
        </div>
      </transition>
    </div>

    <!-- 导航菜单 -->
    <nav class="flex-1 px-3 space-y-0.5 whitespace-nowrap">
      <div 
        @click="$emit('changeTab', 'projects')"
        class="flex items-center gap-2.5 px-2 py-1.5 text-[13px] font-medium rounded-md cursor-pointer transition-all"
        :class="activeTab === 'projects' ? 'bg-[#EBECEF] text-[#1D1D20]' : 'text-[#67657F] hover:bg-[#F0F1F2] hover:text-[#1D1D20]'"
      >
        <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Projects</span>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
defineProps<{ username: string; activeTab: string; }>();
const emit = defineEmits(['logout', 'changeTab']);
const isMenuOpen = ref(false);
const handleLogout = () => { isMenuOpen.value = false; emit('logout'); };
const closeMenu = (e: MouseEvent) => { if (!(e.target as HTMLElement).closest('.user-menu-container')) isMenuOpen.value = false; };
onMounted(() => window.addEventListener('click', closeMenu));
onUnmounted(() => window.removeEventListener('click', closeMenu));
</script>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: all 0.1s ease-out; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-4px); }
</style>