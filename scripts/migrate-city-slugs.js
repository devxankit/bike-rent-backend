const mongoose = require('mongoose');
const CityPage = require('../models/CityPage');

// MongoDB connection string - update with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bike-rental';

// Function to generate new slug format
function generateNewSlug(name) {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `bike-rent-in-${cleanName}`;
}

// Function to check if slug is old format
function isOldFormat(slug) {
  return slug.includes('-rent-bike-in-') && !slug.startsWith('bike-rent-in-');
}

async function migrateCitySlugs() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Find all city pages with old slug format
    const cityPages = await CityPage.find({});
    console.log(`Found ${cityPages.length} city pages`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const cityPage of cityPages) {
      if (isOldFormat(cityPage.slug)) {
        const oldSlug = cityPage.slug;
        const newSlug = generateNewSlug(cityPage.name);
        
        console.log(`Migrating: ${cityPage.name}`);
        console.log(`  Old slug: ${oldSlug}`);
        console.log(`  New slug: ${newSlug}`);

        // Check if new slug already exists
        const existingWithNewSlug = await CityPage.findOne({ slug: newSlug, _id: { $ne: cityPage._id } });
        
        if (existingWithNewSlug) {
          console.log(`  ⚠️  Skipping - new slug already exists for another city`);
          skippedCount++;
          continue;
        }

        // Update the slug
        await CityPage.findByIdAndUpdate(cityPage._id, { slug: newSlug });
        console.log(`  ✅ Updated successfully`);
        migratedCount++;
      } else {
        console.log(`Skipping ${cityPage.name} - already using new format or unrecognized format`);
        skippedCount++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  Total city pages: ${cityPages.length}`);
    console.log(`  Migrated: ${migratedCount}`);
    console.log(`  Skipped: ${skippedCount}`);
    console.log('\n✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Check if this script is being run directly
if (require.main === module) {
  migrateCitySlugs();
}

module.exports = { migrateCitySlugs, generateNewSlug, isOldFormat };
