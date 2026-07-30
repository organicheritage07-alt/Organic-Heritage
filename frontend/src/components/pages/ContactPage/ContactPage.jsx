import React, { useState, useEffect } from 'react';
import { 
    FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, 
    FaYoutube, FaWhatsapp, FaClock, FaLeaf, FaArrowRight
} from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ContactPage.css';

function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name || !formData.email || !formData.message) {
            Swal.fire({
                title: 'Error',
                text: 'Please fill in all required fields',
                icon: 'warning',
                confirmButtonColor: '#2d5a27',
                confirmButtonText: 'OK'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post('https://organic-heritage.onrender.com/api/contact', {
                name: formData.name,
                email: formData.email,
                subject: formData.subject,
                message: formData.message
            });

            if (response.data.success) {
                setFormData({ name: '', email: '', subject: '', message: '' });
                
                Swal.fire({
                    title: 'Thank You! 🌿',
                    text: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
                    icon: 'success',
                    confirmButtonColor: '#2d5a27',
                    confirmButtonText: 'Great!',
                    timer: 5000,
                    timerProgressBar: true
                });
            } else {
                Swal.fire({
                    title: 'Error',
                    text: response.data.message || 'Failed to send message. Please try again.',
                    icon: 'error',
                    confirmButtonColor: '#2d5a27'
                });
            }
        } catch (error) {
            console.error('Contact form error:', error);
            Swal.fire({
                title: 'Error',
                text: error.response?.data?.message || 'Failed to send message. Please try again.',
                icon: 'error',
                confirmButtonColor: '#2d5a27'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page">
            {/* ===== BANNER — EXACTLY LIKE STORY PAGE ===== */}
            <section className="contact-banner" data-section="banner">
                <div className="contact-banner-bg">
                    <img 
                        src="./preloder2.png" 
                        alt="Contact Organic Heritage" 
                    />
                    <div className="contact-banner-overlay" />
                </div>
                <div className="contact-banner-content">
                    <span className="contact-banner-tag"><FaLeaf /> Get in Touch</span>
                    <h1>Contact Us</h1>
                    <p>Have a question or want to learn more about our products?<br />We'd love to hear from you.</p>
                    
                    <div className="contact-banner-social">
                        <a href="https://www.instagram.com/organicheritage09?igsh=c3pnZmkwZmxhOGg4" target="_blank" rel="noopener noreferrer" className="banner-social-icon instagram" title="Instagram"><FaInstagram /></a>
                        <a href="https://www.facebook.com/share/1F7PAiT1d3/" target="_blank" rel="noopener noreferrer" className="banner-social-icon facebook" title="Facebook"><FaFacebook /></a>
                        <a href="https://www.tiktok.com/@organicheritage?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="banner-social-icon tiktok" title="TikTok"><FaTiktok /></a>
                        <a href="https://www.youtube.com/channel/UCT3dfUeJv3xzk96N-xGtz8A" target="_blank" rel="noopener noreferrer" className="banner-social-icon youtube" title="YouTube"><FaYoutube /></a>
                        <a href="https://wa.me/923094085644" target="_blank" rel="noopener noreferrer" className="banner-social-icon whatsapp" title="WhatsApp"><FaWhatsapp /></a>
                    </div>
                </div>
            </section>

            {/* ===== CONTACT SECTION — FORM + INFO SIDE BY SIDE ===== */}
            <section className="contact-main-section">
                <div className="contact-main-container">
                    
                    {/* LEFT — Contact Info */}
                    <div className="contact-info-col">
                        <span className="section-label"><FaLeaf /> Contact Info</span>
                        <h2>Let's Start a Conversation</h2>
                        <p className="contact-info-desc">
                            We're here to help you on your wellness journey. Reach out to us through any of the channels below.
                        </p>

                        <div className="contact-info-items">
                            <div className="contact-info-item">
                                <div className="info-icon-box"><FaPhone /></div>
                                <div className="info-text">
                                    <h4>Phone / WhatsApp</h4>
                                    <p>+92 309 4085644</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="info-icon-box"><FaEnvelope /></div>
                                <div className="info-text">
                                    <h4>Email</h4>
                                    <p>organicheritage09@gmail.com</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="info-icon-box"><FaMapMarkerAlt /></div>
                                <div className="info-text">
                                    <h4>Location</h4>
                                    <p>Multan, Pakistan</p>
                                </div>
                            </div>
                            <div className="contact-info-item">
                                <div className="info-icon-box"><FaClock /></div>
                                <div className="info-text">
                                    <h4>Working Hours</h4>
                                    <p>24/7 Online Business</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — Form */}
                    <div className="contact-form-col">
                        <div className="contact-form-box">
                            <div className="form-header">
                                <div className="form-header-icon"><FaLeaf /></div>
                                <div>
                                    <h3>Send a Message</h3>
                                    <p>We'll get back to you within 24 hours</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="contact-form-clean">
                                <div className="form-row-clean">
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Your Name *"
                                        required
                                    />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Your Email *"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    placeholder="Subject"
                                    className="form-full-input"
                                />
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Your Message *"
                                    rows="5"
                                    required
                                />
                                <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? 'Sending...' : <>Send Message <FaArrowRight /></>}
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </section>

            {/* ===== PROCESS STEPS ===== */}
            <section className="contact-process-section">
                <div className="contact-process-container">
                    <div className="process-header">
                        <span className="section-label"><FaLeaf /> Our Process</span>
                        <h2>What Will Be the Next Step?</h2>
                    </div>

                    <div className="process-cards">
                        <div className="process-card">
                            <div className="process-num">01</div>
                            <h4>We'll Review Your Inquiry</h4>
                            <p>We carefully review your message and understand your wellness needs within minutes.</p>
                        </div>
                        <div className="process-card">
                            <div className="process-num">02</div>
                            <h4>Together We Discuss It</h4>
                            <p>We'll get in touch via your preferred channel to discuss requirements in detail.</p>
                        </div>
                        <div className="process-card">
                            <div className="process-num">03</div>
                            <h4>Let's Start Your Journey</h4>
                            <p>We'll guide you through our products and help you choose the best for your health.</p>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ContactPage;