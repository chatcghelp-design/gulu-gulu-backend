const { db } = require('../model/index.js');

/**
 * Check and update user level based on total coins spent
 * This function should be called whenever user spends coins
 * @param {string} userId - User ID
 * @param {number} coinsSpent - Coins spent in this transaction
 * @returns {Promise<Object>} - Returns level up info if level increased, null otherwise
 */
exports.checkAndUpdateLevel = async (userId, coinsSpent) => {
    try {
        // Update user's total coins spent
        const user = await db.User.findByIdAndUpdate(
            userId,
            { $inc: { totalCoinsSpent: coinsSpent } },
            { new: true }
        );

        if (!user) {
            return null;
        }

        const newTotalCoinsSpent = user.totalCoinsSpent || 0;
        const currentLevel = user.currentLevel || 1;

        // Get all levels sorted by coin requirement
        const allLevels = await db.Level.find({ isActive: true }).sort({ coinRequirement: 1 });

        // If no levels configured, reset user to level 1
        if (!allLevels || allLevels.length === 0) {
            if (currentLevel > 1) {
                await db.User.findByIdAndUpdate(
                    userId,
                    { $set: { currentLevel: 1 } }
                );
                return {
                    oldLevel: currentLevel,
                    newLevel: 1,
                    totalCoinsSpent: newTotalCoinsSpent
                };
            }
            return null;
        }

        // Find the highest level user can achieve based on coins spent
        let newLevel = 1; // Start from level 1, not currentLevel
        let levelUpInfo = null;

        for (const level of allLevels) {
            if (newTotalCoinsSpent >= level.coinRequirement && level.level > newLevel) {
                newLevel = level.level;
            }
        }

        // If level changed (increased or decreased), update user
        if (newLevel !== currentLevel) {
            await db.User.findByIdAndUpdate(
                userId,
                { $set: { currentLevel: newLevel } }
            );

            levelUpInfo = {
                oldLevel: currentLevel,
                newLevel: newLevel,
                totalCoinsSpent: newTotalCoinsSpent
            };
        }

        return levelUpInfo;
    } catch (error) {
        console.error('Error in checkAndUpdateLevel:', error);
        return null;
    }
};

/**
 * Check and update user level based on current totalCoinsSpent (without incrementing)
 * This function is used when totalCoinsSpent is already updated and we need to sync the level
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Returns level up info if level increased, null otherwise
 */
exports.checkLevelBasedOnTotalSpent = async (userId) => {
    try {
        // Get user with current totalCoinsSpent
        const user = await db.User.findById(userId);
        if (!user) {
            return null;
        }

        const totalCoinsSpent = user.totalCoinsSpent || 0;
        const currentLevel = user.currentLevel || 1;

        // Get all levels sorted by coin requirement
        const allLevels = await db.Level.find({ isActive: true }).sort({ coinRequirement: 1 });

        // If no levels configured, reset user to level 1
        if (!allLevels || allLevels.length === 0) {
            if (currentLevel > 1) {
                await db.User.findByIdAndUpdate(
                    userId,
                    { $set: { currentLevel: 1 } }
                );
                return {
                    oldLevel: currentLevel,
                    newLevel: 1,
                    totalCoinsSpent: totalCoinsSpent
                };
            }
            return null;
        }

        // Find the highest level user can achieve based on coins spent
        let newLevel = 1; // Start from level 1, not currentLevel
        let levelUpInfo = null;

        for (const level of allLevels) {
            if (totalCoinsSpent >= level.coinRequirement && level.level > newLevel) {
                newLevel = level.level;
            }
        }

        // If level changed (increased or decreased), update user
        if (newLevel !== currentLevel) {
            await db.User.findByIdAndUpdate(
                userId,
                { $set: { currentLevel: newLevel } }
            );

            levelUpInfo = {
                oldLevel: currentLevel,
                newLevel: newLevel,
                totalCoinsSpent: totalCoinsSpent
            };
        }

        return levelUpInfo;
    } catch (error) {
        console.error('Error in checkLevelBasedOnTotalSpent:', error);
        return null;
    }
};

