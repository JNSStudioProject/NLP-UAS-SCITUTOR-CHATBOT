import { defineStore } from 'pinia'

export const usePredictStore = defineStore('predict', {
  state: () => ({
    lastResult: null,
    error: null,
  }),
  actions: {
    async submitQuestion(question) {
      try {
        const hfToken = import.meta.env.VITE_HF_TOKEN || '';
        const headers = { 'Content-Type': 'application/json' };
        if (hfToken) {
          headers['Authorization'] = `Bearer ${hfToken}`;
        }

        const response = await fetch('/hf-api/models/jessicanathania39/t5-qa-Science-NLP-Sems6-final', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ inputs: question.input })
        });
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          throw new Error(`Proxy error or API unavailable (Status ${response.status}): ${text.substring(0, 50)}...`);
        }
        
        if (!response.ok) throw new Error(data.error || 'Error from HuggingFace API');
        
        // HF Inference API usually returns [{ generated_text: "..." }] for T5
        const answer = Array.isArray(data) && data.length > 0 ? data[0].generated_text : data.generated_text || 'No answer generated.';
        
        this.lastResult = {
          output: answer,
          tokensUsed: 0, // HF API doesn't return token count directly
          latencyMs: 0
        };
        this.error = null;
        return this.lastResult;
      } catch (err) {
        if (err.message === 'Failed to fetch') {
          this.error = 'Network Error (CORS). Please ensure you have added a valid VITE_HF_TOKEN in your frontend/.env file and restarted the server.';
        } else {
          this.error = err.message;
        }
        throw err;
      }
    },
    clearResult() {
      this.lastResult = null;
      this.error = null;
    }
  }
})
