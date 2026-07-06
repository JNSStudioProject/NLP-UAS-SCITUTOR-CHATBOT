<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-4rem)] flex flex-col">
    <!-- Header Dashboard (Hidden in Game Mode) -->
    <div v-if="viewMode !== 'game'" class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end flex-shrink-0 gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-900">
          My Flashcards
        </h1>
        <p class="mt-2 text-sm text-slate-600">Smart Study Mode with Spaced Repetition (SRS).</p>
      </div>
      
      <div v-if="hasCards" class="flex items-center gap-4">
        <!-- Stats -->
        <div class="flex items-center gap-6 bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-200">
          <div class="flex flex-col items-center">
            <span class="text-xs text-slate-400 font-bold uppercase tracking-wider">Total</span>
            <span class="text-lg font-black text-slate-700">{{ flashcardStore.cardCount }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-amber-500 font-bold uppercase tracking-wider">Due</span>
            <span class="text-lg font-black text-amber-600">{{ flashcardStore.cardsToReview.length }}</span>
          </div>
          <div class="w-px h-8 bg-slate-200"></div>
          <div class="flex flex-col items-center">
            <span class="text-xs text-emerald-500 font-bold uppercase tracking-wider">Mastered</span>
            <span class="text-lg font-black text-emerald-600">{{ flashcardStore.masteredCardsCount }}</span>
          </div>
        </div>

        <div v-if="hasCards" class="flex items-center gap-2">
          <!-- Play Game Button (Always available) -->
          <button 
            @click="viewMode = 'game'"
            class="px-4 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-full transition-colors mr-2 border border-indigo-200"
            title="Play Memory Match"
          >
            Play Game
          </button>

          <!-- Study Due Button -->
          <button 
            v-if="flashcardStore.cardsToReview.length > 0"
            @click="startStudy(false)"
            class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Study Due
          </button>
          
          <!-- Practice All Button (Shows when Due is 0) -->
          <button 
            v-else
            @click="startStudy(true)"
            class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-full shadow-md transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Practice All
          </button>
        </div>
        
        <button 
          @click="confirmDelete('all')"
          class="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 font-medium rounded-full shadow-sm transition-colors border border-rose-100 flex items-center justify-center"
          title="Delete All Flashcards"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!hasCards" class="flex-1 flex flex-col justify-center items-center p-12 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="text-6xl mb-4">⭐</div>
      <p class="text-xl font-medium text-gray-900 mb-2">No flashcards yet!</p>
      <p class="text-center max-w-md">Go to your Question History and click the "⭐ Flashcard" button to save questions you want to study later.</p>
      <button @click="$router.push({ name: 'QuestionHistory' })" class="mt-6 px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700">
        Go to History
      </button>
    </div>

    <!-- STUDY MODE -->
    <div v-else-if="viewMode === 'study'" class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
      <div v-if="!currentStudyCard" class="text-center p-12 bg-emerald-50 rounded-2xl border border-emerald-100 w-full shadow-sm animate-fade-in relative overflow-hidden">
        
        <!-- Challenge Popup Overlay -->
        <div v-if="showChallengePopup" class="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 z-10 animate-fade-in">
          <div class="text-6xl mb-4 animate-bounce">🔥</div>
          <h3 class="text-2xl font-black text-white mb-2">Brain is Warmed Up!</h3>
          <p class="text-slate-300 mb-8 font-medium text-center">Ready to test your limits in the Neuro-Match Challenge?</p>
          <div class="flex flex-col sm:flex-row gap-4">
            <button @click="startCountdown" class="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-full shadow-lg transform hover:scale-105 transition-all flex items-center justify-center gap-2">
              <span>🚀</span> Accept Challenge
            </button>
            <button @click="showChallengePopup = false" class="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-full transition-colors">
              No thanks
            </button>
          </div>
        </div>

        <!-- Standard Caught Up UI (Behind popup) -->
        <div :class="{'opacity-0 pointer-events-none': showChallengePopup}" class="transition-opacity duration-300">
          <div class="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 class="text-2xl font-bold text-emerald-800 mb-2">You're all caught up!</h2>
          <p class="text-emerald-600 mb-8">No more cards to review today. Great job on keeping your streak!</p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button @click="startCountdown" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow-md transition-colors flex items-center justify-center gap-2">
              Play Neuro-Match
            </button>
            <button @click="viewMode = 'grid'" class="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-full border border-slate-200 shadow-sm transition-colors">
              Back to Grid
            </button>
          </div>
        </div>
      </div>

      <div v-else class="w-full flex flex-col items-center">
        <!-- Progress Text -->
        <p class="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Reviewing Card</p>

        <!-- The Study Card -->
        <div 
          class="card-container w-full perspective-1000 relative cursor-pointer"
          style="height: 400px;"
          @click="showAnswer = true"
        >
          <div class="card-inner w-full h-full relative transition-transform duration-500 transform-style-preserve-3d" :class="{ 'is-flipped': showAnswer }">
            
            <!-- Front (Question) -->
            <div class="card-front absolute w-full h-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col justify-between backface-hidden">
              <div class="flex justify-between items-center mb-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-800 border border-slate-200">
                  {{ currentStudyCard.subject || 'General' }}
                </span>
                <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Question</span>
              </div>
              
              <div class="flex-1 flex items-center justify-center overflow-hidden py-4">
                <h3 class="text-2xl md:text-3xl font-bold text-slate-800 leading-tight text-center">
                  {{ currentStudyCard.input }}
                </h3>
              </div>
              
              <div class="text-center mt-4">
                <span class="inline-flex items-center text-sm font-medium text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100 animate-pulse">
                  Click to show answer
                </span>
              </div>
            </div>

            <!-- Back (Answer) -->
            <div class="card-back absolute w-full h-full bg-slate-800 text-white rounded-2xl shadow-xl border border-slate-700 p-8 flex flex-col backface-hidden rotate-y-180 overflow-hidden">
               <div class="flex justify-between items-center mb-6 flex-shrink-0">
                 <span class="text-xs font-semibold text-slate-300 uppercase tracking-widest">Answer</span>
                 <span class="text-2xl">💡</span>
               </div>
               <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                 <p class="text-lg md:text-xl font-medium leading-relaxed whitespace-pre-wrap text-slate-200">
                   {{ currentStudyCard.output }}
                 </p>
               </div>
            </div>
            
          </div>
        </div>

        <!-- Rating Buttons (Only show when answer is revealed) -->
        <div class="mt-8 h-20 flex items-center justify-center w-full">
          <div v-if="showAnswer" class="flex gap-4 w-full max-w-lg">
            <button @click.stop="rateCard(0)" class="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 hover:bg-rose-200 transition-colors">
              <span class="text-lg font-bold">Forgot</span>
              <span class="text-xs opacity-75 mt-1">Again</span>
            </button>
            <button @click.stop="rateCard(3)" class="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 transition-colors">
              <span class="text-lg font-bold">Hard</span>
              <span class="text-xs opacity-75 mt-1">Soon</span>
            </button>
            <button @click.stop="rateCard(5)" class="flex-1 flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 transition-colors">
              <span class="text-lg font-bold">Easy</span>
              <span class="text-xs opacity-75 mt-1">Much Later</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- COUNTDOWN MODE -->
    <div v-else-if="viewMode === 'countdown'" class="flex-1 flex flex-col items-center justify-center w-full animate-fade-in">
      <div class="text-[12rem] font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-700 drop-shadow-2xl animate-pulse">
        {{ countdownValue > 0 ? countdownValue : 'GO!' }}
      </div>
    </div>

    <!-- GAME MODE -->
    <div v-else-if="viewMode === 'game'" class="w-full h-full flex-1 animate-fade-in">
      <MemoryGame :flashcards="flashcardStore.cards" @exit="viewMode = 'grid'" />
    </div>

    <!-- GRID MODE -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="card in flashcardStore.cards" 
        :key="card.id"
        class="card-container w-full perspective-1000 relative group cursor-pointer"
        style="height: 320px;"
        @click="toggleFlip(card.id)"
      >
        <!-- Delete Button -->
        <button 
          @click.stop="confirmDelete(card.id)"
          class="absolute top-3 right-3 p-2 bg-rose-50 text-rose-400 hover:bg-rose-100 hover:text-rose-600 rounded-full opacity-0 group-hover:opacity-100 transition-all z-10"
          title="Remove Flashcard"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Due indicator -->
        <div v-if="isDue(card.nextReviewDate)" class="absolute -top-2 -left-2 z-20 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-md">
          Due
        </div>

        <div class="card-inner w-full h-full relative transition-transform duration-700 transform-style-preserve-3d" :class="{ 'is-flipped': flippedCards[card.id] }">
          
          <!-- Front (Question) -->
          <div class="card-front absolute w-full h-full bg-white rounded-xl shadow-md hover:shadow-xl border border-slate-200 p-6 flex flex-col justify-between backface-hidden transition-shadow duration-300">
            <div class="flex justify-between items-center mb-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase bg-slate-100 text-slate-800 border border-slate-200">
                {{ card.subject || 'General' }}
              </span>
              <span class="text-xs font-semibold text-slate-400 uppercase tracking-widest">Question</span>
            </div>
            
            <div class="flex-1 flex items-center justify-center overflow-hidden py-2">
              <h3 class="text-lg md:text-xl font-bold text-slate-800 leading-snug text-center line-clamp-4">
                {{ card.input }}
              </h3>
            </div>
            
            <div class="text-center mt-4">
              <span class="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                Click to flip
              </span>
            </div>
          </div>

          <!-- Back (Answer) -->
          <div class="card-back absolute w-full h-full bg-slate-800 text-white rounded-xl shadow-lg border border-slate-700 p-6 flex flex-col backface-hidden rotate-y-180 overflow-hidden">
             <div class="flex justify-between items-center mb-4 flex-shrink-0">
               <span class="text-xs font-semibold text-slate-300 uppercase tracking-widest">Answer</span>
               <span class="text-xl">💡</span>
             </div>
             <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
               <p class="text-sm font-medium leading-relaxed whitespace-pre-wrap text-slate-200">
                 {{ card.output }}
               </p>
             </div>
          </div>
          
        </div>
      </div>
    </div>

    <!-- Custom Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all text-center">
        <div class="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </div>
        <h3 class="text-2xl font-bold text-slate-900 mb-2">Are you sure?</h3>
        <p class="text-slate-500 mb-8 leading-relaxed">
          {{ deleteTarget === 'all' 
             ? 'This will permanently delete all your flashcards and reset your progress. You cannot undo this action.'
             : 'This will permanently delete this flashcard from your collection.' }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <button @click="showDeleteModal = false" class="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full transition-colors w-full sm:flex-1">
            Cancel
          </button>
          <button @click="executeDelete" class="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-full shadow-md transition-colors w-full sm:flex-1">
            Yes, Delete {{ deleteTarget === 'all' ? 'All' : 'It' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFlashcardStore } from '@/stores/flashcardStore'
import MemoryGame from './MemoryGame.vue'

const flashcardStore = useFlashcardStore()

// State
const viewMode = ref('grid') // 'grid' | 'study' | 'game' | 'countdown'
const flippedCards = ref({})
const showAnswer = ref(false)
const localStudyQueue = ref([])
const showChallengePopup = ref(false)
const countdownValue = ref(3)
const showDeleteModal = ref(false)
const deleteTarget = ref(null)

// Computed
const hasCards = computed(() => flashcardStore.cardCount > 0)
const currentStudyCard = computed(() => {
  return localStudyQueue.value.length > 0 ? localStudyQueue.value[0] : null
})

// Methods
const isDue = (dateString) => {
  if (!dateString) return true;
  return new Date(dateString) <= new Date();
}

const toggleFlip = (id) => {
  if (viewMode.value === 'grid') {
    flippedCards.value[id] = !flippedCards.value[id]
  }
}

const startStudy = (practiceAll = false) => {
  viewMode.value = 'study'
  showAnswer.value = false
  
  if (practiceAll) {
    // Shuffle all cards for practice
    localStudyQueue.value = [...flashcardStore.cards].sort(() => 0.5 - Math.random())
  } else {
    // Just the due ones
    localStudyQueue.value = [...flashcardStore.cardsToReview]
  }
}

const rateCard = (quality) => {
  if (!currentStudyCard.value) return;
  
  const cardId = currentStudyCard.value.id;
  
  // Rate the card in store
  flashcardStore.reviewCard(cardId, quality);
  
  // Remove from local queue
  const finishedCard = localStudyQueue.value.shift();
  
  // If they forgot, put it at the back of the queue to review again in this session
  if (quality < 3) {
    localStudyQueue.value.push(finishedCard);
  }
  
  // Trigger popup if session is complete
  if (localStudyQueue.value.length === 0) {
    setTimeout(() => {
      showChallengePopup.value = true;
    }, 600);
  }
  
  // Reset UI for next card
  showAnswer.value = false;
}

const startCountdown = () => {
  showChallengePopup.value = false;
  viewMode.value = 'countdown';
  countdownValue.value = 3;
  
  const interval = setInterval(() => {
    countdownValue.value--;
    if (countdownValue.value < 0) {
      clearInterval(interval);
      viewMode.value = 'game';
    }
  }, 1000);
}

const confirmDelete = (target) => {
  deleteTarget.value = target;
  showDeleteModal.value = true;
}

const executeDelete = () => {
  if (deleteTarget.value === 'all') {
    flashcardStore.clearAll()
  } else if (deleteTarget.value !== null) {
    flashcardStore.removeCard(deleteTarget.value)
  }
  showDeleteModal.value = false;
  deleteTarget.value = null;
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
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
