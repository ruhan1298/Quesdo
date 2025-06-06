"use strict";
// emailScheduler.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Step 1: Redis Configuration
const redisOptions = {
    host: 'localhost',
    port: 6379,
};
// Step 2: Create BullMQ queue
const emailQueue = new bullmq_1.Queue('emailQueue', { connection: redisOptions });
// Step 3: Create Nodemailer transporter (replace with your SMTP credentials)
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: 'your_email@gmail.com', // ✅ Replace with your email
        pass: 'your_app_password_or_email_pass', // ✅ Use App Password if using Gmail
    },
});
// Step 4: Worker to process jobs and send emails
const worker = new bullmq_1.Worker('emailQueue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { to, subject, body } = job.data;
    try {
        yield transporter.sendMail({
            from: '"Your App" <your_email@gmail.com>',
            to,
            subject,
            text: body,
        });
        console.log(`✅ Email sent to ${to}`);
    }
    catch (err) {
        console.error(`❌ Error sending email to ${to}:`, err);
    }
}), { connection: redisOptions });
// Step 5: List of users to send emails to
const users = [
    { email: 'user1@example.com', name: 'User One' },
    { email: 'user2@example.com', name: 'User Two' },
    { email: 'user3@example.com', name: 'User Three' },
];
// Step 6: Schedule emails with 3-minute delay for each user
function scheduleEmailsForUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        for (const user of users) {
            yield emailQueue.add('sendEmail', {
                to: user.email,
                subject: `Hello, ${user.name}!`,
                body: `Hi ${user.name}, this is a scheduled email sent 3 minutes after scheduling.`,
            }, {
                delay: 3 * 60 * 1000, // 3-minute delay
            });
            console.log(`📨 Scheduled email to ${user.email}`);
        }
    });
}
// Start scheduling
scheduleEmailsForUsers();
