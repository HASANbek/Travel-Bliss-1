const fs = require('fs');

// Fix admin index.html
let adminHtml = fs.readFileSync('public/admin/index.html', 'utf8');
adminHtml = adminHtml.replace(/https:\/\/via\.placeholder\.com\/60x40\?text=No\+Image/g, 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"%3E%3Crect fill="%23e5e7eb" width="60" height="40"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="8" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E');
fs.writeFileSync('public/admin/index.html', adminHtml);

// Fix destinations.js
let destJs = fs.readFileSync('public/admin/destinations.js', 'utf8');
destJs = destJs.replace(/https:\/\/via\.placeholder\.com\/60x40\?text=No\+Image/g, 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 60 40"%3E%3Crect fill="%23e5e7eb" width="60" height="40"/%3E%3Ctext fill="%239ca3af" font-family="Arial" font-size="8" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E');
fs.writeFileSync('public/admin/destinations.js', destJs);

console.log('Placeholder images fixed with inline SVG!');
