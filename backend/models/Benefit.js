const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  subtitle: {
    type: String,
    required: true,
    trim: true
  },
  shortHighlight: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  accentColor: {
    type: String,
    default: '#2D6A4F'
  },
  benefits: [{
    type: String,
    required: true
  }],
  ctaText: {
    type: String,
    default: 'Discover'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Benefit', benefitSchema);