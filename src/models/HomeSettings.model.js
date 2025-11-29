const mongoose = require('mongoose');

// Navigation menu item schema
const menuItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    label: { type: String, required: true },
    link: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { _id: false });

// Language schema for multi-language support
const languageSchema = new mongoose.Schema({
    code: { type: String, required: true },
    name: { type: String, required: true },
    flag: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
    enabled: { type: Boolean, default: true }
}, { _id: false });

// Hero slider item schema
const heroSlideSchema = new mongoose.Schema({
    id: { type: String, required: true },
    image: { type: String, default: '' },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    enabled: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { _id: false });

const homeSettingsSchema = new mongoose.Schema({
    // ===== NAVIGATION MENU =====
    menuItems: [menuItemSchema],
    showPhone: { type: Boolean, default: true },
    phoneNumber: { type: String, default: '+998932244333' },

    // ===== LANGUAGES =====
    languages: [languageSchema],
    defaultLanguage: { type: String, default: 'en' },

    // ===== HERO BANNER =====
    heroSlides: [heroSlideSchema],
    heroTitle: { type: String, default: 'Discover the Silk Road' },
    heroSubtitle: { type: String, default: "Explore Uzbekistan's ancient cities & experience World Heritage Sites" },
    heroButtonText: { type: String, default: 'Explore Tours' },
    heroButtonLink: { type: String, default: '/tours' },
    showHeroButton: { type: Boolean, default: true },

    // Hero overlay settings
    heroOverlay: { type: Boolean, default: true },
    heroOverlayColor: { type: String, default: 'rgba(0,0,0,0.3)' }
}, {
    timestamps: true
});

// Default menu items
const defaultMenuItems = [
    { id: 'home', label: 'Home', link: '/', enabled: true, order: 0 },
    { id: 'cultural', label: 'Cultural Tours', link: '/tours/cultural', enabled: true, order: 1 },
    { id: 'adventure', label: 'Adventure Tours', link: '/tours/adventure', enabled: true, order: 2 },
    { id: 'homestays', label: 'Homestays & Hiking', link: '/tours/homestays', enabled: true, order: 3 },
    { id: 'daytrips', label: 'Day Trips', link: '/tours/day-trips', enabled: true, order: 4 },
    { id: 'about', label: 'About', link: '/about', enabled: true, order: 5 },
    { id: 'contact', label: 'Contact Us', link: '/contact', enabled: true, order: 6 }
];

// Default languages
const defaultLanguages = [
    { code: 'en', name: 'EN', flag: '🇬🇧', isDefault: true, enabled: true },
    { code: 'uz', name: 'UZ', flag: '🇺🇿', isDefault: false, enabled: true },
    { code: 'ru', name: 'RU', flag: '🇷🇺', isDefault: false, enabled: true }
];

// Default hero slides
const defaultHeroSlides = [
    { id: 'slide1', image: '/images/hero/hero1.jpg', title: '', subtitle: '', enabled: true, order: 0 },
    { id: 'slide2', image: '/images/hero/hero2.jpg', title: '', subtitle: '', enabled: true, order: 1 },
    { id: 'slide3', image: '/images/hero/hero3.jpg', title: '', subtitle: '', enabled: true, order: 2 }
];

// Ensure only one home settings document exists
homeSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            menuItems: defaultMenuItems,
            languages: defaultLanguages,
            heroSlides: defaultHeroSlides
        });
    }
    // Ensure menuItems exists
    if (!settings.menuItems || settings.menuItems.length === 0) {
        settings.menuItems = defaultMenuItems;
        await settings.save();
    }
    // Ensure languages exists
    if (!settings.languages || settings.languages.length === 0) {
        settings.languages = defaultLanguages;
        await settings.save();
    }
    // Ensure heroSlides exists
    if (!settings.heroSlides || settings.heroSlides.length === 0) {
        settings.heroSlides = defaultHeroSlides;
        await settings.save();
    }
    return settings;
};

const HomeSettings = mongoose.model('HomeSettings', homeSettingsSchema);

module.exports = HomeSettings;
