const Tour = require('../models/Tour.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const mongoose = require('mongoose');
const FileStorage = require('../utils/fileStorage');
const { generateCompleteSEO } = require('../utils/seoHelpers');
const aiSeoGenerator = require('../services/aiSeoGenerator');

// Initialize file storage for tours
const toursStorage = new FileStorage('tours.json');

// Demo tours data (works when MongoDB is not connected)
let demoTours = [
  {
    id: '1',
    title: 'Samarkand City Tour',
    description: 'Visit the magnificent Registan Square, Ulugbek Observatory and Gur-Amir Mausoleum',
    destination: 'Samarkand',
    price: 500,
    duration: 3,
    nights: 2,
    destinationsCount: 3,
    maxGroupSize: 15,
    groupSizeMin: 5,
    difficulty: 'easy',
    category: 'cultural',
    imageCover: 'tour-package-img1.jpg',
    image: 'tour-package-img1.jpg',
    images: ['tour-package-img1.jpg'],
    accommodation: '5 Star Hotel',
    meals: 'Breakfast & Dinner',
    transportation: 'Taxi, Car',
    languages: ['English', 'Russian', 'Uzbek'],
    animal: 'No pets allowed',
    ageRange: { min: 18, max: 65 },
    season: 'All Seasons',
    highlights: [
      'Registan Square – Explore the heart of Samarkand with three magnificent madrasahs',
      'Gur-e-Amir Mausoleum – Visit the tomb of Amir Timur (Tamerlane)',
      'Ulugbek Observatory – Discover the medieval astronomical observatory built in the 1420s'
    ],
    locations: [
      { name: 'Registan Square', image: 'registan.jpg', days: '01 Days' },
      { name: 'Shah-i-Zinda Necropolis', image: 'shah-i-zinda.jpg', days: '02 Days' }
    ],
    freeCancellation: 'Free cancellation up to 48 hours before departure',
    healthSafety: 'All COVID-19 safety measures are followed. Vaccination recommended but not required.',
    faq: [
      { question: 'What are the must-visit places in Samarkand?', answer: 'Top destinations include Registan Square, Gur-e-Amir Mausoleum, Shah-i-Zinda Necropolis, Ulugbek Observatory, and Bibi-Khanym Mosque.' },
      { question: 'Do tour packages include entrance fees?', answer: 'Yes, all entrance fees to historical monuments and museums are included in the package price.' }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Registan Square – The Heart of Samarkand',
        description: 'Registan Square is the jewel of Samarkand, featuring three grand madrasahs: Ulugbek, Sher-Dor, and Tilya-Kori. Experience the stunning Islamic architecture, intricate tilework, and learn about the Silk Road history.',
        activities: ['Guided tour of Registan Square', 'Photography session', 'Evening light show'],
        meals: 'Breakfast, Lunch',
        accommodation: 'Registan Plaza Hotel',
        transport: ['Car']
      },
      {
        day: 2,
        title: 'Gur-e-Amir & Shah-i-Zinda',
        description: 'Visit the magnificent tomb of Amir Timur and explore the stunning Shah-i-Zinda necropolis with its collection of mausoleums featuring brilliant blue tilework.',
        activities: ['Gur-e-Amir guided tour', 'Shah-i-Zinda exploration', 'Local bazaar visit'],
        meals: 'Breakfast, Dinner',
        accommodation: 'Registan Plaza Hotel',
        transport: ['Car', 'Walking']
      },
      {
        day: 3,
        title: 'Ulugbek Observatory & Bibi-Khanym Mosque',
        description: 'Discover the medieval astronomical observatory and visit the grand Bibi-Khanym Mosque, one of the largest mosques in Central Asia.',
        activities: ['Observatory tour', 'Bibi-Khanym Mosque visit', 'Siab Bazaar shopping'],
        meals: 'Breakfast',
        accommodation: 'Registan Plaza Hotel',
        transport: ['Car']
      }
    ],
    included: ['Accommodation', 'Transportation', 'Guide services', 'All entrance fees'],
    excluded: ['International flights', 'Personal expenses', 'Tips'],
    rating: 5.0,
    ratingsCount: 89,
    isActive: true,
    isFeatured: true,
    hotSale: true,
    createdAt: new Date()
  },
  {
    id: '2',
    title: 'Bukhara Historical Safari',
    description: 'Discover architectural monuments: Ark Fortress, Po-i-Kalyan Complex, and the ancient trading domes',
    destination: 'Bukhara',
    price: 450,
    duration: 2,
    nights: 1,
    destinationsCount: 5,
    maxGroupSize: 20,
    groupSizeMin: 4,
    difficulty: 'easy',
    category: 'cultural',
    imageCover: 'tour-package-img2.jpg',
    image: 'tour-package-img2.jpg',
    images: ['tour-package-img2.jpg'],
    accommodation: '4 Star Boutique Hotel',
    meals: 'Breakfast',
    transportation: 'Car',
    languages: ['English', 'Russian', 'Uzbek'],
    animal: 'No pets allowed',
    ageRange: { min: 12, max: 70 },
    season: 'Spring & Autumn',
    highlights: [
      'Ark Fortress – Explore the ancient citadel of Bukhara emirs',
      'Po-i-Kalyan Complex – See the iconic Kalyan Minaret and mosque',
      'Trading Domes – Visit the historic covered bazaars of Bukhara'
    ],
    locations: [
      { name: 'Lyabi-Hauz', image: 'lyabi-hauz.jpg', days: '01 Days' },
      { name: 'Ark Fortress', image: 'ark-fortress.jpg', days: '01 Days' }
    ],
    freeCancellation: 'Free cancellation up to 24 hours before departure',
    healthSafety: 'Standard health and safety protocols followed',
    faq: [
      { question: 'What makes Bukhara special?', answer: 'Bukhara is one of the most ancient cities on the Silk Road, with over 2,500 years of history and 140 architectural monuments.' },
      { question: 'Is Bukhara safe for tourists?', answer: 'Yes, Bukhara is very safe and welcoming for tourists. The local community is friendly and helpful.' }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Ark Fortress & Po-i-Kalyan Complex',
        description: 'Begin your journey at the Ark Fortress, the ancient residence of Bukhara rulers. Continue to the Po-i-Kalyan Complex featuring the magnificent Kalyan Minaret, Kalyan Mosque, and Mir-i-Arab Madrasah.',
        activities: ['Ark Fortress tour', 'Po-i-Kalyan Complex visit', 'Sunset photography'],
        meals: 'Breakfast, Lunch',
        accommodation: 'Zargaron Plaza Hotel',
        transport: ['Car', 'Walking']
      },
      {
        day: 2,
        title: 'Trading Domes & Lyabi-Hauz',
        description: 'Explore the historic trading domes (Toki Sarrofon, Toki Telpak Furushon, Toki Zargaron) and relax at the beautiful Lyabi-Hauz complex surrounded by madrasahs.',
        activities: ['Trading domes shopping', 'Lyabi-Hauz exploration', 'Traditional craft demonstrations'],
        meals: 'Breakfast',
        accommodation: 'Zargaron Plaza Hotel',
        transport: ['Walking']
      }
    ],
    included: ['Accommodation', 'Transportation', 'Guide services', 'Museum entries'],
    excluded: ['Lunch & Dinner', 'Personal expenses', 'Tips'],
    rating: 4.8,
    ratingsCount: 76,
    isActive: true,
    isFeatured: true,
    hotSale: true,
    createdAt: new Date()
  },
  {
    id: '3',
    title: 'Chimgan Mountains Adventure',
    description: 'Hiking in the mountains, cable car rides, and connecting with nature in Uzbekistan\'s premier mountain resort',
    destination: 'Chimgan',
    price: 300,
    duration: 1,
    nights: 0,
    destinationsCount: 2,
    maxGroupSize: 10,
    groupSizeMin: 2,
    difficulty: 'challenging',
    category: 'adventure',
    imageCover: 'tour-package-img3.jpg',
    image: 'tour-package-img3.jpg',
    images: ['tour-package-img3.jpg'],
    accommodation: 'N/A (Day Trip)',
    meals: 'Lunch',
    transportation: 'Car',
    languages: ['English', 'Russian', 'Uzbek'],
    animal: 'Pets allowed',
    ageRange: { min: 15, max: 55 },
    season: 'Summer & Autumn',
    highlights: [
      'Chimgan Peak – Hike to breathtaking viewpoints',
      'Cable Car Ride – Panoramic views of the Tian Shan mountains',
      'Charvak Lake – Swimming and relaxation by the turquoise waters'
    ],
    locations: [
      { name: 'Chimgan Peak', image: 'chimgan-peak.jpg', days: '01 Days' },
      { name: 'Charvak Lake', image: 'charvak.jpg', days: '01 Days' }
    ],
    freeCancellation: 'Free cancellation up to 72 hours before departure',
    healthSafety: 'Good physical fitness required. First aid kit provided.',
    faq: [
      { question: 'What should I bring for the mountain hike?', answer: 'Comfortable hiking shoes, warm jacket, sunscreen, hat, and water bottle. We provide hiking poles and safety equipment.' },
      { question: 'Is this tour suitable for beginners?', answer: 'The tour is moderate to challenging. Basic hiking experience is recommended. We adjust routes based on group fitness levels.' }
    ],
    itinerary: [
      {
        day: 1,
        title: 'Chimgan Mountains & Charvak Lake',
        description: 'Start with a scenic drive to Chimgan (90km from Tashkent). Take the cable car to Big Chimgan peak, enjoy hiking trails with spectacular mountain views. Descend and visit beautiful Charvak Lake for swimming and relaxation before returning to Tashkent.',
        activities: ['Cable car ride', 'Mountain hiking', 'Charvak Lake swimming', 'Photography'],
        meals: 'Lunch',
        accommodation: 'N/A',
        transport: ['Car', 'Cable Car']
      }
    ],
    included: ['Transportation', 'Guide', 'Equipment', 'Cable car tickets', 'Lunch'],
    excluded: ['Accommodation', 'Personal expenses', 'Tips'],
    rating: 4.7,
    ratingsCount: 52,
    isActive: true,
    isFeatured: false,
    hotSale: false,
    createdAt: new Date()
  },
  {
    id: '4',
    title: '10-Day Uzbekistan Grand Tour',
    description: 'Discover the ancient Silk Road cities of Uzbekistan on this comprehensive 10-day journey through history, culture, and breathtaking landscapes. Visit Tashkent, Samarkand, Bukhara, Khiva and experience the authentic Uzbek hospitality.',
    destination: 'Uzbekistan',
    price: 1299,
    duration: 10,
    nights: 9,
    destinationsCount: 4,
    maxGroupSize: 16,
    groupSizeMin: 2,
    difficulty: 'easy',
    category: 'cultural',
    imageCover: 'tour-package-img1.jpg',
    image: 'tour-package-img1.jpg',
    images: ['tour-package-img1.jpg', 'tour-package-img2.jpg', 'tour-package-img3.jpg', 'tour-package-img4.jpg', 'tour-package-img5.jpg'],
    accommodation: '4-Star Hotels & Guesthouses',
    meals: 'Breakfast & Select Dinners',
    transportation: 'AC Bus, High-Speed Train',
    languages: ['English', 'Russian', 'Uzbek'],
    animal: 'No pets allowed',
    ageRange: { min: 12, max: 75 },
    season: 'Spring & Autumn (Best)',
    summary: 'Complete Silk Road adventure covering all major historical cities of Uzbekistan',
    highlights: [
      'Explore three UNESCO World Heritage Sites (Samarkand, Bukhara, Khiva)',
      'Visit the legendary Registan Square in Samarkand',
      'Walk through the ancient streets of Bukhara old town',
      'Discover the walled city of Khiva - an open-air museum',
      'Experience traditional Uzbek cuisine and hospitality',
      'Stay in authentic guesthouses and boutique hotels',
      'Professional English-speaking guide throughout the tour',
      'High-speed train journey from Tashkent to Samarkand'
    ],
    locations: [
      { name: 'Tashkent', image: 'tashkent.jpg', days: '02 Days' },
      { name: 'Samarkand', image: 'samarkand.jpg', days: '02 Days' },
      { name: 'Bukhara', image: 'bukhara.jpg', days: '03 Days' },
      { name: 'Khiva', image: 'khiva.jpg', days: '02 Days' }
    ],
    freeCancellation: 'Free cancellation up to 14 days before departure',
    healthSafety: 'All COVID-19 safety measures followed. Travel insurance recommended.',
    faq: [
      { question: 'Is visa required for Uzbekistan?', answer: 'Citizens of many countries can visit Uzbekistan visa-free for up to 30 days. Please check current requirements for your nationality.' },
      { question: 'What is the best time to visit Uzbekistan?', answer: 'Spring (April-May) and Autumn (September-October) offer the best weather with comfortable temperatures and clear skies.' },
      { question: 'Are meals included in the tour?', answer: 'Daily breakfast and 5 traditional Uzbek dinners are included. Lunches are not included to give you flexibility to try different local restaurants.' },
      { question: 'What should I pack for this tour?', answer: 'Comfortable walking shoes, modest clothing for mosque visits, sunscreen, hat, and a light jacket for evenings.' }
    ],
    itinerary: [
      { day: 1, title: 'Arrival in Tashkent', description: 'Arrive in Tashkent, transfer to hotel. City tour including Chorsu Bazaar and Independence Square. Welcome dinner.', activities: ['Airport pickup', 'Chorsu Bazaar', 'Independence Square', 'Welcome dinner'], meals: 'Dinner', accommodation: 'City Palace Hotel', transport: ['Car'] },
      { day: 2, title: 'Tashkent to Samarkand by Train', description: 'High-speed train to Samarkand. Visit Registan Square and Gur-e-Amir Mausoleum.', activities: ['High-speed train', 'Registan Square', 'Gur-e-Amir Mausoleum'], meals: 'Breakfast, Dinner', accommodation: 'Registan Plaza', transport: ['Train', 'Car'] },
      { day: 3, title: 'Samarkand Highlights', description: 'Full day exploring Shah-i-Zinda, Bibi-Khanym Mosque, and Ulugbek Observatory.', activities: ['Shah-i-Zinda', 'Bibi-Khanym Mosque', 'Ulugbek Observatory'], meals: 'Breakfast, Dinner', accommodation: 'Registan Plaza', transport: ['Car'] },
      { day: 4, title: 'Samarkand to Bukhara', description: 'Scenic drive to Bukhara. Stop at pottery workshop. Evening at Lyabi-Hauz.', activities: ['Drive to Bukhara', 'Pottery workshop', 'Lyabi-Hauz'], meals: 'Breakfast', accommodation: 'Zargaron Plaza', transport: ['Car'] },
      { day: 5, title: 'Bukhara Old City', description: 'Explore Ark Fortress, trading domes, Kalyan Complex. UNESCO World Heritage Site.', activities: ['Ark Fortress', 'Trading domes', 'Kalyan Minaret'], meals: 'Breakfast, Dinner', accommodation: 'Zargaron Plaza', transport: ['Walking'] },
      { day: 6, title: 'Bukhara Surroundings', description: 'Bahauddin Naqshband Complex and Sitorai Palace. Evening folklore show.', activities: ['Naqshband shrine', 'Summer Palace', 'Folklore show'], meals: 'Breakfast, Dinner', accommodation: 'Zargaron Plaza', transport: ['Car'] },
      { day: 7, title: 'Bukhara to Khiva', description: 'Desert drive to Khiva through Kyzylkum. Cross Amu Darya River.', activities: ['Desert drive', 'Amu Darya River', 'Arrival in Khiva'], meals: 'Breakfast', accommodation: 'Orient Star Khiva', transport: ['Car'] },
      { day: 8, title: 'Khiva - Open Air Museum', description: 'Full day in Itchan Kala. Visit Kalta Minor, Kunya Ark, Juma Mosque.', activities: ['Itchan Kala', 'Kalta Minor', 'Tash Khovli Palace'], meals: 'Breakfast, Dinner', accommodation: 'Orient Star Khiva', transport: ['Walking'] },
      { day: 9, title: 'Return to Tashkent', description: 'Flight to Tashkent. Last shopping and farewell dinner.', activities: ['Flight to Tashkent', 'Shopping', 'Farewell dinner'], meals: 'Breakfast, Dinner', accommodation: 'City Palace Hotel', transport: ['Flight', 'Car'] },
      { day: 10, title: 'Departure', description: 'Hotel check-out and airport transfer.', activities: ['Check-out', 'Airport transfer'], meals: 'Breakfast', accommodation: 'N/A', transport: ['Car'] }
    ],
    included: ['9 nights accommodation', 'All transfers and transport', 'English-speaking guide', 'Entrance fees', 'Breakfast daily', '5 traditional dinners', 'High-speed train ticket'],
    excluded: ['International flights', 'Travel insurance', 'Lunches', 'Personal expenses', 'Tips for guide'],
    rating: 4.9,
    ratingsCount: 79,
    isActive: true,
    isFeatured: true,
    hotSale: true,
    createdAt: new Date()
  }
];

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
exports.getAllTours = asyncHandler(async (req, res) => {
  // MongoDB ulanmagan bo'lsa file storage yoki demo data qaytarish
  if (mongoose.connection.readyState !== 1) {
    const { category, difficulty, minPrice, maxPrice } = req.query;

    // Try to get tours from file storage first
    let tours = await toursStorage.findAll();

    // If no tours in file, use demo tours
    if (tours.length === 0) {
      tours = demoTours;
    }

    let filteredTours = [...tours];

    // Apply filters to demo data
    if (category) {
      filteredTours = filteredTours.filter(tour => tour.category === category);
    }
    if (difficulty) {
      filteredTours = filteredTours.filter(tour => tour.difficulty === difficulty);
    }
    if (minPrice) {
      filteredTours = filteredTours.filter(tour => tour.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredTours = filteredTours.filter(tour => tour.price <= parseFloat(maxPrice));
    }

    return res.status(200).json(
      new ApiResponse(200, {
        tours: filteredTours,
        count: filteredTours.length,
        mode: 'DEMO'
      }, 'Demo turlar ro\'yxati')
    );
  }

  // Query parameters
  const { category, difficulty, minPrice, maxPrice, sort, limit = 10, page = 1 } = req.query;

  // Build query
  let query = Tour.find();

  // Filters
  if (category) query = query.where('category').equals(category);
  if (difficulty) query = query.where('difficulty').equals(difficulty);
  if (minPrice) query = query.where('price').gte(Number(minPrice));
  if (maxPrice) query = query.where('price').lte(Number(maxPrice));

  // Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(Number(limit));

  const tours = await query;
  const total = await Tour.countDocuments();

  res.status(200).json(
    new ApiResponse(200, {
      tours,
      count: tours.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    }, 'Tours list retrieved successfully')
  );
});

// @desc    Get single tour
// @route   GET /api/tours/:id
// @access  Public
exports.getTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // MongoDB ulanmagan bo'lsa file storage yoki demo data
  if (mongoose.connection.readyState !== 1) {
    // Try to get tour from file storage first
    let tour = await toursStorage.findById(id);

    // If not found in file storage, try demo tours
    if (!tour) {
      tour = demoTours.find(t => t.id === id);
    }

    if (!tour) {
      throw new ApiError(404, 'Tour not found');
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Tour details retrieved successfully',
      data: { tour, mode: 'FILE_STORAGE' }
    });
  }

  // Try to find by MongoDB ObjectId first, then by slug
  let tour;
  if (id.match(/^[0-9a-fA-F]{24}$/)) {
    tour = await Tour.findById(id);
  }

  // If not found by ID, try by slug
  if (!tour) {
    tour = await Tour.findOne({ slug: id });
  }

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.status(200).json(
    new ApiResponse(200, { tour }, 'Tour details retrieved successfully')
  );
});

