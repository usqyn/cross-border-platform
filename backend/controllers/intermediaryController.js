const Intermediary = require('../models/Intermediary');
const Review = require('../models/Review');
const Lead = require('../models/Lead');

// Calculate weight score for an intermediary
async function calculateWeight(intermediaryId) {
  try {
    const reviews = await Review.find({ intermediaryId, isApproved: true });
    
    let totalWeight = 0;
    let weightedRating = 0;
    
    for (const review of reviews) {
      const rating = Number(review.rating) || 0;
      let weight = 1.0;
      
      if (review.order_type === 'escrow') {
        weight = 1.5;
      } else {
        weight = 1.0;
      }
      
      totalWeight += weight;
      weightedRating += rating * weight;
    }
    
    let weightScore = totalWeight > 0 ? weightedRating / totalWeight * 10 : 0;
    
    if (isNaN(weightScore)) {
      weightScore = 0;
    }
    
    const intermediary = await Intermediary.findById(intermediaryId);
    if (intermediary) {
      const membershipLevel = intermediary.membershipLevel || 'free';
      
      if (membershipLevel === 'vip') {
        weightScore += 15;
      } else if (membershipLevel === 'premium') {
        weightScore += 8;
      }
      
      if (intermediary.has_full_responsibility_dispute === true) {
        weightScore = Math.max(0, weightScore - 20);
      }
      
      const creditScore = Number(intermediary.credit_score) || 100;
      if (!isNaN(creditScore)) {
        weightScore += (creditScore - 100) / 10;
      }
    }
    
    if (isNaN(weightScore)) {
      weightScore = 0;
    }
    
    return weightScore;
  } catch (error) {
    console.error('Calculate weight error:', error);
    return 0;
  }
}

exports.getIntermediaries = async (req, res) => {
  try {
    const { category, language = 'zh', page = 1, limit = 10, sort_by = 'weight' } = req.query;
    const query = { isCertified: true };
    if (category) {
      query.category = category;
    }
    
    let intermediaries = await Intermediary.find(query);
    
    // Calculate weight score for each intermediary and update
    for (const inter of intermediaries) {
      const weightScore = await calculateWeight(inter._id);
      inter.weight_score = weightScore;
      await inter.save();
    }
    
    // Re-query with proper sorting
    let sortQuery = { weight_score: -1, rating: -1, membershipLevel: -1 };
    if (sort_by === 'rating') {
      sortQuery = { rating: -1, weight_score: -1 };
    }
    
    intermediaries = await Intermediary.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    const total = await Intermediary.countDocuments(query);
    
    res.json({
      success: true,
      data: intermediaries.map(inter => ({
        id: inter._id,
        name: inter.name[language] || inter.name.zh,
        logo: inter.logo,
        category: inter.category,
        isCertified: inter.isCertified,
        membershipLevel: inter.membershipLevel || 'free',
        vipLevel: inter.vipLevel || 'normal',
        rating: inter.rating,
        reviewCount: inter.reviewCount,
        tags: inter.tags,
        description: inter.description[language] || inter.description.zh,
        credit_score: inter.credit_score,
        weight_score: inter.weight_score,
        coins: inter.coins,
        contact: inter.contact,
        has_full_responsibility_dispute: inter.has_full_responsibility_dispute,
        dispute_warning_expires_at: inter.dispute_warning_expires_at
      })),
      pagination: { page, limit, total }
    });
  } catch (error) {
    console.error('Get intermediaries error:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

exports.getIntermediaryDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'zh' } = req.query;
    const intermediary = await Intermediary.findById(id);
    if (!intermediary) {
      return res.status(404).json({ error: '中介不存在' });
    }
    const reviews = await Review.find({ intermediaryId: id, isApproved: true })
      .populate('userId', 'nickname avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({
      success: true,
      data: {
        id: intermediary._id,
        name: intermediary.name[language] || intermediary.name.zh,
        logo: intermediary.logo,
        category: intermediary.category,
        isCertified: intermediary.isCertified,
        membershipLevel: intermediary.membershipLevel,
        rating: intermediary.rating,
        reviewCount: intermediary.reviewCount,
        tags: intermediary.tags,
        description: intermediary.description[language] || intermediary.description.zh,
        contact: intermediary.contact,
        credentials: intermediary.credentials,
        cases: intermediary.cases,
        credit_score: intermediary.credit_score,
        weight_score: intermediary.weight_score,
        has_full_responsibility_dispute: intermediary.has_full_responsibility_dispute,
        dispute_warning_expires_at: intermediary.dispute_warning_expires_at,
        reviews: reviews.map(r => ({
          id: r._id,
          user: {
            nickname: r.userId.nickname,
            avatar: r.userId.avatar
          },
          rating: r.rating,
          content: r.content[language] || r.content.zh,
          isVerified: r.isVerified,
          order_type: r.order_type,
          review_weight: r.review_weight,
          createdAt: r.createdAt
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ error: '服务器错误' });
  }
};
