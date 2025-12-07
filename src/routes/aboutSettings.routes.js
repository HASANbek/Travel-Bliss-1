const express = require('express');
const router = express.Router();
const aboutSettingsController = require('../controllers/aboutSettings.controller');

// Public route - get about settings
router.get('/', aboutSettingsController.getAboutSettings);

// Admin routes - update settings
router.put('/', aboutSettingsController.updateAboutSettings);

// Team members
router.post('/team', aboutSettingsController.addTeamMember);
router.put('/team/:memberId', aboutSettingsController.updateTeamMember);
router.delete('/team/:memberId', aboutSettingsController.deleteTeamMember);

// Stats
router.post('/stats', aboutSettingsController.addStat);
router.put('/stats/:statId', aboutSettingsController.updateStat);
router.delete('/stats/:statId', aboutSettingsController.deleteStat);

// Features
router.post('/features', aboutSettingsController.addFeature);
router.put('/features/:featureId', aboutSettingsController.updateFeature);
router.delete('/features/:featureId', aboutSettingsController.deleteFeature);

// Reviews
router.post('/reviews', aboutSettingsController.addReview);
router.delete('/reviews/:reviewId', aboutSettingsController.deleteReview);

module.exports = router;