// @desc    Create tour
// @route   POST /api/tours
// @access  Private/Admin
exports.createTour = asyncHandler(async (req, res) => {
  const requestData = req.body;

  // Map frontend field names to backend model field names
  const tourData = {
    title: requestData.name || requestData.title,
    summary: requestData.summary,
    description: requestData.description,
    destination: requestData.location || requestData.destination,
    price: requestData.price,
    discountPrice: requestData.discountPrice,
    duration: requestData.duration,
    nights: requestData.nights,
    destinationsCount: requestData.destinationsCount,
    maxGroupSize: requestData.maxGroupSize,
    groupSizeMin: requestData.groupSizeMin,
    difficulty: requestData.difficulty,
    startDates: requestData.startDate ? [requestData.startDate] : requestData.startDates || [],
    imageCover: requestData.image || requestData.imageCover || 'default-tour.jpg',
    images: requestData.images || [],
    category: requestData.category,
    videoUrl: requestData.videoUrl,
    itinerary: requestData.itinerary,
    tags: requestData.tags || [],
    included: requestData.includes || requestData.included || [],
    excluded: requestData.excludes || requestData.excluded || [],
    accommodation: requestData.accommodation,
    meals: requestData.meals,
    transportation: requestData.transportation,
    languages: requestData.languages || [],
    animal: requestData.animal,
    ageRange: requestData.ageRange,
    season: requestData.season,
    highlights: requestData.highlights || [],
    locations: requestData.locations || [],
    freeCancellation: requestData.freeCancellation,
    healthSafety: requestData.healthSafety,
    faq: requestData.faq || [],
    rating: requestData.rating || 0,
    isActive: requestData.isActive !== undefined ? requestData.isActive : true,
    isFeatured: requestData.isFeatured || false,
    hotSale: requestData.hotSale || false
  };

  // Remove undefined fields
  Object.keys(tourData).forEach(key => {
    if (tourData[key] === undefined) {
      delete tourData[key];
    }
  });

  // 🤖 AUTOMATIC SEO GENERATION
  // Generate SEO automatically if not provided
  let seoGenerated = false;
  let seoScore = null;

  if (!requestData.seo && tourData.title && tourData.destination && tourData.duration && tourData.price) {
    try {
      console.log('🤖 Generating SEO automatically for tour:', tourData.title);

      // Try AI-powered SEO first, fallback to template if AI not available
      let seoData;
      try {
        seoData = await aiSeoGenerator.generateSEO(tourData);
      } catch (aiError) {
        // AI not available, use template
        console.log('AI not available, using template SEO generation');
        seoData = aiSeoGenerator.generateTemplateSEO(tourData);
      }

      seoScore = aiSeoGenerator.calculateSEOScore(seoData);

      // Add SEO to tour data
      tourData.seo = seoData;
      tourData.slug = seoData.slug;

      seoGenerated = true;
      console.log(`✅ SEO generated successfully! Score: ${seoScore.score}/100 (${seoScore.grade})`);
    } catch (error) {
      console.error('⚠️ Failed to generate SEO automatically:', error.message);
      // Continue without SEO - tour will still be created
    }
  } else if (requestData.seo) {
    // User provided SEO manually
    tourData.seo = requestData.seo;
    tourData.slug = requestData.seo.slug || aiSeoGenerator.createSlug(tourData.title, tourData.duration);
  }

  // MongoDB ulanmagan bo'lsa file storage
  if (mongoose.connection.readyState !== 1) {
    const newTour = {
      id: String(Date.now()),
      ...tourData,
      rating: tourData.rating || 0,
      ratingsCount: 0,
      isActive: tourData.isActive !== undefined ? tourData.isActive : true,
      isFeatured: tourData.isFeatured || false,
      createdAt: new Date().toISOString()
    };

    // Save to file storage
    await toursStorage.create(newTour);

    return res.status(201).json(
      new ApiResponse(201, {
        tour: newTour,
        mode: 'FILE_STORAGE',
        seoGenerated: seoGenerated,
        seoScore: seoScore
      }, seoGenerated ? 'Tour created successfully with AI-generated SEO!' : 'Tour created successfully')
    );
  }

  const tour = await Tour.create(tourData);

  res.status(201).json(
    new ApiResponse(201, {
      tour,
      seoGenerated: seoGenerated,
      seoScore: seoScore
    }, seoGenerated ? 'Tour created successfully with AI-generated SEO!' : 'Tour created successfully')
  );
});

