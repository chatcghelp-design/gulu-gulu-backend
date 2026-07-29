const mongoose = require('mongoose');

const hostRequestSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        hostStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
        image: { type: [String], default: [] },
        languages: { type: [String], default: [] },
        agencyCode: { type: String, default: '' },
        interests: { type: [String], default: [] },
        reason: { type: String },
        acceptRejectDate: { type: Date },
        telegramId: { type: String, default: ''},
    },
    { timestamps: true }
);

module.exports = mongoose.model('HostRequest', hostRequestSchema);
