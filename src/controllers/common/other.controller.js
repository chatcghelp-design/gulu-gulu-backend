const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.generateUrl = async (req, res) => {
    try {
        // The uploaded file info is in req.file
        return RESPONSE.success(res, 200, 1001, req.file.path);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.watchAd = async (req, res) => {
    try {
        const userId = req.user.id;
        const setting = globalSetting;
        const user = await db.User.findById(userId);

        const today = getDateOnly(new Date());

        console.log('today-----------------------------------------', today);
        const lastViewDate = user.adsLastViewDate ? getDateOnly(new Date(user.adsLastViewDate)) : null;

        // reset if first time or different day
        if (!lastViewDate || lastViewDate.getTime() !== today.getTime()) {
            user.adsViewCount = 0;
            user.adsLastViewDate = new Date();
        }

        if (user.adsViewCount >= globalSetting.adsCount) {
            return RESPONSE.error(res, 400, 1301);
        }

        user.coins += globalSetting.adsCoins;
        user.adsViewCount += 1;
        user.adsLastViewDate = new Date();

        await user.save();

        await db.History.create({
            userId: user._id,
            type: 'Ad Coins',
            userCoin: globalSetting.adsCoins,
            isUserIncome: true,
            note: 'Coins added for watching an ad'
        });

        return RESPONSE.success(res, 200, `Ad watched successfully, ${globalSetting.adsCoins} coins added`, {
            coins: user.coins,
            adsViewCount: user.adsViewCount,
            adsLimit: globalSetting.adsCount
        });
    } catch (error) {
        return RESPONSE.error(res, 500, 9999, error.message);
    }
};

function getDateOnly(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
