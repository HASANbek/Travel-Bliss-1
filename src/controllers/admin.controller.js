const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const FileStorage = require('../utils/fileStorage');
const bookingsStorage = require('../storage/bookings.storage');
const bcrypt = require('bcryptjs');
const {
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification
} = require('../utils/sendEmail');

// Initialize file storage
const usersStorage = new FileStorage('users.json');
const toursStorage = new FileStorage('tours.json');

// ========== DEMO MA'LUMOTLAR (MongoDB ulanmaguncha) ==========

let demoUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@travelbliss.uz',
    phone: '+998901234567',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Javohir Akbarov',
    email: 'javohir@example.com',
    phone: '+998901234568',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Dilshod Karimov',
    email: 'dilshod@example.com',
    phone: '+998901234569',
    role: 'agent',
    isActive: true,
    createdAt: new Date('2024-02-01')
  },
  {
    id: '4',
    name: 'Aziza Rahimova',
    email: 'aziza@example.com',
    phone: '+998901234570',
    role: 'user',
    isActive: false,
    createdAt: new Date('2024-02-10')
  }
];

let demoTours = [
  {
    id: '1',
    title: 'Samarqand - Buxoro Turi',
    destination: 'Uzbekistan',
    duration: '5 kun / 4 kecha',
    price: 350,
    category: 'Cultural',
    availableSeats: 15,
    totalBookings: 5,
    status: 'active'
  },
  {
    id: '2',
    title: 'Dubai Luxury Tour',
    destination: 'UAE',
    duration: '7 kun / 6 kecha',
    price: 1200,
    category: 'Luxury',
    availableSeats: 10,
    totalBookings: 8,
    status: 'active'
  },
  {
    id: '3',
    title: 'Istanbul Shopping Tour',
    destination: 'Turkey',
    duration: '4 kun / 3 kecha',
    price: 450,
    category: 'Shopping',
    availableSeats: 20,
    totalBookings: 12,
    status: 'active'
  }
];

let demoBookings = [
  {
    id: '1',
    userId: '2',
    tourId: '1',
    userName: 'Javohir Akbarov',
    tourTitle: 'Samarqand - Buxoro Turi',
    totalPrice: 700,
    quantity: 2,
    status: 'confirmed',
    paymentStatus: 'paid',
    bookingDate: new Date('2024-03-01')
  },
  {
    id: '2',
    userId: '3',
    tourId: '2',
    userName: 'Dilshod Karimov',
    tourTitle: 'Dubai Luxury Tour',
    totalPrice: 1200,
    quantity: 1,
    status: 'pending',
    paymentStatus: 'pending',
    bookingDate: new Date('2024-03-05')
  }
];

// ========== ADMIN DASHBOARD ==========

