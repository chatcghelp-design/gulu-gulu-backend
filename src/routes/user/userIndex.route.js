const express = require('express');

const route = express.Router();
const hostRequestRoute = require('./hostRequest.route.js');
const giftRoute = require('./gift.route.js');
const callRoute = require('./call.route.js');
const accountRoute = require('./account.route.js');

// hostRequestRoute
route.use('/host-request', hostRequestRoute);
route.use('/gift', giftRoute);
route.use('/call', callRoute);
route.use('/account', accountRoute);

module.exports = route;
