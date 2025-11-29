const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const HomeSettings = require('../models/HomeSettings.model');

// @route   GET /api/home-settings
// @desc    Get home page settings (for admin)
// @access  Private (Admin only)
const getHomeSettings = asyncHandler(async (req, res) => {
    const settings = await HomeSettings.getSettings();
    res.status(200).json(new ApiResponse(200, settings, 'Home settings retrieved successfully'));
});

// @route   POST /api/home-settings
// @desc    Update home page settings
// @access  Private (Admin only)
const updateHomeSettings = asyncHandler(async (req, res) => {
    let settings = await HomeSettings.findOne();

    if (!settings) {
        settings = new HomeSettings(req.body);
    } else {
        // Update only the fields that are provided
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                settings[key] = req.body[key];
            }
        });
    }

    await settings.save();

    res.status(200).json(new ApiResponse(200, settings, 'Home settings updated successfully'));
});

// @route   GET /api/home-settings/public
// @desc    Get public home settings (for frontend)
// @access  Public
const getPublicHomeSettings = asyncHandler(async (req, res) => {
    const settings = await HomeSettings.getSettings();

    // Filter only enabled languages
    const enabledLanguages = (settings.languages || [])
        .filter(lang => lang.enabled);

    // Filter only enabled hero slides and sort by order
    const enabledHeroSlides = (settings.heroSlides || [])
        .filter(slide => slide.enabled)
        .sort((a, b) => a.order - b.order);

    const publicSettings = {
        // Phone Settings (menu is now static in HTML)
        showPhone: settings.showPhone,
        phoneNumber: settings.phoneNumber,

        // Languages
        languages: enabledLanguages,
        defaultLanguage: settings.defaultLanguage,

        // Hero Banner
        heroSlides: enabledHeroSlides,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        heroButtonText: settings.heroButtonText,
        heroButtonLink: settings.heroButtonLink,
        showHeroButton: settings.showHeroButton,
        heroOverlay: settings.heroOverlay,
        heroOverlayColor: settings.heroOverlayColor
    };

    res.status(200).json(new ApiResponse(200, publicSettings, 'Public home settings retrieved successfully'));
});

module.exports = {
    getHomeSettings,
    updateHomeSettings,
    getPublicHomeSettings
};
