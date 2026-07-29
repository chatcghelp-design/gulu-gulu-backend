const express = require('express');
const router = express.Router();
const bannerController = require('../../controllers/common/banner.controller');
const upload = require('../../../middleware/multer.js');

/**
 * @swagger
 * /admin/banner/create-banner:
 *   post:
 *     summary: Create a new banner
 *     tags:
 *       - Banner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - image
 *               - link
 *               - isForHost
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               isForHost:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Banner created
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */

router.post('/create-banner', upload.single('image'), bannerController.createBanner);

router.get('/list',bannerController.getBanners)


/**
 * @swagger
 * /admin/banner/update-banner/{id}:
 *   put:
 *     summary: Update a banner
 *     tags:
 *       - Banner
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the banner to update
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               link:
 *                 type: string
 *               isForHost:
 *                 type: boolean
 *               isDeleted:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Banner updated
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Server Error
 */

router.put('/update-banner/:id', upload.single('image'), bannerController.updateBanner);

router.delete('/banner-delete/:id', bannerController.deleteBanner);

module.exports = router;
