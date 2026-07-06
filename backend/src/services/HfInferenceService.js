const { MODEL_ID, HF_TOKEN } = require('../core/config');

class HfInferenceService {
  static _instance = null;

  constructor() {
    if (HfInferenceService._instance) {
      throw new Error("PRIVATE — throws if called directly. Use HfInferenceService.getInstance()");
    }
    this._state = 'READY';
    this._requestCount = 0;
  }

  static async getInstance() {
    if (!HfInferenceService._instance) {
      HfInferenceService._instance = new HfInferenceService();
    }
    return HfInferenceService._instance;
  }

  async infer(sanitizedPrompt, inferOptions = {}) {
    this._state = 'BUSY';
    const start = Date.now();
    
    try {
      // Menggunakan URL dari Server Mini HF Space yang baru dibuat
      const url = `https://jessica2121-nlp-uas-final-science.hf.space/models/${MODEL_ID}`;
      
      const defaultOptions = { max_new_tokens: 325, temperature: 1.0 };
      const options = { ...defaultOptions, ...inferOptions };

      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (HF_TOKEN) {
        headers['Authorization'] = `Bearer ${HF_TOKEN}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: sanitizedPrompt.toLowerCase().startsWith('question:') 
            ? sanitizedPrompt 
            : `question: ${sanitizedPrompt}`,
          parameters: options
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('Hugging Face API Error:', errText);
        throw new Error(`HF API Error: ${response.status}`);
      }

      const result = await response.json();
      
      let outputText = '';
      if (Array.isArray(result) && result.length > 0) {
        outputText = result[0].generated_text || result[0].summary_text || result[0].answer || '';
      } else if (result.generated_text) {
        outputText = result.generated_text;
      } else if (result.error) {
        throw new Error(`Model Error: ${result.error}`);
      } else {
        outputText = JSON.stringify(result);
      }

      this._requestCount++;

      return {
        output: outputText,
        tokensUsed: Math.ceil(outputText.trim().split(/\s+/).length * 1.35),
        latencyMs: Date.now() - start,
        memoryMB: 0
      };
    } finally {
      this._state = 'READY';
    }
  }

  getStatus() {
    return {
      state: this._state,
      modelId: MODEL_ID,
      requestCount: this._requestCount,
      memoryUsageMB: 0,
      uptime: process.uptime()
    };
  }

  async destroy() {
    HfInferenceService._instance = null;
    this._state = 'UNINITIALIZED';
  }
}

module.exports = HfInferenceService;
