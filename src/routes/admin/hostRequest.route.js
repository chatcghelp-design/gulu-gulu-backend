const express = require('express');
const router = express.Router();
const hostRequestController = require('../../controllers/admin/hostRequest.controller.js');

router.get('/getHostRequest',hostRequestController.getHostRequest);

/**
 * @swagger
 * /admin/host-request/{requestId}:
 *   post:
 *     summary: Approve or reject a host request (admin)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *         description: Host request MongoDB _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: Action to perform on the host request
 *               reason:
 *                 type: string
 *                 description: Reason for approval or rejection (optional)
 *               agencyCode:
 *                 type: string
 *                 description: Agency code to assign (required only if approving and not already assigned)
 *     responses:
 *       200:
 *         description: Host request processed successfully
 *       400:
 *         description: Invalid input or host request already processed
 *       404:
 *         description: Host request or agency not found
 *       500:
 *         description: Internal server error
 */

router.post('/:requestId', hostRequestController.handleHostRequest);

/**
 * @swagger
 * /admin/host-request/{userId}:
 *   get:
 *     summary: Get Host Info by User ID
 *     description: Retrieve full user and host profile information for a given user ID. Only if the user is a host.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The MongoDB _id of the user
 *     responses:
 *       200:
 *         description: Host info retrieved successfully
 *       404:
 *         description: User not found or not a host
 *       500:
 *         description: Internal server error
 */
router.get('/:userId', hostRequestController.hostInfo);



module.exports = router;
