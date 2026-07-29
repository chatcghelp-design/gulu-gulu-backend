const route = require('express').Router();
const giftCategoryController = require('../../controllers/admin/giftCategory.controller.js');

/**
 * @swagger
 * /admin/gift-category:
 *   post:
 *     summary: Create a new gift category
 *     tags:
 *       - Gift Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
route.post('/', giftCategoryController.createGiftCategory);

/**
 * @swagger
 * /admin/gift-category/gift-category-list:
 *   get:
 *     summary: Get all gift categories
 *     tags:
 *       - Gift Category
 *     responses:
 *       200:
 *         description: Success
 */
route.get('/gift-category-list', giftCategoryController.getGiftCategoryList);



/**
 * @swagger
 * /admin/gift-category/{id}:
 *   put:
 *     summary: Update a gift category by ID
 *     tags:
 *       - Gift Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
route.put('/:id', giftCategoryController.updateGiftCategory);

/**
 * @swagger
 * /admin/gift-category/{id}:
 *   delete:
 *     summary: Delete a gift category by ID
 *     tags:
 *       - Gift Category
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
route.delete('/:id', giftCategoryController.deleteGiftCategory);

module.exports = route;
