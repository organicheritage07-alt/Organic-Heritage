const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Benefit = require('../models/Benefit');
const ContactMessage = require('../models/ContactMessage'); // ✅ ADD THIS
const { protect } = require('../middleware/authMiddleware');

// ============================================
// GET ALL NOTIFICATION COUNTS (Admin Only)
// ============================================
router.get('/counts', protect, async (req, res) => {
    try {
        // Check if user is admin
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        // Get start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get all counts in parallel
        const [
            totalUsers,
            newUsersToday,
            pendingOrders,
            pendingReviews,
            lowStockProducts,
            inactiveBenefits,
            unreadContactMessages  // ✅ ADD THIS
        ] = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ 
                createdAt: { $gte: today }
            }),
            Order.countDocuments({ status: 'pending' }),
            Review.countDocuments({ status: 'pending' }),
            Product.countDocuments({ 
                stock: { $lt: 50 }, 
                isActive: true 
            }),
            Benefit.countDocuments({ isActive: false }),
            ContactMessage.countDocuments({ status: 'unread' }) // ✅ ADD THIS
        ]);

        res.json({
            success: true,
            counts: {
                users: {
                    total: totalUsers,
                    new: newUsersToday
                },
                orders: {
                    pending: pendingOrders
                },
                reviews: {
                    pending: pendingReviews
                },
                products: {
                    lowStock: lowStockProducts
                },
                benefits: {
                    inactive: inactiveBenefits
                },
                contact: {
                    unread: unreadContactMessages  // ✅ ADD THIS
                }
            }
        });

    } catch (error) {
        console.error('Error fetching notification counts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;