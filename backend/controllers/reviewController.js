const Review = require('../models/Review');
const Intermediary = require('../models/Intermediary');
const User = require('../models/User');

const CREDIT_SCORE_INCREMENT = 2;
const MAX_CREDIT_SCORE = 100;

exports.addReview = async (req, res) => {
  try {
    const { userId, intermediaryId, rating, content } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    const review = new Review({
      userId,
      intermediaryId,
      rating,
      content,
      isVerified: user.isVerified,
      order_type: 'unlock_only'
    });
    await review.save();
    
    const reviews = await Review.find({ intermediaryId, isApproved: true });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    
    const intermediary = await Intermediary.findById(intermediaryId);
    if (intermediary) {
      const oldRating = intermediary.rating || 0;
      const ratingDiff = rating - oldRating;
      const newCreditScore = Math.min(MAX_CREDIT_SCORE, (intermediary.credit_score || 100) + (rating >= 4 ? CREDIT_SCORE_INCREMENT : 0));
      
      await Intermediary.findByIdAndUpdate(intermediaryId, {
        rating: avgRating,
        reviewCount: reviews.length,
        credit_score: newCreditScore
      });
    }
    
    res.json({ 
      success: true, 
      data: {
        review,
        credit_score_updated: newCreditScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const { intermediaryId, language = 'zh' } = req.query;
    const reviews = await Review.find({ intermediaryId, isApproved: true })
      .populate('userId', 'nickname avatar')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: reviews.map(r => ({
        id: r._id,
        user: {
          nickname: r.userId.nickname,
          avatar: r.userId.avatar
        },
        rating: r.rating,
        content: r.content[language] || r.content.zh,
        isVerified: r.isVerified,
        createdAt: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.getReviewList = async (req, res) => {
  try {
    const { intermediaryId } = req.query;
    const query = { isApproved: true };
    if (intermediaryId) query.intermediaryId = intermediaryId;
    
    const reviews = await Review.find(query)
      .populate('userId', 'nickname avatar')
      .populate('intermediaryId', 'name')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: reviews.map(r => ({
        _id: r._id,
        user_id: r.userId,
        intermediary_id: r.intermediaryId,
        rating: r.rating,
        content: r.content,
        is_verified: r.isVerified,
        created_at: r.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
};
