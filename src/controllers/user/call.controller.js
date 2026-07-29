const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { sendNotification } = require('../../../utils/notificationFunc.js');
const { generateuniqueId } = require('../../../utils/function.js');


exports.randomCall = async (req, res) => {
    try {
        const { callType, id, agoraUID } = req.body;

        // Ensure callType has a default value
        // let availbleCheckKey = 'availableForAudioCall';
        // if (actualCallType === 'Video call') {
        //     availbleCheckKey = 'availableForVideoCall';
        // }


        // 2️⃣ IF CALLER IS HOST (Host calling random user)
        if (req.user.isHost) {
            // Get random user for host to call
            const getUsers = await db.User.find({
                isHost: false,
                isBlocked: false,
                isDeleted: false,
                isOnline: true,
                isFake: false
            });

            const randomUser = getUsers[Math.floor(Math.random() * getUsers.length)];

            if (!randomUser) {
                return RESPONSE.error(res, 400, 'No online users available');
            }

            hostId = req.user.id;
            userId = randomUser._id;

            [receiver, caller, block] = await Promise.all([
                db.User.findOne({
                    _id: randomUser._id,
                    isHost: false,
                    isBlocked: false,
                    isDeleted: false
                }),
                db.User.findOne({
                    _id: req.user.id,
                    isHost: true,
                    isBlocked: false,
                    isDeleted: false,
                    isFake: false
                }),
                db.Block.findOne({ hostId: req.user.id, userId: randomUser._id })
            ]);

            if (!caller) return RESPONSE.error(res, 400, 'Host not found');
            if (!receiver) return RESPONSE.error(res, 400, 'User not found');

            host = caller; // Host is the caller in this case

            if (block) {
                if (block.blockedBy === 'host') return RESPONSE.error(res, 400, 8006);
                if (block.blockedBy === 'user') return RESPONSE.error(res, 400, 8007);
            }
        }

        // 3️⃣ IF CALLER IS USER (User calling random host)
        if (!req.user.isHost) {
            // 1️⃣ GET AVAILABLE RANDOM HOST
            const gethost = await db.User.find({
                isHost: true,
                isBlocked: false,
                isDeleted: false,
                isOnline: true,
                isBusy: false,
                isFake: false
            }).populate('hostProfile');  // ✅ Populate to get charge data

            console.log('gethost', gethost.length);

            const randomHost = gethost[Math.floor(Math.random() * gethost.length)];
            if (!randomHost) {
                return RESPONSE.error(res, 400, 'No online hosts available');
            }

            console.log('receiver', randomHost._id);

            receiver = randomHost; // Full object, not just ID
            userId = req.user.id;
            hostId = randomHost._id;
            host = randomHost;

            // Fetch caller details from database
            caller = await db.User.findOne({
                _id: req.user.id,
                isHost: false,
                isBlocked: false,
                isDeleted: false
            });

            if (!caller) return RESPONSE.error(res, 400, 'User not found');
        }

        console.log('final receiver', receiver?._id);

        // 4️⃣ VALIDATIONS
        if (!receiver) {
            return RESPONSE.error(res, 400, 'Receiver not found');
        }

        // if (!receiver.isOnline) {
        //     return RESPONSE.error(res, 400, 'Receiver is Not Online');
        // }

        // If receiver is a host, check availability for call type
        // if (receiver.isHost) {
        //     return RESPONSE.error(res, 400, 'Receiver is Not Available for that call type');
        // }

        // 5️⃣ CREATE CALL
        const role = RtcRole.PUBLISHER;
        const uid = agoraUID ? agoraUID : 0;
        const expirationTimeInSeconds = 24 * 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
        const callUniqueId = generateuniqueId(10);

        await db.Call.create({
            userId,
            hostId,
            callBy: req.user.isHost ? 'host' : 'user',
            callUniqueId,
            callType: 'Random call'
        });

        const token = RtcTokenBuilder.buildTokenWithUid(
            globalSetting.agorakey,
            globalSetting.agoraCertificate,
            callUniqueId,
            uid,
            role,
            privilegeExpiredTs
        );

        // 6️⃣ SEND RESPONSE DATA
        const videoCall = {
            callerId: req.user.id,
            receiverId: receiver._id,
            callType: 'Random call',
            callerImage: caller.avatar,
            callerName: caller.name,
            receiverImage: receiver.avatar,
            receiverName: receiver.name,
            callerUniqueId: caller.uniqueId,
            receiverUniqueId: receiver.uniqueId,
            charge: host.hostProfile?.videoCallCharge || globalSetting.minVideoCallCharge || 10,
            type: req.user.isHost ? 'host' : 'user',
            token,
            callUniqueId
        };


        exports.queuePrivateCallFunc({
            ...videoCall,
            receiverFcmToken: receiver.fcmToken
        });

        return RESPONSE.success(res, 200, 'random call proceed', videoCall);
    } catch (err) {
        console.log('err       errrrrrrr', err);
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.queuePrivateCallFunc = async videoCall => {
    const { callerId, callerName, receiverFcmToken, receiverId, type, callUniqueId, callType } = videoCall;

    // Define obj outside try block so it's accessible in catch block
    const obj = {
        callUniqueId: callUniqueId,
        callBy: type,
        userId: type == 'host' ? receiverId : callerId,
        hostId: type == 'host' ? callerId : receiverId
    };

    try {
        console.log('videoCall in queuePrivateCallFunc =======================> ', videoCall);

        const [call, callerIdSocket, receiverIdSocket] = await Promise.all([
            db.Call.exists(obj),
            io.in('id:' + callerId).fetchSockets(),
            io.in('id:' + receiverId).fetchSockets()
        ]);

        if (callerIdSocket?.length && receiverIdSocket?.length && call) {
            const hostId = type === 'host' ? callerId : receiverId;
            const userId = type === 'host' ? receiverId : callerId;

            const payload = {
                title: 'Call Request',
                body: `${callerName} wants to call you`
            };
            // Before (Spread operator with mixed types) solve error @123
            // const data = {
            //     type: 'CALL',
            //     ...videoCall,  // ❌ Contains ObjectId, numbers, etc.
            //     charge: String(videoCall.charge)
            // };
            // Firebase requires all data values to be strings
            const data = {
                type: 'CALL',
                callerId: String(videoCall.callerId || ''),
                receiverId: String(videoCall.receiverId || ''),
                callerName: String(videoCall.callerName || ''),
                receiverName: String(videoCall.receiverName || ''),
                callerImage: String(videoCall.callerImage || ''),
                receiverImage: String(videoCall.receiverImage || ''),
                callerUniqueId: String(videoCall.callerUniqueId || ''),
                receiverUniqueId: String(videoCall.receiverUniqueId || ''),
                callUniqueId: String(videoCall.callUniqueId || ''),
                callType: String(videoCall.callType || ''),
                token: String(videoCall.token || ''),
                charge: String(videoCall.charge || 0),
                type_user: String(videoCall.type || '')
            };

            await sendNotification({ tokens: receiverFcmToken, payload, data });

            delete videoCall.receiverFcmToken;
            io.sockets.in('id:' + receiverId).emit('callRequest', videoCall);
            io.sockets.in('id:' + callerId).emit('callConfirm', videoCall);

            // Ensure callType is set - use callType from videoCall or default based on call type
            const historyType = callType || videoCall.callType || 'Audio call';

            await db.History.create({
                userId,
                hostId,
                callUniqueId,
                type: historyType,
                callBy: type
            });
        } else {
            io.sockets.in('id:' + callerId).emit('callRequestFalut', 'Receiver is Busy With Someone else', '');

            await db.Call.deleteOne(obj);
        }
    } catch (err) {
        console.log('err ============= ', videoCall?.id, err);

        try {
            await db.Call.deleteOne(obj);
        } catch (deleteErr) {
            console.log('Error deleting call:', deleteErr);
        }

        if (callerId) {
            io.sockets.in('id:' + callerId).emit('callRequestFalut', err.message || err, '');
        }
    }
};

async function randomMatchAgain(videoCall) {
    const { callerId, count } = videoCall;
    console.log('randomMatchAgain ====== ', count);
    try {
        if (count < globalSetting.randomMatchScreenTime) {
            videoCall.count += 2;
            setTimeout(async () => {
                return await exports.queueRandomCallFunc(videoCall);
            }, 2000);
        } else {
            console.log(' ===== randomMatchAgain  ================ DONE FAILD ');
            io.sockets.in('id:' + callerId).emit('timeOver', 'Time for random call has been over !!');
            return;
        }
    } catch (e) {
        console.log('e', e.message);
    }
}
