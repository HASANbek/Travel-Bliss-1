const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-bliss').then(async () => {
  const Tour = require('./src/models/Tour.model');

  const newTours = [
    {
      title: 'Samarkand Silk Road Explorer',
      summary: 'Discover the ancient Silk Road treasures of Samarkand',
      description: 'Explore the magnificent Registan Square, Shah-i-Zinda necropolis, and Bibi-Khanym Mosque. This tour takes you through the heart of the ancient Silk Road, showcasing stunning Islamic architecture and rich history.',
      destination: 'Samarkand',
      price: 450,
      duration: 3,
      nights: 2,
      maxGroupSize: 15,
      difficulty: 'easy',
      category: 'cultural',
      imageCover: '/images/tours/samarkand-registan.jpg',
      rating: 4.8,
      ratingsCount: 124,
      isActive: true,
      isFeatured: true,
      highlights: [
        'Visit the iconic Registan Square',
        'Explore Shah-i-Zinda necropolis',
        'See the Bibi-Khanym Mosque',
        'Traditional Uzbek lunch included',
        'Expert local guide'
      ],
      included: [
        'Hotel accommodation (2 nights)',
        'All entrance fees',
        'Professional English-speaking guide',
        'Air-conditioned transport',
        'Daily breakfast and one lunch'
      ],
      excluded: [
        'International flights',
        'Personal expenses',
        'Tips for guide and driver',
        'Travel insurance'
      ],
      tags: ['silk-road', 'history', 'architecture', 'samarkand']
    },
    {
      title: 'Bukhara Ancient City Tour',
      summary: 'Walk through 2000 years of history in Bukhara',
      description: 'Immerse yourself in the timeless beauty of Bukhara, one of the best-preserved medieval cities in Central Asia. Visit the Ark Fortress, Poi Kalyan complex, and countless historic madrasahs and mosques.',
      destination: 'Bukhara',
      price: 380,
      duration: 2,
      nights: 1,
      maxGroupSize: 12,
      difficulty: 'easy',
      category: 'cultural',
      imageCover: '/images/tours/bukhara-kalyan.jpg',
      rating: 4.7,
      ratingsCount: 98,
      isActive: true,
      isFeatured: false,
      highlights: [
        'Explore the ancient Ark Fortress',
        'Visit Poi Kalyan complex',
        'Walk through covered bazaars',
        'See Lyabi-Hauz ensemble',
        'Sunset at Chor Minor'
      ],
      included: [
        'Hotel accommodation (1 night)',
        'All entrance fees',
        'Professional guide',
        'Transport from/to Samarkand',
        'Breakfast'
      ],
      excluded: [
        'Lunch and dinner',
        'Personal expenses',
        'Tips'
      ],
      tags: ['bukhara', 'ancient', 'medieval', 'unesco']
    },
    {
      title: 'Khiva Desert Fortress Adventure',
      summary: 'Step into a living museum in the Khorezm desert',
      description: 'Discover Khiva, the fairy-tale city frozen in time. Explore Ichan-Kala inner city, climb the Kalta Minor minaret, and experience authentic Khorezmian culture in this UNESCO World Heritage site.',
      destination: 'Khiva',
      price: 520,
      duration: 4,
      nights: 3,
      maxGroupSize: 10,
      difficulty: 'moderate',
      category: 'adventure',
      imageCover: '/images/tours/khiva-minaret.jpg',
      rating: 4.9,
      ratingsCount: 67,
      isActive: true,
      isFeatured: true,
      highlights: [
        'Full exploration of Ichan-Kala',
        'Climb Islam Khoja minaret',
        'Visit Juma Mosque with 218 columns',
        'Sunset camel ride in desert',
        'Traditional Khorezmian dinner'
      ],
      included: [
        'Boutique hotel in old city (3 nights)',
        'All entrance fees',
        'English-speaking guide',
        'Flight Tashkent-Urgench-Tashkent',
        'All meals'
      ],
      excluded: [
        'International flights',
        'Personal expenses',
        'Travel insurance'
      ],
      tags: ['khiva', 'desert', 'unesco', 'adventure']
    },
    {
      title: 'Chimgan Mountain Hiking',
      summary: 'Escape to the mountains near Tashkent',
      description: 'Experience the natural beauty of Uzbekistan with this hiking adventure in the Chimgan mountains. Perfect for nature lovers seeking fresh air, stunning views, and outdoor activities just 80km from Tashkent.',
      destination: 'Chimgan',
      price: 150,
      duration: 1,
      nights: 0,
      maxGroupSize: 20,
      difficulty: 'moderate',
      category: 'hiking',
      imageCover: '/images/tours/chimgan-mountains.jpg',
      rating: 4.6,
      ratingsCount: 156,
      isActive: true,
      isFeatured: false,
      highlights: [
        'Scenic mountain hiking trails',
        'Charvak Lake viewpoint',
        'Cable car ride (optional)',
        'Picnic lunch in nature',
        'Small group experience'
      ],
      included: [
        'Round-trip transport from Tashkent',
        'Professional hiking guide',
        'Picnic lunch',
        'Bottled water',
        'First aid kit'
      ],
      excluded: [
        'Cable car ticket',
        'Personal hiking gear',
        'Tips'
      ],
      tags: ['hiking', 'mountains', 'nature', 'day-trip']
    },
    {
      title: 'Tashkent City Discovery',
      summary: 'Explore the modern capital with ancient roots',
      description: 'Discover the contrasts of Tashkent, where Soviet architecture meets ancient traditions. Visit the famous Chorsu Bazaar, beautiful metro stations, and historic old town in this comprehensive city tour.',
      destination: 'Tashkent',
      price: 85,
      duration: 1,
      nights: 0,
      maxGroupSize: 15,
      difficulty: 'easy',
      category: 'day-trip',
      imageCover: '/images/tours/tashkent-metro.jpg',
      rating: 4.5,
      ratingsCount: 203,
      isActive: true,
      isFeatured: false,
      highlights: [
        'Explore Chorsu Bazaar',
        'Visit ornate metro stations',
        'See Khast Imam complex',
        'Walk through old town',
        'Taste local street food'
      ],
      included: [
        'Professional guide',
        'Metro tickets',
        'Street food tasting',
        'Bottled water'
      ],
      excluded: [
        'Hotel pickup (meeting point only)',
        'Lunch',
        'Personal purchases',
        'Tips'
      ],
      tags: ['tashkent', 'city-tour', 'bazaar', 'metro']
    }
  ];

  console.log('Adding 5 new tours...\n');

  for (const tourData of newTours) {
    try {
      const tour = new Tour(tourData);
      await tour.save();
      console.log('✅ Added: ' + tour.title + ' (slug: ' + tour.slug + ')');
    } catch (error) {
      if (error.code === 11000) {
        console.log('⚠️  Tour already exists: ' + tourData.title);
      } else {
        console.error('❌ Error adding ' + tourData.title + ':', error.message);
      }
    }
  }

  console.log('\n✅ Done! Total tours now:');
  const count = await Tour.countDocuments();
  console.log('   ' + count + ' tours in database');

  await mongoose.disconnect();
}).catch(e => console.error('Connection error:', e));
