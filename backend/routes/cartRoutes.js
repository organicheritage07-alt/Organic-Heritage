const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');

// ✅ GET USER CART
router.get('/', protect, async (req, res) => {
    try {
        const cartItems = await Cart.find({ user: req.user.id })
            .populate('product')
            .sort({ createdAt: -1 });

        // Calculate total
        let total = 0;
        cartItems.forEach(item => {
            if (item.product && item.product.isActive) {
                total += item.product.price * item.quantity;
            }
        });

        res.json({
            success: true,
            count: cartItems.length,
            items: cartItems,
            total: total
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ ADD TO CART
router.post('/', protect, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Check if product exists and is active
        const product = await Product.findOne({ 
            _id: productId, 
            isActive: true, 
            isDeleted: false 
        });

        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found or unavailable' 
            });
        }

        // Check if product already in cart
        let cartItem = await Cart.findOne({
            user: req.user.id,
            product: productId
        });

        if (cartItem) {
            // Update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Create new cart item
            cartItem = new Cart({
                user: req.user.id,
                product: productId,
                quantity: quantity
            });
            await cartItem.save();
        }

        // Populate product details
        await cartItem.populate('product');

        res.status(201).json({
            success: true,
            message: 'Product added to cart',
            item: cartItem
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ UPDATE CART QUANTITY
router.put('/:id', protect, async (req, res) => {
    try {
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        cartItem.quantity = quantity;
        await cartItem.save();
        await cartItem.populate('product');

        res.json({
            success: true,
            message: 'Cart updated',
            item: cartItem
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ REMOVE FROM CART
router.delete('/:id', protect, async (req, res) => {
    try {
        const cartItem = await Cart.findOne({
            _id: req.params.id,
            user: req.user.id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        await cartItem.deleteOne();

        res.json({
            success: true,
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ CLEAR CART
router.delete('/clear/all', protect, async (req, res) => {
    try {
        await Cart.deleteMany({ user: req.user.id });

        res.json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;