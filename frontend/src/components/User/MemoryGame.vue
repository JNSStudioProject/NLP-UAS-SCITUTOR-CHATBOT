<template>
  <div class="w-full h-full flex flex-col">
    <!-- Game Header -->
    <div class="w-full flex flex-col md:flex-row justify-between items-start md:items-end flex-shrink-0 gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          Neuro-Match Challenge
        </h1>
        <p class="mt-2 text-sm text-slate-600">Find the matching Question and Answer pairs before time runs out!</p>
      </div>
      
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-6 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
          <!-- Timer -->
          <div class="flex flex-col items-center">
            <span class="text-xs font-bold uppercase tracking-wider" :class="timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-400'">Time</span>
            <span class="text-xl font-black" :class="timeLeft <= 10 ? 'text-red-600' : 'text-slate-700'">00:{{ timeLeft.toString().padStart(2, '0') }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Moves</span>
            <span class="text-lg font-black text-slate-700">{{ moves }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider">Matches</span>
            <span class="text-lg font-black text-emerald-600">{{ matchedPairs }} / {{ totalPairs }}</span>
          </div>
        </div>
        <button 
          @click="$emit('exit')" 
          class="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full shadow-sm transition-colors"
        >
          Exit Game
        </button>
      </div>
    </div>

    <!-- Victory State -->
    <div v-if="isVictory" class="w-full py-16 flex flex-col items-center justify-center bg-emerald-50 rounded-3xl border border-emerald-100 shadow-inner animate-fade-in text-center">
      <div class="text-8xl mb-6 animate-bounce">🏆</div>
      <h2 class="text-4xl font-black text-emerald-800 mb-4">Brilliant!</h2>
      <p class="text-lg text-emerald-600 font-medium">You matched all {{ totalPairs }} pairs in just {{ moves }} moves and {{ initialTime - timeLeft }} seconds!</p>
      
      <div class="flex items-center gap-6 mb-8 mt-6 p-4 bg-emerald-100 rounded-2xl border border-emerald-200">
        <div class="flex flex-col items-center px-4">
          <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Best Time</span>
          <span class="text-2xl font-black text-emerald-800">{{ bestTime ? bestTime + 's' : '-' }}</span>
        </div>
        <div class="w-px h-10 bg-emerald-300"></div>
        <div class="flex flex-col items-center px-4">
          <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Fewest Moves</span>
          <span class="text-2xl font-black text-emerald-800">{{ bestMoves || '-' }}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row gap-4 mt-6">
        <button @click="initGame" class="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-md transition-colors text-lg">
          Play Again
        </button>
        <button @click="$emit('exit')" class="w-full sm:w-auto px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full shadow-sm border border-slate-200 transition-colors text-lg">
          Back to Flashcards
        </button>
      </div>
    </div>

    <!-- Defeat State (Time's Up) -->
    <div v-else-if="isGameOver" class="w-full py-16 flex flex-col items-center justify-center bg-rose-50 rounded-3xl border border-rose-100 shadow-inner animate-fade-in text-center overflow-hidden">
      <div class="flex items-center justify-center gap-2 mb-8 text-rose-500 font-black text-3xl italic select-none">
        <span class="animate-bounce" style="animation-delay: 0s">Z</span>
        <span class="animate-bounce" style="animation-delay: 0.1s">Z</span>
        <span class="animate-bounce" style="animation-delay: 0.2s">Z</span>
        <div class="text-8xl animate-violent-shake mx-4 drop-shadow-lg">⏰</div>
        <span class="animate-bounce" style="animation-delay: 0.1s">Z</span>
        <span class="animate-bounce" style="animation-delay: 0.2s">Z</span>
        <span class="animate-bounce" style="animation-delay: 0.3s">Z</span>
      </div>
      <h2 class="text-4xl font-black text-rose-800 mb-4">Time's Up!</h2>
      <p class="text-lg text-rose-600 mb-8 font-medium">Your memory failed to synchronize in time.</p>
      <div class="flex flex-col sm:flex-row gap-4">
        <button @click="initGame" class="w-full sm:w-auto px-8 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full shadow-md transition-colors text-lg">
          Try Again
        </button>
        <button @click="$emit('exit')" class="w-full sm:w-auto px-8 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full shadow-sm border border-slate-200 transition-colors text-lg">
          Back to Flashcards
        </button>
      </div>
    </div>

    <!-- Game Board -->
    <div v-else class="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div 
        v-for="(card, index) in gameCards" 
        :key="index"
        class="card-container perspective-1000 relative cursor-pointer"
        style="height: 240px;"
        @click="flipCard(index)"
      >
        <!-- The Card -->
        <div 
          class="card-inner w-full h-full relative transition-transform duration-500 transform-style-preserve-3d" 
          :class="{ 'is-flipped': card.isFlipped || card.isMatched }"
        >
          
          <!-- Front (Hidden State) -->
          <div 
            class="card-front absolute w-full h-full bg-slate-100 rounded-2xl shadow-sm border-2 border-slate-200 flex flex-col items-center justify-center backface-hidden transition-all duration-300"
            :class="{ 'hover:bg-indigo-50 hover:border-indigo-200 hover:shadow-md hover:-translate-y-1': !card.isMatched }"
          >
            <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-inner opacity-75">
              <span class="text-3xl text-slate-300">❓</span>
            </div>
          </div>

          <!-- Back (Revealed State) -->
          <div 
            class="card-back absolute w-full h-full rounded-2xl shadow-md border-2 p-4 flex flex-col backface-hidden rotate-y-180 overflow-hidden"
            :class="[
              card.type === 'question' ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-white border-amber-200 text-slate-800',
              card.isMatched ? 'opacity-0 scale-95 pointer-events-none transition-all duration-700 ease-out' : 'opacity-100 scale-100'
            ]"
          >
             <div class="flex justify-between items-center mb-3 flex-shrink-0">
               <span class="text-[10px] font-bold uppercase tracking-widest" :class="card.type === 'question' ? 'text-indigo-200' : 'text-amber-500'">
                 {{ card.type === 'question' ? 'Question' : 'Answer' }}
               </span>
             </div>
             
             <!-- Content -->
             <div class="flex-1 overflow-y-auto custom-scrollbar relative">
               <div class="min-h-full flex items-center justify-center py-1">
                 <p class="font-medium text-center leading-relaxed" :class="card.type === 'question' ? 'text-sm' : 'text-xs'">
                   {{ card.content }}
                 </p>
               </div>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  flashcards: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['exit'])

// High Scores
const bestTime = ref(localStorage.getItem('scitutor_memory_best_time') ? parseInt(localStorage.getItem('scitutor_memory_best_time')) : null)
const bestMoves = ref(localStorage.getItem('scitutor_memory_best_moves') ? parseInt(localStorage.getItem('scitutor_memory_best_moves')) : null)
const initialTime = ref(0)

// Game State
const gameCards = ref([])
const flippedIndices = ref([])
const matchedPairs = ref(0)
const totalPairs = ref(0)
const moves = ref(0)
const isChecking = ref(false)
const isVictory = ref(false)
const isGameOver = ref(false)

// Timer Logic
const timeLeft = ref(45)
let timerInterval = null

// Initialize Game
const initGame = () => {
  // Clear any existing timer
  if (timerInterval) clearInterval(timerInterval)
  
  moves.value = 0
  matchedPairs.value = 0
  flippedIndices.value = []
  isVictory.value = false
  isGameOver.value = false
  isChecking.value = false
  
  // Select up to 6 random flashcards to make 12 cards max
  const shuffledSource = [...props.flashcards].sort(() => 0.5 - Math.random())
  const selectedFlashcards = shuffledSource.slice(0, 6)
  totalPairs.value = selectedFlashcards.length
  
  if (totalPairs.value === 0) {
    emit('exit'); // No cards to play with
    return;
  }

  let deck = []
  
  // Create 2 cards (Q & A) for each flashcard
  selectedFlashcards.forEach(fc => {
    // Question Card
    deck.push({
      pairId: fc.id,
      type: 'question',
      content: fc.input,
      isFlipped: false,
      isMatched: false
    })
    
    // Answer Card
    deck.push({
      pairId: fc.id,
      type: 'answer',
      content: fc.output,
      isFlipped: false,
      isMatched: false
    })
  })
  
  // Fisher-Yates Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  
  gameCards.value = deck
  
  // Set Timer based on pairs (10 seconds per pair, min 20s)
  initialTime.value = Math.max(20, totalPairs.value * 10)
  timeLeft.value = initialTime.value
  
  // Start Timer
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval)
      isGameOver.value = true
      isChecking.value = true // Prevent further clicks
    }
  }, 1000)
}

