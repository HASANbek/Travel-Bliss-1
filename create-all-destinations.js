const fs = require('fs');

// Read travel-agency-03.html as template
const template = fs.readFileSync('public/gofly/travel-agency-03.html', 'utf8');

// Extract the head section (including all CSS)
const headStart = template.indexOf('<head>');
const headEnd = template.indexOf('</head>') + '</head>'.length;
const headSection = template.substring(headStart, headEnd);

// Extract the header section
const headerStart = template.indexOf('<header class="header-area');
const headerEnd = template.indexOf('</header>') + '</header>'.length;
const headerSection = template.substring(headerStart, headerEnd);

// Extract the footer section
const footerStart = template.indexOf('<footer class="footer-section">');
const footerEnd = template.indexOf('</footer>') + '</footer>'.length;
const footerSection = template.substring(footerStart, footerEnd);

// Extract scripts from end of body
const scriptsStart = template.indexOf('<!--  Main jQuery  -->');
const scriptsEnd = template.indexOf('</body>');
const scriptsSection = template.substring(scriptsStart, scriptsEnd);

// Create all-destinations.html
const allDestinationsHTML = `<!doctype html>
<html lang="en">

${headSection.replace('<title>Travel Bliss - Uzbekistan Silk Road Tours & Travel Agency</title>', '<title>All Destinations - Travel Bliss</title>')}

<style>
/* All Destinations Page Styles */
.destinations-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 120px 0 80px;
    text-align: center;
    color: white;
    position: relative;
    overflow: hidden;
}

.destinations-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('assets/img/home2/destination-img1.jpg') center/cover;
    opacity: 0.2;
}

.destinations-hero-content {
    position: relative;
    z-index: 2;
}

.destinations-hero h1 {
    font-size: 48px;
    font-weight: 800;
    margin-bottom: 15px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
}

.destinations-hero p {
    font-size: 20px;
    opacity: 0.95;
    max-width: 600px;
    margin: 0 auto;
}

.destinations-section {
    padding: 80px 0;
    background: #f8fafc;
}

.destinations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 30px;
    margin-top: 40px;
}

.destination-card-grid {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    position: relative;
}

.destination-card-grid:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
}

.destination-card-grid .card-image {
    position: relative;
    height: 220px;
    overflow: hidden;
}

.destination-card-grid .card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}

.destination-card-grid:hover .card-image img {
    transform: scale(1.1);
}

.destination-card-grid .card-flag {
    position: absolute;
    top: 15px;
    left: 15px;
    font-size: 28px;
    background: white;
    border-radius: 50%;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
}

.destination-card-grid .trips-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
}

.destination-card-grid .card-content {
    padding: 25px;
}

.destination-card-grid .card-content h3 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 10px;
}

.destination-card-grid .card-content .tagline {
    font-size: 14px;
    color: #667eea;
    font-weight: 600;
    margin-bottom: 12px;
}

.destination-card-grid .card-content p {
    font-size: 15px;
    color: #6b7280;
    line-height: 1.6;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.destination-card-grid .card-info {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
    padding-top: 15px;
    border-top: 1px solid #f3f4f6;
}

.destination-card-grid .card-info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #6b7280;
}

.destination-card-grid .card-info-item i {
    color: #667eea;
}

.destination-card-grid .view-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #667eea;
    font-weight: 600;
    text-decoration: none;
    transition: all 0.3s;
}

.destination-card-grid .view-btn:hover {
    gap: 12px;
    color: #764ba2;
}

.loading-spinner {
    text-align: center;
    padding: 60px;
}

.loading-spinner::after {
    content: '';
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 3px solid #f3f4f6;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.no-destinations {
    text-align: center;
    padding: 60px;
    color: #6b7280;
}

.section-header {
    text-align: center;
    margin-bottom: 20px;
}

.section-header h2 {
    font-size: 36px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 10px;
}

.section-header p {
    font-size: 16px;
    color: #6b7280;
    max-width: 600px;
    margin: 0 auto;
}

/* Filter section */
.filter-section {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    margin-bottom: 30px;
}

.filter-btn {
    padding: 10px 24px;
    border: 2px solid #e5e7eb;
    background: white;
    border-radius: 30px;
    font-size: 14px;
    font-weight: 600;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn:hover,
.filter-btn.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

@media (max-width: 768px) {
    .destinations-hero h1 {
        font-size: 32px;
    }

    .destinations-hero p {
        font-size: 16px;
    }

    .destinations-grid {
        grid-template-columns: 1fr;
    }
}
</style>

<body>
    ${headerSection}

    <!-- Hero Section -->
    <div class="destinations-hero">
        <div class="destinations-hero-content">
            <h1>Explore All Destinations</h1>
            <p>Discover amazing places across Central Asia with our curated travel experiences</p>
        </div>
    </div>

    <!-- Destinations Section -->
    <section class="destinations-section">
        <div class="container">
            <div class="section-header">
                <h2>Our Destinations</h2>
                <p>Choose from our carefully selected destinations and start planning your next adventure</p>
            </div>

            <!-- Filter Buttons -->
            <div class="filter-section">
                <button class="filter-btn active" data-country="all">All Countries</button>
                <button class="filter-btn" data-country="UZ">🇺🇿 Uzbekistan</button>
                <button class="filter-btn" data-country="TJ">🇹🇯 Tajikistan</button>
                <button class="filter-btn" data-country="KZ">🇰🇿 Kazakhstan</button>
                <button class="filter-btn" data-country="KG">🇰🇬 Kyrgyzstan</button>
                <button class="filter-btn" data-country="TM">🇹🇲 Turkmenistan</button>
            </div>

            <!-- Destinations Grid -->
            <div class="destinations-grid" id="destinationsGrid">
                <div class="loading-spinner"></div>
            </div>
        </div>
    </section>

    ${footerSection}

    ${scriptsSection}

    <!-- Load Destinations Script -->
    <script>
        let allDestinations = [];

        async function loadAllDestinations() {
            try {
                const response = await fetch('/api/destinations?status=active&limit=100');
                const data = await response.json();

                if (data.success && data.data.destinations && data.data.destinations.length > 0) {
                    allDestinations = data.data.destinations;
                    displayDestinations(allDestinations);
                } else {
                    document.getElementById('destinationsGrid').innerHTML =
                        '<div class="no-destinations"><h3>No destinations found</h3><p>Please check back later for new destinations.</p></div>';
                }
            } catch (error) {
                console.error('Error loading destinations:', error);
                document.getElementById('destinationsGrid').innerHTML =
                    '<div class="no-destinations"><h3>Error loading destinations</h3><p>Please try again later.</p></div>';
            }
        }

        function displayDestinations(destinations) {
            const grid = document.getElementById('destinationsGrid');

            if (destinations.length === 0) {
                grid.innerHTML = '<div class="no-destinations"><h3>No destinations found</h3><p>Try selecting a different filter.</p></div>';
                return;
            }

            grid.innerHTML = destinations.map(dest => {
                const flag = getCountryFlag(dest.country_code);
                const image = dest.main_image || dest.thumbnail_image || 'assets/img/home2/destination-img1.jpg';
                const trips = dest.trips_count || 0;
                const description = dest.short_description || dest.tagline || 'Discover this amazing destination';
                const tagline = dest.tagline || '';

                return \`
                    <div class="destination-card-grid" data-country="\${dest.country_code || 'UZ'}">
                        <div class="card-image">
                            <img src="\${image}" alt="\${dest.title}" onerror="this.src='assets/img/home2/destination-img1.jpg'">
                            <div class="card-flag">\${flag}</div>
                            <div class="trips-badge">\${trips} Tours</div>
                        </div>
                        <div class="card-content">
                            <h3>\${dest.title}</h3>
                            \${tagline ? \`<div class="tagline">\${tagline}</div>\` : ''}
                            <p>\${description}</p>
                            <div class="card-info">
                                \${dest.capital ? \`<div class="card-info-item"><i class="bi bi-geo-alt"></i> \${dest.capital}</div>\` : ''}
                                \${dest.language ? \`<div class="card-info-item"><i class="bi bi-translate"></i> \${dest.language}</div>\` : ''}
                            </div>
                            <a href="destination-details.html?slug=\${dest.slug}" class="view-btn">
                                Explore Destination
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </a>
                        </div>
                    </div>
                \`;
            }).join('');
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

        // Filter functionality
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Update active state
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const country = this.dataset.country;

                if (country === 'all') {
                    displayDestinations(allDestinations);
                } else {
                    const filtered = allDestinations.filter(d => d.country_code === country);
                    displayDestinations(filtered);
                }
            });
        });

        // Load destinations on page load
        document.addEventListener('DOMContentLoaded', loadAllDestinations);
    </script>
</body>
</html>
`;

fs.writeFileSync('public/gofly/all-destinations.html', allDestinationsHTML);
console.log('all-destinations.html created successfully!');
