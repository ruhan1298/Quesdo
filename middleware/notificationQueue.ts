import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis({
  maxRetriesPerRequest: null,
});

export const notificationQueue = new Queue('notificationQueue', { connection });
