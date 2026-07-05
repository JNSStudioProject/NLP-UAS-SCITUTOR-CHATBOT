<template>
  <div class="flex h-screen bg-slate-50 overflow-hidden font-sans">
    <!-- Sidebar -->
    <aside class="w-64 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
      <div class="h-16 flex items-center px-6 border-b border-slate-200">
        <span class="text-2xl mr-2">⚙️</span>
        <span class="font-bold text-slate-800 text-lg">Admin Panel</span>
      </div>
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <router-link to="/admin/dashboard" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Dashboard
        </router-link>
        <router-link to="/admin/dataset" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Dataset Management
        </router-link>
        <router-link to="/admin/monitoring" class="flex items-center px-4 py-3 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors">
          Question Monitoring
        </router-link>
        <router-link to="/admin/model" class="flex items-center px-4 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
          Model Information
        </router-link>
      </nav>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Bar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0">
        <h1 class="text-lg font-bold text-slate-700">Science QA Admin Dashboard</h1>
        <button class="flex items-center px-4 py-2 border border-red-200 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100 transition-colors" @click="logout">
          Logout
        </button>
      </header>

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto">
        <div class="model-info-container">
          <!-- Page Header -->
          <header class="page-header">
            <div class="header-content">
              <h1 class="text-2xl font-bold text-gray-800">Model Information</h1>
              <p class="text-gray-500">Live telemetry and configuration for the AI inference engine</p>
            </div>
            <div class="header-actions">
              <span class="status-indicator" :class="overallHealthClass">
                <span class="dot"></span>
                {{ overallHealthLabel }}
              </span>
              <button class="btn btn-primary" @click="fetchModelInfo" :disabled="isLoading">
                <span class="icon" :class="{'spin': isLoading}">↻</span> Refresh Telemetry
              </button>
            </div>
          </header>

          <div v-if="error" class="error-banner">
            <strong>Error:</strong> {{ error }}
          </div>

          <!-- Main Content Layout -->
          <div class="telemetry-grid" v-if="metrics">
            
            <!-- Category: Model Identity -->
            <section class="metric-category card shadow-sm">
              <div class="category-header">
                <span class="category-icon bg-blue-100 text-blue-600">🤖</span>
                <h2 class="category-title">Model Identity</h2>
              </div>
              <div class="category-body">
                <div class="metric-row" v-for="metric in getMetricsByCategory('identity')" :key="metric.key">
                  <span class="metric-label">{{ metric.label }}</span>
                  <span class="metric-value font-mono">{{ metric.displayValue || metric.value }}</span>
                </div>
              </div>
            </section>

            <!-- Category: Runtime Status -->
            <section class="metric-category card shadow-sm">
              <div class="category-header">
                <span class="category-icon bg-purple-100 text-purple-600">⚙️</span>
                <h2 class="category-title">Runtime Status</h2>
              </div>
              <div class="category-body">
                <div class="metric-row">
                  <span class="metric-label">Model State</span>
                  <span class="metric-value badge" :class="getBadgeClass(getMetric('modelState')?.value)">
                    {{ getMetric('modelState')?.value || 'UNKNOWN' }}
                  </span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Heap Memory Usage</span>
                  <span class="metric-value font-mono" :class="getMemoryClass(getMetric('memoryUsageMB')?.value)">
                    {{ getMetric('memoryUsageMB')?.value?.toFixed(1) }} MB / 512 MB 
                    <span class="text-xs text-gray-400">({{ ((getMetric('memoryUsageMB')?.value / 512) * 100).toFixed(1) }}%)</span>
                  </span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Model Loaded At</span>
                  <span class="metric-value">{{ formatDate(getMetric('loadedAt')?.value) }}</span>
                </div>
              </div>
            </section>

            <!-- Category: Performance & Throughput -->
            <section class="metric-category card shadow-sm">
              <div class="category-header">
                <span class="category-icon bg-green-100 text-green-600">⚡</span>
                <h2 class="category-title">Performance &amp; Throughput</h2>
              </div>
              <div class="category-body">
                <div class="metric-row">
                  <span class="metric-label">Total Inference Requests</span>
                  <span class="metric-value font-mono">{{ formatNumber(getMetric('requestCount')?.value) }}</span>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Avg Inference Latency</span>
                  <span class="metric-value font-mono" :class="getLatencyClass(getMetric('avgLatencyMs')?.value)">
                    {{ formatLatency(getMetric('avgLatencyMs')?.value) }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Category: Token Constraints -->
            <section class="metric-category card shadow-sm">
              <div class="category-header">
                <span class="category-icon bg-orange-100 text-orange-600">🔒</span>
                <h2 class="category-title">Token Constraints</h2>
              </div>
              <div class="category-body">
                <div class="metric-row">
                  <span class="metric-label">Input Token Hard Cap</span>
                  <div class="metric-value flex items-center gap-2">
                    <span class="font-mono">{{ getMetric('maxInputTokens')?.value }}</span>
                    <span class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Requires Restart</span>
                  </div>
                </div>
                <div class="metric-row">
                  <span class="metric-label">Output Token Limit</span>
                  <div class="metric-value flex items-center gap-2">
                    <span class="font-mono">{{ getMetric('maxOutputTokens')?.value }}</span>
                    <button class="btn-text text-blue-600 text-xs">Edit</button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Category: System Health -->
            <section class="metric-category card shadow-sm col-span-full">
              <div class="category-header">
                <span class="category-icon bg-red-100 text-red-600">🩺</span>
                <h2 class="category-title">System Health</h2>
              </div>
              <div class="category-body">
                <div class="metric-row">
                  <span class="metric-label">Inference Error Rate</span>
                  <span class="metric-value font-mono text-lg" :class="getErrorRateClass(getMetric('inferenceErrorRate')?.value)">
                    {{ getMetric('inferenceErrorRate')?.value?.toFixed(2) }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2.5 mt-2 overflow-hidden">
                  <div class="h-2.5 rounded-full" 
                       :class="getErrorRateBgClass(getMetric('inferenceErrorRate')?.value)" 
                       :style="`width: ${Math.min(getMetric('inferenceErrorRate')?.value || 0, 100)}%`">
                  </div>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  Formula: (failedInferences / totalRequests) * 100. Alert threshold at 15%.
                </p>
              </div>
            </section>

          </div>

          <!-- Loading Skeleton -->
          <div v-else-if="isLoading" class="telemetry-grid">
            <div v-for="i in 5" :key="i" class="card shadow-sm p-6 skeleton-card">
              <div class="skeleton-header bg-gray-200 h-8 w-1/2 mb-6 rounded"></div>
              <div class="skeleton-row bg-gray-100 h-6 w-full mb-4 rounded"></div>
              <div class="skeleton-row bg-gray-100 h-6 w-3/4 mb-4 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}

const metrics = ref(null)
const isLoading = ref(true)
const error = ref(null)
let pollingInterval = null

// Fallback mock data matching the 11-Metric Schema
const mockMetrics = [
  { metricId: 1, key: 'modelId', label: 'Model Identifier', value: 'Xenova/flan-t5-base', category: 'identity' },
  { metricId: 2, key: 'runtime', label: 'Inference Runtime', value: 'ONNX Runtime (CPU)', category: 'identity' },
  { metricId: 3, key: 'quantized', label: 'Quantization Mode', value: true, displayValue: 'INT8 Quantized', category: 'identity' },
  { metricId: 4, key: 'modelState', label: 'Model State', value: 'READY', category: 'runtime' },
  { metricId: 5, key: 'memoryUsageMB', label: 'Heap Memory Usage', value: 384.5, category: 'runtime' },
  { metricId: 6, key: 'loadedAt', label: 'Model Loaded At', value: new Date(Date.now() - 7200000).toISOString(), category: 'runtime' },
  { metricId: 7, key: 'requestCount', label: 'Total Inference Requests', value: 14285, category: 'throughput' },
  { metricId: 8, key: 'avgLatencyMs', label: 'Average Inference Latency', value: 1450.2, category: 'performance' },
  { metricId: 9, key: 'maxInputTokens', label: 'Input Token Hard Cap', value: 42, category: 'constraints' },
  { metricId: 10, key: 'maxOutputTokens', label: 'Output Token Limit', value: 325, category: 'constraints' },
  { metricId: 11, key: 'inferenceErrorRate', label: 'Inference Error Rate', value: 1.2, category: 'health' }
]

const fetchModelInfo = async () => {
  isLoading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('admin_token') || ''
    const response = await fetch('/api/admin/model/info', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    })

    if (response.ok) {
      const data = await response.json()
      metrics.value = data.metrics || data
    } else {
      metrics.value = mockMetrics
    }
  } catch (err) {
    console.error('Failed to fetch model info:', err)
    metrics.value = mockMetrics 
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchModelInfo()
  pollingInterval = setInterval(fetchModelInfo, 5000)
})

