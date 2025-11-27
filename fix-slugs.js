const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-bliss').then(async () => {
  const Tour = require('./src/models/Tour.model');
  const Destination = require('./src/models/Destination.model');

  // 1. Generate slugs for all tours using save() which triggers pre-save hook
  const tours = await Tour.find({});
  console.log('Updating tour slugs...');
  for (const tour of tours) {
    if (!tour.slug) {
      await tour.save(); // This triggers the pre-save hook
      console.log('  Updated: ' + tour.title + ' -> ' + tour.slug);
    } else {
      console.log('  Already has slug: ' + tour.title + ' -> ' + tour.slug);
    }
  }

  // 2. Reload tours to get updated slugs
  const updatedTours = await Tour.find({});
  const tourMap = {};
  updatedTours.forEach(t => {
    tourMap[t.title] = t.slug;
  });
  console.log('\nTour map:', tourMap);

  // 3. Update destination popular_places with tour_slug
  const destinations = await Destination.find({});
  console.log('\nUpdating destination popular_places...');
  for (const dest of destinations) {
    if (dest.popular_places && dest.popular_places.length > 0) {
      let updated = false;
      dest.popular_places.forEach(place => {
        if (tourMap[place.title] && !place.tour_slug) {
          place.tour_slug = tourMap[place.title];
          updated = true;
          console.log('  ' + dest.title + ': ' + place.title + ' -> ' + place.tour_slug);
        }
      });
      if (updated) {
        await dest.save();
      }
    }
  }

  console.log('\nDone!');
  await mongoose.disconnect();
}).catch(e => console.error(e));
