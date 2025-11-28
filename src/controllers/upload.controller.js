const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @route   POST /api/upload
// @desc    Upload a single image
// @access  Public (later add authentication)
const uploadImage = asyncHandler(async (req, res) => {
    console.log('📤 Upload request received');
    console.log('📤 req.file:', req.file);
    console.log('📤 req.body:', req.body);
    if (!req.file) {
        throw new ApiError(400, 'Please upload an image file');
    }

    // Return the file path (url for frontend compatibility)
    const filePath = `/uploads/${req.file.filename}`;

    res.status(200).json(
        new ApiResponse(200, { filePath, url: filePath }, 'Image uploaded successfully')
    );
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Public (later add authentication)
const uploadMultipleImages = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
        throw new ApiError(400, 'Please upload at least one image file');
    }

    // Return array of file paths
    const filePaths = req.files.map(file => `/uploads/${file.filename}`);

    res.status(200).json(
        new ApiResponse(200, { filePaths }, `${req.files.length} images uploaded successfully`)
    );
});

// @route   POST /api/upload/tour-image
// @desc    Upload tour itinerary day image
// @access  Public (later add authentication)
const uploadTourImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, 'Please upload an image file');
    }

    // Return the file URL (accessible from browser)
    const imageUrl = `/uploads/tours/${req.file.filename}`;

    res.status(200).json(
        new ApiResponse(200, { imageUrl }, 'Tour image uploaded successfully')
    );
});

module.exports = {
    uploadImage,
    uploadMultipleImages,
    uploadTourImage
};
