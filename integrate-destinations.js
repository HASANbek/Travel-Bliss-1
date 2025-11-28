const fs = require('fs');

let html = fs.readFileSync('public/gofly/travel-agency-03.html', 'utf8');

// Find the static swiper-wrapper content and replace with dynamic loading
const oldSwiperWrapper = `<div class="swiper-wrapper">
                    <!-- Samarkand -->
                    <div class="swiper-slide">
                        <div class="destination-card-overlay">
                            <div class="destination-flag">🇺🇿</div>
                            <div class="destination-trips-badge">12 Trips</div>
                            <img src="assets/img/home2/destination-img1.jpg" alt="Samarkand">
                            <div class="destination-overlay"></div>
                            <div class="destination-card-content">
                                <h3>Samarkand</h3>
                                <p>Explore ancient Samarkand, famous for its stunning Islamic architecture, including the Registan, thousands of historical monuments, and rich cultural heritage.</p>
                                <a href="destination-details.html" class="destination-link">
                                    See destination
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>`;

const newSwiperWrapper = `<div class="swiper-wrapper" id="destinationsSliderWrapper">
                    <!-- Destinations will be loaded dynamically -->
                    <div class="swiper-slide">
                        <div class="destination-card-overlay">
                            <div class="destination-flag">🇺🇿</div>
                            <div class="destination-trips-badge">Loading...</div>
                            <img src="assets/img/home2/destination-img1.jpg" alt="Loading">
                            <div class="destination-overlay"></div>
                            <div class="destination-card-content">
                                <h3>Loading destinations...</h3>
                                <p>Please wait while we load the destinations from the database.</p>
                                <a href="#" class="destination-link">
                                    Loading...
                                </a>
                            </div>
                        </div>
                    </div>`;

html = html.replace(oldSwiperWrapper, newSwiperWrapper);

// Remove all static slides after the first one (keep structure but will be replaced)
// Find and remove slides from Bukhara to Tajikistan
const slidesToRemove = [
    /<!-- Bukhara -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Khiva -->/,
    /<!-- Khiva -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Tashkent -->/,
    /<!-- Tashkent -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Nurata -->/,
    /<!-- Nurata -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Nukus -->/,
    /<!-- Nukus -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Termez -->/,
    /<!-- Termez -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Fergana -->/,
    /<!-- Fergana -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<!-- Tajikistan/,
    /<!-- Tajikistan - Seven Lakes -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- Navigation -->/
];

// Find and update the Swiper initialization script to load destinations dynamically
const oldSwiperInit = `document.addEventListener('DOMContentLoaded', function() {
    // Initialize Swiper
    const destinationsSwiper = new Swiper('.explore-destinations-slider', {`;

const newSwiperInit = `document.addEventListener('DOMContentLoaded', function() {
    // Load destinations from API
    loadDestinationsForSlider();

    // Initialize Swiper
    const destinationsSwiper = new Swiper('.explore-destinations-slider', {`;

html = html.replace(oldSwiperInit, newSwiperInit);

// Add the loadDestinationsForSlider function before the closing </body> tag
const loadDestinationsScript = `
<!-- Load Destinations from API -->
<script>
async function loadDestinationsForSlider() {
    try {
        const response = await fetch('/api/destinations?status=active');
        const data = await response.json();

        if (data.success && data.data.destinations && data.data.destinations.length > 0) {
            const wrapper = document.getElementById('destinationsSliderWrapper');
            const destinations = data.data.destinations;

            // Generate slides HTML
            const slidesHTML = destinations.map(dest => {
                const flag = getCountryFlag(dest.country_code);
                const image = dest.main_image || dest.thumbnail_image || 'assets/img/home2/destination-img1.jpg';
                const trips = dest.trips_count || 0;
                const description = dest.short_description || dest.tagline || 'Discover this amazing destination';

                return \`
                    <div class="swiper-slide">
                        <div class="destination-card-overlay">
                            <div class="destination-flag">\${flag}</div>
                            <div class="destination-trips-badge">\${trips} Trips</div>
                            <img src="\${image}" alt="\${dest.title}" onerror="this.src='assets/img/home2/destination-img1.jpg'">
                            <div class="destination-overlay"></div>
                            <div class="destination-card-content">
                                <h3>\${dest.title}</h3>
                                <p>\${description}</p>
                                <a href="destination-details.html?slug=\${dest.slug}" class="destination-link">
                                    See destination
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                \`;
            }).join('');

            wrapper.innerHTML = slidesHTML;

            // Reinitialize swiper after loading destinations
            if (window.destinationsSwiper) {
                window.destinationsSwiper.update();
            }
        }
    } catch (error) {
        console.error('Error loading destinations:', error);
    }
}

function getCountryFlag(countryCode) {
    const flags = {
        'UZ': '🇺🇿',
        'TJ': '🇹🇯',
        'KZ': '🇰🇿',
        'KG': '🇰🇬',
        'TM': '🇹🇲'
    };
    return flags[countryCode] || '🏳️';
}
</script>

</body>`;

html = html.replace('</body>', loadDestinationsScript);

// Also update the swiper variable to be accessible globally
html = html.replace(
    'const destinationsSwiper = new Swiper',
    'window.destinationsSwiper = new Swiper'
);

fs.writeFileSync('public/gofly/travel-agency-03.html', html);
console.log('Destinations integration complete!');
