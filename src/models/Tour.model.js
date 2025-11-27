const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A tour must have a title'],
    trim: true,
    minlength: [3, 'Tour title must be at least 3 characters long'],
    maxlength: [100, 'Tour title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  summary: {
    type: String,
    trim: true,
    maxlength: [200, 'Summary cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'A tour must have a description'],
    minlength: [10, 'Description must be at least 10 characters long']
  },
  destination: {
    type: String,
    required: [true, 'A tour must have a destination'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(val) {
        return !val || val < this.price;
      },
      message: 'Discount price ({VALUE}) must be lower than regular price'
    }
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration'],
    min: [1, 'Duration must be at least 1 day']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a maximum group size'],
    min: [1, 'Group size must be at least 1 person'],
    max: [50, 'Group size cannot exceed 50 people']
  },
  difficulty: {
    type: String,
    enum: {
      values: ['easy', 'moderate', 'challenging'],
      message: 'Difficulty must be either: easy, moderate, or challenging'
    },
    default: 'moderate'
  },
  startDates: {
    type: [Date],
    default: []
  },
  imageCover: {
    type: String,
    default: 'default-tour.jpg'
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: [true, 'A tour must have a category'],
    enum: {
      values: ['cultural', 'adventure', 'hiking', 'day-trip'],
      message: 'Category must be either: cultural, adventure, hiking, or day-trip'
    }
  },
  videoUrl: {
    type: String,
    trim: true
  },
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    image: String,
    imageCaption: String,
    city: String,
    accommodation: String,
    activities: [String],
    meals: String,
    transport: [String]
  }],
  tags: {
    type: [String],
    default: []
  },
  included: {
    type: [String],
    default: []
  },
  excluded: {
    type: [String],
    default: []
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5']
  },
  ratingsCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  hotSale: {
    type: Boolean,
    default: false
  },
  nights: {
    type: Number,
    min: [0, 'Nights cannot be negative']
  },
  destinationsCount: {
    type: Number,
    default: 1,
    min: [1, 'Must have at least 1 destination']
  },
  accommodation: {
    type: String,
    trim: true
  },
  meals: {
    type: String,
    trim: true
  },
  transportation: {
    type: String,
    trim: true
  },
  languages: {
    type: [String],
    default: []
  },
  animal: {
    type: String,
    trim: true
  },
  ageRange: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 99
    }
  },
  season: {
    type: String,
    trim: true
  },
  groupSizeMin: {
    type: Number,
    default: 1,
    min: [1, 'Minimum group size must be at least 1']
  },
  highlights: {
    type: [String],
    default: []
  },
  locations: [{
    name: String,
    image: String,
    days: String
  }],
  freeCancellation: {
    type: String,
    trim: true
  },
  healthSafety: {
    type: String,
    trim: true
  },
  faq: [{
    question: String,
    answer: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property: price in USD (1 USD = 12500 UZS)
tourSchema.virtual('priceUSD').get(function() {
  return Math.round(this.price / 12500);
});

// Virtual property: week duration
tourSchema.virtual('durationWeeks').get(function() {
  return Math.round(this.duration / 7 * 10) / 10;
});

// Create slug from title before saving
tourSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Index for better performance
tourSchema.index({ destination: 1, price: 1 });
tourSchema.index({ category: 1 });
tourSchema.index({ slug: 1 });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
