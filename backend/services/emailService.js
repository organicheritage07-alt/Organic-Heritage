require('dotenv').config();
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

console.log('Email Service Initialized');
console.log('API Key present:', BREVO_API_KEY ? 'Yes' : 'No');
console.log('Sender Email:', BREVO_SENDER_EMAIL || 'Not set');
console.log('Sender Name:', BREVO_SENDER_NAME || 'Not set');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================
// CORE EMAIL FUNCTION - Always returns an object
// ============================================
const sendEmail = async (toEmail, toName, subject, htmlContent) => {
    if (!BREVO_API_KEY) {
        console.error('BREVO_API_KEY is not set in .env file');
        return { success: false, error: 'API key missing. Please check .env file.' };
    }

    if (!BREVO_SENDER_EMAIL) {
        console.error('BREVO_SENDER_EMAIL is not set in .env file');
        return { success: false, error: 'Sender email missing. Please check .env file.' };
    }

    try {
        console.log(`Sending email to: ${toEmail}`);

        const data = {
            sender: {
                email: BREVO_SENDER_EMAIL,
                name: BREVO_SENDER_NAME || 'Organic Heritage'
            },
            to: [{
                email: toEmail,
                name: toName || 'Customer'
            }],
            subject: subject,
            htmlContent: htmlContent
        };

        const response = await axios({
            method: 'post',
            url: 'https://api.brevo.com/v3/smtp/email',
            data: data,
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            }
        });

        console.log(`Email sent successfully to ${toEmail}`);
        return { success: true, messageId: response.data.messageId };

    } catch (error) {
        console.error('Email error:', {
            status: error.response?.status,
            message: error.response?.data?.message,
            code: error.response?.data?.code
        });

        if (error.response?.status === 401) {
            return { success: false, error: 'Invalid API key. Please check BREVO_API_KEY in .env' };
        }
        if (error.response?.status === 400) {
            return { success: false, error: 'Sender email not verified or invalid request' };
        }

        return { success: false, error: error.message || 'Failed to send email' };
    }
};

