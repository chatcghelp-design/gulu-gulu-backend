const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
    {
        level: {
            type: Number,
            required: true,
            unique: true,
            min: 1
        },
        coinRequirement: {
            type: Number,
            required: true,
            min: 0,
            set: v => parseInt(v)
        },
        image: {
            type: String,
            default: null
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

levelSchema.index({ coinRequirement: 1 });


module.exports = mongoose.model('Level', levelSchema);

