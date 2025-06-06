// emailScheduler.ts

import { Queue, Worker, Job } from 'bullmq';
import nodemailer from 'nodemailer';
import { RedisOptions } from 'ioredis';
// Step 1: Redis Configuration
const redisOptions: RedisOptions = {
  host: 'localhost',
  port: 6379,
};

// Step 2: Create BullMQ queue
const emailQueue = new Queue('emailQueue', { connection: redisOptions });

// Step 3: Create Nodemailer transporter (replace with your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',             // ✅ Replace with your email
    pass: 'your_app_password_or_email_pass', // ✅ Use App Password if using Gmail
  },
});

// Step 4: Worker to process jobs and send emails
const worker = new Worker(
  'emailQueue',
  async (job: Job) => {
    const { to, subject, body } = job.data;
    try {
      await transporter.sendMail({
        from: '"Your App" <your_email@gmail.com>',
        to,
        subject,
        text: body,
      });
      console.log(`✅ Email sent to ${to}`);
    } catch (err) {
      console.error(`❌ Error sending email to ${to}:`, err);
    }
  },
  { connection: redisOptions }
);

// Step 5: List of users to send emails to
const users = [
  { email: 'user1@example.com', name: 'User One' },
  { email: 'user2@example.com', name: 'User Two' },
  { email: 'user3@example.com', name: 'User Three' },
];

// Step 6: Schedule emails with 3-minute delay for each user
async function scheduleEmailsForUsers() {
  for (const user of users) {
    await emailQueue.add(
      'sendEmail',
      {
        to: user.email,
        subject: `Hello, ${user.name}!`,
        body: `Hi ${user.name}, this is a scheduled email sent 3 minutes after scheduling.`,
      },
      {
        delay: 3 * 60 * 1000, // 3-minute delay
      }
    );
    console.log(`📨 Scheduled email to ${user.email}`);
  }
}

// Start scheduling
scheduleEmailsForUsers();
