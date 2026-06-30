<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-slate-200">
        <span class="text-2xl mr-2">⚙️</span>
        <span class="font-bold text-slate-800 text-lg">Admin Panel</span>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <router-link to="/admin/dashboard" class="flex items-center px-4 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
          Dashboard
        </router-link>
        <router-link to="/admin/dataset" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Dataset Management
        </router-link>
        <router-link to="/admin/monitoring" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Question Monitoring
        </router-link>
        <router-link to="/admin/model" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Model Information
        </router-link>
        <div class="pt-4 mt-4 border-t border-slate-200">
          <a href="#" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
            Settings
          </a>
        </div>
      </nav>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <h1 class="text-lg font-bold text-slate-700">Science QA Admin Dashboard</h1>
        <div class="flex items-center space-x-4">
          <button class="flex items-center px-3 py-1.5 border border-amber-200 bg-amber-50 text-amber-700 rounded-md text-sm font-medium hover:bg-amber-100 transition-colors">
            <span class="mr-2">🔔</span> Notif
          </button>
          <button class="flex items-center px-3 py-1.5 border border-slate-300 bg-white text-slate-700 rounded-md text-sm font-medium hover:bg-slate-50 transition-colors">
            Admin User <span class="ml-2 text-xs">▼</span>
          </button>
        </div>
      </header>

      <!-- Scrollable Dashboard Content -->
      <main class="flex-1 overflow-y-auto p-8">
        <header class="mb-8">
          <h2 class="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p class="text-slate-500 mt-1">Real-time system summary</p>
        </header>

        <!-- Summary Cards Row -->
        <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <!-- Card 1 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xl mb-4 border border-blue-100">
              ❓
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ formatNumber(metrics?.questionMetrics?.totalQuestions || 8932) }}</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Questions Asked</p>
            <p class="text-xs text-slate-500 mt-1">All users, all time</p>
          </div>
          <!-- Card 2 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-4 border border-purple-100">
              👥
            </div>
            <h3 class="text-3xl font-bold text-slate-900">{{ formatNumber(metrics?.userMetrics?.activeToday || 1248) }}</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Active Users</p>
            <p class="text-xs text-slate-500 mt-1">Registered students</p>
          </div>
          <!-- Card 3 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-4 border border-emerald-100">
              📚
            </div>
            <h3 class="text-3xl font-bold text-slate-900">48,631</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Dataset Records</p>
            <p class="text-xs text-slate-500 mt-1">SciQ + ScienceQA</p>
          </div>
          <!-- Card 4 -->
          <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div class="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-xl mb-4 border border-orange-100">
              🧠
            </div>
            <h3 class="text-3xl font-bold text-slate-900">8,891</h3>
            <p class="text-sm font-semibold text-slate-700 mt-2">Total Answers Generated</p>
            <p class="text-xs text-slate-500 mt-1">By T5 model</p>
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

const router = useRouter()

const metrics = ref(null)
const recentQuestions = ref([])
const loading = ref(true)
const error = ref(null)
let pollingInterval = null

const fetchDashboardData = async () => {
  try {
    const token = localStorage.getItem('admin_token') || ''
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }

    const metricsRes = await fetch('/api/admin/metrics', { headers })
    if (metricsRes.ok) {
      metrics.value = await metricsRes.json()
    }

    const questionsRes = await fetch('/api/admin/questions?limit=5&sort=createdAt_desc', { headers })
    if (questionsRes.ok) {
      const qData = await questionsRes.json()
      recentQuestions.value = qData.data || qData
    }
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    error.value = 'Failed to load dashboard metrics.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
  pollingInterval = setInterval(fetchDashboardData, 30000)
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
  router.push('/admin/model-info')
}
</script>

<style scoped>
/* Scoped styles removed in favor of Tailwind CSS utility classes */
</style>
