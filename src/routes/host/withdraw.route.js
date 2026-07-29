const express = require('express');
const route = express.Router();
const withdrawController = require('../../controllers/host/withdraw.controller.js');

/**
 * @swagger
 * /host/withdraw/list:
 *   get:
 *     summary: Get list of withdraw requests by status
 *     tags:
 *       - Withdraw
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: integer
 *         description: "1 = accepted, 2 = pending, 3 = declined"
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Start index for pagination (default: 0)"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: "Number of items to return (default: 20)"
 *     responses:
 *       200:
 *         description: Withdraw list fetched successfully
 *       500:
 *         description: Server error
 */

route.get('/list', withdrawController.getWithdrawList);

/**
 * @swagger
 * /host/withdraw/create:
 *   post:
 *     summary: Create a withdraw request by host
 *     tags:
 *       - Withdraw
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentGateway:
 *                 type: string
 *                 description: "Payment gateway to use"
 *               description:
 *                 type: string
 *                 description: "Optional description for the request"
 *               coins:
 *                 type: integer
 *                 description: "Number of coins to withdraw"
 *               upiId:
 *                 type: string
 *                 description: "Optional UPI ID for the request"
 *               name:
 *                 type: string
 *                 description: "Optional name for the request"
 *     responses:
 *       200:
 *         description: Withdraw request created successfully
 *       400:
 *         description: Minimum coin requirement not met
 *       500:
 *         description: Server error
 */
route.post('/create', withdrawController.createWithdrwRequest);

module.exports = route;
    