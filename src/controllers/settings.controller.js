const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Settings = require('../models/Settings.model');

// @route   GET /api/settings
// @desc    Get all settings
// @access  Public
const getSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.getSettings();
    res.status(200).json(new ApiResponse(200, settings, 'Settings retrieved successfully'));
});

// @route   POST /api/settings
// @desc    Update settings
// @access  Private (Admin only)
const updateSettings = asyncHandler(async (req, res) => {
    let settings = await Settings.findOne();

    if (!settings) {
        settings = new Settings(req.body);
    } else {
        // Update only the fields that are provided
        Object.keys(req.body).forEach(key => {
            if (req.body[key] !== undefined) {
                settings[key] = req.body[key];
            }
        });
    }

    await settings.save();

    res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
});

// @route   GET /api/settings/public
// @desc    Get public settings (for frontend)
// @access  Public
const getPublicSettings = asyncHandler(async (req, res) => {
    const settings = await Settings.getSettings();

    // Return only public fields
    const publicSettings = {
        siteName: settings.siteName,
        siteTagline: settings.siteTagline,
        siteUrl: settings.siteUrl,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        defaultLanguage: settings.defaultLanguage,
        maintenanceMode: settings.maintenanceMode,
        maintenanceMessage: settings.maintenanceMessage,
        contactPhone: settings.contactPhone,
        whatsappNumber: settings.whatsappNumber,
        contactEmail: settings.contactEmail,
        contactAddress: settings.contactAddress,
        facebookUrl: settings.facebookUrl,
        instagramUrl: settings.instagramUrl,
        telegramUrl: settings.telegramUrl,
        youtubeUrl: settings.youtubeUrl,
        twitterUrl: settings.twitterUrl,
        linkedinUrl: settings.linkedinUrl,
        cookieConsent: settings.cookieConsent,
        cookieMessage: settings.cookieMessage,
        privacyPolicyUrl: settings.privacyPolicyUrl,
        termsUrl: settings.termsUrl,
        metaDescription: settings.metaDescription,
        googleAnalyticsId: settings.googleAnalyticsId,
        googleTagManagerId: settings.googleTagManagerId
    };

    res.status(200).json(new ApiResponse(200, publicSettings, 'Public settings retrieved successfully'));
});

module.exports = {
    getSettings,
    updateSettings,
    getPublicSettings
};
