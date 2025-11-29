const express = require('express');
const router = express.Router();
const {
    getAllLanguages,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    setDefaultLanguage,
    getPublicLanguages,
    saveAllLanguages
} = require('../controllers/language.controller');
const { protect, isAdmin } = require('../middlewares/auth.middleware');

// Public routes
router.get('/public', getPublicLanguages);

// Admin routes (requires authentication)
router.get('/', protect, isAdmin, getAllLanguages);
router.post('/', protect, isAdmin, addLanguage);
router.post('/save-all', protect, isAdmin, saveAllLanguages);
router.put('/:id', protect, isAdmin, updateLanguage);
router.delete('/:id', protect, isAdmin, deleteLanguage);
router.post('/set-default/:id', protect, isAdmin, setDefaultLanguage);

module.exports = router;
