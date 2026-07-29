const express = require('express');
const router = express.Router();
const blockUnblockController = require('../../controllers/admin/blockUnblock.controller.js');

router.patch('/block/:userId', blockUnblockController.toggleBlockStatus);


module.exports = router;
