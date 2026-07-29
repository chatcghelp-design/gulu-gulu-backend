// const { db } = require('../../model/index.js');
// const RESPONSE = require('../../../utils/response.js');
// const { generateuniqueId } = require('../../../utils/function.js');

// exports.getAllUserHost = async (req, res) => {
//     try {
//         const { laungageSearch = '', search = '', start = 0, limit = 20, from, to } = req.query;
//         const isHost = req.user.isHost;
//         const parsedStartRaw = parseInt(start);
//         const parsedLimitRaw = parseInt(limit);
//         let parsedStart = Number.isNaN(parsedStartRaw) || parsedStartRaw < 0 ? 0 : parsedStartRaw;
//         let parsedLimit = Number.isNaN(parsedLimitRaw) || parsedLimitRaw <= 0 ? 20 : Math.min(parsedLimitRaw, 100);

//         // Optional 1-based range handling: from-to overrides start/limit
//         const hasRange = typeof from !== 'undefined' && typeof to !== 'undefined';
//         if (hasRange) {
//             const fromNum = parseInt(from);
//             const toNum = parseInt(to);
//             if (!Number.isNaN(fromNum) && !Number.isNaN(toNum) && fromNum > 0 && toNum >= fromNum) {
//                 const rangeLimit = Math.min(toNum - fromNum + 1, 100);
//                 parsedStart = fromNum - 1;
//                 parsedLimit = rangeLimit;
//             }
//         }

//         const baseQuery = {
//             _id: { $ne: req.user.id },
//             isHost: !isHost, // if user is host → get users, else get hosts
//             isBlocked: false,
//             isDeleted: false,
//             ...(!globalSetting.isFake && { isFake: false }),
//             name: { $ne: '' }
//         };

//         // Apply language filter
//         if (laungageSearch.trim()) {
//             baseQuery['hostProfile.languages'] = { $regex: laungageSearch.trim(), $options: 'i' };
//         }

//         // Blocked users
//         const blockFilter = isHost ? { hostId: req.user.id } : { userId: req.user.id };
//         const blocked = await db.Block.find(blockFilter).select('hostId userId -_id');

//         const blockedIds = new Set();
//         blocked.forEach(b => {
//             if (isHost) blockedIds.add(String(b.userId));
//             else blockedIds.add(String(b.hostId));
//         });

//         if (blockedIds.size > 0) {
//             baseQuery._id = { ...baseQuery._id, $nin: Array.from(blockedIds) };
//         }

//         // Search filter
//         if (search.trim()) {
//             baseQuery.$or = [
//                 { uniqueId: { $regex: search.trim(), $options: 'i' } },
//                 { name: { $regex: search.trim(), $options: 'i' } },
//                 { email: { $regex: search.trim(), $options: 'i' } }
//             ];
//         }

//         // Aggregation with step-wise random sorting
//         const [total, users] = await Promise.all([
//             db.User.countDocuments(baseQuery),
//             db.User.aggregate([
//                 { $match: baseQuery },
//                 {
//                     $addFields: {
//                         sortPriority: {
//                             $switch: {
//                                 branches: [
//                                     { case: { $eq: ['$isOnline', true] }, then: 1 },
//                                     { case: { $eq: ['$isBusy', true] }, then: 2 }
//                                 ],
//                                 default: 3
//                             }
//                         },
//                         randomOrder: { $rand: {} }
//                     }
//                 },
//                 { $sort: { sortPriority: 1, randomOrder: 1 } },
//                 { $skip: parsedStart },
//                 { $limit: parsedLimit }
//             ])
//         ]);
//         console.log('Users fetched:', users.length);

//         // Follow list
//         const followFilter = isHost ? { hostId: req.user.id } : { userId: req.user.id };
//         const followList = await db.Follower.find(followFilter).select('hostId userId -_id');
//         const followedIds = new Set(followList.map(f => (isHost ? String(f.userId) : String(f.hostId))));

//         // Add isFollow flag
//         const modifiedUsers = users.map(user => ({
//             ...user,
//             isFollow: followedIds.has(String(user._id))
//         }));

