const express = require('express');
const route = express.Router();

const authRoute = require('./auth/authIndex.route.js');
const userRoute = require('./user/userIndex.route.js');
const hostRoute = require('./host/hostIndex.route.js');
const adminRoute = require('./admin/adminIndex.route.js');
const commonRoute = require('./common/commonIndex.route.js');
const adminAgencyRoute = require('./admin-agency/adminAgencyIndex.route.js');
const agencyRoute = require('./agency/agencyIndex.route.js');

route.use('/auth', authRoute);
route.use('/admin', adminRoute);
route.use('/user', userRoute);
route.use('/host', hostRoute);
route.use('/common', commonRoute);
route.use('/admin-agency', adminAgencyRoute);
route.use('/agency', agencyRoute);

module.exports = route;
