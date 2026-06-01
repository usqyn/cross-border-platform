const express = require('express');
const router = express.Router();
const { getIntermediaries, getIntermediaryDetail } = require('../controllers/intermediaryController');

router.get('/', getIntermediaries);
router.get('/:id', getIntermediaryDetail);

module.exports = router;