// @desc    Update tour
// @route   PUT /api/tours/:id
// @access  Private/Admin
exports.updateTour = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const requestData = req.body;

  // Map frontend field names to backend model field names
  const updateData = {};

  if (requestData.name || requestData.title) updateData.title = requestData.name || requestData.title;
  if (requestData.summary !== undefined) updateData.summary = requestData.summary;
  if (requestData.description !== undefined) updateData.description = requestData.description;
  if (requestData.location || requestData.destination) updateData.destination = requestData.location || requestData.destination;
  if (requestData.price !== undefined) updateData.price = requestData.price;
  if (requestData.discountPrice !== undefined) updateData.discountPrice = requestData.discountPrice;
  if (requestData.duration !== undefined) updateData.duration = requestData.duration;
  if (requestData.nights !== undefined) updateData.nights = requestData.nights;
  if (requestData.destinationsCount !== undefined) updateData.destinationsCount = requestData.destinationsCount;
  if (requestData.maxGroupSize !== undefined) updateData.maxGroupSize = requestData.maxGroupSize;
  if (requestData.groupSizeMin !== undefined) updateData.groupSizeMin = requestData.groupSizeMin;
  if (requestData.difficulty !== undefined) updateData.difficulty = requestData.difficulty;
  if (requestData.startDate) updateData.startDates = [requestData.startDate];
  if (requestData.startDates) updateData.startDates = requestData.startDates;
  if (requestData.image || requestData.imageCover) updateData.imageCover = requestData.image || requestData.imageCover;
  if (requestData.images) updateData.images = requestData.images;
  if (requestData.category !== undefined) updateData.category = requestData.category;
  if (requestData.videoUrl !== undefined) updateData.videoUrl = requestData.videoUrl;
  if (requestData.itinerary !== undefined) updateData.itinerary = requestData.itinerary;
  if (requestData.tags) updateData.tags = requestData.tags;
  if (requestData.includes || requestData.included) updateData.included = requestData.includes || requestData.included;
  if (requestData.excludes || requestData.excluded) updateData.excluded = requestData.excludes || requestData.excluded;
  if (requestData.accommodation !== undefined) updateData.accommodation = requestData.accommodation;
  if (requestData.meals !== undefined) updateData.meals = requestData.meals;
  if (requestData.transportation !== undefined) updateData.transportation = requestData.transportation;
  if (requestData.languages) updateData.languages = requestData.languages;
  if (requestData.animal !== undefined) updateData.animal = requestData.animal;
  if (requestData.ageRange !== undefined) updateData.ageRange = requestData.ageRange;
  if (requestData.season !== undefined) updateData.season = requestData.season;
  if (requestData.highlights) updateData.highlights = requestData.highlights;
  if (requestData.locations) updateData.locations = requestData.locations;
  if (requestData.freeCancellation !== undefined) updateData.freeCancellation = requestData.freeCancellation;
  if (requestData.healthSafety !== undefined) updateData.healthSafety = requestData.healthSafety;
  if (requestData.faq) updateData.faq = requestData.faq;
  if (requestData.rating !== undefined) updateData.rating = requestData.rating;
  if (requestData.isActive !== undefined) updateData.isActive = requestData.isActive;
  if (requestData.isFeatured !== undefined) updateData.isFeatured = requestData.isFeatured;
  if (requestData.hotSale !== undefined) updateData.hotSale = requestData.hotSale;

  // 🤖 AUTOMATIC SEO REGENERATION
  // Regenerate SEO if main fields changed and regenerateSEO flag is set
  let seoRegenerated = false;
  let seoScore = null;

  const mainFieldsChanged = updateData.title || updateData.destination || updateData.duration || updateData.price || updateData.description;

  if (requestData.regenerateSEO === true && mainFieldsChanged) {
    try {
      // Get current tour data first
      let currentTour;
      if (mongoose.connection.readyState !== 1) {
        currentTour = await toursStorage.findById(id);
      } else {
        currentTour = await Tour.findById(id);
      }

      if (currentTour) {
        // Merge current tour with updates
        const tourDataForSEO = {
          ...currentTour.toObject ? currentTour.toObject() : currentTour,
          ...updateData
        };

        console.log('🤖 Regenerating SEO for updated tour:', tourDataForSEO.title);

        const seoData = await aiSeoGenerator.generateSEO(tourDataForSEO);
        seoScore = aiSeoGenerator.calculateSEOScore(seoData);

        updateData.seo = seoData;
        updateData.slug = seoData.slug;

        seoRegenerated = true;
        console.log(`✅ SEO regenerated! Score: ${seoScore.score}/100 (${seoScore.grade})`);
      }
    } catch (error) {
      console.error('⚠️ Failed to regenerate SEO:', error.message);
    }
  } else if (requestData.seo) {
    // Manual SEO update
    updateData.seo = requestData.seo;
    if (requestData.seo.slug) {
      updateData.slug = requestData.seo.slug;
    }
  }

  // MongoDB ulanmagan bo'lsa file storage
  if (mongoose.connection.readyState !== 1) {
    let tour = await toursStorage.findById(id);
    if (!tour) {
      throw new ApiError(404, 'Tour not found');
    }

    const updatedTour = {
      ...tour,
      ...updateData,
      id: tour.id,
      createdAt: tour.createdAt,
      updatedAt: new Date().toISOString()
    };

    await toursStorage.update(id, updatedTour);

    return res.status(200).json(
      new ApiResponse(200, {
        tour: updatedTour,
        mode: 'FILE_STORAGE',
        seoRegenerated: seoRegenerated,
        seoScore: seoScore
      }, seoRegenerated ? 'Tour updated with regenerated SEO!' : 'Tour updated successfully')
    );
  }

  const tour = await Tour.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.status(200).json(
    new ApiResponse(200, {
      tour,
      seoRegenerated: seoRegenerated,
      seoScore: seoScore
    }, seoRegenerated ? 'Tour updated with regenerated SEO!' : 'Tour updated successfully')
  );
});

