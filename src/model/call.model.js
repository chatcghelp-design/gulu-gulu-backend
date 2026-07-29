const mongoose = require('mongoose');
const User = require('./user.model.js');
const History = require('./history.model.js');
const { setUserBusy } = require('../../utils/firebaseFunctions.js');

const CallSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true
        },
        hostId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true
        },
        callBy: {
            type: String,
            enum: ['user', 'host'],
            required: true
        },
        callUniqueId: {
            type: String,
            required: true,
            unique: true
        },
        callType: {
            type: String,
            enum: ['private', 'Random call'],
            default: 'private',
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

async function updateUserAfterCallSave(userId, hostId) {
    setUserBusy(userId, true); // firebase function
    setUserBusy(hostId, true);
    await User.updateMany({ _id: { $in: [userId, hostId] } }, { $set: { isBusy: true, callUniqueId: '' } });
}
async function updateUserAfterCallDelete(userId, hostId, callUniqueId) {
    // firebase update
    setUserBusy(userId, false);
    setUserBusy(hostId, false);
    await User.updateMany({ _id: { $in: [userId, hostId] } }, { $set: { isBusy: false, callUniqueId: '' } });
    io.sockets.in('id:' + userId).emit('callDelete', { callUniqueId });
    io.sockets.in('id:' + hostId).emit('callDelete', { callUniqueId });
}

async function updateHistoryAfterCallDelete(callUniqueId, hostId) {
    const history = await History.findOne({ callUniqueId }).sort({ createdAt: -1 });
    let callTime = 0; // in seconds
    if (history && history.callStartTime && history.callEndTime) {
        callTime = Number(Math.floor((history.callEndTime - history.callStartTime) / 1000)) || 0;
        console.log('callTime', callTime); // seconds

        const host = await User.findOne({ _id: hostId }).populate('hostProfile.agencyId');
        const userCoin =
            history?.type === 'Audio call' ? host.hostProfile.audioCallCharge : host.hostProfile.videoCallCharge;

        const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.callTax || 0) / 100) || 0) || 0;
        let hostCoin = (coinAfterAdminTax / 60) * callTime;
        let agencyCoin = 0;

        await module.exports.agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history }); // @todo need to check
    }
}

CallSchema.post('save', async function (doc) {
    try {
        console.log('save trigered');
        await updateUserAfterCallSave(doc.userId, doc.hostId);
    } catch (err) {
        console.error('Error updating user after call creation:', err);
    }
});
CallSchema.post('findOneAndDelete', async function (doc) {
    if (!doc) return;
    try {
        console.log('findOneAndDelete trigered');
        await updateUserAfterCallDelete(doc.userId, doc.hostId, doc.callUniqueId);
        await updateHistoryAfterCallDelete(doc.callUniqueId, doc.hostId);
    } catch (err) {
        console.error('Error updating user after call findOneAndDelete:', err);
    }
});

CallSchema.post('updateOne', async function (doc) {
    try {
        console.log('updateOne trigered');
        await updateUserAfterCallSave(doc.userId, doc.hostId);
    } catch (err) {
        console.error('Error updating user after call updateOne:', err);
    }
});

const Call = mongoose.model('Call', CallSchema);

module.exports = {
    Call,
    agencyHostCoinAdd: async ({ coinAfterAdminTax, host, hostCoin, agencyCoin, history }) => {
        if (globalSetting.isAgency) {
            agencyCoin = Number((hostCoin * (host?.hostProfile?.agencyId?.tax || 0)) / 100) || 0;
            hostCoin = Number(hostCoin - agencyCoin) || 0;
        }
        host.coins += parseInt(hostCoin);
        await host.save();
        if (history) {
            history.hostCoin += parseInt(hostCoin);
            history.agencyCoin += parseInt(agencyCoin);
            await history.save();
        }
        if (globalSetting.isAgency && host.hostProfile.agencyId) {
            host.hostProfile.agencyId.coins += parseInt(agencyCoin);
            await host.hostProfile.agencyId.save();
        }
    }
};
