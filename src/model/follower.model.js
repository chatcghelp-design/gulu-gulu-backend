const mongoose = require('mongoose');

const followerSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        followBy: { type: String, enum: ['user', 'host'], required: true }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Follower', followerSchema);
