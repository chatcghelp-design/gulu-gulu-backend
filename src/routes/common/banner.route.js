const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/common/banner.controller');
const upload = require('../../../middleware/multer.js');

/**
 @swagger
 * /common/banner/get-banner:
 *   get:
 *     summary: Get all banners
 *     tags:
 *       - Banner
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Banners retrieved
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */
router.get('/get-banner', bannerController.getBanners);

module.exports = router;
