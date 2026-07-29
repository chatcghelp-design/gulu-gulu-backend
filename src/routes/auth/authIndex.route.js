const express = require('express');

const route = express.Router();
const authRoute = require('./auth.route.js');
const adimnAuthRoute = require('./adminAuth/adminAuthIndex.route.js');
const agencyRoute = require('../agency/agencyIndex.route.js');
const settingRoute = require('./setting.route.js');

route.use('/admin', adimnAuthRoute);
route.use('/agency', agencyRoute);
route.use('/setting', settingRoute);
route.use('/', authRoute);

module.exports = route;
