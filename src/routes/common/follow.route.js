const express = require('express');
const router = express.Router();
const followController = require('../../controllers/common/follow.controller.js');

/**
 * @swagger
 * /common/follow/follow-unfollow:
 *   post:
 *     summary: Follow or unfollow a user or host
 *     tags:
 *       - Common
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
 *                 enum: [follow, unfollow]
 *                 example: "follow"
 *     responses:
 *       200:
 *         description: Successfully followed/unfollowed
 *       201:
 *         description: Followed successfully
 *       400:
 *         description: Bad request or not following
 *       500:
 *         description: Server error
 */

router.post('/follow-unfollow', followController.followOrUnfollow);

/**
 * @swagger
 * /common/follow/get-follow-list:
 *   get:
 *     summary: Get current user's follow and follower list
 *     tags:
 *       - Common
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully fetched list
 *       500:
 *         description: Server error
 */
router.get('/get-follow-list', followController.getMyFollowList);

module.exports = router;
