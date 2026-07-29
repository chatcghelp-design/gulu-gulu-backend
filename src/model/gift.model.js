const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema(
    {
        categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'GiftCategory', required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        coins: { type: Number, required: true },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Gift', giftSchema);
