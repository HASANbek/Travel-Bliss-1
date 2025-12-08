const express = require('express');
const router = express.Router();

// Controllers
const {
  // Public
  getPublicReviews,
  createReview,
  getReviewStats,
  // Admin
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  bulkUpdateStatus,
  addAdminResponse,
  deleteReview,
  createAdminReview,
  exportReviews
} = require('../controllers/review.controller');

// Middleware
const { protect, authorize } = require('../middlewares/auth.middleware');

// ========== PUBLIC ROUTES ==========

// @route   GET /api/reviews
// @desc    Get all approved reviews
// @access  Public
router.get('/', getPublicReviews);

// @route   POST /api/reviews
// @desc    Create a new review
// @access  Public
router.post('/', createReview);

// @route   GET /api/reviews/stats/:serviceId
// @desc    Get review statistics for a service
// @access  Public
router.get('/stats/:serviceId', getReviewStats);

// ========== ADMIN ROUTES ==========

// @route   GET /api/reviews/admin
// @desc    Get all reviews (admin)
// @access  Private/Admin
router.get('/admin', protect, authorize('admin'), getAllReviews);

// @route   GET /api/reviews/admin/export
// @desc    Export reviews
// @access  Private/Admin
router.get('/admin/export', protect, authorize('admin'), exportReviews);

// @route   POST /api/reviews/admin
// @desc    Create review (admin)
// @access  Private/Admin
router.post('/admin', protect, authorize('admin'), createAdminReview);

// @route   PUT /api/reviews/admin/bulk-status
// @desc    Bulk update review statuses
// @access  Private/Admin
router.put('/admin/bulk-status', protect, authorize('admin'), bulkUpdateStatus);

// @route   GET /api/reviews/admin/:id
// @desc    Get single review
// @access  Private/Admin
router.get('/admin/:id', protect, authorize('admin'), getReviewById);

// @route   PUT /api/reviews/admin/:id/status
// @desc    Update review status
// @access  Private/Admin
router.put('/admin/:id/status', protect, authorize('admin'), updateReviewStatus);

// @route   PUT /api/reviews/admin/:id/response
// @desc    Add admin response
// @access  Private/Admin
router.put('/admin/:id/response', protect, authorize('admin'), addAdminResponse);

// @route   DELETE /api/reviews/admin/:id
// @desc    Delete review
// @access  Private/Admin
router.delete('/admin/:id', protect, authorize('admin'), deleteReview);

module.exports = router;
