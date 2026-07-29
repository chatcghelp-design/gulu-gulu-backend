const route = require('express').Router();
const giftController = require('../../controllers/admin/gift.controller.js');
const upload = require('../../../middleware/multer.js');
const giftByCategoryController = require('../../controllers/common/gift.controller');

/**
 * @swagger
 * /admin/gift:
 *   post:
 *     summary: Create a new gift under a category
 *     tags:
 *       - Gift
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               coins:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
route.post('/', upload.single('image'), giftController.createGift);

route.get('/giftByCategory', giftByCategoryController.getGiftsByCategory);

route.get('/All-gift', giftController.getAllGifts);

/**
 * @swagger
 * /admin/gift/{id}:
 *   put:
 *     summary: Update a gift by ID
 *     tags:
 *       - Gift
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               coins:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
route.put('/:id', upload.single('image'), giftController.updateGift);

module.exports = route;