//         const hasNext = parsedStart + users.length < total;
//         const hasPrev = parsedStart > 0;
//         const data = {
//             users: modifiedUsers,
//             pagination: {
//                 total,
//                 start: parsedStart,
//                 limit: parsedLimit,
//                 from: hasRange ? parsedStart + 1 : undefined,
//                 to: hasRange ? parsedStart + users.length : undefined,
//                 nextStart: hasNext ? parsedStart + users.length : null,
//                 prevStart: hasPrev ? Math.max(0, parsedStart - parsedLimit) : null,
//                 currentPage: parsedLimit > 0 ? Math.floor(parsedStart / parsedLimit) + 1 : 1,
//                 totalPages: parsedLimit > 0 ? Math.max(1, Math.ceil(total / parsedLimit)) : 1,
//                 hasNext,
//                 hasPrev
//             }
//         };

//         return RESPONSE.success(res, 200, 1001, data);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

// // get other user Host id wise
// exports.getOtherProfileById = async (req, res) => {
//     try {
//         const { id } = req.query;
//         const isHost = req.user.isHost; // false

//         const user = await db.User.findOne({ _id: id, isHost: !isHost, isBlocked: false, isDeleted: false }).lean();
//         if (!user) {
//             return RESPONSE.error(res, 400, 3010);
//         }
//         const blockFilter = isHost
//             ? { hostId: req.user.id, blockedBy: 'host', userId: id }
//             : { userId: req.user.id, blockedBy: 'user', hostId: id };

//         const blocked = await db.Block.exists(blockFilter);
//         if (blocked) {
//             return RESPONSE.error(res, 400, 8006);
//         }
//         let isFollow = false;
//         if (isHost) {
//             isFollow = !!(await db.Follower.exists({ userId: id, hostId: req.user.id, followBy: 'host' }));
//         } else {
//             isFollow = !!(await db.Follower.exists({ userId: req.user.id, hostId: id, followBy: 'user' }));
//         }
//         console.log('isFollow', isFollow);
//         return RESPONSE.success(res, 200, 1001, { ...user, isFollow: isFollow || false });
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

// exports.getProfile = async (req, res) => {
//     try {
//         const isHost = req.user.isHost;

//         const user = await db.User.findOne({
//             _id: req.user.id,
//             isHost: isHost,
//             isBlocked: false,
//             isDeleted: false
//         });

//         return RESPONSE.success(res, 200, 1001, user);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

// exports.updateProfile = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const { name, age, bio, gender, fcmToken, languages, interests, videoCallCharge, audioCallCharge, chatCharge } =
//             req.body;
//         const image = req.file ? req.file.path : undefined;

//         const user = await db.User.findById(userId);
//         if (!user) {
//             return RESPONSE.error(res, 404, 'User not found');
//         }

//         // Update fields if provided
//         if (name) user.name = name;
//         if (age) user.age = age;
//         if (bio) user.bio = bio;
//         if (gender) user.gender = gender;
//         if (fcmToken) user.fcmToken = fcmToken;
//         if (image) user.avatar = image;

//         await user.save();

//         if (user.isHost) {
//             if (languages) {
//                 user.hostProfile.languages = Array.isArray(languages)
//                     ? languages
//                     : languages.split(',').map(lang => lang.trim());
//             }
//             if (interests) {
//                 user.hostProfile.interests = Array.isArray(interests)
//                     ? interests
//                     : interests.split(',').map(interest => interest.trim());
//             }

//             await user.save();

//             if (videoCallCharge) {
//                 if (globalSetting.minVideoCallCharge <= videoCallCharge) {
//                     user.hostProfile.videoCallCharge = videoCallCharge;
//                 } else {
//                     return RESPONSE.error(res, 400, 'Minimum video call charge is ' + globalSetting.minVideoCallCharge);
//                 }
//             }
//             if (audioCallCharge) {
//                 if (globalSetting.minAudioCallCharge <= audioCallCharge) {
//                     user.hostProfile.audioCallCharge = audioCallCharge;
//                 } else {
//                     return RESPONSE.error(res, 400, 'Minimum audio call charge is ' + globalSetting.minAudioCallCharge);
//                 }
//             }
//             if (chatCharge) {
//                 if (globalSetting.minChatCharge <= chatCharge) {
//                     user.hostProfile.chatCharge = chatCharge;
//                 } else {
//                     return RESPONSE.error(res, 400, 'Minimum chat charge is ' + globalSetting.minChatCharge);
//                 }
//             }
//             await user.save();
//         }

