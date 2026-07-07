<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
    <!-- Header (Bagian Atas Halaman) -->
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end flex-shrink-0 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          Global Understanding Quiz
        </h1>
        <p class="mt-2 text-sm text-slate-600">Answer questions based on your search history.</p>
      </div>
      <button 
        @click="$router.push('/')" 
        class="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center transition-colors"
      >
        <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>
    </div>

    <!-- Tampilan Loading (Proses Pemuatan) -->
    <div v-if="isGenerating" class="w-full flex-1 flex flex-col items-center justify-center">
      <div class="max-w-4xl w-full mx-auto bg-white shadow-sm rounded-lg border border-purple-100 px-4 py-16 flex flex-col items-center justify-center space-y-4">
         <svg class="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
           <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
           <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
         </svg>
         <p class="text-base font-medium text-purple-600 animate-pulse">Preparing a quiz from your history...</p>
      </div>
    </div>

    <!-- Tampilan Kosong (Riwayat Belum Ada) -->
    <div v-else-if="quizData.length === 0" class="w-full flex-1 flex flex-col items-center justify-center">
      <div class="max-w-4xl w-full mx-auto bg-white shadow-sm rounded-lg border border-gray-200 px-4 py-16 flex flex-col items-center justify-center text-center">
         <span class="text-5xl mb-4">📭</span>
         <h2 class="text-xl font-bold text-gray-800 mb-2">Empty History</h2>
         <p class="text-gray-600">You don't have any question history to make a quiz.</p>
         <button @click="$router.push('/ask')" class="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">Start Asking</button>
      </div>
    </div>

    <!-- Konten Kuis -->
    <div v-else class="w-full flex-1 flex flex-col">
      <div class="max-w-4xl mx-auto w-full space-y-6">
      
      <!-- Tampilan Nilai -->
      <div v-if="quizScore !== null" class="bg-white p-6 rounded-xl shadow-sm border mb-8 flex flex-col items-center transition-all duration-500"
           :class="quizScore === 100 ? 'border-green-200 bg-green-50' : (quizScore >= 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50')">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Final Score For This Session</h2>
        <div class="text-5xl font-black mb-4" 
             :class="quizScore === 100 ? 'text-green-500' : (quizScore >= 60 ? 'text-yellow-500' : 'text-red-500')">
          {{ quizScore }}
        </div>
        <p class="text-gray-600 text-center font-medium mb-6">
          You answered {{ correctCount }} out of {{ quizData.length }} questions correctly.
        </p>
        
        <div v-if="!isLastBatch" class="w-full flex justify-center">
          <button @click="nextBatch" class="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-md transition-colors text-lg flex items-center">
            Next 30 Questions
            <svg class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <div v-else class="w-full flex justify-center">
           <div class="px-6 py-4 bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-center">
             Awesome! You have completed all questions from your history!
           </div>
        </div>
      </div>

      <!-- Daftar Pertanyaan -->
      <div v-for="(q, index) in quizData" :key="index" class="bg-white p-6 rounded-xl shadow-sm border border-purple-50 flex flex-col">
        <h3 class="font-semibold text-gray-900 text-lg mb-4">
          <span class="text-purple-600 mr-1">{{ index + 1 }}.</span> {{ q.question }}
        </h3>
        <div class="space-y-3">
          <label 
            v-for="(option, oIndex) in q.options" 
            :key="oIndex"
            class="flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200"
            :class="[
              quizAnswers[index] === oIndex && quizScore === null ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50',
              quizScore !== null && oIndex === q.correctAnswer ? 'border-green-500 bg-green-50 shadow-sm' : '',
              quizScore !== null && quizAnswers[index] === oIndex && oIndex !== q.correctAnswer ? 'border-red-500 bg-red-50' : '',
              quizScore !== null ? 'cursor-default' : ''
            ]"
          >
            <div class="flex items-center h-5">
              <input 
                type="radio" 
                :name="'question-' + index" 
                :value="oIndex"
                v-model="quizAnswers[index]"
                :disabled="quizScore !== null"
                class="focus:ring-purple-500 h-5 w-5 text-purple-600 border-gray-300"
              />
            </div>
            <div class="ml-4 text-base">
              <span class="text-gray-700" :class="{ 'font-bold text-green-700': quizScore !== null && oIndex === q.correctAnswer }">{{ option }}</span>
            </div>
          </label>
        </div>
      </div>

      <div v-if="quizScore === null" class="mt-8 flex justify-end pb-12 sticky bottom-4">
        <div class="bg-white p-4 rounded-xl shadow-lg border border-purple-100 flex items-center justify-between w-full max-w-lg">
          <div class="text-sm font-medium text-gray-600">
            Answered: {{ quizAnswers.filter(a => a !== null).length }} / {{ quizData.length }}
          </div>
          <button
            type="button"
            @click="checkAnswers"
            :disabled="quizAnswers.includes(null) || quizData.length === 0"
            class="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Submit Answers
          </button>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHistoryStore } from '@/stores/historyStore'

