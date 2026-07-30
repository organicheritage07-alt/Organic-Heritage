const mongoose = require('mongoose');

// ============================================
// HELPER: Generate URL-friendly slug
// ============================================
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  subtitle: {
    type: String,
    required: [true, 'Product subtitle is required'],
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true
    // ❌ REMOVED: required validation
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  image: {
    type: String,
    required: [true, 'Product image is required']
  },
  images: {
    type: [String],
    default: []
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
    // ❌ REMOVED: enum restriction — admin can now type any category
  },
  tag: {
    type: String,
    enum: ['Bestseller', 'Popular', 'Hot', 'Top Rated', 'New', ''],
    default: ''
  },
  stock: {
    type: Number,
    default: 999,
    min: [0, 'Stock cannot be negative']
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviews: {
    type: Number,
    default: 0,
    min: [0, 'Reviews cannot be negative']
  },
  highlights: {
    type: [String],
    default: [
      '100% Pure & Natural Ingredients',
      'Lab Tested for Quality',
      'No Artificial Preservatives',
      'Cruelty Free Product'
    ]
  },
  healthBenefits: {
    type: [String],
    default: [
      'Boosts Immune System',
      'Improves Energy Levels',
      'Supports Overall Wellness',
      'Natural Stress Relief'
    ]
  },
  howToUse: {
    type: String,
    default: 'Take 1-2 capsules daily with water, preferably with meals. For best results, use consistently for 30 days.'
  },
  whoCanUse: {
    type: String,
    default: 'Suitable for adults of all ages. Consult your healthcare provider if pregnant or nursing.'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating discount percentage
productSchema.virtual('calculatedDiscount').get(function() {
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// ✅ Pre-save: Discount calculate + Slug generate
productSchema.pre('save', async function() {
  // Discount calculation
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }

  // Slug generation (unique check)
  if (this.isModified('name') || !this.slug) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    this.slug = slug;
  }
});

// ✅ Pre-update: Discount calculate + Slug regenerate if name changed
productSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();

  // Discount calculation
  if (update && update.price && update.originalPrice && update.originalPrice > 0) {
    update.discount = Math.round(((update.originalPrice - update.price) / update.originalPrice) * 100);
  }

  // Slug regeneration
  if (update && update.name) {
    let baseSlug = generateSlug(update.name);
    let slug = baseSlug;
    let counter = 1;
    const currentId = this.getQuery()._id;

    while (await mongoose.model('Product').findOne({ slug, _id: { $ne: currentId } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    update.slug = slug;
  }
});

module.exports = mongoose.model('Product', productSchema);