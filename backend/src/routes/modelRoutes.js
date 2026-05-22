const express = require("express");
const router = express.Router();
const modelController = require("../controllers/modelController");

router.get("/health", modelController.health);

module.exports = router;
