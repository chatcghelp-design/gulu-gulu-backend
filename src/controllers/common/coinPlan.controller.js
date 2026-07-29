const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

// Get active coin plans (User) - only active plans ----key true not show plan user
exports.getActiveCoinPlans = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;

        // 1. Get all active plans (ignore isHidden for now)
        let plans = await db.CoinPlan.find({
            isActive: true,
            isDeleted: false
        }).sort({ createdAt: -1 });

        // 2. Identify plans that are hidden (one-time offers)
        const hiddenPlans = plans.filter(p => p.isHidden === true);

        // 3. If there are hidden plans and we have a user, check purchase history
        if (userId && hiddenPlans.length > 0) {
            const hiddenPlanIds = hiddenPlans.map(p => p._id);

            // Find which of these hidden plans the user has already purchased
            const purchasedHiddenPlans = await db.History.distinct('planId', {
                userId: userId,
                type: 'Purchase Plan',
                planId: { $in: hiddenPlanIds }
            });

            // Convert ObjectIds to strings for comparison
            const purchasedIds = purchasedHiddenPlans.map(id => id.toString());

            // Filter out plans that are hidden AND purchased
            plans = plans.filter(plan => {
                if (plan.isHidden) {
                    return !purchasedIds.includes(plan._id.toString());
                }
                return true;
            });
        } else if (!userId) {
          
        }

        return RESPONSE.success(res, 200, 6008, plans);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// key true not show plan all user not only purshes user

// exports.getActiveCoinPlans = async (req, res) => {
//     try {
//         const plans = await db.CoinPlan.find({
//             isActive: true,
//             isDeleted: false
//         }).sort({ createdAt: -1 });

//         return RESPONSE.success(res, 200, 6008, plans);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };


// Purchase coin plan
exports.purchaseCoinPlan = async (req, res) => {
    try {
        const { planId, paymentMethod, transactionId } = req.body;
        const userId = req.user.id;

        // Validate required fields
        if (!planId || !paymentMethod || !transactionId) {
            return RESPONSE.error(res, 400, 6009, 'Plan ID, payment method and transaction ID are required');
        }

        // Check if plan exists and is active
        const plan = await db.CoinPlan.findOne({
            _id: planId,
            isActive: true,
            isDeleted: false
        });

        if (!plan) {
            return RESPONSE.error(res, 404, 6003, 'Coin plan not found or inactive');
        }

        // Verify Cashfree payment
        if (paymentMethod.toLowerCase() === 'cashfree') {
            try {
                const isProduction = process.env.NODE_ENV === 'production';
                const cashfreeUrl = isProduction 
                    ? `https://api.cashfree.com/pg/orders/${transactionId}`
                    : `https://sandbox.cashfree.com/pg/orders/${transactionId}`;
                
                const response = await fetch(cashfreeUrl, {
                    method: 'GET',
                    headers: {
                        'x-client-id': process.env.CASHFREE_CLIENT_ID,
                        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
                        'x-api-version': '2023-08-01'
                    }
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    return RESPONSE.error(res, 400, 6011, `Failed to verify payment: ${errData.message || response.statusText || 'Unknown error'}`);
                }

                const data = await response.json();
                
                if (data.order_status !== 'PAID') {
                    return RESPONSE.error(res, 400, 6012, `Payment not completed. Current status: ${data.order_status}`);
                }
            } catch (err) {
                console.error('Cashfree Verification Error:', err.message);
                return RESPONSE.error(res, 500, 9999, 'Failed to verify payment with Cashfree');
            }
        }

        // Add coins to user account
        const updatedUser = await db.User.findByIdAndUpdate(userId, { $inc: { coins: plan.coins } }, { new: true });

        // Create history record
        await db.History.create({
            userId: userId,
            hostId: null,
            type: 'Purchase Plan',
            userCoin: plan.coins,
            isUserIncome: true,
            note: `Purchased ${plan.name} for ${plan.rupees}₹`,
            planId: planId,
            paymentMethod: paymentMethod,
            transactionId: transactionId
        });

        return RESPONSE.success(res, 200, 6010, {
            message: `Successfully purchased ${plan.name}`,
            coinsAdded: plan.coins,
            totalCoins: updatedUser.coins,
            plan: plan
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
