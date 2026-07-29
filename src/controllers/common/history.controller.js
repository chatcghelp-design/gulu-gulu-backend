const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');
const mongoose = require('mongoose');

exports.getHistory = async (req, res) => {
    try {
        const { start = 0, limit } = req.query;
        const parsedStart = parseInt(start);
        const isHost = req.user.isHost;
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

        const history = await db.History.aggregate([
            {
                $match: {
                    [matchKey]: new mongoose.Types.ObjectId(req.user.id),
                    [coinField]: { $gt: 0 }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            ...(limit ? [{ $limit: parseInt(limit) }] : []),
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
                    paymentMethod: 1,
                    transactionId: 1,
                    callConnect: 1,
                    callType: {
                        $cond: [{ $eq: ['$callBy', callerKey] }, 'Outgoing', 'Incoming']
                    },
                    createdAt: 1,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata' // <-- IST
                        }
                    },
                    coin: {
                        $cond: {
                            if: isHost,
                            then: '$hostCoin',
                            else: '$userCoin'
                        }
                    },
                    isIncome: {
                        $cond: {
                            if: isHost,
                            then: '$isHostIncome',
                            else: '$isUserIncome'
                        }
                    },
                    info: {
                        _id: '$info._id',
                        name: '$info.name',
                        avatar: '$info.avatar',
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

exports.getCallHistory = async (req, res) => {
    try {
        const { start = 0, limit } = req.query;
        const parsedStart = parseInt(start);
        const isHost = req.user.isHost;
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

        const history = await db.History.aggregate([
            {
                $match: {
                    [matchKey]: new mongoose.Types.ObjectId(req.user.id),
                    type: { $in: ['Audio call', 'Video call', 'Random call'] },
                    [coinField]: { $gt: 0 }
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            ...(limit ? [{ $limit: parseInt(limit) }] : []),
            {
                $lookup: {
                    from: 'users',
                    localField: lookupKey,
                    foreignField: '_id',
                    as: 'info'
                }
            },
            { $unwind: { path: '$info', preserveNullAndEmptyArrays: false } },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    callUniqueId: 1,
                    callConnect: 1,
                    callStartTime: 1,
                    callEndTime: 1,
                    callType: {
                        $cond: [{ $eq: ['$callBy', callerKey] }, 'Outgoing', 'Incoming']
                    },
                    callDurationMs: {
                        // "HH:mm"
                        $cond: [
                            { $and: ['$callStartTime', '$callEndTime'] },
                            { $subtract: ['$callEndTime', '$callStartTime'] },
                            null
                        ]
                    },
                    createdAt: 1,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata' // <-- IST
                        }
                    },
                    coin: {
                        $cond: {
                            if: isHost,
                            then: '$hostCoin',
                            else: '$userCoin'
                        }
                    },
                    isIncome: {
                        $cond: {
                            if: isHost,
                            then: '$isHostIncome',
                            else: '$isUserIncome'
                        }
                    },
                    // info: {
                    //     _id: '$info._id',
                    //     name: '$info.name',
                    //     avatar: '$info.avatar'
                    // }
                    info: '$info'
                }
            }
        ]);

        const formatDuration = ms => {
            if (!ms || ms < 0) return '00:00:00';

            const totalSeconds = Math.floor(ms / 1000);
            const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
            const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
            const seconds = String(totalSeconds % 60).padStart(2, '0');

            return `${hours}:${minutes}:${seconds}`;
        };

        const formattedHistory = history.map(item => ({
            ...item,
            callDuration: formatDuration(item.callDurationMs)
        }));

        return RESPONSE.success(res, 200, 1001, formattedHistory);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};


// Get Top Up History (Income transactions)
exports.getTopUpHistory = async (req, res) => {
    try {
        const { start = 0, limit } = req.query;
        const parsedStart = parseInt(start);
        const isHost = req.user.isHost;
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
                    [matchKey]: new mongoose.Types.ObjectId(req.user.id),
                    type: { $in: topUpTypes },
                    [coinField]: { $gt: 0 },
                    ...(isHost ? { isHostIncome: true } : { isUserIncome: true })
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            ...(limit ? [{ $limit: parseInt(limit) }] : []),
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

// Get Spending History (Expense transactions)
exports.getSpendingHistory = async (req, res) => {
    try {
        const { start = 0, limit } = req.query;
        const parsedStart = parseInt(start);
        const isHost = req.user.isHost;
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
                    [matchKey]: new mongoose.Types.ObjectId(req.user.id),
                    type: { $in: spendingTypes },
                    [coinField]: { $gt: 0 },
                    ...(isHost ? { isHostIncome: false } : { isUserIncome: false })
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            ...(limit ? [{ $limit: parseInt(limit) }] : []),
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

exports.getPurchaseHistory = async (req, res) => {
    try {
        const { start = 0, limit } = req.query;
        const parsedStart = parseInt(start);
        const userId = req.user.id;

        // All types where user receives coins
        const topUpTypes = ['Purchase Plan', 'Admin Coin', 'Ad Coins', 'loginbouns', 'Chat Refund'];

        const history = await db.History.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    type: { $in: topUpTypes },
                    // userCoin: { $gt: 0 } 
                }
            },
            { $sort: { createdAt: -1 } },
            { $skip: parsedStart },
            ...(limit ? [{ $limit: parseInt(limit) }] : []),
            {
                $lookup: {
                    from: 'coinplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'planInfo'
                }
            },
            { $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    type: 1,
                    note: 1,
                    paymentMethod: 1,
                    transactionId: 1,
                    coin: '$userCoin',
                    createdAt: 1,
                    date: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'
                        }
                    },
                    planInfo: {
                        _id: '$planInfo._id',
                        name: '$planInfo.name',
                        validity: '$planInfo.validity',
                        price: '$planInfo.price',
                        currency: '$planInfo.currency'
                    }
                }
            }
        ]);

        return RESPONSE.success(res, 200, 1001, history);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};