const express = require('express');
const router = express.Router();

const levelController = require('../../controllers/admin/level.controller.js');
const upload = require('../../../middleware/multer');

/**
 * @swagger
 * /admin/level/create-level:
 *   post:
 *     tags: [Level]
 *     summary: Create a new level (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - level
 *               - coinRequirement
 *             properties:
 *               level:
 *                 type: number
 *                 example: 1
 *               coinRequirement:
 *                 type: number
 *                 example: 100
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Level created successfully
 *       400:
 *         description: Invalid data or already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

// router.post('/create-level', levelController.createLevel);
router.post(
    '/create-level',
    upload.single('image'),   // IMPORTANT!
    levelController.createLevel
);

/**
 * @swagger
 * /admin/level/get-all-levels:
 *   get:
 *     tags: [Level]
 *     summary: Get all levels (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   level:
 *                     type: number
 *                   coinRequirement:
 *                     type: number
 *                   image:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/get-all-levels', levelController.getAllLevels);

/**
 * @swagger
 * /admin/level/get-level-by-id/{id}:
 *   get:
 *     tags: [Level]
 *     summary: Get level by ID (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 level:
 *                   type: number
 *                 coinRequirement:
 *                   type: number
 *                 image:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *       404:
 *         description: Level not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/get-level-by-id/:id', levelController.getLevelById);

/**
 * @swagger
 * /admin/level/update-level/{id}:
 *   patch:
 *     tags: [Level]
 *     summary: Update level (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: number
 *               coinRequirement:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated successfully
 *       404:
 *         description: Not found
 *       400:
 *         description: Invalid
 *       500:
 *         description: Server error
 */
router.patch(
    '/update-level/:id',
    upload.single('image'), // <-- ADD THIS for updating image
    levelController.updateLevel
);

/**
 * @swagger
 * /admin/level/delete-level/{id}:
 *   delete:
 *     tags: [Level]
 *     summary: Delete level (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Level deleted successfully
 *       404:
 *         description: Level not found
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
router.delete('/delete-level/:id', levelController.deleteLevel);

module.exports = router;

