const express = require('express');
const route = express.Router();
const agencyRoute = require('./agency.route.js');
const withdrawRoute = require('./withdraw.route.js');
const dhashboardRoute = require('./dhashboard.route.js');
const hostRequest = require('./hostRequest.route.js');
const settingRoute = require('./setting.route.js');

route.use('/withdraw', withdrawRoute);
route.use('/dashboard', dhashboardRoute);
route.use('/hostRequest', hostRequest);
route.use('/', agencyRoute);
route.use('/setting', settingRoute);

module.exports = route;
