const express = require('express');
const route = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller.js');

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           example: 2025-08-01
 *         description: Start date in YYYY-MM-DD format or 'all'
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           example: 2025-08-14
 *         description: End date in YYYY-MM-DD format or 'all'
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard stats
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
 *                     totalUsers:
 *                       type: integer
 *                       example: 150
 *                     totalHosts:
 *                       type: integer
 *                       example: 45
 *                     totalBlockedUsers:
 *                       type: integer
 *                       example: 10
 *                     totalBlockedHosts:
 *                       type: integer
 *                       example: 3
 *                     totalActiveUsers:
 *                       type: integer
 *                       example: 20
 *                     totalActiveHosts:
 *                       type: integer
 *                       example: 5
 *                     totalAgencies:
 *                       type: integer
 *                       example: 8
 *                     totalDisableAgencies:
 *                       type: integer
 *                       example: 2
 *                     totalPendingHosts:
 *                       type: integer
 *                       example: 7
 *       500:
 *         description: Server error
 */

route.get('/', dashboardController.getDashboard);

module.exports = route;
