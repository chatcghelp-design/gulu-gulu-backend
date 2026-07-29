const express = require('express');
const route = express.Router();
const complaintController = require('../../controllers/common/complaint.controller.js');
const upload = require('../../../middleware/multer.js');

/**
 * @swagger
 * /common/complaint/submit:
 *   post:
 *     summary: Submit a new complaint (User/Host)
 *     tags: [Common Complaints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - contact
 *             properties:
 *               message:
 *                 type: string
 *                 description: Complaint message (min 10 characters)
 *               contact:
 *                 type: string
 *                 description: Contact information (email or phone)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image attachment
 *     responses:
 *       201:
 *         description: Complaint submitted successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
route.post('/submit', upload.single('image'), complaintController.submitComplaint);

/**
 * @swagger
 * /common/complaint/{complaintId}:
 *   put:
 *     summary: Update your submitted complaint (before it's closed)
 *     tags: [Common Complaints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: complaintId
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Updated complaint message (min 10 characters)
 *               contact:
 *                 type: string
 *                 description: Updated contact info (email or phone)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Optional updated image
 *     responses:
 *       200:
 *         description: Complaint updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Complaint not found
 *       500:
 *         description: Server error
 */
route.put('/:complaintId', upload.single('image'), complaintController.updateComplaintByUser);


/**
 * @swagger
 * /common/complaint/get-complain:
 *   get:
 *     summary: Get all complaints submitted by the logged-in user
 *     tags: [Common Complaints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of complaints
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
route.get('/get-complain', complaintController.getComplaintDetails); 



module.exports = route;
