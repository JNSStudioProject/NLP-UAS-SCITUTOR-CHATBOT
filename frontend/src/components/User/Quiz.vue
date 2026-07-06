<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
    <!-- Header -->
    <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end flex-shrink-0 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          Test My Understanding
        </h1>
        <p class="mt-2 text-sm text-slate-600">Answer the following questions based on the AI's explanation.</p>
      </div>
      <button 
        @click="$router.push('/ask')" 
        class="text-sm font-medium text-purple-600 hover:text-purple-800 flex items-center transition-colors"
      >
        <svg class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>
    </div>

    <!-- Reference Material (Collapsible) -->
    <div v-if="referenceAnswer" class="bg-white shadow-sm rounded-lg border border-gray-200 mb-8 overflow-hidden">
      <div 
        @click="showReference = !showReference" 
        class="bg-gray-50 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <h3 class="text-sm font-semibold text-gray-700 flex items-center">
          <svg class="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Reference Material (AI Answer)
        </h3>
        <svg 
          class="h-4 w-4 text-gray-500 transform transition-transform duration-200" 
          :class="{ 'rotate-180': showReference }" 
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      <div v-show="showReference" class="px-4 py-5 sm:p-6 border-t border-gray-100">
        <p class="font-medium text-gray-900 mb-2 italic">Q: "{{ referenceQuestion }}"</p>
        <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
          {{ referenceAnswer }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isGenerating" class="bg-white shadow-sm rounded-lg border border-purple-100 px-4 py-16 flex flex-col items-center justify-center space-y-4">
       <svg class="animate-spin h-10 w-10 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
         <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
         <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
       </svg>
       <p class="text-base font-medium text-purple-600 animate-pulse">The AI is composing a smart quiz for you...</p>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="quizData" class="space-y-6">
      <div v-if="quizScore !== null" class="bg-white p-6 rounded-xl shadow-sm border mb-8 flex flex-col items-center"
           :class="quizScore === 100 ? 'border-green-200' : (quizScore >= 60 ? 'border-yellow-200' : 'border-red-200')">
        <h2 class="text-xl font-bold mb-2 text-gray-800">Your Final Score</h2>
        <div class="text-5xl font-black mb-4" 
             :class="quizScore === 100 ? 'text-green-500' : (quizScore >= 60 ? 'text-yellow-500' : 'text-red-500')">
          {{ quizScore }}
        </div>
        <p class="text-gray-600 text-center font-medium">
          {{ quizScore === 100 ? 'Awesome! You understand this material very well.' : 
             (quizScore >= 60 ? 'Good job! But there are still some details missed.' : 'Do not give up! Try reading the explanation carefully again.') }}
        </p>
      </div>

      <div v-for="(q, index) in quizData" :key="index" class="bg-white p-6 rounded-xl shadow-sm border border-purple-50">
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

      <div class="mt-8 flex justify-end pb-12">
        <button
          v-if="quizScore === null"
          type="button"
          @click="checkAnswers"
          :disabled="quizAnswers.includes(null)"
          class="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Submit Answers
        </button>
        <button
          v-else
          type="button"
          @click="$router.push('/ask')"
          class="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          Ask Another Topic
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// State from previous page
const referenceQuestion = ref('')
const referenceAnswer = ref('')
const showReference = ref(false)

// Quiz State
const isGenerating = ref(true)
const quizData = ref(null)
const quizAnswers = ref([null, null, null])
const quizScore = ref(null)

onMounted(() => {
  // Try to get data from history state (passed via router.push)
  if (history.state && history.state.question) {
    referenceQuestion.value = history.state.question
    referenceAnswer.value = history.state.answer
  } else {
    // Fallback if accessed directly
    referenceQuestion.value = 'Apa itu fotosintesis?'
    referenceAnswer.value = 'Fotosintesis adalah proses tumbuhan membuat makanannya sendiri menggunakan cahaya matahari.'
  }

  // Simulate short loading time for effect, then generate dynamic quiz
  setTimeout(() => {
    quizData.value = generateDynamicQuiz(referenceAnswer.value)
    isGenerating.value = false
  }, 1500)
})

const generateDynamicQuiz = (text) => {
  if (!text || text.trim().length < 10) {
    return fallbackQuiz()
  }

  // 1. Clean the text: remove meta prefixes like "answer:" or "the answer is:"
  let cleanText = text.replace(/^(answer:?|the answer is:?)\s*/i, '').trim()

  // 2. Split into sentences
  let sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText]
  
  // 3. Select up to 3 viable sentences
  let selectedSentences = sentences
    .filter(s => s.trim().length > 15) // Minimum length to be a good question
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    
  if (selectedSentences.length === 0) {
    selectedSentences = [cleanText]
  }
  
  // Fallback generic distractors in case text is too short
  const genericDistractors = ['energy', 'protons', 'matter', 'gravity', 'cells', 'reaction', 'temperature', 'force', 'oxygen', 'molecules']
  const blacklistedWords = ['answer', 'question', 'which', 'there', 'their', 'these', 'those', 'where', 'called', 'about', 'would', 'could', 'should']
  
  // Extract all valid words from the text as potential distractors
  const allWords = cleanText.replace(/[^a-zA-Z]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 4 && !blacklistedWords.includes(w.toLowerCase()))
  
  const generatedQuiz = []

  // Type 1: Main Concept Extraction
  if (allWords.length > 0) {
    const wordCounts = {}
    allWords.forEach(w => wordCounts[w.toLowerCase()] = (wordCounts[w.toLowerCase()] || 0) + 1)
    const sortedWords = Object.keys(wordCounts).sort((a, b) => wordCounts[b] - wordCounts[a])
    const mainConcept = sortedWords[0]
    
    let distractors = new Set()
    for (const gd of genericDistractors) {
      if (distractors.size >= 3) break
      if (gd !== mainConcept && !cleanText.toLowerCase().includes(gd.toLowerCase())) {
        distractors.add(gd)
      }
    }
    
    // Fill remaining with random words if needed
    for (const rw of allWords) {
      if (distractors.size >= 3) break
      if (rw.toLowerCase() !== mainConcept && !distractors.has(rw.toLowerCase())) {
        distractors.add(rw.toLowerCase())
      }
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

  // Type 2: Fact Checking (Comprehension)
  if (sentences.length > 0) {
    // Pick the longest sentence
    const validSentences = [...sentences].sort((a, b) => b.length - a.length)
    const factSentence = validSentences[0].trim()
    
    if (factSentence.length > 20) {
      const fakeSentences = [
        "Mitochondria is the primary powerhouse of a cell.",
        "Gravity pulls objects towards the center of mass.",
        "Chemical bonds are formed by sharing electrons.",
        "The Earth revolves around the Sun in an elliptical orbit.",
        "Friction is a force that opposes motion.",
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

  // Type 3: Cloze Test (Fill-in-the-blank)
  if (sentences.length > 1) {
    // Pick a different sentence than the fact-checking one if possible
    const clozeSentence = sentences[sentences.length > 2 ? 1 : sentences.length - 1].trim()
    const wordsInSentence = clozeSentence.replace(/[^a-zA-Z]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 4 && !blacklistedWords.includes(w.toLowerCase()))
    
    if (wordsInSentence.length > 0) {
      const targetWord = wordsInSentence[Math.floor(Math.random() * wordsInSentence.length)]
      const regex = new RegExp(`\\b${targetWord}\\b`, 'i')
      const question = clozeSentence.replace(regex, '_____')
      
      let distractors = new Set()
      for (let i = 0; i < 30; i++) {
        const rw = allWords[Math.floor(Math.random() * allWords.length)]
        if (rw && rw.toLowerCase() !== targetWord.toLowerCase() && !clozeSentence.toLowerCase().includes(rw.toLowerCase())) {
          distractors.add(rw.toLowerCase())
        }
      }
      for (const gd of genericDistractors) {
        if (distractors.size >= 3) break
        if (gd !== targetWord.toLowerCase() && !clozeSentence.toLowerCase().includes(gd.toLowerCase())) distractors.add(gd)
      }
      
      const options = [targetWord.toLowerCase(), ...Array.from(distractors)].slice(0, 4).sort(() => 0.5 - Math.random())
      
      if (options.length === 4) {
        generatedQuiz.push({
          question: question,
          options: options,
          correctAnswer: options.indexOf(targetWord.toLowerCase())
        })
      }
    }
  }
  
  // Initialize quiz answers array with nulls
  quizAnswers.value = generatedQuiz.map(() => null)
  
  return generatedQuiz
}

const fallbackQuiz = () => {
  quizAnswers.value = [null, null, null]
  return [
    {
      question: 'Teks jawaban terlalu pendek untuk dianalisis.',
      options: ['Opsi 1', 'Opsi 2', 'Opsi 3', 'Opsi 4'],
      correctAnswer: 0
    }
  ]
}

const checkAnswers = () => {
  let correctCount = 0
  quizData.value.forEach((q, idx) => {
    if (quizAnswers.value[idx] === q.correctAnswer) {
      correctCount++
    }
  })
  quizScore.value = Math.round((correctCount / quizData.value.length) * 100)
  // Auto-expand reference when showing results
  showReference.value = true
}
</script>
