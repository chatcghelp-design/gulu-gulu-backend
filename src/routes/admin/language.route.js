const express = require('express');
const router = express.Router(); // ✅ This was missing

const languageController = require('../../controllers/admin/language.controller.js');

/**
 * @swagger
 * /admin/language/get-all-language:
 *   get:
 *     tags: [Language]
 *     summary: Get all available languages (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of languages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   language:
 *                     type: string
 *                   isDeleted:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */

router.get('/get-all-language', languageController.getAllLanguages);




/**
 * @swagger
 * /admin/language/create-language:
 *   post:
 *     tags: [Language]
 *     summary: Create a new language (Admin Only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *                 example: "Hindi"
 *     responses:
 *       201:
 *         description: Language created successfully
 *       400:
 *         description: Language already exists
 *       401:
 *         description: Unauthorized - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/create-language', languageController.createLanguage);


module.exports = router; // ✅ Now router is defined
