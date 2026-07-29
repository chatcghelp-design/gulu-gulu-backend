const express = require('express');
const router = express.Router();
const hostRequestController = require('../../controllers/admin/hostRequest.controller.js');

router.get('/list', hostRequestController.getHostRequest);

router.post('/:requestId', hostRequestController.handleHostRequest);

module.exports = router;
