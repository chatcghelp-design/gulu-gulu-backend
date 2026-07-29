const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/common/setting.controller');

/**
 * @swagger
 * /auth/setting:
 *   get:
 *     summary: Get application settings
 *     tags:
 *       - Common
 *     responses:
 *       200:
 *         description: Setting fetched successfully
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */

router.get('/', settingController.getSetting);

module.exports = router;
