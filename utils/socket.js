// without fakechat and fackviedocall

// const { verifyToken } = require('../middleware/authorization/authorization.js');
// const { resetUserStateForCall, socketDisconnectManage, generateuniqueId } = require('./function.js');
// const { db } = require('../src/model/index.js');
// const { setUserOnline } = require('../utils/firebaseFunctions.js');
// const { agencyHostCoinAdd } = require('../src/model/call.model.js');
// const { checkAndUpdateLevel } = require('../src/services/level.service.js');
// const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
// const { sendNotification } = require('./notificationFunc.js');

// io.use(async (socket, next) => {
//     const token = socket.handshake.headers.token;
//     console.log('token --- ', token);
//     // Assuming token is sent in auth object
//     if (!token) {
//         return next(new Error('Authorization token missing'));
//     }
//     try {
//         // Verify token
//         const decoded = await verifyToken(token);
//         socket.user = decoded; // Attach decoded user info to socket for later user
//         return next();
//     } catch (err) {
//         console.log('err :>> ', err);
//         return next(new Error('Invalid authorization token'));
//     }
// });

// io.on('connection', async socket => {
//     // const { userHostId } = socket.handshake.query;
//     const id = socket.user?.id;

//     socket.join('id:' + id);
//     console.log('A user connected ======== ', id);

//     const user = await db.User.findOne({ _id: id });
//     setUserOnline(id);
//     user.isOnline = true;
//     await user.save();

//     // // call confirmed event emit from receiver side when they listen callRequest from queuePrivateCallFunc
//     // socket.on('callConfirmed', async data => {
//     //     console.log('Data in call Confirm ==========================> ', data);

//     //     // emit call confirmed event to caller for calling to ringing state
//     //     io.in('id:' + data.callerId).emit('callConfirmed', data);

//     //     const callerUser = await db.User.findOne({ _id: data.callerId });

//     //     if (callerUser && callerUser?.callUniqueId !== data?.callUniqueId) {
//     //         console.log('callCancel emit in call Confirm ==========================> ', data.receiverId);
//     //         io.in('id:' + data.receiverId).emit('callCancel', data);
//     //         return;
//     //     }
//     // });

//     socket.on('online', async data => {
//         await db.User.updateOne({ _id: data.id }, { $set: { isOnline: true } });
//     });

//     // receiver emit only
//     socket.on('callAnswer', async data => {
//         console.log('Data in call Answer ==========================> ', data);

//         const { callerId, receiverId, callUniqueId, isAccept, type } = data;

//         try {
//             const [call, callerIdSocket, receiverIdSocket] = await Promise.all([
//                 db.Call.exists({
//                     callUniqueId: callUniqueId,
//                     callBy: type,
//                     userId: type === 'host' ? receiverId : callerId,
//                     hostId: type === 'host' ? callerId : receiverId
//                 }),
//                 io.in('id:' + callerId).fetchSockets(),
//                 io.in('id:' + receiverId).fetchSockets()
//             ]);

//             if (!call || !receiverIdSocket?.length || !callerIdSocket?.length) {
//                 console.log('callCancel emit in call Answer =============  isInvalidCall  =============> ', data);
//                 io.in('id:' + receiverId).emit('callCancel', data);
//                 io.in('id:' + callerId).emit('callCancel', data); // callcancel with check callUniqueId
//                 await resetUserStateForCall({ callerId, receiverId, callUniqueId });
//                 return;
//             }

//             if (isAccept) {
//                 await db.History.updateOne(
//                     { callUniqueId },
//                     { $set: { callConnect: true, callStartTime: new Date() } }
//                 );

//                 io.in('id:' + callerId).emit('callAnswer', data);

//                 callerIdSocket[0].join(callUniqueId);
//                 socket.join(callUniqueId);

//                 const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
//                 console.log('callUniqueIdSAockets ==== ', callUniqueIdSAockets?.length);

//                 console.log('callAnswer emit in call Answer ==========================> ', data);
//             } else {
//                 console.log('callCancel emit in call Answer for BOTH USER ===========================> ', data);

//                 io.in('id:' + receiverId).emit('callCancel', data);
//                 io.in('id:' + callerId).emit('callCancel', data); // callcancel with check callUniqueId
//                 await resetUserStateForCall({ callerId, receiverId, callUniqueId });
//             }
//         } catch (error) {
//             console.error('Error in callAnswer:', error);
//         }
//     });

//     // user emit only
//     socket.on('callCoinCut', async data => {
//         console.log('Data in callCoinCut ==========================> ', data);

//         const { callerId, receiverId, callUniqueId, type, charge } = data;
//         const userId = type == 'host' ? receiverId : callerId;
//         const user = await db.User.findOne({ _id: userId });
//         if (user.coins < charge) {
//             console.log('===== user.coins insufficientCoin:>> ', user.coins, charge);
//             io.in(callUniqueId).emit('insufficientCoin', data);
//             return;
//         }

//         try {
//             await Promise.all([
//                 db.History.updateOne(
//                     { callUniqueId },
//                     {
//                         $inc: {
//                             userCoin: charge
//                         },
//                         $set: {
//                             callEndTime: new Date()
//                         }
//                     }
//                 ),
//                 db.User.updateOne({ _id: userId }, { $inc: { coins: -charge } })
//             ]);

//             // Check and update user level based on coins spent
//             const levelUpInfo = await checkAndUpdateLevel(userId, charge);
//             if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
//                 io.in('id:' + userId).emit('levelUp', levelUpInfo);
//             }
//         } catch (error) {
//             console.error('Error in callCoinCut:', error);
//         }
//     });

//     // user emit only
//     socket.on('fakeCallCoinCut', async data => {
//         console.log('Data in fakeCallCoinCut ==========================> ', data);

//         const { hostId, callUniqueId, callType, charge } = data;
//         const [user, history] = await Promise.all([db.User.findOne({ _id: id }), db.History.findOne({ callUniqueId })]);

//         if (user.coins < charge) {
//             console.log('===== user.coins insufficientCoin:>> ', user.coins, charge);
//             io.in('id:' + id).emit('insufficientCoin', data);
//             return;
//         }
//         try {
//             if (history) {
//                 await db.History.updateOne(
//                     { callUniqueId },
//                     {
//                         $inc: {
//                             userCoin: charge
//                         },
//                         $set: {
//                             callEndTime: new Date()
//                         }
//                     }
//                 );
//             } else {
//                 await db.History.create({
//                     hostId,
//                     userId: id,
//                     callUniqueId,
//                     type: callType,
//                     callConnect: true,
//                     callStartTime: new Date(),
//                     callEndTime: new Date(),
//                     userCoin: charge
//                 });
//             }
//             await db.User.updateOne({ _id: id }, { $inc: { coins: -charge } });

