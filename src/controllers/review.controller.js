const Review = require('../models/Review.model');
const Tour = require('../models/Tour.model');

// ========== PUBLIC ROUTES ==========

/**
 * @desc    Get all approved reviews (public)
 * @route   GET /api/reviews
 * @access  Public
 */
exports.getPublicReviews = async (req, res) => {
  try {
    const { serviceId, serviceType, limit = 10, page = 1 } = req.query;

    const query = { status: 'approved' };
    if (serviceId) query.serviceId = serviceId;
    if (serviceType) query.serviceType = serviceType;

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-ipAddress -userAgent -moderationNotes');

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting public reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Create a new review (public)
 * @route   POST /api/reviews
 * @access  Public
 */
exports.createReview = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      rating,
      review,
      serviceType = 'tour',
      serviceId,
      serviceName,
      tripDate,
      bookingId
    } = req.body;

    // Validate required fields
    if (!userName || !userEmail || !rating || !review || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'Barcha maydonlarni to\'ldiring'
      });
    }

    // Get IP and User Agent for spam detection
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Check for duplicate review from same email in last 24 hours
    const recentReview = await Review.findOne({
      userEmail,
      serviceId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    if (recentReview) {
      return res.status(400).json({
        success: false,
        message: 'Siz allaqachon bu xizmat uchun sharh qoldirgansiz'
      });
    }

    // Verify booking if bookingId provided
    let isVerifiedPurchase = false;
    if (bookingId) {
      // Check if booking exists and matches email
      // This would need bookings storage/model integration
      isVerifiedPurchase = true; // Simplified for now
    }

    const newReview = await Review.create({
      userName,
      userEmail,
      rating: parseInt(rating),
      review,
      serviceType,
      serviceId,
      serviceName,
      tripDate,
      bookingId,
      isVerifiedPurchase,
      ipAddress,
      userAgent,
      status: 'pending' // All reviews start as pending
    });

    res.status(201).json({
      success: true,
      message: 'Sharhingiz moderatsiyadan o\'tgandan so\'ng ko\'rinadi',
      data: {
        id: newReview._id,
        status: newReview.status
      }
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server xatosi'
    });
  }
};

/**
 * @desc    Get review statistics for a service
 * @route   GET /api/reviews/stats/:serviceId
 * @access  Public
 */
