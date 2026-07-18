const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const { protect } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const stream = require('stream');

// Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Upload to Cloudinary
const uploadToCloudinary = (buffer, folder = 'ingredients') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                transformation: [
                    { width: 800, height: 600, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        const readableStream = new stream.Readable();
        readableStream.push(buffer);
        readableStream.push(null);
        readableStream.pipe(uploadStream);
    });
};

// ============================================
// PUBLIC - Get all active ingredients
// ============================================
router.get('/', async (req, res) => {
    try {
        const ingredients = await Ingredient.find({ isActive: true })
            .sort({ order: 1 });
        res.json({ success: true, ingredients });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Get all ingredients
// ============================================
router.get('/admin/all', protect, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const ingredients = await Ingredient.find().sort({ order: 1 });
        const stats = {
            total: ingredients.length,
            active: ingredients.filter(i => i.isActive).length,
            inactive: ingredients.filter(i => !i.isActive).length
        };
        res.json({ success: true, ingredients, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Create ingredient
// ============================================
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const { name, tag, detail, productRelation, color, order, isActive } = req.body;

        if (!name || !tag || !detail || !productRelation || !req.file) {
            return res.status(400).json({
                success: false,
                message: 'All fields including image are required'
            });
        }

        const uploadResult = await uploadToCloudinary(req.file.buffer);
        const imageUrl = uploadResult.secure_url;

        const ingredient = new Ingredient({
            name,
            tag,
            detail,
            productRelation,
            image: imageUrl,
            color: color || '#2D6A4F',
            order: order || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        await ingredient.save();
        res.status(201).json({ success: true, ingredient });
    } catch (error) {
        console.error('Create ingredient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Update ingredient
// ============================================
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        const { name, tag, detail, productRelation, color, order, isActive } = req.body;

        let imageUrl = ingredient.image;
        if (req.file) {
            // Delete old image
            if (ingredient.image) {
                try {
                    const publicId = ingredient.image.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`ingredients/${publicId}`);
                } catch (e) {}
            }
            const uploadResult = await uploadToCloudinary(req.file.buffer);
            imageUrl = uploadResult.secure_url;
        }

        ingredient.name = name || ingredient.name;
        ingredient.tag = tag || ingredient.tag;
        ingredient.detail = detail || ingredient.detail;
        ingredient.productRelation = productRelation || ingredient.productRelation;
        ingredient.image = imageUrl;
        ingredient.color = color || ingredient.color;
        ingredient.order = order !== undefined ? order : ingredient.order;
        ingredient.isActive = isActive !== undefined ? isActive : ingredient.isActive;

        await ingredient.save();
        res.json({ success: true, ingredient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Delete ingredient
// ============================================
router.delete('/:id', protect, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        // Delete image from Cloudinary
        if (ingredient.image) {
            try {
                const publicId = ingredient.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`ingredients/${publicId}`);
            } catch (e) {}
        }

        await ingredient.deleteOne();
        res.json({ success: true, message: 'Ingredient deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN - Toggle active
// ============================================
router.patch('/:id/toggle-active', protect, async (req, res) => {
    try {
        const user = await require('../models/User').findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }

        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ success: false, message: 'Ingredient not found' });
        }

        ingredient.isActive = !ingredient.isActive;
        await ingredient.save();
        res.json({ success: true, ingredient });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;