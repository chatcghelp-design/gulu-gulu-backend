const express = require('express');
const route = express.Router();
const commonController = require('../../controllers/common/history.controller.js');

/**
 * @swagger
 * /common/history/get:
 *   get:
 *     summary: Get history for logged-in user (token-wise)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User history fetched successfully
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
 *                   example: User history fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       type:
 *                         type: string
 *                         example: "Purchase Plan"
 *                       userCoin:
 *                         type: integer
 *                       userCoinType:
 *                         type: string
 *                         enum: [plus, minus]
 *                       note:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                         example: "razorpay"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
route.get('/get', commonController.getHistory);

/**
 * @swagger
 * /common/history/get-call-history:
 *   get:
 *     summary: Get history for logged-in user (token-wise)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User history fetched successfully
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
 *                   example: User history fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       type:
 *                         type: string
 *                         example: "Purchase Plan"
 *                       userCoin:
 *                         type: integer
 *                       userCoinType:
 *                         type: string
 *                         enum: [plus, minus]
 *                       note:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                         example: "razorpay"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
route.get('/get-call-history', commonController.getCallHistory);
/**
 * @swagger
 * /common/history/get-top-up-history:
 *   get:
 *     summary: Get top up history (coin income transactions)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-top-up-history', commonController.getTopUpHistory);

/**
 * @swagger
 * /common/history/get-spending-history:
 *   get:
 *     summary: Get spending history (coin expense transactions)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-spending-history', commonController.getSpendingHistory);


/**
 * @swagger
 * /common/history/get-purchase-history:
 *   get:
 *     summary: Get user purchase history (coin plans)
 *     tags:
 *       - History
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Purchase history fetched successfully
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
 *                         example: "Purchase Plan"
 *                       coin:
 *                         type: number
 *                         example: 100
 *                       note:
 *                         type: string
 *                       paymentMethod:
 *                         type: string
 *                       transactionId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       date:
 *                         type: string
 *                         example: "2024-01-30 15:30:00"
 *                       planInfo:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           validity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           currency:
 *                             type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-purchase-history', commonController.getPurchaseHistory);

module.exports = route;
