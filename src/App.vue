<!-- src/App.vue -->
<template>
  <div class="antialiased text-[#1D1D20] font-sans bg-white">
    <!-- 1. 未登录状态 -->
    <div v-if="!isLoggedIn" class="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-4">
      <AuthPage @login-success="handleLoginSuccess" />
    </div>

    <!-- 2. 已登录状态 -->
    <div v-else class="flex h-screen w-full bg-white overflow-hidden relative">
      
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="lg:hidden fixed inset-0 bg-slate-900/40 z-[45] backdrop-blur-sm transition-opacity"
      ></div>

      <Sidebar 
        :username="username" 
        :activeTab="activeTab"
        class="fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0"
        :class="[
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          isSidebarCollapsed ? 'lg:w-0 lg:opacity-0 lg:border-none' : 'lg:w-64 lg:opacity-100'
        ]"
        @logout="logout"
        @changeTab="(tab) => { handleTabChange(tab); isSidebarOpen = false; }"
      />

      <div class="flex-1 flex flex-col min-w-0 h-full bg-white relative transition-all duration-300">
        <header class="h-12 border-b border-[#F0F0F2] flex items-center px-4 shrink-0 justify-between bg-white z-30">
          <div class="flex items-center gap-2 min-w-0">
            <button 
              @click="isSidebarCollapsed = !isSidebarCollapsed" 
              class="hidden lg:flex p-1.5 hover:bg-gray-100 rounded-md text-[#67657F] transition-colors"
              :title="isSidebarCollapsed ? '展开侧边栏' : '折叠侧边栏'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="isSidebarCollapsed" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            </button>

            <button 
              @click="isSidebarOpen = true" 
              class="lg:hidden p-1.5 hover:bg-gray-100 rounded-md text-[#67657F]"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            <div class="flex items-center gap-1 text-[13px] overflow-hidden ml-1">
              <span class="text-[#9593A3] font-medium hidden xs:inline">Workspace</span>
              <span class="text-[#D1D1D6] hidden xs:inline">/</span>
              <span 
                class="font-medium cursor-pointer hover:text-[#5E6AD2] transition-colors whitespace-nowrap"
                :class="activeTab === 'projects' && !currentProject ? 'text-[#1D1D20]' : 'text-[#9593A3]'"
                @click="handleTabChange('projects')"
              >
                Projects
              </span>
              <template v-if="currentProject">
                <span class="text-[#D1D1D6]">/</span>
                <span class="font-semibold text-[#1D1D20] tracking-tight truncate">{{ currentProject.name }}</span>
              </template>
            </div>
          </div>

        </header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
          <div class="w-full max-w-[1400px] mx-auto p-4 md:p-8">
            <template v-if="activeTab === 'projects'">
              <ProjectList v-if="!currentProject" @select="handleProjectSelect" />
              <IssueList 
                v-else 
                :projectId="currentProject.id" 
                :projectName="currentProject.name"
                ref="issueListRef"
                @back="currentProject = null"
                @edit="handleEditIssue"
                @create="handleOpenCreateIssue"
              />
            </template>

            <div v-else-if="activeTab === 'issues'" class="flex flex-col items-center justify-center py-40">
              <h2 class="text-lg font-bold text-[#1D1D20]">Issues 视图</h2>
              <button @click="handleTabChange('projects')" class="mt-4 text-sm font-bold text-[#5E6AD2] hover:underline">返回项目</button>
            </div>
          </div>
        </main>
      </div>

      <SearchPalette :isOpen="showSearch" @close="showSearch = false" @select="handleSearchSelect" />
      <IssueModal :isOpen="showIssueModal" :editData="currentEditIssue" :defaultProjectId="currentProject?.id" :projectName="currentProject?.name" @close="closeIssueModal" @saved="handleIssueSaved" />
      <ToastContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import Sidebar from './components/Sidebar.vue';
import AuthPage from './components/AuthPage.vue';
import ProjectList from './components/ProjectList.vue';
import IssueList from './components/IssueList.vue';
import IssueModal from './components/IssueModal.vue';
import SearchPalette from './components/SearchPalette.vue';
import ToastContainer from './components/ToastContainer.vue';
import type { Project, Issue } from './types';

const isLoggedIn = ref(!!localStorage.getItem('token'));
const username = ref(localStorage.getItem('username') || '');
const activeTab = ref('projects');
const currentProject = ref<Project | null>(null);

const isSidebarOpen = ref(false); 
const isSidebarCollapsed = ref(false); 

const showSearch = ref(false);
const showIssueModal = ref(false);
const currentEditIssue = ref<Issue | null>(null);
const issueListRef = ref();

// 用于追踪 Tab 双击逻辑
let lastTabTime = 0;

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  username.value = localStorage.getItem('username') || 'Admin';
};

const logout = () => {
  localStorage.clear();
  isLoggedIn.value = false;
  window.location.href = '/';
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  if (tab === 'projects') currentProject.value = null;
};

const handleProjectSelect = (project: Project) => {
  currentProject.value = project;
};

const handleOpenCreateIssue = () => {
  currentEditIssue.value = null; 
  showIssueModal.value = true;
};

const handleEditIssue = (issue: Issue) => {
  currentEditIssue.value = issue;
  showIssueModal.value = true;
};

const closeIssueModal = () => {
  showIssueModal.value = false;
  setTimeout(() => { currentEditIssue.value = null; }, 200);
};

const handleIssueSaved = () => {
  if (issueListRef.value) issueListRef.value.fetchIssues();
  closeIssueModal();
};

const handleSearchSelect = (item: { type: string, data: any }) => {
  if (item.type === 'project') {
    activeTab.value = 'projects';
    currentProject.value = item.data;
  } else {
    handleEditIssue(item.data);
  }
};

// ---------------------------------------------------------
// 快捷键监听逻辑
// ---------------------------------------------------------
const handleKeyDown = (e: KeyboardEvent) => {
  // 1. Tab + Tab 逻辑
  if (e.key === 'Tab') {
    const now = Date.now();
    if (now - lastTabTime < 300) {
      e.preventDefault();
      showSearch.value = !showSearch.value;
      lastTabTime = 0; // 重置
    } else {
      lastTabTime = now;
    }
  }

  // 2. Ctrl/Cmd + K 逻辑
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showSearch.value = !showSearch.value;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>