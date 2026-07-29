const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        image: { type: String, required: true },
        link: { type: String, default: '' },
        isForHost: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

module.exports = mongoose.model('Banner', bannerSchema);