/**
 * @desc    Admin Dashboard - Asosiy Statistika
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getDashboard = asyncHandler(async (req, res) => {
  const stats = {
    totalUsers: demoUsers.length,
    activeUsers: demoUsers.filter(u => u.isActive).length,
    totalTours: demoTours.length,
    activeTours: demoTours.filter(t => t.status === 'active').length,
    totalBookings: demoBookings.length,
    confirmedBookings: demoBookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: demoBookings.filter(b => b.status === 'pending').length,
    totalRevenue: demoBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    paidRevenue: demoBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0),
    pendingRevenue: demoBookings
      .filter(b => b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + b.totalPrice, 0)
  };

  const recentBookings = demoBookings.slice(0, 5);
  const popularTours = demoTours
    .sort((a, b) => b.totalBookings - a.totalBookings)
    .slice(0, 5);

  res.status(200).json(
    new ApiResponse(200, {
      stats,
      recentBookings,
      popularTours
    }, 'Admin dashboard ma\'lumotlari')
  );
});

// ========== USER MANAGEMENT ==========

/**
 * @desc    Barcha foydalanuvchilarni olish
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;

  // Try to get users from file storage
  let allUsers = await usersStorage.findAll();

  // If no users in file storage, use demo users
  if (!allUsers || allUsers.length === 0) {
    allUsers = demoUsers;
  }

  let filteredUsers = [...allUsers];

  // Filter by role
  if (role) {
    filteredUsers = filteredUsers.filter(u => u.role === role);
  }

  // Filter by active status
  if (isActive !== undefined) {
    const active = isActive === 'true';
    filteredUsers = filteredUsers.filter(u => u.isActive === active);
  }

  // Search by name or email
  if (search) {
    filteredUsers = filteredUsers.filter(
      u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.status(200).json(
    new ApiResponse(200, {
      users: filteredUsers,
      total: filteredUsers.length
    }, 'Foydalanuvchilar ro\'yxati')
  );
});

/**
 * @desc    Foydalanuvchini ID bo'yicha olish
 * @route   GET /api/admin/users/:id
 * @access  Private/Admin
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const User = require('../models/User.model');

  // First try MongoDB
  let user = await User.findById(req.params.id).select('-password');

  // If not found in MongoDB, try file storage
  if (!user) {
    user = await usersStorage.findById(req.params.id);
  }

  // If still not found, try demo users
  if (!user) {
  user = demoUsers.find(u => u.id === req.params.id);
  }

  if (!user) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  res.status(200).json(new ApiResponse(200, { user }, 'Foydalanuvchi ma\'lumotlari'));
});

/**
 * @desc    Foydalanuvchi rolini yangilash
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = asyncHandler(async (req, res, next) => {
  const { role } = req.body;

  // Try to get user from file storage
  let user = await usersStorage.findById(req.params.id);

  // If not in file storage, check demo users
  if (!user) {
    user = demoUsers.find(u => u.id === req.params.id);
  }

  if (!user) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  if (!['user', 'admin', 'agent'].includes(role)) {
    return next(new ApiError(400, 'Noto\'g\'ri rol'));
  }

  // Update role
  user.role = role;

  // Update in file storage if exists there
  const fileUsers = await usersStorage.findAll();
  if (fileUsers.some(u => (u.id || u._id) === req.params.id)) {
    await usersStorage.update(req.params.id, { role: role });
  }

  res.status(200).json(
    new ApiResponse(200, { user }, 'Foydalanuvchi roli yangilandi')
  );
});

/**
 * @desc    Foydalanuvchini bloklash/faollashtirish
 * @route   PUT /api/admin/users/:id/status
 * @access  Private/Admin
 */
exports.toggleUserStatus = asyncHandler(async (req, res, next) => {
  // Try to get user from file storage
  let user = await usersStorage.findById(req.params.id);

  // If not in file storage, check demo users
  if (!user) {
    user = demoUsers.find(u => u.id === req.params.id);
  }

  if (!user) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  // Toggle status
  user.isActive = !user.isActive;

  // Update in file storage if exists there
  const fileUsers = await usersStorage.findAll();
  if (fileUsers.some(u => (u.id || u._id) === req.params.id)) {
    await usersStorage.update(req.params.id, { isActive: user.isActive });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      { user },
      user.isActive ? 'Foydalanuvchi faollashtirildi' : 'Foydalanuvchi bloklandi'
    )
  );
});

/**
 * @desc    Foydalanuvchini o'chirish
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Try to delete from file storage first
  const allUsers = await usersStorage.findAll();
  const user = allUsers.find(u => (u.id || u._id) === req.params.id);

  if (user) {
    // Delete from file storage
    await usersStorage.delete(req.params.id);

    return res.status(200).json(
      new ApiResponse(200, { user }, 'Foydalanuvchi o\'chirildi')
    );
  }

  // If not in file storage, check demo users
  const index = demoUsers.findIndex(u => u.id === req.params.id);

  if (index === -1) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  const deletedUser = demoUsers.splice(index, 1);

  res.status(200).json(
    new ApiResponse(200, { user: deletedUser[0] }, 'Foydalanuvchi o\'chirildi')
  );
});

/**
 * @desc    Foydalanuvchi parolini tiklash/yangilash
 * @route   PUT /api/admin/users/:id/reset-password
 * @access  Private/Admin
 */
exports.resetUserPassword = asyncHandler(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new ApiError(400, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'));
  }

  // Try to get user from file storage
  let user = await usersStorage.findById(req.params.id);

  if (!user) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  // Update password
  user.password = hashedPassword;
  await usersStorage.update(req.params.id, { password: hashedPassword });

  res.status(200).json(
    new ApiResponse(200, null, 'Parol muvaffaqiyatli yangilandi')
  );
});

/**
 * @desc    Foydalanuvchi login tarixini olish
 * @route   GET /api/admin/users/:userId/login-history
 * @access  Private/Admin
 */
