const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');

router.get('/test', testController.testAPI);

module.exports = router;
