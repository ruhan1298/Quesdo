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
exports.sendRealTimeNotification = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const qesdo_json_1 = __importDefault(require("../qesdo.json"));
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(qesdo_json_1.default),
});
const user_1 = __importDefault(require("../User/models/user"));
const sendRealTimeNotification = (userId, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findByPk(userId);
        if (!user || !user.deviceToken) {
            console.log(`⚠️ No FCM token for user ${userId}`);
            return;
        }
        const message = {
            notification: {
                title: payload.title,
                body: payload.message,
            },
            data: {
                postId: payload.postId,
            },
            token: user.deviceToken,
        };
        const response = yield firebase_admin_1.default.messaging().send(message);
        console.log(`✅ Notification sent to user ${userId}: ${response}`);
    }
    catch (error) {
        console.error(`❌ Failed to send notification to ${userId}`, error);
    }
});
exports.sendRealTimeNotification = sendRealTimeNotification;
