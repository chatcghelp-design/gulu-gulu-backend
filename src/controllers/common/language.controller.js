const RESPONSE = require('../../../utils/response.js');
const { db } = require('../../model/index.js');

// exports.getAllLanguages = async (req, res) => {
//     try {
//         const languages = await db.Language.find({ isDeleted: false }).sort({ createdAt: -1 });
//         return RESPONSE.success(res, 200, 7001, languages);
//     } catch (err) {
//         return RESPONSE.error(res, 500, 9999, err.message);
//     }
// };

exports.getAllLanguages = async (req, res) => {
    try {
        const languages = await db.Language.find().sort({ createdAt: -1 });
        return RESPONSE.success(res, 200, 7001, languages);
    } catch (err) {
        return RESPONSE.error(res, 500, 9999, err.message);
    }
};