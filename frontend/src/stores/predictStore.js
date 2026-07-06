import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useHistoryStore } from './historyStore'
export const usePredictStore = defineStore('predict', {
  state: () => ({
    lastInput: '',
    lastResult: null,
    error: null,
  }),
  actions: {
    async submitQuestion(question) {
      try {
        const authStore = useAuthStore();
        const headers = { 'Content-Type': 'application/json' };
        if (authStore.session?.access_token) {
          headers['Authorization'] = `Bearer ${authStore.session.access_token}`;
        }

        const response = await fetch('/api/predict', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ input: question.input })
        });
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Proxy error or API unavailable (Status ${response.status}): ${text.substring(0, 50)}...`);
        }
        
        if (!response.ok) {
           throw new Error(data.error?.message || data.error || 'Error from Backend API');
        }
        
        this.lastResult = {
          output: data.answer || 'No answer generated.',
          tokensUsed: data.tokenCount || 0,
          latencyMs: data.latencyMs || 0
        };
        this.lastInput = question.input;
        this.error = null;
        
        // Auto-save to history
        try {
          const historyStore = useHistoryStore();
          historyStore.saveQuestion({
            input: question.input,
            output: this.lastResult.output,
            subject: question.subject || 'General' // Default subject if not provided
          });
        } catch (e) {
          console.error("Failed to auto-save to history", e);
        }
        
        return this.lastResult;
      } catch (err) {
        if (err.message === 'Failed to fetch') {
          this.error = 'Network Error. Ensure backend is running.';
        } else {
          this.error = err.message;
        }
        throw err;
      }
    },
    clearResult() {
      this.lastInput = '';
      this.lastResult = null;
      this.error = null;
    }
  }
})
