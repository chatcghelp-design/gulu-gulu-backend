const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getUserHostsList = async (req, res) => {
    try {
        const { role, agency } = req;
        const { isFake, isHost = 'true' } = req.query;
        if (role !== 'admin' && role !== 'agency') {
            return RESPONSE.error(res, 403, '', 'Access denied');
        }
        const { page = 1, limit = 10, search = '', from, to, start } = req.query;
        // Derive skip/limit from either from-to (1-based), or start/limit/page
        const parsedStartRaw = parseInt(start);
        const parsedLimitRaw = parseInt(limit);
        let derivedSkip = 0;
        let derivedLimit = Number.isNaN(parsedLimitRaw) || parsedLimitRaw <= 0 ? 10 : parsedLimitRaw;

        const hasRange = typeof from !== 'undefined' && typeof to !== 'undefined';
        if (hasRange) {
            const fromNum = parseInt(from);
            const toNum = parseInt(to);
            if (!Number.isNaN(fromNum) && !Number.isNaN(toNum) && fromNum > 0 && toNum >= fromNum) {
                const rangeLimit = toNum - fromNum + 1;
                derivedSkip = fromNum - 1;
                derivedLimit = rangeLimit;
            }
        } else if (!Number.isNaN(parsedStartRaw) && parsedStartRaw >= 0) {
            derivedSkip = parsedStartRaw;
        } else {
            // page-based fallback
            const pageNum = parseInt(page) || 1;
            derivedSkip = (pageNum - 1) * derivedLimit;
        }

        const userFilter = {
            isDeleted: { $ne: true }  // ✅ Exclude deleted accounts properly in aggregation
        };
        if (isFake) {
            const isFakeBool = isFake == 'true';
            if (isFakeBool) {
                userFilter.isFake = true;
            } else {
                userFilter.isFake = { $ne: true };
            }
        }
        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { uniqueId: { $regex: search, $options: 'i' } }
            ];
        }
        const mongoose = require('mongoose');
        if (role === 'agency') {
            userFilter['hostProfile.agencyId'] = new mongoose.Types.ObjectId(agency.id || agency._id);
            userFilter.isHost = true;
            userFilter.isFake = { $ne: true };
        } else {
            const isHostBool = isHost == 'true';
            if (isHostBool) {
                userFilter.isHost = true;
            } else {
                userFilter.isHost = { $ne: true };
            }
        }
        console.log('userFilter in host.list =>', userFilter, 'skip:', derivedSkip, 'limit:', derivedLimit);
        const [total, usersRaw] = await Promise.all([
            db.User.countDocuments(userFilter),
            db.User.aggregate([
                { $match: userFilter },
                {
                    $addFields: {
                        sortPriority: {
                            $switch: {
                                branches: [
                                    { case: { $and: [{ $eq: ['$isOnline', true] }, { $ne: ['$isFake', true] }] }, then: 1 }, // Real online
                                    { case: { $and: [{ $eq: ['$isBusy', true] }, { $ne: ['$isFake', true] }] }, then: 2 }, // Real busy
                                    { case: { $and: [{ $eq: ['$isOnline', true] }, { $eq: ['$isFake', true] }] }, then: 3 }, // Fake online
                                    { case: { $and: [{ $eq: ['$isBusy', true] }, { $eq: ['$isFake', true] }] }, then: 4 }, // Fake busy
                                    { case: { $eq: ['$isFake', true] }, then: 5 }, // Fake offline
                                ],
                                default: 6 // Real offline
                            }
                        }
                    }
                },
                { $sort: { sortPriority: 1, createdAt: -1 } },
                { $skip: derivedSkip },
                { $limit: derivedLimit }
            ])
        ]);

        const users = await db.User.populate(usersRaw, { path: 'hostProfile.agencyId', select: 'name' });

        const hasNext = derivedSkip + users.length < total;
        const hasPrev = derivedSkip > 0;
        const data = {
            users,
            pagination: {
                total,
                start: derivedSkip,
                limit: derivedLimit,
                from: hasRange ? derivedSkip + 1 : undefined,
                to: hasRange ? derivedSkip + users.length : undefined,
                nextStart: hasNext ? derivedSkip + users.length : null,
                prevStart: hasPrev ? Math.max(0, derivedSkip - derivedLimit) : null,
                currentPage: derivedLimit > 0 ? Math.floor(derivedSkip / derivedLimit) + 1 : 1,
                totalPages: derivedLimit > 0 ? Math.max(1, Math.ceil(total / derivedLimit)) : 1,
                hasNext,
                hasPrev
            }
        };

        return RESPONSE.success(res, 200, 'host.list', data);
    } catch (err) {
        console.error('Error fetching withdrawals:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};


exports.getFakeHostsList = async (req, res) => {
    try {
        const { role, agency } = req;

        if (role !== 'admin' && role !== 'agency') {
            return RESPONSE.error(res, 403, '', 'Access denied');
        }

        const { page = 1, limit = 10, search = '' } = req.query;

        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;

        const userFilter = {
            isHost: true,
            isFake: true,
            isDeleted: false  // ✅ Exclude deleted accounts
        };

        if (search) {
            userFilter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { uniqueId: { $regex: search, $options: 'i' } }
            ];
        }

        if (role === 'agency') {
            userFilter['hostProfile.agencyId'] = agency.id;
        }

        const [total, users] = await Promise.all([
            db.User.countDocuments(userFilter),
            db.User.find(userFilter)
                .populate('hostProfile.agencyId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum)
        ]);

        return RESPONSE.success(res, 200, 'fake.host.list', {
            users,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (err) {
        console.error('Error fetching fake hosts:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};
