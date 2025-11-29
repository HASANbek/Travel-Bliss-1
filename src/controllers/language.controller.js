const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const HomeSettings = require('../models/HomeSettings.model');

// @route   GET /api/languages
// @desc    Get all languages (admin)
// @access  Private (Admin only)
const getAllLanguages = asyncHandler(async (req, res) => {
    const settings = await HomeSettings.getSettings();
    const languages = settings.languages || [];

    res.status(200).json(new ApiResponse(200, {
        languages,
        defaultLanguage: settings.defaultLanguage
    }, 'Languages retrieved successfully'));
});

// @route   GET /api/languages/public
// @desc    Get enabled languages (public)
// @access  Public
const getPublicLanguages = asyncHandler(async (req, res) => {
    const settings = await HomeSettings.getSettings();
    const enabledLanguages = (settings.languages || []).filter(lang => lang.enabled);
    const defaultLang = enabledLanguages.find(l => l.isDefault) || enabledLanguages[0];

    res.status(200).json(new ApiResponse(200, {
        languages: enabledLanguages,
        defaultLanguage: defaultLang ? defaultLang.code : 'en'
    }, 'Public languages retrieved successfully'));
});

// @route   POST /api/languages
// @desc    Add a new language
// @access  Private (Admin only)
const addLanguage = asyncHandler(async (req, res) => {
    const { code, name, flag, enabled = true, isDefault = false } = req.body;

    // Validation
    if (!code || !name) {
        throw new ApiError(400, 'Language code and name are required');
    }

    // Validate code format (2-3 letters)
    if (!/^[a-z]{2,3}$/i.test(code)) {
        throw new ApiError(400, 'Language code must be 2-3 letters (e.g., "en", "uz", "rus")');
    }

    const settings = await HomeSettings.getSettings();

    // Check if language code already exists
    const existingLang = settings.languages.find(l => l.code.toLowerCase() === code.toLowerCase());
    if (existingLang) {
        throw new ApiError(400, `Language with code "${code}" already exists`);
    }

    // If this is the first language or marked as default, set isDefault
    const shouldBeDefault = isDefault || settings.languages.length === 0;

    // If setting as default, unset other defaults
    if (shouldBeDefault) {
        settings.languages.forEach(lang => {
            lang.isDefault = false;
        });
        settings.defaultLanguage = code.toLowerCase();
    }

    // Create new language object
    const newLanguage = {
        code: code.toLowerCase(),
        name: name.toUpperCase(),
        flag: flag || '',
        isDefault: shouldBeDefault,
        enabled: enabled
    };

    settings.languages.push(newLanguage);
    await settings.save();

    res.status(201).json(new ApiResponse(201, {
        language: newLanguage,
        languages: settings.languages,
        defaultLanguage: settings.defaultLanguage
    }, 'Language added successfully'));
});

// @route   PUT /api/languages/:id
// @desc    Update a language by code
// @access  Private (Admin only)
const updateLanguage = asyncHandler(async (req, res) => {
    const { id } = req.params; // This is the language code
    const { code, name, flag, enabled, isDefault } = req.body;

    const settings = await HomeSettings.getSettings();

    // Find language by code
    const langIndex = settings.languages.findIndex(l => l.code.toLowerCase() === id.toLowerCase());
    if (langIndex === -1) {
        throw new ApiError(404, `Language with code "${id}" not found`);
    }

    const language = settings.languages[langIndex];

    // If changing code, check for duplicates
    if (code && code.toLowerCase() !== id.toLowerCase()) {
        const duplicate = settings.languages.find(l => l.code.toLowerCase() === code.toLowerCase());
        if (duplicate) {
            throw new ApiError(400, `Language with code "${code}" already exists`);
        }
        language.code = code.toLowerCase();
    }

    // Update other fields
    if (name !== undefined) language.name = name.toUpperCase();
    if (flag !== undefined) language.flag = flag;
    if (enabled !== undefined) language.enabled = enabled;

    // Handle default language change
    if (isDefault === true) {
        settings.languages.forEach(lang => {
            lang.isDefault = false;
        });
        language.isDefault = true;
        settings.defaultLanguage = language.code;
    }

    // Prevent disabling the only enabled language
    const enabledCount = settings.languages.filter(l => l.enabled).length;
    if (enabled === false && enabledCount <= 1 && language.enabled) {
        throw new ApiError(400, 'Cannot disable the last enabled language');
    }

    await settings.save();

    res.status(200).json(new ApiResponse(200, {
        language,
        languages: settings.languages,
        defaultLanguage: settings.defaultLanguage
    }, 'Language updated successfully'));
});

