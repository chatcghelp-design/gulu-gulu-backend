const express = require('express');
const route = express.Router();
const complaintController = require('../../controllers/admin-agency/complaint.controller.js');

/**
 * @swagger
 * /admin-agency/complain/all:
 *   get:
 *     summary: Get all complaints (Admin only)
 *     tags: [Admin Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, closed]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Complaints retrieved successfully
 *       500:
 *         description: Server error
 */
route.get('/all', complaintController.getAllComplains);

/**
 * @swagger
 * /admin-agency/complain/{complaintId}:
 *   patch:
 *     summary: Update complaint status and response by Admin or Agency
 *     tags: [Admin Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, closed]
 *               adminResponse:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 */
route.patch('/:complainId',  complaintController.resolveComplaint);



module.exports = route;
