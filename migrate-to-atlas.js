/**
 * Migration script: Local MongoDB -> MongoDB Atlas
 * Bu script lokal bazadagi barcha ma'lumotlarni Atlas ga ko'chiradi
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connection strings
const LOCAL_URI = 'mongodb://localhost:27017/travel-bliss';
const ATLAS_URI = 'mongodb+srv://hmuzaffarov02_db_user:hM%4019920206@travelblisstest.2lhidka.mongodb.net/travel-bliss?retryWrites=true&w=majority';

async function migrate() {
    console.log('🚀 Migration boshlandi...\n');

    // Connect to local MongoDB
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Lokal MongoDB ga ulandi');

    // Connect to Atlas
    const atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('✅ MongoDB Atlas ga ulandi\n');

    // Get all collections from local
    const collections = await localConn.db.listCollections().toArray();
    console.log(`📦 ${collections.length} ta collection topildi:\n`);

    for (const collInfo of collections) {
        const collName = collInfo.name;

        try {
            // Get all documents from local
            const localDocs = await localConn.db.collection(collName).find({}).toArray();

            if (localDocs.length === 0) {
                console.log(`   ⏭️  ${collName}: bo'sh, o'tkazib yuborildi`);
                continue;
            }

            // Clear existing data in Atlas (optional)
            await atlasConn.db.collection(collName).deleteMany({});

            // Insert to Atlas
            await atlasConn.db.collection(collName).insertMany(localDocs);
            console.log(`   ✅ ${collName}: ${localDocs.length} ta document ko'chirildi`);
        } catch (error) {
            console.log(`   ❌ ${collName}: xatolik - ${error.message}`);
        }
    }

    console.log('\n🎉 Migration yakunlandi!');

    // Close connections
    await localConn.close();
    await atlasConn.close();

    console.log('✅ Ulanishlar yopildi');
    process.exit(0);
}

migrate().catch(err => {
    console.error('❌ Migration xatosi:', err.message);
    process.exit(1);
});
