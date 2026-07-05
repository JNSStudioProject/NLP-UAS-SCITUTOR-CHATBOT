const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const config = require('./core/config');
const OnnxSingleton = require('./services/OnnxSingleton');
const nlpRouter = require('./api/nlp');

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());
app.use(rateLimit({ windowMs: 60000, max: 100 }));

// Routes
app.use('/api', nlpRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal Server Error' } });
});

// Bootstrap
const server = app.listen(config.PORT, () => {
  console.log(`ask-scitutor backend running on port ${config.PORT}`);
});

const shutdownSequence = async () => {
  console.log('Shutdown signal received. Executing graceful shutdown sequence...');
  server.close(async () => {
    console.log('HTTP connections closed.');
    try {
      if (OnnxSingleton._instance) {
        await OnnxSingleton._instance.destroy();
        console.log('ONNX Singleton runtime destroyed. Memory released.');
      }
      process.exit(0);
    } catch (err) {
      console.error('Error during shutdown sequence:', err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error('In-flight requests drain timeout. Force quitting.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdownSequence);
process.on('SIGINT', shutdownSequence);

process.on('unhandledRejection', async (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  try {
    if (OnnxSingleton._instance) {
      await OnnxSingleton._instance.destroy();
    }
  } catch (e) {
    console.error('Failed to cleanup ONNX instance on unhandled rejection:', e);
  }
  process.exit(1);
});

module.exports = app;
