const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const mongoose = require('mongoose');

//get all history by admin
exports.getHistoryByAdmin = async (req, res) => {
    try {
        const { start = 0, limit = 20, roleType, id, historyType } = req.query;
        // roleType = 'user' | 'host'
        // historyType = 'coinHistory' | 'planHistory' | 'callHistory' | 'giftHistory'

        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);

        const isHost = roleType === 'host';
        let matchKey = isHost ? 'hostId' : 'userId';
        let lookupKey = isHost ? 'userId' : 'hostId';
        let coinField = isHost ? 'hostCoin' : 'userCoin';

        // Base match condition
        let matchStage = {
            [matchKey]: new mongoose.Types.ObjectId(id),
            [coinField]: { $gt: 0 }
        };

        // Extra match filtering based on historyType
        if (historyType === 'giftHistory') {
            matchStage.type = 'gift';
        } else if (historyType === 'planHistory') {
            matchStage.type = 'Purchase Plan';
        } else if (historyType === 'callHistory') {
            matchStage.type = { $in: ['Random call', 'Video call', 'Audio call'] };
        }
        // coinHistory will show everything (no extra type filter)

        // Lookup stages
        let lookupStages = [
            {
                $lookup: {
                    from: 'users',
                    localField: lookupKey,
                    foreignField: '_id',
                    as: 'receiver'
                }
            },
            { $unwind: { path: '$receiver', preserveNullAndEmptyArrays: true } }
        ];

        // Additional lookups for gift or plan
        if (historyType === 'giftHistory') {
            lookupStages.push({
                $lookup: {
                    from: 'gifts',
                    localField: 'giftId',
                    foreignField: '_id',
                    as: 'giftInfo'
                }
            });
            lookupStages.push({ $unwind: { path: '$giftInfo', preserveNullAndEmptyArrays: true } });
        }
        if (historyType === 'planHistory') {
            lookupStages.push({
                $lookup: {
                    from: 'coinplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'planInfo'
                }
            });
            lookupStages.push({ $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true } });
        }

        // Dynamic project fields based on historyType
        let projectFields = {
            date: {
                $dateToString: {
                    format: '%Y-%m-%d %H:%M:%S',
                    date: '$createdAt',
                    timezone: 'Asia/Kolkata'
                }
            },
            recevierName: '$receiver.name',
            reciverUniqueId: '$receiver.uniqueId',
            userIsIncome: '$isUserIncome',
            userCoin: '$userCoin',
            hostCoin: '$hostCoin',
            agencyCoin: '$agencyCoin'
        };

        if (historyType === 'coinHistory') {
            projectFields.Description = '$type';
        } else if (historyType === 'giftHistory') {
            projectFields.giftName = '$giftInfo.name';
            projectFields.Description = { $literal: 'gift' };
        } else if (historyType === 'planHistory') {
            projectFields.planName = '$planInfo.name';
            // projectFields.transactionId = '$transactionId';
            // projectFields.paymentMethod = '$paymentMethod';
            projectFields.Description = '$note';

            delete projectFields.hostCoin;
            delete projectFields.agencyCoin;
        } else if (historyType === 'callHistory') {
            projectFields.Description = '$type';
            projectFields.callStartTime = {
                $dateToString: { format: '%H:%M:%S', date: '$callStartTime', timezone: 'Asia/Kolkata' }
            };
            projectFields.callEndTime = {
                $dateToString: { format: '%H:%M:%S', date: '$callEndTime', timezone: 'Asia/Kolkata' }
            };
            projectFields.callDuration = {
                $cond: [
                    { $and: ['$callStartTime', '$callEndTime'] },
                    { $divide: [{ $subtract: ['$callEndTime', '$callStartTime'] }, 1000] },
                    ''
                ]
            };
            projectFields.callCutReason = 1;
        }

        const history = await db.History.aggregate([
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            { $limit: parsedLimit },
            ...lookupStages,
            { $project: projectFields }
        ]);

        return RESPONSE.success(res, 200, 1001, history);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Get Top Up History (Income transactions) by Admin
