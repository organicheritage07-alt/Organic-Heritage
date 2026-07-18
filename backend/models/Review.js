const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    // Review Content
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    title: {
        type: String,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        minlength: 10
    },
    // Product Info (denormalized for fast display)
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String
    },
    // Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    // Admin fields
    adminNote: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    // Helpful votes
    helpfulCount: {
        type: Number,
        default: 0
    },
    helpfulUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Avatar
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Indexes for faster queries
reviewSchema.index({ status: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });
reviewSchema.index({ productName: 1 });

module.exports = mongoose.model('Review', reviewSchema);