"use strict";
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
exports.startNotificationWorker = startNotificationWorker;
// workers/notificationWorker.ts
const bullmq_1 = require("bullmq");
const sendnotification_1 = require("../middleware/sendnotification");
const ioredis_1 = __importDefault(require("ioredis"));
function startNotificationWorker() {
    const connection = new ioredis_1.default({
        maxRetriesPerRequest: null, // <-- yeh line add karo
    });
    const worker = new bullmq_1.Worker('notificationQueue', (job) => __awaiter(this, void 0, void 0, function* () {
        const { name, data } = job;
        switch (name) {
            case 'send-now-available':
            case 'send-event-update':
            case 'send-request-to-join':
            case 'send-accept-request':
                yield (0, sendnotification_1.sendRealTimeNotification)(data.userId, {
                    title: data.title,
                    message: data.message,
                    postId: data.postId || ''
                });
                break;
            default:
                console.warn(`⚠️ Unknown notification type: ${name}`);
        }
    }), { connection });
    worker.on('completed', job => {
        console.log(`✅ Job ${job.id} (${job.name}) completed`);
    });
    worker.on('failed', (job, err) => {
        console.error(`❌ Job ${job === null || job === void 0 ? void 0 : job.id} failed`, err);
    });
    worker.on('error', err => {
        console.error('❌ Worker error', err);
    });
    console.log('🚀 Notification worker started');
}
