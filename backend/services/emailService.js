require('dotenv').config();
const axios = require('axios');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://theorganicheritage.com';

console.log('Email Service Initialized');
console.log('API Key present:', BREVO_API_KEY ? 'Yes' : 'No');
console.log('Sender Email:', BREVO_SENDER_EMAIL || 'Not set');
console.log('Sender Name:', BREVO_SENDER_NAME || 'Not set');

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================
// CORE EMAIL FUNCTION
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
// SOCIAL ICONS - TEXT BASED (Works in ALL email clients: Gmail, Outlook, Apple Mail, Mobile)
// ============================================
const socialLink = (url, label) => {
    return `
        <td style="padding: 0 5px;">
            <a href="${url}" target="_blank" style="display: block; width: 40px; height: 40px; background-color: #1B2E1A; color: #FFFFFF; text-align: center; line-height: 40px; text-decoration: none; font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.5px;">
                ${label}
            </a>
        </td>
    `;
};

const socialSection = `
    <tr>
        <td style="padding: 28px 20px; background-color: #F8FAF8; border-top: 1px solid #E8EDE8; text-align: center;">
            <p style="margin: 0 0 16px 0; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 3px; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Follow Us</p>
            <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                    ${socialLink('https://www.facebook.com/share/1F7PAiT1d3/', 'f')}
                    ${socialLink('https://www.instagram.com/organicheritage09?igsh=c3pnZmkwZmxhOGg4', 'ig')}
                    ${socialLink('https://www.linkedin.com/in/organic-heritage-966a1b413/', 'in')}
                    ${socialLink('https://www.tiktok.com/@organicheritage?is_from_webapp=1&sender_device=pc', 'tt')}
                    ${socialLink('https://www.youtube.com/channel/UCT3dfUeJv3xzk96N-xGtz8A', 'yt')}
                </tr>
            </table>
        </td>
    </tr>
`;

// ============================================
// FOOTER SECTION
// ============================================
const footerSection = `
    <tr>
        <td style="padding: 32px 20px; background-color: #1B2E1A; text-align: center;">
            <p style="margin: 0 0 6px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 16px; color: #FFFFFF; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">ORGANIC HERITAGE</p>
            <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 1px; font-family: Arial, Helvetica, sans-serif;">Nature's Best, Delivered to You</p>
            <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">
                <a href="${FRONTEND_URL}/products" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">Products</a>
                <a href="${FRONTEND_URL}/story" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">Story</a>
                <a href="${FRONTEND_URL}/contact" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">Contact</a>
            </p>
            <p style="margin: 16px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.35); font-family: Arial, Helvetica, sans-serif;">2025 Organic Heritage. All rights reserved.</p>
            <p style="margin: 4px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.35); font-family: Arial, Helvetica, sans-serif;">Questions? Contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
        </td>
    </tr>
`;

// ============================================
// PROFESSIONAL EMAIL TEMPLATE BUILDER
// ============================================
const buildEmail = (title, content, options = {}) => {
    const { showSocial = true, showFooter = true } = options;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
        /* Mobile responsiveness */
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; }
            .email-content { padding: 32px 20px !important; }
            .email-header { padding: 28px 20px !important; }
            .brand-name { font-size: 20px !important; letter-spacing: 3px !important; }
            .main-title { font-size: 22px !important; }
            .btn-primary a { padding: 14px 32px !important; font-size: 12px !important; }
            .otp-code { font-size: 32px !important; letter-spacing: 8px !important; padding: 20px 32px !important; }
            .info-box { padding: 16px !important; }
            .mobile-full { width: 100% !important; display: block !important; }
            .mobile-center { text-align: center !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F4F0; font-family: 'Inter', Arial, Helvetica, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F4F0; padding: 24px 8px;">
        <tr>
            <td align="center">
                <table class="email-container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                    <!-- HEADER -->
                    <tr>
                        <td class="email-header" style="background-color: #1B2E1A; padding: 32px 20px; text-align: center; border-bottom: 4px solid #2D6A4F;">
                            <div class="brand-name" style="font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 24px; font-weight: 600; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase; margin: 0;">ORGANIC HERITAGE</div>
                            <div style="font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 5px; text-transform: uppercase; margin-top: 6px; font-family: Arial, Helvetica, sans-serif;">Premium Organic Products</div>
                        </td>
                    </tr>
                    <!-- CONTENT -->
                    <tr>
                        <td class="email-content" style="padding: 40px 32px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- SOCIAL -->
                    ${showSocial ? socialSection : ''}
                    <!-- FOOTER -->
                    ${showFooter ? footerSection : ''}
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
};

