const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');


exports.createLevel = async (req, res) => {
    try {
        const { level, coinRequirement } = req.body;

        if (!level || coinRequirement === undefined) {
            return RESPONSE.error(res, 400, 1401);
        }
        if (level < 1) {
            return RESPONSE.error(res, 400, 1402);
        }
        if (coinRequirement < 0) {
            return RESPONSE.error(res, 400, 1403);
        }

        const existingLevel = await db.Level.findOne({ level });
        if (existingLevel) {
            return RESPONSE.error(res, 400, 1404);
        }

        let imagePath = null;
        if (req.file) {
            imagePath = req.file.path;
        }

        const newLevel = await db.Level.create({
            level,
            coinRequirement,
            image: imagePath,
        });

        return RESPONSE.success(res, 201, 1400, newLevel);
    } catch (err) {
        if (err.code === 11000) {
            return RESPONSE.error(res, 400, 1404);
        }
        return RESPONSE.error(res, 500, 9999);
    }
};


exports.getAllLevels = async (req, res) => {
    try {
        console.log("Fetching all levels...");
        const levels = await db.Level.find().sort({ coinRequirement: 1 });
        console.log("Levels found:", levels.length);
        return RESPONSE.success(res, 200, 1408, levels);
    } catch (err) {
        console.error("GET ALL LEVELS ERROR:", err);
        return RESPONSE.error(res, 500, 9999);
    }
};

exports.getLevelById = async (req, res) => {
    try {
        const { id } = req.params;
        const level = await db.Level.findById(id);
        if (!level) {
            return RESPONSE.error(res, 404, 1405);
        }
        return RESPONSE.success(res, 200, 1001, level);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999);
    }
};


exports.updateLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const { level, coinRequirement, isActive } = req.body;

        const levelDoc = await db.Level.findById(id);
        if (!levelDoc) {
            return RESPONSE.error(res, 404, 1405);
        }

        let updateData = {};

        // Level
        if (level !== undefined && level !== "") {
            const levelNum = Number(level);
            if (isNaN(levelNum) || levelNum < 1) {
                return RESPONSE.error(res, 400, 1402);
            }
            const exists = await db.Level.findOne({
                level: levelNum,
                _id: { $ne: id }
            });
            if (exists) {
                return RESPONSE.error(res, 400, 1404);
            }
            updateData.level = levelNum;
        }

        // Coin
        if (coinRequirement !== undefined && coinRequirement !== "") {
            const coins = Number(coinRequirement);
            if (isNaN(coins) || coins < 0) {
                return RESPONSE.error(res, 400, 1403);
            }
            updateData.coinRequirement = coins;
        }

        // isActive FIXED
        if (isActive !== undefined && isActive !== "") {
            updateData.isActive = (isActive === "true" || isActive === true);
        }

        // Image
        if (req.file) {
            updateData.image = req.file.path;
        }

        const updatedLevel = await db.Level.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );

        return RESPONSE.success(res, 200, 1406, updatedLevel);

    } catch (err) {
        console.log("UPDATE LEVEL ERROR:", err);
        return RESPONSE.error(res, 500, 9999);
    }
};



exports.deleteLevel = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Level.findByIdAndDelete(id);
        if (!deleted) {
            return RESPONSE.error(res, 404, 1405);
        }

        return RESPONSE.success(res, 200, 1407);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999);
    }
};