// ============================================
// PROFESSIONAL EMAIL TEMPLATE BUILDER
// ============================================
const buildEmail = (title, content) => {
    const logoUrl = `${FRONTEND_URL}/logo.png`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F0F4F0; -webkit-font-smoothing: antialiased; }
        .email-wrapper { width: 100%; background-color: #F0F4F0; padding: 48px 16px; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
        .email-header { background: #1B2E1A; padding: 40px 32px; text-align: center; position: relative; }
        .email-header::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: #2D6A4F; }
        .logo-img { height: 56px; width: auto; filter: brightness(0) invert(1); margin-bottom: 8px; }
        .brand-name { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 600; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; }
        .brand-tagline { font-size: 11px; color: rgba(255,255,255,0.6); letter-spacing: 6px; text-transform: uppercase; margin-top: 6px; }
        .email-content { padding: 48px 40px; }
        .greeting { font-size: 15px; color: #6B7280; margin-bottom: 8px; }
        .greeting strong { color: #1B2E1A; font-weight: 600; }
        .main-title { font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 600; color: #1B2E1A; margin-bottom: 16px; line-height: 1.3; }
        .subtitle { font-size: 15px; color: #6B7280; line-height: 1.7; margin-bottom: 32px; }
        .divider { height: 1px; background: #E8EDE8; margin: 32px 0; }
        .btn-primary { display: inline-block; background: #2D6A4F; color: #FFFFFF; padding: 16px 40px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px; transition: all 0.3s ease; border: none; cursor: pointer; }
        .btn-primary:hover { background: #1B2E1A; }
        .btn-outline { display: inline-block; background: transparent; color: #2D6A4F; padding: 14px 36px; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 14px; border: 2px solid #2D6A4F; }
        .info-box { background: #F6FAF6; border-left: 4px solid #2D6A4F; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 24px 0; }
        .info-box p { margin: 4px 0; font-size: 14px; color: #4B5563; }
        .info-box strong { color: #1B2E1A; }
        .footer { background: #F8FAF8; padding: 32px 40px; text-align: center; border-top: 1px solid #E8EDE8; }
        .footer-brand { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; color: #1B2E1A; font-weight: 600; letter-spacing: 2px; margin-bottom: 8px; }
        .footer-text { font-size: 12px; color: #9CA3AF; margin: 4px 0; line-height: 1.6; }
        .footer-links { margin-top: 16px; }
        .footer-links a { color: #2D6A4F; text-decoration: none; font-size: 12px; margin: 0 12px; font-weight: 500; }
        .social-links { margin: 20px 0 12px; }
        .social-links a { display: inline-block; width: 36px; height: 36px; background: #E8EDE8; border-radius: 50%; margin: 0 6px; text-align: center; line-height: 36px; color: #1B2E1A; text-decoration: none; font-size: 14px; }
        @media (max-width: 480px) {
            .email-content { padding: 32px 24px; }
            .main-title { font-size: 22px; }
            .brand-name { font-size: 18px; }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="email-container">
            <div class="email-header">
                <img src="${logoUrl}" alt="Organic Heritage" class="logo-img" onerror="this.style.display='none'" />
                <div class="brand-name">Organic Heritage</div>
                <div class="brand-tagline">Premium Organic Products</div>
            </div>
            <div class="email-content">
                ${content}
            </div>
            <div class="footer">
                <div class="footer-brand">ORGANIC HERITAGE</div>
                <p class="footer-text">Nature's Best, Delivered to You</p>
                <div class="social-links">
                    <a href="#">f</a>
                    <a href="#">in</a>
                    <a href="#">ig</a>
                </div>
                <div class="footer-links">
                    <a href="${FRONTEND_URL}/shop">Shop</a>
                    <a href="${FRONTEND_URL}/about">About</a>
                    <a href="${FRONTEND_URL}/contact">Contact</a>
                </div>
                <p class="footer-text" style="margin-top: 16px;">2025 Organic Heritage. All rights reserved.</p>
                <p class="footer-text">If you have any questions, contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

// ============================================
// OTP EMAIL
// ============================================
const sendOTPEmail = async (toEmail, toName, otpCode) => {
    const subject = 'Your Verification Code | Organic Heritage';

    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">Verification Code</h1>
        <p class="subtitle">Please use the verification code below to complete your authentication. This code is valid for <strong>10 minutes</strong> and can only be used once.</p>

        <div style="text-align: center; margin: 40px 0;">
            <div style="background: #1B2E1A; color: #FFFFFF; padding: 28px 48px; border-radius: 16px; display: inline-block;">
                <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Inter', monospace;">${otpCode}</div>
            </div>
        </div>

        <div class="info-box">
            <p style="font-size: 13px; color: #6B7280; margin: 0;">For your security, never share this code with anyone. Our team will never ask for your verification code.</p>
        </div>

        <p style="font-size: 13px; color: #9CA3AF; text-align: center; margin-top: 32px;">If you did not request this code, please disregard this email or contact our support team.</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('OTP - Organic Heritage', content));
};

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (toEmail, toName) => {
    const subject = 'Welcome to Organic Heritage';

    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">Welcome to the Organic Heritage Family</h1>
        <p class="subtitle">Thank you for joining us on our journey toward a healthier, more sustainable lifestyle. We are delighted to have you as part of our community dedicated to natural, organic living.</p>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/shop" class="btn-primary">Explore Our Collection</a>
        </div>

        <div class="divider"></div>

        <h3 style="font-size: 16px; color: #1B2E1A; margin-bottom: 16px; font-weight: 600;">What Awaits You</h3>
        <div style="display: table; width: 100%;">
            <div style="display: table-cell; width: 50%; padding-right: 12px; vertical-align: top;">
                <div style="background: #F6FAF6; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
                    <div style="font-size: 20px; margin-bottom: 8px; color: #2D6A4F;">&#9670;</div>
                    <h4 style="font-size: 14px; color: #1B2E1A; font-weight: 600; margin-bottom: 4px;">Premium Quality</h4>
                    <p style="font-size: 13px; color: #6B7280; line-height: 1.5;">Handpicked organic products sourced from trusted farms.</p>
                </div>
            </div>
            <div style="display: table-cell; width: 50%; padding-left: 12px; vertical-align: top;">
                <div style="background: #F6FAF6; border-radius: 12px; padding: 20px; margin-bottom: 12px;">
                    <div style="font-size: 20px; margin-bottom: 8px; color: #2D6A4F;">&#9670;</div>
                    <h4 style="font-size: 14px; color: #1B2E1A; font-weight: 600; margin-bottom: 4px;">Fast Delivery</h4>
                    <p style="font-size: 13px; color: #6B7280; line-height: 1.5;">Swift and reliable shipping to your doorstep.</p>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <p style="font-size: 14px; color: #6B7280; margin-bottom: 16px;">Start exploring our curated collection of organic essentials.</p>
            <a href="${FRONTEND_URL}/shop" class="btn-outline">Start Shopping</a>
        </div>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Welcome - Organic Heritage', content));
};

// ============================================
// PASSWORD RESET OTP
// ============================================
const sendPasswordResetOTP = async (toEmail, toName, otpCode) => {
    const subject = 'Password Reset Request | Organic Heritage';

    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">Reset Your Password</h1>
        <p class="subtitle">We received a request to reset the password for your Organic Heritage account. Use the verification code below to proceed. This code will expire in <strong>10 minutes</strong>.</p>

        <div style="text-align: center; margin: 40px 0;">
            <div style="background: #1B2E1A; color: #FFFFFF; padding: 28px 48px; border-radius: 16px; display: inline-block;">
                <div style="font-size: 42px; font-weight: 700; letter-spacing: 12px; font-family: 'Inter', monospace;">${otpCode}</div>
            </div>
        </div>

        <div class="info-box" style="border-left-color: #DC2626;">
            <p style="font-size: 13px; color: #6B7280; margin: 0;"><strong style="color: #DC2626;">Did not request this?</strong> If you did not initiate this password reset, please ignore this email. Your account remains secure.</p>
        </div>

        <p style="font-size: 13px; color: #9CA3AF; text-align: center; margin-top: 32px;">For assistance, contact our support team at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Password Reset - Organic Heritage', content));
};

// ============================================
// PASSWORD CHANGED EMAIL
// ============================================
const sendPasswordChangedEmail = async (toEmail, toName) => {
    const subject = 'Password Updated Successfully | Organic Heritage';

    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">Password Updated</h1>
        <p class="subtitle">Your Organic Heritage account password has been successfully changed. Your account security is our top priority.</p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="background: #D1FAE5; color: #065F46; padding: 20px 32px; border-radius: 12px; display: inline-block;">
                <div style="font-size: 32px; margin-bottom: 8px; font-weight: 700;">&#10003;</div>
                <div style="font-size: 16px; font-weight: 600;">Password Change Confirmed</div>
            </div>
        </div>

        <div class="info-box" style="border-left-color: #DC2626;">
            <p style="font-size: 13px; color: #6B7280; margin: 0;"><strong style="color: #DC2626;">Not you?</strong> If you did not make this change, please reset your password immediately or contact our support team.</p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/login" class="btn-primary">Sign In to Your Account</a>
        </div>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Password Updated - Organic Heritage', content));
};

// ============================================
// LOGIN ALERT EMAIL
// ============================================
const sendLoginAlertEmail = async (toEmail, toName) => {
    const subject = 'New Sign-In Detected | Organic Heritage';

    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">New Sign-In Detected</h1>
        <p class="subtitle">We noticed a new sign-in to your Organic Heritage account. If this was you, no further action is required.</p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="background: #FEF3C7; color: #92400E; padding: 20px 32px; border-radius: 12px; display: inline-block;">
                <div style="font-size: 32px; margin-bottom: 8px; font-weight: 700;">!</div>
                <div style="font-size: 16px; font-weight: 600;">Review Your Account Activity</div>
            </div>
        </div>

        <div class="info-box" style="border-left-color: #DC2626;">
            <p style="font-size: 13px; color: #6B7280; margin: 0;"><strong style="color: #DC2626;">Was not you?</strong> If you did not sign in, we recommend changing your password immediately to secure your account.</p>
        </div>

        <div style="text-align: center; margin-top: 32px;">
            <a href="${FRONTEND_URL}/profile" class="btn-primary">Review Account Security</a>
        </div>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Login Alert - Organic Heritage', content));
};

// ============================================
// ORDER CONFIRMATION EMAIL - CUSTOMER
// ============================================
const sendOrderConfirmation = async (email, name, order) => {
    const subject = `Order Confirmed: ${order.orderNumber} | Organic Heritage`;

    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #E8EDE8;">
            <td style="padding: 14px 12px; font-size: 14px; color: #374151;">${item.name}</td>
            <td style="padding: 14px 12px; text-align: center; font-size: 14px; color: #6B7280;">${item.quantity}</td>
            <td style="padding: 14px 12px; text-align: right; font-size: 14px; color: #374151; font-weight: 500;">Rs ${Number(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <p class="greeting">Dear <strong>${name}</strong>,</p>
        <h1 class="main-title">Your Order is Confirmed</h1>
        <p class="subtitle">Thank you for choosing Organic Heritage. We have received your order and are preparing it with care. You will receive updates as your order progresses.</p>

        <div class="info-box">
            <table style="width: 100%; font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Date</td><td style="text-align: right; font-weight: 500; color: #374151;">${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment Method</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Status</td><td style="text-align: right;"><span style="color: #2D6A4F; font-weight: 600; background: #D1FAE5; padding: 4px 12px; border-radius: 20px; font-size: 12px;">${order.status.toUpperCase()}</span></td></tr>
            </table>
        </div>

        <h3 style="font-size: 16px; color: #1B2E1A; margin: 32px 0 16px; font-weight: 600;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background: #F6FAF6;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 14px 12px; text-align: right; font-weight: 600; font-size: 16px; color: #1B2E1A;">Total</td>
                    <td style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 18px; color: #2D6A4F;">Rs ${Number(order.total).toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <div style="background: #F6FAF6; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <h4 style="font-size: 14px; color: #1B2E1A; margin-bottom: 12px; font-weight: 600;">Shipping Address</h4>
            <p style="font-size: 14px; color: #374151; margin: 4px 0; font-weight: 600;">${order.shippingAddress.name}</p>
            <p style="font-size: 14px; color: #6B7280; margin: 4px 0;">${order.shippingAddress.address}</p>
            <p style="font-size: 14px; color: #6B7280; margin: 4px 0;">${order.shippingAddress.city}${order.shippingAddress.zipCode ? ', ' + order.shippingAddress.zipCode : ''}</p>
            <p style="font-size: 14px; color: #6B7280; margin: 4px 0;">${order.shippingAddress.phone}</p>
        </div>

        <div style="background: #E8F5E9; border-radius: 12px; padding: 16px 24px; margin: 16px 0; text-align: center;">
            <p style="margin: 0; color: #1B5E20; font-size: 14px; font-weight: 500;">Estimated Delivery: <strong>3-5 Business Days</strong></p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/orders/${order._id}" class="btn-primary">View Order Details</a>
        </div>

        <p style="font-size: 14px; color: #6B7280; text-align: center; margin-top: 24px;">Thank you for supporting organic, sustainable living.</p>
    `;

    return await sendEmail(email, name, subject, buildEmail(`Order Confirmation - ${order.orderNumber}`, content));
};

// ============================================
// ORDER STATUS UPDATE EMAIL
// ============================================
const sendOrderStatusUpdate = async (email, name, order) => {
    const statusConfig = {
        'processing': {
            title: 'Order is Being Prepared',
            message: 'Your order is now being processed. Our team is carefully preparing your items for shipment.',
            color: '#3B82F6',
            bg: '#DBEAFE',
            accent: '#1E40AF'
        },
        'shipped': {
            title: 'Your Order Has Shipped',
            message: 'Great news! Your order is on its way. You can track its progress below.',
            color: '#8B5CF6',
            bg: '#EDE9FE',
            accent: '#5B21B6'
        },
        'delivered': {
            title: 'Order Delivered',
            message: 'Your order has been delivered. We hope you enjoy your Organic Heritage products!',
            color: '#10B981',
            bg: '#D1FAE5',
            accent: '#065F46'
        },
        'cancelled': {
            title: 'Order Cancelled',
            message: 'Your order has been cancelled. If you have any questions, please contact our support team.',
            color: '#EF4444',
            bg: '#FEE2E2',
            accent: '#991B1B'
        }
    };

    const config = statusConfig[order.status] || statusConfig['processing'];
    const subject = `Order Update: ${order.orderNumber} | Organic Heritage`;

    const content = `
        <p class="greeting">Dear <strong>${name}</strong>,</p>
        <h1 class="main-title">${config.title}</h1>
        <p class="subtitle">${config.message}</p>

        <div style="text-align: center; margin: 32px 0;">
            <div style="background: ${config.bg}; color: ${config.color}; padding: 20px 32px; border-radius: 12px; display: inline-block;">
                <div style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">Current Status</div>
                <div style="font-size: 24px; font-weight: 700;">${order.status.toUpperCase()}</div>
            </div>
        </div>

        <div class="info-box">
            <table style="width: 100%; font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Total</td><td style="text-align: right; font-weight: 600; color: #2D6A4F;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/orders/${order._id}" class="btn-primary">View Order Details</a>
        </div>

        <p style="font-size: 13px; color: #9CA3AF; text-align: center; margin-top: 24px;">Need help? Contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
    `;

    return await sendEmail(email, name, subject, buildEmail(`Order Update - ${order.orderNumber}`, content));
};

// ============================================
// ADMIN ORDER NOTIFICATION
// ============================================
const sendAdminOrderNotification = async (order) => {
    const adminEmail = process.env.BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com';
    const adminName = process.env.BREVO_SENDER_NAME || 'Admin';
    const subject = `New Order: ${order.orderNumber} | Organic Heritage`;

    const itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #E8EDE8;">
            <td style="padding: 10px 12px; font-size: 13px; color: #374151;">${item.name}</td>
            <td style="padding: 10px 12px; text-align: center; font-size: 13px; color: #6B7280;">${item.quantity}</td>
            <td style="padding: 10px 12px; text-align: right; font-size: 13px; color: #374151;">Rs ${Number(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <h1 class="main-title">New Order Received</h1>
        <p class="subtitle">A new order has been placed on Organic Heritage. Please review the details below.</p>

        <div class="info-box">
            <table style="width: 100%; font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Customer</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.name}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Email</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.user?.email || 'N/A'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Phone</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.phone}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Total</td><td style="text-align: right; font-weight: 700; color: #2D6A4F; font-size: 16px;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        </div>

        <h3 style="font-size: 14px; color: #1B2E1A; margin: 24px 0 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background: #F6FAF6;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/admin/dashboard" class="btn-primary">View in Admin Panel</a>
        </div>
    `;

    return await sendEmail(adminEmail, adminName, subject, buildEmail(`Admin Notification - ${order.orderNumber}`, content));
};

// ============================================
// ✅ UPDATED: CONTACT REPLY EMAIL (with original query)
// ============================================
const sendContactReplyEmail = async (toEmail, toName, reply, subject, originalMessage) => {
    const emailSubject = `Re: ${subject || 'Your Inquiry'} - Organic Heritage`;
    
    const content = `
        <p class="greeting">Dear <strong>${toName}</strong>,</p>
        <h1 class="main-title">Reply to Your Inquiry</h1>
        <p class="subtitle">Thank you for reaching out to us. We value your interest in Organic Heritage and are here to assist you.</p>

        <div style="background: #F3F4F6; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
            <p style="font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Your Original Query:</p>
            <p style="font-size: 14px; color: #374151; line-height: 1.6; margin: 0;">${originalMessage || 'No additional details provided.'}</p>
        </div>

        <div style="background: #D1FAE5; border-left: 4px solid #2D6A4F; border-radius: 0 12px 12px 0; padding: 20px 24px; margin: 24px 0;">
            <p style="font-size: 14px; color: #1B2E1A; font-weight: 600; margin-bottom: 8px;">Our Response:</p>
            <p style="font-size: 15px; color: #374151; line-height: 1.7; margin: 0;">${reply}</p>
        </div>

        <div style="background: #FEF3C7; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
            <p style="font-size: 13px; color: #92400E; margin: 0;">If you have any further questions, simply reply to this email. We're always happy to help.</p>
        </div>

        <div style="text-align: center; margin: 32px 0;">
            <a href="${FRONTEND_URL}/contact" class="btn-outline">Visit Our Contact Page</a>
        </div>

        <p style="font-size: 13px; color: #9CA3AF; text-align: center; margin-top: 24px;">Thank you for choosing Organic Heritage — Nature's Best, Delivered to You.</p>
    `;

    return await sendEmail(toEmail, toName, emailSubject, buildEmail(`Reply to Your Inquiry - Organic Heritage`, content));
};

// ============================================
// ✅ EXPORTS
// ============================================
module.exports = {
    generateOTP,
    sendEmail,
    sendOTPEmail,
    sendWelcomeEmail,
    sendPasswordResetOTP,
    sendPasswordChangedEmail,
    sendLoginAlertEmail,
    sendOrderConfirmation,
    sendOrderStatusUpdate,
    sendAdminOrderNotification,
    sendContactReplyEmail // ✅ ADDED
};