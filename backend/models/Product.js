const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  subtitle: {
    type: String,
    required: [true, 'Product subtitle is required'],
    trim: true,
    maxlength: [200, 'Subtitle cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
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
    enum: ['Capsules', 'Powder', 'Liquid', 'Tablets', 'Other']
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

// ✅ FIXED: Pre-save middleware - WITHOUT next parameter
productSchema.pre('save', function() {
  if (this.originalPrice > 0 && this.price < this.originalPrice) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  } else {
    this.discount = 0;
  }
});

// ✅ FIXED: Pre-update middleware - WITHOUT next parameter
productSchema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  if (update && update.price && update.originalPrice && update.originalPrice > 0) {
    update.discount = Math.round(((update.originalPrice - update.price) / update.originalPrice) * 100);
  }
});

module.exports = mongoose.model('Product', productSchema);