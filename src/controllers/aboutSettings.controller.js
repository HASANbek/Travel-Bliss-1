const AboutSettings = require('../models/AboutSettings.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Get about settings (public)
exports.getAboutSettings = asyncHandler(async (req, res) => {
    const settings = await AboutSettings.getSettings();
    res.json(new ApiResponse(200, { settings }, 'About settings retrieved successfully'));
});

// Update about settings (admin only)
exports.updateAboutSettings = asyncHandler(async (req, res) => {
    let settings = await AboutSettings.findOne();

    if (!settings) {
        settings = await AboutSettings.getSettings();
    }

    // Update fields
    const updateFields = [
        'heroTitle', 'heroSubtitle', 'heroImage',
        'storyEyebrow', 'storyTitle', 'storyContent', 'storyImageMain', 'storyImageSecondary',
        'whyChooseTitle', 'whyChooseEyebrow', 'features',
        'stats',
        'teamTitle', 'teamEyebrow', 'teamMembers',
        'reviewsTitle', 'reviewsEyebrow', 'tripadvisorRating', 'googleRating', 'featuredReviews'
    ];

    updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
            settings[field] = req.body[field];
        }
    });

    await settings.save();

    res.json(new ApiResponse(200, { settings }, 'About settings updated successfully'));
});

// Add team member
exports.addTeamMember = asyncHandler(async (req, res) => {
    const settings = await AboutSettings.getSettings();

    const { name, role, description, photo } = req.body;

    if (!name || !role) {
        throw new ApiError(400, 'Name and role are required');
    }

    const maxOrder = settings.teamMembers.length > 0
        ? Math.max(...settings.teamMembers.map(m => m.order))
        : 0;

    settings.teamMembers.push({
        name,
        role,
        description: description || '',
        photo: photo || '',
        order: maxOrder + 1,
        isActive: true
    });

    await settings.save();

    res.json(new ApiResponse(201, { teamMembers: settings.teamMembers }, 'Team member added successfully'));
});

// Update team member
exports.updateTeamMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    const settings = await AboutSettings.getSettings();

    const memberIndex = settings.teamMembers.findIndex(m => m._id.toString() === memberId);

    if (memberIndex === -1) {
        throw new ApiError(404, 'Team member not found');
    }

    const { name, role, description, photo, order, isActive } = req.body;

    if (name) settings.teamMembers[memberIndex].name = name;
    if (role) settings.teamMembers[memberIndex].role = role;
    if (description !== undefined) settings.teamMembers[memberIndex].description = description;
    if (photo !== undefined) settings.teamMembers[memberIndex].photo = photo;
    if (order !== undefined) settings.teamMembers[memberIndex].order = order;
    if (isActive !== undefined) settings.teamMembers[memberIndex].isActive = isActive;

    await settings.save();

    res.json(new ApiResponse(200, { teamMembers: settings.teamMembers }, 'Team member updated successfully'));
});

// Delete team member
exports.deleteTeamMember = asyncHandler(async (req, res) => {
    const { memberId } = req.params;
    const settings = await AboutSettings.getSettings();

    settings.teamMembers = settings.teamMembers.filter(m => m._id.toString() !== memberId);
    await settings.save();

    res.json(new ApiResponse(200, { teamMembers: settings.teamMembers }, 'Team member deleted successfully'));
});

// Add stat
exports.addStat = asyncHandler(async (req, res) => {
    const settings = await AboutSettings.getSettings();

    const { number, label, description } = req.body;

    if (!number || !label) {
        throw new ApiError(400, 'Number and label are required');
    }

    const maxOrder = settings.stats.length > 0
        ? Math.max(...settings.stats.map(s => s.order))
        : 0;

    settings.stats.push({
        number,
        label,
        description: description || '',
        order: maxOrder + 1
    });

    await settings.save();

    res.json(new ApiResponse(201, { stats: settings.stats }, 'Stat added successfully'));
});

// Update stat
exports.updateStat = asyncHandler(async (req, res) => {
    const { statId } = req.params;
    const settings = await AboutSettings.getSettings();

    const statIndex = settings.stats.findIndex(s => s._id.toString() === statId);

    if (statIndex === -1) {
        throw new ApiError(404, 'Stat not found');
    }

    const { number, label, description, order } = req.body;

    if (number) settings.stats[statIndex].number = number;
    if (label) settings.stats[statIndex].label = label;
    if (description !== undefined) settings.stats[statIndex].description = description;
    if (order !== undefined) settings.stats[statIndex].order = order;

    await settings.save();

    res.json(new ApiResponse(200, { stats: settings.stats }, 'Stat updated successfully'));
});

// Delete stat
exports.deleteStat = asyncHandler(async (req, res) => {
    const { statId } = req.params;
    const settings = await AboutSettings.getSettings();

    settings.stats = settings.stats.filter(s => s._id.toString() !== statId);
    await settings.save();

    res.json(new ApiResponse(200, { stats: settings.stats }, 'Stat deleted successfully'));
});

// Add feature
exports.addFeature = asyncHandler(async (req, res) => {
    const settings = await AboutSettings.getSettings();

    const { title, description, icon } = req.body;

    if (!title) {
        throw new ApiError(400, 'Title is required');
    }

    const maxOrder = settings.features.length > 0
        ? Math.max(...settings.features.map(f => f.order))
        : 0;

    settings.features.push({
        title,
        description: description || '',
        icon: icon || 'star',
        order: maxOrder + 1
    });

    await settings.save();

    res.json(new ApiResponse(201, { features: settings.features }, 'Feature added successfully'));
});

// Update feature
exports.updateFeature = asyncHandler(async (req, res) => {
    const { featureId } = req.params;
    const settings = await AboutSettings.getSettings();

    const featureIndex = settings.features.findIndex(f => f._id.toString() === featureId);

    if (featureIndex === -1) {
        throw new ApiError(404, 'Feature not found');
    }

    const { title, description, icon, order } = req.body;

    if (title) settings.features[featureIndex].title = title;
    if (description !== undefined) settings.features[featureIndex].description = description;
    if (icon) settings.features[featureIndex].icon = icon;
    if (order !== undefined) settings.features[featureIndex].order = order;

    await settings.save();

    res.json(new ApiResponse(200, { features: settings.features }, 'Feature updated successfully'));
});

// Delete feature
exports.deleteFeature = asyncHandler(async (req, res) => {
    const { featureId } = req.params;
    const settings = await AboutSettings.getSettings();

    settings.features = settings.features.filter(f => f._id.toString() !== featureId);
    await settings.save();

    res.json(new ApiResponse(200, { features: settings.features }, 'Feature deleted successfully'));
});

// Add review
exports.addReview = asyncHandler(async (req, res) => {
    const settings = await AboutSettings.getSettings();

    const { content, authorName, authorPhoto, authorLocation, tourName, date, rating } = req.body;

    if (!content || !authorName) {
        throw new ApiError(400, 'Content and author name are required');
    }

    settings.featuredReviews.push({
        content,
        authorName,
        authorPhoto: authorPhoto || '',
        authorLocation: authorLocation || '',
        tourName: tourName || '',
        date: date || '',
        rating: rating || 5,
        isActive: true
    });

    await settings.save();

    res.json(new ApiResponse(201, { reviews: settings.featuredReviews }, 'Review added successfully'));
});

// Delete review
exports.deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const settings = await AboutSettings.getSettings();

    settings.featuredReviews = settings.featuredReviews.filter(r => r._id.toString() !== reviewId);
    await settings.save();

    res.json(new ApiResponse(200, { reviews: settings.featuredReviews }, 'Review deleted successfully'));
});
