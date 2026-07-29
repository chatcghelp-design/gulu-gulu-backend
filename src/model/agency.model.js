const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema(
    {
        code: Number,
        password: String,
        fcm_token: { type: String, default: '' },
        name: String,
        image: String,
        approveDate: String,
        email: { type: String, default: null },
        isDisable: { type: Boolean, default: false },
        isDeleted: { type: Boolean, default: false },
        mobileNo: String,
        tax: { type: Number, required: true, default: 10 },
        coins: { type: Number, default: 0, set: v => parseInt(v) },
        pendingWithdrwCoins: { type: Number, default: 0, set: v => parseInt(v) },
        withdrawCoins: { type: Number, default: 0, set: v => parseInt(v) }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Agency', agencySchema);
