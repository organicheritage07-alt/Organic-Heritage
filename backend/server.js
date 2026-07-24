const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const passport = require('passport');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const benefitRoutes = require('./routes/benefitRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const contactRoutes = require('./routes/contactRoutes');
const ingredientRoutes = require('./routes/ingredientRoutes'); // ✅ ADD INGREDIENT ROUTES

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// ============================================
// TRUST PROXY — Required for Render (behind proxy)
// ============================================
app.set('trust proxy', 1);

// ============================================
// SESSION MIDDLEWARE — Required for Passport Google OAuth
// ============================================
app.use(session({
    secret: process.env.JWT_SECRET || 'organic_heritage_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true on Render (HTTPS)
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-domain cookies
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// ============================================
// PASSPORT INITIALIZE — Must be AFTER session
// ============================================
app.use(passport.initialize());
app.use(passport.session());

// ============================================
// ✅ CORS — Explicit origins for Vercel + Render
// ============================================
const allowedOrigins = [
    'https://organic-heritage-gqe7-xi.vercel.app',
    'https://organic-heritage-gqe7-lgxl3t1ji-organicheritage07-alts-projects.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('❌ CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => console.error('❌ MongoDB Error:', err));

// ========== ROUTES ==========
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/benefits', benefitRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ingredients', ingredientRoutes); // ✅ ADD INGREDIENT ROUTES

// Test route
app.get('/', (req, res) => {
    res.json({ message: '🌿 Organic Heritage API is running!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📦 API Endpoints:`);
    console.log(`   - /api/auth          → Auth routes`);
    console.log(`   - /api/products      → Product routes`);
    console.log(`   - /api/cart          → Cart routes`);
    console.log(`   - /api/orders        → Order routes`);
    console.log(`   - /api/benefits      → Benefit routes`);
    console.log(`   - /api/reviews       → Review routes`);
    console.log(`   - /api/notifications → Notification routes`);
    console.log(`   - /api/contact       → Contact routes`);
    console.log(`   - /api/ingredients   → Ingredient routes`); // ✅ Added
});