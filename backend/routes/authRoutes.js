// authRoutes.js - Updated with Google OAuth + Soft Delete & Restore
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { sendOTPEmail, sendWelcomeEmail, sendPasswordResetOTP, sendPasswordChangedEmail, generateOTP } = require('../services/emailService');

const otpStore = new Map();

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ============================================
// PASSPORT GOOGLE OAUTH CONFIGURATION
// ============================================
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails[0].value;
        const name = profile.displayName;

        // Check if user already exists
        let user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

        if (!user) {
            // Create new user with Google data
            const randomPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
            user = new User({
                name: name,
                email: email.toLowerCase(),
                password: randomPassword,
                isDeleted: false
            });
            await user.save();

            // Send welcome email
            sendWelcomeEmail(email, name).catch(err => console.log('Welcome email error:', err.message));
        }

        done(null, user);
    } catch (error) {
        done(error, null);
    }
  }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ============================================
// GOOGLE AUTH ROUTES
// ============================================
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// ============================================
// GOOGLE CALLBACK — FIXED: JWT Token + Role-based Redirect
// ============================================
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_failed' }),
    async (req, res) => {
        try {
            const user = req.user;
            const token = generateToken(user._id, user.role);

            // Build user object for frontend
            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            };

            // Encode user data for URL
            const encodedUser = encodeURIComponent(JSON.stringify(userData));

            // Redirect to frontend callback page with token and user data
            // Frontend will handle storing in Redux and role-based redirect
            res.redirect(`http://localhost:5173/auth/callback?token=${token}&user=${encodedUser}`);
        } catch (error) {
            console.error('Google callback error:', error);
            res.redirect('http://localhost:5173/login?error=server_error');
        }
    }
);

