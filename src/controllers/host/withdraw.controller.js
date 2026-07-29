const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

exports.getWithdrawList = async (req, res) => {
    try {
        const { start = 0, limit = 20 } = req.query; //  1: pending ,2: accepted, 3 : declined
        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);

        const withdraw = await db.WithdrawRequest.find({ hostId: req.user.id, type: 'host' })
            .skip(parsedStart)
            .limit(parsedLimit);
        return RESPONSE.success(res, 200, 1001, { withdraw });
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.createWithdrwRequest = async (req, res) => {
    console.log('req.user', req.user);
    console.log('req.user.id', req.user.id);
    
    try {
        const { paymentGateway, coins, upiId, name,withdrawRs } = req.body;
        const host = await db.User.findOne({ _id: req.user.id });
        if (host.coins < coins) {
            return RESPONSE.error(res, 200, 1207);
        }
        if (coins < globalSetting.minHostCoinsWithdraw) {
            return RESPONSE.error(res, 200, `Minimum coins should be ${globalSetting.minHostCoinsWithdraw}`);
        }

        const withdraw = await db.WithdrawRequest.create({
            hostId: req.user.id,
            type: 'host',
            paymentGateway,
            coins,
            upiId,
            name,
            withdrawRs
        });
        host.coins = host.coins - coins;
        host.pendingWithdrwCoins = host.pendingWithdrwCoins + coins;
        await host.save();

        return RESPONSE.success(res, 200, 1204, withdraw);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
