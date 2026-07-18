import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './BenefitsSection.css';

function BenefitsSection() {
    const [benefits, setBenefits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hoveredId, setHoveredId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBenefits();
    }, []);

    const fetchBenefits = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5000/api/benefits');
            if (response.data.success) {
                setBenefits(response.data.benefits);
            }
        } catch (error) {
            console.error('Error fetching benefits:', error);
            setError('Failed to load benefits');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="benefits-section">
                <div className="benefits-loading">
                    <div className="spinner"></div>
                    <p>Loading benefits...</p>
                </div>
            </section>
        );
    }

    if (error || benefits.length === 0) {
        return (
            <section className="benefits-section">
                <div className="benefits-error">
                    <p>{error || 'No benefits available'}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="benefits-section">
            <div className="benefits-header">
                <span className="benefits-tag">Why Choose Us</span>
                <h2 className="benefits-title">
                    Our Products <span className="title-highlight">Benefits</span>
                </h2>
                <p className="benefits-subtitle">
                    Discover the power of nature with our premium organic supplements
                </p>
            </div>

            <div className={`video-cards-row ${hoveredId ? 'has-hover' : ''}`}>
                {benefits.map((product) => (
                    <div 
                        key={product._id} 
                        className={`v-card ${hoveredId === product._id ? 'is-hovered' : ''} ${hoveredId && hoveredId !== product._id ? 'is-dimmed' : ''}`}
                        style={{ '--card-bg': product.accentColor || '#2D6A4F' }}
                        onMouseEnter={() => setHoveredId(product._id)}
                        onMouseLeave={() => setHoveredId(null)}
                    >
                        <div className="v-card-bg"></div>
                        <div className="v-card-glow" style={{ backgroundColor: product.accentColor || '#2D6A4F' }}></div>

                        <div className="v-circle">
                            <img 
                                src={product.image} 
                                alt={product.name}
                                className="v-circle-img"
                            />
                        </div>

                        <div className="v-product-label">
                            <span className="v-label-name">{product.name}</span>
                        </div>

                        <img 
                            src={product.image} 
                            alt={product.name}
                            className="v-product-animated"
                        />

                        <div className="v-content">
                            <div className="v-highlight">{product.shortHighlight}</div>
                            <h3>{product.name}</h3>
                            <p className="v-desc">{product.subtitle}</p>
                            <ul className="v-benefits-list">
                                {product.benefits && product.benefits.map((benefit, idx) => (
                                    <li key={idx}>
                                        <span className="v-check">✓</span>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                            <button className="v-btn">
                                {product.ctaText || `Discover ${product.name}`}
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M5 12h14M12 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default BenefitsSection;