exports.getUserLoginHistory = asyncHandler(async (req, res, next) => {
  // Try to get user from file storage
  const userId = req.params.userId || req.params.id;
  let user = await usersStorage.findById(userId);

  if (!user) {
    return next(new ApiError(404, 'Foydalanuvchi topilmadi'));
  }

  const loginHistory = user.loginHistory || [];
  const lastLogin = user.lastLogin || null;

  // Calculate account age (days since registration)
  const accountAge = user.createdAt
    ? Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
    : 0;

  // Calculate days since last login
  const daysSinceLastLogin = lastLogin
    ? Math.floor((new Date() - new Date(lastLogin)) / (1000 * 60 * 60 * 24))
    : null;

  res.status(200).json(
    new ApiResponse(200, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      },
      lastLogin,
      daysSinceLastLogin,
      accountAge,
      loginHistory,
      totalLogins: loginHistory.length
    }, 'Login tarixi')
  );
});

// ========== TOUR MANAGEMENT ==========

/**
 * @desc    Barcha turlarni olish (Admin)
 * @route   GET /api/admin/tours
 * @access  Private/Admin
 */
exports.getAllTours = asyncHandler(async (req, res) => {
  // Try to get tours from file storage first
  let tours = await toursStorage.findAll();

  // If no tours in file, use demo tours
  if (tours.length === 0) {
    tours = demoTours;
  }

  res.status(200).json(
    new ApiResponse(200, {
      tours: tours,
      total: tours.length
    }, 'Turlar ro\'yxati')
  );
});

/**
 * @desc    Tur statusini yangilash
 * @route   PUT /api/admin/tours/:id/status
 * @access  Private/Admin
 */
exports.toggleTourStatus = asyncHandler(async (req, res) => {
  const tour = demoTours.find(t => t.id === req.params.id);

  if (!tour) {
    return next(new ApiError(404, 'Tur topilmadi'));
  }

  tour.status = tour.status === 'active' ? 'inactive' : 'active';

  res.status(200).json(
    new ApiResponse(200, { tour }, 'Tur statusi yangilandi')
  );
});

// ========== BOOKING MANAGEMENT ==========

/**
 * @desc    Barcha buyurtmalarni olish
 * @route   GET /api/admin/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = asyncHandler(async (req, res) => {
  const { status, tourId, date } = req.query;

  let bookings = await bookingsStorage.findAll();

  // Filter by status
  if (status) {
    bookings = bookings.filter(b => b.status === status);
  }

  // Filter by tour ID
  if (tourId) {
    bookings = bookings.filter(b => b.tourId === tourId);
  }

  // Filter by date
  if (date) {
    const searchDate = new Date(date).toISOString().split('T')[0];
    bookings = bookings.filter(b => {
      const bookingDate = new Date(b.date).toISOString().split('T')[0];
      return bookingDate === searchDate;
    });
  }

  // Sort by created date (newest first)
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Get statistics
  const stats = await bookingsStorage.getStats();

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      total: bookings.length,
      stats
    }, 'Buyurtmalar ro\'yxati')
  );
});

/**
 * @desc    Buyurtma statusini yangilash
 * @route   PUT /api/admin/bookings/:id/status
 * @access  Private/Admin
 */
exports.updateBookingStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!status || !['pending', 'confirmed', 'cancelled'].includes(status)) {
    return next(new ApiError(400, 'Noto\'g\'ri status'));
  }

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  let updatedBooking;

  if (status === 'confirmed') {
    updatedBooking = await bookingsStorage.confirm(id);
    // Send confirmation email
    try {
      await sendBookingConfirmedNotification(updatedBooking);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
    }
  } else if (status === 'cancelled') {
    updatedBooking = await bookingsStorage.cancel(id);
    // Send cancellation email
    try {
      await sendBookingCancelledNotification(updatedBooking);
    } catch (error) {
      console.error('Failed to send cancellation email:', error);
    }
  } else {
    updatedBooking = await bookingsStorage.update(id, { status });
  }

  res.status(200).json(
    new ApiResponse(200, { booking: updatedBooking }, 'Buyurtma statusi yangilandi')
  );
});

/**
 * @desc    Buyurtmani o'chirish
 * @route   DELETE /api/admin/bookings/:id
 * @access  Private/Admin
 */
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  // Delete booking
  await bookingsStorage.delete(id);

  res.status(200).json(
    new ApiResponse(200, { booking }, 'Buyurtma o\'chirildi')
  );
});

/**
 * @desc    Buyurtmaga gid va haydovchi tayinlash
 * @route   PUT /api/admin/bookings/:id/staff
 * @access  Private/Admin
 */