//         return RESPONSE.success(res, 200, 1001, user);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

// exports.saveFcmToken = async (req, res) => {
//     try {
//         const id = req.user.id;
//         const { fcmToken } = req.body;

//         await db.User.findByIdAndUpdate(id, { fcmToken });

//         return RESPONSE.success(res, 200, 1001);
//     } catch (err) {
//         console.error('FCM Error:', err);
//         res.status(500).json({ success: false, message: 'Internal Server Error' });
//     }
// };

// exports.updateUserCoins = async (req, res) => {
//     try {
//         const { userId, coins } = req.body;
//         if (!userId || coins === undefined) {
//             return RESPONSE.error(res, 400, 1000, 'userId and coins are required');
//         }
//         const user = await db.User.findByIdAndUpdate(userId, { coins }, { new: true });

//         await db.History.create({
//             userId,
//             type: 'Admin Coin',
//             userCoin: coins
//         });

//         return RESPONSE.success(res, 200, 1001, {
//             message: 'User coins updated successfully',
//             userId: user._id,
//             coins: user.coins
//         });
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

// exports.deleteAccount = async (req, res) => {
//     try {
//         const id = req.user.id;
//         const number = generateuniqueId(4);
//         const user = await db.User.findById(id);
//         user.isDeleted = true;
//         user.identity = `${number}-deleted-${user.identity}`;
//         user.email = `${number}-deleted-${user.identity}`;
//         await user.save();
//         return RESPONSE.success(res, 200, 1001);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };



const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const { generateuniqueId } = require('../../../utils/function.js');
const mongoose = require('mongoose');

