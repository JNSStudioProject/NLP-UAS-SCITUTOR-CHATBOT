const { MODEL_ID, MEM_ABORT_THRESHOLD_MB, MEM_WARN_THRESHOLD_MB } = require('../core/config');

let pipeline;
(async () => {
  const transformers = await import('@xenova/transformers');
  pipeline = transformers.pipeline;
})();

class OnnxSingleton {
  static _instance = null;
  static _initPromise = null;

  constructor() {
    if (OnnxSingleton._instance) {
      throw new Error("PRIVATE — throws if called directly. Use OnnxSingleton.getInstance()");
    }
    this._pipeline = null;
    this._state = 'UNINITIALIZED';
    this._loadedAt = null;
    this._requestCount = 0;
    this._peakMemoryMB = 0;
  }

  static async getInstance() {
    if (OnnxSingleton._instance && OnnxSingleton._instance._state === 'READY') {
      return OnnxSingleton._instance;
    }
    if (!OnnxSingleton._instance) {
      OnnxSingleton._instance = new OnnxSingleton();
    }
    if (!OnnxSingleton._initPromise) {
      OnnxSingleton._initPromise = OnnxSingleton._instance._init();
    }
    await OnnxSingleton._initPromise;
    return OnnxSingleton._instance;
  }

  async _init() {
    try {
      this._state = 'LOADING';
      const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
      if (heapUsedMB > MEM_ABORT_THRESHOLD_MB) {
        throw new Error(`Memory abort threshold exceeded: ${heapUsedMB.toFixed(2)} MB`);
      }
      
      while (!pipeline) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      this._pipeline = await pipeline('text2text-generation', MODEL_ID, {
        quantized: true,
        revision: 'main'
      });
      
      await this._pipeline('warmup', { max_new_tokens: 1 });
      
      this._state = 'READY';
      this._loadedAt = new Date();
    } catch (err) {
      this._state = 'FAILED';
      OnnxSingleton._initPromise = null;
      throw err;
    }
  }

  async infer(sanitizedPrompt, inferOptions = {}) {
    if (this._state !== 'READY') throw new Error('MODEL_NOT_READY');
    
    try {
      this._state = 'BUSY';
      const start = Date.now();
      
      const defaultOptions = { max_new_tokens: 325, do_sample: false, temperature: 1.0, num_beams: 1 };
      const options = { ...defaultOptions, ...inferOptions };
      
      const result = await this._pipeline(sanitizedPrompt, options);
      const outputText = result[0]?.generated_text || '';
      
      this._requestCount++;
      const endMemMB = process.memoryUsage().heapUsed / 1024 / 1024;
      
      if (endMemMB > this._peakMemoryMB) this._peakMemoryMB = endMemMB;
      if (endMemMB > MEM_WARN_THRESHOLD_MB) {
        console.warn(`Memory warning threshold breached: ${endMemMB.toFixed(2)} MB`);
      }

      return {
        output: outputText,
        tokensUsed: Math.ceil(outputText.trim().split(/\\s+/).length * 1.35),
        latencyMs: Date.now() - start,
        memoryMB: Math.round(endMemMB)
      };
    } finally {
      this._state = 'READY';
    }
  }

  getStatus() {
    return {
      state: this._state,
      modelId: MODEL_ID,
      loadedAt: this._loadedAt ? this._loadedAt.toISOString() : null,
      requestCount: this._requestCount,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      uptime: process.uptime()
    };
  }

  async destroy() {
    this._pipeline = null;
    OnnxSingleton._instance = null;
    this._state = 'UNINITIALIZED';
    if (global.gc) global.gc();
  }
}

module.exports = OnnxSingleton;
