const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    // Site Information
    siteName: {
        type: String,
        default: 'Travel Bliss'
    },
    siteTagline: {
        type: String,
        default: ''
    },
    siteUrl: {
        type: String,
        default: ''
    },
    adminEmail: {
        type: String,
        default: ''
    },

    // Language & Regional
    defaultLanguage: {
        type: String,
        default: 'uz'
    },
    timezone: {
        type: String,
        default: 'Asia/Tashkent'
    },
    dateFormat: {
        type: String,
        default: 'DD.MM.YYYY'
    },
    timeFormat: {
        type: String,
        default: '24'
    },

    // Appearance
    logoUrl: {
        type: String,
        default: ''
    },
    faviconUrl: {
        type: String,
        default: ''
    },

    // User Settings
    allowRegistration: {
        type: Boolean,
        default: true
    },
    defaultUserRole: {
        type: String,
        default: 'user'
    },

    // SEO & Analytics
    metaDescription: {
        type: String,
        default: ''
    },
    googleAnalyticsId: {
        type: String,
        default: ''
    },
    googleTagManagerId: {
        type: String,
        default: ''
    },

    // Privacy & Cookie
    cookieConsent: {
        type: Boolean,
        default: true
    },
    cookieMessage: {
        type: String,
        default: ''
    },
    privacyPolicyUrl: {
        type: String,
        default: ''
    },
    termsUrl: {
        type: String,
        default: ''
    },

    // Site Status
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    maintenanceMessage: {
        type: String,
        default: ''
    },

    // Contact Information
    contactPhone: {
        type: String,
        default: ''
    },
    whatsappNumber: {
        type: String,
        default: ''
    },
    contactEmail: {
        type: String,
        default: ''
    },
    supportEmail: {
        type: String,
        default: ''
    },
    contactAddress: {
        type: String,
        default: ''
    },

    // Social Media
    facebookUrl: {
        type: String,
        default: ''
    },
    instagramUrl: {
        type: String,
        default: ''
    },
    telegramUrl: {
        type: String,
        default: ''
    },
    youtubeUrl: {
        type: String,
        default: ''
    },
    twitterUrl: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
