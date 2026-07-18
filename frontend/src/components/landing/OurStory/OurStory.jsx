import React, { useEffect, useRef, useState } from 'react';
import './OurStory.css';

const OurStory = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollY, setScrollY] = useState(0);
    const sectionRef = useRef(null);
    const imageRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (imageRef.current) {
                const rect = imageRef.current.getBoundingClientRect();
                const scrollProgress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                setScrollY(Math.max(0, Math.min(1, scrollProgress)));
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const values = [
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
                </svg>
            ),
            title: '100% Pure',
            description: 'No chemicals, no additives, just nature in its purest form'
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 22h20"/>
                    <path d="M6 18v-8a4 4 0 0 1 8 0v8"/>
                    <path d="M18 18V8a4 4 0 0 0-8 0"/>
                    <path d="M10 18v-4a2 2 0 0 1 4 0v4"/>
                </svg>
            ),
            title: 'Sustainable',
            description: 'Eco-friendly farming that protects our planet for future generations'
        },
        {
            icon: (
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                </svg>
            ),
            title: 'Fair Trade',
            description: 'Ethical partnerships with local farmers across Pakistan'
        }
    ];

    const stats = [
        { number: '10,000+', label: 'Happy Customers' },
        { number: '4.9', label: 'Average Rating' },
        { number: '100%', label: 'Organic Certified' },
        { number: '50+', label: 'Organic Farms' }
    ];

    return (
        <section className="our-story-premium" ref={sectionRef}>
            {/* Background Texture */}
            <div className="story-texture-bg"></div>

            {/* Decorative Elements */}
            <div className="story-deco leaf-top-left"></div>
            <div className="story-deco leaf-bottom-right"></div>
            <div className="story-deco circle-1"></div>
            <div className="story-deco circle-2"></div>

            <div className="story-premium-container">
                {/* Header Section */}
                <div className={`story-header ${isVisible ? 'show' : ''}`}>
                    <span className="story-eyebrow">Since 2018</span>
                    <h2 className="story-main-title">
                        Rooted in Nature,<br />
                        <span className="title-accent">Grown with Love</span>
                    </h2>
                    <div className="title-divider">
                        <span className="divider-line"></span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M12 2L15 8H22L16 12L19 18L12 14L5 18L8 12L2 8H9L12 2Z"/>
                        </svg>
                        <span className="divider-line"></span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="story-content-grid">
                    {/* Left - Text */}
                    <div className={`story-text-block ${isVisible ? 'fade-right' : ''}`}>
                        <div className="story-text-inner">
                            <p className="story-lead">
                                Organic Heritage was born from a simple yet profound belief — that the 
                                healing power of nature should be accessible to everyone. What began as 
                                a small family passion in the foothills of Punjab has blossomed into 
                                Pakistan's most trusted organic wellness brand.
                            </p>

                            <p className="story-body">
                                We journey across the fertile valleys of Pakistan, from the organic 
                                farms of Swat to the herb-rich soils of Gilgit, handpicking each 
                                ingredient at the peak of its potency. Our direct partnerships with 
                                over 50 certified organic farmers ensure fair wages, sustainable 
                                practices, and ingredients that carry the essence of pure Pakistani soil.
                            </p>

                            <p className="story-body">
                                Every capsule, every powder, every seed is a testament to our 
                                unwavering commitment — no shortcuts, no compromises, only nature's 
                                finest delivered to your doorstep.
                            </p>

                            {/* Signature */}
                            <div className="story-signature">
                                <div className="signature-line"></div>
                                <span className="signature-text">The Organic Heritage Family</span>
                            </div>
                        </div>
                    </div>

                    {/* Right - Image with Parallax */}
                    <div 
                        className={`story-image-block ${isVisible ? 'fade-left' : ''}`}
                        ref={imageRef}
                    >
                        <div className="image-frame">
                            <div 
                                className="image-inner"
                                style={{ transform: `translateY(${scrollY * 20}px)` }}
                            >
                                <img 
                                    src="./pro1.png" 
                                    alt="Organic Heritage - Pure Natural Supplements"
                                    className="story-hero-image"
                                />
                            </div>
                            {/* Image Overlay Gradient */}
                            <div className="image-overlay"></div>
                        </div>

                        {/* Floating Stats Cards */}
                        <div className="stats-float">
                            {stats.map((stat, index) => (
                                <div 
                                    key={index}
                                    className={`stat-card ${isVisible ? 'stat-show' : ''}`}
                                    style={{ transitionDelay: `${0.5 + index * 0.15}s` }}
                                >
                                    <span className="stat-number">{stat.number}</span>
                                    <span className="stat-label">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Values Section */}
                <div className={`story-values-section ${isVisible ? 'show' : ''}`}>
                    <div className="values-header">
                        <span className="values-eyebrow">Our Principles</span>
                        <h3 className="values-title">What We Stand For</h3>
                    </div>

                    <div className="values-grid">
                        {values.map((value, index) => (
                            <div 
                                key={index} 
                                className={`value-item ${isVisible ? 'value-show' : ''}`}
                                style={{ transitionDelay: `${0.8 + index * 0.12}s` }}
                            >
                                <div className="value-icon-wrap">
                                    {value.icon}
                                </div>
                                <h4 className="value-item-title">{value.title}</h4>
                                <p className="value-item-desc">{value.description}</p>
                                <div className="value-line"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className={`story-cta ${isVisible ? 'show' : ''}`}>
                    <div className="cta-content">
                        <p className="cta-quote">"Nature does not hurry, yet everything is accomplished."</p>
                        <span className="cta-author">— Lao Tzu</span>
                    </div>
                    <button className="cta-button">
                        <span>Explore Our Journey</span>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default OurStory;