//             // Check and update user level based on coins spent
//             const levelUpInfo = await checkAndUpdateLevel(id, charge);
//             if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
//                 io.in('id:' + id).emit('levelUp', levelUpInfo);
//             }
//         } catch (error) {
//             console.error('Error in callCoinCut:', error);
//         }
//     });

//     socket.on('fakeCallEnd', async data => {
//         const { callUniqueId } = data;
//         await db.History.updateOne({ callUniqueId }, { $set: { callEndTime: new Date() } });
//     });
//     // caller emit only
//     socket.on('callCancel', async data => {
//         // when caller cancle call
//         console.log('Data in callCancel ==========================> ', data);
//         const { callerId, receiverId, callUniqueId } = data;
//         await Promise.all([
//             resetUserStateForCall({ callerId, receiverId, callUniqueId }),
//             db.History.updateOne(
//                 // rare secinario bcz caller cancle call before call connect
//                 { callUniqueId, callConnect: true, callStartTime: { $ne: null } },
//                 { $set: { callConnect: false, callStartTime: null, callEndTime: null } }
//                 // bcz this event call when call not connect
//             )
//         ]);
//         const callUniqueIdSAockets = await io.in('id:' + receiverId).fetchSockets();
//         console.log('callCancel ==== callCancel ===== receiverId', callUniqueIdSAockets?.length);
//         io.in('id:' + receiverId).emit('callCancel', data);
//     });

//     // both sie emit after call join call decline
//     socket.on('callDecline', async data => {
//         // after call answer , for call cut emit callDecline from any side
//         console.log('Data in callDecline ==========================> ', data);
//         const { callerId, receiverId, callUniqueId } = data;

//         await Promise.all([
//             resetUserStateForCall({ callerId, receiverId, callUniqueId }),
//             db.History.updateOne({ callUniqueId, callConnect: true }, { $set: { callEndTime: new Date() } })
//         ]);
//         const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
//         console.log('callUniqueIdSAockets ==== 222', callUniqueIdSAockets?.length);
//         io.in(callUniqueId).emit('callDecline', { callUniqueId }); // callcancel with check callUniqueId
//     });

//     socket.on('chatCoinCut', async data => {
//         try {
//             console.log('Data in chatCoinCut ==========================> ');
//             const { hostId } = data;

//             const [user, host] = await Promise.all([
//                 db.User.findOne({ _id: id }),
//                 db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId')
//             ]);
//             const chatCharge = host?.hostProfile?.chatCharge || 0;
//             if (user.coins < chatCharge) {
//                 console.log('===== user.coins insufficientCoin:>> ', user.coins, chatCharge);
//                 socket.emit('insufficientCoin', data);
//                 return;
//             }

//             const userCoin = chatCharge;
//             const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.chatTax) / 100) || 0) || 0;
//             let hostCoin = coinAfterAdminTax;
//             let agencyCoin = 0;

//             user.coins -= userCoin;
//             await user.save();

//             const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

//             // Find the latest 'chat' entry within 5 minutes
//             let history = await db.History.findOne({
//                 userId: id,
//                 hostId,
//                 type: 'chat',
//                 createdAt: { $gte: fiveMinutesAgo }
//             }).sort({ createdAt: -1 });

//             if (history) {
//                 // Update coin values in the latest history
//                 history.userCoin += userCoin;
//             } else {
//                 // Create a new history entry
//                 history = new db.History({
//                     userId: id,
//                     hostId,
//                     type: 'chat',
//                     userCoin
//                 });
//             }

//             await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

//             // Check and update user level based on coins spent
//             const levelUpInfo = await checkAndUpdateLevel(id, userCoin);
//             if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
//                 socket.emit('levelUp', levelUpInfo);
//             }

//             socket.emit('User', user);
//         } catch (error) {
//             console.error('Error in chatCoinCut:', error);
//         }
//     });

//     // user side call gift call
//     socket.on('callGifts', async data => {
//         try {
//             console.log('Data in callGiftSend ==========================> ');
//             const { userId, hostId, giftId, giftCount, callUniqueId } = data;
//             const [user, gift] = await Promise.all([
//                 db.User.findOne({ _id: userId }),
//                 db.Gift.findOne({ _id: giftId, isActive: true })
//             ]);
//             if (!gift) return socket.emit('Error', 'Gift not found');
//             if (!user) return socket.emit('Error', 'User not found');
//             const giftActualCoins = gift.coins * giftCount;

//             if (user.coins < giftActualCoins) {
//                 console.log('===== user.coins insufficientCoin:>> ', user.coins, giftActualCoins);
//                 socket.emit('insufficientCoin', data);
//                 return;
//             }

//             const host = await db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId');

//             const userCoin = giftActualCoins;
//             const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.giftTax) / 100) || 0) || 0;
//             let hostCoin = coinAfterAdminTax;
//             let agencyCoin = 0;

//             user.coins -= userCoin;
//             await user.save();

//             const history = new db.History({
//                 userId: id,
//                 hostId,
//                 type: 'gift',
//                 giftId,
//                 userCoin,
//                 agencyCoin,
//                 giftCount,
//                 callUniqueId
//             });
//             await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

//             // Check and update user level based on coins spent
//             const levelUpInfo = await checkAndUpdateLevel(userId, userCoin);
//             if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
//                 io.in('id:' + userId).emit('levelUp', levelUpInfo);
//             }

//             const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
//             console.log('callGifts ==== callGifts ======= sockets ', callUniqueIdSAockets?.length);
//             io.in(callUniqueId).emit('callGifts', { giftId, giftCount, giftImage: gift?.image });
//         } catch (error) {
//             console.error('Error in giftCoinCut:', error);
//         }
//     });

//     socket.on('giftCoinCut', async data => {
//         try {
//             console.log('Data in giftCoinCut ==========================> ');
//             const { hostId, giftId, giftCount } = data;
//             const [user, gift] = await Promise.all([
//                 db.User.findOne({ _id: id }),
//                 db.Gift.findOne({ _id: giftId, isActive: true })
//             ]);
//             if (!gift) return socket.emit('Error', 'Gift not found');
//             if (!user) return socket.emit('Error', 'User not found');

//             const giftCoin = gift.coins * giftCount;

//             if (user.coins < giftCoin) {
//                 console.log('===== user.coins insufficientCoin:>> ', user.coins, giftCoin);
//                 socket.emit('insufficientCoin', data);
//                 return;
//             }

//             const host = await db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId');

//             const userCoin = giftCoin;
//             const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.giftTax) / 100) || 0) || 0;
//             let hostCoin = coinAfterAdminTax;
//             let agencyCoin = 0;

//             user.coins -= userCoin;
//             await user.save();

