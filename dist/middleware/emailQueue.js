"use strict";
// // addJob.ts
// import { Queue } from 'bullmq';
// import IORedis from 'ioredis';
// // Redis connection
// const connection = new IORedis();
// // Create queue
// const queue = new Queue('ReminderQueue', { connection });
// // Add job with 5-minute delay (in milliseconds)
// queue.add(
//   'sendReminder',
//   { userId: '12345', message: 'Time to attend your session!' },
//   { delay: 60 * 1000 } // 1 minute
// );
// console.log('Reminder job scheduled! It will run in 1 minutes.');
