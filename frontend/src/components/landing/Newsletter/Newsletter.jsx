import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import './Newsletter.css';

const Newsletter = () => {
    const [email, setEmail] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.2, triggerOnce: true }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email) {
            alert(`Thank you for subscribing with: ${email}`);
            setEmail('');
        }
    };

    return (
        <section className="newsletter-premium" ref={sectionRef}>
            {/* Floating background elements */}
            <div className="newsletter-floating-elements">
                <div className="floating-leaf leaf-1">🌿</div>
                <div className="floating-leaf leaf-2">🍃</div>
                <div className="floating-leaf leaf-3">🌱</div>
                <div className="floating-leaf leaf-4">🌾</div>
            </div>

            <div className="newsletter-premium-container">
                <motion.div 
                    className="newsletter-content"
                    initial={{ opacity: 0, y: 50 }}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                >
                    {/* Badge */}
                    <div className="newsletter-badge">
                        <span className="badge-icon">📧</span>
                        <span>Stay Connected</span>
                    </div>

                    {/* Heading */}
                    <h2 className="newsletter-title">
                        Subscribe to Our <span className="title-highlight">Newsletter</span>
                    </h2>
                    
                    {/* Subtitle */}
                    <p className="newsletter-subtitle">
                        Get the latest updates on new products, exclusive offers, and wellness tips delivered straight to your inbox.
                    </p>

                    {/* Benefits Row */}
                    <div className="newsletter-benefits">
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>10% off on first order</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>Exclusive deals</span>
                        </div>
                        <div className="benefit-item">
                            <span className="benefit-check">✓</span>
                            <span>No spam, unsubscribe anytime</span>
                        </div>
                    </div>

                    {/* Form */}
                    <form className="newsletter-form" onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <span className="input-icon">✉️</span>
                            <input 
                                type="email"
                                className="newsletter-input"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="newsletter-btn">
                            <span>Subscribe</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </form>

                    {/* Social Proof */}
                    <div className="newsletter-social-proof">
                        <div className="avatar-stack">
                            <div className="avatar">🌿</div>
                            <div className="avatar">🍯</div>
                            <div className="avatar">🌱</div>
                            <div className="avatar-count">10k+</div>
                        </div>
                        <p className="social-proof-text">
                            Join <strong>10,000+</strong> health-conscious subscribers
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Newsletter;