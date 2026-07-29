const express = require('express');
const router = express.Router();
const hostRequestController = require('../../controllers/user/hostRequest.controller.js');
const upload = require('../../../middleware/multer.js');

/**
 * @swagger
 * /user/host-request:
 *   post:
 *     summary: Send a host request (protected)
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Upload images (max 5)
 *               languages:
 *                 type: string
 *                 description: Languages (comma separated)
 *               interests:
 *                 type: string
 *                 description: Interests (comma separated)
 *               agencyCode:
 *                 type: string
 *                 description: Agency code (optional)
 *               telegramId:
 *                 type: string
 *                 description: Telegram username or link (optional)
 *     responses:
 *       201:
 *         description: Host request sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Host request sent successfully"
 */

router.post('/', upload.array('image', 5), hostRequestController.sendHostRequest);

module.exports = router;
