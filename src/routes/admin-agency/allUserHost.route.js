const express = require('express');
const route = express.Router();
const hostController = require('../../controllers/admin-agency/userHost.controller.js');
const userController = require('../../controllers/admin/user.controller.js');
const commonController = require('../../controllers/common/userHost.controller.js');

/**
 * @swagger
 * /admin-agency/user-host/get-user-host:
 *   get:
 *     summary: Get list of host users
 *     tags:
 *       - Admin-Agency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or uniqueId
 *       - in: query
 *         name: isFake
 *         schema:
 *           type: boolean
 *         description: Filter by fake users
 *       - in: query
 *         name: isHost
 *         schema:
 *           type: boolean
 *         description: Filter by host status
 *     responses:
 *       200:
 *         description: host.list
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */

route.get('/get-user-host', hostController.getUserHostsList);

route.get('/get-user/:userId', userController.getUserById);

route.put('/update-coins', commonController.updateUserCoins);


/**
 * @swagger
 * /admin-agency/user-host/get-fake-hosts:
 *   get:
 *     summary: Get list of fake hosts only
 *     tags:
 *       - Admin-Agency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: fake.host.list
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */

// Sirf fake hosts ke liye new API
route.get('/get-fake-hosts', hostController.getFakeHostsList);

module.exports = route;
