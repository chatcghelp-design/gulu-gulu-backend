const express = require('express');
const route = express.Router();
const complainRoute = require('./complaint.route.js');
const withdrawRoute = require('./withdraw.route.js');
const hostRoute = require('./allUserHost.route.js');
const blockRoute = require('./block-unblock.route.js');
const notificationRoute = require('./notification.route.js');
const historyRoute = require('./history.route.js');
const languageRoute = require('../admin-agency/language.route.js');

route.use('/complain', complainRoute);
route.use('/withdraw', withdrawRoute);
route.use('/user-host', hostRoute);
route.use('/block-unblock', blockRoute);
route.use('/notification', notificationRoute);
route.use('/history', historyRoute);
route.use('/language', languageRoute);

module.exports = route;
