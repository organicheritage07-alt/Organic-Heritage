const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const stream = require('stream');

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    timeout: 60000
});

// ============================================
// MULTER CONFIGURATION
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'), false);
        }
    }
});

// ✅ SUPPORT MULTIPLE FIELDS
const uploadFields = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'additionalImages', maxCount: 10 }
]);

// ============================================
// HELPER: Upload to Cloudinary
// ============================================
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'products',
                resource_type: 'image',
                transformation: [
                    { width: 500, height: 500, crop: 'limit' },
                    { quality: 'auto:good' }
                ]
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        bufferStream.pipe(uploadStream);
    });
};

// ============================================
// HELPER: Upload multiple images to Cloudinary
// ============================================
const uploadMultipleToCloudinary = async (files) => {
    const urls = [];
    for (const file of files) {
        const result = await uploadToCloudinary(file.buffer);
        urls.push(result.secure_url);
    }
    return urls;
};

// ============================================
// HELPER: Delete from Cloudinary
// ============================================
const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (imageUrl && imageUrl.includes('cloudinary')) {
            const publicId = imageUrl.split('/').pop().split('.')[0];
            const fullPublicId = `products/${publicId}`;
            await cloudinary.uploader.destroy(fullPublicId);
        }
    } catch (error) {
        console.log('Error deleting from Cloudinary:', error);
    }
};

// ============================================
// PUBLIC ROUTES
// ============================================

