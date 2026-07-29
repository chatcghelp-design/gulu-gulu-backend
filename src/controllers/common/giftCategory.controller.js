const { db } = require('../../model/index.js');
const RESPONSE = require('../../../utils/response');

exports.getAllActiveGiftCategories = async (req, res) => {
    try {
        const categories = await db.GiftCategory.find({ isActive: true });
        return RESPONSE.success(res, 200, 1001, categories);
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};
