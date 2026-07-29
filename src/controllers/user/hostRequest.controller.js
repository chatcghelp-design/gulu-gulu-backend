const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.sendHostRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        // Fetch the user to check gender
        const user = await db.User.findOne({ _id: userId, isDeleted: false });
        if (!user) {
            return RESPONSE.error(res, 404, 3002, '');
        }
        if (user.isBlocked) {
            return RESPONSE.error(res, 403, 3003, '');
        }
        if (user.gender !== 'Female') {
            return RESPONSE.error(res, 403, 3004, '');
        }

        // Extract file paths from req.files
        const image = req.files ? req.files.map(file => file.path) : [];
        const { languages, agencyCode, interests, telegramId } = req.body;
        console.log('Received id-----------------------------:', telegramId);

        // Simple validation
        if (!image.length) {
            return RESPONSE.error(res, 400, 3008, '');
        }

        // Check if already requested
        const existingRequest = await db.HostRequest.findOne({ userId, hostStatus: { $in: ['pending', 'approved'] } });
        if (existingRequest) {
            return RESPONSE.error(res, 400, 3005, '');
        }

        let assignedAgencyCode = '';
        if (agencyCode) {
            const agency = await db.Agency.findOne({ code: agencyCode });
            if (agency) {
                assignedAgencyCode = agency.code;
            } else {
                // Agency code not found
                return RESPONSE.error(res, 400, 3006, '');
            }
        }

        const hostRequest = await db.HostRequest.create({
            userId,
            image,
            languages,
            agencyCode: assignedAgencyCode,
            interests,
            telegramId
        });
        user.hostProfile.hostRequestStatus = 2;
        await user.save();
        return RESPONSE.success(res, 201, 3007, hostRequest);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