//             const history = new db.History({
//                 userId: id,
//                 hostId,
//                 type: 'gift',
//                 giftId,
//                 userCoin,
//                 giftCount
//             });

//             await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

//             // Check and update user level based on coins spent
//             const levelUpInfo = await checkAndUpdateLevel(id, userCoin);
//             if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
//                 socket.emit('levelUp', levelUpInfo);
//             }

//             socket.emit('User', user);
//         } catch (error) {
//             console.error('Error in giftCoinCut:', error);
//         }
//     });

//     socket.on('checkBlockStatus', async data => {
//         try {
//             const { otherUserId } = data;

//             const block = await db.Block.exists({
//                 $or: [
//                     { userId: id, hostId: otherUserId },
//                     { userId: otherUserId, hostId: id }
//                 ]
//             });

//             socket.emit('blockStatus', {
//                 isBlocked: !!block
//             });
//         } catch (error) {
//             console.error('Error in checkBlockStatus:', error);
//             socket.emit('blockStatus', {
//                 isBlocked: false,
//                 message: 'Something went wrong'
//             });
//         }
//     });

//     // Debug: Log ALL incoming socket events to see what's being received
//         socket.onAny((eventName, ...args) => {
//             console.log('📨 Socket Event Received - Event Name:', eventName || '(empty)');
//             console.log('   - Args:', JSON.stringify(args));
//             console.log('   - User ID:', id);

//             // Fix: Handle truncated event name "RandomCal" -> forward to "RandomCall"
//             if (eventName && (eventName === 'RandomCal' || eventName.startsWith('RandomCal'))) {
//                 const data = args && args.length > 0 ? args[0] : {};
//                 if (data && typeof data === 'object') {
//                     console.log('   - ⚠️  Detected truncated "RandomCal", forwarding to RandomCall handler...');
//                     // Trigger RandomCall handler by calling it directly
//                     setImmediate(async () => {
//                         await handleRandomCall(data);
//                     });
//                 }
//             }
//         });


//     // Postman sends events as "message" by default, so we handle it here
//     socket.on('message', async data => {
//         console.log('📩 Message event received:', data);
//         console.log('   - Data type:', typeof data);

//         // Check if it's RandomCall data
//         let parsedData = data;
//         if (typeof data === 'string') {
//             try {
//                 parsedData = JSON.parse(data);
//             } catch (e) {
//                 console.log('   - Not JSON, raw string:', data);
//             }
//         }

//         if (parsedData && typeof parsedData === 'object' && parsedData.agoraUID !== undefined) {
//             console.log('   - ✅ Detected RandomCall in message, forwarding...');
//             socket.emit('RandomCall', parsedData);
//         }
//     });

//     // Shared function for RandomCall handler logic
//     const handleRandomCall = async (data) => {
//         console.log('🎯 ========== RandomCall HANDLER TRIGGERED ==========');
//         console.log('📥 Data received:', JSON.stringify(data));
//         console.log('👤 User ID:', id);

//         try {
//             const { agoraUID = 0 } = data || {};
//             const userId = id;

//             console.log('✅ RandomCall event received for user:', userId);

//             // Check if user is free (not in a call, is online, not busy)
//             console.log('🔍 Step 1: Checking user status...');
//             const [user, existingCall, blockIds] = await Promise.all([
//                 db.User.findOne({ _id: userId, isHost: false }),
//                 db.Call.findOne({ userId }),
//                 db.Block.find({ userId }).distinct('hostId')
//             ]);

//             console.log('📋 Step 1 Results:');
//             console.log('   - User found:', !!user);
//             console.log('   - User isHost:', user?.isHost);
//             console.log('   - User isOnline:', user?.isOnline);
//             console.log('   - Existing call:', !!existingCall);
//             console.log('   - Blocked hosts count:', blockIds?.length || 0);

//             if (!user) {
//                 console.log('❌ Error: User not found');
//                 socket.emit('randomCallError', { message: 'User not found' });
//                 return;
//             }

//             if (!user.isOnline) {
//                 console.log('❌ Error: User is not online');
//                 socket.emit('randomCallError', { message: 'User is not online' });
//                 return;
//             }

//             if (existingCall) {
//                 console.log('❌ Error: User already in a call');
//                 socket.emit('randomCallError', { message: 'You are already in a call' });
//                 return;
//             }

//             // Get all hosts currently in calls
//             console.log('🔍 Step 2: Finding available hosts...');
//             const callHostIds = await db.Call.find({}).distinct('hostId');
//             console.log('   - Hosts in calls:', callHostIds?.length || 0);

//             // Fetch online hosts available for random call
//             // Note: isBusy check removed - if host is in a call, they're already excluded via callHostIds
//             // availableForRandomCall is optional - if not set, assume true
//             const hostIds = await db.User.find({
//                 _id: { $nin: [...blockIds, ...callHostIds] },
//                 isHost: true,
//                 isOnline: true,
//                 isBusy: false,
//                 'hostProfile.availableForRandomCall': true
//             }).distinct('_id');

//             console.log('📋 Step 2 Results:');
//             console.log('   - Available hosts found:', hostIds?.length || 0);
//             console.log('   - Available host IDs:', hostIds);

//             if (!hostIds || hostIds.length === 0) {
//                 console.log('❌ Error: No online hosts available');
//                 socket.emit('randomCallError', { message: 'No online hosts available' });
//                 return;
//             }

//             // Select random host
//             console.log('🔍 Step 3: Selecting random host...');
//             const receiverId = hostIds[Math.floor(Math.random() * hostIds.length)];
//             console.log('   - Selected host ID:', receiverId);

//             const host = await db.User.findOne({ _id: receiverId });
//             console.log('   - Host found:', !!host);
//             // console.log('   - Host name:', host?.name || 'N/A');

//             if (!host) {
//                 console.log('❌ Error: Selected host not found');
//                 socket.emit('randomCallError', { message: 'Selected host not found' });
//                 return;
//             }

//             // Generate call unique ID
//             console.log('🔍 Step 4: Creating call...');
//             const callUniqueId = generateuniqueId(10);
//             console.log('   - Generated callUniqueId:', callUniqueId);

//             // Create Agora token
//             console.log('🔍 Step 5: Creating Agora token...');
//             const role = RtcRole.PUBLISHER;
//             const expirationTimeInSeconds = 24 * 3600;
//             const currentTimestamp = Math.floor(Date.now() / 1000);
//             const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
//             const token = RtcTokenBuilder.buildTokenWithUid(
//                 globalSetting.agorakey,
//                 globalSetting.agoraCertificate,
//                 callUniqueId,
//                 agoraUID,
//                 role,
//                 privilegeExpiredTs
//             );

