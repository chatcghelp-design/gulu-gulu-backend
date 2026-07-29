const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getWithdrawList = async (req, res) => {
    try {
        const { role, agency } = req; // type = agency host
        if (role !== 'admin' && role !== 'agency') {
            return RESPONSE.error(res, 403, '', 'Access denied');
        }

        const { status, page = 1, limit = 10, search = '', type } = req.query;
        const skip = (page - 1) * limit;

        const userFilter = { isHost: true };
        const withdrawFilter = {};

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { uniqueId: { $regex: search, $options: 'i' } }
            ];
        }
        if (type == 'host') {
            if (role === 'agency') {
                userFilter['hostProfile.agencyId'] = agency.id;
            }

            const users = await db.User.find(userFilter);
            const userIds = users.map(u => u._id);

            withdrawFilter.hostId = { $in: userIds };
        } else {
            // type agency
            if (role === 'agency') {
                withdrawFilter.agencyId = agency.id;
            }
        }
        if (status) {
            withdrawFilter.status = status;
        }
        withdrawFilter.type = type;

        // 2. Get withdrawals with filters
        const withdrawals = await db.WithdrawRequest.find(withdrawFilter)
            .populate([
                { path: 'hostId', select: 'name uniqueId avatar email' },
                { path: 'agencyId', select: 'name image code email' } // Replace with your actual fields
            ])
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        return RESPONSE.success(res, 200, 1209, withdrawals);
    } catch (err) {
        console.error('Error fetching withdrawals:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};

exports.handaleWithdrawRequest = async (req, res) => {
    try {
        const { withdrawId } = req.params;
        const { type } = req.query; // 2: accept, 3: decline
        const { reason } = req.body;

        if (!withdrawId) {
            return RESPONSE.error(res, 400, 1208);
        }

        const withdraw = await db.WithdrawRequest.findOne({ _id: withdrawId });
        if (!withdraw) {
            return RESPONSE.error(res, 404, 1202);
        }
        if (withdraw.status == 2 || withdraw.status == 3) {
            return RESPONSE.error(res, 400, 1206, 'Withdraw request already processed');
        }
        if (req.role == 'agency' && withdraw.type == 'agency') {
            return RESPONSE.error(res, 403, 'Access denied');
        }
        let user;
        if (withdraw.type == 'host') {
            user = await db.User.findById(withdraw.hostId);
            if (!user) {
                return RESPONSE.error(res, 404, 3012);
            }
        } else {
            user = await db.Agency.findById(withdraw.agencyId);
            if (!user) {
                return RESPONSE.error(res, 404, 1101);
            }
        }

        const coins = withdraw.coins;

        if (type == 2) {
            if (user.pendingWithdrwCoins < coins) {
                user.withdrawCoins += user.pendingWithdrwCoins;
                user.pendingWithdrwCoins = 0;
            } else {
                user.withdrawCoins += coins;
                user.pendingWithdrwCoins -= coins;
            }
            // Removed: withdraw.withdrawRs = coins / 100; as it overwrites the frontend's saved value
        } else if (type == 3) {
            console.log('reason', reason);

            user.pendingWithdrwCoins -= coins;
            user.coins += coins;
            withdraw.reason = reason;
        }

        withdraw.status = Number(type);
        console.log('type', type);

        withdraw.acceptDeclineDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

        await user.save();
        await withdraw.save();

        const responseCode = Number(type) === 2 ? 1205 : 1206;
        return RESPONSE.success(res, 200, responseCode, withdraw);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
