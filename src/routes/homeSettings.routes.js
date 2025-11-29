const express = require('express');
const router = express.Router();
const {
    getHomeSettings,
    updateHomeSettings,
    getPublicHomeSettings
} = require('../controllers/homeSettings.controller');

// Public routes
router.get('/', getHomeSettings);
router.get('/public', getPublicHomeSettings);

// Admin routes (later add authentication middleware)
router.post('/', updateHomeSettings);

module.exports = router;