onUnmounted(() => {
  if (pollingInterval) clearInterval(pollingInterval)
})

const getMetric = (key) => {
  if (!metrics.value) return null
  return metrics.value.find(m => m.key === key)
}

const getMetricsByCategory = (category) => {
  if (!metrics.value) return []
  return metrics.value.filter(m => m.category === category)
}

const overallHealthLabel = computed(() => {
  const state = getMetric('modelState')?.value
  const mem = getMetric('memoryUsageMB')?.value
  const errRate = getMetric('inferenceErrorRate')?.value

  if (state === 'READY' && mem < 450 && errRate < 5) return 'SYSTEM HEALTHY'
  if (state === 'FAILED' || errRate >= 15) return 'CRITICAL STATE'
  return 'DEGRADED PERFORMANCE'
})

const overallHealthClass = computed(() => {
  const label = overallHealthLabel.value
  if (label === 'SYSTEM HEALTHY') return 'status-green'
  if (label === 'CRITICAL STATE') return 'status-red'
  return 'status-amber'
})

const getBadgeClass = (state) => {
  switch(state) {
    case 'READY': return 'bg-green-100 text-green-800 border-green-200'
    case 'BUSY': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'LOADING': return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'FAILED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getMemoryClass = (mb) => {
  if (!mb) return ''
  if (mb > 490) return 'text-red-600 font-bold'
  if (mb > 450) return 'text-amber-600 font-bold'
  return 'text-gray-900'
}

const getLatencyClass = (ms) => {
  if (!ms) return ''
  if (ms > 7000) return 'text-red-600 font-bold'
  if (ms > 4000) return 'text-amber-600 font-bold'
  return 'text-gray-900'
}

const getErrorRateClass = (rate) => {
  if (rate == null) return ''
  if (rate >= 15) return 'text-red-600 font-bold'
  if (rate >= 5) return 'text-amber-600 font-bold'
  return 'text-green-600 font-bold'
}

const getErrorRateBgClass = (rate) => {
  if (rate == null) return 'bg-gray-300'
  if (rate >= 15) return 'bg-red-500'
  if (rate >= 5) return 'bg-amber-500'
  return 'bg-green-500'
}

const formatNumber = (num) => {
  if (num == null) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const formatLatency = (ms) => {
  if (ms == null) return '0 ms'
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`
  return `${ms.toFixed(0)}ms`
}

const formatDate = (isoString) => {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  return date.toLocaleString()
}
</script>

<style scoped>
.model-info-container {
  padding: 1.5rem;
  background-color: #f8fafc;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  background-color: white;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.status-indicator .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-green .dot { background-color: #10b981; box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2); }
.status-amber .dot { background-color: #f59e0b; box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2); }
.status-red .dot { background-color: #ef4444; box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2); animation: pulse-red 2s infinite; }

@keyframes pulse-red {
  0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-text {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.btn-text:hover {
  text-decoration: underline;
}

.spin {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.error-banner {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
  color: #991b1b;
  padding: 1rem;
  border-radius: 0.25rem;
}

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  align-items: flex-start;
}

.card {
  background: white;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.col-span-full {
  grid-column: 1 / -1;
}

.category-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f8fafc;
}

.category-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.category-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.category-body {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.metric-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.metric-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.metric-value {
  font-size: 0.875rem;
  color: #0f172a;
  text-align: right;
}

.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid transparent;
}

.skeleton-card {
  animation: pulse-bg 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-bg {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

/* Tailwind-like utilities used inline */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-2 { gap: 0.5rem; }
.text-xs { font-size: 0.75rem; }
.w-full { width: 100%; }
.mt-2 { margin-top: 0.5rem; }
.p-6 { padding: 1.5rem; }
.h-8 { height: 2rem; }
.h-6 { height: 1.5rem; }
.w-1\/2 { width: 50%; }
.w-3\/4 { width: 75%; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.rounded { border-radius: 0.25rem; }
.bg-gray-200 { background-color: #e5e7eb; }
.bg-gray-100 { background-color: #f3f4f6; }
.rounded-full { border-radius: 9999px; }
.h-2\.5 { height: 0.625rem; }
.overflow-hidden { overflow: hidden; }
</style>
