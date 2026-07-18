import React, { useState } from 'react';
import { 
    FaPhone, FaEnvelope, FaMapMarkerAlt, FaInstagram, FaFacebook, 
    FaTwitter, FaPinterest, FaWhatsapp, FaClock, FaCheckCircle,
    FaLeaf
} from 'react-icons/fa';
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
                subject: formData.subject,
                message: formData.message
            });

            if (response.data.success) {
                setFormData({ name: '', email: '', subject: '', message: '' });
                
                Swal.fire({
                    title: 'Thank You! 🌿',
                    text: 'Your message has been sent successfully. We\'ll get back to you within 24 hours.',
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
            console.error('Contact form error:', error);
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

    return (
        <div className="contact-page">
            {/* ============ HERO SECTION ============ */}
            <section className="contact-hero">
                <div className="contact-hero-container">
                    {/* Top Bar */}
                    <div className="contact-topbar">
                        <a href="mailto:organicheritage07@gmail.com" className="contact-topbar-email">
                            organicheritage07@gmail.com
                        </a>
                        <div className="contact-topbar-center">
                            <span className="contact-topbar-logo">
                                <FaLeaf className="logo-icon" /> Organic Heritage
                            </span>
                        </div>
                        <div className="contact-topbar-links">
                            <a href="/">Home</a>
                            <a href="/products">Products</a>
                            <a href="#contact">Contact</a>
                        </div>
                    </div>

                    {/* Hero Content */}
                    <div className="contact-hero-content">
                        {/* LEFT */}
                        <div className="contact-hero-left">
                            <h1 className="contact-hero-title">Contact Us</h1>
                            <p className="contact-hero-subtitle">
                                Have a question or want to learn more<br />
                                about our products? We'd love to hear from you.
                            </p>
                            <div className="contact-hero-social">
                                <a href="#" className="hero-social-icon" title="Instagram"><FaInstagram /></a>
                                <a href="#" className="hero-social-icon" title="Facebook"><FaFacebook /></a>
                                <a href="#" className="hero-social-icon" title="Twitter"><FaTwitter /></a>
                                <a href="#" className="hero-social-icon" title="Pinterest"><FaPinterest /></a>
                                <a href="#" className="hero-social-icon" title="WhatsApp"><FaWhatsapp /></a>
                            </div>
                        </div>

                        {/* RIGHT - Form Card */}
                        <div className="contact-hero-right">
                            <div className="contact-form-card">
                                <div className="proposal-box">
                                    <div className="proposal-icon">
                                        <FaLeaf />
                                    </div>
                                    <p className="proposal-text">
                                        Write us a few words about your inquiry and we'll get back to you within <strong>24 hours</strong>.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="contact-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="Your Name *"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                placeholder="Your Email *"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            placeholder="Subject"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Your Message *"
                                            rows="4"
                                            required
                                        />
                                    </div>

                                    <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-small"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            'Send Message'
                                        )}
                                    </button>

                                    <p className="form-footer-note">
                                        We'll respond within 24 hours
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============ PROCESS + CONTACT INFO ============ */}
            <section className="contact-process-section">
                <div className="contact-process-container">
                    {/* LEFT - Process Steps */}
                    <div className="contact-process-left">
                        <h2 className="process-title">What will<br />be next step?</h2>
                        <p className="process-subtitle">
                            You are one step closer<br />to your wellness journey
                        </p>

                        <div className="process-steps">
                            <div className="process-step">
                                <div className="step-timeline">
                                    <div className="step-dot"></div>
                                    <div className="step-line"></div>
                                </div>
                                <div className="step-content">
                                    <h4>01. We'll review your inquiry</h4>
                                    <p>We carefully review your message and understand your needs</p>
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-timeline">
                                    <div className="step-dot"></div>
                                    <div className="step-line"></div>
                                </div>
                                <div className="step-content">
                                    <h4>02. Together we discuss it</h4>
                                    <p>We'll get in touch to discuss your requirements in detail</p>
                                </div>
                            </div>
                            <div className="process-step">
                                <div className="step-timeline">
                                    <div className="step-dot"></div>
                                </div>
                                <div className="step-content">
                                    <h4>03. Let's start your journey</h4>
                                    <p>We'll guide you through our products and help you choose the best</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT - Contact Info List */}
                    <div className="contact-process-right">
                        <div className="contact-info-list">
                            <div className="info-item">
                                <div className="info-item-icon"><FaPhone /></div>
                                <div className="info-item-content">
                                    <h4>Phone</h4>
                                    <p>+92 300 1234567</p>
                                    <span>Mon-Fri, 9am - 6pm</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-item-icon"><FaEnvelope /></div>
                                <div className="info-item-content">
                                    <h4>Email</h4>
                                    <p>organicheritage07@gmail.com</p>
                                    <span>We respond within 24 hours</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-item-icon"><FaMapMarkerAlt /></div>
                                <div className="info-item-content">
                                    <h4>Location</h4>
                                    <p>Lahore, Pakistan</p>
                                    <span>Visit us by appointment</span>
                                </div>
                            </div>
                            <div className="info-item">
                                <div className="info-item-icon"><FaClock /></div>
                                <div className="info-item-content">
                                    <h4>Working Hours</h4>
                                    <p>Mon - Fri: 9:00 AM - 6:00 PM</p>
                                    <span>Saturday: 10:00 AM - 2:00 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <style>{`
                .spinner-small {
                    width: 18px;
                    height: 18px;
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
        </div>
    );
}

export default ContactPage;