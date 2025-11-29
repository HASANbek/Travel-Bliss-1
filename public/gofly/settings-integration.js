/**
 * Settings Integration for Travel Bliss Frontend
 * Bu fayl admin paneldagi sozlamalarni asosiy saytga yuklaydi
 */

const SETTINGS_API_URL = 'http://localhost:5000/api/settings/public';
const HOME_SETTINGS_API_URL = 'http://localhost:5000/api/home-settings/public';

// Global settings cache
let siteSettings = null;
let homeSettings = null;

/**
 * Load settings from API
 */
async function loadSiteSettings() {
    try {
        const response = await fetch(SETTINGS_API_URL);
        const data = await response.json();

        if (data.success && data.data) {
            siteSettings = data.data;
            applySettings(siteSettings);
            return siteSettings;
        }
    } catch (error) {
        console.error('Settings yuklashda xatolik:', error);
    }
    return null;
}

/**
 * Apply settings to the page
 */
function applySettings(settings) {
    if (!settings) return;

    // Check maintenance mode first
    if (settings.maintenanceMode) {
        showMaintenancePage(settings.maintenanceMessage);
        return;
    }

    // Apply site title
    if (settings.siteName) {
        document.title = settings.siteName + ' - ' + (settings.siteTagline || 'Uzbekistan Tours');
    }

    // Apply favicon
    if (settings.faviconUrl) {
        updateFavicon(settings.faviconUrl);
    }

    // Apply logo (header)
    if (settings.logoUrl) {
        updateLogo(settings.logoUrl, settings.siteName);
    }

    // Apply contact information
    applyContactInfo(settings);

    // Apply social media links
    applySocialMedia(settings);

    // Apply meta description
    if (settings.metaDescription) {
        updateMetaDescription(settings.metaDescription);
    }

    // Apply Google Analytics
    if (settings.googleAnalyticsId) {
        loadGoogleAnalytics(settings.googleAnalyticsId);
    }

    // Apply Google Tag Manager
    if (settings.googleTagManagerId) {
        loadGoogleTagManager(settings.googleTagManagerId);
    }
}

/**
 * Update favicon
 */
function updateFavicon(url) {
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);
}

/**
 * Update logo in header and footer
 */
function updateLogo(url, siteName) {
    // Header logo
    const headerLogos = document.querySelectorAll('.header-logo img, .logo img');
    headerLogos.forEach(logo => {
        logo.src = url;
        logo.alt = siteName || 'Travel Bliss';
    });

    // Footer logo
    const footerLogos = document.querySelectorAll('.footer-logo img');
    footerLogos.forEach(logo => {
        logo.src = url;
        logo.alt = siteName || 'Travel Bliss';
    });
}

/**
 * Apply contact information to header and footer
 */
function applyContactInfo(settings) {
    // Phone numbers
    if (settings.contactPhone) {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"], .phone-number, .contact-phone');
        phoneLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.href = 'tel:' + settings.contactPhone.replace(/\s/g, '');
                link.textContent = settings.contactPhone;
            } else {
                link.textContent = settings.contactPhone;
            }
        });

        // Header phone
        const headerPhone = document.querySelector('.header-right .phone a, .top-info-left a[href^="tel:"]');
        if (headerPhone) {
            headerPhone.href = 'tel:' + settings.contactPhone.replace(/\s/g, '');
            headerPhone.innerHTML = '<i class="bi bi-telephone-fill"></i> ' + settings.contactPhone;
        }
    }

    // WhatsApp
    if (settings.whatsappNumber) {
        const waLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
        const waNumber = settings.whatsappNumber.replace(/\s/g, '').replace(/\+/g, '');
        waLinks.forEach(link => {
            link.href = 'https://wa.me/' + waNumber;
            // Update display text if it's showing a number
            const textContent = link.textContent.trim();
            if (textContent.match(/^\+?\d/)) {
                link.textContent = settings.whatsappNumber;
            }
        });
    }

    // Email
    if (settings.contactEmail) {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"], .contact-email');
        emailLinks.forEach(link => {
            if (link.tagName === 'A') {
                link.href = 'mailto:' + settings.contactEmail;
                // Check if it's showing an email address
                if (link.textContent.includes('@') || link.querySelector('.__cf_email__')) {
                    link.innerHTML = settings.contactEmail;
                }
            } else {
                link.textContent = settings.contactEmail;
            }
        });
    }

    // Address
    if (settings.contactAddress) {
        const addressElements = document.querySelectorAll('.address-area a, .contact-address');
        addressElements.forEach(el => {
            if (el.closest('.address-area')) {
                el.textContent = settings.contactAddress;
            }
        });
    }
}

