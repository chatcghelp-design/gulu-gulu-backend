const express = require('express');
const route = express.Router();
const callController = require('../../controllers/common/call.controller.js');

// Get all active coin plans (User)
route.post('/private-call', callController.privateCall);

module.exports = route;
