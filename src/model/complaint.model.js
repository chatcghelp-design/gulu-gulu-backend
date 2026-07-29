const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open'
    },
    adminResponse: {
        type: String,
        default: ''
        
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resolvedByRole' ,
         
    },
    resolvedByRole: {
        type: String,
        enum: ['admin', 'agency']
    },
    modifyDateAt: {
        type: Date
    }
}, {
    timestamps: true
});

complaintSchema.index({ userId: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
