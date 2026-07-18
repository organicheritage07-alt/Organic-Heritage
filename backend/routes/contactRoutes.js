const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const { protect } = require('../middleware/authMiddleware');
const { sendContactReplyEmail } = require('../services/emailService');

// ============================================
// PUBLIC - Submit Contact Form
// ============================================
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and message are required'
            });
        }

        // Create contact message
        const contactMessage = new ContactMessage({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            subject: subject?.trim() || 'No Subject',
            message: message.trim(),
            ipAddress: req.ip || req.connection.remoteAddress || '',
            userAgent: req.headers['user-agent'] || ''
        });

        await contactMessage.save();

        res.status(201).json({
            success: true,
            message: 'Your message has been sent successfully!'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again.'
        });
    }
});

// ============================================
// ADMIN - Get all contact messages
// ============================================
router.get('/admin/all', protect, async (req, res) => {
    try {
        // Check admin
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { status, limit = 50, page = 1 } = req.query;
        const query = status && status !== 'all' ? { status } : {};

        const messages = await ContactMessage.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await ContactMessage.countDocuments(query);

        // Stats
        const stats = {
            total: await ContactMessage.countDocuments(),
            unread: await ContactMessage.countDocuments({ status: 'unread' }),
            read: await ContactMessage.countDocuments({ status: 'read' }),
            replied: await ContactMessage.countDocuments({ status: 'replied' })
        };

        res.json({
            success: true,
            messages,
            stats,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching contact messages:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Get single message
// ============================================
router.get('/admin/:id', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Mark as read if currently unread
        if (message.status === 'unread') {
            message.status = 'read';
            await message.save();
        }

        res.json({ success: true, message });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ✅ UPDATED: ADMIN - Reply to message (with original query)
// ============================================
router.post('/admin/:id/reply', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { reply } = req.body;
        if (!reply || reply.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Reply message is required' });
        }

        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        // Update message
        message.adminReply = reply.trim();
        message.status = 'replied';
        message.repliedAt = new Date();
        await message.save();

        // ✅ Send reply email with original query included
        await sendContactReplyEmail(
            message.email, 
            message.name, 
            reply, 
            message.subject,
            message.message  // ✅ Pass original message
        );

        res.json({
            success: true,
            message: 'Reply sent successfully!',
            data: message
        });

    } catch (error) {
        console.error('Reply error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Delete message
// ============================================
router.delete('/admin/:id', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        await message.deleteOne();
        res.json({ success: true, message: 'Message deleted successfully' });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Mark as read/unread
// ============================================
router.patch('/admin/:id/status', protect, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { status } = req.body;
        if (!['unread', 'read', 'replied'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const message = await ContactMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }

        message.status = status;
        await message.save();

        res.json({ success: true, message });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;