// @route   DELETE /api/languages/:id
// @desc    Delete a language by code
// @access  Private (Admin only)
const deleteLanguage = asyncHandler(async (req, res) => {
    const { id } = req.params; // This is the language code

    const settings = await HomeSettings.getSettings();

    // Find language by code
    const langIndex = settings.languages.findIndex(l => l.code.toLowerCase() === id.toLowerCase());
    if (langIndex === -1) {
        throw new ApiError(404, `Language with code "${id}" not found`);
    }

    const language = settings.languages[langIndex];

    // Prevent deletion of default language
    if (language.isDefault) {
        throw new ApiError(400, 'Cannot delete the default language. Please set another language as default first.');
    }

    // Prevent deletion if it\'s the only language
    if (settings.languages.length <= 1) {
        throw new ApiError(400, 'Cannot delete the last language. At least one language must exist.');
    }

    // Remove language
    settings.languages.splice(langIndex, 1);
    await settings.save();

    res.status(200).json(new ApiResponse(200, {
        deletedCode: id,
        languages: settings.languages,
        defaultLanguage: settings.defaultLanguage
    }, 'Language deleted successfully'));
});

// @route   POST /api/languages/set-default/:id
// @desc    Set a language as default
// @access  Private (Admin only)
const setDefaultLanguage = asyncHandler(async (req, res) => {
    const { id } = req.params; // This is the language code

    const settings = await HomeSettings.getSettings();

    // Find language by code
    const language = settings.languages.find(l => l.code.toLowerCase() === id.toLowerCase());
    if (!language) {
        throw new ApiError(404, `Language with code "${id}" not found`);
    }

    // Ensure language is enabled
    if (!language.enabled) {
        throw new ApiError(400, 'Cannot set a disabled language as default. Enable it first.');
    }

    // Unset all other defaults and set this one
    settings.languages.forEach(lang => {
        lang.isDefault = (lang.code.toLowerCase() === id.toLowerCase());
    });
    settings.defaultLanguage = language.code;

    await settings.save();

    res.status(200).json(new ApiResponse(200, {
        defaultLanguage: settings.defaultLanguage,
        languages: settings.languages
    }, `"${language.name}" set as default language`));
});

// @route   POST /api/languages/save-all
// @desc    Save all language settings at once
// @access  Private (Admin only)
const saveAllLanguages = asyncHandler(async (req, res) => {
    const { languages, defaultLanguage } = req.body;

    if (!languages || !Array.isArray(languages)) {
        throw new ApiError(400, 'Languages array is required');
    }

    const settings = await HomeSettings.getSettings();

    // Update languages
    settings.languages = languages.map(lang => ({
        code: (lang.code || '').toLowerCase(),
        name: lang.name || '',
        flag: lang.flag || '',
        isDefault: lang.isDefault || false,
        enabled: lang.enabled !== false
    }));

    // Set default language
    if (defaultLanguage) {
        settings.defaultLanguage = defaultLanguage.toLowerCase();
        // Update isDefault flag
        settings.languages.forEach(lang => {
            lang.isDefault = (lang.code === settings.defaultLanguage);
        });
    }

    await settings.save();

    res.status(200).json(new ApiResponse(200, {
        languages: settings.languages,
        defaultLanguage: settings.defaultLanguage
    }, 'All language settings saved successfully'));
});

module.exports = {
    getAllLanguages,
    getPublicLanguages,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    saveAllLanguages
};
