const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getAgencyList = async (req, res) => {
    try {
        const { role } = req;
        if (role !== 'admin') {
            return RESPONSE.error(res, 403, '', 'Access denied');
        }

        const { page = 1, limit = 10, search = '', from, to, start } = req.query;

        // Calculate skip and limit based on priority: from-to (1-based) > start/limit > page/limit
        const parsedStartRaw = parseInt(start);
        const parsedLimitRaw = parseInt(limit);
        let derivedSkip = 0;
        let derivedLimit = Number.isNaN(parsedLimitRaw) || parsedLimitRaw <= 0 ? 10 : Math.min(parsedLimitRaw, 100);

        const hasRange = typeof from !== 'undefined' && typeof to !== 'undefined';
        if (hasRange) {
            const fromNum = parseInt(from);
            const toNum = parseInt(to);
            if (!Number.isNaN(fromNum) && !Number.isNaN(toNum) && fromNum > 0 && toNum >= fromNum) {
                const rangeLimit = Math.min(toNum - fromNum + 1, 100);
                derivedSkip = fromNum - 1; // convert 1-based to 0-based offset
                derivedLimit = rangeLimit;
            }
        } else if (!Number.isNaN(parsedStartRaw) && parsedStartRaw >= 0) {
            derivedSkip = parsedStartRaw;
        } else {
            // page-based fallback
            const pageNum = parseInt(page) || 1;
            derivedSkip = (pageNum - 1) * derivedLimit;
        }

        const filter = {};
        if (search) {
            filter.$or = [{ name: { $regex: search, $options: 'i' } }, { code: { $regex: search, $options: 'i' } }];
        }

        const [total, agencies] = await Promise.all([
            db.Agency.countDocuments(filter),
            db.Agency.find(filter).sort({ createdAt: -1 }).skip(derivedSkip).limit(derivedLimit)
        ]);

        const hasNext = derivedSkip + agencies.length < total;
        const hasPrev = derivedSkip > 0;
        const data = {
            agencies,
            pagination: {
                total,
                start: derivedSkip,
                limit: derivedLimit,
                from: hasRange ? derivedSkip + 1 : undefined,
                to: hasRange ? derivedSkip + agencies.length : undefined,
                nextStart: hasNext ? derivedSkip + agencies.length : null,
                prevStart: hasPrev ? Math.max(0, derivedSkip - derivedLimit) : null,
                currentPage: derivedLimit > 0 ? Math.floor(derivedSkip / derivedLimit) + 1 : 1,
                totalPages: derivedLimit > 0 ? Math.max(1, Math.ceil(total / derivedLimit)) : 1,
                hasNext,
                hasPrev
            }
        };

        return RESPONSE.success(res, 200, 'agency.list', data);
    } catch (err) {
        console.error('Error fetching agencies:', err);
        return RESPONSE.error(res, 500, 'internal.server.error', err.message);
    }
};

exports.getAgencyById = async (req, res) => {
    try {
        const { id } = req.params;
        const agency = await db.Agency.findById(id);
        if (!agency) {
            return RESPONSE.error(res, 404, '', 'Agency not found');
        }
        return RESPONSE.success(res, 200, 'agency.data', agency);
    } catch (err) {
        return RESPONSE.error(res, 500, '', err.message);
    }
};

// agency block api in query agencyId, otherAgencyId (otherAgencyId for host assign to another agency)
exports.blockAgency = async (req, res) => {
    try {
        const { agencyId, otherAgencyId, type } = req.query; // type == disable , enable

        let agency, anotherAgency;
        if (type == 'disable') {
            [agency, anotherAgency] = await Promise.all([
                db.Agency.findById(agencyId),
                db.Agency.findOne({ _id: otherAgencyId, isDisable: false })
            ]);

            if (!agency || !anotherAgency) {
                return RESPONSE.error(res, 404, 1101);
            }

            if (agency.isDisable) {
                return RESPONSE.error(res, 400, 1103);
            }
            //update host
            await db.User.updateMany(
                { 'hostProfile.agencyId': agencyId },
                { $set: { 'hostProfile.agencyId': otherAgencyId } }
            );
        } else {
            [agency] = await Promise.all([db.Agency.findById(agencyId)]);
            if (!agency) {
                return RESPONSE.error(res, 404, 1101);
            }
        }

        agency.isDisable = type == 'disable';
        await agency.save();
        return RESPONSE.success(res, 200, `Agency ${type} successfully`, agency);
    } catch (err) {
        return RESPONSE.error(res, 500, '', err.message);
    }
};
