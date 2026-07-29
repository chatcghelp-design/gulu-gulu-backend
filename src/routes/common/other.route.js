const express = require('express');
const route = express.Router();
const upload = require('../../../middleware/multer.js');

const otherController = require('../../controllers/common/other.controller.js');

/**
 * @swagger
 * /common/generateUrl:
 *   post:
 *     summary: Generate a URL for an uploaded image
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Success
 */
route.post('/generateUrl', upload.single('image'), otherController.generateUrl);

/**
 * @swagger
 * /common/watchAds:
 *   post:
 *     tags:
 *       - Ads
 *     summary: Watch an ad and earn coins
 *     description: Marks the ad as watched for the user and updates the user's coins and ads count. Limits the number of ads watched per day based on settings.
 *     security:
 *       - bearerAuth: []   # JWT auth required
 *     responses:
 *       200:
 *         description: Ad watched successfully, coins updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ad watched successfully, 10 coins added"
 *                 coins:
 *                   type: integer
 *                   example: 50
 *                 adsViewCount:
 *                   type: integer
 *                   example: 1
 *                 adsLimit:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Bad request, e.g., ads limit reached or settings not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Ads limit reached for today"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */

route.post('/watchAds', otherController.watchAd);

module.exports = route;