exports.getAllUserHost = async (req, res) => {
    try {
        const { laungageSearch = '', search = '', start = 0, limit = 100 } = req.query;
        const isHost = req.user.isHost;
        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);
        const setting = await db.Setting.findOne({});

        const baseQuery = {
            _id: { $ne: new mongoose.Types.ObjectId(req.user.id) },
            isHost: !isHost, // if user is host → get users, else get hosts
            isBlocked: false,
            isDeleted: false,
            ...(!setting?.isFake && { isFake: { $ne: true } }),
            name: { $ne: '' }
        };

        // Apply language filter
        if (laungageSearch.trim()) {
            baseQuery['hostProfile.languages'] = { $regex: laungageSearch.trim(), $options: 'i' };
        }

        // Blocked users
        const blockFilter = isHost
            ? { hostId: new mongoose.Types.ObjectId(req.user.id) }
            : { userId: new mongoose.Types.ObjectId(req.user.id) };
        const blocked = await db.Block.find(blockFilter).select('hostId userId -_id');

        const blockedIds = new Set();
        blocked.forEach(b => {
            if (isHost) blockedIds.add(String(b.userId));
            else blockedIds.add(String(b.hostId));
        });

        if (blockedIds.size > 0) {
            baseQuery._id = {
                ...baseQuery._id,
                $nin: Array.from(blockedIds).map(id => new mongoose.Types.ObjectId(id))
            };
        }

        // Search filter
        if (search.trim()) {
            baseQuery.$or = [
                { uniqueId: { $regex: search.trim(), $options: 'i' } },
                { name: { $regex: search.trim(), $options: 'i' } },
                { email: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // Aggregation with step-wise random sorting
        const users = await db.User.aggregate([
            { $match: baseQuery },
            {
                $addFields: {
                    sortPriority: {
                        $switch: {
                            branches: [
                                { case: { $and: [{ $eq: ['$isOnline', true] }, { $ne: ['$isFake', true] }] }, then: 1 }, // Real online
                                { case: { $and: [{ $eq: ['$isBusy', true] }, { $ne: ['$isFake', true] }] }, then: 2 }, // Real busy
                                { case: { $and: [{ $eq: ['$isOnline', true] }, { $eq: ['$isFake', true] }] }, then: 3 }, // Fake online
                                { case: { $and: [{ $eq: ['$isBusy', true] }, { $eq: ['$isFake', true] }] }, then: 4 }, // Fake busy
                                { case: { $eq: ['$isFake', true] }, then: 5 }, // Fake offline
                            ],
                            default: 6 // Real offline
                        }
                    },
                    randomOrder: { $rand: {} }
                }
            },
            { $sort: { sortPriority: 1, randomOrder: 1 } },
            { $skip: parsedStart },
            { $limit: parsedLimit },
            { $project: { levelUpDate: 0 } }
        ]);


        // Follow list
        const followFilter = isHost ? { hostId: req.user.id } : { userId: req.user.id };
        const followList = await db.Follower.find(followFilter).select('hostId userId -_id');
        const followedIds = new Set(followList.map(f => (isHost ? String(f.userId) : String(f.hostId))));

        // Get all user IDs
        const userIds = users.map(u => new mongoose.Types.ObjectId(u._id));

        // Fetch all images for all users
        const allImages = await db.Image.find({
            userId: { $in: userIds },
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();

        // Group images by userId
        const imagesMap = new Map();
        allImages.forEach(img => {
            const userIdStr = String(img.userId);
            if (!imagesMap.has(userIdStr)) {
                imagesMap.set(userIdStr, []);
            }
            imagesMap.get(userIdStr).push({
                _id: img._id,
                image: img.image,
                imageType: img.imageType,
                createdAt: img.createdAt
            });
        });

        // Add isFollow flag and images to each user
        const modifiedUsers = users.map(user => {
            const userIdStr = String(user._id);

            // Do not override hostProfile charges with global settings anymore

            return {
                ...user,
                isFollow: followedIds.has(userIdStr),
                images: imagesMap.get(userIdStr) || []
            };
        });

        const totalHosts = await db.User.countDocuments(baseQuery);

        return RESPONSE.success(res, 200, 1001, modifiedUsers, { totalHosts });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// get other user Host id wise
exports.getOtherProfileById = async (req, res) => {
    try {
        const { id } = req.query;
        const isHost = req.user.isHost; // false
        const setting = await db.Setting.findOne({});

        const user = await db.User.findOne({ _id: id, isHost: !isHost, isBlocked: false, isDeleted: false }).select('-levelUpDate').lean();
        if (!user) {
            return RESPONSE.error(res, 400, 3010);
        }
        const blockFilter = isHost
            ? { hostId: req.user.id, blockedBy: 'host', userId: id }
            : { userId: req.user.id, blockedBy: 'user', hostId: id };

        const blocked = await db.Block.exists(blockFilter);
        if (blocked) {
            return RESPONSE.error(res, 400, 8006);
        }
        let isFollow = false;
        if (isHost) {
            isFollow = !!(await db.Follower.exists({ userId: id, hostId: req.user.id, followBy: 'host' }));
        } else {
            isFollow = !!(await db.Follower.exists({ userId: req.user.id, hostId: id, followBy: 'user' }));
        }

        // Fetch all images for the user
        const images = await db.Image.find({
            userId: new mongoose.Types.ObjectId(id),
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();



        // Add images array to hostProfile if user is a host, otherwise add to root
        const imagesArray = images.map(img => ({
            _id: img._id,
            image: img.image,
            imageType: img.imageType,
            createdAt: img.createdAt
        }));

        if (user.isHost && user.hostProfile) {
            user.hostProfile.images = imagesArray;
        } else {
            user.images = imagesArray;
        }

        // Do not override hostProfile charges with global settings anymore

        console.log('isFollow', isFollow);
        return RESPONSE.success(res, 200, 1001, { ...user, isFollow: isFollow || false });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.getProfile = async (req, res) => {
    try {
        const isHost = req.user.isHost;
        const setting = await db.Setting.findOne({});

        const user = await db.User.findOne({
            _id: req.user.id,
            isHost: isHost,
            isBlocked: false,
            isDeleted: false
        }).select('-levelUpDate').lean();

        if (!user) {
            return RESPONSE.error(res, 404, 'User not found');
        }

        // Fetch all images for the user
        const images = await db.Image.find({
            userId: new mongoose.Types.ObjectId(req.user.id),
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();

        // Map images to the required format
        let imagesArray = images.map(img => ({
            _id: img._id,
            image: img.image,
            imageType: img.imageType,
            createdAt: img.createdAt
        }));

        // If no images exist but avatar exists, save avatar to Image collection and add to array
        // This handles cases where fake hosts were created before image saving was implemented
        if (imagesArray.length === 0 && user.avatar) {
            // Check if avatar already exists in Image collection
            const existingAvatarImage = await db.Image.findOne({
                userId: new mongoose.Types.ObjectId(req.user.id),
                image: user.avatar,
                isDeleted: false
            });

            if (!existingAvatarImage) {
                // Save avatar to Image collection
                const avatarImage = await db.Image.create({
                    userId: req.user.id,
                    image: user.avatar,
                    imageType: user.imageType || 1,
                    isDeleted: false
                });

                imagesArray = [{
                    _id: avatarImage._id,
                    image: avatarImage.image,
                    imageType: avatarImage.imageType,
                    createdAt: avatarImage.createdAt
                }];
            } else {
                imagesArray = [{
                    _id: existingAvatarImage._id,
                    image: existingAvatarImage.image,
                    imageType: existingAvatarImage.imageType,
                    createdAt: existingAvatarImage.createdAt
                }];
            }
        }

        // Add images array to hostProfile if user is a host, otherwise add to root
        if (user.isHost && user.hostProfile) {
            user.hostProfile.images = imagesArray;
        } else {
            user.images = imagesArray;
        }

        // Do not override hostProfile charges with global settings anymore

        return RESPONSE.success(res, 200, 1001, user);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};


exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('--- updateProfile API Called ---');
        console.log('userId:', userId);
        console.log('req.body:', req.body);
        console.log('req.files:', req.files);

        const {
            name,
            age,
            bio,
            gender,
            fcmToken,
            languages,
            interests,
            videoCallCharge,
            audioCallCharge,
            chatCharge
        } = req.body;

        const user = await db.User.findById(userId);
        if (!user) return RESPONSE.error(res, 404, "User not found");

        const globalSetting = await db.Setting.findOne({});

        let avatarFile = null;
        let imageFiles = [];

        if (req.files) {
            if (req.files.avatar && req.files.avatar.length > 0) {
                avatarFile = req.files.avatar[0].path; // single avatar
            }

            if (req.files.image && req.files.image.length > 0) {
                imageFiles = req.files.image.map(f => f.path); // multiple images
            }
        }

        if (name) user.name = name;
        if (age) user.age = age;
        if (bio) user.bio = bio;
        if (gender) user.gender = gender;
        if (fcmToken) user.fcmToken = fcmToken;

        if (avatarFile) user.avatar = avatarFile;

        if (user.isHost) {

            if (languages) {
                user.hostProfile.languages = Array.isArray(languages)
                    ? languages
                    : languages.split(",").map(x => x.trim());
            }

            if (interests) {
                user.hostProfile.interests = Array.isArray(interests)
                    ? interests
                    : interests.split(",").map(x => x.trim());
            }

            // MINIMUM CHARGE VALIDATION
            if (videoCallCharge) {
                if (videoCallCharge < (globalSetting?.minVideoCallCharge || 0))
                    return RESPONSE.error(res, 400, "Minimum video call charge is " + (globalSetting?.minVideoCallCharge || 0));

                user.hostProfile.videoCallCharge = videoCallCharge;
            }

            if (audioCallCharge) {
                if (audioCallCharge < (globalSetting?.minAudioCallCharge || 0))
                    return RESPONSE.error(res, 400, "Minimum audio call charge is " + (globalSetting?.minAudioCallCharge || 0));

                user.hostProfile.audioCallCharge = audioCallCharge;
            }

            if (chatCharge) {
                if (chatCharge < (globalSetting?.minChatCharge || 0))
                    return RESPONSE.error(res, 400, "Minimum chat charge is " + (globalSetting?.minChatCharge || 0));

                user.hostProfile.chatCharge = chatCharge;
            }
        }

        await user.save();

        if (imageFiles.length > 0) {
            const imageDocs = imageFiles.map(imgPath => ({
                userId: user._id,
                image: imgPath,
                imageType: 1
            }));

            await db.Image.insertMany(imageDocs);
        }
        
        const allImages = await db.Image.find({
            userId: user._id,
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();

        const userResponse = user.toObject();
        delete userResponse.levelUpDate;

        const imagesArray = allImages.map(img => ({
            _id: img._id,
            image: img.image,
            imageType: img.imageType,
            createdAt: img.createdAt
        }));

        if (userResponse.isHost && userResponse.hostProfile) {
            userResponse.hostProfile.images = imagesArray;
        } else {
            userResponse.images = imagesArray;
        }

        return RESPONSE.success(res, 200, 1001, userResponse);

    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.deleteImage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { imageId } = req.params;

        if (!imageId) {
            return RESPONSE.error(res, 400, 3001, 'Image ID is required');
        }

        // Find the image and verify it belongs to the user
        const image = await db.Image.findOne({
            _id: imageId,
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false
        });

        if (!image) {
            return RESPONSE.error(res, 404, 3002, 'Image not found or already deleted');
        }

        // Soft delete the image
        image.isDeleted = true;
        await image.save();

        return RESPONSE.success(res, 200, 1001, { message: 'Image deleted successfully', imageId: image._id });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

// exports.getLevels = async (req, res) => {
//     try {
//         const { includeInactive } = req.query;
//         const filter = includeInactive === 'true' ? {} : { isActive: true };
//         const levels = await db.Level.find(filter).sort({ coinRequirement: 1, level: 1 });

//         return RESPONSE.success(res, 200, 1001, levels);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };
exports.getLevels = async (req, res) => {
    try {
        const levels = await db.Level.find().sort({ coinRequirement: 1 });
        return RESPONSE.success(res, 200, 1408, levels);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
exports.saveFcmToken = async (req, res) => {
    try {
        const id = req.user.id;
        const { fcmToken } = req.body;

        await db.User.findByIdAndUpdate(id, { fcmToken });

        return RESPONSE.success(res, 200, 1001);
    } catch (err) {
        console.error('FCM Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.updateUserCoins = async (req, res) => {
    try {
        const { userId, coins } = req.body;
        if (!userId || coins === undefined) {
            return RESPONSE.error(res, 400, 1000, 'userId and coins are required');
        }
        const user = await db.User.findByIdAndUpdate(userId, { coins }, { new: true });

        await db.History.create({
            userId,
            type: 'Admin Coin',
            userCoin: coins
        });

        return RESPONSE.success(res, 200, 1001, {
            message: 'User coins updated successfully',
            userId: user._id,
            coins: user.coins
        });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        const id = req.user.id;
        const number = generateuniqueId(4);
        const user = await db.User.findById(id);
        user.isDeleted = true;
        user.identity = `${number}-deleted-${user.identity}`;
        user.email = `${number}-deleted-${user.identity}`;
        await user.save();
        return RESPONSE.success(res, 200, 1001);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};


//fake hosts list

exports.getFakeHosts = async (req, res) => {
    try {
        const { search = '', start = 0, limit = 20 } = req.query;
        const parsedStart = parseInt(start) || 0;
        const parsedLimit = Math.min(parseInt(limit) || 20, 50);

        const baseQuery = {
            _id: { $ne: req.user.id },
            isHost: true,
            isFake: true,
            isBlocked: false,
            isDeleted: false,
            name: { $ne: '' }
        };

        if (search.trim()) {
            baseQuery.$or = [
                { name: { $regex: search.trim(), $options: 'i' } },
                { uniqueId: { $regex: search.trim(), $options: 'i' } }
            ];
        }

        // blocked users remove
        const blockFilter = { userId: new mongoose.Types.ObjectId(req.user.id) };
        const blocked = await db.Block.find(blockFilter).select('hostId -_id');

        const blockedIds = blocked.map(b => b.hostId);

        if (blockedIds.length > 0) {
            baseQuery._id = {
                ...baseQuery._id, // Preserve $ne check
                $nin: blockedIds.map(id => new mongoose.Types.ObjectId(id))
            };
        }

        const users = await db.User.aggregate([
            { $match: baseQuery },
            {
                $addFields: {
                    sortPriority: {
                        $cond: [{ $eq: ['$isOnline', true] }, 1, 2]
                    },
                    randomOrder: { $rand: {} }
                }
            },
            { $sort: { sortPriority: 1, randomOrder: 1 } },
            { $skip: parsedStart },
            { $limit: parsedLimit }
        ]);

        const userIds = users.map(u => new mongoose.Types.ObjectId(u._id));

        const images = await db.Image.find({
            userId: { $in: userIds },
            isDeleted: false
        }).lean();

        const imageMap = {};
        images.forEach(img => {
            const key = String(img.userId);
            if (!imageMap[key]) imageMap[key] = [];
            imageMap[key].push(img);
        });

        const finalUsers = users.map(u => ({
            ...u,
            images: imageMap[String(u._id)] || []
        }));

        return RESPONSE.success(res, 200, 1001, finalUsers);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
