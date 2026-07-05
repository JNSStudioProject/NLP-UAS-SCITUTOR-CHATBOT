const { MAX_INPUT_TOKENS } = require('../core/config');

const tokenGuard = {
  estimateTokenCount: (input) => {
    return Math.ceil(input.trim().split(/\s+/).length * 1.35);
  },
  enforceInputLimit: (rawInput) => {
    let sanitized = rawInput.replace(/\s+/g, ' ').trim();
    const estimatedTokens = tokenGuard.estimateTokenCount(sanitized);
    
    if (estimatedTokens > MAX_INPUT_TOKENS) {
      return { isValid: false, estimatedTokens, sanitized };
    }
    
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
    return { isValid: true, estimatedTokens, sanitized };
  }
};

module.exports = tokenGuard;
