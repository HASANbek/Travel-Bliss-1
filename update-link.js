const fs = require('fs');

let html = fs.readFileSync('public/gofly/travel-agency-03.html', 'utf8');

// Update the "See all destinations" link
html = html.replace(
    '<a href="destination-details.html" class="see-all-link">',
    '<a href="all-destinations.html" class="see-all-link">'
);

fs.writeFileSync('public/gofly/travel-agency-03.html', html);
console.log('Link updated successfully!');
