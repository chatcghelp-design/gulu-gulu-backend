const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { userBasicObj } = require('../../../utils/varibles.js');

// Get setting
exports.getSetting = async (req, res) => {
    try {
        const setting = await db.Setting.findOne();
        if (!setting) {
            return res.status(404).send({ status: false, message: 'Setting not found' });
        }
        RESPONSE.success(res, 200, 'success', setting);
        if (req.user?.id) {
            await followingCountUpdatedFunc(req.user?.id, req.user?.isHost);
        }
    } catch (error) {
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

async function followingCountUpdatedFunc(id, isHost) {
    try {
        const user = await db.User.findById(id);
        const isToday = date => {
            console.log(date);
            if (!date) return false;
            const today = new Date();
            return (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
            );
        };
        if (!isToday(user.followingCountUpdatedDate)) {
            let followerObj, followingObj;
            if (isHost) {
                followerObj = { hostId: id, followBy: 'user' };
                followingObj = { hostId: id, followBy: 'host' };
            } else {
                followerObj = { userId: id, followBy: 'host' };
                followingObj = { userId: id, followBy: 'user' };
            }
            const followerCount = await db.Follower.countDocuments(followerObj)
                .populate({
                    path: isHost ? 'userId' : 'hostId',
                    match: userBasicObj
                })
                .lean();

            const followingCount = await db.Follower.countDocuments(followingObj)
                .populate({
                    path: isHost ? 'userId' : 'hostId',
                    match: userBasicObj
                })
                .lean();
            user.followers = followerCount;
            user.following = followingCount;
            user.followingCountUpdatedDate = new Date();
            await user.save();
        }
    } catch (error) {
        console.log(error);
    }
}
