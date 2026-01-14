const express = require('express');
const {
  createAlert,
  getAlerts,
  updateAlert,
  deleteAlert,
  getTriggeredAlerts
} = require('../controllers/priceAlertController');

const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate);
router.post('/', createAlert);

router.get('/', getAlerts);
router.get('/triggered', getTriggeredAlerts);

router.put('/:alertId', updateAlert);
router.delete('/:alertId', deleteAlert);

module.exports = router;
