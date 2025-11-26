const mongoose = require('mongoose');

// Popular Place Sub-schema
const popularPlaceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  map_link: { type: String, default: '' }
}, { _id: false });

// Season Sub-schema
const seasonSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🌸' },
  months: { type: String, default: '' },
  temperature: { type: String, default: '' },
  description: { type: String, default: '' }
}, { _id: false });

// FAQ Sub-schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, default: '' }
}, { _id: false });

const destinationSchema = new mongoose.Schema({
  // Main Fields
  title: {
    type: String,
    required: [true, 'Destination title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
    lowercase: true
  },
  tagline: {
    type: String,
    maxlength: [200, 'Tagline cannot exceed 200 characters'],
    default: ''
  },
  country_code: {
    type: String,
    uppercase: true,
    maxlength: [3, 'Country code cannot exceed 3 characters'],
    default: 'UZ'
  },
  city: {
    type: String,
    default: ''
  },

  // Country Info
  capital: {
    type: String,
    default: 'Tashkent'
  },
  currency: {
    type: String,
    default: 'UZS (Som)'
  },
  language: {
    type: String,
    default: 'Uzbek, Russian'
  },

  // Images
  main_image: {
    type: String,
    default: ''
  },
  gallery_images: [{
    type: String
  }],
  thumbnail_image: {
    type: String,
    default: ''
  },

  // Descriptions
  short_description: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters'],
    default: ''
  },
  long_description: {
    type: String,
    default: ''
  },

  // Popular Tourist Places
  popular_places: [popularPlaceSchema],

  // Seasonal Guide
  seasons: [seasonSchema],

  // FAQ
  faqs: [faqSchema],

  // Stats
  trips_count: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },

  // Geo Location
  latitude: {
    type: Number,
    default: null
  },
  longitude: {
    type: Number,
    default: null
  },

  // SEO
  seo: {
    meta_title: {
      type: String,
      maxlength: [70, 'Meta title cannot exceed 70 characters'],
      default: ''
    },
    meta_description: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters'],
      default: ''
    },
    meta_keywords: [{
      type: String
    }]
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug from title before saving
destinationSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  // Auto-generate SEO if empty
  if (this.seo && !this.seo.meta_title && this.title) {
    this.seo.meta_title = this.title.substring(0, 60) + ' - Travel Bliss';
  }
  if (this.seo && !this.seo.meta_description && this.short_description) {
    this.seo.meta_description = this.short_description.substring(0, 160);
  }
  next();
});

// Index for better performance
destinationSchema.index({ slug: 1 });
destinationSchema.index({ country_code: 1 });
destinationSchema.index({ status: 1 });
destinationSchema.index({ featured: 1 });

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;
