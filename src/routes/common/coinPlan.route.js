const express = require('express');
const route = express.Router();
const coinPlanController = require('../../controllers/common/coinPlan.controller.js');

/**
 * @swagger
 * /common/coin-plans/active-all-plans:
 *   get:
 *     summary: Get all active coin plans (User)
 *     description: Users can view all active coin plans
 *     tags:
 *       - Coin Plan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active coin plans retrieved successfully
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
 *                   example: "Active coin plans retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       coins:
 *                         type: number
 *                       rupees:
 *                         type: number
 *                       dollars:
 *                         type: number
 *                       description:
 *                         type: string
 *                       isActive:
 *                         type: boolean
 *                         example: true
 *                       offer:
 *                         type: number
 *                         description: Offer amount or percentage
 *                         example: 10
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
// Get all active coin plans (User)
route.get('/active-all-plans', coinPlanController.getActiveCoinPlans);

/**
 * @swagger
 * /common/coin-plans/purchase:
 *   post:
 *     summary: Purchase a coin plan
 *     description: User can purchase a coin plan and get coins added to their account
 *     tags:
 *       - Coin Plan
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethod
 *               - transactionId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: ID of the coin plan to purchase
 *                 example: "507f1f77bcf86cd799439011"
 *               paymentMethod:
 *                 type: string
 *                 description: Payment method used
 *                 example: "razorpay"
 *               transactionId:
 *                 type: string
 *                 description: Payment transaction ID from payment gateway
 *                 example: "pay_1234567890"
 *     responses:
 *       200:
 *         description: Plan purchased successfully
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
 *                   example: "Plan purchased successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Successfully purchased Basic Plan"
 *                     coinsAdded:
 *                       type: number
 *                       example: 100
 *                     totalCoins:
 *                       type: number
 *                       example: 250
 *                     plan:
 *                       type: object
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Plan not found or inactive
 *       500:
 *         description: Internal server error
 */
// Purchase coin plan
route.post('/purchase', coinPlanController.purchaseCoinPlan);

module.exports = route;
