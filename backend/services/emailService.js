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
// SOCIAL ICONS SVG (INLINE - NO EXTERNAL DEPS)
// ============================================
const socialIcons = {
    facebook: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
    instagram: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>`,
    linkedin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    tiktok: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>`,
    youtube: `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
};

// ============================================
// PROFESSIONAL EMAIL TEMPLATE BUILDER
// ============================================
const buildEmail = (title, content, options = {}) => {
    const { showSocial = true, showFooter = true } = options;

    const socialSection = showSocial ? `
        <tr>
            <td style="padding: 28px 40px; background-color: #F8FAF8; border-top: 1px solid #E8EDE8; text-align: center;">
                <p style="margin: 0 0 16px 0; font-size: 11px; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; font-weight: 600;">Follow Us</p>
                <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                        <td style="padding: 0 6px;">
                            <a href="https://www.facebook.com/share/1F7PAiT1d3/" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1B2E1A; text-align: center; line-height: 40px; text-decoration: none; color: #FFFFFF;">
                                ${socialIcons.facebook}
                            </a>
                        </td>
                        <td style="padding: 0 6px;">
                            <a href="https://www.instagram.com/organicheritage09?igsh=c3pnZmkwZmxhOGg4" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1B2E1A; text-align: center; line-height: 40px; text-decoration: none; color: #FFFFFF;">
                                ${socialIcons.instagram}
                            </a>
                        </td>
                        <td style="padding: 0 6px;">
                            <a href="https://www.linkedin.com/in/organic-heritage-966a1b413/" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1B2E1A; text-align: center; line-height: 40px; text-decoration: none; color: #FFFFFF;">
                                ${socialIcons.linkedin}
                            </a>
                        </td>
                        <td style="padding: 0 6px;">
                            <a href="https://www.tiktok.com/@organicheritage?is_from_webapp=1&sender_device=pc" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1B2E1A; text-align: center; line-height: 40px; text-decoration: none; color: #FFFFFF;">
                                ${socialIcons.tiktok}
                            </a>
                        </td>
                        <td style="padding: 0 6px;">
                            <a href="https://www.youtube.com/channel/UCT3dfUeJv3xzk96N-xGtz8A" target="_blank" style="display: inline-block; width: 40px; height: 40px; background-color: #1B2E1A; text-align: center; line-height: 40px; text-decoration: none; color: #FFFFFF;">
                                ${socialIcons.youtube}
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    ` : '';

    const footerSection = showFooter ? `
        <tr>
            <td style="padding: 28px 40px; background-color: #1B2E1A; text-align: center;">
                <p style="margin: 0 0 8px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 16px; color: #FFFFFF; font-weight: 600; letter-spacing: 3px; text-transform: uppercase;">ORGANIC HERITAGE</p>
                <p style="margin: 0 0 16px 0; font-size: 12px; color: rgba(255,255,255,0.6); letter-spacing: 1px;">Nature's Best, Delivered to You</p>
                <p style="margin: 8px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6;">
                    <a href="${FRONTEND_URL}/shop" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">Shop</a>
                    <a href="${FRONTEND_URL}/about" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">About</a>
                    <a href="${FRONTEND_URL}/contact" style="color: rgba(255,255,255,0.6); text-decoration: none; margin: 0 10px;">Contact</a>
                </p>
                <p style="margin: 16px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.35);">2025 Organic Heritage. All rights reserved.</p>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: rgba(255,255,255,0.35);">Questions? Contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
            </td>
        </tr>
    ` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap');
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F0F4F0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F0F4F0; padding: 40px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
                    <!-- HEADER -->
                    <tr>
                        <td style="background-color: #1B2E1A; padding: 36px 40px; text-align: center; border-bottom: 4px solid #2D6A4F;">
                            <table align="center" cellpadding="0" cellspacing="0" border="0">
                                <tr>
                                    <td style="text-align: center;">
                                        <div style="font-family: Georgia, 'Playfair Display', serif; font-size: 26px; font-weight: 600; color: #FFFFFF; letter-spacing: 4px; text-transform: uppercase;">ORGANIC HERITAGE</div>
                                        <div style="font-size: 10px; color: rgba(255,255,255,0.55); letter-spacing: 6px; text-transform: uppercase; margin-top: 6px;">Premium Organic Products</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- CONTENT -->
                    <tr>
                        <td style="padding: 44px 40px;">
                            ${content}
                        </td>
                    </tr>
                    <!-- SOCIAL -->
                    ${socialSection}
                    <!-- FOOTER -->
                    ${footerSection}
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
        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
            <tr>
                <td style="background-color: ${bgColor}; border: ${borderStyle}; text-align: center;">
                    <a href="${url}" style="display: inline-block; padding: 16px 48px; color: ${textColor}; text-decoration: none; font-weight: 600; font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">${text}</a>
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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: #F6FAF6; border-left: 4px solid ${accentColor};">
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
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Verification Code</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">Please use the verification code below to complete your authentication. This code is valid for <strong style="color: #1B2E1A;">10 minutes</strong> and can only be used once.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 40px auto;">
            <tr>
                <td style="background-color: #1B2E1A; padding: 28px 48px; text-align: center;">
                    <div style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #FFFFFF; font-family: 'Courier New', monospace;">${otpCode}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280;">For your security, never share this code with anyone. Our team will never ask for your verification code.</p>`)}

        <p style="margin: 32px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center;">If you did not request this code, please disregard this email or contact our support team.</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('OTP - Organic Heritage', content));
};

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (toEmail, toName) => {
    const subject = 'Welcome to Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Welcome to the Organic Heritage Family</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">Thank you for joining us on our journey toward a healthier, more sustainable lifestyle. We are delighted to have you as part of our community dedicated to natural, organic living.</p>

        ${ctaButton('Explore Our Collection', `${FRONTEND_URL}/shop`, 'primary')}

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 32px 0;">
            <tr>
                <td style="border-top: 1px solid #E8EDE8; padding-top: 32px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; color: #1B2E1A; font-weight: 600;">What Awaits You</h3>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td width="50%" valign="top" style="padding-right: 10px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; padding: 20px;">
                                    <tr><td style="font-size: 20px; color: #2D6A4F; margin-bottom: 8px;">&#9670;</td></tr>
                                    <tr><td style="font-size: 14px; color: #1B2E1A; font-weight: 600; padding: 4px 0;">Premium Quality</td></tr>
                                    <tr><td style="font-size: 13px; color: #6B7280; line-height: 1.5;">Handpicked organic products sourced from trusted farms.</td></tr>
                                </table>
                            </td>
                            <td width="50%" valign="top" style="padding-left: 10px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; padding: 20px;">
                                    <tr><td style="font-size: 20px; color: #2D6A4F; margin-bottom: 8px;">&#9670;</td></tr>
                                    <tr><td style="font-size: 14px; color: #1B2E1A; font-weight: 600; padding: 4px 0;">Fast Delivery</td></tr>
                                    <tr><td style="font-size: 13px; color: #6B7280; line-height: 1.5;">Swift and reliable shipping to your doorstep.</td></tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        <p style="margin: 24px 0 16px 0; font-size: 14px; color: #6B7280; text-align: center;">Start exploring our curated collection of organic essentials.</p>
        ${ctaButton('Start Shopping', `${FRONTEND_URL}/shop`, 'outline')}
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Welcome - Organic Heritage', content));
};

