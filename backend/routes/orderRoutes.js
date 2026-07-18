const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ✅ Import Email Service
const { 
    sendOrderConfirmation, 
    sendOrderStatusUpdate, 
    sendAdminOrderNotification 
} = require('../services/emailService');

// ============================================
// CREATE ORDER - Customer places order
// ============================================
router.post('/', protect, async (req, res) => {
    try {
        const { items, subtotal, shipping, discount, total, shippingAddress, paymentMethod, notes } = req.body;

        console.log('📦 Order received:', JSON.stringify(req.body, null, 2));

        // Validation
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Items are required' 
            });
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.product) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Item ${i + 1}: Product ID is required` 
                });
            }
            if (!item.name || item.price === undefined || item.quantity === undefined) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Item ${i + 1}: Name, price and quantity are required` 
                });
            }
        }

        if (!shippingAddress) {
            return res.status(400).json({ 
                success: false, 
                message: 'Shipping address is required' 
            });
        }
        if (!shippingAddress.name || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name, address, city and phone are required in shipping address' 
            });
        }

        // Calculate totals if not provided
        let calculatedSubtotal = subtotal || 0;
        let calculatedTotal = total || 0;

        if (!subtotal || !total) {
            items.forEach(item => {
                calculatedSubtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
            });
            calculatedTotal = calculatedSubtotal - (discount || 0) + (shipping || 0);
        }

        // Create order
        const order = new Order({
            user: req.user.id,
            items: items.map(item => ({
                product: item.product,
                name: item.name,
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                image: item.image || '/placeholder.png'
            })),
            subtotal: Number(calculatedSubtotal),
            shipping: Number(shipping) || 0,
            discount: Number(discount) || 0,
            total: Number(calculatedTotal),
            shippingAddress: {
                name: String(shippingAddress.name).trim(),
                address: String(shippingAddress.address).trim(),
                city: String(shippingAddress.city).trim(),
                phone: String(shippingAddress.phone).trim(),
                zipCode: shippingAddress.zipCode ? String(shippingAddress.zipCode).trim() : ''
            },
            paymentMethod: paymentMethod || 'cod',
            notes: notes || ''
        });

        await order.save();

        // Clear cart
        await Cart.deleteMany({ user: req.user.id });

        // Populate order for response
        const populatedOrder = await Order.findById(order._id)
            .populate('user', 'name email');

        console.log('✅ Order created:', {
            orderNumber: order.orderNumber,
            total: order.total,
            items: order.items.length
        });

        // ============================================
        // ✅ SEND EMAILS (Don't block response if email fails)
        // ============================================

        // 1. Send Order Confirmation to Customer
        if (populatedOrder.user && populatedOrder.user.email) {
            try {
                const emailResult = await sendOrderConfirmation(
                    populatedOrder.user.email,
                    populatedOrder.user.name || populatedOrder.shippingAddress.name,
                    populatedOrder
                );
                if (emailResult && emailResult.success) {
                    console.log('✅ Order confirmation email sent to customer:', populatedOrder.user.email);
                } else {
                    console.log('⚠️ Order confirmation email failed:', emailResult?.error || 'Unknown error');
                }
            } catch (emailErr) {
                console.error('❌ Customer email error:', emailErr.message);
            }
        }

        // 2. Send Admin Notification
        try {
            const adminResult = await sendAdminOrderNotification(populatedOrder);
            if (adminResult && adminResult.success) {
                console.log('✅ Admin notification email sent');
            } else {
                console.log('⚠️ Admin notification email failed:', adminResult?.error || 'Unknown error');
            }
        } catch (emailErr) {
            console.error('❌ Admin email error:', emailErr.message);
        }

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order: populatedOrder
        });

    } catch (error) {
        console.error('❌ Order creation error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create order'
        });
    }
});

// ============================================
// GET MY ORDERS - Customer view
// ============================================
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            .sort({ createdAt: -1 });

        console.log(`📋 Found ${orders.length} orders for user`);

        res.json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.error('❌ Get orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
        });
    }
});

// ============================================
// GET SINGLE ORDER - Customer view
// ============================================
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        console.log(`📋 Found order ${order.orderNumber}`);

        res.json({
            success: true,
            order
        });
    } catch (error) {
        console.error('❌ Get single order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order' 
        });
    }
});

// ============================================
// CANCEL ORDER - Customer
// ============================================
router.put('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findOne({
            _id: req.params.id,
            user: req.user.id
        }).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending orders can be cancelled'
            });
        }

        order.status = 'cancelled';
        await order.save();

        // ✅ Send status update email for cancellation
        if (order.user && order.user.email) {
            try {
                await sendOrderStatusUpdate(
                    order.user.email,
                    order.user.name || order.shippingAddress.name,
                    order
                );
                console.log('✅ Cancellation email sent to customer');
            } catch (emailErr) {
                console.error('❌ Cancellation email error:', emailErr.message);
            }
        }

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('❌ Cancel order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to cancel order' 
        });
    }
});

// ============================================
// ADMIN: GET ALL ORDERS
// ============================================
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const stats = {
            total: await Order.countDocuments(),
            pending: await Order.countDocuments({ status: 'pending' }),
            processing: await Order.countDocuments({ status: 'processing' }),
            shipped: await Order.countDocuments({ status: 'shipped' }),
            delivered: await Order.countDocuments({ status: 'delivered' }),
            cancelled: await Order.countDocuments({ status: 'cancelled' })
        };

        res.json({
            success: true,
            stats,
            orders
        });
    } catch (error) {
        console.error('❌ Admin get orders error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch orders' 
        });
    }
});

// ============================================
// ADMIN: UPDATE ORDER STATUS
// ============================================
router.put('/admin/:id/status', protect, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
            });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        const oldStatus = order.status;

        // Only send email if status actually changed
        const statusChanged = oldStatus !== status;

        order.status = status;
        await order.save();

        // ============================================
        // ✅ SEND STATUS UPDATE EMAIL TO CUSTOMER
        // ============================================
        if (statusChanged && order.user && order.user.email) {
            try {
                const emailResult = await sendOrderStatusUpdate(
                    order.user.email,
                    order.user.name || order.shippingAddress.name,
                    order
                );
                if (emailResult && emailResult.success) {
                    console.log(`✅ Status update email sent: ${oldStatus} → ${status}`);
                } else {
                    console.log('⚠️ Status email failed:', emailResult?.error || 'Unknown error');
                }
            } catch (emailErr) {
                console.error('❌ Status update email error:', emailErr.message);
            }
        }

        res.json({
            success: true,
            message: `Order status updated from ${oldStatus} to ${status}`,
            order
        });
    } catch (error) {
        console.error('❌ Status update error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to update status' 
        });
    }
});

// ============================================
// ADMIN: GET SINGLE ORDER DETAILS
// ============================================
router.get('/admin/:id', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email');

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        res.json({ 
            success: true, 
            order 
        });
    } catch (error) {
        console.error('❌ Admin get order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch order' 
        });
    }
});

// ============================================
// ADMIN: DELETE ORDER
// ============================================
router.delete('/admin/:id', protect, adminOnly, async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Order deleted successfully' 
        });
    } catch (error) {
        console.error('❌ Delete order error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to delete order' 
        });
    }
});

module.exports = router;