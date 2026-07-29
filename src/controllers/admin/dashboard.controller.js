const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { dateFilterFunc } = require('../../../utils/function.js');

exports.getDashboard = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const dateFilter = dateFilterFunc(startDate, endDate);

        // const today = new Date();
        // today.setHours(0, 0, 0, 0);
        // const tomorrow = new Date(today);
        // tomorrow.setDate(today.getDate() + 1);

        const [user, activeUser, agency, hostRequest, chartData, planPurchaseStats, revenueChartData] = await Promise.all([
            db.User.find({
                isDeleted: false,
                ...(dateFilter ? { createdAt: dateFilter } : {})
            }).select('isHost isFake isBlocked createdAt updatedAt isOnline'),

            db.User.find({ isDeleted: false, ...(dateFilter ? { updatedAt: dateFilter } : {}) }).select(
                'isHost isFake updatedAt'
            ),

            db.Agency.find({ ...(dateFilter ? { createdAt: dateFilter } : {}) }).select('isDisable'),

            db.HostRequest.countDocuments({
                hostStatus: 'pending',
                ...(dateFilter ? { createdAt: dateFilter } : {})
            }),

            db.User.aggregate([
                { $match: { isDeleted: false, isFake: false, ...(dateFilter ? { createdAt: dateFilter } : {}) } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                            isHost: '$isHost'
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ]),

            db.History.aggregate([
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
            ]),
            
            db.History.aggregate([
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
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        totalAmount: { $sum: '$plan.rupees' }
                    }
                },
                { $sort: { '_id': 1 } }
            ])
        ]);

        const data = {
            totalUsers: user.filter(u => u.isHost === false && u.isFake === false).length,
            totalHosts: user.filter(u => u.isHost === true && u.isFake === false).length,
            totalFakeHosts: user.filter(u => u.isHost === true && u.isFake === true).length,

            totalBlockedUsers: user.filter(u => u.isHost === false && u.isBlocked === true && u.isFake === false)
                .length,
            totalBlockedHosts: user.filter(u => u.isHost === true && u.isBlocked === true && u.isFake === false).length,
            totalBlockedFakeHosts: user.filter(u => u.isHost === true && u.isBlocked === true && u.isFake === true)
                .length,

            totalActiveUsers: activeUser.filter(user => user.isHost == false).length,
            totalActiveHosts: activeUser.filter(user => user.isHost == true).length,

            totalAgencies: agency.filter(a => a.isDisable === false).length,
            totalDisableAgencies: agency.filter(a => a.isDisable === true).length,

            totalPendingHosts: hostRequest || 0,

            totalPlanPurchaseAmount: planPurchaseStats[0]?.totalAmount || 0
        };

        const totalUsersChart = [];
        const totalHostsChart = [];
        const dailyRevenueChart = [];

        chartData.forEach(item => {
            const obj = { _id: item._id.date, count: item.count };
            if (item._id.isHost) {
                totalHostsChart.push(obj);
            } else {
                totalUsersChart.push(obj);
            }
        });
        
        revenueChartData.forEach(item => {
            dailyRevenueChart.push({
                _id: item._id,
                amount: item.totalAmount
            });
        });

        const chart = { totalUsers: totalUsersChart, totalHosts: totalHostsChart, dailyRevenue: dailyRevenueChart };

        return RESPONSE.success(res, 200, 1001, { data, chart });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
