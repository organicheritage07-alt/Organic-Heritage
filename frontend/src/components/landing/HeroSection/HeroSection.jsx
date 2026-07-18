import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './HeroSection.css';

const slides = [
    {
        id: 1,
        kicker: 'INTRO',
        title: 'Organic Ashwagandha Stress Relief Capsules',

        description: 'Ancient adaptogenic herb for modern wellness. Supports stress relief, energy and vitality with 100% organic ingredients.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 1,000',
        originalPrice: 'Rs 2,000',
        nutrition: [
            { label: 'Fat', value: '0.2g' },
            { label: 'Sodium', value: '5mg' },
            { label: 'Carbs', value: '2.0g' },
            { label: 'Fiber', value: '1.5g' },
            { label: 'Sugar', value: '0.0g' },
            { label: 'Protein', value: '0.5g' },
            { label: 'Calcium', value: '20mg' },
            { label: 'Iron', value: '1.5mg' },
            { label: 'Potassium', value: '52mg' }
        ],
        productImage: '/Ashwagandha (2).png',
        bgText: 'ASHWAGANDHA'
    },
    {
        id: 2,
        kicker: 'FEATURED',
        title: 'Premium Shatavari Women Health Capsules',

        description: 'Premium women wellness formula. Balances hormones, boosts immunity and rejuvenates body and mind naturally.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 1,250',
        originalPrice: 'Rs 2,450',
        nutrition: [
            { label: 'Fat', value: '0.1g' },
            { label: 'Sodium', value: '10mg' },
            { label: 'Carbs', value: '3.5g' },
            { label: 'Fiber', value: '2.0g' },
            { label: 'Sugar', value: '1.0g' },
            { label: 'Protein', value: '1.2g' },
            { label: 'Calcium', value: '45mg' },
            { label: 'Iron', value: '2.8mg' },
            { label: 'Potassium', value: '85mg' }
        ],
        productImage: '/Shatavari.png',
        bgText: 'SHATAVARI'
    },
    {
        id: 3,
        kicker: 'BESTSELLER',
        title: 'Organic Moringa Superfood Greens Capsules',

        description: 'Nutrient-dense superfood with 92 vitamins and minerals. Supports immunity, heart health and natural energy boost.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 650',
        originalPrice: 'Rs 1,250',
        nutrition: [
            { label: 'Fat', value: '0.3g' },
            { label: 'Sodium', value: '15mg' },
            { label: 'Carbs', value: '4.0g' },
            { label: 'Fiber', value: '2.5g' },
            { label: 'Sugar', value: '0.5g' },
            { label: 'Protein', value: '2.0g' },
            { label: 'Calcium', value: '60mg' },
            { label: 'Iron', value: '3.2mg' },
            { label: 'Potassium', value: '120mg' }
        ],
        productImage: './moringa.png',
        bgText: 'MORINGA'
    },
    {
        id: 4,
        kicker: 'NEW ARRIVAL',
        title: 'Organic Beetroot Blood Booster Capsules',

        description: 'Organic beetroot extract for natural blood purification. Boosts stamina, immunity and overall cardiovascular health.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 1,000',
        originalPrice: 'Rs 2,000',
        nutrition: [
            { label: 'Fat', value: '0.1g' },
            { label: 'Sodium', value: '20mg' },
            { label: 'Carbs', value: '5.0g' },
            { label: 'Fiber', value: '1.0g' },
            { label: 'Sugar', value: '3.0g' },
            { label: 'Protein', value: '0.8g' },
            { label: 'Calcium', value: '15mg' },
            { label: 'Iron', value: '0.8mg' },
            { label: 'Potassium', value: '320mg' }
        ],
        productImage: '/beetroot1.png',
        bgText: 'BEETROOT'
    },
    {
        id: 5,
        kicker: 'POPULAR',
        title: 'Organic Haldi Turmeric Power Capsules',

        description: 'Pure turmeric with black pepper for maximum absorption. Anti-inflammatory powerhouse for joint and skin health.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 430',
        originalPrice: 'Rs 930',
        nutrition: [
            { label: 'Fat', value: '0.2g' },
            { label: 'Sodium', value: '3mg' },
            { label: 'Carbs', value: '1.5g' },
            { label: 'Fiber', value: '0.8g' },
            { label: 'Sugar', value: '0.1g' },
            { label: 'Protein', value: '0.3g' },
            { label: 'Calcium', value: '10mg' },
            { label: 'Iron', value: '2.5mg' },
            { label: 'Potassium', value: '170mg' }
        ],
        productImage: '/Pumkin.png',
        bgText: 'PUMPKIN SEEDS'
    },
    {
        id: 6,
        kicker: 'POPULAR',
        title: 'Organic Haldi Turmeric Power Capsules',

        description: 'Pure turmeric with black pepper for maximum absorption. Anti-inflammatory powerhouse for joint and skin health.',
        cta: 'Order Now',
        explore: 'Explore',
        price: 'Rs 430',
        originalPrice: 'Rs 930',
        nutrition: [
            { label: 'Fat', value: '0.2g' },
            { label: 'Sodium', value: '3mg' },
            { label: 'Carbs', value: '1.5g' },
            { label: 'Fiber', value: '0.8g' },
            { label: 'Sugar', value: '0.1g' },
            { label: 'Protein', value: '0.3g' },
            { label: 'Calcium', value: '10mg' },
            { label: 'Iron', value: '2.5mg' },
            { label: 'Potassium', value: '170mg' }
        ],
        productImage: '/Haldi.png',
        bgText: 'HALDI'
    }
];

