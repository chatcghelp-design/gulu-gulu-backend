const { db } = require('../model/index.js');
const { sendNotification } = require('../../utils/notificationFunc.js');
const { userBasicObj } = require('../../utils/varibles.js');

const checkAndSendScheduledNotifications = async () => {
    try {
        const now = new Date();

        // Find notifications that are PENDING and due (sendAt <= now)
        const pendingNotifications = await db.ScheduledNotification.find({
            status: 'PENDING',
            sendAt: { $lte: now }
        }).limit(10); // Process in batches to avoid memory overload

        if (pendingNotifications.length === 0) {
            return;
        }

        console.log(`[Scheduler] Found ${pendingNotifications.length} notifications to send.`);

        for (const plan of pendingNotifications) {
            // Mark as PROCESSING so other workers (if any) don't pick it up
            // Or just to prevent double processing in next tick if this takes > 30s
            plan.status = 'PROCESSING';
            await plan.save();

            try {
                let fcmTokens = [];
                const notificationType = plan.targetAudience; //targetAudience= user host all

                // Logic copied/adapted from admin notification controller
                if (notificationType !== 'agency') {
                    const findObj = {};
                    if (notificationType === 'user') {
                        findObj.isHost = false;
                    } else if (notificationType === 'host') {
                        findObj.isHost = true;
                    }
                    // else 'all', fetch both (which is just all users in this schema context usually)

                    // NOTE: If 'all' means User + Host + Agency, logic needs to be careful
                    // Existing controller logic:
                    // if (notificationType == 'user') findObj.isHost = false;
                    // else if (notificationType == 'host') findObj.isHost = true;
                    // // else all or user-host (implies no filter on isHost)

                    const users = await db.User.find({ ...userBasicObj, ...findObj })
                        .distinct('fcmToken')
                        .lean();

                    if (users) fcmTokens.push(...users);
                }// sirf active / valid users (userBasicObj) plus filter (findObj) user → isHost=false host → isHost=true all → koi filter nahi
                // Fir un sab ke unique FCM tokens nikal leta hai.

                if (notificationType === 'agency' || notificationType === 'all') {
                    const tokens = await db.Agency.find({ isDisable: false }).distinct('fcmToken').lean();
                    if (tokens) fcmTokens.push(...tokens);
                }

                if (fcmTokens.length > 0) {
                    const payload = {
                        title: plan.title, // notification title
                        body: plan.message // notification body
                    };
                    const data = {
                        type: 'ADMIN',
                        image: plan.image || ''
                    };

                    await sendNotification({ tokens: fcmTokens, payload, data }); // send notification
                    console.log(`[Scheduler] Sent '${plan.title}' to ${fcmTokens.length} devices.`);
                } else {
                    console.log(`[Scheduler] No tokens found for '${plan.title}'.`);
                }

                plan.status = 'COMPLETED';
                await plan.save();

            } catch (err) {
                console.error(`[Scheduler] Error processing notification ${plan._id}:`, err);
                plan.status = 'FAILED';
                await plan.save();
            }
        }
    } catch (error) {
        console.error('[Scheduler] Global error:', error);
    }
};

const initNotificationScheduler = () => {
    console.log('[Scheduler] Notification background worker started (Interval: 30s)');
    // Run immediately on start
    checkAndSendScheduledNotifications();

    // Then every 30 seconds
    setInterval(checkAndSendScheduledNotifications, 30 * 1000);
};

module.exports = { initNotificationScheduler };
