const express = require('express');
const router = express.Router();
const agencyController = require('../../controllers/admin/agency.controller');

/**
 * @swagger
 * /admin/agency/agency-list:
 *   get:
 *     summary: Get list of agencies
 *     tags:
 *       - Agency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by agency name or code
 *     responses:
 *       200:
 *         description: agency.list
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/agency-list', agencyController.getAgencyList);
/**
 * @swagger
 * /admin/agency/agency-list/{id}:
 *   get:
 *     summary: Get agency by ID
 *     description: Retrieve agency details by MongoDB ID.
 *     tags:
 *       - Agency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the agency
 *     responses:
 *       200:
 *         description: Agency data retrieved successfully
 *       403:
 *         description: Unauthorized access
 *       404:
 *         description: Agency not found
 *       500:
 *         description: Internal server error
 */
router.get('/agency-list/:id', agencyController.getAgencyById);

/**
 * @swagger
 * /admin/agency/block:
 *   put:
 *     summary: Enable or disable an agency
 *     tags:
 *       - Agency
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agencyId
 *         required: true
 *         schema:
 *           type: string
 *           example: 64dc9f07a12b3f001e5c9d1a
 *         description: The ID of the agency to enable or disable
 *       - in: query
 *         name: otherAgencyId
 *         required: false
 *         schema:
 *           type: string
 *           example: 64dc9f07a12b3f001e5c9d1b
 *         description: The ID of the agency to transfer hosts to (required when disabling an agency)
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [disable, enable]
 *           example: disable
 *         description: "Action type — 'disable' to block an agency, 'enable' to unblock"
 *     responses:
 *       200:
 *         description: Agency status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 code:
 *                   type: string
 *                   example: agency.block
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 64dc9f07a12b3f001e5c9d1a
 *                     isDisable:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Agency already disabled
 *       404:
 *         description: Agency not found
 *       500:
 *         description: Server error
 */
router.put('/block', agencyController.blockAgency);

module.exports = router;
