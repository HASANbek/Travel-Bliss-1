const mongoose = require('mongoose');
require('dotenv').config();

// Review model
const reviewSchema = new mongoose.Schema({
  userName: String,
  userEmail: String,
  userAvatar: String,
  rating: Number,
  review: String,
  serviceType: { type: String, default: 'general' },
  serviceId: mongoose.Schema.Types.ObjectId,
  serviceName: String,
  status: { type: String, default: 'approved' },
  aiSentiment: String,
  tripDate: Date,
  helpfulCount: { type: Number, default: 0 },
  isVerifiedPurchase: { type: Boolean, default: true }
}, { timestamps: true });

const Review = mongoose.model('Review', reviewSchema);

// Reviews to import
const reviews = [
  {
    userName: 'Jennifer M.',
    userEmail: 'jennifer.m@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=1',
    rating: 5,
    review: 'Travel Bliss made our trip to Uzbekistan absolutely magical. Our guide was incredibly knowledgeable about the history and culture. The organization was flawless, hotels were beautiful, and the experiences were once in a lifetime. Highly recommend!',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-11-15'),
    helpfulCount: 12,
    isVerifiedPurchase: true
  },
  {
    userName: 'David Thompson',
    userEmail: 'david.t@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=12',
    rating: 5,
    review: "We've traveled extensively but Travel Bliss exceeded all our expectations. The attention to detail, the genuine care for their guests, and the expertly crafted itinerary made this our best vacation ever. The Silk Road came alive through their tours.",
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-10-20'),
    helpfulCount: 8,
    isVerifiedPurchase: true
  },
  {
    userName: 'Sarah Martinez',
    userEmail: 'sarah.m@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5,
    review: 'From the moment we arrived, everything was perfectly arranged. The historical sites were breathtaking, the local food experiences were amazing, and our guide was both professional and friendly. Travel Bliss really knows how to create memorable experiences.',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-10-10'),
    helpfulCount: 15,
    isVerifiedPurchase: true
  },
  {
    userName: 'Michael K.',
    userEmail: 'michael.k@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=13',
    rating: 5,
    review: "Samarkand, Bukhara, and Khiva were spectacular. Travel Bliss arranged everything perfectly - comfortable transport, excellent hotels, and fascinating tours. Our guide's passion for Uzbek history was infectious. Can't wait to return!",
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-09-25'),
    helpfulCount: 6,
    isVerifiedPurchase: true
  },
  {
    userName: 'Emma Wilson',
    userEmail: 'emma.w@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=9',
    rating: 5,
    review: 'Travel Bliss is simply the best. Professional, responsive, and genuinely caring. They went above and beyond to make our trip special, even celebrating my birthday with a surprise cake at Registan Square. Unforgettable memories!',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-09-15'),
    helpfulCount: 10,
    isVerifiedPurchase: true
  },
  {
    userName: 'Robert Chen',
    userEmail: 'robert.c@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=8',
    rating: 4,
    review: 'Very well organized tour with knowledgeable guides. The historical sites were magnificent and the pace was just right. Food was delicious and hotels were comfortable. Only minor issue was some wait times, but overall highly recommend Travel Bliss.',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-08-20'),
    helpfulCount: 4,
    isVerifiedPurchase: true
  },
  {
    userName: 'Lisa Anderson',
    userEmail: 'lisa.a@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=3',
    rating: 5,
    review: 'I was hesitant about traveling to Central Asia, but Travel Bliss made everything easy and comfortable. The blend of history, culture, and hospitality was incredible. Our group became like family. Thank you for an amazing journey!',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-08-10'),
    helpfulCount: 9,
    isVerifiedPurchase: true
  },
  {
    userName: 'James Brown',
    userEmail: 'james.b@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=14',
    rating: 5,
    review: 'Travel Bliss strikes the perfect balance between structured tours and free time. The guides are amazing storytellers who bring history to life. Accommodations were excellent and the whole experience felt authentic and genuine.',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-07-25'),
    helpfulCount: 7,
    isVerifiedPurchase: true
  },
  {
    userName: 'Maria Garcia',
    userEmail: 'maria.g@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=10',
    rating: 5,
    review: 'From booking to farewell, Travel Bliss was exceptional. The attention to detail, the cultural insights, and the warm hospitality made this trip extraordinary. Uzbekistan is stunning and Travel Bliss is the perfect way to experience it.',
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-07-15'),
    helpfulCount: 11,
    isVerifiedPurchase: true
  },
  {
    userName: 'Thomas Schmidt',
    userEmail: 'thomas.s@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=15',
    rating: 5,
    review: "Best organized tour I've ever been on. Travel Bliss handled everything seamlessly - transport, hotels, meals, and tours. Our guide was wonderful and patient with all our questions. The Silk Road cities are absolutely magnificent!",
    serviceType: 'general',
    serviceName: 'Travel Bliss Tours',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-06-20'),
    helpfulCount: 5,
    isVerifiedPurchase: true
  },
  {
    userName: 'Alex Rodriguez',
    userEmail: 'alex.r@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=7',
    rating: 5,
    review: 'The old city of Bukhara is like stepping back in time. Travel Bliss showed us hidden gems that most tourists never see. Our guide was passionate about the history and made every story come alive. Absolutely worth every penny!',
    serviceType: 'general',
    serviceName: 'Bukhara Heritage Tour',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-11-05'),
    helpfulCount: 18,
    isVerifiedPurchase: true
  },
  {
    userName: 'Sophie Laurent',
    userEmail: 'sophie.l@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=2',
    rating: 5,
    review: 'As a history teacher, I was amazed by the depth of knowledge our guide had. The Ark fortress, trading domes, and madrasahs were stunning. Travel Bliss organized everything perfectly. Highly recommend for culture lovers!',
    serviceType: 'general',
    serviceName: 'Bukhara Heritage Tour',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-10-15'),
    helpfulCount: 14,
    isVerifiedPurchase: true
  },
  {
    userName: 'Chris Walker',
    userEmail: 'chris.w@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=6',
    rating: 5,
    review: 'Amazing escape from the city! The mountains were beautiful, the cable car ride was thrilling, and lunch was delicious. Our guide was friendly and made sure everyone was safe and having fun. Great value for money!',
    serviceType: 'general',
    serviceName: 'Chimgan Mountain Day Trip',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-10-01'),
    helpfulCount: 9,
    isVerifiedPurchase: true
  },
  {
    userName: 'Anna Kowalski',
    userEmail: 'anna.k@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=4',
    rating: 5,
    review: "Loved every minute! The scenery was breathtaking and the fresh mountain air was wonderful. Travel Bliss picked us up right on time and everything went smoothly. Highly recommend if you want to see Uzbekistan's natural beauty.",
    serviceType: 'general',
    serviceName: 'Chimgan Mountain Day Trip',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-09-20'),
    helpfulCount: 11,
    isVerifiedPurchase: true
  },
  {
    userName: 'Patricia Johnson',
    userEmail: 'patricia.j@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=18',
    rating: 5,
    review: 'This 10-day tour covered everything! Tashkent, Samarkand, Bukhara, Khiva - each city was unique and fascinating. Travel Bliss took care of every detail. The high-speed train was a highlight. Our guide became like family. Cannot recommend enough!',
    serviceType: 'general',
    serviceName: 'Grand Uzbekistan Tour',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-11-10'),
    helpfulCount: 22,
    isVerifiedPurchase: true
  },
  {
    userName: 'Marco Rossi',
    userEmail: 'marco.r@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=17',
    rating: 5,
    review: "As someone who has traveled extensively, this was one of the best organized tours I've experienced. Perfect balance of guided tours and free time. Hotels were excellent, food was amazing, and the itinerary covered all the major sites without feeling rushed.",
    serviceType: 'general',
    serviceName: 'Grand Uzbekistan Tour',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-10-25'),
    helpfulCount: 16,
    isVerifiedPurchase: true
  },
  {
    userName: 'Yuki Tanaka',
    userEmail: 'yuki.t@example.com',
    userAvatar: 'https://i.pravatar.cc/150?img=19',
    rating: 5,
    review: 'Every day brought new wonders! The architecture, the markets, the people - everything was incredible. Travel Bliss guides were knowledgeable and patient with all our questions. The traditional dinners were delicious. Worth every moment!',
    serviceType: 'general',
    serviceName: 'Grand Uzbekistan Tour',
    status: 'approved',
    aiSentiment: 'positive',
    tripDate: new Date('2025-09-30'),
    helpfulCount: 13,
    isVerifiedPurchase: true
  }
];

async function importReviews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-bliss');
    console.log('Connected to MongoDB');

    // Clear existing reviews (optional - comment out if you want to keep existing)
    // await Review.deleteMany({});
    // console.log('Cleared existing reviews');

    // Check if reviews already exist
    const existingCount = await Review.countDocuments();
    if (existingCount > 0) {
      console.log(`Already have ${existingCount} reviews in database.`);
      console.log('Adding new reviews...');
    }

    // Insert reviews
    const result = await Review.insertMany(reviews);
    console.log(`Successfully imported ${result.length} reviews!`);

    // Show summary
    const totalCount = await Review.countDocuments();
    const approvedCount = await Review.countDocuments({ status: 'approved' });
    console.log(`\nTotal reviews in database: ${totalCount}`);
    console.log(`Approved reviews: ${approvedCount}`);

    mongoose.disconnect();
    console.log('\nDone! Reviews are now available in your database.');
  } catch (error) {
    console.error('Error importing reviews:', error);
    mongoose.disconnect();
  }
}

importReviews();
