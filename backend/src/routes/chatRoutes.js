const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/mental-health-chat', chatController.mentalHealthChat);

module.exports = router;
