const route = require('express').Router();
const withdrawController = require('../../controllers/agency/withdraw.controller.js');

// @todo swagger
/**
 * @swagger
 * /agency/withdraw:
 *   post:
 *     summary: Create a withdraw request by agency
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
 *     responses:
 *       200:
 *         description: Withdraw request created successfully
 *       400:
 *         description: Invalid input or insufficient balance
 *       500:
 *         description: Server error
 */

route.post('/', withdrawController.createWithdrwRequest);



// @todo swagger
/**
 * @swagger
 * /agency/withdraw/get-withdraw:
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
 *         description: "Limit for pagination (default: 20)"
 *     responses:
 *       200:
 *         description: List of withdraw requests
 *       500:
 *         description: Server error
 */
route.get('/get-withdraw', withdrawController.getAgencyWithdrawList);

module.exports = route;
