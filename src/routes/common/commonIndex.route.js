const express = require('express');
const route = express.Router();
const profileRoute = require('./profile.route.js');
const otherRoute = require('./other.route.js');
const followRoute = require('./follow.route.js');
const giftRoute = require('./gift.route.js');
const giftCategoryRoute = require('./giftCategory.route.js');
const coinPlanRoute = require('./coinPlan.route.js');
const historyRoute = require('./history.route.js');
const callRoute = require('./call.route.js');
const bannerRoute = require('./banner.route.js');
const complaintRoute = require('./complaint.route.js');
const blockRoute = require('./block.route.js');
const languageRoute = require('./language.route.js');
const userRoute = require('./user.route.js');


route.use('/profile', profileRoute);
route.use('/follow', followRoute);
route.use('/gift', giftRoute);
route.use('/gift-category', giftCategoryRoute);
route.use('/coin-plans', coinPlanRoute);
route.use('/history', historyRoute);
route.use('/call', callRoute);
route.use('/banner', bannerRoute);
route.use('/complaint', complaintRoute);
route.use('/block', blockRoute);
route.use('/notification', blockRoute);
route.use('/all', languageRoute);
route.use('/user', userRoute);
route.use('/', otherRoute);


module.exports = route;
