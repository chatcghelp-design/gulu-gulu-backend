const express = require('express');
const route = express.Router();
const giftCategoryController = require('../../controllers/common/giftCategory.controller');

/**
 * @swagger
 * /common/gift-category:
 *   get:
 *     summary: Get all active gift categories
 *     tags:
 *       - Gift Category
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
route.get('/', giftCategoryController.getAllActiveGiftCategories);

module.exports = route;
