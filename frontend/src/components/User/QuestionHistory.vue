<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
    <!-- Page Header -->
    <div class="mb-6 flex-shrink-0">
      <h1 class="text-3xl font-bold text-slate-900">Question History</h1>
      <p class="mt-2 text-sm text-slate-600">Review all previously asked questions and their generated answers</p>
    </div>

    <!-- Search & Filter Controls -->
    <div class="bg-white p-4 shadow-sm rounded-lg border border-gray-200 mb-6 flex-shrink-0">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
        <!-- Search -->
        <div class="flex-1 min-w-0">
          <label for="search" class="sr-only">Search question history...</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              v-model="searchQuery"
              class="focus:ring-slate-500 focus:border-slate-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              placeholder="Search question history..."
              @keyup.enter="applyFilters"
            />
          </div>
        </div>
        
        <!-- Subject Filter -->
        <div class="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
          <span class="text-sm font-medium text-gray-700 mr-2">Subject</span>
          <button
            v-for="sub in subjects"
            :key="sub.id"
            @click="setSubjectFilter(sub.id)"
            class="px-3 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap"
            :class="subjectFilter === sub.id ? 'bg-slate-200 border-slate-400 text-slate-900 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
          >
            {{ sub.label }}
          </button>
        </div>
        
        <!-- Date Filter (Placeholder) -->
        <div class="flex-shrink-0">
          <select class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm rounded-md border text-gray-700">
            <option>All Time</option>
            <option>Past 7 Days</option>
            <option>Past 30 Days</option>
          </select>
        </div>
      </div>
    </div>

    <!-- History Header & Actions -->
    <div class="flex justify-between items-center mb-4 flex-shrink-0">
      <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Previous Questions</h2>
      <button 
        @click="exportToCSV"
        :disabled="questions.length === 0"
        class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export History
      </button>
    </div>

    <!-- Scrollable Card List -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200 flex-1 overflow-hidden flex flex-col min-h-0">
      <div v-if="isLoading" class="flex-1 flex justify-center items-center p-12">
        <svg class="animate-spin h-8 w-8 text-slate-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      
      <div v-else-if="fetchError" class="flex-1 flex justify-center items-center p-12 text-red-500">
        {{ fetchError }}
      </div>
      
      <div v-else-if="isEmpty" class="flex-1 flex flex-col justify-center items-center p-12 text-gray-500">
        <svg class="h-12 w-12 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p class="text-lg font-medium text-gray-900">No questions found</p>
        <p class="mt-1">Try adjusting your filters or ask a new question.</p>
        <button @click="$router.push({ name: 'AskQuestion' })" class="mt-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700">
          Ask a Question
        </button>
      </div>
      
      <!-- List -->
      <div v-else class="flex-1 overflow-y-auto p-4 space-y-3">
        <div 
          v-for="(q, index) in formattedQuestions" 
          :key="q.id"
          class="border border-gray-200 rounded-lg p-4 hover:bg-slate-50 transition-colors bg-white shadow-sm flex flex-col md:flex-row items-center gap-6"
        >
          <div class="hidden md:flex text-gray-400 font-mono text-sm w-8 pt-1 self-start">
            {{ ((currentPage - 1) * 10) + index + 1 }}
          </div>
          
          <div class="flex-1 min-w-0 self-start">
            <h3 class="text-base font-semibold text-slate-900 truncate mb-1" :title="q.input">
              {{ q.input }}
            </h3>
            <p class="text-sm text-gray-600 line-clamp-2 mb-2">
              {{ q.output || 'No answer generated.' }}
            </p>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {{ q.subject || 'Unclassified' }}
            </span>
          </div>
          
          <!-- Timestamp and Buttons block -->
          <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <!-- Timestamp -->
            <div class="text-sm text-gray-500 flex items-center">
              <svg class="mr-1.5 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {{ formatDateFull(q.createdAt) }}
            </div>
            
            <!-- Buttons stacked -->
            <div class="flex flex-col gap-2 w-full sm:w-auto">
              <button 
                @click="openModal(q)"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-1.5 border border-gray-300 rounded text-sm font-medium text-slate-700 bg-white hover:bg-gray-50 focus:outline-none"
              >
                View Answer
              </button>
              <button 
                @click="askAgain(q)"
                class="w-full sm:w-auto inline-flex items-center justify-center px-4 py-1.5 border border-transparent rounded text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none"
              >
                Ask Again
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="hasQuestions" class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6 flex-shrink-0">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Showing <span class="font-medium">{{ questions.length }}</span> of <span class="font-medium">{{ totalCount }}</span> total entries
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button 
                @click="onPageChange(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <button 
                v-for="page in paginationRange" 
                :key="page"
                @click="onPageChange(page)"
                :class="page === currentPage ? 'z-10 bg-slate-50 border-slate-500 text-slate-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'"
                class="relative inline-flex items-center px-4 py-2 border text-sm font-medium"
              >
                {{ page }}
              </button>
              
              <span v-if="totalPages > 5 && currentPage < totalPages - 2" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                ...
              </span>
              
              <button 
                @click="onPageChange(currentPage + 1)" 
                :disabled="currentPage === totalPages || totalPages === 0"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal Overlay -->
    <div v-if="selectedQuestion" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm" @click="closeModal"></div>

      <!-- Modal Content (Wireframe style) -->
      <div class="relative w-full max-w-2xl bg-white border-2 border-dashed border-gray-400 p-6 shadow-sm font-mono text-gray-700">
        
        <!-- Header -->
        <div class="flex justify-between items-center border-b border-gray-300 pb-4 mb-4">
          <h3 class="text-base text-gray-600 font-medium">Question Detail</h3>
          <button @click="closeModal" class="border border-gray-400 rounded px-2 py-1 text-gray-500 hover:bg-gray-100">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Body -->
        <div class="mb-4">
          <div class="text-sm text-gray-500 mb-1">Question:</div>
          <div class="text-base text-gray-800">"{{ selectedQuestion.input }}"</div>
        </div>
        
        <div class="mb-6">
          <div class="text-sm text-gray-500 mb-1">Answer:</div>
          <div class="text-base text-gray-800 whitespace-pre-wrap leading-relaxed">"{{ selectedQuestion.output || 'No answer recorded.' }}"</div>
        </div>
        
        <div class="flex items-center space-x-4 text-sm text-gray-500 mb-6">
          <span>Subject:</span>
          <span class="border border-gray-400 px-2 py-1 rounded text-xs">
            {{ selectedQuestion.subject || 'Unclassified' }}
          </span>
          <span>{{ formatDateFull(selectedQuestion.createdAt) }}</span>
        </div>
        
        <!-- Footer -->
        <div class="flex gap-3">
          <button 
            @click="askAgain(selectedQuestion)"
            class="bg-slate-800 text-white border border-slate-800 px-4 py-2 rounded text-sm hover:bg-slate-700"
          >
            Ask Again
          </button>
          <button 
            @click="closeModal"
            class="bg-white text-gray-700 border border-gray-400 px-4 py-2 rounded text-sm hover:bg-gray-50"
          >
            Close
          </button>
        </div>
        
        <!-- Wireframe note -->
        <div class="mt-4 text-xs text-gray-400 italic">
          Modal dialog - appears as overlay on the history page
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/historyStore'

