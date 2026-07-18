import React, { useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Footer.css';

const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [newsletterEmail, setNewsletterEmail] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        
        // Refresh AOS
        AOS.refresh();
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNewsletterSubmit = (e) => {
        e.preventDefault();
        if (newsletterEmail) {
            alert(`Thank you for subscribing with: ${newsletterEmail}`);
            setNewsletterEmail('');
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            {/* Premium Newsletter Card - With Strong AOS Animation */}
            <div 
                className="footer-newsletter-card-wrapper"
                data-aos="fade-up"
                data-aos-duration="900"
                data-aos-offset="80"
                data-aos-easing="ease-in-out"
                data-aos-once="false"
                data-aos-mirror="true"
                data-aos-anchor-placement="top-bottom"
            >
                <div className="footer-newsletter-card">
                    <div className="card-badge">
                        <span className="badge-icon">📧</span>
                        <span>NEWSLETTER</span>
                    </div>
                    <h3 className="card-title">
                        Subscribe to our newsletter to get updates to our latest collections
                    </h3>
                    <p className="card-offer">
                        Get <strong>20% off</strong> on your first order just by subscribing to our newsletter
                    </p>
                    <form className="card-form" onSubmit={handleNewsletterSubmit}>
                        <input 
                            type="email" 
                            placeholder="Enter your email"
                            className="card-input"
                            value={newsletterEmail}
                            onChange={(e) => setNewsletterEmail(e.target.value)}
                            required
                        />
                        <button type="submit" className="card-btn">
                            Subscribe
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </form>
                    <div className="card-footer-text">
                        <p>You will be able to unsubscribe at any time. Read our <a href="#">privacy policy here</a></p>
                    </div>
                </div>
            </div>

            {/* Footer - Rest same as before */}
            <footer className="footer-premium">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Column 1: Brand */}
                        <div className="footer-col">
                            <div className="footer-logo">
                                <span className="logo-icon">🌿</span>
                                <span className="logo-text">Organic Heritage</span>
                            </div>
                            <p className="footer-description">
                                Nature's best, delivered to your doorstep. 
                                100% organic, chemical-free products for a healthier life.
                            </p>
                            <div className="footer-social">
                                <a href="#" className="social-icon" aria-label="Facebook">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Instagram">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                        <circle cx="12" cy="12" r="5"/>
                                        <line x1="17" y1="7" x2="17.01" y2="7"/>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="Twitter">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                                        <rect x="2" y="9" width="4" height="12"/>
                                        <circle cx="4" cy="4" r="2"/>
                                    </svg>
                                </a>
                                <a href="#" className="social-icon" aria-label="YouTube">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
                                    </svg>
                                </a>
                            </div>
                        </div>

                        {/* Column 2: Quick Links */}
                        <div className="footer-col">
                            <h4 className="footer-title">Quick Links</h4>
                            <ul className="footer-links">
                                <li><a href="/shop">Shop</a></li>
                                <li><a href="/categories">Categories</a></li>
                                <li><a href="/about">About Us</a></li>
                                <li><a href="/contact">Contact</a></li>
                                <li><a href="/blog">Blog</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Products */}
                        <div className="footer-col">
                            <h4 className="footer-title">Products</h4>
                            <ul className="footer-links">
                                <li><a href="#">Ashwagandha</a></li>
                                <li><a href="#">Shatavari</a></li>
                                <li><a href="#">Moringa</a></li>
                                <li><a href="#">Beetroot</a></li>
                                <li><a href="#">Haldi</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Contact Us */}
                        <div className="footer-col">
                            <h4 className="footer-title">Contact Us</h4>
                            <ul className="footer-contact">
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span>Karachi, Pakistan</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                                    </svg>
                                    <span>+92 300 1234567</span>
                                </li>
                                <li>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                    <span>info@organicheritage.com</span>
                                </li>
                            </ul>
                        </div>

                        {/* Column 5: Company */}
                        <div className="footer-col">
                            <h4 className="footer-title">Company</h4>
                            <ul className="footer-links">
                                <li><a href="#">About Us</a></li>
                                <li><a href="#">Services</a></li>
                                <li><a href="#">Community</a></li>
                                <li><a href="#">Testimonial</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="footer-bottom">
                        <p>&copy; 2024 Organic Heritage. All rights reserved.</p>
                        <div className="footer-bottom-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Use</a>
                            <a href="#">Legal</a>
                            <a href="#">Site Map</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Back to Top Button */}
            {showBackToTop && (
                <button className="back-to-top" onClick={scrollToTop}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                </button>
            )}
        </>
    );
};

export default Footer;