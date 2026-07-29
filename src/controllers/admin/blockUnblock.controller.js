const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.toggleBlockStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(userId);

        const user = await db.User.findById(userId);
        if (!user) return RESPONSE.error(res, 404, 3001, 'User not found');

        user.isBlocked = !user.isBlocked;
        await user.save();

        if (user.isHost) {
            const followersUserIds = await db.Follower.find({ hostId: userId, followBy: 'host' }).distinct('userId'); // user follower - 1
            const followingUserIds = await db.Follower.find({ hostId: userId, followBy: 'user' }).distinct('userId'); // host following - 1
            await db.User.updateMany({ _id: { $in: followersUserIds } }, [
                {
                    $set: {
                        follower: {
                            $max: [{ $add: ['$followers', -1] }, 0]
                        }
                    }
                }
            ]);
            await db.User.updateMany({ _id: { $in: followingUserIds } }, [
                {
                    $set: {
                        follower: {
                            $max: [{ $add: ['$following', -1] }, 0]
                        }
                    }
                }
            ]);
        } else {
            const followersUserIds = await db.Follower.find({ userId, followBy: 'user' }).distinct('hostId'); // user follower - 1
            const followingUserIds = await db.Follower.find({ userId, followBy: 'host' }).distinct('hostId'); // host following - 1
            await db.User.updateMany({ _id: { $in: followersUserIds } }, [
                {
                    $set: {
                        follower: {
                            $max: [{ $add: ['$followers', -1] }, 0]
                        }
                    }
                }
            ]);
            await db.User.updateMany({ _id: { $in: followingUserIds } }, [
                {
                    $set: {
                        follower: {
                            $max: [{ $add: ['$following', -1] }, 0]
                        }
                    }
                }
            ]);
        }

        return RESPONSE.success(res, 200, 1001, {
            _id: user._id,
            isBlocked: user.isBlocked,
            message: user.isBlocked ? 'User blocked' : 'User unblocked'
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