// ============================================
// SEND OTP
// ============================================
router.post('/send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in instead.' });
        }

        const otp = generateOTP();
        const expiresAt = Date.now() + 10 * 60 * 1000;

        otpStore.set(email.toLowerCase().trim(), { otp, expiresAt });

        setTimeout(() => otpStore.delete(email.toLowerCase().trim()), 10 * 60 * 1000);

        const name = email.split('@')[0];
        const result = await sendOTPEmail(email, name, otp);

        if (result.success) {
            res.json({ success: true, message: 'Verification code sent successfully' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send verification code. Please try again later.', error: result.error });
        }
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// VERIFY OTP & REGISTER
// ============================================
router.post('/verify-otp-register', async (req, res) => {
    try {
        const { email, otp, name, password } = req.body;

        if (!email || !otp || !name || !password) {
            return res.status(400).json({ success: false, message: 'Please fill in all the required fields.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const storedData = otpStore.get(cleanEmail);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'Your verification code has expired. Please request a new one.' });
        }

        if (storedData.expiresAt < Date.now()) {
            otpStore.delete(cleanEmail);
            return res.status(400).json({ success: false, message: 'Your verification code has expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'The code you entered is incorrect. Please check and try again.' });
        }

        const userExists = await User.findOne({ email: cleanEmail, isDeleted: false });
        if (userExists) {
            otpStore.delete(cleanEmail);
            return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in instead.' });
        }

        const user = new User({ 
            name: name.trim(), 
            email: cleanEmail, 
            password: password,
            isDeleted: false
        });

        await user.save();

        otpStore.delete(cleanEmail);

        sendWelcomeEmail(cleanEmail, name.trim()).catch(err => console.log('Welcome email error:', err.message));

        const token = generateToken(user._id, user.role);

        res.status(201).json({
            success: true,
            message: 'Your account has been created successfully!',
            token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// LOGIN
// ============================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter both your email and password.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail, isDeleted: false });

        if (!user) {
            return res.status(401).json({ success: false, message: 'The email or password you entered is incorrect. Please check and try again.' });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'The email or password you entered is incorrect. Please check and try again.' });
        }

        const token = generateToken(user._id, user.role);

        res.json({ 
            success: true, 
            message: 'You have signed in successfully.',
            token, 
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// FORGOT PASSWORD - SEND OTP
// ============================================
router.post('/forgot-password-send-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Please enter your email address.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: cleanEmail, isDeleted: false });

        if (!user) {
            return res.status(404).json({ success: false, message: 'We could not find an account with this email. Please check your email or create a new account.' });
        }

        const otp = generateOTP();
        const key = `reset_${cleanEmail}`;
        const expiresAt = Date.now() + 10 * 60 * 1000;

        otpStore.set(key, { otp, expiresAt, userId: user._id });
        setTimeout(() => otpStore.delete(key), 10 * 60 * 1000);

        await sendPasswordResetOTP(cleanEmail, user.name, otp);

        res.json({ success: true, message: 'A password reset code has been sent to your email.' });
    } catch (error) {
        console.error('Forgot password send OTP error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// FORGOT PASSWORD - VERIFY OTP
// ============================================
router.post('/forgot-password-verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ success: false, message: 'Please enter the verification code.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const key = `reset_${cleanEmail}`;
        const storedData = otpStore.get(key);

        if (!storedData) {
            return res.status(400).json({ success: false, message: 'Your verification code has expired. Please request a new one.' });
        }

        if (storedData.expiresAt < Date.now()) {
            otpStore.delete(key);
            return res.status(400).json({ success: false, message: 'Your verification code has expired. Please request a new one.' });
        }

        if (storedData.otp !== otp) {
            return res.status(400).json({ success: false, message: 'The code you entered is incorrect. Please check and try again.' });
        }

        storedData.verified = true;
        otpStore.set(key, storedData);

        res.json({ success: true, message: 'Your identity has been verified successfully.' });
    } catch (error) {
        console.error('Verify forgot OTP error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// RESET PASSWORD
// ============================================
router.post('/reset-password', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please enter your new password.' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Your password must be at least 6 characters long for security.' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const key = `reset_${cleanEmail}`;
        const storedData = otpStore.get(key);

        if (!storedData || !storedData.verified) {
            return res.status(400).json({ success: false, message: 'Please verify your identity first by entering the code sent to your email.' });
        }

        const user = await User.findOne({ email: cleanEmail, isDeleted: false });

        if (!user) {
            return res.status(404).json({ success: false, message: 'We could not find your account. Please try again.' });
        }

        user.password = password;
        await user.save();

        otpStore.delete(key);

        sendPasswordChangedEmail(cleanEmail, user.name).catch(err => console.log('Email error:', err.message));

        res.json({ success: true, message: 'Your password has been reset successfully. Please sign in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// GET CURRENT USER
// ============================================
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'We could not find your account. Please sign in again.' });
        }

        res.json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
    }
});

// ============================================
// ADMIN API - GET ALL USERS (Including Deleted)
// ============================================
router.get('/admin/users', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to access this page.' });
        }

        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        const activeUsers = users.filter(u => !u.isDeleted);
        const deletedUsers = users.filter(u => u.isDeleted);

        res.json({ 
            success: true, 
            users: activeUsers,
            deletedUsers: deletedUsers,
            stats: {
                total: activeUsers.length,
                admins: activeUsers.filter(u => u.role === 'admin').length,
                users: activeUsers.filter(u => u.role === 'user').length,
                deleted: deletedUsers.length
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// ADMIN API - SOFT DELETE USER (Move to Trash)
// ============================================
router.delete('/admin/users/:id', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }

        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (userToDelete._id.toString() === adminUser._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
        }

        userToDelete.isDeleted = true;
        userToDelete.deletedAt = new Date();
        await userToDelete.save();

        res.json({ success: true, message: 'User has been moved to trash successfully.' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// ADMIN API - PERMANENT DELETE USER
// ============================================
router.delete('/admin/users/:id/permanent', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }

        const userToDelete = await User.findById(req.params.id);
        if (!userToDelete) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (userToDelete._id.toString() === adminUser._id.toString()) {
            return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: 'User has been permanently deleted.' });
    } catch (error) {
        console.error('Permanent delete error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// ADMIN API - RESTORE DELETED USER
// ============================================
router.put('/admin/users/:id/restore', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }

        const userToRestore = await User.findById(req.params.id);
        if (!userToRestore) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        userToRestore.isDeleted = false;
        userToRestore.deletedAt = null;
        await userToRestore.save();

        res.json({ success: true, message: 'User has been restored successfully.' });
    } catch (error) {
        console.error('Restore user error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// ADMIN API - GET DELETED USERS
// ============================================
router.get('/admin/users/deleted', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to access this page.' });
        }

        const deletedUsers = await User.find({ isDeleted: true }).select('-password').sort({ deletedAt: -1 });

        res.json({ 
            success: true, 
            deletedUsers
        });
    } catch (error) {
        console.error('Get deleted users error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// ADMIN API - UPDATE USER ROLE
// ============================================
router.put('/admin/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Please sign in to access this page.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const adminUser = await User.findById(decoded.id);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' });
        }

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role. Must be "user" or "admin".' });
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user._id.toString() === adminUser._id.toString() && role === 'user') {
            return res.status(400).json({ success: false, message: 'You cannot demote your own admin account.' });
        }

        user.role = role;
        await user.save();

        res.json({ 
            success: true, 
            message: `User role has been updated to ${role} successfully.`,
            user: { id: user._id, role: user.role }
        });
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// UPDATE PROFILE
// ============================================
router.put('/update-profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { name, phone } = req.body;

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'We could not find your account. Please sign in again.' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'Your profile has been updated successfully.',
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone, 
                role: user.role 
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// CHANGE PASSWORD
// ============================================
router.put('/change-password', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please enter both your current password and new password.' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Your new password must be at least 6 characters long for security.' 
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'We could not find your account. Please sign in again.' 
            });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                message: 'Your current password is incorrect. Please try again.' 
            });
        }

        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Your password has been changed successfully.'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

// ============================================
// GET USER PROFILE
// ============================================
router.get('/profile', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'We could not find your account. Please sign in again.' });
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                role: user.role,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Our servers are experiencing issues. Please try again in a few moments.' });
    }
});

module.exports = router;