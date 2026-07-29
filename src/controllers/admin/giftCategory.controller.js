const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.createGiftCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const existingCategory = await db.GiftCategory.findOne({ name });

        if (existingCategory) {
            return RESPONSE.error(res, 409, 5001, '');
        }
        const category = await db.GiftCategory.create({
            name
        });
        return RESPONSE.success(res, 201, 1001, category);
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};

exports.updateGiftCategory = async (req, res) => {
    try {
        const { name, isActive } = req.body;
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;
        const category = await db.GiftCategory.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return RESPONSE.error(res, 404, 5001, '');
        }
        return RESPONSE.success(res, 200, 1001, category);
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};

exports.getGiftCategoryList = async (req, res) => {
    try {
        const categories = await db.GiftCategory.find({}).sort({ name: 1 });
        return RESPONSE.success(res, 200, 1001, categories);
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};

exports.deleteGiftCategory = async (req, res) => {
    try {
        const category = await db.GiftCategory.findByIdAndDelete(req.params.id);
        if (!category) {
            return RESPONSE.error(res, 404, 5001, '');
        }
        return RESPONSE.success(res, 200, 1001, {});
    } catch (err) {
        return RESPONSE.error(res, 500, 5000, err.message);
    }
};
