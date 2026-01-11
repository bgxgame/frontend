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
        @openCreate="handleOpenCreateIssue"
        @changeTab="handleTabChange"
      />

      <div class="flex-1 flex flex-col min-w-0 bg-white">
        <!-- 顶部 Breadcrumb -->
        <header class="h-12 border-b border-[#F0F0F2] flex items-center px-6 shrink-0 justify-between">
          <div class="flex items-center gap-2 text-[13px]">
            <span class="text-[#9593A3] font-medium">Workspace</span>
            <span class="text-[#D1D1D6]">/</span>
            <span 
              class="font-medium cursor-pointer hover:text-[#5E6AD2] transition-colors"
              :class="activeTab === 'projects' && !currentProject ? 'text-[#1D1D20]' : 'text-[#9593A3]'"
              @click="handleTabChange('projects')"
            >
              Projects
            </span>
            <template v-if="currentProject">
              <span class="text-[#D1D1D6]">/</span>
              <span class="font-semibold text-[#1D1D20] tracking-tight">{{ currentProject.name }}</span>
            </template>
          </div>
 
        </header>

        <main class="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white">
          <div class="max-w-[1400px] mx-auto p-8">
            <template v-if="activeTab === 'projects'">
              <ProjectList v-if="!currentProject" @select="handleProjectSelect" />
              <IssueList 
                v-else 
                :projectId="currentProject.id" 
                :projectName="currentProject.name"
                ref="issueListRef"
                @back="currentProject = null"
                @edit="handleEditIssue"
              />
            </template>

            <div v-else-if="activeTab === 'issues'" class="flex flex-col items-center justify-center py-40 animate-in fade-in slide-in-from-bottom-4">
              <div class="w-16 h-16 bg-[#FAFAFC] rounded-2xl flex items-center justify-center mb-4 border border-[#F0F0F2]">
                <svg class="w-8 h-8 text-[#D1D1D6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h2 class="text-lg font-bold text-[#1D1D20]">Issues 视图</h2>
              <button @click="handleTabChange('projects')" class="mt-6 text-sm font-bold text-[#5E6AD2] hover:underline">返回我的项目</button>
            </div>
          </div>
        </main>
      </div>

      <!-- 全局搜索 (混合项项目与任务) -->
      <SearchPalette 
        :isOpen="showSearch" 
        :items="allSearchItems"
        @close="showSearch = false"
        @select="handleSearchSelect"
      />

      <!-- 任务编辑弹窗 -->
      <IssueModal 
        :isOpen="showIssueModal" 
        :editData="currentEditIssue" 
        :defaultProjectId="currentProject?.id"
        :projectName="currentProject?.name"
        @close="closeIssueModal" 
        @saved="handleIssueSaved" 
      />
      
      <ToastContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import Sidebar from './components/Sidebar.vue';
import AuthPage from './components/AuthPage.vue';
import ProjectList from './components/ProjectList.vue';
import IssueList from './components/IssueList.vue';
import IssueModal from './components/IssueModal.vue';
import SearchPalette from './components/SearchPalette.vue';
import ToastContainer from './components/ToastContainer.vue';
import api from './api';
import { toastStore } from './toast';
import type { Project, Issue } from './types';

// 定义混合搜索项类型
export type SearchItem = 
  | { type: 'project'; data: Project }
  | { type: 'issue'; data: Issue };

// --- 状态管理 ---
const isLoggedIn = ref(!!localStorage.getItem('token'));
const username = ref(localStorage.getItem('username') || '');
const activeTab = ref('projects');
const currentProject = ref<Project | null>(null);

const showSearch = ref(false);
const showIssueModal = ref(false);
const currentEditIssue = ref<Issue | null>(null);
const allSearchItems = ref<SearchItem[]>([]); // 存储项目+任务
const issueListRef = ref();

let lastTabTime = 0;

// --- 逻辑处理 ---

const handleLoginSuccess = () => {
  isLoggedIn.value = true;
  username.value = localStorage.getItem('username') || 'Admin';
};

const logout = () => {
  localStorage.clear();
  isLoggedIn.value = false;
  currentProject.value = null;
};

const handleTabChange = (tab: string) => {
  activeTab.value = tab;
  if (tab === 'projects') currentProject.value = null;
};

const handleProjectSelect = (project: Project) => {
  currentProject.value = project;
};

const handleOpenCreateIssue = () => {
  if (!currentProject.value && activeTab.value === 'projects') {
    toastStore.show('请先进入一个项目再创建任务', 'info');
    return;
  }
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

// --- 全局搜索数据获取 ---
const fetchSearchData = async () => {
  if (!isLoggedIn.value) return;
  try {
    const [projectsRes, issuesRes] = await Promise.all([
      api.get<Project[]>('/projects'),
      api.get<Issue[]>('/issues')
    ]);

    const projects: SearchItem[] = projectsRes.data.map(p => ({ type: 'project', data: p }));
    const issues: SearchItem[] = issuesRes.data.map(i => ({ type: 'issue', data: i }));

    allSearchItems.value = [...projects, ...issues];
  } catch (err) {
    console.error("加载搜索数据失败", err);
  }
};

const handleSearchSelect = (item: SearchItem) => {
  if (item.type === 'project') {
    activeTab.value = 'projects';
    currentProject.value = item.data;
  } else {
    handleEditIssue(item.data);
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    const now = Date.now();
    if (now - lastTabTime < 300) {
      e.preventDefault();
      showSearch.value = !showSearch.value;
      lastTabTime = 0;
    } else {
      lastTabTime = now;
    }
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    showSearch.value = !showSearch.value;
  }
};

watch(showSearch, (val) => { if (val) fetchSearchData(); });

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  if (isLoggedIn.value) username.value = localStorage.getItem('username') || 'Admin';
});

onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
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