// ============================================
// CTA BUTTON HELPER - SHARP, PROFESSIONAL
// ============================================
const ctaButton = (text, url, style = 'primary') => {
    const isPrimary = style === 'primary';
    const bgColor = isPrimary ? '#2D6A4F' : 'transparent';
    const textColor = isPrimary ? '#FFFFFF' : '#2D6A4F';
    const borderStyle = isPrimary ? 'none' : '2px solid #2D6A4F';

    return `
        <table class="btn-primary" align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
            <tr>
                <td style="background-color: ${bgColor}; border: ${borderStyle}; text-align: center; mso-padding-alt: 16px 48px;">
                    <a href="${url}" style="display: inline-block; padding: 16px 48px; color: ${textColor}; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 1.5px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">${text}</a>
                </td>
            </tr>
        </table>
    `;
};

// ============================================
// INFO BOX HELPER
// ============================================
const infoBox = (content, accentColor = '#2D6A4F') => {
    return `
        <table class="info-box" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: #F6FAF6; border-left: 4px solid ${accentColor};">
            <tr>
                <td style="padding: 20px 24px;">
                    ${content}
                </td>
            </tr>
        </table>
    `;
};

// ============================================
// OTP EMAIL
// ============================================
const sendOTPEmail = async (toEmail, toName, otpCode) => {
    const subject = 'Your Verification Code | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Verification Code</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">Please use the verification code below to complete your authentication. This code is valid for <strong style="color: #1B2E1A;">10 minutes</strong> and can only be used once.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 36px auto;">
            <tr>
                <td class="otp-code" style="background-color: #1B2E1A; padding: 28px 48px; text-align: center;">
                    <div style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; mso-font-alt: Arial;">${otpCode}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">For your security, never share this code with anyone. Our team will never ask for your verification code.</p>`)}

        <p style="margin: 32px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center; font-family: Arial, Helvetica, sans-serif;">If you did not request this code, please disregard this email or contact our support team.</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('OTP - Organic Heritage', content));
};

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (toEmail, toName) => {
    const subject = 'Welcome to Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Welcome to the Organic Heritage Family</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">Thank you for joining us on our journey toward a healthier, more sustainable lifestyle. We are delighted to have you as part of our community dedicated to natural, organic living.</p>

        ${ctaButton('Explore Our Collection', `${FRONTEND_URL}/products`, 'primary')}

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
            <tr>
                <td style="border-top: 1px solid #E8EDE8; padding-top: 32px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; color: #1B2E1A; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">What Awaits You</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td class="mobile-full" width="50%" valign="top" style="padding-right: 8px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; padding: 20px;">
                                    <tr><td style="font-size: 18px; color: #2D6A4F; padding-bottom: 8px;">&#9670;</td></tr>
                                    <tr><td style="font-size: 14px; color: #1B2E1A; font-weight: 600; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">Premium Quality</td></tr>
                                    <tr><td style="font-size: 13px; color: #6B7280; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">Handpicked organic products sourced from trusted farms.</td></tr>
                                </table>
                            </td>
                            <td class="mobile-full" width="50%" valign="top" style="padding-left: 8px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; padding: 20px;">
                                    <tr><td style="font-size: 18px; color: #2D6A4F; padding-bottom: 8px;">&#9670;</td></tr>
                                    <tr><td style="font-size: 14px; color: #1B2E1A; font-weight: 600; padding: 4px 0; font-family: Arial, Helvetica, sans-serif;">Fast Delivery</td></tr>
                                    <tr><td style="font-size: 13px; color: #6B7280; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">Swift and reliable shipping to your doorstep.</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <p style="margin: 24px 0 16px 0; font-size: 14px; color: #6B7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">Start exploring our curated collection of organic essentials.</p>
        ${ctaButton('Start Shopping', `${FRONTEND_URL}/products`, 'outline')}
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Welcome - Organic Heritage', content));
};

// ============================================
// PASSWORD RESET OTP
// ============================================
const sendPasswordResetOTP = async (toEmail, toName, otpCode) => {
    const subject = 'Password Reset Request | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Reset Your Password</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">We received a request to reset the password for your Organic Heritage account. Use the verification code below to proceed. This code will expire in <strong style="color: #1B2E1A;">10 minutes</strong>.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 36px auto;">
            <tr>
                <td class="otp-code" style="background-color: #1B2E1A; padding: 28px 48px; text-align: center;">
                    <div style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #FFFFFF; font-family: 'Courier New', Courier, monospace; mso-font-alt: Arial;">${otpCode}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #DC2626;">Did not request this?</strong> If you did not initiate this password reset, please ignore this email. Your account remains secure.</p>`, '#DC2626')}

        <p style="margin: 32px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center; font-family: Arial, Helvetica, sans-serif;">For assistance, contact our support team at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Password Reset - Organic Heritage', content));
};

