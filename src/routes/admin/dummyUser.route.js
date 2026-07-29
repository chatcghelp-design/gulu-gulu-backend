const express = require('express');
const router = express.Router();
const dummyUserController = require('../../controllers/admin/dummyUser.controller.js');
const upload = require('../../../middleware/multer.js');

router.post('/', upload.array('image'), dummyUserController.addDummyUsers);
router.put('/:id', upload.array('image'), dummyUserController.updateDummyUsers);
router.get('/', dummyUserController.getDummyUsers);
router.get('/:id', dummyUserController.getDummyUserById);


module.exports = router;
