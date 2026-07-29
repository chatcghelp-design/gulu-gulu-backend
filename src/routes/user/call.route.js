const express = require('express');
const router = express.Router();
const callController = require('../../controllers/user/call.controller.js');

/**
 * @swagger
 * /user/call/random-call:
 *   post:
 *     summary: Initiate a random call
 *     description: User initiates a random call to be matched with an available host
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
 *               - callUniqueId
 *             properties:
 *               callUniqueId:
 *                 type: string
 *                 description: Unique identifier for the call
 *                 example: "call_abc123xyz"
 *               agoraUID:
 *                 type: number
 *                 description: Agora user ID (optional)
 *                 example: 12345
 *     responses:
 *       200:
 *         description: Random call initiated successfully
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
 *                   example: "random call proceed"
 *       400:
 *         description: Bad request (user not found, already in call, etc.)
 *       500:
 *         description: Internal server error
 */
router.post('/random-call', callController.randomCall);

module.exports = router;

