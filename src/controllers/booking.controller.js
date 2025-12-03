const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const bookingsStorage = require('../storage/bookings.storage');
const toursStorage = require('../storage/tours.storage');
const {
  sendBookingConfirmationEmail,
  sendAdminBookingNotification,
  sendBookingConfirmedNotification,
  sendBookingCancelledNotification
} = require('../utils/sendEmail');

/**
 * @desc    Check availability for a tour on a specific date
 * @route   POST /api/bookings/check-availability
 * @access  Public
 */
exports.checkAvailability = asyncHandler(async (req, res, next) => {
  const { tourId, date, guests } = req.body;

  if (!tourId || !date) {
    return next(new ApiError(400, 'Tur ID va sanani kiriting'));
  }

  // Find tour to get max capacity
  const tour = await toursStorage.findById(tourId);

  if (!tour) {
    return next(new ApiError(404, 'Tur topilmadi'));
  }

  // Use maxGroupSize or default to 50 if not specified
  const maxCapacity = tour.maxCapacity || tour.maxGroupSize || 50;
  const availability = await bookingsStorage.checkAvailability(tourId, date, maxCapacity);

  // Check if requested guests can be accommodated
  const requestedGuests = (guests?.adults || 0) + (guests?.children || 0);
  const canBook = availability.availableSpots >= requestedGuests;

  res.status(200).json(
    new ApiResponse(200, {
      ...availability,
      canBook,
      requestedGuests
    }, canBook ? 'Tur mavjud' : 'Tur to\'ldi')
  );
});

/**
 * @desc    Create new booking
 * @route   POST /api/bookings
 * @access  Public (for now) / Private (later with auth)
 */
exports.createBooking = asyncHandler(async (req, res, next) => {
  const {
    tourId,
    tourName,
    customerName,
    customerEmail,
    customerPhone,
    pickupLocation,
    date,
    guests,
    totalPrice,
    specialRequests,
    userId
  } = req.body;

  // Validation - tourId is optional now (for website booking forms)
  if (!tourName || !customerName || !customerEmail || !customerPhone || !date || !guests) {
    return next(new ApiError(400, 'Barcha maydonlarni to\'ldiring'));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    return next(new ApiError(400, 'Email formati noto\'g\'ri'));
  }

  // Validate phone format (Uzbekistan format)
  const phoneRegex = /^\+998[0-9]{9}$/;
  if (!phoneRegex.test(customerPhone)) {
    return next(new ApiError(400, 'Telefon formati noto\'g\'ri. Format: +998XXXXXXXXX'));
  }

  // Validate date (must be in the future)
  const bookingDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    return next(new ApiError(400, 'Sana o\'tmishda bo\'lishi mumkin emas'));
  }

  // Validate guests
  if (!guests.adults || guests.adults < 1) {
    return next(new ApiError(400, 'Kamida 1 kattalar bo\'lishi kerak'));
  }

  if (guests.children && guests.children < 0) {
    return next(new ApiError(400, 'Bolalar soni manfiy bo\'lishi mumkin emas'));
  }

  // Check availability only if tourId is provided
  let tour = null;
  if (tourId) {
    tour = await toursStorage.findById(tourId);

    if (tour) {
      // Use maxGroupSize or default to 50 if not specified
      const maxCapacity = tour.maxCapacity || tour.maxGroupSize || 50;
      const availability = await bookingsStorage.checkAvailability(tourId, date, maxCapacity);
      const requestedGuests = (guests.adults || 0) + (guests.children || 0);

      if (availability.availableSpots < requestedGuests) {
        return next(
          new ApiError(400, `Bu sana uchun faqat ${availability.availableSpots} ta joy mavjud`)
        );
      }
    }
  }

  // Create booking
  const bookingData = {
    tourId,
    tourName,
    customerName,
    customerEmail,
    customerPhone,
    pickupLocation: pickupLocation || '',
    date: bookingDate.toISOString(),
    guests: {
      adults: guests.adults,
      children: guests.children || 0
    },
    totalPrice,
    specialRequests: specialRequests || '',
    userId: userId || null
  };

  const booking = await bookingsStorage.create(bookingData);

  console.log('📧 Booking created, sending emails...');
  console.log('📧 Customer email:', booking.customerEmail);

  // Send confirmation email to customer
  try {
    console.log('📧 Sending email to customer:', booking.customerEmail);
    const customerResult = await sendBookingConfirmationEmail(booking);
    console.log('📧 Customer email result:', customerResult);
  } catch (error) {
    console.error('❌ Failed to send customer confirmation email:', error);
  }

  // Send notification to admin
  try {
    console.log('📧 Sending email to admin...');
    const adminResult = await sendAdminBookingNotification(booking);
    console.log('📧 Admin email result:', adminResult);
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
  }

  res.status(201).json(
    new ApiResponse(201, booking, 'Buyurtma muvaffaqiyatli yaratildi')
  );
});