// ===== ANIMATION VARIANTS =====
const leftTextVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.3 }
    }
};

const textItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: { opacity: 0, y: -15, transition: { duration: 0.25 } }
};

const nutritionVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.3 }
    },
    exit: { opacity: 0, transition: { duration: 0.3 } }
};

const nutritionItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};

const productVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
        scale: 0.85,
        filter: 'blur(10px)'
    }),
    center: {
        x: 0,
        opacity: 1,
        scale: 1,
        filter: 'blur(0px)',
        transition: {
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1]
        }
    },
    exit: (direction) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
        scale: 0.85,
        filter: 'blur(10px)',
        transition: {
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1]
        }
    })
};

const bgTextVariants = {
    initial: { opacity: 0, x: -50 },
    animate: {
        opacity: 0.06,
        x: 0,
        transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }
    },
    exit: {
        opacity: 0,
        x: 50,
        transition: { duration: 0.4 }
    }
};

function HeroSection({ visible = true }) {
    const [[activeIndex, direction], setActiveIndex] = useState([0, 0]);
    const current = slides[activeIndex];
    const [isAnimating, setIsAnimating] = useState(false);

    const paginate = useCallback((newDirection) => {
        if (isAnimating) return;
        setIsAnimating(true);
        const nextIndex = (activeIndex + newDirection + slides.length) % slides.length;
        setActiveIndex([nextIndex, newDirection]);
        setTimeout(() => setIsAnimating(false), 800);
    }, [activeIndex, isAnimating]);

    const goToSlide = useCallback((index) => {
        if (isAnimating || index === activeIndex) return;
        setIsAnimating(true);
        const dir = index > activeIndex ? 1 : -1;
        setActiveIndex([index, dir]);
        setTimeout(() => setIsAnimating(false), 800);
    }, [activeIndex, isAnimating]);

    // Auto-slide
    useEffect(() => {
        const timer = setInterval(() => paginate(1), 6000);
        return () => clearInterval(timer);
    }, [paginate]);

    // Keyboard navigation
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'ArrowLeft') paginate(-1);
            if (e.key === 'ArrowRight') paginate(1);
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [paginate]);

    if (!visible) return null;

    return (
        <section className="hero-premium-split">
            {/* Main Grid Container */}
            <div className="hero-grid-split">
                {/* LEFT PANEL - White Content Area */}
                <div className="left-panel-split">
                    <div className="content-wrapper-split">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeIndex + '-left'}
                                variants={leftTextVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                            >
                                {/* Kicker */}
                                <motion.div variants={textItemVariants} className="kicker-text">
                                    <span className="kicker-line" />
                                    <span>{current.kicker}</span>
                                </motion.div>

                                {/* Title */}
                                <motion.h1 variants={textItemVariants} className="hero-title-split">
                                    {current.title.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            {i < current.title.split('\n').length - 1 && <br />}
                                        </React.Fragment>
                                    ))}
                                </motion.h1>

                                {/* Description */}
                                <motion.p variants={textItemVariants} className="hero-desc-split">
                                    {current.description}
                                </motion.p>

                                {/* Price Tag */}
                                <motion.div variants={textItemVariants} className="price-tag-split">
                                    <span className="current-price-split">{current.price}</span>
                                    <span className="original-price-split">{current.originalPrice}</span>
                                </motion.div>

                                {/* CTA Buttons Row - DESKTOP ONLY */}
                                <motion.div variants={textItemVariants} className="cta-row-split desktop-cta">
                                    <button className="cta-btn-split cta-primary-split">
                                        <span>{current.cta}</span>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M5 12h14M12 5l7 7-7 7"/>
                                        </svg>
                                    </button>
                                    <button className="cta-btn-split cta-secondary-split">
                                        <span>{current.explore}</span>
                                    </button>
                                </motion.div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* RIGHT PANEL - Green Nutrition Sidebar */}
                <div className="right-panel-split">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeIndex + '-right'}
                            className="nutrition-list-split"
                            variants={nutritionVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {current.nutrition.map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={nutritionItemVariants}
                                    className="nutrition-item-split"
                                >
                                    <span className="nutrition-label-split">{item.label}</span>
                                    <span className="nutrition-value-split">{item.value}</span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* FLOATING PRODUCT LAYER */}
            <div className="floating-product-split">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={activeIndex}
                        custom={direction}
                        variants={productVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="product-3d-split"
                    >
                        <img
                            src={current.productImage}
                            alt={current.title}
                            className="product-img-split"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* MOBILE CTA - Appears AFTER product image on mobile */}
            <div className="mobile-cta-row">
                <button className="cta-btn-split cta-primary-split">
                    <span>{current.cta}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </button>
                <button className="cta-btn-split cta-secondary-split">
                    <span>{current.explore}</span>
                </button>
            </div>

            {/* Navigation Buttons */}
            <button className="nav-btn-split nav-prev-split" onClick={() => paginate(-1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
            </button>
            <button className="nav-btn-split nav-next-split" onClick={() => paginate(1)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </button>

            {/* Slide Indicators */}
            <div className="slide-indicators-split">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`indicator-dot-split ${i === activeIndex ? 'active' : ''}`}
                        onClick={() => goToSlide(i)}
                    />
                ))}
                <span className="slide-counter-split">
                    0{activeIndex + 1} / 0{slides.length}
                </span>
            </div>

            {/* Background Text */}
            <div className="bg-text-bottom-split">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.bgText}
                        className="bg-text-horizontal-split"
                        variants={bgTextVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                    >
                        {current.bgText}
                    </motion.div>
                </AnimatePresence>
            </div>
        </section>
    );
}

export default HeroSection;