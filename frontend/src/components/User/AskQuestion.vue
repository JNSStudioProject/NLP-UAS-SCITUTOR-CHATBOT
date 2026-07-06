<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">Ask a Science Question</h1>
      <p class="mt-2 text-sm text-gray-600">Type your question below and receive an AI-generated answer</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column: Input and Response -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Question Input Area -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div class="px-4 py-5 sm:p-6">
            <label for="question" class="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <div class="mt-1">
              <textarea
                id="question"
                name="question"
                rows="6"
                class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border resize-y"
                placeholder="Ask a science question..."
                v-model="inputText"
                :disabled="isSubmitting"
              ></textarea>
            </div>
            
            <!-- Gatekeeper Progress Bar -->
            <div class="mt-4">
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-medium text-gray-500" :class="gatekeeperState.progressColor === 'red' ? 'text-red-600' : ''">
                  {{ gatekeeperState.progressLabel.replace('{estimatedTokens}', estimatedTokens.toString()).replace('{remaining}', tokenBudgetRemaining.toString()) }}
                </span>
                <span class="text-xs text-gray-400">{{ charCount }} / 500 characters</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                <div 
                  class="h-2 rounded-full transition-all duration-300 ease-in-out"
                  :class="progressBar.colorClass"
                  :style="{ width: progressBar.width }"
                ></div>
              </div>
              <p v-if="gatekeeperState.feedbackMsg" class="text-xs" :class="gatekeeperState.progressColor === 'red' ? 'text-red-600 font-semibold' : 'text-amber-600'">
                {{ gatekeeperState.feedbackMsg.replace('{overflow}', gatekeeperState.overflow?.toString() || '0') }}
              </p>
            </div>

            <div class="mt-5 flex justify-end">
              <button
                type="button"
                @click="handleSubmit"
                :disabled="isSubmitDisabled"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                :class="isSubmitDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700'"
              >
                <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isSubmitting ? 'Processing...' : 'Submit Question' }}
              </button>
            </div>
            
            <!-- Error Alert -->
            <div v-if="apiError" class="mt-4 p-4 bg-red-50 rounded-md border border-red-200">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <h3 class="text-sm font-medium text-red-800">Submission Error</h3>
                  <div class="mt-2 text-sm text-red-700">
                    <p>{{ apiError }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Answer Display Section (After Submission) -->
        <div v-if="apiResponse" class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden transition-all duration-500 ease-in-out">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <h3 class="text-xs font-semibold text-gray-500 tracking-wider uppercase">Generated Answer</h3>
          </div>
          <div class="px-4 py-5 sm:p-6">
            <div class="mb-4">
              <h4 class="text-sm font-medium text-gray-500 mb-1">Question:</h4>
              <p class="text-base text-gray-900 italic">"{{ submittedQuestion }}"</p>
            </div>
            
            <div class="mb-6">
              <h4 class="text-sm font-medium text-gray-500 mb-2">Answer:</h4>
              <div class="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
                {{ apiResponse }}
              </div>
              <p class="mt-2 text-xs text-gray-400 italic">T5 model output — displayed as plain text below the question</p>
            </div>
            
            <div class="flex items-center space-x-2 text-sm border-t border-gray-100 pt-4">
              <span class="text-gray-500">Subject Category:</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                {{ selectedSubject || 'Unclassified' }}
              </span>
              <span class="text-xs text-gray-400 ml-2">Auto-classified by model</span>
            </div>
            
            <div class="mt-4 flex items-center space-x-4 text-xs text-gray-400">
              <span v-if="latencyMs" title="Latency">⏱ {{ latencyMs }}ms latency</span>
              <span v-if="serverTokensUsed" title="Tokens used">🪙 {{ serverTokensUsed }} tokens used</span>
            </div>
          </div>
          
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex flex-wrap gap-3">
            <button
              type="button"
              @click="resetForm"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Ask Another Question
            </button>
            <button
              type="button"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Save to History
            </button>
            <button
              type="button"
              @click="copyAnswer"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
            >
              Copy Answer
            </button>
            <button
              v-if="apiResponse"
              type="button"
              @click="generateQuiz"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors ml-auto"
            >
              🧠 Test Understanding
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column: Sidebar Panels -->
      <div class="space-y-6">
        <!-- Example Questions Panel -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 class="text-xs font-semibold text-gray-500 tracking-wider uppercase">Try These Examples</h3>
          </div>
          <div class="p-3">
            <ul class="space-y-2">
              <li v-for="(example, index) in exampleQuestions" :key="index">
                <button
                  @click="fillExample(example)"
                  class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-slate-50 border border-dashed border-gray-300 rounded-md transition-colors group flex items-start"
                >
                  <span class="text-gray-400 group-hover:text-slate-600 mr-2 mt-0.5">→</span>
                  <span>{{ example }}</span>
                </button>
              </li>
            </ul>
            <p class="mt-3 text-xs text-gray-400 italic text-center">Clicking an example auto-fills the question input</p>
          </div>
        </div>

        <!-- Subject Filter (Optional) -->
        <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div class="border-b border-gray-200 bg-gray-50 px-4 py-3">
            <h3 class="text-xs font-semibold text-gray-500 tracking-wider uppercase">Filter by Subject</h3>
          </div>
          <div class="p-4 grid grid-cols-2 gap-2">
            <button
              v-for="subject in subjects"
              :key="subject.id"
              @click="setSubject(subject)"
              class="px-3 py-2 text-sm font-medium rounded-md border transition-colors text-center"
              :class="isSelectedSubject(subject) ? 'bg-gray-200 border-gray-400 text-gray-900 shadow-inner' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
            >
              {{ subject.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePredictStore } from '@/stores/predictStore'
import questionsData from '@/assets/questions.json'

// --- Store and Router ---
const route = useRoute()
const router = useRouter()
// Using optional chaining or try/catch in case store is not yet implemented
let predictStore
try {
  predictStore = usePredictStore()
} catch (e) {
  // Mock store for layout visualization if Pinia is missing
  predictStore = { 
    submitQuestion: async () => new Promise(res => setTimeout(res, 1000)),
    lastResult: { output: 'Mocked response.', tokensUsed: 15 },
    error: null,
    clearResult: () => {}
  }
}

// --- 3A: Reactive State (Refs) ---
const inputText = ref('')
const selectedSubject = ref('')
const isSubmitting = ref(false)
const apiResponse = ref(null)
const apiError = ref(null)
const latencyMs = ref(null)
const serverTokensUsed = ref(null)
const submittedQuestion = ref('') // Stores the question that was actually submitted

// --- Data for UI ---
const exampleQuestions = ref([])

const refreshExampleQuestions = () => {
  let filtered = questionsData
  if (selectedSubject.value) {
    filtered = questionsData.filter(q => q.subject === selectedSubject.value)
    if (filtered.length === 0) filtered = questionsData
  }
  
  const shuffled = [...filtered].sort(() => 0.5 - Math.random())
  exampleQuestions.value = shuffled.slice(0, 6).map(q => q.question)
}

onMounted(() => {
  refreshExampleQuestions()
  
  if (predictStore && predictStore.lastResult) {
    inputText.value = predictStore.lastInput || ''
    apiResponse.value = predictStore.lastResult.output || ''
    submittedQuestion.value = predictStore.lastInput || ''
    serverTokensUsed.value = predictStore.lastResult.tokensUsed || null
    latencyMs.value = predictStore.lastResult.latencyMs || null
  }
})

const subjects = [
  { id: 'all', label: 'All' },
  { id: 'biology', label: 'Biology' },
  { id: 'chemistry', label: 'Chemistry' },
  { id: 'physics', label: 'Physics' },
  { id: 'mathematics', label: 'Mathematics' }
]

// --- 3B: Token Gatekeeper Core Logic ---
const TOKEN_MULTIPLIER = 1.3
const HARD_LIMIT = 42
const WARN_THRESHOLD = 34
const CAUTION_THRESHOLD = 25

const wordCount = computed(() => {
  const trimmed = inputText.value.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
})

const charCount = computed(() => inputText.value.length)

const estimatedTokens = computed(() => Math.ceil(wordCount.value * TOKEN_MULTIPLIER))

const tokenBudgetRemaining = computed(() => Math.max(0, HARD_LIMIT - estimatedTokens.value))

const tokenUsagePercent = computed(() => Math.min(100, Math.round((estimatedTokens.value / HARD_LIMIT) * 100)))

// --- 3C: Gatekeeper State Machine ---
const gatekeeperState = computed(() => {
  const tokens = estimatedTokens.value
  const loading = isSubmitting.value
  
  if (loading) {
    return {
      submitBlocked: true,
      blockReason: 'REQUEST_IN_FLIGHT',
      progressColor: 'blue',
      progressLabel: 'Processing...',
      feedbackMsg: null
    }
  }
  
  if (inputText.value.trim() === '') {
    return {
      submitBlocked: true,
      blockReason: 'EMPTY_INPUT',
      progressColor: 'neutral',
      progressLabel: '0 / 42 tokens',
      feedbackMsg: null
    }
  }
  
  if (tokens >= HARD_LIMIT) {
    return {
      submitBlocked: true,
      blockReason: 'TOKEN_LIMIT_EXCEEDED',
      progressColor: 'red',
      progressLabel: '{estimatedTokens} / 42 — LIMIT EXCEEDED',
      feedbackMsg: 'Question too long. Remove {overflow} word(s) to continue.',
      overflow: tokens - HARD_LIMIT
    }
  }
  
  if (tokens >= WARN_THRESHOLD) {
    return {
      submitBlocked: false,
      blockReason: null,
      progressColor: 'orange',
      progressLabel: '{estimatedTokens} / 42 tokens — {remaining} left!',
      feedbackMsg: 'Almost at the limit. Shorten your question.'
    }
  }
  
  if (tokens >= CAUTION_THRESHOLD) {
    return {
      submitBlocked: false,
      blockReason: null,
      progressColor: 'yellow',
      progressLabel: '{estimatedTokens} / 42 tokens — {remaining} remaining',
      feedbackMsg: 'Getting close to the limit. Try to be concise.'
    }
  }
  
  // SAFE State
  return {
    submitBlocked: false,
    blockReason: null,
    progressColor: 'green',
    progressLabel: '{estimatedTokens} / 42 tokens',
    feedbackMsg: null
  }
})

// --- 3D: Master Submit Disabled State ---
const isSubmitDisabled = computed(() => gatekeeperState.value.submitBlocked === true)

// --- 3E: Progress Bar Computed Properties ---
const progressBar = computed(() => {
  const colorMap = {
    'neutral': 'bg-gray-300',
    'green': 'bg-green-500',
    'yellow': 'bg-yellow-400',
    'orange': 'bg-orange-500',
    'red': 'bg-red-500 animate-pulse',
    'blue': 'bg-blue-500 animate-pulse'
  }
  
  return {
    width: `${tokenUsagePercent.value}%`,
    colorClass: colorMap[gatekeeperState.value.progressColor] || 'bg-gray-300',
    animate: gatekeeperState.value.progressColor === 'red' || gatekeeperState.value.progressColor === 'blue'
  }
})

// --- 3F: Word Overflow Highlight (Logic implemented, ready for future template usage) ---
const overflowWordIndex = computed(() => {
  const words = inputText.value.trim().split(/\s+/)
  const safeWordCount = Math.floor(HARD_LIMIT / TOKEN_MULTIPLIER)
  return {
    safeWords: words.slice(0, safeWordCount),
    overflowWords: words.slice(safeWordCount),
    overflowCount: Math.max(0, words.length - safeWordCount)
  }
})

// --- 3G: Form Submit Action Blueprint ---
const handleSubmit = async () => {
  if (isSubmitDisabled.value) return
  
  isSubmitting.value = true
  apiError.value = null
  apiResponse.value = null
  submittedQuestion.value = inputText.value
  
  const startTime = Date.now()
  
  try {
    await predictStore.submitQuestion({ input: inputText.value })
    latencyMs.value = Date.now() - startTime
    
    // Check results from store
    if (predictStore.lastResult) {
      apiResponse.value = predictStore.lastResult.output || 'Response generated successfully.'
      serverTokensUsed.value = predictStore.lastResult.tokensUsed || estimatedTokens.value
    } else {
      // Fallback
      apiResponse.value = 'Response received, but format was unexpected.'
      serverTokensUsed.value = estimatedTokens.value
    }
  } catch (error) {
    const status = error.response?.status || error.status
    
    if (status === 422) {
      apiError.value = 'INPUT_TOKEN_LIMIT_EXCEEDED'
    } else if (status === 503) {
      apiError.value = 'MODEL_BUSY — try again in a moment'
    } else if (status === 429) {
      apiError.value = 'RATE_LIMIT — wait before submitting again'
    } else {
      apiError.value = predictStore.error || error.message || 'An unexpected error occurred communicating with the API.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// --- Methods ---
const fillExample = (text) => {
  inputText.value = text
  inputText.value = text // Trigger reactivity
}

const resetForm = () => {
  inputText.value = ''
  apiResponse.value = null
  apiError.value = null
  if (typeof predictStore.clearResult === 'function') {
    predictStore.clearResult()
  }
}

const copyAnswer = async () => {
  if (apiResponse.value && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(apiResponse.value)
      // Visual feedback could be added here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
}

const setSubject = (subject) => {
  selectedSubject.value = subject.id === 'all' ? '' : subject.label
  refreshExampleQuestions()
}

const isSelectedSubject = (subject) => {
  if (subject.id === 'all') return selectedSubject.value === ''
  return selectedSubject.value === subject.label
}

// --- 3H: Watchers ---
watch(inputText, (newVal) => {
  // Reset apiResponse and apiError to null on new input (clear stale results)
  // Only if the new input is actually different from what was just submitted/restored
  if (newVal !== submittedQuestion.value) {
    if (apiResponse.value || apiError.value) {
      apiResponse.value = null
      apiError.value = null
    }
  }
}, { immediate: false })

// --- Quiz Logic ---
const generateQuiz = () => {
  router.push({
    name: 'Quiz',
    state: {
      question: submittedQuestion.value,
      answer: apiResponse.value
    }
  })
}

watch(() => route?.query?.subject, (newSubject) => {
  if (newSubject) {
    selectedSubject.value = newSubject.toString()
    refreshExampleQuestions()
  }
}, { immediate: true })

</script>
