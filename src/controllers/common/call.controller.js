const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { generateuniqueId } = require('../../../utils/function.js');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { sendNotification } = require('../../../utils/notificationFunc.js');

//call user or host
exports.privateCall = async (req, res) => {
    try {
        // before socket event call for isOnline true
        const { callType, id, agoraUID } = req.body;
        let availbleCheckKey = 'availableForAudioCall';
        if (callType == 'Video call') {
            availbleCheckKey = 'availableForVideoCall';
        }
        let receiver, caller, block, userId, hostId, host;
        if (req.user.isHost) {
            hostId = req.user.id;
            userId = id;
            [receiver, caller, block] = await Promise.all([
                db.User.findOne({ _id: id, isHost: false, isBlocked: false, isDeleted: false }),
                db.User.findOne({
                    _id: req.user.id,
                    isHost: true,
                    isBlocked: false,
                    isDeleted: false
                }),
                db.Block.findOne({ hostId: req.user.id, userId: id })
            ]);
            host = caller;
            if (!caller) {
                return RESPONSE.error(res, 400, 'Host not found'); // own id is wrong
            }
            if (block) {
                if (block.blockedBy === 'host') return RESPONSE.error(res, 400, 8006);
                if (block.blockedBy === 'user') return RESPONSE.error(res, 400, 8007);
            }
        }
        if (!req.user.isHost) {
            userId = req.user.id;
            hostId = id;
            [receiver, caller] = await Promise.all([
                db.User.findOne({ _id: id, isHost: true, isBlocked: false, isDeleted: false }),
                db.User.findOne({
                    _id: req.user.id,
                    isHost: false,
                    isBlocked: false,
                    isDeleted: false
                }),
                db.Block.findOne({ userId: req.user.id, hostId: id })
            ]);
            host = receiver;
            if (!caller) {
                return RESPONSE.error(res, 400, 'User not found');
            }
            if (block) {
                if (block.blockedBy === 'user') return RESPONSE.error(res, 400, 8006);
                if (block.blockedBy === 'host') return RESPONSE.error(res, 400, 8007);
            }
        }

        if (!receiver) {
            return RESPONSE.error(res, 400, 'Receiver not found');
        }
        // if (!receiver.isOnline) {
        //     return RESPONSE.error(res, 400, 'Receiver is Not Online');
        // }
        console.log('receiver[availbleCheckKey]', availbleCheckKey, receiver[availbleCheckKey]);
        if (!receiver.hostProfile[availbleCheckKey]) {
            return RESPONSE.error(res, 400, 'Receiver is Not Available for that call type');
        }

        const role = RtcRole.PUBLISHER;
        const uid = agoraUID ? agoraUID : 0;
        const expirationTimeInSeconds = 24 * 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        const callUniqueId = generateuniqueId(10);
        try {
            await db.Call.create({
                userId,
                hostId,
                callBy: req.user.isHost ? 'host' : 'user',
                callUniqueId,
                callType: 'private'
            });
        } catch (e) {
            return RESPONSE.error(res, 400, 3014);
        }
        const setting = await db.Setting.findOne({});
        const token = RtcTokenBuilder.buildTokenWithUid(
            setting?.agorakey || globalSetting.agorakey,
            setting?.agoraCertificate || globalSetting.agoraCertificate,
            callUniqueId,
            uid,
            role,
            privilegeExpiredTs
        );

        const videoCall = {
            callerId: req.user.id,
            receiverId: id,
            callType,
            callerImage: caller.avatar,
            callerName: caller.name,
            receiverImage: receiver.avatar,
            receiverName: receiver.name,
            callerUniqueId: caller.uniqueId,
            receiverUniqueId: receiver.uniqueId,
            charge: callType === 'Video call'
                ? (setting?.minVideoCallCharge || host.hostProfile?.videoCallCharge || 0)
                : (setting?.minAudioCallCharge || host.hostProfile?.audioCallCharge || 0),
            type: req.user.isHost ? 'host' : 'user',
            token,
            callUniqueId
        };
        exports.queuePrivateCallFunc({ ...videoCall, receiverFcmToken: receiver.fcmToken });

        return RESPONSE.success(res, 200, 'private call proceed', videoCall);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.queuePrivateCallFunc = async videoCall => {
    const { callerId, callerName, callerImage, receiverFcmToken, receiverId, type, callUniqueId, callType } = videoCall;
    try {
        console.log('videoCall in queuePrivateCallFunc =======================> ', videoCall);
        const obj = {
            callUniqueId: callUniqueId,
            callBy: type,
            userId: type == 'host' ? receiverId : callerId,
            hostId: type == 'host' ? callerId : receiverId
        };
        const [call, callerIdSocket, receiverIdSocket] = await Promise.all([
            db.Call.exists(obj),
            io.in('id:' + callerId).fetchSockets(),
            io.in('id:' + receiverId).fetchSockets()
        ]);
        if (callerIdSocket?.length && call) {
            const hostId = type === 'host' ? callerId : receiverId;
            const userId = type === 'host' ? receiverId : callerId;

            const payload = {
                title: 'Call Request',
                body: `${callerName} wants to call you`
            };
            const data = {
                type: 'CALL',
                ...videoCall,
                charge: String(videoCall.charge)
            };
            await sendNotification({ tokens: receiverFcmToken, payload, data });

            delete videoCall.receiverFcmToken;
            io.sockets.in('id:' + receiverId).emit('callRequest', videoCall);
            io.sockets.in('id:' + callerId).emit('callConfirm', videoCall);

            console.log('callRequest SENT ===== SUCCESS  ======================== DONE ', videoCall.id);
            await db.History.create({
                userId,
                hostId,
                callUniqueId,
                type: callType,
                callBy: type
            });
        } else {
            console.log(' ===== callRequestFalut  ================ DONE FAILD ', videoCall.id);
            if (!callerIdSocket?.length || !call) {
                io.sockets.in('id:' + callerId).emit('callRequestFalut', 'Something Went Wrong With Your Call !!', '');
            } else {
                io.sockets.in('id:' + callerId).emit('callRequestFalut', 'Receiver is Busy With Someone else', '');
            }
            db.Call.deleteOne({
                callUniqueId: callUniqueId,
                callBy: type,
                userId: type === 'host' ? receiverId : callerId,
                hostId: type === 'host' ? callerId : receiverId
            });
        }
        return;
    } catch (err) {
        console.log('err ============= ', videoCall.id, err);
        db.Call.deleteOne({
            callUniqueId: callUniqueId,
            callBy: type,
            userId: type === 'host' ? receiverId : callerId,
            hostId: type === 'host' ? callerId : receiverId
        });
        io.sockets.in('id:' + callerId).emit('callRequestFalut', err, '');
        return;
    }
};
