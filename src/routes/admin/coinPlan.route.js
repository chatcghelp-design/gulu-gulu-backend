const express = require('express');
const route = express.Router();
const coinPlanController = require('../../controllers/admin/coinPlan.controller.js');

/**
 * @swagger
 * /admin/coin-plan/create-plan:
 *   post:
 *     summary: Create a new coin plan
 *     description: Admin can create new coin plans for users to purchase
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
 *               - name
 *               - coins
 *               - rupees
 *               - dollars
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the coin plan
 *                 example: "Basic Plan"
 *               coins:
 *                 type: number
 *                 description: Number of coins in the plan
 *                 example: 100
 *               rupees:
 *                 type: number
 *                 description: Price in Indian Rupees
 *                 example: 99
 *               dollars:
 *                 type: number
 *                 description: Price in US Dollars
 *                 example: 1.99
 *               description:
 *                 type: string
 *                 description: Description of the plan
 *                 example: "Get 100 coins for ₹99"
 *               offer:
 *                 type: number
 *                 description: Offer amount or percentage (default 0)
 *                 example: 10
 *               isHidden:
 *                 type: boolean
 *                 description: "If true, plan is hidden from users"
 *                 default: false
 *     responses:
 *       201:
 *         description: Coin plan created successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
// Create new coin plan
route.post('/create-plan', coinPlanController.createCoinPlan);

/**
 * @swagger
 * /admin/coin-plan/update-plan/{id}:
 *   put:
 *     summary: Update a coin plan by ID
 *     description: Admin can update existing coin plans
 *     tags:
 *       - Coin Plan
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Coin plan ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the coin plan
 *                 example: "Premium Plan"
 *               coins:
 *                 type: number
 *                 description: Number of coins in the plan
 *                 example: 500
 *               rupees:
 *                 type: number
 *                 description: Price in Indian Rupees
 *                 example: 499
 *               dollars:
 *                 type: number
 *                 description: Price in US Dollars
 *                 example: 4.99
 *               description:
 *                 type: string
 *                 description: Description of the plan
 *                 example: "Get 500 coins for ₹499"
 *               isActive:
 *                 type: boolean
 *                 description: Whether the plan is active
 *                 example: true
 *               offer:
 *                 type: number
 *                 description: Offer amount or percentage (default 0)
 *                 example: 10
 *               isHidden:
 *                 type: boolean
 *                 description: "If true, plan is hidden from users"
 *                 example: false
 *     responses:
 *       200:
 *         description: Coin plan updated successfully
 *       400:
 *         description: Bad request - validation error
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Coin plan not found
 *       500:
 *         description: Internal server error
 */
// Update coin plan
route.put('/update-plan/:id', coinPlanController.updateCoinPlan);

/**
 * @swagger
 * /admin/coin-plan/all-plans:
 *   get:
 *     summary: Get all coin plans (Admin)
 *     description: Admin can view all coin plans (active + inactive, excluding deleted)
 *     tags:
 *       - Coin Plan
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All coin plans retrieved successfully
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
 *                   example: "All coin plans retrieved successfully"
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
 *                       isDeleted:
 *                         type: boolean
 *       401:
 *         description: Unauthorized - invalid token
 *       500:
 *         description: Internal server error
 */
// Get all coin plans (Admin)
route.get('/all-plans', coinPlanController.getAllCoinPlans);

/**
 * @swagger
 * /admin/coin-plan/purchased-users:
 *   get:
 *     summary: Get history of all coin plan purchases (Flat List with Pagination)
 *     description: Returns a flat list of purchase transactions with user and plan details, including pagination metadata.
 *     tags:
 *       - Coin Plan
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
 *         description: Number of items to return
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *         description: Start date for filter (YYYY-MM-DD or ISO string)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *         description: End date for filter (YYYY-MM-DD or ISO string)
 *     responses:
 *       200:
 *         description: Purchase history retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of records
 *                     limit:
 *                       type: integer
 *                       description: Items per page
 *                     start:
 *                       type: integer
 *                       description: Start index
 *                     totalPage:
 *                       type: integer
 *                       description: Total pages
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userName:
 *                             type: string
 *                           uniqueId:
 *                             type: string
 *                           email:
 *                             type: string
 *                           avatar:
 *                             type: string
 *                           country:
 *                             type: string
 *                           planName:
 *                             type: string
 *                           purchaseDate:
 *                             type: string
 *                             format: date-time
 *                           coins:
 *                             type: number
 *                           price:
 *                             type: number
 *       500:
 *         description: Internal server error
 */
// Get list of unique users who have purchased coin plans
route.get('/purchased-users', coinPlanController.getUsersWhoPurchasedPlans);

module.exports = route;
