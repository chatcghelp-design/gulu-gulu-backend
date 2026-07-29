const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.getAllUser = async (req, res) => {
    try {
        const { search = '' } = req.query;
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;

        const baseQuery = {
            isDeleted: false,
            isHost: false,
            name: { $ne: '' }
        };

        if (search.trim()) {
            baseQuery.$or = [
                { uniqueId: { $regex: search.trim(), $options: 'i' } },
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        const [total, users] = await Promise.all([
            db.User.countDocuments(baseQuery),
            db.User.find(baseQuery).skip(start).limit(limit).sort({ createdAt: -1 })
        ]);

        return RESPONSE.success(res, 200, 1001, {
            total: total,
            limit: limit,
            start: start,
            totalPage: Math.ceil(total / limit),
            data: users
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return RESPONSE.error(res, 400, 3001, 'User ID is required');
        }

        const user = await db.User.findOne({ _id: userId, isDeleted: false });

        if (!user) {
            return RESPONSE.error(res, 404, 3002, 'User not found');
        }

        return RESPONSE.success(res, 200, 1001, user);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

//coin update by admin
exports.coinByAdmin = async (req, res) => {
    try {
        const { id, coins } = req.query;
        const user = await db.User.findById(id);
        if (!user) {
            return RESPONSE.error(res, 404, 3010);
        }
        const updatedCoin = Number(coins) - user.coins;
        user.coins = coins;
        await user.save();

        db.History.create({
            userId: id,
            type: 'Admin Coin',
            // remove minus plus sign
            userCoin: Math.abs(updatedCoin),
            isUserIncome: updatedCoin < 0 ? false : true
        });

        return RESPONSE.success(res, 200, 1001, { coin: user.coins, updatedCoin });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.updateHostAvailability = async (req, res) => {
    try {
        const hostId = req.user.id;
        const { availableForRandomCall, availableForVideoCall, availableForAudioCall } = req.body;

        const host = await db.User.findById(hostId);
        if (!host) {
            return RESPONSE.error(res, 404, 'Host Not Found');
        }

        // Initialize hostProfile if it doesn't exist
        if (!host.hostProfile) {
            host.hostProfile = {};
        }

        // Helper to parse boolean inputs (handles 'true', 'false', true, false)
        const parseBool = (val, defaultVal) => {
            if (val === undefined) return defaultVal;
            if (val === 'false' || val === false || val === '0' || val === 0) return false;
            return true;
        };

        // Update availability fields - default to true if not provided
        host.hostProfile.availableForRandomCall = parseBool(availableForRandomCall, host.hostProfile.availableForRandomCall ?? true);
        host.hostProfile.availableForVideoCall = parseBool(availableForVideoCall, host.hostProfile.availableForVideoCall ?? true);
        host.hostProfile.availableForAudioCall = parseBool(availableForAudioCall, host.hostProfile.availableForAudioCall ?? true);

        // Mark hostProfile as modified to ensure Mongoose saves nested changes
        host.markModified('hostProfile');
        await host.save();


        return RESPONSE.success(res, 200, 'Availability updated successfully', {
            availableForRandomCall: host.hostProfile.availableForRandomCall,
            availableForVideoCall: host.hostProfile.availableForVideoCall,
            availableForAudioCall: host.hostProfile.availableForAudioCall
        });
    } catch (error) {
        return RESPONSE.error(res, 500, 'Something went wrong', error.message);
    }
};

exports.refundChatCoins = async (req, res) => {
    try {
        const { userId, coins } = req.body;

        if (!userId || !coins) {
            return RESPONSE.error(res, 400, 3001, 'User ID and coins are required');
        }

        const user = await db.User.findById(userId);
        if (!user) {
            return RESPONSE.error(res, 404, 3010, 'User not found');
        }

        // Add coins to existing balance
        const refundAmount = parseInt(coins);
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return RESPONSE.error(res, 400, 3001, 'Invalid coin amount');
        }

        user.coins += refundAmount;
        await user.save();

        // Create history entry
        await db.History.create({
            userId: userId,
            type: 'Chat Refund',
            userCoin: refundAmount,
            isUserIncome: true,
            date: new Date()
        });

        return RESPONSE.success(res, 200, 1001, {
            message: 'Refund successful',
            totalCoins: user.coins,
            refundedAmount: refundAmount
        });
    } catch (err) {
        console.error("Refund error:", err);
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
