// FAQ.jsx - Luxury Minimal Accordion with Left Form
import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FaPlus, FaMinus, FaInstagram, FaFacebook, FaTwitter } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import './FAQ.css';

const FAQ = () => {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { 
        once: true, 
        amount: 0.15,
        margin: "-50px"
    });

    const [activeIndex, setActiveIndex] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        question: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const faqs = [
        {
            id: 1,
            question: "Are your products 100% organic and free from chemicals?",
            answer: "Yes, absolutely. Our entire range—including our Moringa, Ashwagandha, and Shatavari powders—is sourced directly from certified organic farms. We do not use any preservatives, chemical additives, heavy metals, or artificial binders. Every batch is micro-tested for pure safety."
        },
        {
            id: 2,
            question: "What is the difference between your Powders and Capsules? Which one should I choose?",
            answer: "Our powders (like Beetroot & Amba Haldi) are pure, raw herbs ideal for mixing into warm water, milk, or smoothies. Our capsules contain the exact same organic, high-potency raw powder encapsulated in 100% vegetarian, plant-based shells—perfect for busy days and easy daily routines."
        },
        {
            id: 3,
            question: "How should I consume these daily? Do I need to consult a doctor?",
            answer: "For powders, we recommend taking 1 level teaspoon (approx. 2-3g) once daily in warm water or smoothies. For capsules, 1-2 capsules daily with water is the ideal ritual. While our products are 100% natural and safe herbal foods, we always recommend consulting your healthcare provider if you are pregnant, nursing, or on specific medical treatments."
        },
        {
            id: 4,
            question: "How long does it take to see visible results?",
            answer: "Since our products are raw, organic herbs and not synthetic chemicals, they work gently with your body's natural cycle. Most customers begin to feel active changes in energy levels, digestion, and vitality within 2 to 3 weeks of consistent daily consumption."
        },
        {
            id: 5,
            question: "What is the shelf life of these organic jars, and how should I store them?",
            answer: "Each jar has a shelf life of 12 months from the packaging date. Because our products are 100% natural with no preservatives, please store them in a cool, dry place away from direct sunlight, and always use a dry spoon for our powders to avoid moisture."
        },
        // ✅ NEW QUESTION 6
        {
            id: 6,
            question: "Are your products suitable for vegans and vegetarians?",
            answer: "Yes, absolutely! All our products are 100% plant-based and vegan-friendly. Our capsules are made from vegetarian, plant-based shells, and our powders contain only pure organic herbs with no animal-derived ingredients. We are committed to providing clean, ethical, and sustainable products for everyone."
        },
        // ✅ NEW QUESTION 7
        {
            id: 7,
            question: "Do you offer international shipping or only within Pakistan?",
            answer: "Currently, we ship across all major cities in Pakistan. We are working on expanding our delivery network to serve international customers in the near future. For now, you can place your order online and we'll deliver it to your doorstep anywhere in Pakistan with our reliable shipping partners."
        }
    ];

    const toggleAccordion = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.question) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all required fields',
                icon: 'warning',
                confirmButtonColor: '#2D6A4F',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('http://localhost:5000/api/contact', {
                name: formData.name,
                email: formData.email,
                subject: 'FAQ Question',
                message: formData.question
            });

            if (response.data.success) {
                setFormData({ name: '', email: '', question: '' });
                
                Swal.fire({
                    title: 'Thank You! 🌿',
                    text: 'Your question has been sent successfully. We\'ll get back to you within 24 hours.',
                    icon: 'success',
                    confirmButtonColor: '#2D6A4F',
                    confirmButtonText: 'Great!',
                    timer: 5000,
                    timerProgressBar: true
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.data.message || 'Failed to send message. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#2D6A4F'
                });
            }
        } catch (error) {
            console.error('FAQ form error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to send message. Please try again.',
                icon: 'error',
                confirmButtonColor: '#2D6A4F'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { 
            opacity: 0, 
            y: 15,
            scale: 0.98
        },
        visible: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
            }
        }
    };

    return (
        <section className="faq-section" ref={sectionRef}>
            <div className="faq-container">
                {/* LEFT COLUMN - Title + Form + Social Icons */}
                <motion.div 
                    className="faq-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="faq-left-content">
                        <span className="faq-tag">FAQ</span>
                        <h2 className="faq-title">
                            Have Questions? <br />
                            <span className="faq-title-highlight">We Have Answers.</span>
                        </h2>
                        <p className="faq-subtitle">
                            Everything you need to know about our organic products
                        </p>

                        {/* FORM - Directly under title */}
                        <div className="faq-form-section">
                            <div className="faq-form-header">
                                <h4>Still have questions?</h4>
                                <p>Send us a message and we'll get back to you</p>
                            </div>
                            <form onSubmit={handleSubmit} className="faq-form">
                                <div className="faq-form-group">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your Name *"
                                        required
                                    />
                                </div>
                                <div className="faq-form-group">
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your Email *"
                                        required
                                    />
                                </div>
                                <div className="faq-form-group">
                                    <textarea
                                        name="question"
                                        value={formData.question}
                                        onChange={handleChange}
                                        placeholder="Your Question *"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <button type="submit" className="faq-form-btn" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="faq-form-spinner"></span>
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Question'
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* SOCIAL ICONS ONLY - At bottom of left column */}
                        <div className="faq-social-section">
                            <span className="faq-social-label">Follow Us</span>
                            <div className="faq-social-icons">
                                <a href="#" className="faq-social-icon"><FaInstagram /></a>
                                <a href="#" className="faq-social-icon"><FaFacebook /></a>
                                <a href="#" className="faq-social-icon"><FaTwitter /></a>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* RIGHT COLUMN - Accordions Only */}
                <motion.div 
                    className="faq-right"
                    variants={containerVariants}
                    initial="hidden"
                    animate={isInView ? "visible" : "hidden"}
                >
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                            variants={itemVariants}
                        >
                            <button 
                                className="faq-question"
                                onClick={() => toggleAccordion(index)}
                            >
                                <span className="faq-question-text">{faq.question}</span>
                                <span className="faq-icon">
                                    {activeIndex === index ? <FaMinus /> : <FaPlus />}
                                </span>
                            </button>
                            <AnimatePresence>
                                {activeIndex === index && (
                                    <motion.div
                                        className="faq-answer-wrapper"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ 
                                            duration: 0.4, 
                                            ease: [0.16, 1, 0.3, 1] 
                                        }}
                                    >
                                        <div className="faq-answer">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </div>

            <style>{`
                .faq-form-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.3);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.7s linear infinite;
                    display: inline-block;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
};

export default FAQ;