// ============================================
// PASSWORD CHANGED EMAIL
// ============================================
const sendPasswordChangedEmail = async (toEmail, toName) => {
    const subject = 'Password Updated Successfully | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Password Updated</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">Your Organic Heritage account password has been successfully changed. Your account security is our top priority.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
            <tr>
                <td style="background-color: #D1FAE5; padding: 24px 40px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px; color: #065F46; font-weight: 700; font-family: Arial, Helvetica, sans-serif;">&#10003;</div>
                    <div style="font-size: 16px; font-weight: 600; color: #065F46; font-family: Arial, Helvetica, sans-serif;">Password Change Confirmed</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #DC2626;">Not you?</strong> If you did not make this change, please reset your password immediately or contact our support team.</p>`, '#DC2626')}

        ${ctaButton('Sign In to Your Account', `${FRONTEND_URL}/login`, 'primary')}
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Password Updated - Organic Heritage', content));
};

// ============================================
// LOGIN ALERT EMAIL
// ============================================
const sendLoginAlertEmail = async (toEmail, toName) => {
    const subject = 'New Sign-In Detected | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">New Sign-In Detected</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">We noticed a new sign-in to your Organic Heritage account. If this was you, no further action is required.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
            <tr>
                <td style="background-color: #FEF3C7; padding: 24px 40px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px; color: #92400E; font-weight: 700; font-family: Arial, Helvetica, sans-serif;">!</div>
                    <div style="font-size: 16px; font-weight: 600; color: #92400E; font-family: Arial, Helvetica, sans-serif;">Review Your Account Activity</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;"><strong style="color: #DC2626;">Was not you?</strong> If you did not sign in, we recommend changing your password immediately to secure your account.</p>`, '#DC2626')}

        ${ctaButton('Review Account Security', `${FRONTEND_URL}/profile`, 'primary')}
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
            <td style="padding: 14px 10px; font-size: 14px; color: #374151; font-family: Arial, Helvetica, sans-serif;">${item.name}</td>
            <td style="padding: 14px 10px; text-align: center; font-size: 14px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">${item.quantity}</td>
            <td style="padding: 14px 10px; text-align: right; font-size: 14px; color: #374151; font-weight: 500; font-family: Arial, Helvetica, sans-serif;">Rs ${Number(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${name}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Your Order is Confirmed</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">Thank you for choosing Organic Heritage. We have received your order and are preparing it with care. You will receive updates as your order progresses.</p>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Date</td><td style="text-align: right; font-weight: 500; color: #374151;">${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment Method</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Status</td><td style="text-align: right;"><span style="color: #2D6A4F; font-weight: 600; background-color: #D1FAE5; padding: 4px 12px; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">${order.status.toUpperCase()}</span></td></tr>
            </table>
        `)}

        <h3 style="margin: 32px 0 16px 0; font-size: 16px; color: #1B2E1A; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background-color: #F6FAF6;">
                    <th style="padding: 12px 10px; text-align: left; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Product</th>
                    <th style="padding: 12px 10px; text-align: center; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Qty</th>
                    <th style="padding: 12px 10px; text-align: right; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Price</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
            <tfoot>
                <tr>
                    <td colspan="2" style="padding: 14px 10px; text-align: right; font-weight: 600; font-size: 16px; color: #1B2E1A; font-family: Arial, Helvetica, sans-serif;">Total</td>
                    <td style="padding: 14px 10px; text-align: right; font-weight: 700; font-size: 18px; color: #2D6A4F; font-family: Arial, Helvetica, sans-serif;">Rs ${Number(order.total).toLocaleString()}</td>
                </tr>
            </tfoot>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; margin: 24px 0;">
            <tr>
                <td style="padding: 24px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #1B2E1A; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Shipping Address</h4>
                    <p style="margin: 4px 0; font-size: 14px; color: #374151; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">${order.shippingAddress.name}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">${order.shippingAddress.address}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">${order.shippingAddress.city}${order.shippingAddress.zipCode ? ', ' + order.shippingAddress.zipCode : ''}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">${order.shippingAddress.phone}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8F5E9; margin: 16px 0;">
            <tr>
                <td style="padding: 16px 24px; text-align: center;">
                    <p style="margin: 0; color: #1B5E20; font-size: 14px; font-weight: 500; font-family: Arial, Helvetica, sans-serif;">Estimated Delivery: <strong>3-5 Business Days</strong></p>
                </td>
            </tr>
        </table>

        ${ctaButton('View My Orders', `${FRONTEND_URL}/orders`, 'primary')}

        <p style="margin: 24px 0 0 0; font-size: 14px; color: #6B7280; text-align: center; font-family: Arial, Helvetica, sans-serif;">Thank you for supporting organic, sustainable living.</p>
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
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${name}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">${config.title}</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">${config.message}</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto;">
            <tr>
                <td style="background-color: ${config.bg}; padding: 20px 40px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: ${config.color}; font-family: Arial, Helvetica, sans-serif;">Current Status</div>
                    <div style="font-size: 24px; font-weight: 700; color: ${config.color}; font-family: Arial, Helvetica, sans-serif;">${order.status.toUpperCase()}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Total</td><td style="text-align: right; font-weight: 600; color: #2D6A4F;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        `)}

        ${ctaButton('View My Orders', `${FRONTEND_URL}/orders`, 'primary')}

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center; font-family: Arial, Helvetica, sans-serif;">Need help? Contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
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
            <td style="padding: 10px 10px; font-size: 13px; color: #374151; font-family: Arial, Helvetica, sans-serif;">${item.name}</td>
            <td style="padding: 10px 10px; text-align: center; font-size: 13px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">${item.quantity}</td>
            <td style="padding: 10px 10px; text-align: right; font-size: 13px; color: #374151; font-family: Arial, Helvetica, sans-serif;">Rs ${Number(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">New Order Received</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">A new order has been placed on Organic Heritage. Please review the details below.</p>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Customer</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.name}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Email</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.user?.email || 'N/A'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Phone</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.phone}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Total</td><td style="text-align: right; font-weight: 700; color: #2D6A4F; font-size: 16px;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        `)}

        <h3 style="margin: 24px 0 12px 0; font-size: 14px; color: #1B2E1A; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background-color: #F6FAF6;">
                    <th style="padding: 10px 10px; text-align: left; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Product</th>
                    <th style="padding: 10px 10px; text-align: center; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Qty</th>
                    <th style="padding: 10px 10px; text-align: right; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Price</th>
                </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>

        ${ctaButton('View in Admin Panel', `${FRONTEND_URL}/admin/dashboard`, 'primary')}
    `;

    return await sendEmail(adminEmail, adminName, subject, buildEmail(`Admin Notification - ${order.orderNumber}`, content, { showSocial: false }));
};

// ============================================
// CONTACT REPLY EMAIL
// ============================================
const sendContactReplyEmail = async (toEmail, toName, reply, subject, originalMessage) => {
    const emailSubject = `Re: ${subject || 'Your Inquiry'} - Organic Heritage`;

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280; font-family: Arial, Helvetica, sans-serif;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 class="main-title" style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Reply to Your Inquiry</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">Thank you for reaching out to us. We value your interest in Organic Heritage and are here to assist you.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; background-color: #F3F4F6;">
            <tr>
                <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; font-family: Arial, Helvetica, sans-serif;">Your Original Query:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; font-family: Arial, Helvetica, sans-serif;">${originalMessage || 'No additional details provided.'}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: #D1FAE5; border-left: 4px solid #2D6A4F;">
            <tr>
                <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1B2E1A; font-weight: 600; font-family: Arial, Helvetica, sans-serif;">Our Response:</p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; font-family: Arial, Helvetica, sans-serif;">${reply}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; background-color: #FEF3C7;">
            <tr>
                <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #92400E; font-family: Arial, Helvetica, sans-serif;">If you have any further questions, simply reply to this email. We're always happy to help.</p>
                </td>
            </tr>
        </table>

        ${ctaButton('Visit Our Contact Page', `${FRONTEND_URL}/contact`, 'outline')}

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center; font-family: Arial, Helvetica, sans-serif;">Thank you for choosing Organic Heritage &mdash; Nature's Best, Delivered to You.</p>
    `;

    return await sendEmail(toEmail, toName, emailSubject, buildEmail(`Reply to Your Inquiry - Organic Heritage`, content));
};

// ============================================
// EXPORTS
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
    sendContactReplyEmail
};