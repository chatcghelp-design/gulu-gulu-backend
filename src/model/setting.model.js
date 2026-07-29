const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
    {
        callTax: { type: Number, default: 0 },
        giftTax: { type: Number, default: 0 },
        chatTax: { type: Number, default: 0 },
        privacyPolicyLink: { type: String, default: '' },
        termsAndConditionsLink: { type: String, default: '' },
        minAudioCallCharge: { type: Number, default: 2400, set: v => parseInt(v) },
        minVideoCallCharge: { type: Number, default: 2400, set: v => parseInt(v) },
        minChatCharge: { type: Number, default: 10, set: v => parseInt(v) },
        minHostCoinsWithdraw: { type: Number, default: 100, set: v => parseInt(v) }, // 50
        minAgencyCoinsWithdraw: { type: Number, default: 100, set: v => parseInt(v) },
        randomMatchScreenTime: { type: Number, default: 30, set: v => parseInt(v) }, // in seconds
        razorPayEnable: { type: Boolean, default: true },
        googlePayEnable: { type: Boolean, default: true },
        coinsForRs: { type: Number, default: 100 },
        rsForCoins: { type: Number, default: 1 },
        agorakey: { type: String, default: 'agora key' },
        agoraCertificate: { type: String, default: 'Agora Certificate' },
        loginBonus: { type: Number, default: 0, set: v => parseInt(v) },
        isFake: { type: Boolean, default: true },
        adsCoins: { type: Number, default: 0, set: v => parseInt(v) },
        adsCount: { type: Number, default: 0, set: v => parseInt(v) },
        isAgency: { type: Boolean, default: false },
        appActive: { type: Boolean, default: true },
        version: { type: Number, default: 1 },
        link: { type: String, default: '' },
        razorPayKey: { type: String, default: '' },
        reward: { type: Boolean, default: false },
        addsKey: { type: Boolean, default: false },
        adsId: { type: String, default: '' },
        interstialAdsCount: { type: Number, default: 1 },
        freeCallCount: { type: Number, default: 0 },
        facebookAppId: { type: String, default: '' },
        clientToken: { type: String, default: '' },
        upiIntent: { type: String, default: '' },
        cashfreeclientId: { type: String, default: '' },
        cashfreeclientsecrate: { type: String, default: '' },
        cashfreestatus: { type: Boolean, default: false },
    },
    { timestamps: true }
);

settingSchema.index({ createdAt: -1 });

module.exports = mongoose.model('setting', settingSchema);
