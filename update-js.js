const fs = require('fs');

let html = fs.readFileSync('public/gofly/destination-details.html', 'utf8');

const oldScript = `    <!-- Dynamic Data Loading -->
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const destinationId = urlParams.get('id') || urlParams.get('slug') || 'samarkand';

        async function loadDestination() {
            try {
                const response = await fetch('/api/destinations/' + destinationId);
                const data = await response.json();
                if (data.success) {
                    displayDestination(data.data.destination);
                } else {
                    console.error('Error loading destination:', data.message);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function displayDestination(dest) {
            // Hero Section
            document.getElementById('destinationName').textContent = dest.title || 'Destination';
            document.getElementById('destinationTagline').textContent = dest.tagline || '';

            // Hero background image
            if (dest.main_image) {
                document.querySelector('.hero-section').style.background =
                    'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(' + dest.main_image + ') center/cover';
            }

            // Info Cards
            document.getElementById('capitalInfo').textContent = dest.capital || 'Tashkent';
            document.getElementById('currencyInfo').textContent = dest.currency || 'UZS (Som)';
            document.getElementById('languageInfo').textContent = dest.language || 'Uzbek, Russian';

            // Description
            document.getElementById('destinationDescription').textContent = dest.long_description || dest.short_description || '';

            // Popular Places
            if (dest.popular_places && dest.popular_places.length > 0) {
                const placesContainer = document.getElementById('popularPlacesContainer');
                if (placesContainer) {
                    placesContainer.innerHTML = dest.popular_places.map(function(place) {
                        return '<div class="col-md-6 col-lg-3">' +
                            '<div class="place-card">' +
                                '<img src="' + (place.image || 'https://via.placeholder.com/400x200') + '" alt="' + place.title + '" class="place-image">' +
                                '<div class="place-content">' +
                                    '<h3 class="place-title">' + place.title + '</h3>' +
                                    '<p class="place-description">' + (place.description || '') + '</p>' +
                                    (place.map_link ? '<a href="' + place.map_link + '" target="_blank" class="map-link">📍 View on Map</a>' : '') +
                                '</div>' +
                            '</div>' +
                        '</div>';
                    }).join('');
                }
            }

            // Seasons
            if (dest.seasons && dest.seasons.length > 0) {
                const seasonsContainer = document.getElementById('seasonsContainer');
                if (seasonsContainer) {
                    seasonsContainer.innerHTML = dest.seasons.map(function(season) {
                        return '<div class="season-card">' +
                            '<div class="season-header">' +
                                '<div class="season-icon">' + (season.icon || '🌸') + '</div>' +
                                '<div>' +
                                    '<div class="season-title">' + season.name + ' (' + (season.months || '') + ')</div>' +
                                    '<div class="season-weather">Temperature: ' + (season.temperature || 'N/A') + '</div>' +
                                '</div>' +
                            '</div>' +
                            '<p class="season-description">' + (season.description || '') + '</p>' +
                        '</div>';
                    }).join('');
                }
            }

            // FAQs
            if (dest.faqs && dest.faqs.length > 0) {
                const faqsContainer = document.getElementById('faqsContainer');
                if (faqsContainer) {
                    faqsContainer.innerHTML = dest.faqs.map(function(faq) {
                        return '<div class="faq-item">' +
                            '<div class="faq-question">' + faq.question + '</div>' +
                            '<div class="faq-answer">' + (faq.answer || '') + '</div>' +
                        '</div>';
                    }).join('');
                }
            }

            // Update page title
            document.title = (dest.title || 'Destination') + ' - Travel Bliss';
        }

        window.addEventListener('DOMContentLoaded', loadDestination);
    </script>`;