//             // Create call record
//             console.log('🔍 Step 6: Creating call and history records...');
//             await db.Call.create({
//                 userId,
//                 hostId: receiverId,
//                 callBy: 'user',
//                 callUniqueId,
//                 callType: 'random'
//             });
//             console.log('   - Call record created');

//             // Create history record
//             await db.History.create({
//                 userId,
//                 hostId: receiverId,
//                 callUniqueId,
//                 type: 'Random call',
//                 callBy: 'user'
//             });
//             console.log('   - History record created');

//             // Prepare call object
//             const callObj = {
//                 callerId: userId,
//                 callerName: user.name,
//                 callerImage: user.avatar,
//                 receiverId: receiverId,
//                 receiverName: host.name,
//                 receiverImage: host.avatar,
//                 callUniqueId,
//                 token,
//                 charge: host.hostProfile.videoCallCharge || globalSetting.minVideoCallCharge,
//                 type: 'user',
//                 callType: 'Random call'
//             };

//             // Send push notification to host
//             const payload = {
//                 title: 'Call Request',
//                 body: `${user.name} wants to call you`
//             };
//             const notificationData = {
//                 type: 'CALL',
//                 ...callObj,
//                 charge: String(callObj.charge)
//             };
//             await sendNotification({ tokens: host.fcmToken, payload, data: notificationData });
//             console.log('   - Push notification sent');

//             // Emit socket events
//             // To host: callRequest (incoming call)
//             io.sockets.in('id:' + receiverId).emit('callRequest', callObj);
//             console.log('   - callRequest event sent to host:', receiverId);

//             // To caller: randomCallMatched (call matched with host details)
//             socket.emit('randomCallMatched', callObj);
//             console.log('   - randomCallMatched event sent to caller:', userId);

//             console.log('Random call initiated successfully:', callUniqueId);
//             console.log('📞 Call Details:');
//             console.log('   - Caller:', user.name, '(ID:', userId + ')');
//             console.log('   - Host:', host.name, '(ID:', receiverId + ')');
//             console.log('   - Call Unique ID:', callUniqueId);
//             console.log('   - Charge:', callObj.charge);
//         } catch (error) {
//             console.error('Error in RandomCall:', error);
//             socket.emit('randomCallError', { message: error.message || 'Failed to initiate random call' });
//         }
//     };

//     // Frontend emits: socket.emit('RandomCall', { agoraUID: 0 })
//     socket.on('RandomCall', async data => {
//         await handleRandomCall(data);
//     });

//     socket.on('disconnect', async () => {
//         setTimeout(async () => {
//             const idSockets = await io.in('id:' + id).fetchSockets();
//             console.log('idSockets in disconnect ======= ', idSockets?.length);
//             if (!idSockets?.length) {
//                 socketDisconnectManage(id);
//             }
//             console.log('A user disconnected Finally ', id);
//         }, 5000);
//         console.log('A user disconnected 1st timeout ', id);
//     });
// });





const { verifyToken } = require('../middleware/authorization/authorization.js');
const { resetUserStateForCall, socketDisconnectManage, generateuniqueId } = require('./function.js');
const { db } = require('../src/model/index.js');
const { setUserOnline } = require('../utils/firebaseFunctions.js');
const { agencyHostCoinAdd } = require('../src/model/call.model.js');
const { checkAndUpdateLevel } = require('../src/services/level.service.js');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const { sendNotification } = require('./notificationFunc.js');

io.use(async (socket, next) => {
    const token = socket.handshake.headers.token;
    console.log('token --- ', token);
    // Assuming token is sent in auth object
    if (!token) {
        return next(new Error('Authorization token missing'));
    }
    try {
        // Verify token
        const decoded = await verifyToken(token);
        socket.user = decoded; // Attach decoded user info to socket for later user
        return next();
    } catch (err) {
        console.log('err :>> ', err);
        return next(new Error('Invalid authorization token'));
    }
});

