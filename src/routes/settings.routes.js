const express = require('express');
const router = express.Router();
const {
    getSettings,
    updateSettings,
    getPublicSettings
} = require('../controllers/settings.controller');

// Public routes
router.get('/', getSettings);
router.get('/public', getPublicSettings);

// Admin routes (later add authentication middleware)
router.post('/', updateSettings);

module.exports = router;