const router = useRouter()
const historyStore = useHistoryStore()

// State (Variabel Reaktif)
const isGenerating = ref(true)
const currentPage = ref(0)
const quizData = ref([])
const quizAnswers = ref([])
const quizScore = ref(null)
const correctCount = ref(0)

const isLastBatch = computed(() => {
  return (currentPage.value + 1) * 30 >= historyStore.questions.length
})

onMounted(async () => {
  await historyStore.fetchHistory()
  loadBatch()
})

const loadBatch = () => {
  isGenerating.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
  
  setTimeout(() => {
    const allHistory = historyStore.questions
    const batch = allHistory.slice(currentPage.value * 30, (currentPage.value + 1) * 30)
    
    quizData.value = []
    
    batch.forEach(item => {
       const questions = generateDynamicQuiz(item.output || item.input)
       if (questions && questions.length > 0) {
         // Ambil pertanyaan pertama yang valid dari riwayat ini
         quizData.value.push(questions[0])
       }
    })
    
    quizAnswers.value = quizData.value.map(() => null)
    quizScore.value = null
    correctCount.value = 0
    isGenerating.value = false
  }, 1000)
}

const nextBatch = () => {
  if (!isLastBatch.value) {
    currentPage.value++
    loadBatch()
  }
}

const checkAnswers = () => {
  let correct = 0
  quizData.value.forEach((q, index) => {
    if (quizAnswers.value[index] === q.correctAnswer) {
      correct++
    }
  })
  
  correctCount.value = correct
  quizScore.value = Math.round((correct / quizData.value.length) * 100) || 0
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Gunakan ulang logika pembuat kuis yang sama persis seperti di Quiz.vue
const generateDynamicQuiz = (text) => {
  if (!text || text.trim().length < 10) return []

  let cleanText = text.replace(/^(answer:?|the answer is:?)\s*/i, '').trim()
  let sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]
  
  const genericDistractors = ['energy', 'protons', 'matter', 'gravity', 'cells', 'reaction', 'temperature', 'force', 'oxygen', 'molecules']
  const blacklistedWords = ['answer', 'question', 'which', 'there', 'their', 'these', 'those', 'where', 'called', 'about', 'would', 'could', 'should']
  
  const allWords = cleanText.replace(/[^a-zA-Z]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !blacklistedWords.includes(w.toLowerCase()))
  
  const generatedQuiz = []

  // Tipe 1: Ekstraksi Konsep Utama
  if (allWords.length > 0) {
    const wordCounts = {}
    allWords.forEach(w => wordCounts[w.toLowerCase()] = (wordCounts[w.toLowerCase()] || 0) + 1)
    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a])
    const mainConcept = sortedWords[0]
    
    let distractors = new Set()
    for (const gd of genericDistractors) {
      if (distractors.size >= 3) break
      if (gd !== mainConcept && !cleanText.toLowerCase().includes(gd.toLowerCase())) distractors.add(gd)
    }
    
    for (const rw of allWords) {
      if (distractors.size >= 3) break
      if (rw.toLowerCase() !== mainConcept && !distractors.has(rw.toLowerCase())) distractors.add(rw.toLowerCase())
    }

    const options = [mainConcept, ...Array.from(distractors)].slice(0, 4).sort(() => 0.5 - Math.random())
    
    if (options.length === 4) {
      generatedQuiz.push({
        question: "Based on SciTutor's explanation, what is the core concept being discussed?",
        options: options,
        correctAnswer: options.indexOf(mainConcept)
      })
    }
  }

  // Tipe 2: Pemeriksaan Fakta
  if (sentences.length > 0) {
    const validSentences = [...sentences].sort((a, b) => b.length - a.length)
    const factSentence = validSentences[0].trim()
    
    if (factSentence.length > 20) {
      const fakeSentences = [
        "Mitochondria is the primary powerhouse of a cell.",
        "Gravity pulls objects towards the center of mass.",
        "Chemical bonds are formed by sharing electrons.",
        "DNA carries the genetic instructions for life."
      ].sort(() => 0.5 - Math.random())
      
      const options = [factSentence, ...fakeSentences.slice(0, 3)].sort(() => 0.5 - Math.random())
      generatedQuiz.push({
        question: "Which of the following statements is a FACT directly supported by SciTutor's explanation?",
        options: options,
        correctAnswer: options.indexOf(factSentence)
      })
    }
  }

  return generatedQuiz.sort(() => 0.5 - Math.random())
}
</script>
