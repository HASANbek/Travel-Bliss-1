const fs = require('fs');

// Read travel-agency-03.html
const ta03 = fs.readFileSync('public/gofly/travel-agency-03.html', 'utf8');

// Extract style section
const styleStart = ta03.indexOf('<style>');
const styleEnd = ta03.indexOf('</style>') + '</style>'.length;
const ta03Styles = ta03.substring(styleStart, styleEnd);

// Extract header HTML
const headerStart = ta03.indexOf('<header class="header-area style-2 travel-agency3">');
const headerEnd = ta03.indexOf('</header>') + '</header>'.length;
const headerHtml = ta03.substring(headerStart, headerEnd);

console.log('Style length:', ta03Styles.length);
console.log('Header length:', headerHtml.length);

// Read destination-details.html
let destHtml = fs.readFileSync('public/gofly/destination-details.html', 'utf8');

// Custom styles for destination page
const destStyles = `
        /* Hero Section */
        .dest-hero-section {
            position: relative;
            height: 500px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            overflow: hidden;
        }

        .dest-hero-content {
            text-align: center;
            z-index: 2;
        }

        .dest-hero-title {
            font-size: 56px;
            font-weight: 800;
            margin-bottom: 15px;
        }

        .dest-hero-subtitle {
            font-size: 20px;
            opacity: 0.9;
        }

        .info-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: -50px;
            margin-bottom: 60px;
            position: relative;
            z-index: 10;
        }

        .info-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            text-align: center;
        }

        .info-card-icon { font-size: 36px; margin-bottom: 10px; }
        .info-card-label { font-size: 13px; color: #6b7280; text-transform: uppercase; font-weight: 600; margin-bottom: 5px; }
        .info-card-value { font-size: 18px; font-weight: 700; color: #1f2937; }
        .section-title { font-size: 32px; font-weight: 700; margin-bottom: 30px; color: #1f2937; }
        .destination-description { font-size: 16px; line-height: 1.8; color: #4b5563; margin-bottom: 50px; }

        .place-card { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.3s; height: 100%; }
        .place-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(0,0,0,0.15); }
        .place-image { width: 100%; height: 200px; object-fit: cover; }
        .place-content { padding: 20px; }
        .place-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; color: #1f2937; }
        .place-description { font-size: 14px; color: #6b7280; margin-bottom: 15px; }
        .map-link { display: inline-flex; align-items: center; gap: 6px; color: #667eea; text-decoration: none; font-weight: 600; font-size: 14px; }

        .feature-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; height: 100%; }
        .feature-icon { font-size: 48px; margin-bottom: 15px; }
        .feature-title { font-size: 22px; font-weight: 700; margin-bottom: 10px; }
        .feature-description { font-size: 14px; opacity: 0.9; }

        .season-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin-bottom: 20px; }
        .season-header { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .season-icon { font-size: 42px; }
        .season-title { font-size: 24px; font-weight: 700; color: #1f2937; }
        .season-weather { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
        .season-description { font-size: 15px; color: #4b5563; }

        .faq-item { background: white; padding: 20px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .faq-question { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 10px; }
        .faq-answer { font-size: 15px; color: #6b7280; line-height: 1.6; }

        .tour-card-dest { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08); transition: transform 0.3s; }
        .tour-card-dest:hover { transform: translateY(-5px); }
        .tour-image { width: 100%; height: 220px; object-fit: cover; }
        .tour-content-dest { padding: 20px; }
        .tour-title-dest { font-size: 20px; font-weight: 700; margin-bottom: 15px; color: #1f2937; }
        .tour-meta { display: flex; gap: 15px; margin-bottom: 15px; font-size: 14px; color: #6b7280; }
        .tour-price { font-size: 28px; font-weight: 800; color: #667eea; margin-bottom: 15px; }
        .book-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }

        .content-container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        .section-spacing { margin-bottom: 80px; }
`;

// Combine styles
const combinedStyles = ta03Styles.replace('</style>', destStyles + '\n</style>');

// Replace style in destination html
const destStyleStart = destHtml.indexOf('<style>');
const destStyleEnd = destHtml.indexOf('</style>') + '</style>'.length;
const beforeStyle = destHtml.substring(0, destStyleStart);
const afterStyle = destHtml.substring(destStyleEnd);
destHtml = beforeStyle + combinedStyles + afterStyle;

// Replace header
const oldHeaderStart = destHtml.indexOf('<!-- header Section Start-->');
const oldHeaderEnd = destHtml.indexOf('<!-- header Section End-->');

if (oldHeaderStart !== -1 && oldHeaderEnd !== -1) {
    const oldHeaderEndFull = oldHeaderEnd + '<!-- header Section End-->'.length;
    const beforeH = destHtml.substring(0, oldHeaderStart);
    const afterH = destHtml.substring(oldHeaderEndFull);
    destHtml = beforeH + '<!-- header Section Start-->\n    ' + headerHtml + '\n    <!-- header Section End-->' + afterH;
    console.log('Header replaced');
} else {
    console.log('Header markers not found');
}

fs.writeFileSync('public/gofly/destination-details.html', destHtml);
console.log('Done!');
