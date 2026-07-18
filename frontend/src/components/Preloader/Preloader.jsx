import React, { useState, useEffect } from 'react';
import './Preloader.css';

const Preloader = ({ onComplete }) => {
    const [percent, setPercent] = useState(0);
    const [hidden, setHidden] = useState(false);
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        const phase1 = setTimeout(() => setPhase(1), 100);
        const phase2 = setTimeout(() => setPhase(2), 1200);

        const interval = setInterval(() => {
            setPercent(prev => {
                const next = prev + Math.floor(Math.random() * 5) + 2;
                if (next >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return next;
            });
        }, 60);

        const hideTimer = setTimeout(() => {
            setPhase(3);
            setHidden(true);
            setTimeout(() => {
                onComplete();
            }, 1000);
        }, 4200);

        return () => {
            clearInterval(interval);
            clearTimeout(hideTimer);
            clearTimeout(phase1);
            clearTimeout(phase2);
        };
    }, [onComplete]);

    return (
        <div className={hidden ? 'preloader preloader--hidden' : 'preloader'}>
            {/* Background */}
            <div className="preloader-bg">
                <div className="preloader-bg-img" />
                <div className="preloader-bg-overlay" />
            </div>

            {/* Floating Leaves */}
            <div className="preloader-leaves">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                    <div key={n} className={`preloader-leaf preloader-leaf-${n}`}>
                        <svg viewBox="0 0 100 100" fill="none">
                            <path d="M50 5C25 18 15 45 18 68C21 88 35 95 50 92C65 95 79 88 82 68C85 45 75 18 50 5Z" fill="currentColor"/>
                            <path d="M50 15C50 15 50 50 50 88" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
                        </svg>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className={`preloader-content ${phase >= 1 ? 'preloader-content-visible' : ''}`}>

                {/* Logo */}
                <div className={`preloader-logo-wrap ${phase >= 1 ? 'preloader-logo-visible' : ''}`}>
                    <div className="preloader-logo-circle">
                        <img src="/logo.png" alt="Organic Heritage" className="preloader-logo-img" />
                    </div>
                    <div className="preloader-logo-pulse" />
                    <div className="preloader-logo-pulse-2" />
                </div>

                {/* Brand Name */}
                <h1 className={`preloader-brand ${phase >= 1 ? 'preloader-brand-visible' : ''}`}>
                    <span className="preloader-brand-word">
                        {'ORGANIC'.split('').map((char, i) => (
                            <span key={i} className="preloader-brand-char" style={{ animationDelay: (0.4 + i * 0.07) + 's' }}>
                                {char}
                            </span>
                        ))}
                    </span>
                    <span className="preloader-brand-space"> </span>
                    <span className="preloader-brand-word">
                        {'HERITAGE'.split('').map((char, i) => (
                            <span key={i} className="preloader-brand-char" style={{ animationDelay: (0.8 + i * 0.07) + 's' }}>
                                {char}
                            </span>
                        ))}
                    </span>
                </h1>

                {/* Divider */}
                <div className={`preloader-divider ${phase >= 1 ? 'preloader-divider-visible' : ''}`}>
                    <span className="preloader-divider-line" />
                    <svg className="preloader-divider-icon" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#66bb6a"/>
                    </svg>
                    <span className="preloader-divider-line" />
                </div>

                {/* Tagline */}
                <p className={`preloader-tagline ${phase >= 1 ? 'preloader-tagline-visible' : ''}`}>
                    Nature's Finest Heritage
                </p>

                {/* Progress */}
                <div className={`preloader-progress-wrap ${phase >= 2 ? 'preloader-progress-visible' : ''}`}>
                    <div className="preloader-progress-track">
                        <div className="preloader-progress-bar" style={{ width: percent + '%' }} />
                    </div>
                    <div className="preloader-progress-info">
                        <span className="preloader-progress-num">{percent}%</span>
                        <span className="preloader-progress-label">Loading</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preloader;