exports.getReviewStats = async (req, res) => {
  try {
    const { serviceId } = req.params;

    const stats = await Review.calculateAverageRating(serviceId);
    const distribution = await Review.getRatingDistribution(serviceId);

    res.status(200).json({
      success: true,
      data: {
        ...stats,
        distribution
      }
    });
  } catch (error) {
    console.error('Error getting review stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

// ========== ADMIN ROUTES ==========

/**
 * @desc    Get all reviews (admin)
 * @route   GET /api/admin/reviews
 * @access  Private/Admin
 */
exports.getAllReviews = async (req, res) => {
  try {
    const {
      status,
      rating,
      serviceType,
      aiSentiment,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') query.status = status;
    if (rating && rating !== 'all') query.rating = parseInt(rating);
    if (serviceType && serviceType !== 'all') query.serviceType = serviceType;
    if (aiSentiment && aiSentiment !== 'all') query.aiSentiment = aiSentiment;

    if (search) {
      query.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { review: { $regex: search, $options: 'i' } },
        { serviceName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const reviews = await Review.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('moderatedBy', 'name email')
      .populate('adminResponseBy', 'name email');

    const total = await Review.countDocuments(query);

    // Get statistics
    const stats = {
      total: await Review.countDocuments(),
      pending: await Review.countDocuments({ status: 'pending' }),
      approved: await Review.countDocuments({ status: 'approved' }),
      rejected: await Review.countDocuments({ status: 'rejected' }),
      spam: await Review.countDocuments({ isSpam: true }),
      todayCount: await Review.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    };

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avg: { $avg: '$rating' } } }
    ]);
    stats.averageRating = avgRatingResult.length > 0
      ? Math.round(avgRatingResult[0].avg * 10) / 10
      : 0;

    // Rating distribution
    stats.ratingDistribution = await Review.getRatingDistribution();

    // Most reviewed services
    const mostReviewed = await Review.aggregate([
      { $match: { status: 'approved' } },
      {
        $group: {
          _id: { serviceId: '$serviceId', serviceName: '$serviceName' },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    stats.mostReviewedServices = mostReviewed.map(m => ({
      serviceName: m._id.serviceName,
      serviceId: m._id.serviceId,
      count: m.count,
      avgRating: Math.round(m.avgRating * 10) / 10
    }));

    res.status(200).json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Get single review (admin)
 * @route   GET /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('moderatedBy', 'name email')
      .populate('adminResponseBy', 'name email');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Sharh topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error getting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Update review status (approve/reject)
 * @route   PUT /api/admin/reviews/:id/status
 * @access  Private/Admin
 */
exports.updateReviewStatus = async (req, res) => {
  try {
    const { status, moderationNotes } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri status'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderatedBy: req.user?._id || req.user?.id,
        moderatedAt: new Date(),
        moderationNotes
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Sharh topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      message: `Sharh ${status === 'approved' ? 'tasdiqlandi' : status === 'rejected' ? 'rad etildi' : 'kutish holatiga qaytarildi'}`,
      data: review
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Bulk update review statuses
 * @route   PUT /api/admin/reviews/bulk-status
 * @access  Private/Admin
 */
exports.bulkUpdateStatus = async (req, res) => {
  try {
    const { reviewIds, status } = req.body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Sharhlar tanlanmagan'
      });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Noto\'g\'ri status'
      });
    }

    const result = await Review.updateMany(
      { _id: { $in: reviewIds } },
      {
        status,
        moderatedBy: req.user?._id || req.user?.id,
        moderatedAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} ta sharh ${status === 'approved' ? 'tasdiqlandi' : 'rad etildi'}`,
      data: { modifiedCount: result.modifiedCount }
    });
  } catch (error) {
    console.error('Error bulk updating reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Add admin response to review
 * @route   PUT /api/admin/reviews/:id/response
 * @access  Private/Admin
 */
exports.addAdminResponse = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Javob matni kerak'
      });
    }

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        adminResponse: response,
        adminResponseAt: new Date(),
        adminResponseBy: req.user?._id || req.user?.id
      },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Sharh topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Javob qo\'shildi',
      data: review
    });
  } catch (error) {
    console.error('Error adding admin response:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private/Admin
 */
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Sharh topilmadi'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Sharh o\'chirildi'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

/**
 * @desc    Create review (admin - for manual entry)
 * @route   POST /api/admin/reviews
 * @access  Private/Admin
 */
exports.createAdminReview = async (req, res) => {
  try {
    const {
      userName,
      userEmail,
      rating,
      review,
      serviceType,
      serviceId,
      serviceName,
      status = 'approved',
      tripDate
    } = req.body;

    // Validate
    if (!userName || !userEmail || !rating || !review || !serviceName) {
      return res.status(400).json({
        success: false,
        message: 'Barcha maydonlarni to\'ldiring'
      });
    }

    const newReview = await Review.create({
      userName,
      userEmail,
      rating: parseInt(rating),
      review,
      serviceType: serviceType || 'tour',
      serviceId,
      serviceName,
      status,
      tripDate,
      moderatedBy: req.user?._id || req.user?.id,
      moderatedAt: status !== 'pending' ? new Date() : null
    });

    res.status(201).json({
      success: true,
      message: 'Sharh yaratildi',
      data: newReview
    });
  } catch (error) {
    console.error('Error creating admin review:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server xatosi'
    });
  }
};

/**
 * @desc    Export reviews (admin)
 * @route   GET /api/admin/reviews/export
 * @access  Private/Admin
 */
exports.exportReviews = async (req, res) => {
  try {
    const { status, format = 'json' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .select('-ipAddress -userAgent');

    if (format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'User', 'Email', 'Rating', 'Review', 'Service', 'Status', 'AI', 'Date'];
      const rows = reviews.map(r => [
        r._id,
        r.userName,
        r.userEmail,
        r.rating,
        `"${r.review.replace(/"/g, '""')}"`,
        r.serviceName,
        r.status,
        r.aiSentiment,
        r.createdAt.toISOString().split('T')[0]
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=reviews.csv');
      return res.send(csv);
    }

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error exporting reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};