const newScript = `    <!-- Dynamic Data Loading -->
    <script>
        const urlParams = new URLSearchParams(window.location.search);
        const destinationId = urlParams.get('id') || urlParams.get('slug') || 'andijan';

        async function loadDestination() {
            try {
                console.log('Loading destination:', destinationId);
                const response = await fetch('/api/destinations/' + destinationId);
                const data = await response.json();
                if (data.success && data.data.destination) {
                    displayDestination(data.data.destination);
                } else {
                    console.error('Destination not found');
                    document.getElementById('destinationName').textContent = 'Destination Not Found';
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }

        function getSeasonIcon(iconName) {
            const icons = { 'spring': '🌸', 'summer': '☀️', 'autumn': '🍂', 'fall': '🍂', 'winter': '❄️' };
            return icons[iconName?.toLowerCase()] || iconName || '🌸';
        }

        function displayDestination(dest) {
            // SEO
            if (dest.seo && dest.seo.meta_title) {
                document.title = dest.seo.meta_title;
            } else {
                document.title = (dest.title || 'Destination') + ' - Travel Bliss';
            }

            // Hero Section
            document.getElementById('destinationName').textContent = dest.title || 'Destination';
            document.getElementById('destinationTagline').textContent = dest.tagline || dest.short_description || '';

            // Hero background
            if (dest.main_image) {
                document.querySelector('.hero-section').style.background =
                    'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(' + dest.main_image + ') center/cover no-repeat';
            }

            // Info Cards
            document.getElementById('capitalInfo').textContent = dest.capital || 'Tashkent';
            document.getElementById('currencyInfo').textContent = dest.currency || 'UZS (Som)';
            document.getElementById('languageInfo').textContent = dest.language || 'Uzbek, Russian';

            // Add rating if exists
            if (dest.rating && dest.rating > 0) {
                const infoCards = document.querySelector('.info-cards');
                const ratingCard = document.createElement('div');
                ratingCard.className = 'info-card';
                ratingCard.innerHTML = '<div class="info-card-icon">⭐</div><div class="info-card-label">Rating</div><div class="info-card-value">' + dest.rating.toFixed(1) + '/5</div>';
                infoCards.appendChild(ratingCard);
            }

            // Description
            document.getElementById('destinationDescription').textContent = dest.long_description || dest.short_description || '';

            // Popular Places
            if (dest.popular_places && dest.popular_places.length > 0) {
                const placesContainer = document.getElementById('popularPlacesContainer');
                placesContainer.innerHTML = dest.popular_places.map(function(place) {
                    const img = place.image && place.image !== 'test.jpg' ? place.image : 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400';
                    return '<div class="col-md-6 col-lg-3"><div class="place-card">' +
                        '<img src="' + img + '" alt="' + place.title + '" class="place-image" onerror="this.onerror=null;this.src=\\'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400\\'">' +
                        '<div class="place-content"><h3 class="place-title">' + place.title + '</h3>' +
                        '<p class="place-description">' + (place.description || '') + '</p>' +
                        (place.map_link ? '<a href="' + place.map_link + '" target="_blank" class="map-link">📍 View on Map</a>' : '') +
                        '</div></div></div>';
                }).join('');
            }

            // Seasons
            if (dest.seasons && dest.seasons.length > 0) {
                const seasonsContainer = document.getElementById('seasonsContainer');
                seasonsContainer.innerHTML = dest.seasons.map(function(season) {
                    return '<div class="season-card"><div class="season-header">' +
                        '<div class="season-icon">' + getSeasonIcon(season.icon) + '</div><div>' +
                        '<div class="season-title">' + season.name + (season.months ? ' (' + season.months + ')' : '') + '</div>' +
                        '<div class="season-weather">Temperature: ' + (season.temperature || 'N/A') + '</div></div></div>' +
                        '<p class="season-description">' + (season.description || '') + '</p></div>';
                }).join('');
            }

            // FAQs
            if (dest.faqs && dest.faqs.length > 0) {
                const faqsContainer = document.getElementById('faqsContainer');
                faqsContainer.innerHTML = dest.faqs.map(function(faq) {
                    return '<div class="faq-item"><div class="faq-question">' + faq.question + '</div>' +
                        '<div class="faq-answer">' + (faq.answer || '') + '</div></div>';
                }).join('');
            }

            // Tours title
            const toursSection = document.querySelector('.section-spacing:last-of-type .section-title');
            if (toursSection && dest.title) {
                toursSection.textContent = 'Available Tours in ' + dest.title;
            }
        }

        document.addEventListener('DOMContentLoaded', loadDestination);
    </script>`;

html = html.replace(oldScript, newScript);
fs.writeFileSync('public/gofly/destination-details.html', html);
console.log('JavaScript updated!');
