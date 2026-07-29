const express = require('express');
const router = express.Router();
const userController = require('../../controllers/admin/user.controller.js');

/**
 * @swagger
 * /common/user/update-availability:
 *   put:
 *     summary: Update host availability
 *     description: Update the availability of a host for random, video, and audio calls (requires token).
 *     tags:
 *        - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availableForRandomCall:
 *                 type: boolean
 *                 example: true
 *               availableForVideoCall:
 *                 type: boolean
 *                 example: false
 *               availableForAudioCall:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Availability updated successfully
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
 *                   example: Availability updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     availableForRandomCall:
 *                       type: boolean
 *                       example: true
 *                     availableForVideoCall:
 *                       type: boolean
 *                       example: false
 *                     availableForAudioCall:
 *                       type: boolean
 *                       example: true
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: Host not found
 *       500:
 *         description: Internal server error
 */
router.put('/update-availability', userController.updateHostAvailability);

/**
 * @swagger
 * /common/user/refundChatCoins:
 *   post:
 *     summary: Refund coins to a user for chat
 *     tags:
 *       - User
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - coins
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user
 *                 example: 64dc9f07a12b3f001e5c9d1a
 *               coins:
 *                 type: integer
 *                 description: The amount of coins to refund
 *                 example: 50
 *     responses:
 *       200:
 *         description: Refund successful
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Refund successful
 *                     totalCoins:
 *                       type: integer
 *                       example: 150
 *                     refundedAmount:
 *                       type: integer
 *                       example: 50
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post('/refundChatCoins', userController.refundChatCoins);

module.exports = router;
