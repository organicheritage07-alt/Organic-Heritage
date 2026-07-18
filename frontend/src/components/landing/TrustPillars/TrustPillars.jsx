// TrustPillars.jsx - Premium Interactive Trust Section
import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './TrustPillars.css';

const TrustPillars = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { 
        once: true, 
        amount: 0.15,
        margin: "-50px"
    });

    const pillars = [
        {
            id: 1,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
            ),
            title: "Natural Ingredients",
            description: "Sourced directly from certified organic farms"
        },
        {
            id: 2,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4"/>
                    <path d="M12 18v4"/>
                    <path d="M4.93 4.93l2.83 2.83"/>
                    <path d="M16.24 16.24l2.83 2.83"/>
                    <path d="M2 12h4"/>
                    <path d="M18 12h4"/>
                    <path d="M4.93 19.07l2.83-2.83"/>
                    <path d="M16.24 7.76l2.83-2.83"/>
                </svg>
            ),
            title: "Pure Process",
            description: "No additives, no fillers, just pure goodness"
        },
        {
            id: 3,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                    <path d="M12 22v-10"/>
                </svg>
            ),
            title: "Micro Batch",
            description: "Small batches for uncompromised quality"
        },
        {
            id: 4,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                    <path d="M12 22v-10"/>
                    <path d="M12 7v3"/>
                    <path d="M8 9l-2 1"/>
                    <path d="M16 9l2 1"/>
                </svg>
            ),
            title: "Hand Crafted",
            description: "Made with care and traditional expertise"
        },
        {
            id: 5,
            icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                </svg>
            ),
            title: "No Chemicals",
            description: "100% pure, free from harmful chemicals"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 30,
            scale: 0.95
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <section className="trust-pillars-section" ref={sectionRef}>
            <div className="trust-pillars-container">
                {/* Header */}
                <motion.div 
                    className="trust-pillars-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <h2 className="trust-pillars-title">
                        Guided by Purpose, <span className="trust-pillars-highlight">Driven by Impact</span>
                    </h2>
                    <p className="trust-pillars-subtitle">
                        Our commitment to purity, quality, and sustainability
                    </p>
                </motion.div>

                {/* Pillars Grid */}
                <motion.div 
                    className="trust-pillars-grid"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={pillar.id}
                            className="trust-pillar-card"
                            variants={itemVariants}
                            whileHover={{
                                y: -6,
                                transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
                            }}
                        >
                            <div className="trust-pillar-icon-wrapper">
                                <div className="trust-pillar-icon">
                                    {pillar.icon}
                                </div>
                            </div>
                            <h3 className="trust-pillar-title">{pillar.title}</h3>
                            <p className="trust-pillar-description">{pillar.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default TrustPillars;