// @desc    Delete tour
// @route   DELETE /api/tours/:id
// @access  Private/Admin
exports.deleteTour = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // MongoDB ulanmagan bo'lsa demo data
  if (mongoose.connection.readyState !== 1) {
    const tourIndex = demoTours.findIndex(t => t.id === id);
    if (tourIndex === -1) {
      throw new ApiError(404, 'Tour not found');
    }

    demoTours.splice(tourIndex, 1);

    return res.status(200).json(
      new ApiResponse(200, null, 'Tour deleted successfully')
    );
  }

  const tour = await Tour.findByIdAndDelete(id);

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Tour deleted successfully')
  );
});

// @desc    Get featured tours
// @route   GET /api/tours/featured
// @access  Public
exports.getFeaturedTours = asyncHandler(async (req, res) => {
  // MongoDB ulanmagan bo'lsa demo data
  if (mongoose.connection.readyState !== 1) {
    const featured = demoTours.filter(t => t.isFeatured);
    return res.status(200).json(
      new ApiResponse(200, { tours: featured, count: featured.length, mode: 'DEMO' }, 'Featured tours retrieved successfully')
    );
  }

  const tours = await Tour.find({ isFeatured: true, isActive: true }).limit(6);

  res.status(200).json(
    new ApiResponse(200, { tours, count: tours.length }, 'Featured tours retrieved successfully')
  );
});

