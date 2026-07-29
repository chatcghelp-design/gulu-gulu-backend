const mongoose = require('mongoose');

const languageSchema = new mongoose.Schema(
    {
        language: {
            type: String ,required: true, unique: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Language', languageSchema);
