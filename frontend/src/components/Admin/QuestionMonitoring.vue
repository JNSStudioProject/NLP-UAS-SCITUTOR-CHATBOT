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
        <router-link to="/admin/monitoring" class="flex items-center px-4 py-3 bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors">
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

      <!-- Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-8">
        
        <!-- Page Header -->
        <div class="flex justify-between items-end mb-6">
          <div>
            <h2 class="text-2xl font-bold text-slate-900">Question Monitoring</h2>
            <p class="text-slate-500 mt-1">Review all questions submitted by users</p>
          </div>
          <div>
            <button class="flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors" @click="exportToCSV">
              Export CSV
            </button>
          </div>
        </div>

        <!-- Search & Filter Bar -->
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 xl:items-end justify-between">
          <div class="flex-1 min-w-[300px]">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search questions by keyword..." 
              class="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors"
            />
          </div>
          
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Filter by Subject</span>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="subject in ['All', 'Biology', 'Chemistry', 'Physics', 'Mathematics']" 
                :key="subject"
                @click="selectedSubject = subject"
                class="px-4 py-1.5 rounded-md text-sm font-medium border transition-colors"
                :class="selectedSubject === subject ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
              >
                {{ subject }}
              </button>
            </div>
          </div>
          
          <div class="flex flex-col min-w-[200px]">
            <span class="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Date Range</span>
            <input 
              type="text" 
              placeholder="From - To" 
              class="w-full px-4 py-1.5 border border-slate-300 rounded-md text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              disabled
            />
          </div>
        </div>

        <!-- Question Monitoring Table -->
        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div class="px-6 py-4 border-b border-slate-200">
            <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">All User Questions</h3>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-200">
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-16">#</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-48">User</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">User Question</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32">Subject</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-48">Date & Time</th>
                  <th class="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider w-32 text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="loading">
                  <td colspan="6" class="text-center text-slate-500 py-8">Loading data...</td>
                </tr>
                <tr v-else-if="paginatedQuestions.length === 0">
                  <td colspan="6" class="text-center text-slate-500 py-8">No questions found matching criteria.</td>
                </tr>
                <tr v-for="(q, index) in paginatedQuestions" :key="q.id" v-else class="hover:bg-slate-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-slate-500">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                  <td class="px-6 py-4 text-sm text-slate-700 font-medium truncate">{{ q.userEmail || q.user || 'Unknown User' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-600">{{ q.input || q.question }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ q.subject || 'N/A' }}</td>
                  <td class="px-6 py-4 text-sm text-slate-500">{{ formatDateTime(q.createdAt) }}</td>
                  <td class="px-6 py-4 text-sm flex flex-col gap-2 items-center justify-center">
                    <button class="w-full px-3 py-1 border border-slate-300 rounded text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors" @click="viewAnswer(q)">
                      View Answer
                    </button>
                    <button class="w-full px-3 py-1 border border-red-200 rounded text-xs font-medium text-red-600 bg-white hover:bg-red-50 transition-colors" @click="flagItem(q)">
                      Flag
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination Footer -->
          <div class="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span class="text-xs text-slate-500 font-medium italic">
              Showing {{ paginatedQuestions.length }} of {{ filteredQuestions.length }} total questions
            </span>
            <div class="flex gap-1">
              <button 
                class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === 1"
                @click="currentPage--"
              >
                ←
              </button>
              <button 
                v-for="page in totalPages" 
                :key="page"
                class="w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors"
                :class="currentPage === page ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
              <button 
                class="w-8 h-8 flex items-center justify-center rounded border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="currentPage === totalPages || totalPages === 0"
                @click="currentPage++"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// State
const questions = ref([])
const loading = ref(true)
let pollingInterval = null

// New State for Filter/Pagination
const searchQuery = ref('')
const selectedSubject = ref('All')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Methods
const fetchQuestions = async () => {
  try {
    const response = await fetch('/api/admin/questions?limit=1000&sort=createdAt_desc', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('admin_token') || ''}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      questions.value = data.data || data
    }
  } catch (error) {
    console.error('Failed to fetch questions:', error)
  } finally {
    loading.value = false
  }
}

// Computed
const filteredQuestions = computed(() => {
  let filtered = questions.value || []

  // Search Filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(q => 
      (q.input && q.input.toLowerCase().includes(query)) ||
      (q.question && q.question.toLowerCase().includes(query)) ||
      (q.userEmail && q.userEmail.toLowerCase().includes(query)) ||
      (q.user && q.user.toLowerCase().includes(query))
    )
  }

  // Subject Filter
  if (selectedSubject.value !== 'All') {
    filtered = filtered.filter(q => 
      q.subject && q.subject.toLowerCase() === selectedSubject.value.toLowerCase()
    )
  }

  // Sort by date desc
  return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
})

const totalPages = computed(() => {
  return Math.ceil(filteredQuestions.value.length / itemsPerPage.value)
})

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredQuestions.value.slice(start, end)
})

// Actions
const viewAnswer = (item) => {
  alert(`Viewing Answer for Question ID: ${item.id || item._id}\n\nQuestion: ${item.input || item.question}\nAnswer: ${item.output || item.answer || 'Not answered yet'}`)
}

const flagItem = async (item) => {
  alert(`Item ${item.id || item._id} flagged for review.`)
}

const exportToCSV = () => {
  if (filteredQuestions.value.length === 0) return
  
  // Implementation of CSV export
  const headers = ['User', 'Question', 'Subject', 'Date', 'Status']
  const rows = filteredQuestions.value.map(q => [
    q.userEmail || q.user || 'Unknown',
    `"${(q.input || q.question || '').replace(/"/g, '""')}"`,
    q.subject || 'N/A',
    q.createdAt || 'N/A',
    q.status || 'N/A'
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'question_monitoring_export.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatDateTime = (isoString) => {
  if (!isoString) return '--/--/---- --:--'
  const date = new Date(isoString)
  return date.toLocaleString('en-GB', { 
    year: 'numeric', month: '2-digit', day: '2-digit', 
    hour: '2-digit', minute: '2-digit'
  }).replace(',', '')
}

// Lifecycle
onMounted(() => {
  fetchQuestions()
  pollingInterval = setInterval(fetchQuestions, 15000) // Lowered polling rate to 15s
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})
</script>

<style scoped>
/* Scoped styles removed in favor of Tailwind CSS utility classes */
</style>
