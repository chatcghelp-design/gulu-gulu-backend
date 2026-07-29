const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

/**
 * Delete User Account
 * Soft delete - marks user as deleted instead of removing from database
 */
exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.user.id;

        // Find user
        const user = await db.User.findOne({ _id: userId, isDeleted: false });

        if (!user) {
            return RESPONSE.error(res, 404, 'User not found or already deleted');
        }

        // Soft delete - mark as deleted
        user.isDeleted = true;
        user.isOnline = false;
        user.isBusy = false;
        user.fcmToken = ''; // Clear FCM token

        // Rename identity and email to free them up for new registration
        if (user.identity) {
            user.identity = `deleted_${Date.now()}_${user.identity}`;
        }
        if (user.email) {
            user.email = `deleted_${Date.now()}_${user.email}`;
        }
        
        await user.save();

        // Delete any active calls
        await db.Call.deleteMany({
            $or: [
                { userId: userId },
                { hostId: userId }
            ]
        });

        // Mark histories as deleted (optional - for data retention)
        await db.History.updateMany(
            {
                $or: [
                    { userId: userId },
                    { hostId: userId }
                ]
            },
            {
                $set: { isDeleted: true }
            }
        );

        return RESPONSE.success(res, 200, 'Account deleted successfully', {
            message: 'Your account has been deleted. You can no longer access this account.'
        });

    } catch (err) {
        console.error('Error in deleteAccount:', err);
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};


