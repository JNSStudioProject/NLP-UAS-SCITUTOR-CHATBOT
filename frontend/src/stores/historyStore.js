import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

// LocalStorage key
const STORAGE_KEY = 'scitutor_history'

export const useHistoryStore = defineStore('history', {
  state: () => {
    let saved = []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        saved = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error reading history from localStorage', e)
    }
    
    return {
      questions: saved,
      loading: false,
      error: null,
    }
  },
  
  getters: {
    historyCount: (state) => state.questions.length,
  },
  
  actions: {
    async fetchHistory() {
      // In localStorage mode, state is already initialized on load.
      // We can just trigger a reactivity update if needed.
      this.loading = true
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          this.questions = JSON.parse(stored)
        }
      } catch (err) {
        this.error = 'Failed to parse history'
      } finally {
        this.loading = false
      }
    },
    
    async saveQuestion(questionData) {
      try {
        const authStore = useAuthStore();
        const newEntry = {
          id: Date.now().toString() + Math.random().toString(36).substring(7),
          ...questionData,
          userEmail: authStore.user?.email || 'Guest',
          user: authStore.user?.user_metadata?.full_name || 'Anonymous User',
          createdAt: new Date().toISOString()
        }
        this.questions.unshift(newEntry)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.questions))
        return newEntry
      } catch (err) {
        console.error('Failed to save question to history', err)
        throw err
      }
    },

    async clearHistory() {
      try {
        localStorage.removeItem(STORAGE_KEY)
        this.questions = []
      } catch (err) {
        this.error = 'Failed to clear history'
        throw err
      }
    }
  }
})
