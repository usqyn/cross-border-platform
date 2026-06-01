const express = require('express');
const router = express.Router();
const {
  createLead,
  unlockLead,
  getLeadsList,
  getLeadDetail,
  createEscrowOrder,
  payEscrow,
  completeService,
  confirmCompletion
} = require('../controllers/leadController');

router.post('/create', createLead);
router.post('/unlock', unlockLead);
router.get('/list', getLeadsList);
router.get('/detail/:id', getLeadDetail);
router.post('/escrow/create', createEscrowOrder);
router.post('/escrow/pay', payEscrow);
router.post('/escrow/complete', completeService);
router.post('/escrow/confirm', confirmCompletion);

module.exports = router;
