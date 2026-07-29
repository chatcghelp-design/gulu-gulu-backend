const route = require('express').Router();
const historyController = require('../../controllers/admin/history.controller.js');

route.get('/get', historyController.getHistoryByAdmin);

module.exports = route;
