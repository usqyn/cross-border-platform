const express = require('express');
const router = express.Router();
const {
  requestRefund,
  approveRefund,
  rejectRefund,
  proposePartialRefund,
  acceptPartialRefund,
  rejectPartialRefund
} = require('../controllers/refundController');

router.post('/request', requestRefund);
router.post('/approve', approveRefund);
router.post('/reject', rejectRefund);
router.post('/propose-partial', proposePartialRefund);
router.post('/accept-partial', acceptPartialRefund);
router.post('/reject-partial', rejectPartialRefund);

module.exports = router;
