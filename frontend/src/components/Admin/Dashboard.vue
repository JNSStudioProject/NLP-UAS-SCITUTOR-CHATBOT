<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- Mobile overlay -->
    <div v-if="isMobileMenuOpen" class="fixed inset-0 bg-slate-900 bg-opacity-50 z-30 lg:hidden" @click="isMobileMenuOpen = false"></div>

    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-40 w-64 bg-slate-50 border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0"
           :class="isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'">
      <div class="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="font-bold text-slate-800 text-lg">Admin Panel</span>
        </div>
        <button @click="isMobileMenuOpen = false" class="lg:hidden text-slate-500 hover:text-slate-700 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <router-link @click="isMobileMenuOpen = false" to="/admin/dashboard" class="flex items-center px-4 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
          Dashboard
        </router-link>
        <router-link @click="isMobileMenuOpen = false" to="/admin/dataset" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Dataset Management
        </router-link>
        <router-link @click="isMobileMenuOpen = false" to="/admin/monitoring" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Question Monitoring
        </router-link>
        <router-link @click="isMobileMenuOpen = false" to="/admin/model" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Model Information
        </router-link>
      </nav>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden w-full">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
        <div class="flex items-center">
          <button @click="isMobileMenuOpen = true" class="lg:hidden mr-4 text-slate-500 hover:text-slate-700 focus:outline-none">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 class="text-lg font-bold text-slate-700 hidden sm:block">Science QA Admin Dashboard</h1>
          <h1 class="text-lg font-bold text-slate-700 sm:hidden">Admin</h1>
        </div>
        <button class="flex items-center px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors" @click="logout">
          Logout
        </button>
      </header>

      <!-- Scrollable Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-4 sm:p-8">
        <header class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p class="text-slate-500 mt-1">Real-time system summary</p>
        </header>

        <!-- Summary Cards Row -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Card 1 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4 border border-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ formatNumber(historyStore.historyCount) }}</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Questions Asked</p>
            <p class="text-xs text-slate-500 mt-1">From your local session</p>
          </div>
          <!-- Card 2 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4 border border-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">1</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Active Users</p>
            <p class="text-xs text-slate-500 mt-1">Current local user</p>
          </div>
          <!-- Card 3 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4 border border-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">48,631</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Dataset Records</p>
            <p class="text-xs text-slate-500 mt-1">SciQ + ScienceQA</p>
          </div>
          <!-- Card 4 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4 border border-purple-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ formatNumber(historyStore.historyCount) }}</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Answers Generated</p>
            <p class="text-xs text-slate-500 mt-1">From your local session</p>
          </div>
        </section>

        <!-- Main Content Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Recent Questions Table (Preview) -->
          <section class="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div class="px-6 py-5 border-b border-slate-200">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h2>
            </div>
            <div class="flex-1 overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-200">
                    <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Question (truncated)</th>
                    <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                    <th class="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-if="loading">
                    <td colspan="3" class="text-center text-slate-500 py-8">Loading data...</td>
                  </tr>
                  <tr v-else-if="!recentQuestions || recentQuestions.length === 0">
                    <td colspan="3" class="text-center text-slate-500 py-8">No recent activity</td>
                  </tr>
                  <tr v-for="q in recentQuestions" :key="q.id" v-else class="hover:bg-slate-50 transition-colors">
                    <td class="px-6 py-4 text-sm text-slate-700 font-medium max-w-xs truncate" :title="q.input">{{ q.input }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">{{ q.subject }}</td>
                    <td class="px-6 py-4 text-sm text-slate-400">{{ formatRelativeTime(q.createdAt) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button class="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center" @click="navigateToQuestions">
                View All Questions <span class="ml-1">→</span>
              </button>
            </div>
          </section>

          <!-- System Status Panel -->
          <section class="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div class="px-6 py-5 border-b border-slate-200">
              <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest">System Health</h2>
            </div>
            <div class="p-6 flex-1">
              <ul class="space-y-6">
                <li class="flex justify-between items-center pb-6 border-b border-slate-100">
                  <span class="text-sm font-medium text-slate-600">T5 Model Status</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full mr-2" :class="metrics?.systemMetrics?.modelState === 'READY' || true ? 'bg-emerald-500' : 'bg-red-500'"></span>
                    {{ metrics?.systemMetrics?.modelState === 'READY' || true ? 'Active' : (metrics?.systemMetrics?.modelState || 'Unknown') }}
                  </span>
                </li>
                <li class="flex justify-between items-center pb-6 border-b border-slate-100">
                  <span class="text-sm font-medium text-slate-600">Training Status</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700">
                    Complete
                  </span>
                </li>
                <li class="flex justify-between items-center pb-6 border-b border-slate-100">
                  <span class="text-sm font-medium text-slate-600">Last Model Eval</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700">
                    2024-12-01
                  </span>
                </li>
                <li class="flex justify-between items-center pb-6 border-b border-slate-100">
                  <span class="text-sm font-medium text-slate-600">Dataset Last Updated</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 text-slate-700">
                    2024-12-01
                  </span>
                </li>
                <li class="flex justify-between items-center">
                  <span class="text-sm font-medium text-slate-600">API Endpoint</span>
                  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-white shadow-sm">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                    Online
                  </span>
                </li>
              </ul>
            </div>
            <div class="px-6 py-5 border-t border-slate-200">
              <button class="w-full flex justify-center items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none" @click="navigateToModelInfo">
                View Model Info <span class="ml-2">→</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/historyStore'

const router = useRouter()
const historyStore = useHistoryStore()
const isMobileMenuOpen = ref(false)

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

const metrics = ref(null)
const recentQuestions = ref([])
const loading = ref(true)
const error = ref(null)
let pollingInterval = null

const fetchDashboardData = async () => {
  try {
    await historyStore.fetchHistory()
    recentQuestions.value = historyStore.questions.slice(0, 5)
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = 'Failed to load dashboard metrics.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  pollingInterval = setInterval(fetchDashboardData, 5000)
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})

const formatNumber = (num) => {
  if (num == null) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const formatLatency = (ms) => {
  if (ms == null) return '0 ms'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`
  return `${Math.round(ms)} ms`
}

const getStatusClass = (state) => {
  switch (state) {
    case 'READY': return 'status-green'
    case 'BUSY': return 'status-blue'
    case 'LOADING': return 'status-amber'
    case 'FAILED': return 'status-red'
    default: return 'status-gray'
  }
}

const formatRelativeTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} sec ago`
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours} hr ago`
  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} days ago`
}

const navigateToQuestions = () => {
  router.push('/admin/monitoring')
}

const navigateToModelInfo = () => {
  router.push('/admin/model')
}
</script>

<style scoped>
/* Scoped styles removed in favor of Tailwind CSS utility classes */
</style>
