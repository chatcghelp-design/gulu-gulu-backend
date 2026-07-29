require('dotenv').config();
require('./middleware/database/connectDatabase.js');
const { db } = require('./src/model/index.js');

async function fixOldImages() {
    try {
        console.log("Starting migration for old host images...");
        
        // Find all approved host requests
        const approvedRequests = await db.HostRequest.find({ hostStatus: 'approved' });
        console.log(`Found ${approvedRequests.length} approved host requests.`);
        
        let updatedCount = 0;
        let totalInsertedImages = 0;
        
        for (const req of approvedRequests) {
            const userId = req.userId;
            
            // Find existing images for the user
            const existingImages = await db.Image.find({ userId, isDeleted: false });
            const existingImagePaths = existingImages.map(img => img.image);
            
            if (req.image && req.image.length > 0) {
                // Only insert images that are not already in the Image collection
                const imagesToInsert = req.image
                    .filter(imgPath => !existingImagePaths.includes(imgPath))
                    .map(imgPath => ({
                        userId: userId,
                        image: imgPath,
                        imageType: 1
                    }));
                
                if (imagesToInsert.length > 0) {
                    await db.Image.insertMany(imagesToInsert);
                    updatedCount++;
                    totalInsertedImages += imagesToInsert.length;
                    console.log(`Inserted ${imagesToInsert.length} images for user ${userId}`);
                }
            }
        }
        
        console.log(`Migration completed successfully! Updated ${updatedCount} hosts with ${totalInsertedImages} missing images.`);
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}

// Give DB a second to connect
setTimeout(fixOldImages, 2000);
