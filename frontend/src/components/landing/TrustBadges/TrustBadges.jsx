// TrustBadges.jsx - Premium Infinite Scroll Trust Badges
import React from 'react';
import './TrustBadges.css';
import { 
    FaLeaf, FaShieldAlt, FaFlask, FaClock, 
    FaSeedling, FaAward
} from 'react-icons/fa';

const TrustBadges = () => {
    const badges = [
        {
            id: 1,
            icon: <FaLeaf />,
            title: '100% Certified Organic',
            description: 'Pure & natural ingredients'
        },
        {
            id: 2,
            icon: <FaShieldAlt />,
            title: 'Pesticide & Chemical Free',
            description: 'Safe for your family'
        },
        {
            id: 3,
            icon: <FaFlask />,
            title: 'Lab Tested & Pure',
            description: 'Quality guaranteed'
        },
        {
            id: 4,
            icon: <FaClock />,
            title: 'No Added Preservatives',
            description: 'Fresh & natural'
        },
        {
            id: 5,
            icon: <FaSeedling />,
            title: 'Sustainably Sourced',
            description: 'Eco-friendly practices'
        },
        {
            id: 6,
            icon: <FaAward />,
            title: 'Premium Quality',
            description: 'Trusted by thousands'
        }
    ];

    // Duplicate for infinite scroll
    const allBadges = [...badges, ...badges, ...badges];

    return (
        <section className="trust-badges-section">
            <div className="trust-badges-container">
                <div className="trust-badges-track">
                    {allBadges.map((badge, index) => (
                        <div key={`${badge.id}-${index}`} className="trust-badge-item">
                            <div className="trust-badge-icon">
                                {badge.icon}
                            </div>
                            <div className="trust-badge-content">
                                <span className="trust-badge-title">{badge.title}</span>
                                <span className="trust-badge-desc">{badge.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TrustBadges;