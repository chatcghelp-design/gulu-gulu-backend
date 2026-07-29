const mongoose = require('mongoose');

const historySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        otherHostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        giftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
        giftCount: { type: Number, default: 1, set: v => parseInt(v) },
        planId: { type: mongoose.Schema.Types.ObjectId, ref: 'CoinPlan' }, // renamed for consistency
        type: {
            type: String,
            enum: [
                'loginbouns',
                'Random call',
                'Video call',
                'Audio call',
                'chat',
                'gift',
                'Purchase Plan',
                'Admin Coin',
                'Ad Coins',
                'Chat Refund'
            ],
            required: true
        },
        userCoin: { type: Number, default: 0, set: v => parseInt(v) },
        isUserIncome: { type: Boolean, default: false },
        hostCoin: { type: Number, default: 0, set: v => parseInt(v) },
        isHostIncome: { type: Boolean, default: true },
        agencyCoin: { type: Number, default: 0, set: v => parseInt(v) },
        note: { type: String, default: '' },
        paymentMethod: { type: String, default: '' },
        transactionId: { type: String, default: '' },
        callBy: { type: String, default: '' },
        callUniqueId: { type: String, default: '' },
        callConnect: { type: Boolean, default: false },
        callStartTime: { type: Date, default: null },
        callEndTime: { type: Date, default: null },
        callCutReason: { type: String, default: '' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('History', historySchema);
