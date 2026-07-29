const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { sendNotification } = require('../../../utils/notificationFunc.js');
const { userBasicObj } = require('../../../utils/varibles.js');
const moment = require('moment-timezone');
// send notification by admin
exports.sendNotificationByAdmin = async (req, res) => {
    try {
        const { title, message, notificationType, id } = req.body;
        console.log('req.body', req.body);
        let fcmTokens = [];
        if (!id) {
            if (notificationType != 'agency') {
                const findObj = {};
                if (notificationType == 'user') {
                    findObj.isHost = false;
                } else if (notificationType == 'host') {
                    findObj.isHost = true;
                } // else all or user-host

                fcmTokens = await db.User.find({ ...userBasicObj, ...findObj })
                    .distinct('fcmToken')
                    .lean();
            }
            if (notificationType == 'agency' || notificationType == 'all') {
                const tokens = await db.Agency.find({ isDisable: false }).distinct('fcmToken').lean();
                fcmTokens.push(...tokens);
            }
        } else {
            // for perticular one user or host or agency notification
            if (notificationType != 'agency') {
                fcmTokens = await db.User.find({ _id: id, ...userBasicObj })
                    .distinct('fcmToken')
                    .lean();
            } else {
                const tokens = await db.Agency.find({ _id: id, isDisable: false }).distinct('fcmToken').lean();
                fcmTokens.push(...tokens);
            }
        }

        const payload = {
            title: title,
            body: message
        };
        const data = {
            type: 'ADMIN',
            image: req.file?.path || ''
        };
        await sendNotification({ tokens: fcmTokens, payload, data });

        return RESPONSE.success(res, 200, 1001);
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

// schedule notification by admin
exports.scheduleNotification = async (req, res) => {
    try {
        const { title, message, notificationType, date, time, image } = req.body;

        if (!title || !message || !date || !time || !notificationType) {
            return RESPONSE.error(res, 400, 9999, "Missing required fields: title, message, notificationType, date, time");
        }

        // Convert DD-MM-YYYY to YYYY-MM-DD for JavaScript Date object
        // Expected format: DD-MM-YYYY
        // const [day, month, year] = date.split('-');

        // // Combine into ISO format: YYYY-MM-DDTHH:mm:00
        // const isoDateTime = `${year}-${month}-${day}T${time}:00`;
        // const sendAt = new Date(isoDateTime);
        const istDateTime = `${date} ${time}`; // "09-01-2026 17:00"

        const sendAt = moment
            .tz(istDateTime, 'DD-MM-YYYY HH:mm', 'Asia/Kolkata')
            .utc()
            .toDate();

        if (isNaN(sendAt.getTime())) {
            return RESPONSE.error(res, 400, 9999, "Invalid date/time format. Use Date: DD-MM-YYYY and Time: HH:mm");
        }

        const newSchedule = new db.ScheduledNotification({
            title,
            message,
            targetAudience: notificationType, // Matches 'user', 'host', 'all', 'agency'
            sendAt,
            image: req.file ? req.file.path : (image || ''),
            status: 'PENDING'
        });

        await newSchedule.save();

        return RESPONSE.success(res, 200, 1001, { scheduleId: newSchedule._id });
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

// Get list of scheduled notifications (both pending and history)
exports.getScheduledNotifications = async (req, res) => {
    try {
        console.log("Fetching scheduled notifications...");
        const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
        console.log("Query params:", { status, startDate, endDate, page, limit });

        const query = {};

        if (status) query.status = status;

        if (startDate && endDate) {
            query.sendAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        console.log("Constructed MongoDB query:", JSON.stringify(query, null, 2));

        const skip = (page - 1) * limit;

        const schedules = await db.ScheduledNotification.find(query)
            .sort({ sendAt: -1 }) // Newest (or future) first
            .skip(parseInt(skip))
            .limit(parseInt(limit));

        const total = await db.ScheduledNotification.countDocuments(query);
        console.log(`Found ${schedules.length} schedules. Total available: ${total}`);

        return RESPONSE.success(res, 200, 1001, {
            data: schedules,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("GET SCHEDULED NOTIFICATIONS ERROR:", error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

// Delete/Cancel a scheduled notification
exports.deleteScheduledNotification = async (req, res) => {
    try {
        const { scheduleId } = req.query;

        if (!scheduleId) {
            return RESPONSE.error(res, 400, 9999, "Schedule ID is required");
        }

        const schedule = await db.ScheduledNotification.findById(scheduleId);

        if (!schedule) {
            return RESPONSE.error(res, 404, 9999, "Schedule not found");
        }

        if (schedule.status === 'PROCESSING' || schedule.status === 'COMPLETED') {
            return RESPONSE.error(res, 400, 9999, "Cannot delete a processed or completed schedule");
        }

        await db.ScheduledNotification.findByIdAndDelete(scheduleId);

        return RESPONSE.success(res, 200, 1001, { message: "Schedule deleted successfully" });
    } catch (error) {
        console.log(error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};
