// IngredientsSpotlight.jsx — Accordion Flex-Grow with Dynamic Data
import React, { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import axios from 'axios';
import './IngredientsSpotlight.css';

const IngredientsSpotlight = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { 
        once: true, 
        amount: 0.15,
        margin: "-50px"
    });

    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activePanel, setActivePanel] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile viewport
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ✅ Fetch ingredients from API
    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5000/api/ingredients');
                if (response.data.success && response.data.ingredients.length > 0) {
                    setIngredients(response.data.ingredients);
                } else {
                    // Fallback data if no ingredients in DB
                    setIngredients([]);
                }
            } catch (error) {
                console.error('Error fetching ingredients:', error);
                setIngredients([]);
            } finally {
                setLoading(false);
            }
        };

        fetchIngredients();
    }, []);

    const handlePanelClick = (index) => {
        if (isMobile) {
            setActivePanel(index === activePanel ? -1 : index);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    };

    if (loading) {
        return (
            <section className="ingredients-spotlight-accordion" ref={sectionRef}>
                <div className="accordion-container">
                    <div className="accordion-loading">
                        <div className="accordion-spinner"></div>
                        <p>Loading ingredients...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (ingredients.length === 0) {
        return (
            <section className="ingredients-spotlight-accordion" ref={sectionRef}>
                <div className="accordion-container">
                    <div className="accordion-empty">
                        <h3>No ingredients available</h3>
                        <p>Please add ingredients from the admin panel.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="ingredients-spotlight-accordion" ref={sectionRef}>
            <div className="accordion-container">
                {/* Section Header */}
                <motion.div 
                    className="accordion-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                    <span className="accordion-tag">Pure Ingredients</span>
                    <h2 className="accordion-title">
                        Sourced Directly <span className="accordion-title-highlight">From Nature</span>
                    </h2>
                    <p className="accordion-subtitle">
                        Every ingredient is carefully selected from organic farms, ensuring 
                        the highest quality and purity in every jar.
                    </p>
                </motion.div>

                {/* Accordion Panels */}
                <motion.div 
                    className={`accordion-panels ${isMobile ? 'mobile-vertical' : ''}`}
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {ingredients.map((item, index) => {
                        const isActive = isMobile && activePanel === index;

                        return (
                            <motion.div
                                key={item._id || item.id}
                                className={`accordion-panel ${isActive ? 'panel-active' : ''}`}
                                variants={itemVariants}
                                style={{ '--panel-color': item.color || '#2D6A4F' }}
                                onClick={() => handlePanelClick(index)}
                            >
                                {/* Background Image */}
                                <div className="panel-bg">
                                    <img 
                                        src={item.image} 
                                        alt={item.name}
                                        className="panel-bg-img"
                                        loading="lazy"
                                    />
                                </div>

                                {/* Dark Vignette Overlay */}
                                <div className="panel-overlay"></div>

                                {/* Content */}
                                <div className="panel-content">
                                    <span className="panel-tag">{item.tag}</span>
                                    <h3 className="panel-name">{item.name}</h3>

                                    {/* Hidden text — reveals on hover (desktop) or tap (mobile) */}
                                    <div className={`panel-reveal ${isActive ? 'reveal-active' : ''}`}>
                                        <p className="panel-detail">{item.detail}</p>
                                        <span className="panel-relation">
                                            {item.productRelation} →
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Bottom Decorative Line */}
                <div className="accordion-bottom-line"></div>
            </div>

            <style>{`
                .accordion-loading {
                    text-align: center;
                    padding: 60px 20px;
                }
                .accordion-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid #E5E7EB;
                    border-top-color: #2D6A4F;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                    margin: 0 auto 16px;
                }
                .accordion-loading p {
                    color: #6B7280;
                }
                .accordion-empty {
                    text-align: center;
                    padding: 60px 20px;
                }
                .accordion-empty h3 {
                    color: #1B2E1A;
                    margin-bottom: 8px;
                }
                .accordion-empty p {
                    color: #6B7280;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
};

export default IngredientsSpotlight;