exports.getTopUpHistoryByAdmin = async (req, res) => {
    try {
        const { start = 0, limit = 20, roleType, id } = req.query;
        // roleType = 'user' | 'host'

        if (!id || !roleType) {
            return RESPONSE.error(res, 400, 9999, 'id and roleType are required');
        }

        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);
        const isHost = roleType === 'host';
        let matchKey, coinField;

        if (isHost) {
            matchKey = 'hostId';
            coinField = 'hostCoin';
        } else {
            matchKey = 'userId';
            coinField = 'userCoin';
        }

        // Top up types: Purchase Plan, Admin Coin, Ad Coins, loginbouns, Chat Refund
        const topUpTypes = ['Purchase Plan', 'Admin Coin', 'Ad Coins', 'loginbouns', 'Chat Refund'];

        const history = await db.History.aggregate([
            {
                $match: {
                    [matchKey]: new mongoose.Types.ObjectId(id),
                    type: { $in: topUpTypes },
                    [coinField]: { $gt: 0 },
                    ...(isHost ? { isHostIncome: true } : { isUserIncome: true })
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            { $limit: parsedLimit },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    note: 1,
                    paymentMethod: 1,
                    transactionId: 1,
                    planId: 1,
                    coin: {
                        $cond: {
                            if: isHost,
                            then: '$hostCoin',
                            else: '$userCoin'
                        }
                    },
                    createdAt: 1,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'
                        }
                    }
                }
            }
        ]);

        return RESPONSE.success(res, 200, 1001, history);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Get Spending History (Expense transactions) by Admin
exports.getSpendingHistoryByAdmin = async (req, res) => {
    try {
        const { start = 0, limit = 20, roleType, id } = req.query;
        // roleType = 'user' | 'host'

        if (!id || !roleType) {
            return RESPONSE.error(res, 400, 9999, 'id and roleType are required');
        }

        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);
        const isHost = roleType === 'host';
        let matchKey, lookupKey, callerKey, coinField;

        if (isHost) {
            matchKey = 'hostId';
            lookupKey = 'userId';
            callerKey = 'host';
            coinField = 'hostCoin';
        } else {
            matchKey = 'userId';
            lookupKey = 'hostId';
            callerKey = 'user';
            coinField = 'userCoin';
        }

        // Spending types: Video call, Audio call, Random call, chat, gift
        const spendingTypes = ['Video call', 'Audio call', 'Random call', 'chat', 'gift'];

        const history = await db.History.aggregate([
            {
                $match: {
                    [matchKey]: new mongoose.Types.ObjectId(id),
                    type: { $in: spendingTypes },
                    [coinField]: { $gt: 0 },
                    ...(isHost ? { isHostIncome: false } : { isUserIncome: false })
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            { $limit: parsedLimit },
            {
                $lookup: {
                    from: 'users',
                    localField: lookupKey,
                    foreignField: '_id',
                    as: 'info'
                }
            },
            { $unwind: { path: '$info', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    callUniqueId: 1,
                    type: 1,
                    note: 1,
                    giftId: 1,
                    giftCount: 1,
                    callConnect: 1,
                    callType: {
                        $cond: [{ $eq: ['$callBy', callerKey] }, 'Outgoing', 'Incoming']
                    },
                    coin: {
                        $cond: {
                            if: isHost,
                            then: '$hostCoin',
                            else: '$userCoin'
                        }
                    },
                    createdAt: 1,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'
                        }
                    },
                    info: {
                        _id: '$info._id',
                        name: '$info.name',
                        avatar: '$info.avatar',
                        currentLevel: '$info.currentLevel',
                        totalCoinsSpent: '$info.totalCoinsSpent'
                    }
                }
            }
        ]);

        return RESPONSE.success(res, 200, 1001, history);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};