// ============================================
// PASSWORD RESET OTP
// ============================================
const sendPasswordResetOTP = async (toEmail, toName, otpCode) => {
    const subject = 'Password Reset Request | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Reset Your Password</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">We received a request to reset the password for your Organic Heritage account. Use the verification code below to proceed. This code will expire in <strong style="color: #1B2E1A;">10 minutes</strong>.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 40px auto;">
            <tr>
                <td style="background-color: #1B2E1A; padding: 28px 48px; text-align: center;">
                    <div style="font-size: 42px; font-weight: 700; letter-spacing: 14px; color: #FFFFFF; font-family: 'Courier New', monospace;">${otpCode}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280;"><strong style="color: #DC2626;">Did not request this?</strong> If you did not initiate this password reset, please ignore this email. Your account remains secure.</p>`, '#DC2626')}

        <p style="margin: 32px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center;">For assistance, contact our support team at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
    `;

    return await sendEmail(toEmail, toName, subject, buildEmail('Password Reset - Organic Heritage', content));
};

// ============================================
// PASSWORD CHANGED EMAIL
// ============================================
const sendPasswordChangedEmail = async (toEmail, toName) => {
    const subject = 'Password Updated Successfully | Organic Heritage';

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Password Updated</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">Your Organic Heritage account password has been successfully changed. Your account security is our top priority.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
            <tr>
                <td style="background-color: #D1FAE5; padding: 24px 40px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px; color: #065F46; font-weight: 700;">&#10003;</div>
                    <div style="font-size: 16px; font-weight: 600; color: #065F46;">Password Change Confirmed</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280;"><strong style="color: #DC2626;">Not you?</strong> If you did not make this change, please reset your password immediately or contact our support team.</p>`, '#DC2626')}

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
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">New Sign-In Detected</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">We noticed a new sign-in to your Organic Heritage account. If this was you, no further action is required.</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
            <tr>
                <td style="background-color: #FEF3C7; padding: 24px 40px; text-align: center;">
                    <div style="font-size: 32px; margin-bottom: 8px; color: #92400E; font-weight: 700;">!</div>
                    <div style="font-size: 16px; font-weight: 600; color: #92400E;">Review Your Account Activity</div>
                </td>
            </tr>
        </table>

        ${infoBox(`<p style="margin: 0; font-size: 13px; color: #6B7280;"><strong style="color: #DC2626;">Was not you?</strong> If you did not sign in, we recommend changing your password immediately to secure your account.</p>`, '#DC2626')}

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
            <td style="padding: 14px 12px; font-size: 14px; color: #374151;">${item.name}</td>
            <td style="padding: 14px 12px; text-align: center; font-size: 14px; color: #6B7280;">${item.quantity}</td>
            <td style="padding: 14px 12px; text-align: right; font-size: 14px; color: #374151; font-weight: 500;">Rs ${Number(item.price).toLocaleString()}</td>
        </tr>
    `).join('');

    const content = `
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${name}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Your Order is Confirmed</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">Thank you for choosing Organic Heritage. We have received your order and are preparing it with care. You will receive updates as your order progresses.</p>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Date</td><td style="text-align: right; font-weight: 500; color: #374151;">${new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment Method</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Status</td><td style="text-align: right;"><span style="color: #2D6A4F; font-weight: 600; background-color: #D1FAE5; padding: 4px 12px; font-size: 11px; letter-spacing: 0.5px; text-transform: uppercase;">${order.status.toUpperCase()}</span></td></tr>
            </table>
        `)}

        <h3 style="margin: 32px 0 16px 0; font-size: 16px; color: #1B2E1A; font-weight: 600;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background-color: #F6FAF6;">
                    <th style="padding: 12px; text-align: left; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                    <th style="padding: 12px; text-align: center; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
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

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #F6FAF6; margin: 24px 0;">
            <tr>
                <td style="padding: 24px;">
                    <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #1B2E1A; font-weight: 600;">Shipping Address</h4>
                    <p style="margin: 4px 0; font-size: 14px; color: #374151; font-weight: 600;">${order.shippingAddress.name}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">${order.shippingAddress.address}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">${order.shippingAddress.city}${order.shippingAddress.zipCode ? ', ' + order.shippingAddress.zipCode : ''}</p>
                    <p style="margin: 4px 0; font-size: 14px; color: #6B7280;">${order.shippingAddress.phone}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #E8F5E9; margin: 16px 0;">
            <tr>
                <td style="padding: 16px 24px; text-align: center;">
                    <p style="margin: 0; color: #1B5E20; font-size: 14px; font-weight: 500;">Estimated Delivery: <strong>3-5 Business Days</strong></p>
                </td>
            </tr>
        </table>

        ${ctaButton('View Order Details', `${FRONTEND_URL}/orders/${order._id}`, 'primary')}

        <p style="margin: 24px 0 0 0; font-size: 14px; color: #6B7280; text-align: center;">Thank you for supporting organic, sustainable living.</p>
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
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${name}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">${config.title}</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">${config.message}</p>

        <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin: 32px auto;">
            <tr>
                <td style="background-color: ${config.bg}; padding: 20px 40px; text-align: center;">
                    <div style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; color: ${config.color};">Current Status</div>
                    <div style="font-size: 24px; font-weight: 700; color: ${config.color};">${order.status.toUpperCase()}</div>
                </td>
            </tr>
        </table>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Total</td><td style="text-align: right; font-weight: 600; color: #2D6A4F;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        `)}

        ${ctaButton('View Order Details', `${FRONTEND_URL}/orders/${order._id}`, 'primary')}

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center;">Need help? Contact us at ${BREVO_SENDER_EMAIL || 'organicheritage07@gmail.com'}</p>
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
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">New Order Received</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">A new order has been placed on Organic Heritage. Please review the details below.</p>

        ${infoBox(`
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 14px;">
                <tr><td style="color: #6B7280; padding: 4px 0;">Order Number</td><td style="text-align: right; font-weight: 600; color: #1B2E1A;">${order.orderNumber}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Customer</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.name}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Email</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.user?.email || 'N/A'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Phone</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.shippingAddress.phone}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Payment</td><td style="text-align: right; font-weight: 500; color: #374151;">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Card Payment'}</td></tr>
                <tr><td style="color: #6B7280; padding: 4px 0;">Total</td><td style="text-align: right; font-weight: 700; color: #2D6A4F; font-size: 16px;">Rs ${Number(order.total).toLocaleString()}</td></tr>
            </table>
        `)}

        <h3 style="margin: 24px 0 12px 0; font-size: 14px; color: #1B2E1A; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
            <thead>
                <tr style="background-color: #F6FAF6;">
                    <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Product</th>
                    <th style="padding: 10px 12px; text-align: center; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                    <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Price</th>
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
        <p style="margin: 0 0 8px 0; font-size: 15px; color: #6B7280;">Dear <strong style="color: #1B2E1A;">${toName}</strong>,</p>
        <h1 style="margin: 0 0 16px 0; font-family: Georgia, 'Playfair Display', serif; font-size: 28px; font-weight: 600; color: #1B2E1A; line-height: 1.3;">Reply to Your Inquiry</h1>
        <p style="margin: 0 0 32px 0; font-size: 15px; color: #6B7280; line-height: 1.7;">Thank you for reaching out to us. We value your interest in Organic Heritage and are here to assist you.</p>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; background-color: #F3F4F6;">
            <tr>
                <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Your Original Query:</p>
                    <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">${originalMessage || 'No additional details provided.'}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0; background-color: #D1FAE5; border-left: 4px solid #2D6A4F;">
            <tr>
                <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #1B2E1A; font-weight: 600;">Our Response:</p>
                    <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7;">${reply}</p>
                </td>
            </tr>
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 16px 0; background-color: #FEF3C7;">
            <tr>
                <td style="padding: 16px 20px;">
                    <p style="margin: 0; font-size: 13px; color: #92400E;">If you have any further questions, simply reply to this email. We're always happy to help.</p>
                </td>
            </tr>
        </table>

        ${ctaButton('Visit Our Contact Page', `${FRONTEND_URL}/contact`, 'outline')}

        <p style="margin: 24px 0 0 0; font-size: 13px; color: #9CA3AF; text-align: center;">Thank you for choosing Organic Heritage &mdash; Nature's Best, Delivered to You.</p>
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