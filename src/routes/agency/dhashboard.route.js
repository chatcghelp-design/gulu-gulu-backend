const route = require('express').Router();
const dashboardController = require('../../controllers/agency/dashboard.controller.js');

route.get('/', dashboardController.getDashboardAgency);

module.exports = route;
