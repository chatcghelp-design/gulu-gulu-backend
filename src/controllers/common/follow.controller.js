const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');
const { userBasicObj } = require('../../../utils/varibles.js');
const { sendNotification } = require('../../../utils/notificationFunc.js');

exports.followOrUnfollow = async (req, res) => {
    try {
        const { id, action } = req.body;

        if (req.user.id === id) {
            return RESPONSE.error(res, 400, 4005);
        }
        let targetUserExists = await db.User.exists({ _id: id, isBlocked: false, isDeleted: false });
        if (!targetUserExists) {
            return RESPONSE.error(res, 400, 3002);
        }
        let followedUser = await db.User.findOne({ _id: id });
        let loginId = req.user.id;
        let userId, hostId, followBy, targetId, loginUser, targetUser;
        if (req.user.isHost) {
            userId = id;
            hostId = req.user.id;
            followBy = 'host';
            targetId = id;
        } else {
            userId = req.user.id;
            hostId = id;
            followBy = 'user';
            targetId = id;
        }

        // FOLLOW
        if (action === 'follow') {
            const already = await db.Follower.findOne({ userId, hostId, followBy });
            if (already) return RESPONSE.success(res, 200, 4001);

            await db.Follower.create({ userId, hostId, followBy });
            if (followBy == 'user') {
                [loginUser, targetUser] = await Promise.all([
                    db.User.findByIdAndUpdate(loginId, { $inc: { following: 1 } }),
                    db.User.findByIdAndUpdate(id, { $inc: { followers: 1 } })
                ]);
            } else {
                [loginUser, targetUser] = await Promise.all([
                    db.User.findByIdAndUpdate(loginId, { $inc: { following: 1 } }),
                    db.User.findByIdAndUpdate(id, { $inc: { followers: 1 } })
                ]);
            }

            sendNotification({
                tokens: followedUser.fcmToken,
                payload: {
                    title: 'New follower',
                    body: `${loginUser.name} followed you`
                },
                data: {
                    _id: targetUser._id.toString(),
                    uniqueId: targetUser.uniqueId,
                    name: targetUser.name,
                    avatar: targetUser.avatar,
                    time: 'Just Now',
                    type: 'FOLLOWER'
                }
            });

            return RESPONSE.success(res, 201, 4002, {
                followType: followBy,
                user: {
                    _id: targetUser._id,
                    uniqueId: targetUser.uniqueId,
                    name: targetUser.name,
                    avatar: targetUser.avatar
                }
            });
        }

        // UNFOLLOW
        if (action === 'unfollow') {
            const follow = await db.Follower.findOne({ userId, hostId, followBy });
            if (!follow) return RESPONSE.error(res, 400, 4004, 'Not following');

            await db.Follower.deleteOne({ _id: follow._id });

            if (followBy == 'user') {
                [loginUser, targetUser] = await Promise.all([
                    db.User.findByIdAndUpdate(loginId, { $inc: { following: -1 } }),
                    db.User.findByIdAndUpdate(id, { $inc: { followers: -1 } })
                ]);
            } else {
                [loginUser, targetUser] = await Promise.all([
                    db.User.findByIdAndUpdate(loginId, { $inc: { following: -1 } }),
                    db.User.findByIdAndUpdate(id, { $inc: { followers: -1 } })
                ]);
            }

            return RESPONSE.success(res, 200, 4003, {
                followType: followBy,
                user: {
                    _id: targetUser._id,
                    uniqueId: targetUser.uniqueId,
                    name: targetUser.name,
                    avatar: targetUser.avatar
                }
            });
        }

        return RESPONSE.error(res, 400, 4004, 'Invalid action');
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.getMyFollowList = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const isHost = req.user.isHost;
         const commonMatch = { isDeleted: false, isBlocked: false };

        const followerQuery = isHost
            ? { hostId: currentUserId, followBy: 'user' }
            : { userId: currentUserId, followBy: 'host' };

        const followingQuery = isHost
            ? { hostId: currentUserId, followBy: 'host' }
            : { userId: currentUserId, followBy: 'user' };

        const followers = await db.Follower.find(followerQuery)
            .populate({
                path: isHost ? 'userId' : 'hostId',
                match: commonMatch
            })
            .lean();

        const following = await db.Follower.find(followingQuery)
            .populate({
                path: isHost ? 'userId' : 'hostId',
               match: commonMatch
            })
            .lean();

        const followerList = followers.map(f => (isHost ? f.userId : f.hostId));
        const followingList = following.map(f => (isHost ? f.userId : f.hostId));

        return RESPONSE.success(res, 200, 1001, {
            followers: followerList,
            following: followingList
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
