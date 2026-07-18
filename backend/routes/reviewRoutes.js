const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ============================================
// PUBLIC - Get approved reviews (for frontend)
// ============================================
router.get('/public', async (req, res) => {
    try {
        const reviews = await Review.find({ status: 'approved' })
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// USER - Submit a review
// ============================================
router.post('/', protect, async (req, res) => {
    try {
        const { rating, title, comment, productName, productImage } = req.body;

        // Validation
        if (!rating || !comment || !productName) {
            return res.status(400).json({
                success: false,
                message: 'Rating, comment and product name are required'
            });
        }

        if (comment.length < 10) {
            return res.status(400).json({
                success: false,
                message: 'Review must be at least 10 characters'
            });
        }

        // Get user info
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            user: req.user.id,
            productName: productName,
            status: { $ne: 'rejected' }
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product'
            });
        }

        // Create review (status: pending by default)
        const review = new Review({
            user: req.user.id,
            userName: user.name || 'Anonymous',
            userEmail: user.email,
            rating,
            title: title || '',
            comment,
            productName,
            productImage: productImage || '',
            status: 'pending'
        });

        await review.save();

        // ✅ Return success - Customer ko nahi pata ke pending hai
        res.status(201).json({
            success: true,
            message: 'Thank you for your review!',
            review
        });

    } catch (error) {
        console.error('Submit review error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// USER - Get my reviews
// ============================================
router.get('/my-reviews', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json({ success: true, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Get all reviews
// ============================================
router.get('/admin/all', protect, async (req, res) => {
    try {
        // Check admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { status, limit = 50, page = 1 } = req.query;
        const query = status && status !== 'all' ? { status } : {};

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Review.countDocuments(query);

        // Stats
        const stats = {
            total: await Review.countDocuments(),
            pending: await Review.countDocuments({ status: 'pending' }),
            approved: await Review.countDocuments({ status: 'approved' }),
            rejected: await Review.countDocuments({ status: 'rejected' })
        };

        res.json({
            success: true,
            reviews,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Approve review
// ============================================
router.patch('/admin/:id/approve', protect, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.status = 'approved';
        review.reviewedBy = req.user.id;
        review.reviewedAt = new Date();
        await review.save();

        res.json({
            success: true,
            message: 'Review approved successfully',
            review
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Reject review
// ============================================
router.patch('/admin/:id/reject', protect, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { adminNote } = req.body;
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        review.status = 'rejected';
        review.adminNote = adminNote || '';
        review.reviewedBy = req.user.id;
        review.reviewedAt = new Date();
        await review.save();

        res.json({
            success: true,
            message: 'Review rejected',
            review
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Delete review
// ============================================
router.delete('/admin/:id', protect, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        if (!admin || admin.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        await review.deleteOne();
        res.json({ success: true, message: 'Review deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// USER - Mark review as helpful
// ============================================
router.post('/:id/helpful', protect, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        const userId = req.user.id;
        const alreadyHelped = review.helpfulUsers.includes(userId);

        if (alreadyHelped) {
            // Remove helpful vote
            review.helpfulUsers = review.helpfulUsers.filter(id => id.toString() !== userId);
            review.helpfulCount = Math.max(0, review.helpfulCount - 1);
        } else {
            // Add helpful vote
            review.helpfulUsers.push(userId);
            review.helpfulCount += 1;
        }

        await review.save();
        res.json({
            success: true,
            helpfulCount: review.helpfulCount,
            isHelpful: !alreadyHelped
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;