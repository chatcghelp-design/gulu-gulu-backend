const mongoose = require('mongoose');

const hostSchema = new mongoose.Schema(
    {
        _id: {
            type: mongoose.Schema.Types.ObjectId,
            default: () => new mongoose.Types.ObjectId()
        },
        interests: {
            type: [String],
            default: []
        },
        languages: {
            type: [String],
            default: []
        },
        agencyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agency'
        },
        audioCallCharge: {
            type: Number,
            default: 0,
            set: v => parseInt(v)
        },
        videoCallCharge: {
            type: Number,
            default: 0,
            set: v => parseInt(v)
        },
        chatCharge: {
            type: Number,
            default: 0,
            set: v => parseInt(v)
        },
        hostRequestStatus: {
            type: Number,
            enum: [1, 2, 3, 4], // 1: notSend , 2: pending , 3: approved , 4: rejected
            default: 1
        },
        telegramId: { type: String, default: ''},
        availableForRandomCall: { type: Boolean, default: true },
        availableForVideoCall: { type: Boolean, default: true },
        availableForAudioCall: { type: Boolean, default: true }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

const userSchema = new mongoose.Schema(
    {
        name: { type: String, default: '', trim: true },
        email: { type: String, lowercase: true, trim: true },
        uniqueId: { type: String, required: true, unique: true },
        identity: { type: String, required: true, unique: true, lowercase: true, trim: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true, default: 'Male' },
        age: { type: Number, required: true, min: 18, default: 18 },
        bio: { type: String, default: '' },
        avatar: { type: String, default: '' },
        imageType: { type: Number, enum: [1, 2], default: 1 }, // 1: file , 2 : link
        coins: { type: Number, default: 0, set: v => parseInt(v) },
        pendingWithdrwCoins: { type: Number, default: 0, set: v => parseInt(v) },
        withdrawCoins: { type: Number, default: 0, set: v => parseInt(v) },
        status: { type: String, enum: ['available', 'not-available'], default: 'available' },
        isHost: { type: Boolean, default: false },
        isFake: { type: Boolean, default: false },
        followers: { type: Number, default: 0, set: v => parseInt(v) },
        following: { type: Number, default: 0, set: v => parseInt(v) },
        loginType: { type: String, enum: ['email', 'quick'], default: 'email' },
        fcmToken: { type: String, default: '' },
        isDeleted: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
        video: { type: String, default: '' },
        adsViewCount: { type: Number, default: 0 },
        adsLastViewDate: { type: Date },
        videoType: { type: Number, enum: [1, 2], default: 1 }, // 1: file , 2 : link
        // blockedHosts: [{ type: require('mongoose').Schema.Types.ObjectId, ref: 'Host', default: []
        // }],
        hostProfile: { type: hostSchema, default: {} },
        callUniqueId: { type: String, default: '' },
        isOnline: { type: Boolean, default: true },
        isBusy: { type: Boolean, default: false },
        followingCountUpdatedDate: { type: Date },
        followingCountUpdatedDate: { type: Date },
        totalCoinsSpent: { type: Number, default: 0, set: v => parseInt(v) },
        currentLevel: { type: Number, default: 1, min: 1 },
        countryCode: { type: String, default: '' },
        country: { type: String, default: '' },
        ip : { type: String, default: '' },
    },
    { timestamps: true }
);

// Pre-save hook: When isHost is true, ensure availableForVideoCall and availableForAudioCall are true
userSchema.pre('save', function(next) {
    // If user is a host, ensure both availability fields are true
    if (this.isHost === true) {
        
        
        // Initialize hostProfile if it doesn't exist
        if (!this.hostProfile || typeof this.hostProfile !== 'object') {
            this.hostProfile = {};
        }
        
        // Only set to true if they are not explicitly set to false
        if (this.hostProfile.availableForVideoCall !== false) {
            this.hostProfile.availableForVideoCall = true;
        }
        if (this.hostProfile.availableForAudioCall !== false) {
            this.hostProfile.availableForAudioCall = true;
        }
        
       
        
        // Mark hostProfile as modified to ensure it's saved
        this.markModified('hostProfile');
        
       
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
