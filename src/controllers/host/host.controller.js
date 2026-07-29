const { db } = require('../../model/index.js');
const mongoose = require('mongoose');
const RESPONSE = require('../../../utils/response.js');

exports.getHostsByAgency = async (req, res) => {
    try {
        const { agencyCode } = req.query;
        if (!agencyCode) {
            return res.status(400).json({ status: false, message: 'agencyCode is required' });
        }
        const hosts = await db.User.find({ agencyCode });
        res.status(200).json({ status: true, hosts });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.getGiftSummaryByHost = async (req, res) => {
    try {
        const hostId = req.params.id;

        const host = await db.User.findById(hostId).select('isFake');
        if (!host) {
            return RESPONSE.error(res, 400, 3012);
        }
        let giftSummary = {};
        if (host.isFake) {
            giftSummary = await db.Gift.aggregate([
                {
                    $sample: {
                        // random number of gifts
                        size: Math.floor(Math.random() * (15 - 3 + 1)) + 3
                    }
                },
                {
                    $addFields: {
                        totalCount: {
                            $add: [
                                5,
                                {
                                    $floor: {
                                        $multiply: [{ $rand: {} }, 20 - 5 + 1]
                                    }
                                }
                            ]
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        image: '$image',
                        totalCount: 1
                    }
                }
            ]);
        } else {
            giftSummary = await db.Gift.aggregate([
                {
                    $lookup: {
                        from: 'histories',
                        let: { giftId: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            { $eq: ['$giftId', '$$giftId'] },
                                            { $eq: ['$hostId', new mongoose.Types.ObjectId(hostId)] },
                                            { $eq: ['$type', 'gift'] }
                                        ]
                                    }
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalCount: { $sum: '$giftCount' }
                                }
                            }
                        ],
                        as: 'giftHistory'
                    }
                },
                {
                    $unwind: {
                        path: '$giftHistory',
                        preserveNullAndEmptyArrays: false // ❌ remove if not found
                    }
                },
                {
                    $project: {
                        _id: 0,
                        image: '$image',
                        totalCount: '$giftHistory.totalCount'
                    }
                }
            ]);
        }

        // i need her same giftSummary but randoly upto 5 to 10 gifts with

        return res.status(200).json(giftSummary);
    } catch (error) {
        return res.status(500).json({
            message: 'Something went wrong',
            error: error.message
        });
    }
};
