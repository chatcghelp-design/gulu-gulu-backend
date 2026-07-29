const express = require('express');
const route = express.Router();
const giftRoute = require('./gift.route.js');
const hostRequestRoute = require('./hostRequest.route.js');
const giftCategoryRoute = require('./giftCategory.route.js');
const dummyUserRoute = require('./dummyUser.route.js');
const coinPlanRoute = require('./coinPlan.route.js');

const complaintRoute = require('../admin-agency/complaint.route.js');
const bannerRoute = require('./banner.route.js');
const settingRoute = require('./setting.route.js');
const userRoute = require('./user.route.js');
const hostRoute = require('./host.route.js');
const blockRoute = require('./block.route.js');
const agencyRoute = require('./agency.route.js');
const adminProfileRoute = require('./adminProfile.route.js');
const withdrawPaymentRoute = require('./withdrawPayment.route.js');
const dashboardRoute = require('./dashboard.route.js');
const levelRoute = require('./level.route.js');
const historyRoute = require('./history.route.js');
const notificationRoute = require('./notification.route.js');

route.use('/host-request', hostRequestRoute);
route.use('/gift', giftRoute);
route.use('/gift-category', giftCategoryRoute);
route.use('/dummyusers', dummyUserRoute);
route.use('/coin-plan', coinPlanRoute);

route.use('/complaint', complaintRoute);
route.use('/banner', bannerRoute);
route.use('/setting', settingRoute);
route.use('/user', userRoute);
route.use('/host', hostRoute);
route.use('/block-unblock', blockRoute);
route.use('/agency', agencyRoute);
route.use('/profile', adminProfileRoute);
route.use('/withdraw-payment', withdrawPaymentRoute);
route.use('/dashboard', dashboardRoute);
route.use('/level', levelRoute);
route.use('/history', historyRoute);
route.use('/notification', notificationRoute);


module.exports = route;
