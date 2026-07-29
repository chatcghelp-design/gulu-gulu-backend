const mongoose = require('mongoose');

const scheduledNotificationSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: '' },
    // 'user', 'host', 'all' - matching existing logic
    targetAudience: { type: String, enum: ['user', 'host', 'all'], required: true },
    sendAt: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
    createdAt: { type: Date, default: Date.now }
});

// Index for efficient querying by the background worker
scheduledNotificationSchema.index({ status: 1, sendAt: 1 });

module.exports = mongoose.model('ScheduledNotification', scheduledNotificationSchema);
