<template>
  <div class="bg-white min-h-screen flex flex-col">
    <!-- Hero / Banner Section -->
    <div class="relative bg-slate-900 text-white overflow-hidden py-20 lg:py-28">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <!-- Hero Image Placeholder -->
        <div class="mx-auto h-28 w-28 bg-slate-800 rounded-full flex items-center justify-center mb-8 border-4 border-slate-700 shadow-2xl">
          <span class="text-5xl text-slate-300">🧠</span>
        </div>
        
        <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
          Science Learning Question Answering System
        </h1>
        <p class="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
          Ask any science-related question in natural language and receive instant answers powered by the T5 Transformer NLP model.
        </p>
        
        <button
          @click="$router.push({ name: 'AskQuestion' })"
          class="inline-flex items-center px-8 py-3.5 border border-transparent text-base font-semibold rounded-md text-slate-900 bg-white hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
        >
          <svg class="mr-2.5 -ml-1 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
          </svg>
          Start Asking
        </button>
      </div>
      
      <!-- Decorative background elements -->
      <div class="absolute top-0 left-1/2 transform -translate-x-1/2 w-full overflow-hidden opacity-10 pointer-events-none">
        <svg viewBox="0 0 1024 1024" class="absolute top-1/2 left-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
          <circle cx="512" cy="512" r="512" fill="url(#gradient)" fill-opacity="0.7" />
          <defs>
            <radialGradient id="gradient">
              <stop stop-color="#ffffff" />
              <stop offset="1" stop-color="#ffffff" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>

    <!-- Subject Category Cards Section -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
      <div class="border-b border-gray-200 pb-3 mb-10 flex items-center justify-between">
        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Supported Science Subjects</h2>
      </div>
      
      <!-- Responsive 2x2 grid on mobile, 4x1 on desktop -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div 
          v-for="card in cards" 
          :key="card.id"
          @click="onCardClick(card)"
          @mouseenter="onCardHover(card.id)"
          @mouseleave="onCardLeave"
          class="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all duration-300 group relative overflow-hidden flex flex-col items-center text-center h-full hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          :class="hoveredCard === card.id ? 'border-slate-400 ring-1 ring-slate-400 transform -translate-y-1' : ''"
          tabindex="0"
          @keydown.enter="onCardClick(card)"
        >
          <!-- Hover Gradient Background -->
          <div 
            class="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300 pointer-events-none" 
            :class="getGradientClass(card.color)"
          ></div>
          
          <div class="text-4xl mb-4 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
            {{ card.icon }}
          </div>
          <h3 class="text-lg sm:text-xl font-semibold text-slate-900 mb-2 transition-colors group-hover:text-slate-700">
            {{ card.label }}
          </h3>
          <p class="text-xs sm:text-sm text-gray-500 mt-auto hidden sm:block">
            {{ card.description }}
          </p>
          <div class="mt-4 text-[10px] sm:text-xs text-slate-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
            Explore {{ card.label }} <span class="ml-1">→</span>
          </div>
        </div>
      </div>
    </div>

    <!-- How It Works Section -->
    <div class="bg-slate-50 py-16 border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="border-b border-gray-200 pb-3 mb-12">
          <h2 class="text-sm font-bold text-slate-500 uppercase tracking-widest">How It Works</h2>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-10">
          <!-- Step 1 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 pt-10 text-center relative hover:shadow-md transition-shadow">
            <div class="mx-auto w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg mb-4 bg-white absolute -top-5 left-1/2 transform -translate-x-1/2 shadow-sm">
              1
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Type Your Question</h3>
            <p class="text-gray-500 text-sm">Enter any science question in natural language.</p>
          </div>
          
          <!-- Step 2 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 pt-10 text-center relative hover:shadow-md transition-shadow">
            <div class="mx-auto w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg mb-4 bg-white absolute -top-5 left-1/2 transform -translate-x-1/2 shadow-sm">
              2
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">AI Processing</h3>
            <p class="text-gray-500 text-sm">T5 Transformer model analyses the query.</p>
          </div>
          
          <!-- Step 3 -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 pt-10 text-center relative hover:shadow-md transition-shadow">
            <div class="mx-auto w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg mb-4 bg-white absolute -top-5 left-1/2 transform -translate-x-1/2 shadow-sm">
              3
            </div>
            <h3 class="text-lg font-bold text-slate-900 mb-2">Get Your Answer</h3>
            <p class="text-gray-500 text-sm">Instant, accurate answer is displayed.</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Simple Footer to match wireframe -->
    <footer class="bg-white border-t border-gray-200 py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-center items-center text-xs text-gray-500">
        <p>© 2024 Science QA System — T5 Transformer NLP</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 2A: Subject Cards Data Schema
const cards = [
  {
    id:          'biology',
    label:       'Biology',
    icon:        '🧬',
    description: 'Cells, genetics, ecosystems, and evolution',
    color:       'accent-purple',
    route:       { name: 'AskQuestion', query: { subject: 'biology' } }
  },
  {
    id:          'chemistry',
    label:       'Chemistry',
    icon:        '🧪',
    description: 'Atoms, reactions, bonds, and molecular structure',
    color:       'accent-green',
    route:       { name: 'AskQuestion', query: { subject: 'chemistry' } }
  },
  {
    id:          'physics',
    label:       'Physics',
    icon:        '⚛️',
    description: 'Mechanics, thermodynamics, waves, and electromagnetism',
    color:       'accent-blue',
    route:       { name: 'AskQuestion', query: { subject: 'physics' } }
  },
  {
    id:          'mathematics',
    label:       'Mathematics',
    icon:        '∑', // Sigma symbol based on wireframe
    description: 'Algebra, calculus, geometry, and statistics',
    color:       'accent-orange',
    route:       { name: 'AskQuestion', query: { subject: 'mathematics' } }
  }
]

// 2B: HomeView Reactive State
const hoveredCard = ref(null)

// Methods
const onCardClick = (card) => {
  router.push(card.route)
}

const onCardHover = (id) => {
  hoveredCard.value = id
}

const onCardLeave = () => {
  hoveredCard.value = null
}

const getGradientClass = (color) => {
  const map = {
    'accent-blue': 'from-blue-400 to-blue-700',
    'accent-green': 'from-emerald-400 to-emerald-700',
    'accent-purple': 'from-purple-400 to-purple-700',
    'accent-orange': 'from-amber-400 to-amber-700',
  }
  return map[color] || 'from-slate-400 to-slate-700'
}
</script>
