const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response.js');

// Create setting
exports.createSetting = async (req, res) => {
    try {
        const setting = new db.Setting(req.body);
        await setting.save();
        globalSetting = setting;

        return RESPONSE.success(res, 200, 1001, setting);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: 'Internal server error' });
    }
};

exports.updateSettingById = async (req, res) => {
    try {
        const setting = await db.Setting.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!setting) {
            return res.status(404).send({ status: false, message: 'Setting not found' });
        }
        globalSetting = setting;
        RESPONSE.success(res, 200, 1001, setting);
        if (req.body.isFake == true || req.body.isFake == false) {
            await db.User.updateMany({}, { $set: { followingCountUpdatedDate: null } }); // for change in follow count
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: false, message: 'Internal server error' });
    }
};

exports.getSetting = async (req, res) => {
    try {
        const setting = await db.Setting.findOne();
        globalSetting = setting;
        RESPONSE.success(res, 200, 1001, setting);
    } catch (err) {
        return res.status(500).send({ status: false, message: 'Internal server error' });
    }
};