const router = useRouter()

// --- Refs ---
const questions = ref([])
const isLoading = ref(true)
const fetchError = ref(null)
const currentPage = ref(1)
const totalPages = ref(1)
const totalCount = ref(0)
const subjectFilter = ref('all')
const searchQuery = ref('')
const selectedQuestion = ref(null)

const subjects = [
  { id: 'all', label: 'All' },
  { id: 'Biology', label: 'Biology' },
  { id: 'Chemistry', label: 'Chemistry' },
  { id: 'Physics', label: 'Physics' },
  { id: 'Mathematics', label: 'Math' }
]

// --- Computed ---
const hasQuestions = computed(() => questions.value.length > 0)
const isEmpty = computed(() => !isLoading.value && questions.value.length === 0)

const paginationRange = computed(() => {
  const range = []
  const maxPagesToShow = 5
  let start = Math.max(1, currentPage.value - 2)
  let end = Math.min(totalPages.value, start + maxPagesToShow - 1)
  
  if (end - start + 1 < maxPagesToShow) {
    start = Math.max(1, end - maxPagesToShow + 1)
  }
  
  for (let i = start; i <= end; i++) {
    range.push(i)
  }
  return range
})

const formattedQuestions = computed(() => {
  return questions.value.map(q => ({
    ...q,
    displayDate: formatRelativeTime(q.createdAt)
  }))
})

