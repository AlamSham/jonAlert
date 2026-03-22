import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectDb = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 10000,
        heartbeatFrequencyMS: 30000
      });
      logger.info('MongoDB connected');

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected — mongoose will auto-reconnect');
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return;
    } catch (error) {
      logger.error(`MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed`, {
        error: error.message
      });

      if (attempt < MAX_RETRIES) {
        logger.info(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
        await delay(RETRY_DELAY_MS);
      } else {
        throw new Error(`MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }
    }
  }
};
