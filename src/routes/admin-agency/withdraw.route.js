const express = require('express');
const route = express.Router();
const withdrawController = require('../../controllers/admin-agency/withdraw.controller.js');

/**
 * @swagger
 * /admin-agency/withdraw/withdraw-request/list:
 *   get:
 *     summary: Get list of host withdraw requests (agency/admin)
 *     tags:
 *       - Agency - Withdraw
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         required: false
 *         schema:
 *           type: number
 *         description: Pagination start index (default is 0)
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: number
 *         description: Pagination limit (default is 20)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         description: "host or agency"
 *     responses:
 *       200:
 *         description: List of host withdraw requests filtered by role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 code:
 *                   type: number
 *                   example: 1001
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 64d1b123456789abcdef1234
 *                       userId:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           isHost:
 *                             type: boolean
 *                           coins:
 *                             type: number
 *                           withdrawCoins:
 *                             type: number
 *                           pendingWithdrwCoins:
 *                             type: number
 *                       coins:
 *                         type: number
 *                       status:
 *                         type: number
 *                         description: 0 = pending, 2 = accepted, 3 = declined
 *                       type:
 *                         type: number
 *                         description: agency, host
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       403:
 *         description: Forbidden - access denied for non-admin/agency roles
 *       500:
 *         description: Internal server error
 */

route.get('/withdraw-request/list', withdrawController.getWithdrawList);

/**
 * @swagger
 * /admin-agency/withdraw/withdraw-request/{withdrawId}:
 *   put:
 *     summary: Accept or decline a withdraw request
 *     tags:
 *       - Agency - Withdraw
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: withdrawId
 *         required: true
 *         schema:
 *           type: string
 *         description: Withdraw request MongoDB ID
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: number
 *           enum: [2, 3]
 *         description: 2 for accept, 3 for decline
 *     responses:
 *       200:
 *         description: Withdraw request updated
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       404:
 *         description: Withdraw request not found
 */

route.put('/withdraw-request/:withdrawId', withdrawController.handaleWithdrawRequest);

module.exports = route;
