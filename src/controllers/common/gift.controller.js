const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.getGiftsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({ status: false, message: 'categoryId is required' });
        }
        const gifts = await db.Gift.find({ categoryId, isActive: true });
        return RESPONSE.success(res, 200, 1001, gifts);
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};
