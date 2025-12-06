const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A blog post must have a title'],
    trim: true,
    minlength: [5, 'Blog title must be at least 5 characters long'],
    maxlength: [200, 'Blog title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    trim: true,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'A blog post must have content'],
    minlength: [50, 'Content must be at least 50 characters long']
  },
  author: {
    name: {
      type: String,
      default: 'Admin'
    },
    email: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: 'default-avatar.jpg'
    }
  },
  featuredImage: {
    type: String,
    default: 'default-blog.jpg'
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: [true, 'A blog post must have a category'],
    enum: {
      values: ['adventure-tours', 'beach-holidays', 'cultural-tours', 'family-vacations', 'cruises', 'travel-tips', 'destination-guides'],
      message: 'Category must be one of: adventure-tours, beach-holidays, cultural-tours, family-vacations, cruises, travel-tips, destination-guides'
    }
  },
  tags: {
    type: [String],
    default: []
  },
  location: {
    name: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    }
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'published', 'archived'],
      message: 'Status must be either: draft, published, or archived'
    },
    default: 'draft'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: [0, 'Comments count cannot be negative']
  },
  readingTime: {
    type: Number, // in minutes
    default: 5
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  }],
  // SEO Fields
  metaTitle: {
    type: String,
    trim: true,
    maxlength: [200, 'Meta title cannot exceed 200 characters']
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Meta description cannot exceed 500 characters']
  },
  metaKeywords: {
    type: [String],
    default: []
  },
  // Social sharing data
  socialImage: {
    type: String
  },
  // Comments (embedded)
  comments: [{
    author: {
      name: String,
      email: String,
      avatar: String
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
blogSchema.pre('save', async function(next) {
  if (this.isModified('title')) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

    // Check if slug exists and add random suffix if needed
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await this.constructor.findOne({ slug: slug, _id: { $ne: this._id } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }

  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    this.isPublished = true;
  }

  // Calculate reading time based on content length (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }

  // Auto-generate excerpt from content if not provided
  if (this.isModified('content') && !this.excerpt) {
    this.excerpt = this.content.substring(0, 200) + '...';
  }

  next();
});

// Virtual for formatted publish date
blogSchema.virtual('publishedDate').get(function() {
  if (this.publishedAt) {
    return this.publishedAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  return null;
});

// Virtual for category display name
blogSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    'adventure-tours': 'Adventure Tours',
    'beach-holidays': 'Beach Holidays',
    'cultural-tours': 'Cultural Tours',
    'family-vacations': 'Family Vacations',
    'cruises': 'Cruises',
    'travel-tips': 'Travel Tips',
    'destination-guides': 'Destination Guides'
  };
  return categoryMap[this.category] || this.category;
});

// Indexes for better performance
blogSchema.index({ slug: 1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ isFeatured: 1, status: 1 });

// Static method to get published blogs
blogSchema.statics.getPublished = function() {
  return this.find({ status: 'published', isPublished: true })
    .sort({ publishedAt: -1 });
};

// Static method to get featured blogs
blogSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ status: 'published', isPublished: true, isFeatured: true })
    .limit(limit)
    .sort({ publishedAt: -1 });
};

// Instance method to increment views
blogSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
