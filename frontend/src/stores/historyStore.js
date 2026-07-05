import { defineStore } from 'pinia'
import api from '@/utils/api'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    questions: [],
    loading: false,
    error: null,
  }),
  
  getters: {
    historyCount: (state) => state.questions.length,
  },
  
  actions: {
    async fetchHistory() {
      this.loading = true
      this.error = null
      try {
        const response = await api.get('/history')
        this.questions = response.data.history || []
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Failed to fetch history'
      } finally {
        this.loading = false
      }
    },
    
    async saveQuestion(questionData) {
      try {
        const response = await api.post('/history', questionData)
        if (response.data) {
          this.questions.unshift(response.data)
        }
        return response.data
      } catch (err) {
        console.error('Failed to save question to history', err)
        throw err
      }
    },

    async clearHistory() {
      try {
        await api.delete('/history')
        this.questions = []
      } catch (err) {
        this.error = err.response?.data?.error?.message || 'Failed to clear history'
        throw err
      }
    }
  }
})
