const { db } = require('../src/model/index.js');
const moment = require('moment-timezone');
const { setUserOffline, setUserBusy } = require('./firebaseFunctions.js');

exports.generateuniqueId = length => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

// Helper to generate 8-digit unique numeric ID
exports.generate8DigitId = async length => {
    const characters = '0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    let exists = true;
    while (exists) {
        exists = await db.User.exists({ uniqueId: Number(result) });
    }
    return Number(result);
};

exports.generateCodeForAgency = async length => {
    const characters = '0123456789';
    const charactersLength = characters.length;
    let result = '';
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    let exists = true;
    while (exists) {
        exists = await db.Agency.exists({ code: Number(result) });
    }
    return Number(result);
};

exports.resetUserStateForCall = async ({ callerId, receiverId, callUniqueId }) => {
    console.log('callerId, receiverId, callUniqueId', callerId, receiverId, callUniqueId);
    await db.Call.findOneAndDelete({ callUniqueId });
};

exports.socketDisconnectManage = async id => {
    await db.User.updateOne({ _id: id }, { $set: { isOnline: false, isBusy: false, callUniqueId: '' } });
    setUserOffline(id);
    setUserBusy(id, false);
    const call = await db.Call.findOne({ $or: [{ userId: id }, { hostId: id }] });
    if (call) {
        await db.History.updateOne(           
            { callUniqueId: call.callUniqueId, callConnect: true, callEndTime: null },
            { $set: { callEndTime: new Date() } }
        );
        await db.Call.findOneAndDelete({ _id: call._id.toString() });
        io.in('id:' + call.userId).emit('callDecline', {
            callUniqueId: call.callUniqueId
        });
        io.in('id:' + call.hostId).emit('callDecline', {
            callUniqueId: call.callUniqueId
        });
    }
};

exports.dateFilterFunc = (startDate, endDate) => {
    let dateFilter = null;
    if (startDate.toLowerCase() !== 'all' && endDate.toLowerCase() !== 'all') {
        // Convert to IST and get full day range
        const startDateIST = moment.tz(startDate, 'Asia/Kolkata').startOf('day').toDate();
        const endDateIST = moment.tz(endDate, 'Asia/Kolkata').endOf('day').toDate();

        dateFilter = { $gte: startDateIST, $lte: endDateIST };
    }
    return dateFilter;
};
