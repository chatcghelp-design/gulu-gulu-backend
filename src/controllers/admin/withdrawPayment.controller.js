const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.createWithdraw = async (req, res) => {
    try {
        const { name, details, isActive } = req.body;

        if (!name) {
            return RESPONSE.error(res, 400, 'Name is required');
        }

        if (!req.file) {
            return RESPONSE.error(res, 400, 'Image is required');
        }

        const newWithdraw = new db.WithdrawPayment({
            name,
            image: req.file.path,
            details: details || '',
            isActive: isActive !== undefined ? isActive : true
        });

        const savedWithdraw = await newWithdraw.save();
        return RESPONSE.success(res, 200, savedWithdraw, 'Withdraw method created successfully');
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, 500, error.message || 'Internal Server Error');
    }
};

exports.getAllWithdraw = async (req, res) => {
    try {
        const withdraws = await db.WithdrawPayment.find();
        return RESPONSE.success(res, 200, 'Withdraw methods fetched successfully', withdraws);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, 500, error.message || 'Internal Server Error');
    }
};

exports.updateWithdraw = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, details, isActive } = req.body;

        const withdraw = await db.WithdrawPayment.findById(id);
        if (!withdraw) {
            return RESPONSE.error(res, 404, 'Withdraw method not found');
        }

        if (name) withdraw.name = name;
        if (details) withdraw.details = details;
        if (isActive !== undefined) withdraw.isActive = isActive;
        if (req.file) withdraw.image = req.file.path;

        const updatedWithdraw = await withdraw.save();
        return RESPONSE.success(res, 200, 'Withdraw method updated successfully', updatedWithdraw);
    } catch (error) {
        console.error(error);
        return RESPONSE.error(res, 500, error.message || 'Internal Server Error');
    }
};
