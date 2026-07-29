const admin = require('firebase-admin');
const serviceAccount = require('../fcm-service.json'); // your Firebase service account file

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
global.globalFirebaseDB = admin.firestore();

// Send FCM notification
const sendNotification = async ({ tokens, payload, data = {} }) => {
    try {
        if (!Array.isArray(tokens)) {
            tokens = [tokens];
        }
        // Remove empty, undefined, or clearly invalid tokens
        tokens = tokens.filter(t => typeof t === 'string' && t.trim() !== '');
        if (tokens.length) {
            const message = {
                tokens,
                notification: payload,
                data
            };
            const response = await admin.messaging().sendEachForMulticast(message);
            console.log('Notification sent:', response, response.responses[0].error);
        } else {
            console.log('No tokens');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
};

module.exports = { sendNotification };
