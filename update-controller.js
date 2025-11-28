const fs = require('fs');
const path = 'src/controllers/destination.controller.js';
let content = fs.readFileSync(path, 'utf8');

// Add new fields to createDestination
const createOld = `latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    seo: {`;
const createNew = `latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    // New fields
    tagline: req.body.tagline || '',
    capital: req.body.capital || 'Tashkent',
    currency: req.body.currency || 'UZS (Som)',
    language: req.body.language || 'Uzbek, Russian',
    popular_places: req.body.popular_places || [],
    seasons: req.body.seasons || [],
    faqs: req.body.faqs || [],
    seo: {`;

content = content.replace(createOld, createNew);

// Add new fields to updateDestination
const updateOld = `// SEO
  if (req.body.seo !== undefined) updateData.seo = req.body.seo;`;
const updateNew = `// New fields
  if (req.body.tagline !== undefined) updateData.tagline = req.body.tagline;
  if (req.body.capital !== undefined) updateData.capital = req.body.capital;
  if (req.body.currency !== undefined) updateData.currency = req.body.currency;
  if (req.body.language !== undefined) updateData.language = req.body.language;
  if (req.body.popular_places !== undefined) updateData.popular_places = req.body.popular_places;
  if (req.body.seasons !== undefined) updateData.seasons = req.body.seasons;
  if (req.body.faqs !== undefined) updateData.faqs = req.body.faqs;

  // SEO
  if (req.body.seo !== undefined) updateData.seo = req.body.seo;`;

content = content.replace(updateOld, updateNew);

fs.writeFileSync(path, content);
console.log('Controller updated successfully');
