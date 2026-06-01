const express = require('express');
const router = express.Router();
const { addReview, getReviews, getReviewList } = require('../controllers/reviewController');

router.post('/', addReview);
router.get('/', getReviews);
router.get('/list', getReviewList);

module.exports = router;
