const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { dateFilterFunc } = require('../../../utils/function.js');

exports.getDashboardAgency = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const agencyId = req.agency.id;

        const agency = await db.Agency.findOne({ _id: agencyId, isDisable: false });
        if (!agency) return RESPONSE.error(res, 404, 1101);

        const dateFilter = dateFilterFunc(startDate, endDate);

        // aaj ke din ki range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [host, todayActiveHosts, hostRequest, chartData] = await Promise.all([
            // All hosts under this agency (total absolute count, ignoring date filter, excluding fake hosts)
            db.User.find({
                'hostProfile.agencyId': agencyId,
                isHost: true,
                isDeleted: false,
                isFake: { $ne: true }
            }).select('isBlocked'),

            // ✅ Only today's active hosts
            db.User.countDocuments({
                'hostProfile.agencyId': agencyId,
                isHost: true,
                isOnline: true,
                updatedAt: { $gte: today, $lt: tomorrow } // aaj active
            }),

            db.HostRequest.find({
                hostStatus: 'pending',
                agencyCode: agency.code,
                ...(dateFilter ? { createdAt: dateFilter } : {})
            }),

            db.User.aggregate([
                { $match: { isDeleted: false, isHost: true, ...(dateFilter ? { createdAt: dateFilter } : {}) } },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.date': 1 } }
            ])
        ]);

        const data = {
            totalHosts: host?.length,
            totalBlockedHosts: host.filter(h => h.isBlocked === true)?.length,
            totalActiveHosts: todayActiveHosts, // ✅ only today's active hosts
            totalPendingHosts: hostRequest?.length,
            totalEarning: agency.coins,
            totalWithdrawCoins: agency.withdrawCoins,
            totalPendingWithdrawCoins: agency.pendingWithdrwCoins
        };

        const totalHostsChart = [];
        chartData.forEach(item => {
            totalHostsChart.push({ _id: item._id.date, count: item.count });
        });

        const chart = { totalHosts: totalHostsChart };

        return RESPONSE.success(res, 200, 1001, { data, chart });
    } catch (err) {
        console.log(err);
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
