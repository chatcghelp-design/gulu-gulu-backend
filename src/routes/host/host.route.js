const express = require('express');
const route = express.Router();
const hostController = require('../../controllers/host/host.controller');
/**
 * @swagger
 * /host/by-agency:
 *   get:
 *     summary: Get all hosts by agency code
 *     tags:
 *       - Host
 *     parameters:
 *       - in: query
 *         name: agencyCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Agency code to filter hosts
 *     responses:
 *       200:
 *         description: List of hosts for the agency
 */
route.get('/by-agency', hostController.getHostsByAgency);

module.exports = route;
