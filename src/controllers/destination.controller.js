const Destination = require('../models/Destination.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all destinations
// @route   GET /api/destinations
// @access  Public
exports.getAllDestinations = asyncHandler(async (req, res) => {
  const { status, featured, search, country_code } = req.query;

  const filter = {};

  // Filter by status
  if (status) {
    filter.status = status;
  }

  // Filter by featured
  if (featured !== undefined) {
    filter.featured = featured === 'true';
  }

  // Filter by country code
  if (country_code) {
    filter.country_code = country_code.toUpperCase();
  }

  // Search by title
  if (search) {
    filter.title = { $regex: search, $options: 'i' };
  }

  const destinations = await Destination.find(filter).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { destinations, count: destinations.length }, 'Destinations retrieved successfully')
  );
});

// @desc    Get single destination by ID or slug
// @route   GET /api/destinations/:identifier
// @access  Public
exports.getDestination = asyncHandler(async (req, res) => {
  const { identifier } = req.params;

  let destination;

  // Check if identifier is a valid MongoDB ObjectId
  if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
    destination = await Destination.findById(identifier);
  } else {
    // Otherwise, treat it as a slug
    destination = await Destination.findOne({ slug: identifier });
  }

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  res.status(200).json(
    new ApiResponse(200, { destination }, 'Destination retrieved successfully')
  );
});

// @desc    Create new destination
// @route   POST /api/destinations
// @access  Private/Admin
exports.createDestination = asyncHandler(async (req, res) => {
  const destinationData = {
    title: req.body.title,
    slug: req.body.slug,
    country_code: req.body.country_code || 'UZ',
    main_image: req.body.main_image || '',
    gallery_images: req.body.gallery_images || [],
    thumbnail_image: req.body.thumbnail_image || '',
    short_description: req.body.short_description || '',
    long_description: req.body.long_description || '',
    trips_count: req.body.trips_count || 0,
    rating: req.body.rating || 0,
    latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    // New fields
    tagline: req.body.tagline || '',
    capital: req.body.capital || 'Tashkent',
    currency: req.body.currency || 'UZS (Som)',
    language: req.body.language || 'Uzbek, Russian',
    popular_places: req.body.popular_places || [],
    seasons: req.body.seasons || [],
    faqs: req.body.faqs || [],
    seo: {
      meta_title: req.body.seo?.meta_title || '',
      meta_description: req.body.seo?.meta_description || '',
      meta_keywords: req.body.seo?.meta_keywords || []
    },
    status: req.body.status || 'draft',
    featured: req.body.featured || false
  };

  const destination = await Destination.create(destinationData);

  res.status(201).json(
    new ApiResponse(201, { destination }, 'Destination created successfully')
  );
});

// @desc    Update destination
// @route   PUT /api/destinations/:identifier
// @access  Private/Admin
exports.updateDestination = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const id = identifier;

  const updateData = {};

  // Main fields
  if (req.body.title !== undefined) updateData.title = req.body.title;
  if (req.body.slug !== undefined) updateData.slug = req.body.slug;
  if (req.body.country_code !== undefined) updateData.country_code = req.body.country_code;

  // Images
  if (req.body.main_image !== undefined) updateData.main_image = req.body.main_image;
  if (req.body.gallery_images !== undefined) updateData.gallery_images = req.body.gallery_images;
  if (req.body.thumbnail_image !== undefined) updateData.thumbnail_image = req.body.thumbnail_image;

  // Descriptions
  if (req.body.short_description !== undefined) updateData.short_description = req.body.short_description;
  if (req.body.long_description !== undefined) updateData.long_description = req.body.long_description;

  // Stats
  if (req.body.trips_count !== undefined) updateData.trips_count = req.body.trips_count;
  if (req.body.rating !== undefined) updateData.rating = req.body.rating;

  // Geo Location
  if (req.body.latitude !== undefined) updateData.latitude = req.body.latitude;
  if (req.body.longitude !== undefined) updateData.longitude = req.body.longitude;

  // New fields
  if (req.body.tagline !== undefined) updateData.tagline = req.body.tagline;
  if (req.body.capital !== undefined) updateData.capital = req.body.capital;
  if (req.body.currency !== undefined) updateData.currency = req.body.currency;
  if (req.body.language !== undefined) updateData.language = req.body.language;
  if (req.body.popular_places !== undefined) updateData.popular_places = req.body.popular_places;
  if (req.body.seasons !== undefined) updateData.seasons = req.body.seasons;
  if (req.body.faqs !== undefined) updateData.faqs = req.body.faqs;

  // SEO
  if (req.body.seo !== undefined) updateData.seo = req.body.seo;

  // Status
  if (req.body.status !== undefined) updateData.status = req.body.status;
  if (req.body.featured !== undefined) updateData.featured = req.body.featured;

  const destination = await Destination.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  res.status(200).json(
    new ApiResponse(200, { destination }, 'Destination updated successfully')
  );
});

// @desc    Delete destination
// @route   DELETE /api/destinations/:identifier
// @access  Private/Admin
exports.deleteDestination = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const id = identifier;

  const destination = await Destination.findByIdAndDelete(id);

  if (!destination) {
    throw new ApiError(404, 'Destination not found');
  }

  res.status(200).json(
    new ApiResponse(200, { destination }, 'Destination deleted successfully')
  );
});

// @desc    Get active destinations for frontend
// @route   GET /api/destinations/active
// @access  Public
exports.getActiveDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ status: 'active' })
    .select('title slug country_code main_image short_description trips_count rating')
    .sort({ featured: -1, trips_count: -1 });

  res.status(200).json(
    new ApiResponse(200, { destinations, count: destinations.length }, 'Active destinations retrieved')
  );
});

// @desc    Get featured destinations
// @route   GET /api/destinations/featured
// @access  Public
exports.getFeaturedDestinations = asyncHandler(async (req, res) => {
  const destinations = await Destination.find({ status: 'active', featured: true })
    .select('title slug country_code main_image short_description trips_count')
    .limit(8);

  res.status(200).json(
    new ApiResponse(200, { destinations }, 'Featured destinations retrieved')
  );
});
