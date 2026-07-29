const { db } = require('../../model/index.js');
const jwt = require('jsonwebtoken');
const RESPONSE = require('../../../utils/response.js');
const { generate8DigitId } = require('../../../utils/function.js');

exports.login = async (req, res) => {
    try {
        const { email, identity, loginType, fcmToken, countryCode, country, ip } = req.body;
        let token = null;
        let user;
        if (loginType === 'email') {
            user = await db.User.findOne({ identity });
            if (user) {
                user.email = email;
            } else {
                user = await db.User.findOne({ email });
            }
        } else {
            // quick
            user = await db.User.findOne({ identity });
        }
        if (user) {
            if (user.isBlocked) {
                return res.status(403).json({ status: false, message: 'You have been blocked by the admin' });
            }
            user.identity = identity;
            user.loginType = loginType;
            if (fcmToken) user.fcmToken = fcmToken;
            await user.save();
        } else {
            // Get a random DummyUser persona
            const count = await db.DummyUser.countDocuments();
            const random = Math.floor(Math.random() * count);
            const dummy = await db.DummyUser.findOne().skip(random);

            let name = '';
            let bio = '';
            let image = '';

            if (loginType === 'quick' && dummy) {
                name = dummy.name;
                bio = dummy.bio;
                image = dummy.avatar;
            }

            const uniqueId = await generate8DigitId(8);

            const setting = await db.Setting.findOne();

            //create new user
            user = await db.User.create({
                name,
                identity,
                loginType,
                email: loginType === 'email' ? (email ? email : '') : '',
                bio,
                avatar: image,
                uniqueId,
                coins: setting?.loginBonus || 0,
                fcmToken: fcmToken || '',
                hostProfile: {
                    availableForVideoCall: true,
                    availableForAudioCall: true
                },
                countryCode: countryCode || '',
                country: country || '',
                ip: ip || ''
            });

            // Insert gallery images for quick login user
            if (loginType === 'quick' && dummy && dummy.image && dummy.image.length > 0) {
                const galleryImages = dummy.image.map(img => ({
                    userId: user._id,
                    image: img,
                    imageType: 1, // Default image type
                    isDeleted: false
                }));
                await db.Image.insertMany(galleryImages);
            }
            if (setting?.loginBonus) {
                // Create History record for login bonus
                await db.History.create({
                    userId: user._id,
                    hostId: null,
                    type: 'loginbouns',
                    userCoin: setting?.loginBonus,
                    isUserIncome: true,
                    note: 'Signup bonus'
                });
            }
        }
        token = jwt.sign(
            { id: user._id, email: user.email, identity: user.identity, role: 'user' },
            process.env.JWT_SECRET, // use env secret
            { expiresIn: '7d' }
        );
        console.log('token', token);

        // Fetch user images to include in response
        const userImages = await db.Image.find({
            userId: user._id,
            isDeleted: false
        }).select('_id image imageType createdAt');

        const userObj = user.toObject ? user.toObject() : user;
        userObj.images = userImages;

        return RESPONSE.success(res, 200, 1001, { user: userObj, token });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
