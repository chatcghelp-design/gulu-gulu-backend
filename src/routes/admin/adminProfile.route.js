const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/admin/adminProfile.controller');

router.get('/admin-profile', profileController.getAdminProfile);

module.exports = router;