const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    photo: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const statItemSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    }
});

const featureCardSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: 'star'
    },
    order: {
        type: Number,
        default: 0
    }
});

const reviewSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    authorPhoto: {
        type: String,
        default: ''
    },
    authorLocation: {
        type: String,
        default: ''
    },
    tourName: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        default: 5,
        min: 1,
        max: 5
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const aboutSettingsSchema = new mongoose.Schema({
    // Hero Section
    heroTitle: {
        type: String,
        default: 'About Travel Bliss'
    },
    heroSubtitle: {
        type: String,
        default: "Your Gateway to Uzbekistan's Silk Road Adventures"
    },
    heroImage: {
        type: String,
        default: '/uploads/registon-1764689562739-647287587.jpg'
    },

    // Our Story Section
    storyEyebrow: {
        type: String,
        default: 'Our Story'
    },
    storyTitle: {
        type: String,
        default: 'From Samarkand to the World'
    },
    storyContent: {
        type: String,
        default: ''
    },
    storyImageMain: {
        type: String,
        default: '/uploads/registon-1764689562739-647287587.jpg'
    },
    storyImageSecondary: {
        type: String,
        default: '/uploads/tours/bukhara-1733905530946.jpg'
    },

    // Why Choose Us Section
    whyChooseTitle: {
        type: String,
        default: 'What Makes Travel Bliss Different'
    },
    whyChooseEyebrow: {
        type: String,
        default: 'Why Travelers Choose Us'
    },
    features: [featureCardSchema],

    // Stats Section
    stats: [statItemSchema],

    // Team Section
    teamTitle: {
        type: String,
        default: 'The People Behind Your Journey'
    },
    teamEyebrow: {
        type: String,
        default: 'Meet The Team'
    },
    teamMembers: [teamMemberSchema],

    // Reviews Section
    reviewsTitle: {
        type: String,
        default: 'What Our Guests Say'
    },
    reviewsEyebrow: {
        type: String,
        default: 'Trusted by Travelers'
    },
    tripadvisorRating: {
        type: String,
        default: '4.9/5 (500+ reviews)'
    },
    googleRating: {
        type: String,
        default: '5.0/5 on Google'
    },
    featuredReviews: [reviewSchema],

    // Meta
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Ensure only one document exists (singleton pattern)
aboutSettingsSchema.statics.getSettings = async function() {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({
            storyContent: `Born and raised in Samarkand, we founded Travel Bliss with a dream of sharing our homeland's hidden treasures with the world. What started as a small family venture has grown into a trusted travel company, but we've never lost our personal touch.

Every tour we create draws from generations of local knowledge, family connections, and a genuine love for Uzbekistan's rich heritage. We don't just show you the Silk Road—we help you experience it through the eyes of those who call it home.

From the ancient madrasas of Bukhara to the bustling bazaars of Tashkent, from the desert fortresses of Khiva to the mountain villages of Chimgan—we bring you face-to-face with the living history that makes Central Asia truly magical.`,
            features: [
                { title: 'Local Family Hospitality', description: 'Experience genuine Uzbek warmth with our family-run service and personal attention to every detail', icon: 'home', order: 1 },
                { title: 'Artisan Partnerships', description: 'Direct connections with local craftsmen, musicians, and chefs for authentic cultural encounters', icon: 'smile', order: 2 },
                { title: 'Transparent Pricing', description: 'No hidden fees or surprises. Clear, honest pricing with full breakdown of all costs included', icon: 'dollar', order: 3 },
                { title: 'Expert Local Planning', description: 'Born and raised in Samarkand, we know every hidden gem and secret spot worth visiting', icon: 'star', order: 4 }
            ],
            stats: [
                { number: '5000+', label: 'Tours Organized', description: 'Successful journeys through the Silk Road', order: 1 },
                { number: '10+', label: 'Years Experience', description: 'Dedicated to excellence since 2014', order: 2 },
                { number: '50+', label: 'Partner Network', description: 'Hotels, guides, and local artisans', order: 3 }
            ],
            teamMembers: [
                { name: 'Hasanbek Mamatkulov', role: 'Founder & CEO', description: "Born in Samarkand, passionate about sharing Uzbekistan's culture with the world", photo: '', order: 1 },
                { name: 'Dilshod Rahimov', role: 'Operations Manager', description: 'Ensures every tour runs smoothly from start to finish', photo: '', order: 2 },
                { name: 'Madina Sultanova', role: 'Customer Experience', description: 'Dedicated to making your journey unforgettable', photo: '', order: 3 }
            ],
            featuredReviews: [
                {
                    content: 'Travel Bliss made our Silk Road dream come true! The attention to detail, local insights, and genuine hospitality exceeded all expectations. Our guide knew every hidden corner of Samarkand and Bukhara. Truly unforgettable experience!',
                    authorName: 'Sarah Mitchell',
                    authorLocation: 'USA',
                    tourName: 'Silk Road Explorer Tour',
                    date: 'October 2024',
                    rating: 5
                }
            ]
        });
    }
    return settings;
};

module.exports = mongoose.model('AboutSettings', aboutSettingsSchema);
