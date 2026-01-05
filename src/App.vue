<!-- src/App.vue -->
<template>
  <div class="antialiased text-[#1D1D20] font-sans">
    <!-- 1. 未登录状态 -->
    <div v-if="!isLoggedIn" class="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-4">
      <AuthPage @login-success="handleLoginSuccess" />
    </div>

    <!-- 2. 已登录状态 -->
    <div v-else class="flex h-screen w-full bg-white overflow-hidden">
      
      <Sidebar 
        :username="username" 
        :activeTab="activeTab"
        @logout="logout"
        @openCreate="openCreateModal"
        @changeTab="handleTabChange"
      />

      <div class="flex-1 flex flex-col min-w-0 bg-white">
        <!-- 顶部状态栏：删除了右侧快捷键提示 -->
        <header class="h-12 border-b border-[#F0F0F2] flex items-center px-6 shrink-0">
          <div class="flex items-center gap-2 text-[13px]">
            <span class="text-[#9593A3] font-medium">Workspace</span>
            <span class="text-[#D1D1D6]">/</span>
            <span class="font-semibold text-[#1D1D20] capitalize">{{ activeTab }}</span>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
          <div class="max-w-[1400px] mx-auto p-8">
            <div v-if="activeTab === 'issues'">
              <PlanList ref="planListRef" @edit="openEditModal" />
            </div>

            <div v-else class="flex flex-col items-center justify-center py-40 animate-in fade-in slide-in-from-bottom-4">
              <div class="w-16 h-16 bg-[#FAFAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#F0F0F2]">
                <svg class="w-8 h-8 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 class="text-lg font-bold text-[#1D1D20]">{{ activeTab.toUpperCase() }} 视图建设中</h2>
              <button @click="activeTab = 'issues'" class="mt-6 text-sm font-bold text-[#5E6AD2] hover:underline">返回我的计划</button>
            </div>
          </div>
        </main>
      </div>

      <!-- 搜索面板：仅通过快捷键唤起 -->
      <SearchPalette 
        :isOpen="showSearch" 
        :plans="allPlansForSearch"
        @close="showSearch = false"
        @select="handleSearchSelect"
      />

      <PlanModal 
        :isOpen="showPlanModal" 
        :editData="currentEditPlan" 
        @close="closePlanModal" 
        @saved="handlePlanSaved" 
      />
      
      <ToastContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Sidebar from './components/Sidebar.vue';
import AuthPage from './components/AuthPage.vue';
import PlanList from './components/PlanList.vue';
import PlanModal from './components/PlanModal.vue';
import SearchPalette from './components/SearchPalette.vue';
import ToastContainer from './components/ToastContainer.vue';
import api from './api';
import type { Plan } from './types';

const isLoggedIn = ref(!!localStorage.getItem('token'));
const username = ref(localStorage.getItem('username') || '');
const activeTab = ref('issues');

// 快捷键双击判断
let lastTabPressTime = 0;

const showPlanModal = ref(false);
const showSearch = ref(false);
const currentEditPlan = ref<Plan | null>(null);
const allPlansForSearch = ref<Plan[]>([]);
const planListRef = ref();

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  username.value = localStorage.getItem('username') || 'Admin';
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  isLoggedIn.value = false;
};

const handleTabChange = (tab: string) => { activeTab.value = tab; };

const openCreateModal = () => {
  currentEditPlan.value = null; 
  showPlanModal.value = true;
};

const openEditModal = (plan: Plan) => {
  currentEditPlan.value = plan;
  showPlanModal.value = true;
};

const closePlanModal = () => {
  showPlanModal.value = false;
  setTimeout(() => { currentEditPlan.value = null; }, 200);
};

const handlePlanSaved = () => {
  if (planListRef.value) planListRef.value.fetchPlans();
  closePlanModal();
};

const fetchAllPlansForSearch = async () => {
  if (!isLoggedIn.value) return;
  try {
    const res = await api.get<Plan[]>('/plans');
    allPlansForSearch.value = res.data;
  } catch (err) { console.error("加载搜索数据失败"); }
};

const handleSearchSelect = (plan: Plan) => { openEditModal(plan); };

// 快捷键逻辑：按两下 Tab 唤起
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const currentTime = Date.now();
    const timeDiff = currentTime - lastTabPressTime;

    if (timeDiff > 0 && timeDiff < 300) {
      e.preventDefault();
      showSearch.value = !showSearch.value;
      lastTabPressTime = 0;
    } else {
      lastTabPressTime = currentTime;
    }
  }
  // 备选 Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showSearch.value = !showSearch.value;
  }
};

watch(showSearch, (open) => { if (open) fetchAllPlansForSearch(); });

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  if (isLoggedIn.value) username.value = localStorage.getItem('username') || 'Admin';
});

onUnmounted(() => { window.removeEventListener('keydown', handleKeyDown); });
</script>

<style>
body { margin: 0; overflow: hidden; }
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #E6E7E8; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }

.animate-in { animation-duration: 0.3s; animation-fill-mode: both; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
.fade-in { animation-name: fade-in; }
@keyframes slide-in-bottom { from { transform: translateY(10px); } to { transform: translateY(0); } }
.slide-in-from-bottom-4 { animation-name: slide-in-bottom; }
</style>