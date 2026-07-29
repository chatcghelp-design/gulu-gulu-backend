const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        image: {
            type: String,
            required: true
        },
        imageType: {
            type: Number,
            enum: [1, 2], // 1: file , 2 : link
            default: 1
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

imageSchema.index({ userId: 1, isDeleted: 1 });
imageSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Image', imageSchema);

