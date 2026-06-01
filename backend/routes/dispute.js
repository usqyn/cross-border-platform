const express = require('express');
const router = express.Router();
const { submitEvidence, getDisputeDetail, arbitrate } = require('../controllers/disputeController');

router.post('/submit-evidence', submitEvidence);
router.get('/detail/:id', getDisputeDetail);
router.post('/arbitrate', arbitrate);

module.exports = router;
