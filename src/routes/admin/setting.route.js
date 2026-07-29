const express = require('express');
const router = express.Router();
const settingController = require('../../controllers/admin/setting.controller');

/**
 * @swagger
 * /admin/setting:
 *   post:
 *     summary: Create a new setting
 *     tags:
 *       - Setting
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/', settingController.createSetting);

router.get('/get-setting', settingController.getSetting);

/**
 * @swagger
 * /admin/setting/{id}:
 *   put:
 *     summary: Update a setting by ID
 *     tags:
 *       - Setting
 *     security:
 *       - bearerAuth: []
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
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', settingController.updateSettingById);

module.exports = router;
