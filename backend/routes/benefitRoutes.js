const express = require('express');
const router = express.Router();
const Benefit = require('../models/Benefit');
const { protect, adminOnly } = require('../middleware/authMiddleware'); // ✅ YEH CHANGE
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const streamifier = require('streamifier');

// ============================================
// CLOUDINARY CONFIG
// ============================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================
// MULTER SETUP (Memory Storage for Cloudinary)
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed (JPEG, PNG, JPG, WEBP, GIF)'));
        }
    }
});

// ============================================
// HELPER: Upload to Cloudinary
// ============================================
const uploadToCloudinary = (buffer, folder = 'benefits') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// ============================================
// GET all benefits (public)
// ============================================
router.get('/', async (req, res) => {
    try {
        const benefits = await Benefit.find({ isActive: true }).sort({ order: 1 });
        res.json({ success: true, benefits });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET all benefits for admin
// ============================================
router.get('/admin/all', protect, adminOnly, async (req, res) => { // ✅ YEH CHANGE
    try {
        const benefits = await Benefit.find().sort({ order: 1 });
        const stats = {
            total: benefits.length,
            active: benefits.filter(b => b.isActive).length,
            inactive: benefits.filter(b => !b.isActive).length
        };
        res.json({ success: true, benefits, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// GET single benefit
// ============================================
router.get('/:id', async (req, res) => {
    try {
        const benefit = await Benefit.findById(req.params.id);
        if (!benefit) {
            return res.status(404).json({ success: false, message: 'Benefit not found' });
        }
        res.json({ success: true, benefit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// CREATE benefit (with image upload)
// ============================================
router.post('/', protect, adminOnly, upload.single('image'), async (req, res) => { // ✅ YEH CHANGE
    try {
        const { name, subtitle, shortHighlight, accentColor, benefits, ctaText, order, isActive } = req.body;

        // Validate required fields
        if (!name || !subtitle || !shortHighlight || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'Name, subtitle, shortHighlight and image are required'
            });
        }

        // Upload image to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.buffer);
        const imageUrl = uploadResult.secure_url;

        // Parse benefits if sent as JSON string
        let benefitsArray = [];
        if (benefits) {
            try {
                benefitsArray = typeof benefits === 'string' ? JSON.parse(benefits) : benefits;
            } catch (e) {
                benefitsArray = [];
            }
        }

        const benefit = new Benefit({
            name,
            subtitle,
            shortHighlight,
            image: imageUrl,
            accentColor: accentColor || '#2D6A4F',
            benefits: benefitsArray,
            ctaText: ctaText || `Discover ${name}`,
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        await benefit.save();
        res.status(201).json({ success: true, benefit });
    } catch (error) {
        console.error('Error creating benefit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// UPDATE benefit (with optional image upload)
// ============================================
router.put('/:id', protect, adminOnly, upload.single('image'), async (req, res) => { // ✅ YEH CHANGE
    try {
        const { name, subtitle, shortHighlight, accentColor, benefits, ctaText, order, isActive } = req.body;

        const benefit = await Benefit.findById(req.params.id);
        if (!benefit) {
            return res.status(404).json({ success: false, message: 'Benefit not found' });
        }

        // Upload new image if provided
        let imageUrl = benefit.image;
        if (req.file) {
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            imageUrl = uploadResult.secure_url;
            
            // Delete old image from Cloudinary
            if (benefit.image) {
                try {
                    const publicId = benefit.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`benefits/${publicId}`);
                } catch (e) {
                    console.log('Could not delete old image:', e);
                }
            }
        }

        // Parse benefits if sent as JSON string
        let benefitsArray = [];
        if (benefits) {
            try {
                benefitsArray = typeof benefits === 'string' ? JSON.parse(benefits) : benefits;
            } catch (e) {
                benefitsArray = [];
            }
        }

        benefit.name = name || benefit.name;
        benefit.subtitle = subtitle || benefit.subtitle;
        benefit.shortHighlight = shortHighlight || benefit.shortHighlight;
        benefit.image = imageUrl;
        benefit.accentColor = accentColor || benefit.accentColor;
        benefit.benefits = benefitsArray.length > 0 ? benefitsArray : benefit.benefits;
        benefit.ctaText = ctaText || benefit.ctaText;
        benefit.order = order !== undefined ? order : benefit.order;
        benefit.isActive = isActive !== undefined ? isActive : benefit.isActive;

        await benefit.save();
        res.json({ success: true, benefit });
    } catch (error) {
        console.error('Error updating benefit:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// DELETE benefit
// ============================================
router.delete('/:id', protect, adminOnly, async (req, res) => { // ✅ YEH CHANGE
    try {
        const benefit = await Benefit.findById(req.params.id);
        if (!benefit) {
            return res.status(404).json({ success: false, message: 'Benefit not found' });
        }

        // Delete image from Cloudinary
        if (benefit.image) {
            try {
                const publicId = benefit.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`benefits/${publicId}`);
            } catch (e) {
                console.log('Could not delete image:', e);
            }
        }

        await benefit.deleteOne();
        res.json({ success: true, message: 'Benefit deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// TOGGLE active status
// ============================================
router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => { // ✅ YEH CHANGE
    try {
        const benefit = await Benefit.findById(req.params.id);
        if (!benefit) {
            return res.status(404).json({ success: false, message: 'Benefit not found' });
        }
        benefit.isActive = !benefit.isActive;
        await benefit.save();
        res.json({ success: true, benefit });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// REORDER benefits
// ============================================
router.put('/reorder', protect, adminOnly, async (req, res) => { // ✅ YEH CHANGE
    try {
        const { orders } = req.body;
        for (const item of orders) {
            await Benefit.findByIdAndUpdate(item.id, { order: item.order });
        }
        res.json({ success: true, message: 'Benefits reordered successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;