exports.updateBookingStaff = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { guide, driver } = req.body;

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  // Update booking with staff info
  const updatedBooking = await bookingsStorage.update(id, {
    guide: {
      name: guide?.name || '',
      phone: guide?.phone || ''
    },
    driver: {
      name: driver?.name || '',
      phone: driver?.phone || '',
      vehicle: driver?.vehicle || ''
    }
  });

  res.status(200).json(
    new ApiResponse(200, updatedBooking, 'Xodimlar tayinlandi')
  );
});

// ========== STATISTICS ==========

/**
 * @desc    Batafsil statistika
 * @route   GET /api/admin/statistics
 * @access  Private/Admin
 */
exports.getStatistics = asyncHandler(async (req, res) => {
  const userStats = {
    total: demoUsers.length,
    byRole: {
      admin: demoUsers.filter(u => u.role === 'admin').length,
      agent: demoUsers.filter(u => u.role === 'agent').length,
      user: demoUsers.filter(u => u.role === 'user').length
    },
    active: demoUsers.filter(u => u.isActive).length,
    inactive: demoUsers.filter(u => !u.isActive).length
  };

  const tourStats = {
    total: demoTours.length,
    active: demoTours.filter(t => t.status === 'active').length,
    inactive: demoTours.filter(t => t.status === 'inactive').length,
    totalBookings: demoTours.reduce((sum, t) => sum + t.totalBookings, 0)
  };

  const bookingStats = {
    total: demoBookings.length,
    confirmed: demoBookings.filter(b => b.status === 'confirmed').length,
    pending: demoBookings.filter(b => b.status === 'pending').length,
    cancelled: demoBookings.filter(b => b.status === 'cancelled').length
  };

  const revenueStats = {
    total: demoBookings.reduce((sum, b) => sum + b.totalPrice, 0),
    paid: demoBookings
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.totalPrice, 0),
    pending: demoBookings
      .filter(b => b.paymentStatus === 'pending')
      .reduce((sum, b) => sum + b.totalPrice, 0)
  };

  res.status(200).json(
    new ApiResponse(200, {
      users: userStats,
      tours: tourStats,
      bookings: bookingStats,
      revenue: revenueStats
    }, 'Batafsil statistika')
  );
});

// ========== BLOG MANAGEMENT ==========

// Demo Blog Posts
let demoBlogs = [
  {
    _id: '1',
    title: 'Nature, Culture & Thrill: Travel Stories That Inspire',
    title2: 'Experience the Best of Uzbekistan',
    category: 'Travel Stories',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
    featuredImage: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
    excerpt: 'Discover the hidden gems of Uzbekistan through our carefully curated travel experiences.',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    tags: 'uzbekistan, travel, culture',
    status: 'published',
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-02-20')
  },
  {
    _id: '2',
    title: 'Dream. Explore. Discover. Where Will You Go Next?',
    title2: 'Your Next Adventure Awaits',
    category: 'Destinations',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
    featuredImage: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
    excerpt: 'Explore the ancient Silk Road cities and experience the rich cultural heritage.',
    content: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    tags: 'destinations, adventure, history',
    status: 'published',
    createdAt: new Date('2024-02-18'),
    updatedAt: new Date('2024-02-18')
  },
  {
    _id: '3',
    title: 'Top 10 Travel Tips for First-Time Visitors to Uzbekistan',
    title2: 'Make Your Journey Unforgettable',
    category: 'Travel Tips',
    author: 'Admin',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
    featuredImage: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
    excerpt: 'Essential tips and tricks for making your first trip to Uzbekistan unforgettable.',
    content: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    tags: 'tips, guide, uzbekistan',
    status: 'draft',
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-02-15')
  },
  {
    _id: '4',
    title: 'Hidden Gems: Unexplored Destinations in Central Asia',
    title2: 'Beyond the Tourist Trail',
    category: 'Destinations',
    author: 'Admin',
    image: 'assets/img/home3/blog-img2.jpg',
    featuredImage: 'assets/img/home3/blog-img2.jpg',
    excerpt: 'Discover breathtaking locations in Central Asia that most travelers never see.',
    content: 'Central Asia is full of hidden treasures waiting to be explored. From remote mountain villages to ancient fortresses, these destinations offer authentic experiences away from the crowds.',
    tags: 'central asia, hidden gems, adventure',
    status: 'published',
    createdAt: new Date('2024-02-12'),
    updatedAt: new Date('2024-02-12')
  },
  {
    _id: '5',
    title: 'A Foodie\'s Guide to Uzbekistan: Must-Try Dishes',
    title2: 'Taste the Authentic Flavors',
    category: 'Food & Culture',
    author: 'Admin',
    image: 'assets/img/home3/blog-img3.jpg',
    featuredImage: 'assets/img/home3/blog-img3.jpg',
    excerpt: 'Explore the rich culinary traditions of Uzbekistan with our comprehensive food guide.',
    content: 'Uzbek cuisine is a delightful blend of flavors, influenced by centuries of Silk Road trade. From plov to samsa, discover the dishes that define this Central Asian nation.',
    tags: 'food, uzbekistan, cuisine, culture',
    status: 'published',
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10')
  },
  {
    _id: '6',
    title: 'Best Time to Visit the Silk Road Countries',
    title2: 'Plan Your Perfect Journey',
    category: 'Travel Planning',
    author: 'Admin',
    image: 'assets/img/home3/blog-img1.jpg',
    featuredImage: 'assets/img/home3/blog-img1.jpg',
    excerpt: 'Learn about the ideal seasons to explore the historic Silk Road routes.',
    content: 'Timing is everything when planning a Silk Road adventure. Discover the best months to visit each country along this legendary trade route.',
    tags: 'silk road, travel planning, seasons',
    status: 'published',
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-05')
  }
];

