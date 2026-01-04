<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-[#FAFAFC] font-sans text-[#1D1D20]">
    <!-- 顶部导航 -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-[#E6E7E8]">
      <div class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-14 items-center">
          <div class="flex items-center">
            <p class="text-xl font-bold text-[#5E6AD2] tracking-tight">LifePlan</p>
          </div>
          <div class="flex items-center space-x-3">
            <div v-if="isLoggedIn" class="flex items-center gap-3">
              <span class="text-sm font-medium text-[#67657F]">Admin</span>
              <button @click="openCreateModal" class="px-3 py-1.5 rounded-md font-medium transition-all duration-200 border border-transparent bg-[#5E6AD2] text-white hover:bg-[#525BC2]">
                + 新建
              </button>
              <button @click="logout" class="text-sm text-[#67657F] hover:text-red-500 transition">
                退出
              </button>
            </div>
            <button v-else @click="showLoginModal = true" class="text-sm font-medium text-[#5E6AD2] hover:text-[#525BC2]">
              登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PlanList ref="planListRef" @edit="openEditModal" />
    </main>

    <!-- 模态框 -->
    <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" @login-success="handleLoginSuccess" />
    
    <PlanModal 
      :isOpen="showPlanModal" 
      :editData="currentEditPlan" 
      @close="showPlanModal = false" 
      @saved="() => { refreshList(); showPlanModal = false; }" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import PlanList from './components/PlanList.vue';
import LoginModal from './components/LoginModal.vue';
import PlanModal from './components/PlanModal.vue';
import type { Plan } from './types';

// 状态
const isLoggedIn = ref(!!localStorage.getItem('token'));
const showLoginModal = ref(false);
const showPlanModal = ref(false);
const currentEditPlan = ref<Plan | null>(null);
const planListRef = ref(); // 用于调用子组件的刷新方法

// 登录成功
const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  refreshList(); // 登录后刷新列表，可能看到隐藏的私有计划
};

// 退出登录
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  isLoggedIn.value = false;
  location.reload();
};

// 打开新建
const openCreateModal = () => {
  currentEditPlan.value = null; // 清空编辑数据
  showPlanModal.value = true;
};

// 打开编辑 (由 PlanList 子组件触发)
const openEditModal = (plan: Plan) => {
  currentEditPlan.value = plan;
  showPlanModal.value = true;
};

// 刷新列表
const refreshList = () => {
  // 调用 PlanList 组件内部暴露的 fetchPlans 方法
  if (planListRef.value) {
    planListRef.value.fetchPlans();
  }
};
</script>