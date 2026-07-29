const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/multer.js');

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

router.post('/send', upload.single('image'), notificationController.sendNotificationByAdmin);

module.exports = router;
