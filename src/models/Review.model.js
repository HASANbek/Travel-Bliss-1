const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  // User info
  userName: {
    type: String,
    required: [true, 'Review must have a user name'],
    trim: true,
    maxlength: [100, 'User name cannot exceed 100 characters']
  },
  userEmail: {
    type: String,
    required: [true, 'Review must have a user email'],
    trim: true,
    lowercase: true
  },
  userAvatar: {
    type: String,
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Review content
  rating: {
    type: Number,
    required: [true, 'Review must have a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  review: {
    type: String,
    required: [true, 'Review must have content'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters'],
    maxlength: [2000, 'Review cannot exceed 2000 characters']
  },

  // Service/Tour info
  serviceType: {
    type: String,
    required: [true, 'Review must have a service type'],
    enum: {
      values: ['tour', 'hotel', 'transport', 'guide', 'general'],
      message: 'Service type must be: tour, hotel, transport, guide, or general'
    },
    default: 'tour'
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'serviceModel',
    default: null
  },
  serviceModel: {
    type: String,
    enum: ['Tour', 'Hotel', 'Transport', 'Guide'],
    default: 'Tour'
  },
  serviceName: {
    type: String,
    trim: true,
    required: [true, 'Review must have a service name']
  },

  // Status & Moderation
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be: pending, approved, or rejected'
    },
    default: 'pending'
  },

  // AI Analysis
  aiSentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative', 'spam'],
    default: 'neutral'
  },
  aiScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  spamReason: {
    type: String,
    default: null
  },

  // Moderation
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: {
    type: Date,
    default: null
  },
  moderationNotes: {
    type: String,
    trim: true,
    default: null
  },

  // Response from admin
  adminResponse: {
    type: String,
    trim: true,
    default: null
  },
  adminResponseAt: {
    type: Date,
    default: null
  },
  adminResponseBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Helpful votes
  helpfulCount: {
    type: Number,
    default: 0
  },
  notHelpfulCount: {
    type: Number,
    default: 0
  },

  // Additional info
  bookingId: {
    type: String,
    default: null
  },
  tripDate: {
    type: Date,
    default: null
  },

  // Media
  images: {
    type: [String],
    default: []
  },

  // Verification
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },

  // IP & Device (for spam detection)
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: formatted date
reviewSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
});

// Virtual: stars array for display
reviewSchema.virtual('starsArray').get(function() {
  return Array(5).fill(0).map((_, i) => i < this.rating ? 1 : 0);
});

// Index for better performance
reviewSchema.index({ serviceId: 1, status: 1 });
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ aiSentiment: 1 });
reviewSchema.index({ userEmail: 1 });

// Static method: Calculate average rating for a service
reviewSchema.statics.calculateAverageRating = async function(serviceId) {
  const stats = await this.aggregate([
    { $match: { serviceId: serviceId, status: 'approved' } },
    {
      $group: {
        _id: '$serviceId',
        avgRating: { $avg: '$rating' },
        numRatings: { $sum: 1 }
      }
    }
  ]);

  return stats.length > 0 ? {
    avgRating: Math.round(stats[0].avgRating * 10) / 10,
    numRatings: stats[0].numRatings
  } : { avgRating: 0, numRatings: 0 };
};

// Static method: Get rating distribution
reviewSchema.statics.getRatingDistribution = async function(serviceId = null) {
  const match = serviceId
    ? { serviceId: serviceId, status: 'approved' }
    : { status: 'approved' };

  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } }
  ]);

  // Create distribution object
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  stats.forEach(s => {
    distribution[s._id] = s.count;
  });

  return distribution;
};

// Pre-save: Simple spam detection
reviewSchema.pre('save', function(next) {
  if (this.isModified('review')) {
    const spamPatterns = [
      /buy\s*cheap/i,
      /click\s*(here|this)/i,
      /best\s*prices?\s*guaranteed/i,
      /http[s]?:\/\/[^\s]+/,
      /www\.[^\s]+/,
      /\$\$\$/,
      /spam/i,
      /free\s*money/i
    ];

    for (const pattern of spamPatterns) {
      if (pattern.test(this.review)) {
        this.isSpam = true;
        this.aiSentiment = 'spam';
        this.spamReason = 'Suspicious content detected';
        break;
      }
    }

    // Simple sentiment analysis
    if (!this.isSpam) {
      const positiveWords = ['amazing', 'excellent', 'wonderful', 'great', 'fantastic', 'best', 'love', 'perfect', 'beautiful', 'incredible'];
      const negativeWords = ['terrible', 'awful', 'horrible', 'worst', 'bad', 'disappointing', 'poor', 'hate', 'never'];

      const reviewLower = this.review.toLowerCase();
      const positiveCount = positiveWords.filter(w => reviewLower.includes(w)).length;
      const negativeCount = negativeWords.filter(w => reviewLower.includes(w)).length;

      if (positiveCount > negativeCount) {
        this.aiSentiment = 'positive';
      } else if (negativeCount > positiveCount) {
        this.aiSentiment = 'negative';
      } else {
        this.aiSentiment = 'neutral';
      }
    }
  }
  next();
});

// After save: Update tour rating if approved
reviewSchema.post('save', async function() {
  if (this.status === 'approved' && this.serviceType === 'tour' && this.serviceId) {
    try {
      const Tour = mongoose.model('Tour');
      const stats = await this.constructor.calculateAverageRating(this.serviceId);
      await Tour.findByIdAndUpdate(this.serviceId, {
        rating: stats.avgRating,
        ratingsCount: stats.numRatings
      });
    } catch (error) {
      console.error('Error updating tour rating:', error);
    }
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