onMounted(() => {
  initGame()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const flipCard = (index) => {
  // Prevent flipping if: checking a pair, card already matched, card already flipped, or already 2 cards flipped
  if (
    isChecking.value || 
    gameCards.value[index].isMatched || 
    gameCards.value[index].isFlipped ||
    flippedIndices.value.length >= 2
  ) {
    return
  }
  
  // Flip the card
  gameCards.value[index].isFlipped = true
  flippedIndices.value.push(index)
  
  // Check for match if 2 cards are flipped
  if (flippedIndices.value.length === 2) {
    moves.value++
    checkForMatch()
  }
}

const checkForMatch = () => {
  isChecking.value = true
  
  const index1 = flippedIndices.value[0]
  const index2 = flippedIndices.value[1]
  const card1 = gameCards.value[index1]
  const card2 = gameCards.value[index2]
  
  if (card1.pairId === card2.pairId && card1.type !== card2.type) {
    // Match!
    setTimeout(() => {
      gameCards.value[index1].isMatched = true
      gameCards.value[index2].isMatched = true
      flippedIndices.value = []
      matchedPairs.value++
      
      // Check win condition
      if (matchedPairs.value === totalPairs.value) {
        if (timerInterval) clearInterval(timerInterval) // Stop the clock!
        
        const timeTaken = initialTime.value - timeLeft.value
        if (!bestTime.value || timeTaken < bestTime.value) {
            bestTime.value = timeTaken
            localStorage.setItem('scitutor_memory_best_time', timeTaken.toString())
        }
        if (!bestMoves.value || moves.value < bestMoves.value) {
            bestMoves.value = moves.value
            localStorage.setItem('scitutor_memory_best_moves', moves.value.toString())
        }
        
        setTimeout(() => {
          isVictory.value = true
        }, 800)
      }
      
      isChecking.value = false
    }, 800) // Small delay before they disappear
    
  } else {
    // No match
    setTimeout(() => {
      gameCards.value[index1].isFlipped = false
      gameCards.value[index2].isFlipped = false
      flippedIndices.value = []
      isChecking.value = false
    }, 1200) // 1.2s delay to read the cards before they close
  }
}
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.transform-style-preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}
.is-flipped {
  transform: rotateY(180deg);
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 20px;
}

@keyframes violent-shake {
  0%, 100% { transform: translateX(0) rotate(0deg); }
  25% { transform: translateX(-6px) rotate(-15deg); }
  50% { transform: translateX(6px) rotate(15deg); }
  75% { transform: translateX(-6px) rotate(-15deg); }
}

.animate-violent-shake {
  display: inline-block;
  animation: violent-shake 0.2s ease-in-out infinite;
  transform-origin: center bottom;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
