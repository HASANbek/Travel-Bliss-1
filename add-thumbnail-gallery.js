const fs = require('fs');

// 1. Update travel-agency-03.html - thumbnail priority
let ta03 = fs.readFileSync('public/gofly/travel-agency-03.html', 'utf8');
ta03 = ta03.replace(
    "const image = dest.main_image || dest.thumbnail_image || 'assets/img/home2/destination-img1.jpg';",
    "const image = dest.thumbnail_image || dest.main_image || 'assets/img/home2/destination-img1.jpg';"
);
fs.writeFileSync('public/gofly/travel-agency-03.html', ta03);
console.log('1. travel-agency-03.html updated with thumbnail priority');

// 2. Update all-destinations.html - thumbnail priority
let allDest = fs.readFileSync('public/gofly/all-destinations.html', 'utf8');
allDest = allDest.replace(
    "const image = dest.main_image || dest.thumbnail_image || 'assets/img/home2/destination-img1.jpg';",
    "const image = dest.thumbnail_image || dest.main_image || 'assets/img/home2/destination-img1.jpg';"
);
fs.writeFileSync('public/gofly/all-destinations.html', allDest);
console.log('2. all-destinations.html updated with thumbnail priority');

// 3. Update destination-details.html - add gallery section
let destDetails = fs.readFileSync('public/gofly/destination-details.html', 'utf8');

// Add gallery CSS
const galleryCss = `
        /* Gallery Section */
        .gallery-section {
            padding: 40px 0;
            background: #f8fafc;
        }

        .gallery-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .gallery-item {
            position: relative;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            aspect-ratio: 4/3;
        }

        .gallery-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .gallery-item:hover img {
            transform: scale(1.05);
        }

        .gallery-item::after {
            content: '🔍';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0);
            font-size: 32px;
            transition: transform 0.3s ease;
            pointer-events: none;
        }

        .gallery-item:hover::after {
            transform: translate(-50%, -50%) scale(1);
        }

        /* Lightbox */
        .lightbox {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 9999;
            align-items: center;
            justify-content: center;
        }

        .lightbox.active {
            display: flex;
        }

        .lightbox-content {
            max-width: 90%;
            max-height: 90%;
            position: relative;
        }

        .lightbox-content img {
            max-width: 100%;
            max-height: 85vh;
            border-radius: 8px;
            box-shadow: 0 10px 50px rgba(0,0,0,0.5);
        }

        .lightbox-close {
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 40px;
            color: white;
            cursor: pointer;
            z-index: 10000;
            background: rgba(0,0,0,0.5);
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .lightbox-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            font-size: 50px;
            color: white;
            cursor: pointer;
            padding: 20px;
            background: rgba(0,0,0,0.3);
            border-radius: 8px;
            transition: background 0.3s;
        }

        .lightbox-nav:hover {
            background: rgba(0,0,0,0.6);
        }

        .lightbox-prev {
            left: 20px;
        }

        .lightbox-next {
            right: 20px;
        }

        .lightbox-counter {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 16px;
            background: rgba(0,0,0,0.5);
            padding: 8px 20px;
            border-radius: 20px;
        }
`;

// Add CSS before </style>
destDetails = destDetails.replace('</style>', galleryCss + '\n    </style>');

// Add gallery HTML section - after info-cards section
const galleryHtml = `
    <!-- Gallery Section -->
    <section class="gallery-section" id="gallerySection" style="display: none;">
        <div class="content-container">
            <h2 class="section-title">📸 Photo Gallery</h2>
            <div class="gallery-grid" id="galleryGrid">
                <!-- Gallery images will be loaded here -->
            </div>
        </div>
    </section>
`;

// Find a good place to insert gallery - after info-cards
destDetails = destDetails.replace(
    '</div>\n    </div>\n\n    <!-- About Section -->',
    '</div>\n    </div>\n' + galleryHtml + '\n    <!-- About Section -->'
);

// Add lightbox HTML before </body>
const lightboxHtml = `
    <!-- Lightbox -->
    <div class="lightbox" id="lightbox">
        <span class="lightbox-close" onclick="closeLightbox()">&times;</span>
        <span class="lightbox-nav lightbox-prev" onclick="prevImage()">&#10094;</span>
        <div class="lightbox-content">
            <img id="lightboxImage" src="" alt="Gallery Image">
        </div>
        <span class="lightbox-nav lightbox-next" onclick="nextImage()">&#10095;</span>
        <div class="lightbox-counter"><span id="currentIndex">1</span> / <span id="totalImages">1</span></div>
    </div>

    <script>
        let galleryImages = [];
        let currentImageIndex = 0;

        function displayGallery(images) {
            const section = document.getElementById('gallerySection');
            const grid = document.getElementById('galleryGrid');

            if (!images || images.length === 0) {
                section.style.display = 'none';
                return;
            }

            galleryImages = images;
            section.style.display = 'block';

            grid.innerHTML = images.map((img, index) =>
                '<div class="gallery-item" onclick="openLightbox(' + index + ')">' +
                    '<img src="' + img + '" alt="Gallery image ' + (index + 1) + '" onerror="this.parentElement.style.display=\\'none\\'">' +
                '</div>'
            ).join('');

            document.getElementById('totalImages').textContent = images.length;
        }

        function openLightbox(index) {
            currentImageIndex = index;
            document.getElementById('lightbox').classList.add('active');
            updateLightboxImage();
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            document.getElementById('lightbox').classList.remove('active');
            document.body.style.overflow = 'auto';
        }

        function updateLightboxImage() {
            document.getElementById('lightboxImage').src = galleryImages[currentImageIndex];
            document.getElementById('currentIndex').textContent = currentImageIndex + 1;
        }

        function nextImage() {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            updateLightboxImage();
        }

        function prevImage() {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            updateLightboxImage();
        }

        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (!document.getElementById('lightbox').classList.contains('active')) return;
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        });

        // Close lightbox on background click
        document.getElementById('lightbox').addEventListener('click', function(e) {
            if (e.target === this) closeLightbox();
        });
    </script>
`;

destDetails = destDetails.replace('</body>', lightboxHtml + '\n</body>');

// Update displayDestination function to show gallery
destDetails = destDetails.replace(
    "document.title = (dest.title || 'Destination') + ' - Travel Bliss';",
    "document.title = (dest.title || 'Destination') + ' - Travel Bliss';\n\n            // Gallery\n            if (dest.gallery_images && dest.gallery_images.length > 0) {\n                displayGallery(dest.gallery_images);\n            }"
);

fs.writeFileSync('public/gofly/destination-details.html', destDetails);
console.log('3. destination-details.html updated with gallery section and lightbox');

console.log('\\n✅ All updates completed!');
