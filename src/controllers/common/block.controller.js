const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.blockUnblock = async (req, res) => {
    try {
        const { id, action } = req.body; // action: '1' or '2' // 1 :  block, 2 : unblock

        let userId, hostId, blockedBy;
        if (req.user.isHost) {
            userId = id;
            hostId = req.user.id;
            blockedBy = 'host';
        } else {
            userId = req.user.id;
            hostId = id;
            blockedBy = 'user';
        }

        // block
        if (action == '1') {
            const already = await db.Block.findOne({ userId, hostId, blockedBy });
            if (already) {
                return RESPONSE.success(res, 200, 8001);
            }
            await db.Block.create({ userId, hostId, blockedBy });

            // handle follower following count when user host block each other ... follower collection entry delete
            const followers = await db.Follower.find({ userId, hostId });
            if (followers.length) {
                let userFollowingDec = 0;
                let userFollowerDec = 0;
                let hostFollowingDec = 0;
                let hostFollowerDec = 0;

                followers.forEach(follower => {
                    if (follower.followBy == 'user') {
                        userFollowingDec--;
                        hostFollowerDec--;
                    } else {
                        userFollowerDec--;
                        hostFollowingDec--;
                    }
                });

                await followCountManageFunc({
                    userIds: [userId],
                    userFollowingDec,
                    userFollowerDec,
                    hostIds: [hostId],
                    hostFollowingDec,
                    hostFollowerDec
                });
                await db.Follower.deleteMany({ userId, hostId });
            }

            return RESPONSE.success(res, 201, 8002);
        }

        // unblock
        if (action == '2') {
            const blockExists = await db.Block.findOne({ userId, hostId, blockedBy });
            if (!blockExists) {
                return RESPONSE.error(res, 400, 8005);
            }
            await db.Block.deleteOne({ _id: blockExists._id });

            return RESPONSE.success(res, 200, 8003);
        }
        return RESPONSE.error(res, 400, 8004);
    } catch (err) {
        console.log(err, 'error');
        return RESPONSE.error(res, 500, err.message);
    }
};

// get block list
exports.getBlockList = async (req, res) => {
    try {
        const { search = '', start = 0, limit = 20 } = req.query;
        const isHost = req.user.isHost;
        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);

        const baseQuery = {
            _id: { $ne: req.user.id },
            isHost: !isHost,
            isBlocked: false,
            isDeleted: false
        };

        // Get all block relations involving this user (either way)
        const blockFilter = isHost
            ? { hostId: req.user.id, blockedBy: 'host' }
            : { userId: req.user.id, blockedBy: 'user' };

        const blocked = await db.Block.find(blockFilter).select('hostId userId -_id');

        // Collect all user IDs to exclude
        const blockedIds = new Set();
        blocked.forEach(b => {
            if (isHost) {
                blockedIds.add(String(b.userId));
            } else {
                blockedIds.add(String(b.hostId));
            }
        });

        baseQuery._id = { ...baseQuery._id, $in: Array.from(blockedIds) };

        // Apply text search filter if provided
        if (search.trim()) {
            baseQuery.$or = [
                { uniqueId: { $regex: search.trim(), $options: 'i' } },
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // Fetch users
        const users = await db.User.find(baseQuery).skip(parsedStart).limit(parsedLimit);

        return RESPONSE.success(res, 200, 8008, users);
    } catch (err) {
        console.log(err.message, 'error');
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
async function followCountManageFunc({
    userIds,
    userFollowingDec,
    userFollowerDec,
    hostIds,
    hostFollowingDec,
    hostFollowerDec
}) {
    console.log('userIds', userIds);
    await Promise.all([
        db.User.updateMany({ _id: { $in: userIds } }, [
            {
                $set: {
                    following: {
                        $max: [{ $add: ['$following', userFollowingDec] }, 0]
                    },
                    follower: {
                        $max: [{ $add: ['$follower', userFollowerDec] }, 0]
                    }
                }
            }
        ]),
        db.User.updateMany({ _id: { $in: hostIds } }, [
            {
                $set: {
                    following: {
                        $max: [{ $add: ['$following', hostFollowingDec] }, 0]
                    },
                    follower: {
                        $max: [{ $add: ['$follower', hostFollowerDec] }, 0]
                    }
                }
            }
        ])
    ]);
}
