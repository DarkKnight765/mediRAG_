const express = require('express');
const router = express.Router();
const healthPlanController = require('../controllers/healthPlanController');

router.post('/HealthPlans', healthPlanController.generateHealthPlan);

module.exports = router;
