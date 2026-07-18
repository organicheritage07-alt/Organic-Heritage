const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    tag: {
        type: String,
        required: true,
        trim: true
    },
    detail: {
        type: String,
        required: true,
        trim: true
    },
    productRelation: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#2D6A4F'
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

module.exports = mongoose.model('Ingredient', ingredientSchema);