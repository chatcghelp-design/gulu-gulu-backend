const mongoose = require('mongoose');

const withdrawRequestSchema = new mongoose.Schema(
    {
        hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        agencyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
        type: { type: String, enum: ['host', 'agency'], default: 'host' },
        paymentGateway: String,
        coins: Number,
        status: { type: Number, default: 1, enum: [1, 2, 3] }, // 1: pending, 2: accepted, 3: decline
        date: String,
        withdrawRs: { type: Number, default: 0 },
        upiId: { type: String, default: '' },
        name: { type: String, default: '' },
        reason: {
            type: String,
            trim: true
        },
        acceptDeclineDate: { type: String, default: '' }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

withdrawRequestSchema.index({ hostId: 1, agencyId: 1 });

module.exports = mongoose.model('WithdrawRequest', withdrawRequestSchema);
