// StickyContact.jsx — "The Breathing Contact Orb"
import React, { useState, useEffect } from 'react';
import './StickyContact.css';
import { FaInstagram, FaFacebook, FaYoutube, FaWhatsapp, FaTimes } from 'react-icons/fa';

// Custom TikTok icon (react-icons mein nahi hai)
const TikTokIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
);

const StickyContact = () => {
    const [isOpen, setIsOpen] = useState(false);

    const items = [
        { 
            id: 1, 
            name: 'WhatsApp', 
            icon: <FaWhatsapp />, 
            label: 'Chat on WhatsApp',
            link: 'https://wa.me/923094085644',
            external: true 
        },
        { 
            id: 2, 
            name: 'Instagram', 
            icon: <FaInstagram />, 
            label: 'Follow on Instagram',
            link: 'https://www.instagram.com/organicheritage09?igsh=c3pnZmkwZmxhOGg4',
            external: true 
        },
        { 
            id: 3, 
            name: 'Facebook', 
            icon: <FaFacebook />, 
            label: 'Follow on Facebook',
            link: 'https://www.facebook.com/share/1F7PAiT1d3/',
            external: true 
        },
        { 
            id: 4, 
            name: 'TikTok', 
            icon: <TikTokIcon />, 
            label: 'Follow on TikTok',
            link: 'https://www.tiktok.com/@organicheritage?is_from_webapp=1&sender_device=pc',
            external: true 
        },
        { 
            id: 5, 
            name: 'YouTube', 
            icon: <FaYoutube />, 
            label: 'Subscribe on YouTube',
            link: 'https://www.youtube.com/channel/UCT3dfUeJv3xzk96N-xGtz8A',
            external: true 
        }
    ];

    const handleItemClick = (item) => {
        if (item.external) {
            window.open(item.link, '_blank', 'noopener,noreferrer');
        }
        setIsOpen(false);
    };

    return (
        <>
            {/* Background Overlay */}
            {isOpen && (
                <div 
                    className="orb-overlay" 
                    onClick={() => setIsOpen(false)} 
                />
            )}

            <div className={`contact-orb ${isOpen ? 'orb-open' : ''}`}>

                {/* Social Icons — Staggered Slide-Up */}
                <div className="orb-socials">
                    {items.map((item, index) => (
                        <div 
                            key={item.id} 
                            className="orb-social-item"
                            style={{ '--delay': `${(items.length - index) * 100}ms` }}
                        >
                            {/* Tooltip */}
                            <span className="orb-tooltip">{item.label}</span>

                            {/* Icon Button */}
                            <button 
                                className="orb-social-btn"
                                onClick={() => handleItemClick(item)}
                                aria-label={item.name}
                            >
                                {item.icon}
                            </button>
                        </div>
                    ))}
                </div>

                {/* Main Trigger Button — The Breathing Orb */}
                <button 
                    className="orb-main-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? 'Close menu' : 'Open contact menu'}
                >
                    <span className={`orb-icon ${isOpen ? 'orb-icon-close' : ''}`}>
                        {isOpen ? <FaTimes /> : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        )}
                    </span>
                </button>
            </div>
        </>
    );
};

export default StickyContact;