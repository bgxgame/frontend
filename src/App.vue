<!-- src/App.vue -->
<template>
  <div class="min-h-screen bg-slate-50 font-sans text-slate-800">
    <!-- 顶部导航 -->
    <nav class="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <span class="text-2xl font-black text-indigo-600 tracking-tight">Life<span class="text-slate-800">Plan.</span></span>
          </div>
          <div class="flex items-center space-x-4">
            <div v-if="isLoggedIn" class="flex items-center gap-4">
              <span class="text-sm font-medium text-slate-600">Admin</span>
              <button @click="openCreateModal" class="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition">
                + 新建
              </button>
              <button @click="logout" class="text-sm text-slate-400 hover:text-red-500 transition">退出</button>
            </div>
            <button v-else @click="showLoginModal = true" class="text-sm font-medium text-indigo-600 hover:text-indigo-800">
              管理员登录
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容 -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <PlanList ref="planListRef" @edit="openEditModal" />
    </main>

    <!-- 模态框 -->
    <LoginModal :isOpen="showLoginModal" @close="showLoginModal = false" @login-success="handleLoginSuccess" />
    
    <PlanModal 
      :isOpen="showPlanModal" 
      :editData="currentEditPlan" 
      @close="showPlanModal = false" 
      @saved="refreshList" 
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