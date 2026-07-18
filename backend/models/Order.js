const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        image: {
            type: String,
            default: '/placeholder.png'
        }
    }],
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    shipping: {
        type: Number,
        default: 0,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        name: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        zipCode: { type: String, default: '', trim: true }
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card'],
        default: 'cod'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// ✅ FIXED: Auto generate SEQUENTIAL order number
orderSchema.pre('save', async function() {
    // If orderNumber already exists, don't override
    if (this.orderNumber) return;

    try {
        // Get the Order model
        const Order = mongoose.model('Order');
        
        // Find the last order with sequential format OH-XXXX
        const lastOrder = await Order.findOne({
            orderNumber: { $regex: '^OH-[0-9]+$' }
        }).sort({ orderNumber: -1 });

        let nextNumber = 1;

        if (lastOrder && lastOrder.orderNumber) {
            const match = lastOrder.orderNumber.match(/OH-([0-9]+)/);
            if (match) {
                nextNumber = parseInt(match[1]) + 1;
            }
        }

        // Pad with zeros (e.g., 1 → 0001, 12 → 0012, 123 → 0123)
        this.orderNumber = `OH-${String(nextNumber).padStart(4, '0')}`;
        
        console.log('✅ Generated Sequential Order Number:', this.orderNumber);

    } catch (err) {
        console.error('❌ Error generating order number:', err);
        // Fallback: Use timestamp + random
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `OH-${year}${month}${day}-${random}`;
    }
});

module.exports = mongoose.model('Order', orderSchema);