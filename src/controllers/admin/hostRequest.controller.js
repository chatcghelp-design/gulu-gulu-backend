const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.handleHostRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { action, reason, agencyCode } = req.body;

        console.log(
            `Handling host request ${requestId} with action: ${action}, reason: ${reason}, agencyCode: ${agencyCode}`
        );

        // 1. Find host request and user
        const hostRequest = await db.HostRequest.findById(requestId).populate('userId');
        if (!hostRequest) return RESPONSE.error(res, 404, 9001);

        if (hostRequest.hostStatus !== 'pending') {
            return RESPONSE.error(res, 400, 9002);
        }

        // Check if userId exists and is populated
        if (!hostRequest.userId || !hostRequest.userId._id) {
            return RESPONSE.error(res, 404, 3002, 'User not found for this host request');
        }

        const userId = hostRequest.userId._id;

        // 2. If approved
        if (action === 'approved') {
         
            let agency = null;

            // If agencyCode not already assigned in request, use one from body
            if (!hostRequest.agencyCode && agencyCode) {
                agency = await db.Agency.findOne({ code: agencyCode });
                if (!agency) return RESPONSE.error(res, 404, 1101);
                hostRequest.agencyCode = agency.code;
            }

            if (hostRequest.agencyCode) {
                agency = await db.Agency.findOne({ code: hostRequest.agencyCode });
                if (!agency) return RESPONSE.error(res, 404, 3006, 1101);
            }

            // Clear followers and update their following count
            const followByUser = await db.Follower.find({ userId, followBy: 'user' }).distinct('hostId');
            const followByHost = await db.Follower.find({ userId, followBy: 'host' }).distinct('hostId');

            await db.User.updateMany({ _id: { $in: followByUser } }, { $inc: { followers: -1 } });
            await db.User.updateMany({ _id: { $in: followByHost } }, { $inc: { following: -1 } });

            db.Follower.deleteMany({ userId });
            // Update user to become host
            const user = await db.User.findById(userId);
            if (!user) {
                return RESPONSE.error(res, 404, 3002, 'User not found');
            }
            
            // Set isHost first so pre-save hook can work properly
            user.isHost = true;
            
            // Update basic user fields
            user.followers = 0;
            user.following = 0;
            user.coins = 0;
            user.avatar = hostRequest.image && hostRequest.image.length > 0 ? hostRequest.image[0] : '';
            user.imageType = 1;
            
            // Add all uploaded images to the user's Image collection
            if (hostRequest.image && hostRequest.image.length > 0) {
                const imageDocs = hostRequest.image.map(img => ({
                    userId: user._id,
                    image: img,
                    imageType: 1
                }));
                await db.Image.insertMany(imageDocs);
            }
            
            // Initialize hostProfile if it doesn't exist
            if (!user.hostProfile || typeof user.hostProfile !== 'object') {
                user.hostProfile = {};
            }
            
            // Update hostProfile fields - pre-save hook will ensure availability fields are true
            user.hostProfile.interests = hostRequest.interests || [];
            user.hostProfile.languages = hostRequest.languages || [];
            user.hostProfile.agencyId = agency?._id || null;
            user.hostProfile.videoCallCharge = globalSetting.minVideoCallCharge || 0;
            user.hostProfile.audioCallCharge = globalSetting.minAudioCallCharge || 0;
            user.hostProfile.chatCharge = globalSetting.minChatCharge || 0;
            user.hostProfile.telegramId = hostRequest.telegramId || '';
            // Explicitly set both to true (pre-save hook will also ensure this)
            user.hostProfile.availableForVideoCall = true;
            
            user.hostProfile.availableForAudioCall = true;
            user.hostProfile.availableForRandomCall = user.hostProfile.availableForRandomCall ?? true;
            
        
            // Mark as modified and save (pre-save hook will run here)
            user.markModified('hostProfile');
            await user.save();
            
       
            
            // Verify the update worked by checking the saved document
            const verifyUser = await db.User.findById(userId);
          
            if (verifyUser && (verifyUser.hostProfile?.availableForVideoCall !== true || verifyUser.hostProfile?.availableForAudioCall !== true)) {
              
                // If still not true, use direct MongoDB update as fallback
                const updateResult = await db.User.updateOne(
                    { _id: userId },
                    {
                        $set: {
                            'hostProfile.availableForVideoCall': true,
                            'hostProfile.availableForAudioCall': true
                        }
                    }
                );    
                // Verify again after fallback
                const finalUser = await db.User.findById(userId);
              
            } else {
             
            }
            // Update hostRequest
            hostRequest.status = 'approved';
            hostRequest.hostStatus = 'approved';
            hostRequest.reason = '';
            hostRequest.acceptRejectDate = new Date();
            if (hostRequest.userId) {
                hostRequest.userId.hostProfile.hostRequestStatus = 3;
                hostRequest.userId.save();
            }
            await hostRequest.save();

            return RESPONSE.success(res, 200, 9004);
        }

        // 3. If rejected
        if (action === 'rejected') {
            hostRequest.status = 'rejected';
            hostRequest.hostStatus = 'rejected';
            hostRequest.reason = reason || '';
            hostRequest.acceptRejectDate = new Date();
            if (hostRequest.userId) {
                hostRequest.userId.hostProfile.hostRequestStatus = 4;
                hostRequest.userId.save();
            }
            await hostRequest.save();

            return RESPONSE.success(res, 200, 9005, hostRequest);
        }

        // 4. Invalid action
        return RESPONSE.error(res, 400, 3013, 'Invalid action');
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

exports.hostInfo = async (req, res) => {
    try {
        const { userId } = req.params;
        const host = await db.User.findById(userId).populate('hostProfile.agencyId');

        if (!host || !host.isHost) {
            return RESPONSE.error(res, 404, 9003);
        }

        return RESPONSE.success(res, 200, 9005, host);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

exports.getHostRequest = async (req, res) => {
    try {
        const role = req.role;
        let findObj = {};

        if (role === 'agency') {
            const agency = await db.Agency.findOne({ _id: req.agency.id });
            if (!agency) {
                return RESPONSE.error(res, 404, 1101);
            }
            findObj.agencyCode = agency.code;
        }

        const hostRequests = await db.HostRequest.find(findObj).populate('userId', 'name');

        if (!hostRequests || hostRequests.length === 0) {
            return RESPONSE.error(res, 404, 9003, 'No host requests found');
        }

        return RESPONSE.success(res, 200, 9005, hostRequests);
    } catch (error) {
        console.error(' Internal Server Error:', error.stack || error);
        return RESPONSE.error(res, 500, 9999, error.message || 'Server error');
    }
};
