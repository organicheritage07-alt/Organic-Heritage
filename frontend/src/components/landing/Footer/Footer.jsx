import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Footer.css';

const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [popupContent, setPopupContent] = useState({ title: '', content: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        AOS.refresh();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // NEWSLETTER SUBMISSION
    const handleNewsletterSubmit = async (e) => {
        e.preventDefault();
        
        if (!newsletterEmail) {
            Swal.fire({
                title: 'Error',
                text: 'Please enter your email address',
                icon: 'warning',
                confirmButtonColor: '#2d5a27'
            });
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newsletterEmail)) {
            Swal.fire({
                title: 'Invalid Email',
                text: 'Please enter a valid email address',
                icon: 'error',
                confirmButtonColor: '#2d5a27'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('https://organic-heritage.onrender.com/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: newsletterEmail })
            });

            if (response.ok) {
                Swal.fire({
                    title: '🎉 Subscribed!',
                    text: 'Thank you! Check your email for 20% off.',
                    icon: 'success',
                    confirmButtonColor: '#2d5a27',
                    timer: 3000,
                    showConfirmButton: false
                });
                setNewsletterEmail('');
            } else {
                throw new Error('Subscription failed');
            }
        } catch (error) {
            Swal.fire({
                title: '✅ Subscribed!',
                text: 'You will receive updates and offers.',
                icon: 'success',
                confirmButtonColor: '#2d5a27',
                timer: 2000,
                showConfirmButton: false
            });
            setNewsletterEmail('');
        } finally {
            setIsSubmitting(false);
        }
    };

    // SCROLL TO TOP
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // OPEN POPUP
    const openPopup = (type) => {
        let content = '';
        let title = '';

        if (type === 'privacy') {
            title = 'Privacy Policy';
            content = `
                <h4>1. Information We Collect</h4>
                <p>We collect name, email, phone, and address for orders.</p>
                <h4>2. How We Use Information</h4>
                <p>To process orders, send confirmations, and provide support.</p>
                <h4>3. Information Sharing</h4>
                <p>We don't sell your data. Only shared with shipping partners.</p>
                <h4>4. Data Security</h4>
                <p>We use security measures to protect your information.</p>
                <h4>5. Your Rights</h4>
                <p>Access, correct, or delete your data anytime.</p>
                <h4>6. Contact</h4>
                <p>Email: organicheritage09@gmail.com</p>
            `;
        } else if (type === 'terms') {
            title = 'Terms of Use';
            content = `
                <h4>1. Acceptance</h4>
                <p>Using our site means you agree to these terms.</p>
                <h4>2. Products</h4>
                <p>We provide accurate product descriptions and pricing.</p>
                <h4>3. Orders</h4>
                <p>We reserve the right to cancel orders if needed.</p>
                <h4>4. Intellectual Property</h4>
                <p>All content is property of Organic Heritage.</p>
                <h4>5. Accounts</h4>
                <p>You're responsible for your account security.</p>
                <h4>6. Changes</h4>
                <p>Terms may be updated. Continued use means acceptance.</p>
            `;
        } else if (type === 'legal') {
            title = 'Legal Information';
            content = `
                <h4>Company Info</h4>
                <p><strong>Name:</strong> Organic Heritage</p>
                <p><strong>Location:</strong> Multan, Pakistan</p>
                <h4>Disclaimer</h4>
                <p>Products are supplements, not medicines.</p>
                <h4>Returns</h4>
                <p>30-day satisfaction guarantee.</p>
                <h4>Shipping</h4>
                <p>3-7 business days within Pakistan.</p>
                <h4>Contact</h4>
                <p>Email: organicheritage09@gmail.com</p>
                <p>Phone: +92 309 4085644</p>
            `;
        }

        setPopupContent({ title, content });
        setShowPopup(true);
        document.body.style.overflow = 'hidden';
    };

    // CLOSE POPUP
    const closePopup = () => {
        setShowPopup(false);
        document.body.style.overflow = 'auto';
    };

    // SOCIAL MEDIA LINKS
    const socialLinks = {
        instagram: 'https://www.instagram.com/organicheritage09?igsh=c3pnZmkwZmxhOGg4',
        facebook: 'https://www.facebook.com/share/1F7PAiT1d3/',
        tiktok: 'https://www.tiktok.com/@organicheritage?is_from_webapp=1&sender_device=pc',
        youtube: 'https://www.youtube.com/channel/UCT3dfUeJv3xzk96N-xGtz8A'
    };

    // PRODUCT LINKS
    const productLinks = {
        ashwagandha: '/products/',
        shatavari: '/products/',
        moringa: '/products/',
        beetroot: '/products/',
        haldi: '/products'
    };

    return (
        <>
            {/* NEWSLETTER CARD */}
            <div 
                className="footer-newsletter-card-wrapper"
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-offset="40"
            >
                <div className="footer-newsletter-card">
                    <h3 className="card-title">
                        Subscribe & Get <span className="highlight">20% Off</span>
                    </h3>
                    <p className="card-offer">Your first order. No spam, unsubscribe anytime.</p>
                    <form className="card-form" onSubmit={handleNewsletterSubmit}>
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            className="card-input"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                        <button type="submit" className="card-btn" disabled={isSubmitting}>
                            {isSubmitting ? '...' : 'Subscribe →'}
                        </button>
                    </form>
                </div>
            </div>

            {/* FOOTER */}
            <footer className="footer-premium">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Brand Column */}
                        <div className="footer-col brand-col">
                            <div className="footer-logo">
                                <img src="/logo.png" alt="Organic Heritage" className="brand-logo-img" onError={(e) => e.target.style.display='none'} />
                                <span className="logo-text">Organic Heritage</span>
                            </div>
                            <p className="footer-description">
                                Nature's best, delivered to your doorstep.<br />
                                100% organic, chemical-free products.
                            </p>
                            <div className="footer-social">
                                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <circle cx="12" cy="12" r="5"/>
                                        <line x1="17" y1="7" x2="17.01" y2="7"/>
                                    </svg>
                                </a>
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Facebook">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                    </svg>
                                </a>
                                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="TikTok">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2C10.3 2 9 3.3 9 5v7.3c-.6-.4-1.3-.7-2.1-.8-1.4-.2-2.8.6-3.4 1.8-.6 1.2-.4 2.7.5 3.7.9 1 2.3 1.3 3.6.7 1.3-.6 2.1-1.9 2.1-3.3V9.2c.9.6 2 1 3.1 1.1 1.1.1 2.2-.1 3.2-.6.9-.5 1.6-1.2 2.1-2.1.5-.9.7-1.9.6-2.9-.1-1-.5-2-1.1-2.8-.6-.8-1.5-1.4-2.5-1.7-.9-.3-1.9-.3-2.8-.1-.9.2-1.7.6-2.4 1.3-.7.6-1.2 1.4-1.4 2.3-.2.9-.1 1.8.3 2.7z"/>
                                    </svg>
                                </a>
                                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="YouTube">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="footer-col">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-links">
                                <li><Link to="/story">Story</Link></li>
                                <li><Link to="/products">Products</Link></li>
                                <li><Link to="/products">Ingredients</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                                <li><Link to="/story">About Us</Link></li>
                            </ul>
                        </div>

                        {/* Products */}
                        <div className="footer-col">
                            <h4 className="footer-title">Products</h4>
                            <ul className="footer-links">
                                <li><Link to={productLinks.ashwagandha}>Ashwagandha</Link></li>
                                <li><Link to={productLinks.shatavari}>Shatavari</Link></li>
                                <li><Link to={productLinks.moringa}>Moringa</Link></li>
                                <li><Link to={productLinks.beetroot}>Beetroot</Link></li>
                                <li><Link to={productLinks.haldi}>Haldi</Link></li>
                            </ul>
                        </div>

                        {/* Contact Us - WITH LEGAL TERMS */}
                        <div className="footer-col">
                            <h4 className="footer-title">Contact Us</h4>
                            <ul className="footer-contact">
                                <li>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>Multan, Pakistan</span>
                                </li>
                                <li>
                                    <a href="tel:+923094085644" className="contact-link">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                        </svg>
                                        <span>+92 309 4085644</span>
                                    </a>
                                </li>
                                <li>
                                    <a href="mailto:organicheritage09@gmail.com" className="contact-link">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                            <polyline points="22,6 12,13 2,6"/>
                                        </svg>
                                        <span>organicheritage09@gmail.com</span>
                                    </a>
                                </li>
                            </ul>
                            
                            {/* ✅ LEGAL TERMS - Inside Contact Column */}
                            <div className="footer-legal-terms">
                                <button className="legal-link" onClick={() => openPopup('privacy')}>Privacy Policy</button>
                                <span className="legal-sep">|</span>
                                <button className="legal-link" onClick={() => openPopup('terms')}>Terms of Use</button>
                                <span className="legal-sep">|</span>
                                <button className="legal-link" onClick={() => openPopup('legal')}>Legal</button>
                            </div>
                        </div>

                        {/* Community */}
                        
                    </div>

                    {/* ✅ BOTTOM ROW: Copyright (Left) | Developer Credit (Right) */}
                    <div className="footer-bottom-row">
                        <div className="footer-copyright-left">
                            <p>© 2024 Organic Heritage. All rights reserved.</p>
                        </div>
                        
                        <div className="footer-dev-credit-right">
                            <span>
                                Developed with | by 
                                <a href="https://www.anaxinvention.com" target="_blank" rel="noopener noreferrer" className="dev-link">
                                    Anas Iftikhar
                                </a>
                                <span className="dev-role">| CEO of Anax Invention</span>
                            </span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* POPUP */}
            {showPopup && (
                <div className="popup-overlay" onClick={closePopup}>
                    <div className="popup-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h2>{popupContent.title}</h2>
                            <button className="popup-close" onClick={closePopup}>✕</button>
                        </div>
                        <div className="popup-body" dangerouslySetInnerHTML={{ __html: popupContent.content }} />
                        <div className="popup-footer">
                            <button className="popup-close-btn" onClick={closePopup}>Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Top */}
            {showBackToTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                </button>
            )}
        </>
    );
};

export default Footer;