// @desc    Get tour statistics
// @route   GET /api/tours/stats
// @access  Public
exports.getTourStats = asyncHandler(async (req, res) => {
  // MongoDB ulanmagan bo'lsa demo stats
  if (mongoose.connection.readyState !== 1) {
    const stats = {
      totalTours: demoTours.length,
      avgPrice: Math.round(demoTours.reduce((sum, t) => sum + t.price, 0) / demoTours.length),
      avgRating: Math.round(demoTours.reduce((sum, t) => sum + t.rating, 0) / demoTours.length * 10) / 10,
      categories: {
        cultural: demoTours.filter(t => t.category === 'cultural').length,
        adventure: demoTours.filter(t => t.category === 'adventure').length,
        nature: demoTours.filter(t => t.category === 'nature').length
      },
      mode: 'DEMO'
    };

    return res.status(200).json(
      new ApiResponse(200, stats, 'Tour statistics retrieved successfully')
    );
  }

  const stats = await Tour.aggregate([
    {
      $group: {
        _id: null,
        totalTours: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        avgRating: { $avg: '$rating' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);

  const categoryStats = await Tour.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' }
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      general: stats[0] || {},
      categories: categoryStats
    }, 'Tour statistics retrieved successfully')
  );
});

// @desc    Get tour SEO data
// @route   GET /api/tours/:id/seo
// @access  Public
exports.getTourSEO = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // MongoDB ulanmagan bo'lsa file storage yoki demo data
  if (mongoose.connection.readyState !== 1) {
    // Try to get tour from file storage first
    let tour = await toursStorage.findById(id);

    // If not found in file storage, try demo tours
    if (!tour) {
      tour = demoTours.find(t => t.id === id);
    }

    if (!tour) {
      throw new ApiError(404, 'Tour not found');
    }

    // Generate complete SEO package
    const seoData = generateCompleteSEO(tour);

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Tour SEO data retrieved successfully',
      data: {
        tour: {
          id: tour.id,
          title: tour.title,
          slug: tour.slug,
          destination: tour.destination,
          mainImage: tour.mainImage,
          images: tour.images
        },
        seo: seoData,
        mode: 'FILE_STORAGE'
      }
    });
  }

  const tour = await Tour.findById(id);

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  // Generate complete SEO package
  const seoData = generateCompleteSEO(tour);

  res.status(200).json(
    new ApiResponse(200, {
      tour: {
        id: tour._id,
        title: tour.title,
        slug: tour.slug,
        destination: tour.destination
      },
      seo: seoData
    }, 'Tour SEO data retrieved successfully')
  );
});

// @desc    Update tour SEO data
// @route   PUT /api/tours/:id/seo
// @access  Private (Admin)
exports.updateTourSEO = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { seoTitle, seoDescription, slug, seoKeywords } = req.body;

  // Prepare update object
  const updates = {};
  if (seoTitle) updates.seoTitle = seoTitle;
  if (seoDescription) updates.seoDescription = seoDescription;
  if (slug) updates.slug = slug;
  if (seoKeywords) updates.seoKeywords = seoKeywords;

  // MongoDB ulanmagan bo'lsa file storage
  if (mongoose.connection.readyState !== 1) {
    const updatedTour = await toursStorage.update(id, updates);

    if (!updatedTour) {
      throw new ApiError(404, 'Tour not found');
    }

    return res.status(200).json({
      statusCode: 200,
      success: true,
      message: 'Tour SEO updated successfully',
      data: {
        tour: updatedTour,
        mode: 'FILE_STORAGE'
      }
    });
  }

  const tour = await Tour.findByIdAndUpdate(id, updates, { new: true });

  if (!tour) {
    throw new ApiError(404, 'Tour not found');
  }

  res.status(200).json(
    new ApiResponse(200, { tour }, 'Tour SEO updated successfully')
  );
});
