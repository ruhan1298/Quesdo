// workers/notificationWorker.ts
import { Worker } from 'bullmq';
import { sendRealTimeNotification } from '../middleware/sendnotification';
import IORedis from 'ioredis';

export function startNotificationWorker() {
  const connection = new IORedis({
    maxRetriesPerRequest: null,  // <-- yeh line add karo
  });
  const worker = new Worker(
    'notificationQueue',
    async job => {
      const { name, data } = job;

      switch (name) {
        case 'send-now-available':
        case 'send-event-update':
        case 'send-request-to-join':
        case 'send-accept-request':
          await sendRealTimeNotification(data.userId, {
            title: data.title,
            message: data.message,
            postId: data.postId || ''
          });
          break;

        default:
          console.warn(`⚠️ Unknown notification type: ${name}`);
      }
    },
    { connection }
  );

  worker.on('completed', job => {
    console.log(`✅ Job ${job.id} (${job.name}) completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed`, err);
  });

  worker.on('error', err => {
    console.error('❌ Worker error', err);
  });

  console.log('🚀 Notification worker started');
}
