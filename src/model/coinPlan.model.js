const mongoose = require('mongoose');

const coinPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        productId: { type: String, required: true },
        coins: { type: Number, required: true, set: v => parseInt(v) },
        rupees: { type: Number, required: true },
        dollars: { type: Number, required: true },
        description: { type: String, required: true },
        offer: { type: Number, default: 0 },
        isHidden: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

const CoinPlan = mongoose.model('CoinPlan', coinPlanSchema);

module.exports = CoinPlan;
