const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');
const mongoose = require('mongoose');

exports.createWithdrwRequest = async (req, res) => {
    try {
        const { paymentGateway, description, coins } = req.body;
        const agency = await db.Agency.findOne({ _id: req.agency.id });
        if (agency.coins < coins) {
            return RESPONSE.error(res, 200, 1207);
        }
        if (coins < globalSetting.minAgencyCoinsWithdraw) {
            return RESPONSE.error(res, 400, `Minimum coins should be ${globalSetting.minAgencyCoinsWithdraw}`);
        }

        const withdraw = await db.WithdrawRequest.create({
            agencyId: new mongoose.Types.ObjectId(req.agency.id),
            type: 'agency',
            paymentGateway,
            description,
            coins
        });
        agency.coins = agency.coins - coins;
        agency.pendingWithdrwCoins = agency.pendingWithdrwCoins + coins;
        await agency.save();

        return RESPONSE.success(res, 200, 1204, withdraw);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.getAgencyWithdrawList = async (req, res) => {
    try {
        console.log('req.agency.id', req.agency.id);
        const { start = 0, limit = 20, status } = req.query; // status aa rha frontend se
        const parsedStart = parseInt(start);
        const parsedLimit = parseInt(limit);

        // base filter
        const filter = {
            agencyId: new mongoose.Types.ObjectId(req.agency.id),
            type: 'agency'
        };

        // agar status bheja hai toh filter me add karo
        if (status) {
            filter.status = Number(status); // 1: pending, 2: approved, 3: declined
        }

        const withdraw = await db.WithdrawRequest.find(filter)
            .sort({ createdAt: -1 })
            .skip(parsedStart)
            .limit(parsedLimit);

            console.log('withdraw', withdraw);

        return RESPONSE.success(res, 200, 1001, withdraw);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
