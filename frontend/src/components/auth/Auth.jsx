// Auth.jsx (Updated - Google OAuth + User-Friendly Errors + Clean Welcome Email)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaEnvelope, 
    FaLock, 
    FaUser, 
    FaArrowRight, 
    FaShieldAlt, 
    FaArrowLeft,
    FaHome,
    FaEye,
    FaEyeSlash,
    FaKey,
    FaGoogle
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, setUser, logoutUser } from '../../store/slices/authSlice';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import './Auth.css';

const API_URL = 'http://localhost:5000/api/auth';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [view, setView] = useState('auth');
    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [otpSentEmail, setOtpSentEmail] = useState('');
    const otpRefs = useRef([]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        forgotEmail: '',
        newPassword: '',
        confirmPassword: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { error, isAuthenticated, user } = useSelector((state) => state.auth);

    const slides = [
        {
            title: "Organic Heritage",
            subtitle: "Pure Organic Products For You",
            description: "Premium Ashwagandha, Shatavari, Moringa, Beetroot & more. 100% natural, certified organic supplements."
        },
        {
            title: "Farm Fresh",
            subtitle: "From Nature to Your Wellness",
            description: "Handpicked organic herbs and superfoods. Boost immunity, balance hormones, and rejuvenate your body naturally."
        },
        {
            title: "100% Certified",
            subtitle: "Natural | Organic | Pure",
            description: "All products are lab-tested, preservative-free, and packed with essential vitamins, minerals & antioxidants."
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Redirect based on user role after authentication
    useEffect(() => {
        if (isAuthenticated && user) {
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            
            if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath, { replace: true });
                return;
            }
            
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (error) {
            toast.error(getFriendlyError(error));
            dispatch(clearError());
        }
    }, [error, dispatch]);

    // ============================================
    // USER-FRIENDLY ERROR MESSAGES
    // ============================================
    const getFriendlyError = (errorMsg) => {
        if (!errorMsg) return 'Something went wrong. Please try again.';
        
        const lowerMsg = errorMsg.toLowerCase();
        
        if (lowerMsg.includes('invalid email or password')) {
            return 'The email or password you entered is incorrect. Please check and try again.';
        }
        if (lowerMsg.includes('user already exists')) {
            return 'An account with this email already exists. Please sign in instead.';
        }
        if (lowerMsg.includes('otp expired')) {
            return 'Your verification code has expired. Please request a new one.';
        }
        if (lowerMsg.includes('invalid otp')) {
            return 'The code you entered is incorrect. Please check and try again.';
        }
        if (lowerMsg.includes('no account found')) {
            return 'We could not find an account with this email. Please check your email or create a new account.';
        }
        if (lowerMsg.includes('server error')) {
            return 'Our servers are experiencing issues. Please try again in a few moments.';
        }
        if (lowerMsg.includes('network')) {
            return 'Connection issue detected. Please check your internet and try again.';
        }
        if (lowerMsg.includes('token')) {
            return 'Your session has expired. Please sign in again.';
        }
        if (lowerMsg.includes('password must be at least')) {
            return 'Your password must be at least 6 characters long for security.';
        }
        if (lowerMsg.includes('all fields are required')) {
            return 'Please fill in all the required fields to continue.';
        }
        
        return errorMsg;
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return;
        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value !== "" && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length && i < 6; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const focusIndex = Math.min(pastedData.length, 5);
        otpRefs.current[focusIndex]?.focus();
    };

    const sendOTP = async (email) => {
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/send-otp`, { email });
            if (response.data.success) {
                toast.success('A verification code has been sent to your email!');
                setOtpSentEmail(email.toLowerCase().trim());
                return true;
            } else {
                toast.error(getFriendlyError(response.data.message));
                return false;
            }
        } catch (error) {
            toast.error(getFriendlyError(error.response?.data?.message));
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const verifyOTPAndRegister = async () => {
        const finalOtp = otp.join("");
        const cleanEmail = formData.email.trim().toLowerCase();

        if (finalOtp.length < 6) {
            toast.error("Please enter the complete 6-digit verification code.");
            return;
        }

        setIsLoading(true);
        try {
            const verifyResponse = await axios.post(`${API_URL}/verify-otp-register`, {
                email: cleanEmail,
                otp: finalOtp,
                name: formData.name.trim(),
                password: formData.password
            });

            if (verifyResponse.data.success) {
                toast.success('Welcome to Organic Heritage! Your account has been created successfully.');
                
                const { token, user: userData } = verifyResponse.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(userData));
                dispatch(setUser({ user: userData, token }));
                
                setTimeout(() => {
                    const redirectPath = sessionStorage.getItem('redirectAfterLogin');
                    if (redirectPath) {
                        sessionStorage.removeItem('redirectAfterLogin');
                        navigate(redirectPath, { replace: true });
                    } else if (userData.role === 'admin') {
                        navigate('/admin/dashboard', { replace: true });
                    } else {
                        navigate('/', { replace: true });
                    }
                }, 1500);
                
                setShowOtp(false);
                setOtp(['', '', '', '', '', '']);
                setFormData({ ...formData, email: '', password: '', name: '' });
            } else {
                toast.error(getFriendlyError(verifyResponse.data.message));
            }
        } catch (error) {
            toast.error(getFriendlyError(error.response?.data?.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const cleanEmail = formData.email.trim().toLowerCase();
        
        if (!formData.name.trim()) {
            toast.error('Please enter your full name.');
            return;
        }
        if (!cleanEmail) {
            toast.error('Please enter your email address.');
            return;
        }
        if (formData.password.length < 6) {
            toast.error('Your password must be at least 6 characters long.');
            return;
        }
        
        const otpSent = await sendOTP(cleanEmail);
        if (otpSent) {
            setShowOtp(true);
            setTimeout(() => otpRefs.current[0]?.focus(), 300);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const cleanEmail = formData.email.trim().toLowerCase();
        
        if (!cleanEmail || !formData.password) {
            toast.error('Please enter both your email and password.');
            return;
        }

        setIsLoading(true);
        const result = await dispatch(loginUser({ 
            email: cleanEmail, 
            password: formData.password 
        }));
        
        if (result.payload?.success && result.payload?.token) {
            toast.success('Welcome back! You have signed in successfully.');
            
            const userData = result.payload.user;
            localStorage.setItem('userRole', userData.role);
            
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            
            if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath, { replace: true });
            } else if (userData.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } else {
            toast.error(getFriendlyError(result.payload?.message));
        }
        setIsLoading(false);
    };

    // ============================================
    // GOOGLE LOGIN HANDLER
    // ============================================
    const handleGoogleLogin = () => {
        // Redirect to backend Google OAuth endpoint
        window.location.href = `${API_URL}/google`;
    };

    const handleAuthSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            handleLogin(e);
        } else {
            handleSignup(e);
        }
    };

    const handleForgotRequest = async (e) => {
        e.preventDefault();
        const email = formData.forgotEmail.trim().toLowerCase();
        
        if (!email) {
            toast.error('Please enter your email address.');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/forgot-password-send-otp`, { email });
            if (response.data.success) {
                toast.success('A password reset code has been sent to your email.');
                setOtpSentEmail(email);
                setView('forgot-otp');
                setOtp(['', '', '', '', '', '']);
                setTimeout(() => otpRefs.current[0]?.focus(), 300);
            } else {
                toast.error(getFriendlyError(response.data.message));
            }
        } catch (error) {
            toast.error(getFriendlyError(error.response?.data?.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyForgotOtp = async () => {
        const finalOtp = otp.join("");
        const email = otpSentEmail;
        
        if (finalOtp.length < 6) {
            toast.error("Please enter the complete 6-digit verification code.");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/forgot-password-verify-otp`, {
                email,
                otp: finalOtp
            });
            
            if (response.data.success) {
                toast.success('Identity verified! You can now create a new password.');
                setView('reset-password');
                setOtp(['', '', '', '', '', '']);
            } else {
                toast.error(getFriendlyError(response.data.message));
            }
        } catch (error) {
            toast.error(getFriendlyError(error.response?.data?.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalReset = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("The passwords you entered do not match. Please try again.");
            return;
        }
        if (formData.newPassword.length < 6) {
            toast.error("Your new password must be at least 6 characters long.");
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.post(`${API_URL}/reset-password`, {
                email: otpSentEmail,
                password: formData.newPassword
            });
            
            if (response.data.success) {
                toast.success('Your password has been reset successfully. Please sign in with your new password.');
                setView('auth');
                setIsLogin(true);
                setFormData({ ...formData, forgotEmail: '', newPassword: '', confirmPassword: '' });
                setOtp(['', '', '', '', '', '']);
            } else {
                toast.error(getFriendlyError(response.data.message));
            }
        } catch (error) {
            toast.error(getFriendlyError(error.response?.data?.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (view !== 'auth') {
            setView('auth');
            setShowOtp(false);
            setOtp(['', '', '', '', '', '']);
        } else if (showOtp) {
            setShowOtp(false);
            setOtp(['', '', '', '', '', '']);
        } else {
            navigate('/');
        }
    };

    const goToHome = () => {
        navigate('/');
    };

    return (
        <div className="auth-page-wrapper">
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1B2E1A',
                        color: '#fff',
                        borderRadius: '12px',
                        padding: '12px 20px',
                    }
                }}
            />

            <div className="auth-top-nav">
                <button className="home-btn" onClick={goToHome}>
                    <FaHome /> Home
                </button>
            </div>

            <div className="auth-3d-card">
                {/* Left Side - Branding */}
                <div className="auth-side-brand">
                    <div className="brand-overlay"></div>
                    <div className="brand-content">
                        <div className="brand-logo-wrapper">
                            <img 
                                src="/logo.png" 
                                alt="Organic Heritage Logo" 
                                className="brand-logo-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                            <div className="brand-logo-fallback" style={{display: 'none'}}>
                                <span className="brand-logo-text">OH</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -30 }}
                                transition={{ duration: 0.6, ease: "easeInOut" }}
                                className="slide-content"
                            >
                                <h1 className="brand-title">{slides[currentSlide].title}</h1>
                                <p className="brand-subtitle">{slides[currentSlide].subtitle}</p>
                                <p className="brand-description">{slides[currentSlide].description}</p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="slide-indicators">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    className={`slide-dot ${currentSlide === index ? 'active' : ''}`}
                                    onClick={() => setCurrentSlide(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="auth-side-form">
                    <button className="back-button" onClick={handleBack}>
                        <FaArrowLeft /> Back
                    </button>

                    <AnimatePresence mode="wait">
                        {view === 'auth' && (
                            <motion.div
                                key={showOtp ? "otp" : "auth-form"}
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.4 }}
                                className="form-container"
                            >
                                {showOtp ? (
                                    <div className="otp-section">
                                        <div className="otp-icon-wrapper">
                                            <FaShieldAlt className="otp-shield-icon" />
                                        </div>
                                        <h2 className="form-title">Verification</h2>
                                        <p className="auth-subtitle">
                                            Enter the 6-digit code sent to <strong>{formData.email}</strong>
                                        </p>
                                        <div className="otp-input-row">
                                            {otp.map((digit, index) => (
                                                <input
                                                    key={index}
                                                    ref={el => otpRefs.current[index] = el}
                                                    type="text"
                                                    maxLength="1"
                                                    className="otp-field"
                                                    value={digit}
                                                    onChange={(e) => handleOtpChange(e.target, index)}
                                                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                                    onPaste={handleOtpPaste}
                                                />
                                            ))}
                                        </div>
                                        <button 
                                            className="submit-btn" 
                                            onClick={verifyOTPAndRegister}
                                            disabled={isLoading}
                                        >
                                            {isLoading ? 'Verifying...' : 'Verify & Register'}
                                            {!isLoading && <FaArrowRight />}
                                        </button>
                                        <p className="resend-text" onClick={() => { 
                                            setShowOtp(false); 
                                            setOtp(['', '', '', '', '', '']); 
                                        }}>
                                            ← Go Back
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="form-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
                                        <p className="form-subtitle">
                                            {isLogin ? 'Sign in to continue your wellness journey' : 'Join Organic Heritage family today'}
                                        </p>

                                        {/* GOOGLE LOGIN BUTTON */}
                                        <button 
                                            className="google-btn" 
                                            onClick={handleGoogleLogin}
                                            type="button"
                                        >
                                            <FaGoogle size={18} style={{ color: '#EA4335' }} /> 
                                            Continue with Google
                                        </button>

                                        <div className="auth-divider">
                                            <span>OR</span>
                                        </div>

                                        <form onSubmit={handleAuthSubmit}>
                                            {!isLogin && (
                                                <div className="input-group">
                                                    <FaUser className="input-icon" />
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        placeholder="Full Name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        required={!isLogin}
                                                    />
                                                </div>
                                            )}

                                            <div className="input-group">
                                                <FaEnvelope className="input-icon" />
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="Email Address"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="input-group">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required
                                                    minLength={6}
                                                />
                                                <button 
                                                    type="button" 
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>

                                            {isLogin && (
                                                <p className="forgot-link" onClick={() => setView('forgot-request')}>
                                                    Forgot Password?
                                                </p>
                                            )}

                                            <button type="submit" className="submit-btn" disabled={isLoading}>
                                                {isLoading 
                                                    ? (isLogin ? 'Signing in...' : 'Sending code...') 
                                                    : (isLogin ? 'Sign In' : 'Get Security Code')}
                                                {!isLoading && <FaArrowRight />}
                                            </button>
                                        </form>

                                        <p className="toggle-text">
                                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                                            <span onClick={() => { 
                                                setIsLogin(!isLogin); 
                                                setShowOtp(false); 
                                                setOtp(['', '', '', '', '', '']); 
                                            }}>
                                                {isLogin ? ' Create Account' : ' Sign In'}
                                            </span>
                                        </p>
                                    </>
                                )}
                            </motion.div>
                        )}

                        {view === 'forgot-request' && (
                            <motion.div
                                key="forgot"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.4 }}
                                className="form-container"
                            >
                                <div className="otp-icon-wrapper">
                                    <FaEnvelope className="otp-shield-icon" />
                                </div>
                                <h2 className="form-title">Reset Password</h2>
                                <p className="form-subtitle">Enter your email to receive a reset code</p>
                                <form onSubmit={handleForgotRequest}>
                                    <div className="input-group">
                                        <FaEnvelope className="input-icon" />
                                        <input
                                            type="email"
                                            name="forgotEmail"
                                            placeholder="Enter your email"
                                            value={formData.forgotEmail}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="submit-btn" disabled={isLoading}>
                                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                                        {!isLoading && <FaArrowRight />}
                                    </button>
                                </form>
                                <p className="back-link" onClick={() => setView('auth')}>
                                    ← Back to Login
                                </p>
                            </motion.div>
                        )}

                        {view === 'forgot-otp' && (
                            <motion.div
                                key="forgot-otp"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                                className="form-container"
                            >
                                <div className="otp-icon-wrapper">
                                    <FaShieldAlt className="otp-shield-icon" />
                                </div>
                                <h2 className="form-title">Verify Code</h2>
                                <p className="auth-subtitle">Enter the 6-digit code sent to <strong>{otpSentEmail}</strong></p>
                                <div className="otp-input-row">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={el => otpRefs.current[index] = el}
                                            type="text"
                                            maxLength="1"
                                            className="otp-field"
                                            value={digit}
                                            onChange={(e) => handleOtpChange(e.target, index)}
                                            onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                            onPaste={handleOtpPaste}
                                        />
                                    ))}
                                </div>
                                <button className="submit-btn" onClick={handleVerifyForgotOtp} disabled={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Verify Identity'} <FaArrowRight />
                                </button>
                                <p className="back-link" onClick={() => { 
                                    setView('forgot-request'); 
                                    setOtp(['', '', '', '', '', '']); 
                                }}>
                                    ← Back
                                </p>
                            </motion.div>
                        )}

                        {view === 'reset-password' && (
                            <motion.div
                                key="reset"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="form-container"
                            >
                                <div className="otp-icon-wrapper">
                                    <FaKey className="otp-shield-icon" />
                                </div>
                                <h2 className="form-title">New Password</h2>
                                <p className="form-subtitle">Create a strong password for your account</p>
                                <form onSubmit={handleFinalReset}>
                                    <div className="input-group">
                                        <FaKey className="input-icon" />
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            name="newPassword"
                                            placeholder="New Password"
                                            value={formData.newPassword}
                                            onChange={handleInputChange}
                                            required
                                            minLength={6}
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <div className="input-group">
                                        <FaShieldAlt className="input-icon" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            placeholder="Confirm Password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                            minLength={6}
                                        />
                                        <button 
                                            type="button" 
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                    <button type="submit" className="submit-btn" disabled={isLoading}>
                                        {isLoading ? 'Updating...' : 'Change Password'}
                                        {!isLoading && <FaArrowRight />}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Auth;