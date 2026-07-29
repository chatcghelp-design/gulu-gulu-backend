const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');
const { generate8DigitId } = require('../../../utils/function.js');

exports.createFakeHost = async (req, res) => {
    try {
        const { name, email, age, bio, avatar, video, interests, imageType, videoType , countryCode, country } = req.body;

        let [user, language] = await Promise.all([
            db.User.findOne({ email }),
            db.Language.find({ isDeleted: false }).select('language')
        ]);
        if (user) {
            return RESPONSE.error(res, 400, 3013);
        }
        language = language.map(item => item.language);

        const uniqueId = await generate8DigitId(8);

        // Handle multiple image uploads
        const imageFiles = req.files?.image || [];
        const imagePaths = imageFiles.map(file => file.path);
        const firstImage = imagePaths.length > 0 ? imagePaths[0] : undefined;
        
        // Parse imageType - default to 1 if images are uploaded but imageType is not provided
        const parsedImageType = imagePaths.length > 0 
            ? (imageType ? parseInt(imageType) : 1)
            : (imageType ? parseInt(imageType) : 1);

        // If imageType is 1 (file upload), use first image as avatar
        // Multiple images are accepted, but only first one is stored in avatar field
        const avatarValue = parsedImageType == 1 
            ? (firstImage || undefined)
            : avatar;

        const videoFile = req.files?.video?.[0]?.path || undefined;

        user = await db.User.create({
            name,
            email,
            identity: uniqueId,
            uniqueId,
            age,
            bio,
            avatar: avatarValue,
            imageType: parsedImageType,
            video: videoType == 1 ? videoFile : video,
            videoType: videoType || 1,
            isHost: true,
            isFake: true,
            isOnline: true,
            hostProfile: {
                interests,
                // random maximum 3 lanuage for fake host
                languages: language.sort(() => Math.random() - 0.5).slice(0, 3),
                videoCallCharge: globalSetting?.minVideoCallCharge || 0,
                audioCallCharge: globalSetting?.minAudioCallCharge || 0,
                chatCharge: globalSetting?.minChatCharge || 0,
                availableForVideoCall: true,
                availableForAudioCall: true
            },
            countryCode: countryCode || '',
            country: country || ''
        });

        // Save all uploaded images to Image collection
        // If images are uploaded, always save them (imageType defaults to 1 for file uploads)
        if (imagePaths.length > 0) {
            try {
                // Save all uploaded images (including the first one which is used as avatar)
                const imageDocs = imagePaths.map(imagePath => ({
                    userId: user._id,
                    image: imagePath,
                    imageType: 1,
                    isDeleted: false
                }));

                console.log('Saving images to database:', imageDocs.length, 'images');
                console.log('Image docs:', JSON.stringify(imageDocs, null, 2));
                const savedImages = await db.Image.insertMany(imageDocs);
                console.log('Successfully saved', savedImages.length, 'images');
            } catch (saveError) {
                console.error('Error saving images to database:', saveError);
                // Continue even if image save fails
            }
        } else if (parsedImageType == 2 && avatar) {
            // If imageType is 2 (URL), save the avatar URL as an image
            await db.Image.create({
                userId: user._id,
                image: avatar,
                imageType: 2,
                isDeleted: false
            });
        } else if (avatarValue && parsedImageType != 1) {
            // If no images were uploaded but avatar exists (and it's not from file upload)
            // Save the avatar as an image
            const existingImage = await db.Image.findOne({
                userId: user._id,
                image: avatarValue,
                isDeleted: false
            });

            if (!existingImage) {
                await db.Image.create({
                    userId: user._id,
                    image: avatarValue,
                    imageType: parsedImageType,
                    isDeleted: false
                });
            }
        }

        // Fetch all images for the created user to include in response
        const images = await db.Image.find({
            userId: user._id,
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();

        // Convert user to object and add images array to hostProfile
        const userObj = user.toObject();
        const imagesArray = images.map(img => ({
            _id: img._id,
            image: img.image,
            imageType: img.imageType,
            createdAt: img.createdAt
        }));

        // Add images to hostProfile if user is a host
        if (userObj.hostProfile && userObj.isHost) {
            userObj.hostProfile.images = imagesArray;
        } else {
            userObj.images = imagesArray;
        }

        return RESPONSE.success(res, 200, 1001, userObj);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
exports.updateFakeHost = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age, bio, avatar, video, interests, languages, imageType, videoType , countryCode, country } = req.body;

        let user = await db.User.findOne({ _id: id });
        if (!user) {
            return RESPONSE.error(res, 400, 3012);
        }

        if (user.email.trim() !== email.trim()) {
            const emailExists = await db.User.findOne({ email });
            if (emailExists) {
                return RESPONSE.error(res, 400, 2003);
            }
        }

        // Handle multiple image uploads
        const imageFiles = req.files?.image || [];
        const imagePaths = imageFiles.map(file => file.path);
        const firstImage = imagePaths.length > 0 ? imagePaths[0] : undefined;
        
        const videoFile = req.files?.video?.[0]?.path || undefined;

        user.name = name || user.name;
        user.email = email || user.email;
        user.age = age || user.age;
        user.bio = bio || user.bio;
        user.countryCode = countryCode || user.countryCode;
        user.country = country || user.country;
        // Update avatar with first image if multiple images uploaded
        if (imageType == 1) {
            user.avatar = firstImage || user.avatar;
        } else {
            user.avatar = avatar || user.avatar;
        }
        user.imageType = imageType || user.imageType;

        user.video = videoType == 1 ? videoFile || user.video : video || user.video;
        user.videoType = videoType || user.videoType;

        user.hostProfile.interests = interests || user.hostProfile.interests;
        user.hostProfile.languages = languages || user.hostProfile.languages;
        await user.save();

        // Save new uploaded images to Image collection
        if (imageType == 1 && imagePaths.length > 0) {
            const imageDocs = imagePaths.map(imagePath => ({
                userId: user._id,
                image: imagePath,
                imageType: 1,
                isDeleted: false
            }));

            await db.Image.insertMany(imageDocs);
        } else if (imageType == 2 && avatar && user.avatar !== avatar) {
            // If imageType is 2 (URL) and avatar changed, save the new avatar URL as an image
            await db.Image.create({
                userId: user._id,
                image: avatar,
                imageType: 2,
                isDeleted: false
            });
        }

        // Fetch all images for the user to include in response
        const images = await db.Image.find({
            userId: user._id,
            isDeleted: false
        }).sort({ createdAt: -1 }).lean();

        // Convert user to object and add images array to hostProfile
        const userObj = user.toObject();
        const imagesArray = images.map(img => ({
            _id: img._id,
            image: img.image,
            imageType: img.imageType,
            createdAt: img.createdAt
        }));

        // Add images to hostProfile if user is a host
        if (userObj.hostProfile && userObj.isHost) {
            userObj.hostProfile.images = imagesArray;
        } else {
            userObj.images = imagesArray;
        }

        return RESPONSE.success(res, 200, 1001, userObj);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
