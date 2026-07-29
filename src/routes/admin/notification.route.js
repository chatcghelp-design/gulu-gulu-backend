const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/multer');

const notificationController = require('../../controllers/admin/notification.controller.js');

/**
 * @swagger
 * /admin/notification/send:
 *   post:
 *     summary: Send a notification from admin to users or hosts
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - notificationType
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the user or host to send the notification
 *                 example: "689c499189f1c193fa162a29"
 *               title:
 *                 type: string
 *                 example: "System Update"
 *               message:
 *                 type: string
 *                 example: "We have scheduled maintenance tonight."
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image to include in the notification
 *               notificationType:
 *                 type: string
 *                 enum: [user, host, user-host, agency , all]
 *                 example: "user"
 *                 description: "Send to 'user' or 'host' or 'user-host' or 'agency' or 'all' users"
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:    
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: integer
 *                   example: 1001
 *       500:
 *         description: Server error
 */


/**
 * @swagger
 * /admin/notification/schedule:
 *   post:
 *     summary: Schedule a notification for future delivery
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *               - notificationType
 *               - date
 *               - time
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               date:
 *                 type: string
 *                 example: "25-10-2025"
 *                 description: "Date in DD-MM-YYYY format"
 *               time:
 *                 type: string
 *                 example: "14:30"
 *                 description: "Time in HH:mm format (24h)"
 *               image:
 *                 type: string
 *                 format: binary
 *               notificationType:
 *                 type: string
 *                 enum: [user, host, agency, all]
 *     responses:
 *       200:
 *         description: Notification scheduled successfully
 *       500:
 *         description: Server error
 */
router.post('/schedule', upload.single('image'), notificationController.scheduleNotification);


/**
 * @swagger
 * /admin/notification/schedule:
 *   get:
 *     summary: Get list of scheduled notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of scheduled notifications
 *       500:
 *         description: Server error
 */
router.get('/schedule', notificationController.getScheduledNotifications);

/**
 * @swagger
 * /admin/notification/schedule:
 *   delete:
 *     summary: Cancel/Delete a scheduled notification
 *     tags:
 *       - Notifications
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: scheduleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Schedule deleted successfully
 *       500:
 *         description: Server error
 */
router.delete('/schedule', notificationController.deleteScheduledNotification);

router.post('/send', upload.single('image'), notificationController.sendNotificationByAdmin);

module.exports = router;