io.on('connection', async socket => {
    // const { userHostId } = socket.handshake.query;
    const id = socket.user?.id;

    socket.join('id:' + id);
    console.log('A user connected ======== ', id);

    const user = await db.User.findOne({ _id: id });
    setUserOnline(id);
    user.isOnline = true;
    await user.save();

    // // call confirmed event emit from receiver side when they listen callRequest from queuePrivateCallFunc
    // socket.on('callConfirmed', async data => {
    //     console.log('Data in call Confirm ==========================> ', data);

    //     // emit call confirmed event to caller for calling to ringing state
    //     io.in('id:' + data.callerId).emit('callConfirmed', data);

    //     const callerUser = await db.User.findOne({ _id: data.callerId });

    //     if (callerUser && callerUser?.callUniqueId !== data?.callUniqueId) {
    //         console.log('callCancel emit in call Confirm ==========================> ', data.receiverId);
    //         io.in('id:' + data.receiverId).emit('callCancel', data);
    //         return;
    //     }
    // });

    socket.on('online', async data => {
        await db.User.updateOne({ _id: data.id }, { $set: { isOnline: true } });
    });

    // receiver emit only
    socket.on('callAnswer', async data => {
        console.log('Data in call Answer ==========================> ', data);

        const { callerId, receiverId, callUniqueId, isAccept, type } = data;

        try {
            const [call, callerIdSocket, receiverIdSocket] = await Promise.all([
                db.Call.exists({
                    callUniqueId: callUniqueId,
                    callBy: type,
                    userId: type === 'host' ? receiverId : callerId,
                    hostId: type === 'host' ? callerId : receiverId
                }),
                io.in('id:' + callerId).fetchSockets(),
                io.in('id:' + receiverId).fetchSockets()
            ]);

            if (!call || !receiverIdSocket?.length || !callerIdSocket?.length) {
                console.log('callCancel emit in call Answer =============  isInvalidCall  =============> ', data);
                io.in('id:' + receiverId).emit('callCancel', data);
                io.in('id:' + callerId).emit('callCancel', data); // callcancel with check callUniqueId
                await resetUserStateForCall({ callerId, receiverId, callUniqueId });
                return;
            }

            if (isAccept) {
                await db.History.updateOne(
                    { callUniqueId },
                    { $set: { callConnect: true, callStartTime: new Date() } }
                );

                io.in('id:' + callerId).emit('callAnswer', data);

                callerIdSocket[0].join(callUniqueId);
                socket.join(callUniqueId);

                const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
                console.log('callUniqueIdSAockets ==== ', callUniqueIdSAockets?.length);

                console.log('callAnswer emit in call Answer ==========================> ', data);
            } else {
                console.log('callCancel emit in call Answer for BOTH USER ===========================> ', data);

                io.in('id:' + receiverId).emit('callCancel', data);
                io.in('id:' + callerId).emit('callCancel', data); // callcancel with check callUniqueId
                await resetUserStateForCall({ callerId, receiverId, callUniqueId });
            }
        } catch (error) {
            console.error('Error in callAnswer:', error);
        }
    });

    // user emit only
    socket.on('callCoinCut', async data => {
        console.log('Data in callCoinCut ==========================> ', data);

        const { callerId, receiverId, callUniqueId, type, charge } = data;
        const userId = type == 'host' ? receiverId : callerId;
        const user = await db.User.findOne({ _id: userId });
        if (user.coins < charge) {
            console.log('===== user.coins insufficientCoin:>> ', user.coins, charge);
            io.in(callUniqueId).emit('insufficientCoin', data);
            return;
        }

        try {
            await Promise.all([
                db.History.updateOne(
                    { callUniqueId },
                    {
                        $inc: {
                            userCoin: charge
                        },
                        $set: {
                            callEndTime: new Date()
                        }
                    }
                ),
                db.User.updateOne({ _id: userId }, { $inc: { coins: -charge } })
            ]);

            // Check and update user level based on coins spent
            const levelUpInfo = await checkAndUpdateLevel(userId, charge);
            if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
                io.in('id:' + userId).emit('levelUp', levelUpInfo);
            }
        } catch (error) {
            console.error('Error in callCoinCut:', error);
        }
    });

    // user emit only - Fake Call Coin Deduction (periodic during call)
    socket.on('fakeCallCoinCut', async data => {
        console.log('Data in fakeCallCoinCut ==========================> ', data);

        const { hostId, callUniqueId, callType, charge } = data;
        const [user, history, host] = await Promise.all([
            db.User.findOne({ _id: id }),
            db.History.findOne({ callUniqueId }),
            db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId')
        ]);

        if (!user) {
            io.in('id:' + id).emit('fakeCallError', { message: 'User not found' });
            return;
        }

        if (user.coins < charge) {
            console.log('===== user.coins insufficientCoin:>> ', user.coins, charge);
            io.in('id:' + id).emit('insufficientCoin', data);
            // End the call if insufficient coins
            await db.History.updateOne({ callUniqueId }, { $set: { callEndTime: new Date() } });
            io.in('id:' + id).emit('fakeCallEnded', { callUniqueId, reason: 'insufficient_coins' });
            return;
        }

        try {
            const userCoin = charge;
            const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.callTax || 0) / 100) || 0) || 0;
            let hostCoin = coinAfterAdminTax;
            let agencyCoin = 0;

            if (history) {
                // Update existing history (don't set callEndTime here, only increment coins)
                await db.History.updateOne(
                    { callUniqueId },
                    {
                        $inc: {
                            userCoin: userCoin
                        }
                    }
                );
                // Update host coins
                await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });
            } else {
                // Create new history entry
                const newHistory = await db.History.create({
                    hostId,
                    userId: id,
                    callUniqueId,
                    type: callType || 'Video call',
                    callConnect: true,
                    callStartTime: new Date(),
                    userCoin: userCoin
                });
                await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, newHistory });
            }

            // Deduct coins from user
            await db.User.updateOne({ _id: id }, { $inc: { coins: -charge } });

            // Check and update user level based on coins spent
            const levelUpInfo = await checkAndUpdateLevel(id, charge);
            if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
                io.in('id:' + id).emit('levelUp', levelUpInfo);
            }

            // Emit updated user data
            const updatedUser = await db.User.findOne({ _id: id });
            io.in('id:' + id).emit('User', updatedUser);
        } catch (error) {
            console.error('Error in fakeCallCoinCut:', error);
            io.in('id:' + id).emit('fakeCallError', { message: error.message || 'Failed to deduct coins' });
        }
    });

    // Fake Call End - User ends the fake call
    socket.on('fakeCallEnd', async data => {
        try {
            console.log('Data in fakeCallEnd ==========================> ', data);
            const { callUniqueId, hostId } = data;

            const history = await db.History.findOne({ callUniqueId });
            if (history && !history.callEndTime) {
                await db.History.updateOne(
                    { callUniqueId },
                    { $set: { callEndTime: new Date() } }
                );

                // Calculate final call duration and update host coins if needed
                if (history.callStartTime && hostId) {
                    const host = await db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId');
                    if (host && history.userCoin > 0) {
                        const callTime = Math.floor((new Date() - history.callStartTime) / 1000); // in seconds
                        const callType = history.type;
                        const perMinuteCharge = callType === 'Video call'
                            ? (host.hostProfile?.videoCallCharge || 10)
                            : (host.hostProfile?.audioCallCharge || 5);

                        // Calculate coins based on actual call duration
                        const totalCharge = Math.ceil((perMinuteCharge / 60) * callTime);
                        const coinAfterAdminTax = Number(totalCharge - Number((totalCharge * globalSetting?.callTax || 0) / 100) || 0) || 0;
                        let hostCoin = coinAfterAdminTax;
                        let agencyCoin = 0;

                        await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });
                    }
                }

                io.in('id:' + id).emit('fakeCallEnded', { callUniqueId, callEndTime: new Date() });
                console.log('Fake call ended:', callUniqueId);
            }
        } catch (error) {
            console.error('Error in fakeCallEnd:', error);
            io.in('id:' + id).emit('fakeCallError', { message: error.message || 'Failed to end call' });
        }
    });
    // caller emit only
    socket.on('callCancel', async data => {
        // when caller cancle call
        console.log('Data in callCancel ==========================> ', data);
        const { callerId, receiverId, callUniqueId } = data;
        await Promise.all([
            resetUserStateForCall({ callerId, receiverId, callUniqueId }),
            db.History.updateOne(
                // rare secinario bcz caller cancle call before call connect
                { callUniqueId, callConnect: true, callStartTime: { $ne: null } },
                { $set: { callConnect: false, callStartTime: null, callEndTime: null } }
                // bcz this event call when call not connect
            )
        ]);
        const callUniqueIdSAockets = await io.in('id:' + receiverId).fetchSockets();
        console.log('callCancel ==== callCancel ===== receiverId', callUniqueIdSAockets?.length);
        io.in('id:' + receiverId).emit('callCancel', data);
    });

    // both sie emit after call join call decline
    socket.on('callDecline', async data => {
        // after call answer , for call cut emit callDecline from any side
        console.log('Data in callDecline ==========================> ', data);
        const { callerId, receiverId, callUniqueId } = data;

        await Promise.all([
            resetUserStateForCall({ callerId, receiverId, callUniqueId }),
            db.History.updateOne({ callUniqueId, callConnect: true }, { $set: { callEndTime: new Date() } })
        ]);
        const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
        console.log('callUniqueIdSAockets ==== 222', callUniqueIdSAockets?.length);
        io.in(callUniqueId).emit('callDecline', { callUniqueId }); // callcancel with check callUniqueId
    });

    socket.on('chatCoinCut', async data => {
        try {
            console.log('Data in chatCoinCut ==========================> ');
            const { hostId } = data;

            const [user, host] = await Promise.all([
                db.User.findOne({ _id: id }),
                db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId')
            ]);
            const chatCharge = host?.hostProfile?.chatCharge || 0;
            if (user.coins < chatCharge) {
                console.log('===== user.coins insufficientCoin:>> ', user.coins, chatCharge);
                socket.emit('insufficientCoin', data);
                return;
            }

            const userCoin = chatCharge;
            const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.chatTax) / 100) || 0) || 0;
            let hostCoin = coinAfterAdminTax;
            let agencyCoin = 0;

            user.coins -= userCoin;
            await user.save();

            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

            // Find the latest 'chat' entry within 5 minutes
            let history = await db.History.findOne({
                userId: id,
                hostId,
                type: 'chat',
                createdAt: { $gte: fiveMinutesAgo }
            }).sort({ createdAt: -1 });

            if (history) {
                // Update coin values in the latest history
                history.userCoin += userCoin;
            } else {
                // Create a new history entry
                history = new db.History({
                    userId: id,
                    hostId,
                    type: 'chat',
                    userCoin
                });
            }

            await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

            // Check and update user level based on coins spent
            const levelUpInfo = await checkAndUpdateLevel(id, userCoin);
            if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
                socket.emit('levelUp', levelUpInfo);
            }

            socket.emit('User', user);

            // Emit updated host data to the host so they receive the coins in real-time
            io.in('id:' + hostId).emit('User', host);
        } catch (error) {
            console.error('Error in chatCoinCut:', error);
        }
    });

    socket.on('chatCoinRefund', async data => {
        try {
            console.log('Data in chatCoinRefund ==========================> ', data);
            const { userId, coins, hostId } = data;

            if (!userId || !coins) {
                console.log('chatCoinRefund Error: Missing userId or coins');
                return;
            }

            const refundAmount = parseInt(coins);
            if (isNaN(refundAmount) || refundAmount <= 0) {
                console.log('chatCoinRefund Error: Invalid coin amount');
                return;
            }

            const user = await db.User.findById(userId);
            if (!user) {
                console.log('chatCoinRefund Error: User not found');
                return;
            }

            // 1. Refund User (Credit)
            user.coins += refundAmount;
            await user.save();

            // 2. Deduct from Host (Debit) - ONLY if hostId is present
            if (hostId) {
                const host = await db.User.findById(hostId);
                if (host) {
                    // Calculate how much was likely added to host (Use same tax logic as chatCoinCut)
                    // If globalSetting is not available/loaded, fallback to 0 tax or handle error.
                    // Assuming globalSetting is available in scope as it is used in chatCoinCut
                    const chatTax = globalSetting?.chatTax || 0;
                    const amountAddedToHost = Number(refundAmount - Number((refundAmount * chatTax) / 100) || 0);

                    if (host.coins >= amountAddedToHost) {
                        host.coins -= amountAddedToHost;
                        await host.save();

                        console.log(`Deducted ${amountAddedToHost} coins from host ${hostId}`);

                        // Update Host Wallet Frontend
                        io.in('id:' + hostId).emit('User', host);
                    } else {
                        console.log(`Msg: Host ${hostId} has insufficient coins to deduct.`);
                        // Optional: Allow negative balance or partial deduction? Usually safe to just set to 0 or log.
                        // For now, we deduct what we can or skip? Let's strictly subtract.
                        host.coins = Math.max(0, host.coins - amountAddedToHost);
                        await host.save();
                        io.in('id:' + hostId).emit('User', host);
                    }
                }
            }

            // Create history entry for User
            const historyData = {
                userId: userId,
                type: 'Chat Refund',
                userCoin: refundAmount,
                isUserIncome: true,
                date: new Date(),
                note: 'Refund for no reply from host'
            };

            if (hostId) {
                historyData.hostId = hostId;
            }

            await db.History.create(historyData);

            console.log(`Refunded ${refundAmount} coins to user ${userId}`);

            // Emit updated user data so frontend wallet updates instantly
            io.in('id:' + userId).emit('User', user);

            // Emit success event
            io.in('id:' + userId).emit('chatRefundSuccess', {
                message: 'Refund successful',
                refundedAmount: refundAmount,
                totalCoins: user.coins
            });

        } catch (error) {
            console.error('Error in chatCoinRefund:', error);
        }
    });

    // ==================== FAKE CHAT HANDLERS ====================

    // Fake Chat - User sends message to fake host
    // =================== FAKE HOST SEND MESSAGE ===================
    socket.on('fakeHostSendMessage', async data => {
        try {
            const { userId, hostId, message } = data;

            const socketUserId = socket.user.id;

            // 🔐 Security: sender must be fake host himself
            if (socketUserId !== hostId) return;

            const host = await db.User.findOne({ _id: socketUserId, isFake: true });
            if (!host) return;

            // Send message to user
            io.in('id:' + userId).emit('chatMessage', {
                userId,
                hostId: socketUserId,
                sender: 'host',
                hostName: host.name,
                hostImage: host.avatar,
                message,
                timestamp: new Date()
            });

            console.log('Fake host message sent from', socketUserId, 'to user', userId);

        } catch (error) {
            console.error('fakeHostSendMessage error:', error);
        }
    });



    // ==================== FAKE VIDEO CALL HANDLERS ====================

    // Fake Video Call Start - User initiates fake video call with fake host
    // =================== FAKE VIDEO CALL START ===================
    socket.on('fakeVideoCallStart', async data => {
        try {
            console.log('Data in fakeVideoCallStart ==========================> ', data);
            const { hostId, agoraUID = 0, callType } = data;

            const [user, host] = await Promise.all([
                db.User.findOne({ _id: id }),
                db.User.findOne({ _id: hostId, isFake: true }).populate('hostProfile.agencyId')
            ]);

            if (!user) return socket.emit('fakeCallError', { message: 'User not found' });
            if (!host) return socket.emit('fakeCallError', { message: 'Host is not fake user' });

            const existingCall = await db.Call.findOne({ userId: id });
            if (existingCall) {
                socket.emit('fakeCallError', { message: 'You are already in a call' });
                return;
            }

            const actualCallType = callType || 'Video call';
            const callCharge = actualCallType === 'Video call'
                ? (host.hostProfile?.videoCallCharge || globalSetting.minVideoCallCharge || 10)
                : (host.hostProfile?.audioCallCharge || globalSetting.minAudioCallCharge || 5);

            const callUniqueId = generateuniqueId(10);

            // 🔹 CREATE CALL RECORD (was missing earlier)
            await db.Call.create({
                userId: id,
                hostId,
                callBy: 'user',
                callUniqueId,
                callType: actualCallType
            });

            const role = RtcRole.PUBLISHER;
            const expirationTimeInSeconds = 24 * 3600;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

            const token = RtcTokenBuilder.buildTokenWithUid(
                globalSetting.agorakey,
                globalSetting.agoraCertificate,
                callUniqueId,
                agoraUID,
                role,
                privilegeExpiredTs
            );

            await db.History.create({
                userId: id,
                hostId,
                callUniqueId,
                type: actualCallType,
                callBy: 'user',
                callConnect: true,
                callStartTime: new Date(),
                userCoin: 0
            });

            socket.emit('fakeCallStarted', {
                callUniqueId,
                hostId,
                hostName: host.name,
                hostImage: host.avatar,
                callType: actualCallType,
                token,
                charge: callCharge,
                callStartTime: new Date()
            });

            console.log('Fake call started:', callUniqueId);

        } catch (error) {
            console.error('Error in fakeVideoCallStart:', error);
            socket.emit('fakeCallError', { message: error.message || 'Failed to start fake call' });
        }
    });


    // user side call gift call
    socket.on('callGifts', async data => {
        try {
            console.log('Data in callGiftSend ==========================> ');
            const { userId, hostId, giftId, giftCount, callUniqueId } = data;
            const [user, gift] = await Promise.all([
                db.User.findOne({ _id: userId }),
                db.Gift.findOne({ _id: giftId, isActive: true })
            ]);
            if (!gift) return socket.emit('Error', 'Gift not found');
            if (!user) return socket.emit('Error', 'User not found');
            const giftActualCoins = gift.coins * giftCount;

            if (user.coins < giftActualCoins) {
                console.log('===== user.coins insufficientCoin:>> ', user.coins, giftActualCoins);
                socket.emit('insufficientCoin', data);
                return;
            }

            const host = await db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId');

            const userCoin = giftActualCoins;
            const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.giftTax) / 100) || 0) || 0;
            let hostCoin = coinAfterAdminTax;
            let agencyCoin = 0;

            user.coins -= userCoin;
            await user.save();

            const history = new db.History({
                userId: id,
                hostId,
                type: 'gift',
                giftId,
                userCoin,
                agencyCoin,
                giftCount,
                callUniqueId
            });
            await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

            // Check and update user level based on coins spent
            const levelUpInfo = await checkAndUpdateLevel(userId, userCoin);
            if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
                io.in('id:' + userId).emit('levelUp', levelUpInfo);
            }

            const callUniqueIdSAockets = await io.in(callUniqueId).fetchSockets();
            console.log('callGifts ==== callGifts ======= sockets ', callUniqueIdSAockets?.length);
            io.in(callUniqueId).emit('callGifts', { giftId, giftCount, giftImage: gift?.image });
        } catch (error) {
            console.error('Error in giftCoinCut:', error);
        }
    });

    socket.on('giftCoinCut', async data => {
        try {
            console.log('Data in giftCoinCut ==========================> ');
            const { hostId, giftId, giftCount } = data;
            const [user, gift] = await Promise.all([
                db.User.findOne({ _id: id }),
                db.Gift.findOne({ _id: giftId, isActive: true })
            ]);
            if (!gift) return socket.emit('Error', 'Gift not found');
            if (!user) return socket.emit('Error', 'User not found');

            const giftCoin = gift.coins * giftCount;

            if (user.coins < giftCoin) {
                console.log('===== user.coins insufficientCoin:>> ', user.coins, giftCoin);
                socket.emit('insufficientCoin', data);
                return;
            }

            const host = await db.User.findOne({ _id: hostId }).populate('hostProfile.agencyId');

            const userCoin = giftCoin;
            const coinAfterAdminTax = Number(userCoin - Number((userCoin * globalSetting?.giftTax) / 100) || 0) || 0;
            let hostCoin = coinAfterAdminTax;
            let agencyCoin = 0;

            user.coins -= userCoin;
            await user.save();

            const history = new db.History({
                userId: id,
                hostId,
                type: 'gift',
                giftId,
                userCoin,
                giftCount
            });

            await agencyHostCoinAdd({ coinAfterAdminTax, host, hostCoin, agencyCoin, history });

            // Check and update user level based on coins spent
            const levelUpInfo = await checkAndUpdateLevel(id, userCoin);
            if (levelUpInfo && levelUpInfo.newLevel > levelUpInfo.oldLevel) {
                socket.emit('levelUp', levelUpInfo);
            }

            socket.emit('User', user);
        } catch (error) {
            console.error('Error in giftCoinCut:', error);
        }
    });

    socket.on('checkBlockStatus', async data => {
        try {
            const { otherUserId } = data;

            const block = await db.Block.exists({
                $or: [
                    { userId: id, hostId: otherUserId },
                    { userId: otherUserId, hostId: id }
                ]
            });

            socket.emit('blockStatus', {
                isBlocked: !!block
            });
        } catch (error) {
            console.error('Error in checkBlockStatus:', error);
            socket.emit('blockStatus', {
                isBlocked: false,
                message: 'Something went wrong'
            });
        }
    });

    // Debug: Log ALL incoming socket events to see what's being received
    socket.onAny((eventName, ...args) => {
        console.log('📨 Socket Event Received - Event Name:', eventName || '(empty)');
        console.log('   - Args:', JSON.stringify(args));
        console.log('   - User ID:', id);

        // Fix: Handle truncated event name "RandomCal" -> forward to "RandomCall"
        if (eventName && (eventName === 'RandomCal' || eventName.startsWith('RandomCal'))) {
            const data = args && args.length > 0 ? args[0] : {};
            if (data && typeof data === 'object') {
                console.log('   - ⚠️  Detected truncated "RandomCal", forwarding to RandomCall handler...');
                // Trigger RandomCall handler by calling it directly
                setImmediate(async () => {
                    await handleRandomCall(data);
                });
            }
        }
    });


    // Postman sends events as "message" by default, so we handle it here
    socket.on('message', async data => {
        console.log('📩 Message event received:', data);
        console.log('   - Data type:', typeof data);

        // Check if it's RandomCall data
        let parsedData = data;
        if (typeof data === 'string') {
            try {
                parsedData = JSON.parse(data);
            } catch (e) {
                console.log('   - Not JSON, raw string:', data);
            }
        }

        if (parsedData && typeof parsedData === 'object' && parsedData.agoraUID !== undefined) {
            console.log('   - ✅ Detected RandomCall in message, forwarding...');
            socket.emit('RandomCall', parsedData);
        }
    });

    // Shared function for RandomCall handler logic
    const handleRandomCall = async (data) => {
        console.log('🎯 ========== RandomCall HANDLER TRIGGERED ==========');
        console.log('📥 Data received:', JSON.stringify(data));
        console.log('👤 User ID:', id);

        try {
            const { agoraUID = 0 } = data || {};
            const userId = id;

            console.log('✅ RandomCall event received for user:', userId);

            // Check if user is free (not in a call, is online, not busy)
            console.log('🔍 Step 1: Checking user status...');
            const [user, existingCall, blockIds] = await Promise.all([
                db.User.findOne({ _id: userId, isHost: false }),
                db.Call.findOne({ userId }),
                db.Block.find({ userId }).distinct('hostId')
            ]);

            console.log('📋 Step 1 Results:');
            console.log('   - User found:', !!user);
            console.log('   - User name:', user?.name || 'N/A');
            console.log('   - User isHost:', user?.isHost);
            console.log('   - User isOnline:', user?.isOnline);
            console.log('   - Existing call:', !!existingCall);
            console.log('   - Blocked hosts count:', blockIds?.length || 0);

            if (!user) {
                console.log('❌ Error: User not found');
                socket.emit('randomCallError', { message: 'User not found' });
                return;
            }

            if (!user.isOnline) {
                console.log('❌ Error: User is not online');
                socket.emit('randomCallError', { message: 'User is not online' });
                return;
            }

            if (existingCall) {
                console.log('❌ Error: User already in a call');
                socket.emit('randomCallError', { message: 'You are already in a call' });
                return;
            }

            // Get all hosts currently in calls
            console.log('🔍 Step 2: Finding available hosts...');
            const callHostIds = await db.Call.find({}).distinct('hostId');
            console.log('   - Hosts in calls:', callHostIds?.length || 0);

            // Fetch online hosts available for random call
            // Note: isBusy check removed - if host is in a call, they're already excluded via callHostIds
            // availableForRandomCall is optional - if not set, assume true
            const hostIds = await db.User.find({
                _id: { $nin: [...blockIds, ...callHostIds] },
                isHost: true,
                isOnline: true,
                isBusy: false,
                // isFake: false, // only real hosts 
                // isFake: true,  // Only fake hosts
                'hostProfile.availableForRandomCall': true
            }).distinct('_id');

            console.log('📋 Step 2 Results:');
            console.log('   - Available hosts found:', hostIds?.length || 0);
            console.log('   - Available host IDs:', hostIds);

            if (!hostIds || hostIds.length === 0) {
                console.log('❌ Error: No online hosts available');
                socket.emit('randomCallError', { message: 'No online hosts available' });
                return;
            }

            // Select random host
            console.log('🔍 Step 3: Selecting random host...');
            const receiverId = hostIds[Math.floor(Math.random() * hostIds.length)];
            console.log('   - Selected host ID:', receiverId);

            const host = await db.User.findOne({ _id: receiverId }).populate('hostProfile');
            console.log('   - Host found:', !!host);
            console.log('   - Host name:', host?.name || 'N/A');

            if (!host) {
                console.log('❌ Error: Selected host not found');
                socket.emit('randomCallError', { message: 'Selected host not found' });
                return;
            }

            // Generate call unique ID
            console.log('🔍 Step 4: Creating call...');
            const callUniqueId = generateuniqueId(10);
            console.log('   - Generated callUniqueId:', callUniqueId);

            // Create Agora token
            console.log('🔍 Step 5: Creating Agora token...');
            const role = RtcRole.PUBLISHER;
            const expirationTimeInSeconds = 24 * 3600;
            const currentTimestamp = Math.floor(Date.now() / 1000);
            const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;
            const token = RtcTokenBuilder.buildTokenWithUid(
                globalSetting.agorakey,
                globalSetting.agoraCertificate,
                callUniqueId,
                agoraUID,
                role,
                privilegeExpiredTs
            );

            // Create call record
            console.log('🔍 Step 6: Creating call and history records...');
            try {
                await db.Call.create({
                    userId,
                    hostId: receiverId,
                    callBy: 'user',
                    callUniqueId,
                    callType: 'Random call'
                });

                console.log('   - Call record created'); // ✔️ success ke baad hi log hoga

            } catch (e) {
                console.error('Call creation failed:', e);
                socket.emit('randomCallError', { message: 'Failed to create call' });
                return;
            }

            // Create history record
            await db.History.create({
                userId,
                hostId: receiverId,
                callUniqueId,
                type: 'Random call',
                callBy: 'user'
            });
            console.log('   - History record created');

            // Prepare call object
            const callObj = {
                callerId: userId,
                callerName: user.name,
                callerImage: user.avatar,
                receiverId: receiverId,
                receiverName: host.name,
                receiverImage: host.avatar,
                callUniqueId,
                token,
                charge: host.hostProfile?.videoCallCharge || globalSetting.minVideoCallCharge,
                type: 'user',
                callType: 'Random call'
            };

            // Send push notification to host
            const payload = {
                title: 'Call Request',
                body: `${user.name} wants to call you`
            };
            const notificationData = {
                type: 'CALL',
                ...callObj,
                charge: String(callObj.charge)
            };
            await sendNotification({ tokens: host.fcmToken, payload, data: notificationData });
            console.log('   - Push notification sent');

            // Emit socket events
            // To host: callRequest (incoming call)
            io.sockets.in('id:' + receiverId).emit('callRequest', callObj);
            console.log('   - callRequest event sent to host:', receiverId);

            // To caller: randomCallMatched (call matched with host details)
            socket.emit('randomCallMatched', callObj);
            console.log('   - randomCallMatched event sent to caller:', userId);

            console.log('Random call initiated successfully:', callUniqueId);
            console.log('📞 Call Details:');
            console.log('   - Caller:', user.name, '(ID:', userId + ')');
            console.log('   - Host:', host.name, '(ID:', receiverId + ')');
            console.log('   - Call Unique ID:', callUniqueId);
            console.log('   - Charge:', callObj.charge);
        } catch (error) {
            console.error('Error in RandomCall:', error);
            socket.emit('randomCallError', { message: error.message || 'Failed to initiate random call' });
        }
    };

    // Frontend emits: socket.emit('RandomCall', { agoraUID: 0 })
    socket.on('RandomCall', async data => {
        await handleRandomCall(data);
    });

    socket.on('disconnect', async () => {
        setTimeout(async () => {
            const idSockets = await io.in('id:' + id).fetchSockets();
            console.log('idSockets in disconnect ======= ', idSockets?.length);
            if (!idSockets?.length) {
                socketDisconnectManage(id);
            }
            console.log('A user disconnected Finally ', id);
        }, 5000);
        console.log('A user disconnected 1st timeout ', id);
    });
});
