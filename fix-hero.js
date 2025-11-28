const fs = require('fs');

let html = fs.readFileSync('public/gofly/destination-details.html', 'utf8');

// Fix hero section CSS
html = html.replace('.dest-hero-section {', '.hero-section {');
html = html.replace('.dest-hero-content {', '.hero-content {');
html = html.replace('.dest-hero-title {', '.hero-title {');
html = html.replace('.dest-hero-subtitle {', '.hero-subtitle {');

// Update hero section styles
const oldHeroStyle = `.hero-section {
            position: relative;
            height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            overflow: hidden;
        }`;

const newHeroStyle = `.hero-section {
            position: relative;
            height: 500px;
            min-height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            overflow: hidden;
            margin-top: 0;
        }

        .hero-section .hero-content {
            text-align: center;
            z-index: 2;
            padding: 20px;
        }

        .hero-section .hero-title,
        .hero-section #destinationName {
            font-size: 56px;
            font-weight: 800;
            margin-bottom: 15px;
            color: white !important;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .hero-section .hero-subtitle,
        .hero-section #destinationTagline {
            font-size: 22px;
            opacity: 0.95;
            color: white !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
        }`;

html = html.replace(oldHeroStyle, newHeroStyle);

// Also fix if there's dest-hero-section in style
html = html.replace(/\.dest-hero-/g, '.hero-');

fs.writeFileSync('public/gofly/destination-details.html', html);
console.log('Hero section fixed!');
