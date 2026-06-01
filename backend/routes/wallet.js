const express = require('express');
const router = express.Router();
const { getWallet, addPoints, withdraw } = require('../controllers/walletController');

router.get('/detail', getWallet);
router.post('/points/add', addPoints);
router.post('/withdraw', withdraw);

module.exports = router;
