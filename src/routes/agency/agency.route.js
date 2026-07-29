const route = require('express').Router();
const agencyController = require('../../controllers/agency/agency.controller.js');

/**
 * @swagger
 * /agency/create-agency:
 *   post:
 *     summary: Create a new agency
 *     tags:
 *       - Agency
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobileNo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Success
 */
route.post('/create-agency', agencyController.createAgency);

/**
 * @swagger
 * /auth/agency/login:
 *   post:
 *     summary: Agency login with name and password
 *     tags:
 *       - Agency
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success
 */
route.post('/login', agencyController.agencyLogin);

route.put('/update-agency/:id', agencyController.updateAgency);

route.get('/agency-profile', agencyController.getAgencyProfile);

/**
 * @swagger
 * /agency/delete-agency/{id}:
 *   delete:
 *     summary: Soft delete an agency (sets isDeleted to true)
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
 *         description: Agency ID
 *     responses:
 *       200:
 *         description: Agency deleted successfully
 *       404:
 *         description: Agency not found
 */
route.delete('/delete-agency/:id', agencyController.deleteAgency);

module.exports = route;