// --- Utilities ---
const formatRelativeTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].substring(0, 5)
}

const formatDateFull = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toISOString().split('T')[0] + ' ' + date.toTimeString().split(' ')[0].substring(0, 5)
}

// --- Methods ---
const fetchHistory = async (page = 1) => {
  isLoading.value = true
  fetchError.value = null
  
  try {
    // Simulated API call - replace with actual fetch or store action
    // const result = await fetch(`/api/user/history?page=${page}&limit=10&subject=${subjectFilter.value}&search=${searchQuery.value}`)
    // const data = await result.json()
    
    // MOCK DATA GENERATION FOR DEMO
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const mockData = [
      { id: '1', input: 'What is photosynthesis?', output: 'Photosynthesis is the process by which green plants use sunlight to synthesise nutrients from carbon dioxide and water...', subject: 'Biology', createdAt: '2024-11-30T09:15:00Z' },
      { id: '2', input: "Explain Newton's Second Law.", output: "Newton's second law states that the acceleration of an object is directly related to the net force and inversely related to its mass (F=ma).", subject: 'Physics', createdAt: '2024-11-29T14:22:00Z' },
      { id: '3', input: 'What is an atom?', output: 'An atom is the basic building block of all matter, consisting of a nucleus (protons and neutrons) surrounded by electrons.', subject: 'Chemistry', createdAt: '2024-11-29T11:05:00Z' },
      { id: '4', input: 'How does osmosis work?', output: 'Osmosis is the spontaneous net movement of solvent molecules through a selectively permeable membrane into a region of higher solute concentration.', subject: 'Biology', createdAt: '2024-11-28T16:44:00Z' },
      { id: '5', input: 'What is the speed of light?', output: 'The speed of light in a vacuum is exactly 299,792,458 metres per second (approximately 300,000 km/s).', subject: 'Physics', createdAt: '2024-11-27T10:30:00Z' },
      { id: '6', input: 'What is the Pythagorean theorem?', output: 'In a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides (a² + b² = c²).', subject: 'Mathematics', createdAt: '2024-11-26T08:55:00Z' },
    ]
    
    // Apply local filters for the mock
    let filteredData = [...mockData]
    if (subjectFilter.value !== 'all') {
      filteredData = filteredData.filter(q => q.subject === subjectFilter.value)
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      filteredData = filteredData.filter(item => item.input.toLowerCase().includes(q))
    }
    
    questions.value = filteredData
    totalCount.value = filteredData.length > 0 ? 48 : 0 // Mock total
    totalPages.value = Math.ceil(totalCount.value / 10) || 1
    currentPage.value = page
    
  } catch (err) {
    fetchError.value = 'Failed to load question history. Please try again later.'
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

const onPageChange = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    fetchHistory(page)
  }
}

const setSubjectFilter = (id) => {
  subjectFilter.value = id
  fetchHistory(1)
}

const applyFilters = () => {
  fetchHistory(1)
}

const openModal = (question) => {
  selectedQuestion.value = question
}

const closeModal = () => {
  selectedQuestion.value = null
}

const askAgain = (question) => {
  closeModal()
  router.push({ 
    name: 'AskQuestion', 
    query: { subject: question.subject?.toLowerCase(), q: question.input }
  })
}

const exportToCSV = () => {
  if (questions.value.length === 0) return
  
  // Create CSV headers
  const headers = ['Date', 'Subject', 'Question', 'Answer']
  
  // Format rows
  const csvRows = questions.value.map(q => {
    // Escape quotes and wrap in quotes to handle commas/newlines in text
    const date = q.createdAt ? new Date(q.createdAt).toLocaleString() : ''
    const subject = q.subject || 'Unclassified'
    const questionText = q.input ? `"${q.input.replace(/"/g, '""')}"` : '""'
    const answerText = q.output ? `"${q.output.replace(/"/g, '""')}"` : '""'
    
    return `${date},${subject},${questionText},${answerText}`
  })
  
  // Combine headers and rows
  const csvContent = [headers.join(','), ...csvRows].join('\n')
  
  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `scitutor_history_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  
  link.click()
  document.body.removeChild(link)
}

// --- Lifecycle ---
onMounted(() => {
  fetchHistory(1)
})
</script>
