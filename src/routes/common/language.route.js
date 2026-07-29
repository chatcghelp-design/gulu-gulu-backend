const express = require('express');
const router = express.Router(); // ✅ This was missing
const languageController = require('../../controllers/common/language.controller');


router.get('/get-all-language-list', languageController.getAllLanguages);

module.exports = router; // ✅ Now router is defined
