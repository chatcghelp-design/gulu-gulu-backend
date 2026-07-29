const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { dateFilterFunc } = require('../../../utils/function.js');

// Create new coin plan
exports.createCoinPlan = async (req, res) => {
    try {
        const { name, coins, rupees, dollars, description, productId, offer, isHidden } = req.body;

        const coinPlan = await db.CoinPlan.create({
            name,
            coins,
            productId,
            rupees,
            dollars,
            description,
            offer,
            isHidden
        });

        return RESPONSE.success(res, 201, 6001, coinPlan);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Update coin plan by ID
exports.updateCoinPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, coins, rupees, dollars, description, isActive, isDeleted, productId, offer, isHidden } = req.body;

        // Check if plan exists
        const existingPlan = await db.CoinPlan.findById(id);
        if (!existingPlan) {
            return RESPONSE.error(res, 404, 6003, 'Coin plan not found');
        }

        // Update plan
        const updatedPlan = await db.CoinPlan.findByIdAndUpdate(
            id,
            {
                ...(name && { name }),
                ...(coins !== undefined && { coins }),
                ...(productId && { productId }),
                ...(rupees !== undefined && { rupees }),
                ...(dollars !== undefined && { dollars }),
                ...(description && { description }),
                ...(offer !== undefined && { offer }),
                ...(isHidden !== undefined && { isHidden }),
                ...(isHidden !== undefined && { isHidden }),
                ...(isActive !== undefined && { isActive }),
                ...(isDeleted !== undefined && { isDeleted })
            },
            { new: true, runValidators: true }
        );

        return RESPONSE.success(res, 200, 6002, updatedPlan);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Get all coin plans (Admin) - active + inactive but not deleted
exports.getAllCoinPlans = async (req, res) => {
    try {
        const plans = await db.CoinPlan.find({ isDeleted: false }).sort({ createdAt: -1 });

        return RESPONSE.success(res, 200, 6007, plans);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Get active coin plans (User) - only active plans
exports.getActiveCoinPlans = async (req, res) => {
    try {
        const plans = await db.CoinPlan.find({
            isActive: true,
            isDeleted: false,
            isHidden: { $ne: true }
        }).sort({ createdAt: -1 });

        return RESPONSE.success(res, 200, 6008, plans);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// Get list of plan purchase transactions (History style) with pagination details
exports.getUsersWhoPurchasedPlans = async (req, res) => {
    try {
        const start = parseInt(req.query.start) || 0;
        const limit = parseInt(req.query.limit) || 20;
        const startDate = req.query.startDate || 'All';
        const endDate = req.query.endDate || 'All';
        const dateFilter = dateFilterFunc(startDate, endDate);

        // Get total count of records
        const total = await db.History.countDocuments({
            type: 'Purchase Plan',
            ...(dateFilter ? { createdAt: dateFilter } : {})
        });

        // Get total amount of all purchases
        const totalAmountAgg = await db.History.aggregate([
            {
                $match: {
                    type: 'Purchase Plan',
                    ...(dateFilter ? { createdAt: dateFilter } : {})
                }
            },
            {
                $lookup: {
                    from: 'coinplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$plan.rupees' }
                }
            }
        ]);
        const totalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].totalAmount : 0;

        const history = await db.History.aggregate([
            {
                $match: {
                    type: 'Purchase Plan',
                    ...(dateFilter ? { createdAt: dateFilter } : {})
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: start
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: 'coinplans',
                    localField: 'planId',
                    foreignField: '_id',
                    as: 'plan'
                }
            },
            {
                $unwind: '$plan'
            },
            {
                $project: {
                    _id: 0,
                    userName: '$user.name',
                    uniqueId: '$user.uniqueId',
                    email: '$user.email',
                    avatar: '$user.avatar',
                    country: '$user.country',
                    planName: '$plan.name',
                    purchaseDate: {
                        $dateToString: {
                            format: '%Y-%m-%d %H:%M:%S',
                            date: '$createdAt',
                            timezone: 'Asia/Kolkata'
                        }
                    },
                    coins: '$userCoin',
                    price: '$plan.rupees'
                }
            }
        ]);

        return RESPONSE.success(res, 200, 6012, {
            total: total,
            totalAmount: totalAmount,
            limit: limit,
            start: start,
            totalPage: Math.ceil(total / limit),
            data: history
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
