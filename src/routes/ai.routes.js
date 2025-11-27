const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

// Tour content assistant
router.post('/tour-assistant', aiController.tourAssistant);

// Quick suggestions
router.post('/quick-suggestions', aiController.quickSuggestions);

// Generate SEO for tour
router.post('/generate-seo', aiController.generateSEO);

// Generate Seasons for destination
router.post('/generate-seasons', aiController.generateSeasons);

// Generate FAQs for destination
router.post('/generate-faqs', aiController.generateFaqs);

module.exports = router;