/**
 * @desc    Get all bookings (Admin only)
 * @route   GET /api/bookings
 * @access  Private/Admin
 */
exports.getAllBookings = asyncHandler(async (req, res, next) => {
  const { status, tourId, date, limit, offset } = req.query;

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

  // Pagination
  const total = bookings.length;
  const limitNum = parseInt(limit) || 50;
  const offsetNum = parseInt(offset) || 0;

  bookings = bookings.slice(offsetNum, offsetNum + limitNum);

  // Get statistics
  const stats = await bookingsStorage.getStats();

  res.status(200).json(
    new ApiResponse(200, {
      bookings,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: offsetNum + limitNum < total
      },
      stats
    }, 'Buyurtmalar ro\'yxati')
  );
});

/**
 * @desc    Get single booking by ID
 * @route   GET /api/bookings/:id
 * @access  Private/Admin or Owner
 */
exports.getBookingById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  // TODO: Check if user is admin or booking owner
  // For now, allow all authenticated users

  res.status(200).json(
    new ApiResponse(200, booking, 'Buyurtma topildi')
  );
});

/**
 * @desc    Get user's own bookings
 * @route   GET /api/bookings/my-bookings
 * @access  Private
 */
exports.getMyBookings = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;

  const bookings = await bookingsStorage.findByUserId(userId);

  // Sort by created date (newest first)
  bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.status(200).json(
    new ApiResponse(200, { bookings, total: bookings.length }, 'Sizning buyurtmalaringiz')
  );
});

/**
 * @desc    Confirm booking (Admin only)
 * @route   PUT /api/bookings/:id/confirm
 * @access  Private/Admin
 */
exports.confirmBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  if (booking.status === 'confirmed') {
    return next(new ApiError(400, 'Buyurtma allaqachon tasdiqlangan'));
  }

  if (booking.status === 'cancelled') {
    return next(new ApiError(400, 'Bekor qilingan buyurtmani tasdiqlab bo\'lmaydi'));
  }

  // Confirm booking
  const updatedBooking = await bookingsStorage.confirm(id);

  // Send confirmation email to customer
  try {
    await sendBookingConfirmedNotification(updatedBooking);
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
  }

  res.status(200).json(
    new ApiResponse(200, updatedBooking, 'Buyurtma tasdiqlandi')
  );
});

/**
 * @desc    Cancel booking (Admin only)
 * @route   PUT /api/bookings/:id/cancel
 * @access  Private/Admin
 */
exports.cancelBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const booking = await bookingsStorage.findById(id);

  if (!booking) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  if (booking.status === 'cancelled') {
    return next(new ApiError(400, 'Buyurtma allaqachon bekor qilingan'));
  }

  // Cancel booking
  const updatedBooking = await bookingsStorage.cancel(id);

  // Send cancellation email to customer
  try {
    await sendBookingCancelledNotification(updatedBooking);
  } catch (error) {
    console.error('Failed to send cancellation email:', error);
  }

  res.status(200).json(
    new ApiResponse(200, updatedBooking, 'Buyurtma bekor qilindi')
  );
});

/**
 * @desc    Delete booking (Admin only)
 * @route   DELETE /api/bookings/:id
 * @access  Private/Admin
 */
exports.deleteBooking = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deleted = await bookingsStorage.delete(id);

  if (!deleted) {
    return next(new ApiError(404, 'Buyurtma topilmadi'));
  }

  res.status(200).json(
    new ApiResponse(200, null, 'Buyurtma o\'chirildi')
  );
});

/**
 * @desc    Get booking statistics (Admin only)
 * @route   GET /api/bookings/stats
 * @access  Private/Admin
 */
exports.getBookingStats = asyncHandler(async (req, res, next) => {
  const stats = await bookingsStorage.getStats();

  res.status(200).json(
    new ApiResponse(200, stats, 'Buyurtmalar statistikasi')
  );
});
