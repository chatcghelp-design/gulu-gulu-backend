const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

exports.createLanguage = async (req, res) => {
    try {
        const { language } = req.body;
        if (!language) {
            return RESPONSE.error(res, 400, 7002, 'Language is required');
        }
        const existingLanguage = await db.Language.findOne({ language: language });
        if (existingLanguage) {
            return RESPONSE.error(res, 400, 7003, 'Language already exists');
        }
        const newLanguage = await db.Language.create({ language });
        return RESPONSE.success(res, 201, 7000, newLanguage);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.getAllLanguages = async (req, res) => {
    try {
        const languages = await db.Language.find().sort({ createdAt: -1 });
        return RESPONSE.success(res, 200, 7001, languages);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};

exports.deleteLanguage = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await db.Language.findByIdAndDelete(id);
        if (!deleted) {
            return RESPONSE.error(res, 404, 7004, 'Language not found');
        }

        return RESPONSE.success(res, 200, 7005, 'Language deleted successfully');
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};
