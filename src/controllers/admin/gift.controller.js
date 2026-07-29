const { db } = require('../../model/index.js');

exports.createGift = async (req, res) => {
    try {
        const { categoryId, name, coins } = req.body;
        let image = '';
        if (req.file) {
            image = req.file.path;
        }
        if (!categoryId || !name || !image || coins === undefined) {
            return res.status(400).json({ status: false, message: 'categoryId, name, image, and coins are required' });
        }
        const gift = await db.Gift.create({
            categoryId,
            name,
            image,
            coins
        });
        res.status(201).json({ status: true, data: gift });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.updateGift = async (req, res) => {
    try {
        const { categoryId, name, coins, isActive } = req.body;
        const updateData = {};
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (name !== undefined) updateData.name = name;
        if (coins !== undefined) updateData.coins = coins;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (req.file) {
            updateData.image = req.file.path;
        }
        const gift = await db.Gift.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!gift) {
            return res.status(404).json({ status: false, message: 'Gift not found' });
        }
        res.status(200).json({ status: true, data: gift });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};

exports.getAllGifts = async (req, res) => {
    try {
        const gifts = await db.Gift.find();
        res.status(200).json({ status: true, data: gifts });
    } catch (err) {
        res.status(500).json({ status: false, error: err.message });
    }
};
