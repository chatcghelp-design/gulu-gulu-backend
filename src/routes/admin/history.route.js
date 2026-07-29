const route = require('express').Router();
const historyController = require('../../controllers/admin/history.controller.js');

route.get('/get', historyController.getHistoryByAdmin);

/**
 * @swagger
 * /admin/history/get-top-up-history:
 *   get:
 *     summary: Get top up history (coin income transactions) by admin
 *     tags:
 *       - Admin History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User or Host ID
 *       - in: query
 *         name: roleType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, host]
 *         description: Role type - user or host
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination start index
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Top up history fetched successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [Purchase Plan, Admin Coin, Ad Coins, loginbouns]
 *                       coin:
 *                         type: number
 *                       note:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       transactionId:
 *                         type: string
 *                       date:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-top-up-history', historyController.getTopUpHistoryByAdmin);

/**
 * @swagger
 * /admin/history/get-spending-history:
 *   get:
 *     summary: Get spending history (coin expense transactions) by admin
 *     tags:
 *       - Admin History
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User or Host ID
 *       - in: query
 *         name: roleType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, host]
 *         description: Role type - user or host
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Pagination start index
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of records to return
 *     responses:
 *       200:
 *         description: Spending history fetched successfully
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [Video call, Audio call, Random call, chat, gift]
 *                       coin:
 *                         type: number
 *                       callUniqueId:
 *                         type: string
 *                       callType:
 *                         type: string
 *                         enum: [Outgoing, Incoming]
 *                       info:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           currentLevel:
 *                             type: number
 *                           totalCoinsSpent:
 *                             type: number
 *                       date:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Bad request - missing required parameters
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-spending-history', historyController.getSpendingHistoryByAdmin);

module.exports = route;