/**
 * Apply social media links
 */
function applySocialMedia(settings) {
    const socialMappings = {
        facebookUrl: ['.bxl-facebook', 'facebook.com'],
        instagramUrl: ['.bxl-instagram-alt', '.bxl-instagram', 'instagram.com'],
        telegramUrl: ['.bxl-telegram', 't.me'],
        youtubeUrl: ['.bxl-youtube', 'youtube.com'],
        twitterUrl: ['.bxl-twitter', 'twitter.com', 'x.com'],
        linkedinUrl: ['.bxl-linkedin', 'linkedin.com']
    };

    Object.keys(socialMappings).forEach(key => {
        if (settings[key]) {
            const selectors = socialMappings[key];

            selectors.forEach(selector => {
                if (selector.startsWith('.')) {
                    // Icon selector
                    const icons = document.querySelectorAll(selector);
                    icons.forEach(icon => {
                        const link = icon.closest('a');
                        if (link) {
                            link.href = settings[key];
                            link.target = '_blank';
                            link.rel = 'noopener noreferrer';
                        }
                    });
                } else {
                    // URL based selector
                    const links = document.querySelectorAll(`a[href*="${selector}"]`);
                    links.forEach(link => {
                        link.href = settings[key];
                        link.target = '_blank';
                        link.rel = 'noopener noreferrer';
                    });
                }
            });
        }
    });
}

/**
 * Update meta description
 */
function updateMetaDescription(description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
    }
    meta.content = description;
}

/**
 * Load Google Analytics
 */
function loadGoogleAnalytics(gaId) {
    if (!gaId || document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', gaId);
}

/**
 * Load Google Tag Manager
 */
function loadGoogleTagManager(gtmId) {
    if (!gtmId || document.querySelector(`script[src*="googletagmanager.com/gtm"]`)) return;

    (function(w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l != 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', gtmId);
}

/**
 * Show maintenance page
 */
function showMaintenancePage(message) {
    const maintenanceHTML = `
        <div id="maintenance-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            color: white;
            text-align: center;
            padding: 20px;
        ">
            <div style="font-size: 80px; margin-bottom: 20px;">🔧</div>
            <h1 style="font-size: 36px; margin-bottom: 20px;">Texnik ishlar</h1>
            <p style="font-size: 18px; max-width: 500px; opacity: 0.9;">
                ${message || 'Saytimiz hozirda texnik ishlar tufayli vaqtincha ishlamayapti. Tez orada qaytamiz!'}
            </p>
            <div style="margin-top: 30px; display: flex; gap: 20px; align-items: center;">
                <div style="text-align: center;">
                    <i class="bi bi-envelope" style="font-size: 24px;"></i>
                    <p style="margin-top: 5px; font-size: 14px;">info@travelbliss.uz</p>
                </div>
                <div style="text-align: center;">
                    <i class="bi bi-telephone" style="font-size: 24px;"></i>
                    <p style="margin-top: 5px; font-size: 14px;">+998 90 123 45 67</p>
                </div>
            </div>
        </div>
    `;

    document.body.innerHTML = maintenanceHTML;
}

/**
 * Get current settings (for use in other scripts)
 */
function getSiteSettings() {
    return siteSettings;
}

// Load settings when DOM is ready
if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', async function() {
    await loadSiteSettings();
    await loadHomeSettings(); }); } else { (async function() { await loadSiteSettings(); await loadHomeSettings(); })(); }

/**
 * Load home settings from API
 */
async function loadHomeSettings() { console.log('HOME SETTINGS LOADING...');
    try {
        const response = await fetch(HOME_SETTINGS_API_URL);
        const data = await response.json();

        if (data.success && data.data) {
            homeSettings = data.data;
            applyHomeSettings(homeSettings);
            return homeSettings;
        }
    } catch (error) {
        console.error('Home Settings yuklashda xatolik:', error);
    }
    return null;
}

/**
 * Apply home settings to the page
 */
