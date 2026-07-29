const express = require('express');
const route = express.Router();
const blockController = require('../../controllers/common/block.controller.js');

/**
 * @swagger
 * /common/block:
 *   post:
 *     summary: Block or unblock a user or host
 *     tags:
 *       - Block
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - action
 *             properties:
 *               id:
 *                 type: string
 *                 example: "60f6f4d8c45a5e001e8c3e6a"
 *               action:
 *                 type: string
 *                 enum:
 *                   - "1"
 *                   - "2"
 *                 description: "'1' for block, '2' for unblock"
 *                 example: "1"
 *     responses:
 *       200:
 *         description: Success or already blocked/unblocked
 *       201:
 *         description: Blocked successfully
 *       400:
 *         description: Bad request or not blocked
 *       500:
 *         description: Server error
 */

route.post('/', blockController.blockUnblock);

/**
 * @swagger
 * /common/block/list:
 *   get:
 *     summary: Get list of users or hosts blocked by the logged-in user
 *     tags:
 *       - Block
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         required: false
 *         description: Search by name, email, or uniqueId
 *       - in: query
 *         name: start
 *         schema:
 *           type: integer
 *         required: false
 *         description: Pagination start index (default is 0)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *         description: Pagination limit (default is 20)
 *     responses:
 *       200:
 *         description: Block list retrieved successfully
 *       500:
 *         description: Server error
 */

route.get('/list', blockController.getBlockList);

module.exports = route;
