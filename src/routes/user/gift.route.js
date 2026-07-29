const route = require('express').Router();
const hostController = require('../../controllers/host/host.controller');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 *   schemas:
 *     GiftSummary:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           format: uri
 *           example: https://example.com/images/gift.png
 *         totalCount:
 *           type: integer
 *           example: 5
 *
 * /user/gift/gift-receive-list/{id}:
 *   get:
 *     summary: Get total count and image of each gift received by a specific host
 *     tags:
 *       - Gift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the host to retrieve gift summary for
 *     responses:
 *       200:
 *         description: List of gifts with image and total count
 *       400:
 *         description: Host ID not provided
 *       500:
 *         description: Server error
 */

route.get('/gift-receive-list/:id', hostController.getGiftSummaryByHost);

module.exports = route;
