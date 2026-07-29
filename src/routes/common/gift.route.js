const express = require('express');
const router = express.Router();
const giftController = require('../../controllers/common/gift.controller');

/**
 * @swagger
 * /common/gift/by-category:
 *   get:
 *     summary: Get all gifts by categoryId
 *     tags:
 *       - Gift
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/by-category', giftController.getGiftsByCategory);

module.exports = router;
