"use strict";
//  import express, { Router, Request, Response } from 'express';
//  const router: Router = express.Router();
//  import { Queue, Worker, Job } from 'bullmq';
//  import nodemailer from 'nodemailer';
//  import { RedisOptions } from 'ioredis';
//  import Redis from 'ioredis';
//  // Redis config
//  const redisOptions: RedisOptions = {
//    host: 'localhost',
//    port: 6379,
//  };
//  // Create Redis client to check if job exists
//  const redisClient = new Redis(redisOptions);
//  // Create BullMQ Queue
//  const emailQueue = new Queue('emailQueue', {
//    connection: redisOptions,
//  });
//  // Nodemailer transporter
//  const transporter = nodemailer.createTransport({
//    service: 'gmail',
//    auth: {
//      user: 'tryoutscout@gmail.com',
//      pass: 'xapfekrrmvvghexe',
//    },
//  });
//  // BullMQ Worker to process jobs
//  const worker = new Worker(
//    'emailQueue',
//    async (job: Job) => {
//      const { to, subject, body } = job.data;
//      try {
//        await transporter.sendMail({
//          from: 'tryoutscout@gmail.com',
//          to,
//          subject,
//          text: body,
//        });
//        console.log(`✅ Email sent to ${to}`);
//      } catch (error) {
//        console.error(`❌ Failed to send email to ${to}:`, error);
//      }
//    },
//    {
//      connection: redisOptions,
//    }
//  );
//  // Function to schedule emails
//  export async function scheduleEmailsForUsers() {
//    const users = [
//      { email: 'belimruhan6@gmail.com', name: 'User One' },
//      { email: 'roohanaftab@gmail.com', name: 'User Two' },
//      { email: 'mustu@yopmail.com', name: 'User Three' },
//    ];
//    for (const user of users) {
//      // Generate a unique job key for each user (this could be based on their email or name)
//      const jobKey = `email-${user.email}`;
//      // Check Redis to see if the job has already been scheduled
//      const jobExists = await redisClient.get(jobKey);
//      if (jobExists) {
//        console.log(`📨 Email for ${user.email} has already been scheduled.`);
//        continue; // Skip this job if it's already scheduled
//      }
//      // Add the job to the queue
//      const job = await emailQueue.add(
//        'sendEmail',
//        {
//          to: user.email,
//          subject: `Hello, ${user.name}!`,
//          body: `Hi ${user.name}, this is a scheduled email sent after 1 minute.`,
//        },
//        {
//          delay: 1 * 60 * 1000, // Delay by 1 minute
//          removeOnComplete: true, // Remove the job after completion
//        }
//      );
//      // Set the job key in Redis to prevent it from being re-added
//      await redisClient.set(jobKey, 'scheduled', 'EX', 3600); // Set expiration for 1 hour (or adjust based on your needs)
//      console.log(`📨 Scheduled email to ${user.email} with job ID: ${job.id}`);
//    }
//  }
// export default router