function applyHomeSettings(settings) { if (!settings) return; // Navigation menu is now static    // Apply phone number (on all pages)    applyPhoneNumber(settings);    // Apply language settings (on all pages)    applyLanguageSettings(settings);    // Only apply rest on homepage    const isHomePage = window.location.pathname === "/" ||                       window.location.pathname.includes("index.html") || window.location.pathname.includes("travel-agency") ||                       window.location.pathname.endsWith("/gofly/") ||                       window.location.pathname.endsWith("/gofly");    if (!isHomePage) return;    // Apply hero settings (new)    applyHeroSettings(settings);    // Apply background settings (legacy)    applyBackgroundSettings(settings);    // Hero Banner (legacy)    applyBannerSettings(settings);    // Apply sections order and visibility    applySectionsOrder(settings);    // Section visibility (legacy support)    applySectionVisibility(settings);    // Section titles and subtitles    applySectionTitles(settings);    // Statistics    applyStatistics(settings);    // Why Choose Us items    applyWhyChooseItems(settings);}

/**
 * Apply homepage background settings
 */
function applyBackgroundSettings(settings) {
    if (!settings.backgroundImage) return;

    const body = document.body;
    const mainContent = document.querySelector('main, .main-content, #main');

    // Create background container if needed
    let bgContainer = document.getElementById('home-bg-container');
    if (!bgContainer) {
        bgContainer = document.createElement('div');
        bgContainer.id = 'home-bg-container';
        bgContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.insertBefore(bgContainer, document.body.firstChild);
    }

    // Apply background image
    bgContainer.style.backgroundImage = `url('${settings.backgroundImage}')`;
    bgContainer.style.backgroundSize = settings.backgroundSize || 'cover';
    bgContainer.style.backgroundPosition = (settings.backgroundPosition || 'center').replace('-', ' ');
    bgContainer.style.backgroundRepeat = settings.backgroundRepeat || 'no-repeat';
    bgContainer.style.backgroundAttachment = settings.backgroundAttachment || 'scroll';

    // Apply overlay if enabled
    if (settings.backgroundOverlay) {
        let overlay = document.getElementById('home-bg-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'home-bg-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: -1;
                pointer-events: none;
            `;
            bgContainer.appendChild(overlay);
        }
        overlay.style.backgroundColor = settings.backgroundOverlayColor || 'rgba(0,0,0,0.5)';
    }
}

/**
 * Apply sections order from settings
 */
function applySectionsOrder(settings) {
    if (!settings.sectionsOrder || settings.sectionsOrder.length === 0) return;

    // Section ID to CSS selector mapping
    const sectionSelectors = {
        'hero': '.home4-banner-section, .banner-section',
        'features': '.home4-feature-section, .feature-section',
        'destinations': '.home4-destination-section, .destination-section',
        'packages': '.home4-package-section, .package-section',
        'whyChoose': '.home4-why-choose-us-section, .why-choose-section, .why-choose-video-area',
        'stats': '.counter-section, .stats-section',
        'testimonials': '.home4-testimonial-section, .testimonial-section',
        'blog': '.home4-blog-section, .blog-section',
        'newsletter': '.newsletter-section, .cta-section',
        'partners': '.partner-section, .partners-section'
    };

    // Sort sections by order
    const sortedSections = [...settings.sectionsOrder].sort((a, b) => a.order - b.order);

    // Apply visibility based on sectionsOrder
    sortedSections.forEach(section => {
        const selectors = sectionSelectors[section.id];
        if (!selectors) return;

        const elements = document.querySelectorAll(selectors);
        elements.forEach(el => {
            if (!section.enabled) {
                el.style.display = 'none';
            } else {
                // Reset display if it was hidden
                if (el.style.display === 'none') {
                    el.style.display = '';
                }
            }
        });
    });

    // Note: Full reordering would require more complex DOM manipulation
    // and might conflict with existing page structure
}

/**
 * Apply banner/hero section settings
 */
function applyBannerSettings(settings) {
    // Banner title
    if (settings.heroBannerTitle) {
        const bannerTitle = document.querySelector('.banner-content h1');
        if (bannerTitle) {
            bannerTitle.textContent = settings.heroBannerTitle;
        }
    }

    // Banner subtitle
    if (settings.heroBannerSubtitle) {
        const bannerSubtitle = document.querySelector('.banner-content p');
        if (bannerSubtitle) {
            bannerSubtitle.innerHTML = settings.heroBannerSubtitle;
        }
    }

    // Banner button
    if (settings.heroBannerButtonText || settings.heroBannerButtonLink) {
        const bannerBtn = document.querySelector('.banner-content a.btn, .banner-content .banner-btn');
        if (bannerBtn) {
            if (settings.heroBannerButtonText) {
                bannerBtn.textContent = settings.heroBannerButtonText;
            }
            if (settings.heroBannerButtonLink) {
                bannerBtn.href = settings.heroBannerButtonLink;
            }
        }
    }

    // Banner background image
    if (settings.heroBannerImage) {
        const bannerSection = document.querySelector('.home4-banner-section, .banner-section');
        if (bannerSection) {
            // Check if there's a video element
            const video = bannerSection.querySelector('video');
            if (video) {
                video.style.display = 'none';
            }
            // Set background image
            bannerSection.style.backgroundImage = `url('${settings.heroBannerImage}')`;
            bannerSection.style.backgroundSize = 'cover';
            bannerSection.style.backgroundPosition = 'center';
        }
    }
}

/**
 * Apply section visibility settings
 */
function applySectionVisibility(settings) {
    // Featured Tours Section
    if (settings.showFeaturedSection === false) {
        const featuredSection = document.querySelector('.home4-package-section, .package-section, .featured-tours-section');
        if (featuredSection) featuredSection.style.display = 'none';
    }

    // Destinations Section
    if (settings.showDestinationsSection === false) {
        const destinationsSection = document.querySelector('.home4-destination-section, .destination-section');
        if (destinationsSection) destinationsSection.style.display = 'none';
    }

    // Why Choose Us Section
    if (settings.showWhyChooseSection === false) {
        const whyChooseSection = document.querySelector('.home4-why-choose-us-section, .why-choose-section');
        if (whyChooseSection) whyChooseSection.style.display = 'none';
        const whyChooseVideo = document.querySelector('.why-choose-video-area');
        if (whyChooseVideo) whyChooseVideo.style.display = 'none';
    }

    // Statistics Section
    if (settings.showStatsSection === false) {
        const statsSection = document.querySelector('.counter-section, .stats-section');
        if (statsSection) statsSection.style.display = 'none';
    }

    // Testimonials Section
    if (settings.showTestimonialsSection === false) {
        const testimonialsSection = document.querySelector('.home4-testimonial-section, .testimonial-section');
        if (testimonialsSection) testimonialsSection.style.display = 'none';
    }

    // Newsletter Section
    if (settings.showNewsletterSection === false) {
        const newsletterSection = document.querySelector('.newsletter-section, .cta-section');
        if (newsletterSection) newsletterSection.style.display = 'none';
    }

    // Partners Section
    if (settings.showPartnersSection === false) {
        const partnersSection = document.querySelector('.partner-section, .partners-section');
        if (partnersSection) partnersSection.style.display = 'none';
    }
}

/**
 * Apply section titles and subtitles
 */
function applySectionTitles(settings) {
    // Destinations Section
    if (settings.destinationsSectionTitle) {
        const destTitle = document.querySelector('.home4-destination-section .section-title h2');
        if (destTitle) destTitle.textContent = settings.destinationsSectionTitle;
    }
    if (settings.destinationsSectionSubtitle) {
        const destSubtitle = document.querySelector('.home4-destination-section .section-title p');
        if (destSubtitle) destSubtitle.textContent = settings.destinationsSectionSubtitle;
    }

    // Featured Tours Section
    if (settings.featuredSectionTitle) {
        const featuredTitle = document.querySelector('.home4-package-section .section-title h2, .package-section .section-title h2');
        if (featuredTitle) featuredTitle.textContent = settings.featuredSectionTitle;
    }
    if (settings.featuredSectionSubtitle) {
        const featuredSubtitle = document.querySelector('.home4-package-section .section-title p, .package-section .section-title p');
        if (featuredSubtitle) featuredSubtitle.textContent = settings.featuredSectionSubtitle;
    }

    // Why Choose Us Section
    if (settings.whyChooseSectionTitle) {
        const whyTitle = document.querySelector('.home4-why-choose-us-section .section-title h2');
        if (whyTitle) whyTitle.textContent = settings.whyChooseSectionTitle;
    }
    if (settings.whyChooseSectionSubtitle) {
        const whySubtitle = document.querySelector('.home4-why-choose-us-section .section-title p');
        if (whySubtitle) whySubtitle.textContent = settings.whyChooseSectionSubtitle;
    }

    // Testimonials Section
    if (settings.testimonialsSectionTitle) {
        const testTitle = document.querySelector('.home4-testimonial-section .section-title h2');
        if (testTitle) testTitle.textContent = settings.testimonialsSectionTitle;
    }
    if (settings.testimonialsSectionSubtitle) {
        const testSubtitle = document.querySelector('.home4-testimonial-section .section-title p');
        if (testSubtitle) testSubtitle.textContent = settings.testimonialsSectionSubtitle;
    }

    // Newsletter Section
    if (settings.newsletterSectionTitle) {
        const newsTitle = document.querySelector('.newsletter-section .section-title h2, .cta-section h2');
        if (newsTitle) newsTitle.textContent = settings.newsletterSectionTitle;
    }
    if (settings.newsletterSectionSubtitle) {
        const newsSubtitle = document.querySelector('.newsletter-section .section-title p, .cta-section p');
        if (newsSubtitle) newsSubtitle.textContent = settings.newsletterSectionSubtitle;
    }
    if (settings.newsletterButtonText) {
        const newsBtn = document.querySelector('.newsletter-section button, .cta-section button');
        if (newsBtn) newsBtn.textContent = settings.newsletterButtonText;
    }

    // Partners Section
    if (settings.partnersSectionTitle) {
        const partnersTitle = document.querySelector('.partner-section .section-title h2, .partners-section h2');
        if (partnersTitle) partnersTitle.textContent = settings.partnersSectionTitle;
    }
}

/**
 * Apply statistics/counter settings
 */
function applyStatistics(settings) {
    // Counter for tours
    if (settings.statToursCount) {
        const toursCounter = document.querySelector('.counter-section .counter-card:nth-child(1) .number, [data-stat="tours"]');
        if (toursCounter) {
            toursCounter.setAttribute('data-count', settings.statToursCount);
            toursCounter.textContent = settings.statToursCount + '+';
        }
    }

    // Counter for happy customers
    if (settings.statHappyCustomers) {
        const customersCounter = document.querySelector('.counter-section .counter-card:nth-child(2) .number, [data-stat="customers"]');
        if (customersCounter) {
            customersCounter.setAttribute('data-count', settings.statHappyCustomers);
            customersCounter.textContent = settings.statHappyCustomers + '+';
        }
    }

    // Counter for destinations
    if (settings.statDestinations) {
        const destCounter = document.querySelector('.counter-section .counter-card:nth-child(3) .number, [data-stat="destinations"]');
        if (destCounter) {
            destCounter.setAttribute('data-count', settings.statDestinations);
            destCounter.textContent = settings.statDestinations + '+';
        }
    }

    // Average rating
    if (settings.statAverageRating) {
        const ratingCounter = document.querySelector('.counter-section .counter-card:nth-child(4) .number, [data-stat="rating"]');
        if (ratingCounter) {
            ratingCounter.setAttribute('data-count', settings.statAverageRating);
            ratingCounter.textContent = settings.statAverageRating;
        }
    }
}

/**
 * Apply Why Choose Us items
 */
function applyWhyChooseItems(settings) {
    if (!settings.whyChooseItems || settings.whyChooseItems.length === 0) return;

    const whyChooseContainer = document.querySelector('.home4-why-choose-us-section .row.g-4');
    if (!whyChooseContainer) return;

    // Get existing feature cards
    const featureCards = whyChooseContainer.querySelectorAll('.single-feature');

    settings.whyChooseItems.forEach((item, index) => {
        if (featureCards[index]) {
            // Update icon
            if (item.icon) {
                const iconContainer = featureCards[index].querySelector('.icon');
                if (iconContainer) {
                    // Check if it's an emoji or icon class
                    if (item.icon.length <= 4) {
                        iconContainer.innerHTML = `<span style="font-size: 32px;">${item.icon}</span>`;
                    } else {
                        iconContainer.innerHTML = `<i class="${item.icon}"></i>`;
                    }
                }
            }

            // Update title
            if (item.title) {
                const titleEl = featureCards[index].querySelector('h5');
                if (titleEl) titleEl.textContent = item.title;
            }

            // Update description (if exists)
            if (item.description) {
                let descEl = featureCards[index].querySelector('p');
                if (!descEl && item.description) {
                    descEl = document.createElement('p');
                    featureCards[index].appendChild(descEl);
                }
                if (descEl) descEl.textContent = item.description;
            }
        }
    });
}

/**
 * Get current home settings (for use in other scripts)
 */
function getHomeSettings() {
    return homeSettings;
}

/**
 * Apply language settings
 */
function applyLanguageSettings(settings) {
    if (!settings.languages || settings.languages.length === 0) return;

    // Get enabled languages
    const enabledLanguages = settings.languages.filter(l => l.enabled);
    const defaultLang = settings.defaultLanguage || 'en';

    // Store languages globally for use by other scripts
    window.siteLanguages = enabledLanguages;
    window.defaultLanguage = defaultLang;

    // Create/update language switcher if exists
    updateLangDropdowns(enabledLanguages, defaultLang);
    createLanguageSwitcher(enabledLanguages, defaultLang);

    // Set HTML lang attribute
    document.documentElement.lang = defaultLang;
}

/**
 * Create or update language switcher dropdown
 */
function createLanguageSwitcher(languages, defaultLang) {
    // Find existing language switcher container
    let langSwitcher = document.querySelector('.language-switcher, #language-switcher');

    // If no existing switcher, create one in header
    if (!langSwitcher) {
        const header = document.querySelector('.header-right, .top-info-right, header .top-right');
        if (header) {
            langSwitcher = document.createElement('div');
            langSwitcher.className = 'language-switcher';
            langSwitcher.id = 'language-switcher';
            langSwitcher.style.cssText = `
                position: relative;
                display: inline-flex;
                align-items: center;
                margin-left: 15px;
            `;
            header.appendChild(langSwitcher);
        }
    }

    if (!langSwitcher) return;

    // Get current language from localStorage or use default
    const currentLang = localStorage.getItem('site_language') || defaultLang;
    const currentLangObj = languages.find(l => l.code === currentLang) || languages[0];

    // Build dropdown HTML
    langSwitcher.innerHTML = `
        <div class="lang-current" onclick="toggleLangDropdown()" style="
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            padding: 6px 12px;
            border-radius: 6px;
            background: rgba(255,255,255,0.1);
            transition: all 0.3s;
        ">
            <span class="lang-flag" style="font-size: 18px;">${currentLangObj.flag || '🌐'}</span>
            <span class="lang-code" style="font-size: 13px; font-weight: 600;">${currentLangObj.code.toUpperCase()}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 8L2 4h8L6 8z"/>
            </svg>
        </div>
        <div class="lang-dropdown" id="lang-dropdown" style="
            position: absolute;
            top: 100%;
            right: 0;
            min-width: 150px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: none;
            overflow: hidden;
            z-index: 1000;
            margin-top: 8px;
        ">
            ${languages.map(lang => `
                <div class="lang-option ${lang.code === currentLang ? 'active' : ''}"
                     onclick="selectLanguage('${lang.code}')"
                     style="
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        padding: 10px 15px;
                        cursor: pointer;
                        transition: all 0.2s;
                        ${lang.code === currentLang ? 'background: #f0f4ff; color: #667eea;' : ''}
                     "
                     onmouseover="this.style.background='#f5f5f5'"
                     onmouseout="this.style.background='${lang.code === currentLang ? '#f0f4ff' : 'white'}'">
                    <span style="font-size: 20px;">${lang.flag || '🌐'}</span>
                    <span style="font-size: 14px;">${lang.name}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Add styles for hover effect on current lang button
    const langCurrent = langSwitcher.querySelector('.lang-current');
    langCurrent.onmouseover = function() {
        this.style.background = 'rgba(255,255,255,0.2)';
    };
    langCurrent.onmouseout = function() {
        this.style.background = 'rgba(255,255,255,0.1)';
    };
}

/**
 * Toggle language dropdown visibility
 */
window.toggleLangDropdown = function() {
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
};

/**
 * Select a language
 */
window.selectLanguage = function(langCode) {
    // Save to localStorage
    localStorage.setItem('site_language', langCode);

    // Update HTML lang attribute
    document.documentElement.lang = langCode;

    // Close dropdown
    const dropdown = document.getElementById('lang-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
    }

    // Reload page or trigger translation (depending on implementation)
    // For now, just reload to apply language change
    window.location.reload();
};

// Close language dropdown when clicking outside
document.addEventListener('click', function(e) {
    const langSwitcher = document.querySelector('.language-switcher');
    const dropdown = document.getElementById('lang-dropdown');
    if (langSwitcher && dropdown && !langSwitcher.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

/**
 * Get current selected language
 */
function getCurrentLanguage() {
    return localStorage.getItem('site_language') || window.defaultLanguage || 'en';
}

/**
 * Get available languages
 */
function getAvailableLanguages() {
    return window.siteLanguages || [];
}

// Export for use in other scripts
window.loadSiteSettings = loadSiteSettings;
window.getSiteSettings = getSiteSettings;
window.loadHomeSettings = loadHomeSettings;
window.getHomeSettings = getHomeSettings;
window.getCurrentLanguage = getCurrentLanguage;
window.getAvailableLanguages = getAvailableLanguages;
window.siteSettings = siteSettings;
window.homeSettings = homeSettings;

// Navigation menu is now static in HTML
function applyNavigationMenu(settings) {
    // Menu is hardcoded in HTML, only apply phone settings
    var phoneLinks = document.querySelectorAll('.nav-right .contact-area a[href^="tel"]');
    if (settings.phoneNumber && phoneLinks.length > 0) {
        phoneLinks.forEach(function(link) {
            link.href = 'tel:' + settings.phoneNumber.replace(/s/g, '');
            link.textContent = settings.phoneNumber;
        });
    }
    if (settings.showPhone === false) {
        document.querySelectorAll('.nav-right .contact-area > div:first-child').forEach(function(el) {
            el.style.display = 'none';
        });
    }
}

// Apply phone number from home settings
function applyPhoneNumber(settings) {
    if (settings.showPhone === false) {
        document.querySelectorAll('.header-phone, .phone-number').forEach(function(el) {
            el.style.display = 'none';
        });
        return;
    }
    if (settings.phoneNumber) {
        document.querySelectorAll('.header-phone a, .phone-number').forEach(function(el) {
            if (el.tagName === 'A') {
                el.href = 'tel:' + settings.phoneNumber;
            }
            el.textContent = settings.phoneNumber;
        });
    }
}

// Apply hero banner settings
// Apply hero banner settings
function applyHeroSettings(settings) {
    // Apply hero title
    if (settings.heroTitle) {
        document.querySelectorAll('.hero-title, .banner-title, .home4-banner-title h1, .banner-content h1').forEach(function(el) {
            el.textContent = settings.heroTitle;
        });
    }
    // Apply hero subtitle
    if (settings.heroSubtitle) {
        document.querySelectorAll('.hero-subtitle, .banner-subtitle, .home4-banner-title p, .banner-content p').forEach(function(el) {
            el.innerHTML = settings.heroSubtitle;
        });
    }
    // Apply hero button
    if (settings.showHeroButton !== false && settings.heroButtonText) {
        var heroBtn = document.querySelector('.banner-content .btn, .banner-content a.primary-btn');
        if (heroBtn) {
            heroBtn.textContent = settings.heroButtonText;
            if (settings.heroButtonLink) {
                heroBtn.href = settings.heroButtonLink;
            }
        }
    }
    // Apply hero slides
    if (settings.heroSlides && settings.heroSlides.length > 0) {
        var enabledSlides = settings.heroSlides.filter(function(s) { return s.enabled; });
        if (enabledSlides.length > 0) {
            var bannerVideoArea = document.querySelector('.banner-video-area');
            var mainSwiper = document.querySelector('.banner-main-swiper .swiper-wrapper');
            var thumbSwiper = document.querySelector('.banner-thumb-swiper .swiper-wrapper');

            // Option 1: Update existing swiper (travel-agency-03.html)
            if (mainSwiper) {
                mainSwiper.innerHTML = '';
                if (thumbSwiper) thumbSwiper.innerHTML = '';

                enabledSlides.forEach(function(slide) {
                    mainSwiper.innerHTML += '<div class="swiper-slide"><img src="' + slide.image + '" alt=""></div>';
                    if (thumbSwiper) {
                        thumbSwiper.innerHTML += '<div class="swiper-slide"><img src="' + slide.image + '" alt=""></div>';
                    }
                });

                // Reinitialize swipers
                setTimeout(function() {
                    if (typeof Swiper !== 'undefined') {
                        var oldMain = document.querySelector('.banner-main-swiper');
                        var oldThumb = document.querySelector('.banner-thumb-swiper');
                        if (oldMain && oldMain.swiper) oldMain.swiper.destroy(true, true);
                        if (oldThumb && oldThumb.swiper) oldThumb.swiper.destroy(true, true);

                        var newThumbSwiper = new Swiper('.banner-thumb-swiper', {
                            spaceBetween: 10,
                            slidesPerView: 5,
                            freeMode: true,
                            watchSlidesProgress: true,
                            breakpoints: {
                                320: { slidesPerView: 3, spaceBetween: 8 },
                                640: { slidesPerView: 4, spaceBetween: 10 },
                                1024: { slidesPerView: 5, spaceBetween: 10 }
                            }
                        });

                        new Swiper('.banner-main-swiper', {
                            spaceBetween: 0,
                            loop: enabledSlides.length > 1,
                            autoplay: { delay: 5000, disableOnInteraction: false },
                            effect: 'fade',
                            fadeEffect: { crossFade: true },
                            navigation: {
                                nextEl: '.banner-main-swiper .swiper-button-next',
                                prevEl: '.banner-main-swiper .swiper-button-prev',
                            },
                            thumbs: { swiper: newThumbSwiper }
                        });
                    }
                }, 200);
            }
            // Option 2: Replace video (index.html)
            else if (bannerVideoArea) {
                var video = bannerVideoArea.querySelector('video');
                if (video) video.remove();

                var bannerHeight = bannerVideoArea.offsetHeight || 750;
                var borderRadius = getComputedStyle(bannerVideoArea).borderRadius || '50px';

                var sliderHTML = '<div class="hero-slider swiper" id="heroSlider" style="width:100%;height:' + bannerHeight + 'px;border-radius:' + borderRadius + ';overflow:hidden;">';
                sliderHTML += '<div class="swiper-wrapper">';
                enabledSlides.forEach(function(slide) {
                    sliderHTML += '<div class="swiper-slide"><img src="' + slide.image + '" alt="" style="width:100%;height:100%;object-fit:cover;"></div>';
                });
                sliderHTML += '</div>';
                if (enabledSlides.length > 1) {
                    sliderHTML += '<div class="swiper-pagination hero-pagination" style="bottom:20px;"></div>';
                }
                sliderHTML += '</div>';

                bannerVideoArea.innerHTML = sliderHTML;

                setTimeout(function() {
                    if (typeof Swiper !== 'undefined') {
                        new Swiper('#heroSlider', {
                            loop: enabledSlides.length > 1,
                            autoplay: enabledSlides.length > 1 ? { delay: 5000, disableOnInteraction: false } : false,
                            effect: 'fade',
                            fadeEffect: { crossFade: true },
                            pagination: { el: '.hero-pagination', clickable: true }
                        });
                    }
                }, 100);
            }
        }
    }
}

// Export new functions
window.applyNavigationMenu = applyNavigationMenu;
window.applyPhoneNumber = applyPhoneNumber;
window.applyHeroSettings = applyHeroSettings;

/**
 * Update existing language dropdowns from API data (desktop and mobile)
 */
function updateLangDropdowns(languages, defaultLang) {
    // Desktop dropdown
    var desktopDropdown = document.querySelector('.language-dropdown');
    if (desktopDropdown) {
        var html = '';
        languages.forEach(function(lang) {
            html += '<a href="#" class="lang-option" data-lang="' + lang.code.toUpperCase() + '" style="display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: #1f2937; text-decoration: none; transition: all 0.2s;">' +
                '<span style="font-size: 20px;">' + (lang.flag || '🌐') + '</span>' +
                '<span>' + lang.name + '</span>' +
            '</a>';
        });
        desktopDropdown.innerHTML = html;

        // Re-attach click handlers
        desktopDropdown.querySelectorAll('.lang-option').forEach(function(option) {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                var langCode = this.getAttribute('data-lang');
                var currentLangSpan = document.getElementById('currentLang');
                if (currentLangSpan) currentLangSpan.textContent = langCode;
                localStorage.setItem('site_language', langCode.toLowerCase());
                desktopDropdown.style.display = 'none';
            });
        });
    }

    // Mobile dropdown
    var mobileDropdown = document.querySelector('.language-dropdown-mobile');
    if (mobileDropdown) {
        var html = '';
        languages.forEach(function(lang, index) {
            var borderStyle = index < languages.length - 1 ? 'border-bottom: 1px solid #f3f4f6;' : '';
            html += '<a href="#" class="lang-option-mobile" data-lang="' + lang.name + '" style="display: flex; align-items: center; gap: 10px; padding: 12px 15px; color: #1f2937; text-decoration: none; transition: all 0.2s; ' + borderStyle + '">' +
                '<span style="font-size: 20px;">' + (lang.flag || '🌐') + '</span>' +
                '<span>' + lang.name + '</span>' +
            '</a>';
        });
        mobileDropdown.innerHTML = html;

        // Re-attach click handlers
        mobileDropdown.querySelectorAll('.lang-option-mobile').forEach(function(option) {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                var langName = this.getAttribute('data-lang');
                var currentLangMobile = document.getElementById('currentLangMobile');
                if (currentLangMobile) currentLangMobile.textContent = langName;
                localStorage.setItem('site_language_name', langName);
                mobileDropdown.style.display = 'none';
            });
        });
    }

    // Update current language display from localStorage
    var savedLang = localStorage.getItem('site_language');
    var savedLangName = localStorage.getItem('site_language_name');
    if (savedLang) {
        var currentLangSpan = document.getElementById('currentLang');
        if (currentLangSpan) currentLangSpan.textContent = savedLang.toUpperCase();
    }
    if (savedLangName) {
        var currentLangMobile = document.getElementById('currentLangMobile');
        if (currentLangMobile) currentLangMobile.textContent = savedLangName;
    }
}
