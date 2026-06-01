const express = require('express');
const router = express.Router();
const { getActiveStatuses, createStatus, updateStatus } = require('../controllers/borderController');

router.get('/active', getActiveStatuses);
router.post('/', createStatus);
router.put('/:id', updateStatus);

module.exports = router;
