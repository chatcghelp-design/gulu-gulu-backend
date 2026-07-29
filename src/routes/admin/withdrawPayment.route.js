// File: routes/withdrawRoutes.js
const express = require('express');
const router = express.Router();
const upload = require('../../../middleware/multer.js');
const coinPlanController = require('../../controllers/admin/withdrawPayment.controller.js');


router.post('/create', upload.single('image'), coinPlanController.createWithdraw);
router.put('/:id', upload.single('image'), coinPlanController.updateWithdraw);
router.get('/list', coinPlanController.getAllWithdraw);

module.exports = router;
