import admin from 'firebase-admin';
import serviceAccount from '../qesdo.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
import User from '../User/models/user';

export const sendRealTimeNotification = async (
  userId: string,
  payload: {
    title: string;
    message: string;
    postId: string;
  }
) => {
  try {
    const user = await User.findByPk(userId);

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

    const response = await admin.messaging().send(message);
    console.log(`✅ Notification sent to user ${userId}: ${response}`);
  } catch (error) {
    console.error(`❌ Failed to send notification to ${userId}`, error);
  }
};
