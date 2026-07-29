const express = require('express');
const route = express.Router();
const hostRoute = require('./host.route.js');
const withdrawRoute = require('./withdraw.route.js');

route.use('/', hostRoute);
route.use('/withdraw', withdrawRoute);

module.exports = route;