// Get all blogs
exports.getAllBlogs = asyncHandler(async (req, res) => {
  res.status(200).json(demoBlogs);
});

// Get blog by ID
exports.getBlogById = asyncHandler(async (req, res) => {
  const blog = demoBlogs.find(b => b._id === req.params.id);

  if (!blog) {
    throw new ApiError(404, 'Blog post not found');
  }

  res.status(200).json(
    new ApiResponse(200, blog, 'Blog post retrieved successfully')
  );
});

// Create new blog
exports.createBlog = asyncHandler(async (req, res) => {
  const { title, category, author, image, featuredImage, excerpt, content, tags, status, location, title2 } = req.body;

  if (!title || !category || !content) {
    throw new ApiError(400, 'Title, category, and content are required');
  }

  // Use either image or featuredImage, prefer featuredImage if both exist
  const blogImage = featuredImage || image;

  const newBlog = {
    _id: String(demoBlogs.length + 1),
    title,
    category,
    author: author || 'Admin',
    image: blogImage,
    featuredImage: blogImage,
    excerpt,
    content,
    tags,
    status: status || 'draft',
    location,
    title2,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  demoBlogs.unshift(newBlog);

  res.status(201).json(
    new ApiResponse(201, newBlog, 'Blog post created successfully')
  );
});

// Update blog
exports.updateBlog = asyncHandler(async (req, res) => {
  const blogIndex = demoBlogs.findIndex(b => b._id === req.params.id);

  if (blogIndex === -1) {
    throw new ApiError(404, 'Blog post not found');
  }

  const { title, category, author, image, featuredImage, excerpt, content, tags, status, location, title2 } = req.body;

  // Use either image or featuredImage, prefer featuredImage if both exist
  const blogImage = featuredImage || image || demoBlogs[blogIndex].image || demoBlogs[blogIndex].featuredImage;

  demoBlogs[blogIndex] = {
    ...demoBlogs[blogIndex],
    title: title || demoBlogs[blogIndex].title,
    category: category || demoBlogs[blogIndex].category,
    author: author || demoBlogs[blogIndex].author,
    image: blogImage,
    featuredImage: blogImage,
    excerpt: excerpt || demoBlogs[blogIndex].excerpt,
    content: content || demoBlogs[blogIndex].content,
    tags: tags || demoBlogs[blogIndex].tags,
    status: status || demoBlogs[blogIndex].status,
    location: location || demoBlogs[blogIndex].location,
    title2: title2 !== undefined ? title2 : demoBlogs[blogIndex].title2,
    updatedAt: new Date()
  };

  res.status(200).json(
    new ApiResponse(200, demoBlogs[blogIndex], 'Blog post updated successfully')
  );
});

// Delete blog
exports.deleteBlog = asyncHandler(async (req, res) => {
  const blogIndex = demoBlogs.findIndex(b => b._id === req.params.id);

  if (blogIndex === -1) {
    throw new ApiError(404, 'Blog post not found');
  }

  demoBlogs.splice(blogIndex, 1);

  res.status(200).json(
    new ApiResponse(200, null, 'Blog post deleted successfully')
  );
});