// ✅ GET ALL ACTIVE PRODUCTS (Public - FeaturedProducts ke liye)
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        let filter = { isDeleted: false, isActive: true };
        
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        const products = await Product.find(filter)
            .select('name subtitle description price originalPrice rating reviews image category tag discount stock')
            .sort({ createdAt: -1 });
            
        res.json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ GET SINGLE PRODUCT (Public - ProductDetail ke liye - ALL FIELDS)
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ 
            _id: req.params.id, 
            isDeleted: false,
            isActive: true 
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ GET PRODUCT CATEGORIES (Public)
router.get('/categories/all', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isDeleted: false, isActive: true });
        res.json({
            success: true,
            categories: ['All', ...categories]
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// ✅ GET ALL PRODUCTS (Admin)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
    try {
        const { category, search, showDeleted } = req.query;
        let filter = {};
        
        if (category && category !== 'All') {
            filter.category = category;
        }
        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }
        if (showDeleted !== 'true') {
            filter.isDeleted = false;
        }

        const products = await Product.find(filter).sort({ createdAt: -1 });
        const activeProducts = products.filter(p => !p.isDeleted && p.isActive);
        const inactiveProducts = products.filter(p => !p.isDeleted && !p.isActive);
        const deletedProducts = products.filter(p => p.isDeleted);

        res.json({
            success: true,
            products: activeProducts,
            inactiveProducts: inactiveProducts,
            deletedProducts: deletedProducts,
            stats: {
                total: activeProducts.length,
                inactive: inactiveProducts.length,
                deleted: deletedProducts.length
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ CREATE PRODUCT (Admin - WITH MULTIPLE IMAGES)
router.post('/', protect, adminOnly, uploadFields, async (req, res) => {
    try {
        let imageUrl = '';
        let additionalImageUrls = [];

        // ✅ Handle main image from files
        if (req.files && req.files['image'] && req.files['image'][0]) {
            const result = await uploadToCloudinary(req.files['image'][0].buffer);
            imageUrl = result.secure_url;
        } else if (req.body.image) {
            imageUrl = req.body.image;
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Product image is required' 
            });
        }

        // ✅ Handle additional images from files
        if (req.files && req.files['additionalImages'] && req.files['additionalImages'].length > 0) {
            additionalImageUrls = await uploadMultipleToCloudinary(req.files['additionalImages']);
        }

        // ✅ Parse additional images from body (if any)
        let bodyImages = [];
        if (req.body.images) {
            try {
                bodyImages = JSON.parse(req.body.images);
            } catch {
                bodyImages = [];
            }
        }

        // ✅ Merge all images (body images + uploaded additional images)
        const allImages = [...bodyImages, ...additionalImageUrls];

        // ✅ Parse highlights
        let highlights = [];
        if (req.body.highlights) {
            try {
                highlights = JSON.parse(req.body.highlights);
            } catch {
                highlights = [];
            }
        }

        // ✅ Parse healthBenefits
        let healthBenefits = [];
        if (req.body.healthBenefits) {
            try {
                healthBenefits = JSON.parse(req.body.healthBenefits);
            } catch {
                healthBenefits = [];
            }
        }

        const productData = {
            name: req.body.name,
            subtitle: req.body.subtitle,
            description: req.body.description,
            price: parseFloat(req.body.price),
            originalPrice: parseFloat(req.body.originalPrice),
            image: imageUrl,
            category: req.body.category,
            tag: req.body.tag || null,
            stock: parseInt(req.body.stock) || 999,
            rating: parseFloat(req.body.rating) || 4.5,
            reviews: parseInt(req.body.reviews) || 0,
            images: allImages,
            highlights: highlights.length > 0 ? highlights : [
                '100% Pure & Natural Ingredients',
                'Lab Tested for Quality',
                'No Artificial Preservatives',
                'Cruelty Free Product'
            ],
            healthBenefits: healthBenefits.length > 0 ? healthBenefits : [
                'Boosts Immune System',
                'Improves Energy Levels',
                'Supports Overall Wellness',
                'Natural Stress Relief'
            ],
            howToUse: req.body.howToUse || 'Take 1-2 capsules daily with water, preferably with meals. For best results, use consistently for 30 days.',
            whoCanUse: req.body.whoCanUse || 'Suitable for adults of all ages. Consult your healthcare provider if pregnant or nursing.'
        };

        const product = new Product(productData);
        await product.save();
        
        res.status(201).json({ 
            success: true, 
            product,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ UPDATE PRODUCT (Admin - WITH MULTIPLE IMAGES)
router.put('/:id', protect, adminOnly, uploadFields, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.isDeleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot update a deleted product. Restore it first.' 
            });
        }

        let imageUrl = product.image;
        let newAdditionalImages = [];

        // ✅ Handle main image update
        if (req.files && req.files['image'] && req.files['image'][0]) {
            await deleteFromCloudinary(product.image);
            const result = await uploadToCloudinary(req.files['image'][0].buffer);
            imageUrl = result.secure_url;
        } else if (req.body.image && req.body.image !== product.image) {
            await deleteFromCloudinary(product.image);
            imageUrl = req.body.image;
        }

        // ✅ Handle additional images upload
        if (req.files && req.files['additionalImages'] && req.files['additionalImages'].length > 0) {
            newAdditionalImages = await uploadMultipleToCloudinary(req.files['additionalImages']);
        }

        // ✅ Parse images from body
        let bodyImages = [];
        if (req.body.images) {
            try {
                bodyImages = JSON.parse(req.body.images);
            } catch {
                bodyImages = [];
            }
        }

        // ✅ Merge existing images + new uploaded images
        const allImages = [...bodyImages, ...newAdditionalImages];

        // ✅ Parse highlights
        let highlights = product.highlights || [];
        if (req.body.highlights) {
            try {
                highlights = JSON.parse(req.body.highlights);
            } catch {
                highlights = [];
            }
        }

        // ✅ Parse healthBenefits
        let healthBenefits = product.healthBenefits || [];
        if (req.body.healthBenefits) {
            try {
                healthBenefits = JSON.parse(req.body.healthBenefits);
            } catch {
                healthBenefits = [];
            }
        }

        const updateData = {
            name: req.body.name || product.name,
            subtitle: req.body.subtitle || product.subtitle,
            description: req.body.description || product.description,
            price: req.body.price ? parseFloat(req.body.price) : product.price,
            originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : product.originalPrice,
            image: imageUrl,
            category: req.body.category || product.category,
            tag: req.body.tag || product.tag,
            stock: req.body.stock ? parseInt(req.body.stock) : product.stock,
            rating: req.body.rating ? parseFloat(req.body.rating) : product.rating,
            reviews: req.body.reviews ? parseInt(req.body.reviews) : product.reviews,
            images: allImages,
            highlights: highlights,
            healthBenefits: healthBenefits,
            howToUse: req.body.howToUse || product.howToUse,
            whoCanUse: req.body.whoCanUse || product.whoCanUse
        };

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { returnDocument: 'after', runValidators: true }
        );
        
        res.json({ 
            success: true, 
            product: updatedProduct,
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ SOFT DELETE PRODUCT
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isDeleted = true;
        product.deletedAt = new Date();
        await product.save();
        
        res.json({ 
            success: true, 
            message: 'Product moved to trash successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ PERMANENT DELETE PRODUCT
router.delete('/:id/permanent', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        await deleteFromCloudinary(product.image);
        await Product.findByIdAndDelete(req.params.id);
        
        res.json({ 
            success: true, 
            message: 'Product permanently deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ RESTORE DELETED PRODUCT
router.put('/:id/restore', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.isDeleted = false;
        product.deletedAt = null;
        await product.save();
        
        res.json({ 
            success: true, 
            message: 'Product restored successfully',
            product
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ TOGGLE PRODUCT ACTIVE STATUS
router.patch('/:id/toggle-active', protect, adminOnly, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        if (product.isDeleted) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cannot toggle a deleted product. Restore it first.' 
            });
        }

        product.isActive = !product.isActive;
        await product.save();
        
        res.json({ 
            success: true, 
            product,
            message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// ✅ GET DELETED PRODUCTS (Admin)
router.get('/admin/deleted', protect, adminOnly, async (req, res) => {
    try {
        const deletedProducts = await Product.find({ isDeleted: true }).sort({ deletedAt: -1 });
        res.json({
            success: true,
            count: deletedProducts.length,
            products: deletedProducts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;